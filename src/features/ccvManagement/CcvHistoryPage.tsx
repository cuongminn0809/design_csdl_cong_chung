import { useMemo, useState } from "react"
import { History as HistoryIcon, Search } from "lucide-react"
import { useSearchParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { EmptyState, PageHeader, Th, inputCls } from "../ingestion/shared"
import { SimplePagination } from "../orgManagement/shared"
import { CcvHistoryDetailDialog } from "./dialogs"
import { setCurrentRole, useCurrentRole } from "@/features/notifications/config"
import { NOTI_ROLES, canViewHistory, fmtVNDateTime, getCcv, HISTORY_ACTIONS, useHistory, type CcvHistoryEntry, type CcvRole } from "./config"

type Filters = { tuNgay: string; denNgay: string; thaoTac: string; nguoiThucHien: string; ip: string; ccv: string; toChuc: string; soThe: string }
const emptyFilters = (ccv = ""): Filters => ({ tuNgay: "", denNgay: "", thaoTac: "all", nguoiThucHien: "", ip: "", ccv, toChuc: "", soThe: "" })

export function CcvHistoryPage() {
  const role = useCurrentRole()
  const [params] = useSearchParams()
  const prefillCcv = params.get("ccv") ? getCcv(params.get("ccv")!)?.hoTen ?? "" : ""
  const allHistory = useHistory()
  const [draft, setDraft] = useState(emptyFilters(prefillCcv))
  const [applied, setApplied] = useState(emptyFilters(prefillCcv))
  const [page, setPage] = useState(1)
  const [viewing, setViewing] = useState<CcvHistoryEntry | null>(null)

  const rows = useMemo(() => {
    let r = allHistory
    if (applied.tuNgay) r = r.filter((h) => h.thoiGian.slice(0, 10) >= applied.tuNgay)
    if (applied.denNgay) r = r.filter((h) => h.thoiGian.slice(0, 10) <= applied.denNgay)
    if (applied.thaoTac !== "all") r = r.filter((h) => h.thaoTac === applied.thaoTac)
    const kwActor = applied.nguoiThucHien.trim().toLowerCase()
    if (kwActor) r = r.filter((h) => h.nguoiThucHien.toLowerCase().includes(kwActor))
    const kwIp = applied.ip.trim().toLowerCase()
    if (kwIp) r = r.filter((h) => h.diaChiIp.toLowerCase().includes(kwIp))
    const kwCcv = applied.ccv.trim().toLowerCase()
    if (kwCcv) r = r.filter((h) => h.ccvTen.toLowerCase().includes(kwCcv))
    const kwOrg = applied.toChuc.trim().toLowerCase()
    if (kwOrg) r = r.filter((h) => h.toChuc.toLowerCase().includes(kwOrg))
    const kwThe = applied.soThe.trim().toLowerCase()
    if (kwThe) r = r.filter((h) => h.soThe.toLowerCase().includes(kwThe))
    return [...r].sort((a, b) => b.thoiGian.localeCompare(a.thoiGian))
  }, [allHistory, applied])

  const doSearch = () => { setApplied(draft); setPage(1) }
  const doReset = () => { const e = { tuNgay: "", denNgay: "", thaoTac: "all", nguoiThucHien: "", ip: "", ccv: "", toChuc: "", soThe: "" }; setDraft(e); setApplied(e); setPage(1) }

  const pageSize = 10
  const total = rows.length
  const paged = rows.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="space-y-4">
      <PageHeader title="Lịch sử cập nhật thông tin Công chứng viên" desc="Tra cứu các lần thay đổi, cập nhật thông tin của từng công chứng viên."
        actions={
          <div className="flex items-center gap-2.5">
            <span className="text-[12.5px] text-foreground-muted">Vai trò:</span>
            <NativeSelect value={role} onChange={(e) => setCurrentRole(e.target.value as CcvRole)} className="h-8 w-[220px] text-[12.5px]">
              {NOTI_ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </NativeSelect>
          </div>
        } />

      {!canViewHistory(role) ? (
        <EmptyState icon={<HistoryIcon className="size-6" />} title="Không có quyền truy cập" desc="Vai trò hiện tại không được gán quyền khai thác lịch sử cập nhật thông tin công chứng viên." />
      ) : (
        <>
          <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Thời gian từ</label><input type="date" value={draft.tuNgay} onChange={(e) => setDraft((d) => ({ ...d, tuNgay: e.target.value }))} className={inputCls} /></div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Thời gian đến</label><input type="date" value={draft.denNgay} onChange={(e) => setDraft((d) => ({ ...d, denNgay: e.target.value }))} className={inputCls} /></div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Thao tác</label>
                <NativeSelect value={draft.thaoTac} onChange={(e) => setDraft((d) => ({ ...d, thaoTac: e.target.value }))}><option value="all">Tất cả</option>{HISTORY_ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}</NativeSelect>
              </div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Người thực hiện</label><input value={draft.nguoiThucHien} onChange={(e) => setDraft((d) => ({ ...d, nguoiThucHien: e.target.value }))} className={inputCls} onKeyDown={(e) => e.key === "Enter" && doSearch()} /></div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Địa chỉ IP</label><input value={draft.ip} onChange={(e) => setDraft((d) => ({ ...d, ip: e.target.value }))} className={inputCls} onKeyDown={(e) => e.key === "Enter" && doSearch()} /></div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Công chứng viên</label><input value={draft.ccv} onChange={(e) => setDraft((d) => ({ ...d, ccv: e.target.value }))} className={inputCls} onKeyDown={(e) => e.key === "Enter" && doSearch()} /></div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Tổ chức công chứng</label><input value={draft.toChuc} onChange={(e) => setDraft((d) => ({ ...d, toChuc: e.target.value }))} className={inputCls} onKeyDown={(e) => e.key === "Enter" && doSearch()} /></div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Số thẻ</label><input value={draft.soThe} onChange={(e) => setDraft((d) => ({ ...d, soThe: e.target.value }))} className={inputCls} onKeyDown={(e) => e.key === "Enter" && doSearch()} /></div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <Button onClick={doSearch}><Search className="size-4" />Tìm kiếm</Button>
              <Button variant="outline" onClick={doReset}>Reset</Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
            {paged.length ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed border-collapse text-sm">
                    <thead><tr className="border-b border-border bg-neutral-50">
                      <Th className="w-[15%]">Thời gian</Th>
                      <Th className="w-[10%]">Thao tác</Th>
                      <Th className="w-[13%]">Người thực hiện</Th>
                      <Th className="w-[11%]">Địa chỉ IP</Th>
                      <Th className="w-[16%]">Công chứng viên</Th>
                      <Th className="w-[17%]">Tổ chức công chứng</Th>
                      <Th className="w-[10%]">Số thẻ</Th>
                      <Th className="w-[90px] text-right">Hành động</Th>
                    </tr></thead>
                    <tbody>{paged.map((h) => (
                      <tr key={h.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="px-4 py-3 tabular-nums text-foreground-muted">{fmtVNDateTime(h.thoiGian)}</td>
                        <td className="px-4 py-3 text-foreground">{h.thaoTac}</td>
                        <td className="truncate px-4 py-3 text-foreground-muted">{h.nguoiThucHien}</td>
                        <td className="px-4 py-3 text-foreground-muted">{h.diaChiIp}</td>
                        <td className="truncate px-4 py-3 text-foreground-muted">{h.ccvTen}</td>
                        <td className="truncate px-4 py-3 text-foreground-muted">{h.toChuc}</td>
                        <td className="px-4 py-3 text-foreground-muted">{h.soThe}</td>
                        <td className="px-4 py-3 text-right"><Button variant="outline" size="sm" onClick={() => setViewing(h)}>Xem</Button></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
                {total > pageSize && <SimplePagination page={page} pageSize={pageSize} total={total} onPage={setPage} />}
              </>
            ) : (
              <EmptyState icon={<HistoryIcon className="size-6" />} title="Không có dữ liệu" desc="Không có dữ liệu lịch sử cập nhật Công chứng viên." />
            )}
          </div>
        </>
      )}

      {viewing && <CcvHistoryDetailDialog entry={viewing} onClose={() => setViewing(null)} />}
    </div>
  )
}
