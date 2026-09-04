import { useMemo, useState } from "react"
import { Eye, History } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { EmptyState, PageHeader, Pagination, Th, inputCls } from "../ingestion/shared"
import { HistoryDetailPopup } from "./dialogs"
import {
  CURRENT_USER, HISTORY_ACTIONS, PERSONAL_HISTORY_TEMPLATE, UTIL_ROLES, fmtVNDateTime, hasCard,
  type PersonalHistoryEntry, type UtilRole,
} from "./config"

type Filters = { tuNgay: string; denNgay: string; hanhDong: string; diaChiIP: string; doiTuong: string }
const EMPTY: Filters = { tuNgay: "", denNgay: "", hanhDong: "all", diaChiIP: "", doiTuong: "" }

export function PersonalHistoryPage() {
  const [role, setRole] = useState<UtilRole>("admin")
  const [draft, setDraft] = useState(EMPTY)
  const [applied, setApplied] = useState(EMPTY)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [detail, setDetail] = useState<PersonalHistoryEntry | null>(null)

  const canView = hasCard(role, "history")
  const actorName = CURRENT_USER[role].hoTen

  const rows = useMemo(() => {
    let r = PERSONAL_HISTORY_TEMPLATE
    if (applied.tuNgay) r = r.filter((h) => h.thoiGian.slice(0, 10) >= applied.tuNgay)
    if (applied.denNgay) r = r.filter((h) => h.thoiGian.slice(0, 10) <= applied.denNgay)
    if (applied.hanhDong !== "all") r = r.filter((h) => h.hanhDong === applied.hanhDong)
    if (applied.diaChiIP.trim()) r = r.filter((h) => h.diaChiIP.includes(applied.diaChiIP.trim()))
    if (applied.doiTuong.trim()) r = r.filter((h) => h.doiTuong.toLowerCase().includes(applied.doiTuong.trim().toLowerCase()))
    return [...r].sort((a, b) => b.thoiGian.localeCompare(a.thoiGian))
  }, [applied])

  const doSearch = () => {
    if (draft.tuNgay && draft.denNgay && draft.tuNgay > draft.denNgay) return setError("Khoảng thời gian không hợp lệ.")
    setError(""); setApplied(draft); setPage(1)
  }
  const doReset = () => { setDraft(EMPTY); setApplied(EMPTY); setError(""); setPage(1) }

  const total = rows.length
  const paged = rows.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="space-y-4">
      <PageHeader title="Lịch sử thao tác cá nhân" desc="Chỉ hiển thị lịch sử thao tác do chính tài khoản đang đăng nhập thực hiện."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] text-foreground-muted">Vai trò:</span>
            <NativeSelect value={role} onChange={(e) => setRole(e.target.value as UtilRole)} className="h-8 w-[240px] text-[12.5px]">
              {UTIL_ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </NativeSelect>
          </div>
        } />

      {!canView ? (
        <EmptyState icon={<History className="size-6" />} title="Không có quyền xem lịch sử thao tác cá nhân" desc="Vai trò hiện tại không được gán quyền chức năng này." />
      ) : (
        <>
          <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Người thực hiện</label><input disabled value={actorName} className={cn(inputCls, "bg-neutral-50 text-foreground-muted")} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Từ ngày</label><input type="date" value={draft.tuNgay} onChange={(e) => { setDraft((d) => ({ ...d, tuNgay: e.target.value })); setError("") }} className={inputCls} /></div>
                <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Đến ngày</label><input type="date" value={draft.denNgay} onChange={(e) => { setDraft((d) => ({ ...d, denNgay: e.target.value })); setError("") }} className={inputCls} /></div>
              </div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Thao tác</label>
                <NativeSelect value={draft.hanhDong} onChange={(e) => setDraft((d) => ({ ...d, hanhDong: e.target.value }))}><option value="all">Tất cả</option>{HISTORY_ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}</NativeSelect>
              </div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Địa chỉ IP</label><input value={draft.diaChiIP} onChange={(e) => setDraft((d) => ({ ...d, diaChiIP: e.target.value }))} placeholder="Nhập IP…" className={inputCls} /></div>
              <div className="flex flex-col gap-1.5 lg:col-span-2"><label className="text-xs font-semibold text-foreground-strong">Tên đối tượng</label><input value={draft.doiTuong} onChange={(e) => setDraft((d) => ({ ...d, doiTuong: e.target.value }))} placeholder="Nhập tên đối tượng…" className={inputCls} /></div>
            </div>
            {error && <div className="mt-3 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]">{error}</div>}
            <div className="mt-4 flex gap-2.5"><Button onClick={doSearch}>Tìm kiếm</Button><Button variant="outline" onClick={doReset}>Reset</Button></div>
          </div>

          <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
            {paged.length ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead><tr className="border-b border-border bg-neutral-50"><Th className="w-11 text-center">STT</Th><Th>Người thực hiện</Th><Th>Hành động</Th><Th>Đối tượng</Th><Th>Địa chỉ IP</Th><Th>Thời gian</Th><Th className="text-right">Xem</Th></tr></thead>
                    <tbody>{paged.map((h, i) => (
                      <tr key={h.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{(page - 1) * pageSize + i + 1}</td>
                        <td className="px-4 py-3 text-foreground">{actorName}</td>
                        <td className="px-4 py-3 text-foreground-muted">{h.hanhDong}</td>
                        <td className="max-w-[260px] truncate px-4 py-3 text-foreground-muted" title={h.doiTuong}>{h.doiTuong}</td>
                        <td className="px-4 py-3 tabular-nums text-foreground-muted">{h.diaChiIP || "-"}</td>
                        <td className="px-4 py-3 tabular-nums text-foreground-muted">{fmtVNDateTime(h.thoiGian)}</td>
                        <td className="px-4 py-3 text-right"><Button variant="outline" size="sm" onClick={() => setDetail(h)}><Eye className="size-3.5" /></Button></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
                <Pagination page={page} pageSize={pageSize} total={total} unit="bản ghi" onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
              </>
            ) : (
              <EmptyState icon={<History className="size-6" />} title="Không có dữ liệu lịch sử thao tác" desc="Không có bản ghi lịch sử thao tác phù hợp với điều kiện lọc." />
            )}
          </div>
        </>
      )}

      {detail && <HistoryDetailPopup entry={detail} actorName={actorName} onClose={() => setDetail(null)} />}
    </div>
  )
}
