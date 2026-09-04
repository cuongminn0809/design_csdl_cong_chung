import { useMemo, useState } from "react"
import { CheckCircle2, Eye, MessageSquareWarning, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { EmptyState, PageHeader, Pagination, Th, inputCls } from "../ingestion/shared"
import { NotiDetailModal } from "./dialogs"
import {
  NOTI_ROLES, fmtVNDateTime, isTchncc, markFeedbackResolved, setCurrentRole, useCurrentRole, useFeedbacks,
  type FeedbackStatus,
} from "./config"

type Filters = { keyword: string; status: "all" | FeedbackStatus; tuNgay: string; denNgay: string }
const EMPTY: Filters = { keyword: "", status: "all", tuNgay: "", denNgay: "" }

export function DataFeedbackPage() {
  const showToast = useToast()
  const role = useCurrentRole()
  const all = useFeedbacks()
  const [tab, setTab] = useState<"xu-ly" | "hau-kiem">("xu-ly")
  const [draft, setDraft] = useState(EMPTY)
  const [applied, setApplied] = useState(EMPTY)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [detailId, setDetailId] = useState<string | null>(null)

  const canView = isTchncc(role)

  const rows = useMemo(() => {
    let r = all.filter((f) => f.feedbackType === tab)
    const k = applied.keyword.trim().toLowerCase()
    if (k) r = r.filter((f) => f.title.toLowerCase().includes(k) || f.content.toLowerCase().includes(k))
    if (applied.status !== "all") r = r.filter((f) => f.status === applied.status)
    if (applied.tuNgay) r = r.filter((f) => f.receivedAt.slice(0, 10) >= applied.tuNgay)
    if (applied.denNgay) r = r.filter((f) => f.receivedAt.slice(0, 10) <= applied.denNgay)
    return [...r].sort((a, b) => b.receivedAt.localeCompare(a.receivedAt))
  }, [all, tab, applied])

  const doSearch = () => {
    if (draft.tuNgay && draft.denNgay && draft.denNgay < draft.tuNgay) return setError("Đến ngày phải lớn hơn hoặc bằng Từ ngày.")
    setError(""); setApplied(draft); setPage(1)
  }
  const doReset = () => { setDraft(EMPTY); setApplied(EMPTY); setError(""); setPage(1) }

  const total = rows.length
  const paged = rows.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="space-y-4">
      <PageHeader title="Thông báo phản hồi dữ liệu" desc="Theo dõi và đánh dấu xử lý thông báo phản hồi quá trình xử lý và hậu kiểm dữ liệu."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] text-foreground-muted">Vai trò:</span>
            <NativeSelect value={role} onChange={(e) => setCurrentRole(e.target.value as typeof role)} className="h-8 w-[220px] text-[12.5px]">
              {NOTI_ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </NativeSelect>
          </div>
        } />

      {!canView ? (
        <EmptyState icon={<MessageSquareWarning className="size-6" />} title="Không có quyền truy cập" desc="Chỉ Lãnh đạo TCHNCC được xem thông báo phản hồi xử lý/hậu kiểm dữ liệu." />
      ) : (
        <>
          <div className="flex gap-1 border-b border-border">
            {(["xu-ly", "hau-kiem"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setPage(1) }}
                className={cn(
                  "-mb-px border-b-4 px-3 py-2 text-[13.5px] outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  tab === t ? "border-neutral-900 font-semibold text-foreground-strong" : "border-transparent font-medium text-foreground-muted hover:text-foreground"
                )}
              >
                {t === "xu-ly" ? "Phản hồi xử lý dữ liệu" : "Phản hồi hậu kiểm dữ liệu"}
              </button>
            ))}
          </div>

          <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-1.5 lg:col-span-2"><label className="text-xs font-semibold text-foreground-strong">Từ khóa</label><input value={draft.keyword} onChange={(e) => setDraft((d) => ({ ...d, keyword: e.target.value.slice(0, 100) }))} placeholder="Nhập tiêu đề hoặc nội dung…" className={inputCls} onKeyDown={(e) => e.key === "Enter" && doSearch()} /></div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Trạng thái xử lý</label>
                <NativeSelect value={draft.status} onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as Filters["status"] }))}><option value="all">Tất cả</option><option value="Chờ xử lý">Chờ xử lý</option><option value="Đã xử lý">Đã xử lý</option></NativeSelect>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Từ ngày</label><input type="date" value={draft.tuNgay} onChange={(e) => { setDraft((d) => ({ ...d, tuNgay: e.target.value })); setError("") }} className={inputCls} /></div>
                <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Đến ngày</label><input type="date" value={draft.denNgay} onChange={(e) => { setDraft((d) => ({ ...d, denNgay: e.target.value })); setError("") }} className={inputCls} /></div>
              </div>
            </div>
            {error && <div className="mt-3 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]">{error}</div>}
            <div className="mt-4 flex gap-2.5"><Button onClick={doSearch}><Search className="size-4" />Tìm kiếm</Button><Button variant="outline" onClick={doReset}>Đặt lại</Button></div>
          </div>

          <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
            {paged.length ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed border-collapse text-sm">
                    <thead><tr className="border-b border-border bg-neutral-50">
                      <Th className="w-11 text-center">STT</Th>
                      <Th className="w-[30%]">Tiêu đề phản hồi</Th>
                      <Th className="w-[20%]">Hồ sơ liên quan</Th>
                      <Th className="w-[160px]">Thời gian nhận</Th>
                      <Th className="w-[110px]">TT xử lý</Th>
                      <Th className="w-[220px] text-right">Thao tác</Th>
                    </tr></thead>
                    <tbody>{paged.map((f, i) => (
                      <tr key={f.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{(page - 1) * pageSize + i + 1}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => setDetailId(f.id)} className={cn("flex w-full min-w-0 items-center gap-1.5 text-left hover:underline", !f.read ? "font-semibold text-foreground-strong" : "text-foreground")} title={f.title}>
                            {!f.read && <span className="size-1.5 shrink-0 rounded-full bg-red-600" />}
                            <span className="min-w-0 flex-1 truncate">{f.title}</span>
                          </button>
                        </td>
                        <td className="truncate px-4 py-3 text-foreground-muted" title={f.relatedLabel}>{f.relatedLabel}</td>
                        <td className="px-4 py-3 tabular-nums text-foreground-muted">{fmtVNDateTime(f.receivedAt)}</td>
                        <td className="px-4 py-3">{f.status === "Chờ xử lý" ? <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11.5px] font-medium text-amber-700">Chờ xử lý</span> : <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11.5px] font-medium text-emerald-700">Đã xử lý</span>}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1.5">
                            <Button variant="outline" size="sm" onClick={() => setDetailId(f.id)}><Eye className="size-3.5" /></Button>
                            {f.status === "Chờ xử lý" && <Button size="sm" onClick={() => { markFeedbackResolved(f.id); showToast("Đã đánh dấu xử lý thông báo phản hồi.") }}><CheckCircle2 className="size-3.5" />Đánh dấu đã xử lý</Button>}
                          </div>
                        </td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
                <Pagination page={page} pageSize={pageSize} total={total} unit="thông báo" onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
              </>
            ) : (
              <EmptyState icon={<MessageSquareWarning className="size-6" />} title="Chưa có thông báo phản hồi" desc="Không có thông báo phản hồi nào phù hợp với điều kiện lọc." />
            )}
          </div>
        </>
      )}

      {detailId && <NotiDetailModal id={detailId} feedback onClose={() => setDetailId(null)} />}
    </div>
  )
}
