import { useMemo, useState } from "react"
import { ArrowDown, ArrowUp, ArrowUpDown, Bell, Eye, Search, Settings2, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { EmptyState, PageHeader, Pagination, Th, inputCls } from "../ingestion/shared"
import { DeleteNotiDialog, NotiDetailModal } from "./dialogs"
import { NOTI_TYPES, activeNotifications, fmtVNDateTime, useNotifications, type MyNotification } from "./config"

type SortKey = "title" | "type" | "priority" | "receivedAt"
type Filters = { keyword: string; type: string; tuNgay: string; denNgay: string }
const EMPTY: Filters = { keyword: "", type: "all", tuNgay: "", denNgay: "" }
const PRIORITY_RANK: Record<string, number> = { "Cao": 0, "Bình thường": 1 }

export function NotiListPage() {
  const navigate = useNavigate()
  useNotifications()
  const [tab, setTab] = useState<"all" | "unread">("all")
  const [draft, setDraft] = useState(EMPTY)
  const [applied, setApplied] = useState(EMPTY)
  const [error, setError] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("receivedAt")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MyNotification | null>(null)

  const all = activeNotifications()
  const unreadTotal = all.filter((n) => !n.read).length

  const rows = useMemo(() => {
    let r = tab === "unread" ? all.filter((n) => !n.read) : all
    const k = applied.keyword.trim().toLowerCase()
    if (k) r = r.filter((n) => n.title.toLowerCase().includes(k) || n.content.toLowerCase().includes(k))
    if (applied.type !== "all") r = r.filter((n) => n.type === applied.type)
    if (applied.tuNgay) r = r.filter((n) => n.receivedAt.slice(0, 10) >= applied.tuNgay)
    if (applied.denNgay) r = r.filter((n) => n.receivedAt.slice(0, 10) <= applied.denNgay)
    const sorted = [...r].sort((a, b) => {
      let cmp = 0
      if (sortKey === "title") cmp = a.title.localeCompare(b.title)
      else if (sortKey === "type") cmp = a.type.localeCompare(b.type)
      else if (sortKey === "priority") cmp = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
      else cmp = a.receivedAt.localeCompare(b.receivedAt)
      return sortDir === "asc" ? cmp : -cmp
    })
    return sorted
  }, [all, tab, applied, sortKey, sortDir])

  const doSearch = () => {
    if (draft.tuNgay && draft.denNgay && draft.denNgay < draft.tuNgay) return setError("Đến ngày phải lớn hơn hoặc bằng Từ ngày.")
    setError(""); setApplied(draft); setPage(1)
  }
  const doReset = () => { setDraft(EMPTY); setApplied(EMPTY); setError(""); setPage(1) }
  const toggleSort = (key: SortKey) => { if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc")); else { setSortKey(key); setSortDir("desc") } }
  const sortIcon = (key: SortKey) => sortKey !== key ? <ArrowUpDown className="size-3 text-foreground-subtle" /> : sortDir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />

  const total = rows.length
  const paged = rows.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="space-y-4">
      <PageHeader title="Danh sách thông báo" desc="Xem, tìm kiếm và quản lý thông báo nhận của tài khoản đang đăng nhập."
        actions={<Button variant="outline" onClick={() => navigate("/tien-ich/thong-bao/dang-ky-nhan")}><Settings2 className="size-4" />Đăng ký nhận thông báo</Button>} />

      <div className="flex gap-1 border-b border-border">
        {(["all", "unread"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setPage(1) }}
            className={cn("border-b-2 px-3 py-2 text-[13.5px] font-medium transition-colors", tab === t ? "border-neutral-900 text-foreground-strong" : "border-transparent text-foreground-muted hover:text-foreground")}
          >
            {t === "all" ? "Tất cả" : `Chưa đọc (${unreadTotal})`}
          </button>
        ))}
      </div>

      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1.5 lg:col-span-2"><label className="text-xs font-semibold text-foreground-strong">Từ khóa</label><input value={draft.keyword} onChange={(e) => setDraft((d) => ({ ...d, keyword: e.target.value.slice(0, 100) }))} placeholder="Nhập tiêu đề hoặc nội dung…" className={inputCls} onKeyDown={(e) => e.key === "Enter" && doSearch()} /></div>
          <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Loại thông báo</label>
            <NativeSelect value={draft.type} onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value }))}><option value="all">Tất cả</option>{NOTI_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</NativeSelect>
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
              <table className="w-full border-collapse text-sm">
                <thead><tr className="border-b border-border bg-neutral-50">
                  <Th className="w-11 text-center">STT</Th>
                  <Th><button className="flex items-center gap-1" onClick={() => toggleSort("title")}>Tiêu đề {sortIcon("title")}</button></Th>
                  <Th><button className="flex items-center gap-1" onClick={() => toggleSort("type")}>Loại thông báo {sortIcon("type")}</button></Th>
                  <Th><button className="flex items-center gap-1" onClick={() => toggleSort("priority")}>Mức ưu tiên {sortIcon("priority")}</button></Th>
                  <Th><button className="flex items-center gap-1" onClick={() => toggleSort("receivedAt")}>Thời gian nhận {sortIcon("receivedAt")}</button></Th>
                  <Th>Trạng thái</Th>
                  <Th className="text-right">Thao tác</Th>
                </tr></thead>
                <tbody>{paged.map((n, i) => (
                  <tr key={n.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{(page - 1) * pageSize + i + 1}</td>
                    <td className="max-w-[280px] px-4 py-3">
                      <button onClick={() => setDetailId(n.id)} className={cn("flex items-center gap-1.5 text-left hover:underline", !n.read ? "font-semibold text-foreground-strong" : "text-foreground")} title={n.title}>
                        {!n.read && <span className="size-1.5 shrink-0 rounded-full bg-red-600" />}
                        <span className="truncate">{n.title}</span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">{n.type}</td>
                    <td className="px-4 py-3">{n.priority === "Cao" ? <span className="font-medium text-red-600">Cao</span> : <span className="text-foreground-muted">Bình thường</span>}</td>
                    <td className="px-4 py-3 tabular-nums text-foreground-muted">{fmtVNDateTime(n.receivedAt)}</td>
                    <td className="px-4 py-3">{n.read ? <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11.5px] text-foreground-muted">Đã đọc</span> : <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11.5px] font-medium text-emerald-700">Chưa đọc</span>}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="outline" size="sm" onClick={() => setDetailId(n.id)}><Eye className="size-3.5" /></Button>
                        <Button variant="outline" size="sm" onClick={() => setDeleteTarget(n)}><Trash2 className="size-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={pageSize} total={total} unit="thông báo" onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
          </>
        ) : (
          <EmptyState icon={<Bell className="size-6" />} title={tab === "unread" ? "Không có thông báo chưa đọc" : "Không tìm thấy kết quả phù hợp"} desc="Không có thông báo nào phù hợp với điều kiện hiện tại." />
        )}
      </div>

      {detailId && <NotiDetailModal id={detailId} onClose={() => setDetailId(null)} />}
      {deleteTarget && <DeleteNotiDialog noti={deleteTarget} onClose={() => setDeleteTarget(null)} />}
    </div>
  )
}
