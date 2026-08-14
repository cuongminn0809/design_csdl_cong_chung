import { useMemo, useState } from "react"
import { Download, FileSearch, RotateCcw, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { EmptyState, Pagination, PageHeader, Th, inputCls } from "../../ingestion/shared"
import { REVOKE_ACTION_META, REVOKE_HISTORY, daysAgoISO, parseVnDate, todayISO } from "./config"

interface Filter { from: string; to: string; soCCGoc: string; actor: string }
const makeEmpty = (): Filter => ({ from: daysAgoISO(7), to: todayISO(), soCCGoc: "", actor: "" })

export function RevokeHistoryPage() {
  const showToast = useToast()
  const [draft, setDraft] = useState<Filter>(makeEmpty)
  const [applied, setApplied] = useState<Filter>(makeEmpty)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [error, setError] = useState("")

  const filtered = useMemo(() => {
    return REVOKE_HISTORY
      .filter((r) => {
        if (applied.from && parseVnDate(r.time) < new Date(applied.from).getTime()) return false
        if (applied.to && parseVnDate(r.time) > new Date(applied.to).getTime()) return false
        if (applied.soCCGoc && !r.soCCGoc.toLowerCase().includes(applied.soCCGoc.trim().toLowerCase())) return false
        if (applied.actor && !r.actor.toLowerCase().includes(applied.actor.trim().toLowerCase())) return false
        return true
      })
      .sort((a, b) => parseVnDate(b.time) - parseVnDate(a.time))
  }, [applied])

  const start = (Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize))) - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)

  const doSearch = () => {
    if (draft.from && draft.to && draft.to < draft.from) return setError("Từ ngày lập không được lớn hơn Đến ngày lập!")
    if (draft.from && draft.to && (new Date(draft.to).getTime() - new Date(draft.from).getTime()) / 86400000 > 365) return setError("Khoảng thời gian tra cứu không quá 1 năm!")
    setApplied(draft); setError(""); setPage(1)
  }
  const doReset = () => { setDraft(makeEmpty()); setApplied(makeEmpty()); setError(""); setPage(1) }

  return (
    <div>
      <PageHeader
        title="Lịch sử xử lý tuyên hủy giao dịch công chứng"
        desc="Theo dõi và tra cứu toàn bộ quá trình lập yêu cầu, chỉnh sửa và phê duyệt hồ sơ hủy văn bản công chứng."
        actions={<Button variant="outline" onClick={() => showToast("Đang xuất Excel lịch sử xử lý tuyên hủy…")}><Download className="size-4" />Xuất Excel</Button>}
      />

      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Từ ngày lập"><input type="date" value={draft.from} onChange={(e) => setDraft({ ...draft, from: e.target.value })} className={cn(inputCls, "text-[13.5px]")} /></Field>
          <Field label="Đến ngày lập"><input type="date" value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.target.value })} className={cn(inputCls, "text-[13.5px]")} /></Field>
          <Field label="Số công chứng gốc"><input value={draft.soCCGoc} onChange={(e) => setDraft({ ...draft, soCCGoc: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} placeholder="Nhập số CC gốc" className={inputCls} /></Field>
          <Field label="Người thực hiện"><input value={draft.actor} onChange={(e) => setDraft({ ...draft, actor: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} placeholder="Nhập tài khoản" className={inputCls} /></Field>
        </div>
        {error && <div className="mt-2.5 text-[12.5px] text-red-600">{error}</div>}
        <div className="mt-[18px] flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" onClick={doReset}><RotateCcw className="size-4" />Reset</Button>
          <Button onClick={doSearch}><Search className="size-4" />Tìm kiếm</Button>
        </div>
      </div>

      <div className="mx-0.5 mb-2.5 mt-[18px] flex items-center gap-2">
        <span className="text-[13px] text-foreground-muted">Kết quả:</span>
        <span className="text-[13px] font-semibold text-foreground-strong">{filtered.length} bản ghi</span>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        {filtered.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-neutral-50">
                    <Th className="w-11 text-center">STT</Th>
                    <Th className="min-w-[160px]">Thời gian</Th>
                    <Th>Số CC gốc</Th>
                    <Th>Quyết định hủy</Th>
                    <Th className="min-w-[120px]">Người thực hiện</Th>
                    <Th className="min-w-[130px]">Thao tác xử lý</Th>
                    <Th className="min-w-[260px]">Nội dung chi tiết</Th>
                    <Th className="min-w-[120px]">IP</Th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((r, i) => (
                    <tr key={r.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{start + i + 1}</td>
                      <td className="whitespace-nowrap px-4 py-3 tabular-nums text-[12.5px] text-foreground-muted">{r.time}</td>
                      <td className="px-4 py-3 font-mono text-[12.5px] font-semibold text-link">{r.soCCGoc}</td>
                      <td className="px-4 py-3 font-mono text-[12px] text-foreground">{r.soQD}</td>
                      <td className="px-4 py-3 font-mono text-[12px] text-foreground">{r.actor}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold" style={{ background: REVOKE_ACTION_META[r.action].bg, color: REVOKE_ACTION_META[r.action].fg, border: `1px solid ${REVOKE_ACTION_META[r.action].bd}` }}>{r.action}</span>
                      </td>
                      <td className="px-4 py-3 text-[13px] leading-snug text-foreground-muted">{r.content}</td>
                      <td className="px-4 py-3 font-mono text-[12px] text-foreground-muted">{r.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={pageSize} total={filtered.length} unit="bản ghi" onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
          </>
        ) : (
          <EmptyState icon={<FileSearch className="size-6" />} title="Không tìm thấy lịch sử tuyên hủy" desc="Không có bản ghi lịch sử xử lý tuyên hủy nào khớp với bộ lọc hiện tại." actionLabel="Reset bộ lọc" onAction={doReset} />
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-foreground-strong">{label}</label>
      {children}
    </div>
  )
}
