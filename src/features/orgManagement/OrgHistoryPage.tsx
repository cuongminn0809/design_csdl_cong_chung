import { useMemo, useState } from "react"
import { Eye, History as HistoryIcon, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { setCurrentRole, useCurrentRole } from "@/features/notifications/config"
import { EmptyState, PageHeader, Th, inputCls } from "../ingestion/shared"
import { SimplePagination } from "./shared"
import { HistoryDetailDialog } from "./dialogs"
import { HISTORY_ACTIONS, NOTI_ROLES, canViewHistory, fmtVNDateTime, useHistory, type OrgHistoryEntry, type OrgRole } from "./config"

type Filters = { keyword: string; thaoTac: "all" | OrgHistoryEntry["thaoTac"]; ngay: string }
const EMPTY: Filters = { keyword: "", thaoTac: "all", ngay: "" }

export function OrgHistoryPage() {
  const role = useCurrentRole()
  const all = useHistory()
  const [draft, setDraft] = useState(EMPTY)
  const [applied, setApplied] = useState(EMPTY)
  const [page, setPage] = useState(1)
  const [detail, setDetail] = useState<OrgHistoryEntry | null>(null)

  const canView = canViewHistory(role)

  const rows = useMemo(() => {
    let r = all
    const k = applied.keyword.trim().toLowerCase()
    if (k) r = r.filter((h) => h.orgTen.toLowerCase().includes(k) || h.noiDung.toLowerCase().includes(k) || h.nguoiThucHien.toLowerCase().includes(k))
    if (applied.thaoTac !== "all") r = r.filter((h) => h.thaoTac === applied.thaoTac)
    if (applied.ngay) r = r.filter((h) => h.thoiGian.slice(0, 10) === applied.ngay)
    return [...r].sort((a, b) => b.thoiGian.localeCompare(a.thoiGian))
  }, [all, applied])

  const doSearch = () => { setApplied(draft); setPage(1) }
  const doReset = () => { setDraft(EMPTY); setApplied(EMPTY); setPage(1) }

  const pageSize = 10
  const total = rows.length
  const paged = rows.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="space-y-4">
      <PageHeader title="Lịch sử cập nhật TCHNCC" desc="Tra cứu lịch sử thao tác thêm mới, cập nhật và chấm dứt hoạt động tổ chức hành nghề công chứng."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] text-foreground-muted">Vai trò:</span>
            <NativeSelect value={role} onChange={(e) => setCurrentRole(e.target.value as OrgRole)} className="h-8 w-[220px] text-[12.5px]">
              {NOTI_ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </NativeSelect>
          </div>
        } />

      {!canView ? (
        <EmptyState icon={<HistoryIcon className="size-6" />} title="Không có quyền truy cập" desc="Chỉ Chuyên viên Sở Tư pháp và Lãnh đạo phòng chuyên môn của STP được xem lịch sử cập nhật TCHNCC." />
      ) : (
        <>
          <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-1.5 lg:col-span-1"><label className="text-xs font-semibold text-foreground-strong">Từ khóa</label><input value={draft.keyword} onChange={(e) => setDraft((d) => ({ ...d, keyword: e.target.value.slice(0, 250) }))} placeholder="Tổ chức, nội dung, người thực hiện…" className={inputCls} onKeyDown={(e) => e.key === "Enter" && doSearch()} /></div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Thao tác</label>
                <NativeSelect value={draft.thaoTac} onChange={(e) => setDraft((d) => ({ ...d, thaoTac: e.target.value as Filters["thaoTac"] }))}><option value="all">Tất cả</option>{HISTORY_ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}</NativeSelect>
              </div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Thời gian</label><input type="date" value={draft.ngay} onChange={(e) => setDraft((d) => ({ ...d, ngay: e.target.value }))} className={inputCls} /></div>
            </div>
            <div className="mt-4 flex gap-2.5"><Button onClick={doSearch}><Search className="size-4" />Tìm kiếm</Button><Button variant="outline" onClick={doReset}>Làm mới</Button></div>
          </div>

          <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
            {paged.length ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed border-collapse text-sm">
                    <thead><tr className="border-b border-border bg-neutral-50">
                      <Th className="w-11 text-center">STT</Th>
                      <Th className="w-[140px]">Thời gian</Th>
                      <Th className="w-[130px]">Thao tác</Th>
                      <Th className="w-[26%]">Nội dung</Th>
                      <Th className="w-[130px]">Người thực hiện</Th>
                      <Th className="w-[20%]">Tổ chức công chứng</Th>
                      <Th className="w-[90px] text-right">Hành động</Th>
                    </tr></thead>
                    <tbody>{paged.map((h, i) => (
                      <tr key={h.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{(page - 1) * pageSize + i + 1}</td>
                        <td className="px-4 py-3 tabular-nums text-foreground-muted">{fmtVNDateTime(h.thoiGian)}</td>
                        <td className="px-4 py-3 text-foreground">{h.thaoTac}</td>
                        <td className="truncate px-4 py-3 text-foreground-muted" title={h.noiDung}>{h.noiDung}</td>
                        <td className="truncate px-4 py-3 text-foreground-muted">{h.nguoiThucHien}</td>
                        <td className="truncate px-4 py-3 text-foreground-muted" title={h.orgTen}>{h.orgTen}</td>
                        <td className="px-4 py-3 text-right"><Button variant="outline" size="sm" onClick={() => setDetail(h)}><Eye className="size-3.5" /></Button></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
                {total > 10 && <SimplePagination page={page} pageSize={pageSize} total={total} onPage={setPage} />}
              </>
            ) : (
              <EmptyState icon={<HistoryIcon className="size-6" />} title="Không có kết quả" desc="Không có lịch sử cập nhật nào phù hợp với điều kiện tìm kiếm." />
            )}
          </div>
        </>
      )}

      {detail && <HistoryDetailDialog entry={detail} onClose={() => setDetail(null)} />}
    </div>
  )
}
