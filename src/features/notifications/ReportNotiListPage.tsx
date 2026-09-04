import { useMemo, useState } from "react"
import { Eye, FileStack, Pencil, Plus, Search, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { EmptyState, PageHeader, Pagination, Th, inputCls } from "../ingestion/shared"
import { DeleteReportNotiDialog, ReportNotiDetailDialog, ReportNotiFormDialog } from "./dialogs"
import {
  CURRENT_ORG_USER, KY_BAO_CAO, NOTI_ROLES, TODAY_ISO, canManageReportNoti, fmtVN, setCurrentRole, useCurrentRole,
  useReportNotis, type ReportNoti,
} from "./config"

type PopupState = { type: "form"; record?: ReportNoti } | { type: "detail"; id: string } | { type: "delete"; record: ReportNoti } | null
type Filters = { keyword: string; kyBaoCao: string; trangThai: "all" | "Nháp" | "Đã phát hành" }
const EMPTY: Filters = { keyword: "", kyBaoCao: "all", trangThai: "all" }

export function ReportNotiListPage() {
  const role = useCurrentRole()
  const all = useReportNotis()
  const [draft, setDraft] = useState(EMPTY)
  const [applied, setApplied] = useState(EMPTY)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [popup, setPopup] = useState<PopupState>(null)

  const canManage = canManageReportNoti(role)

  const rows = useMemo(() => {
    let r = all
    const k = applied.keyword.trim().toLowerCase()
    if (k) r = r.filter((x) => x.maTB.toLowerCase().includes(k) || x.tieuDe.toLowerCase().includes(k))
    if (applied.kyBaoCao !== "all") r = r.filter((x) => x.kyBaoCao === applied.kyBaoCao)
    if (applied.trangThai !== "all") r = r.filter((x) => x.trangThai === applied.trangThai)
    return [...r].sort((a, b) => b.ngayTao.localeCompare(a.ngayTao))
  }, [all, applied])

  const doSearch = () => { setApplied(draft); setPage(1) }
  const doReset = () => { setDraft(EMPTY); setApplied(EMPTY); setPage(1) }

  const total = rows.length
  const paged = rows.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="space-y-4">
      <PageHeader title="Thông báo đợt báo cáo" desc="Tạo lập, phát hành và theo dõi thông báo nhắc nộp số liệu báo cáo hoạt động công chứng."
        actions={
          <div className="flex items-center gap-2.5">
            <span className="text-[12.5px] text-foreground-muted">Vai trò:</span>
            <select value={role} onChange={(e) => setCurrentRole(e.target.value as typeof role)} className="h-8 w-[220px] cursor-pointer rounded-md border border-input bg-surface px-2 text-[12.5px] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
              {NOTI_ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </select>
            {canManage && <Button size="sm" className="ml-1.5" onClick={() => setPopup({ type: "form" })}><Plus className="size-4" />Thêm mới</Button>}
          </div>
        } />

      {!canManage ? (
        <EmptyState icon={<FileStack className="size-6" />} title="Không có quyền truy cập" desc="Chỉ Chuyên viên/Lãnh đạo phòng chuyên môn STP và Lãnh đạo TCHNCC được quản lý thông báo đợt báo cáo." />
      ) : (
        <>
          <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Từ khóa</label><input value={draft.keyword} onChange={(e) => setDraft((d) => ({ ...d, keyword: e.target.value.slice(0, 100) }))} placeholder="Nhập mã TB hoặc tiêu đề…" className={inputCls} onKeyDown={(e) => e.key === "Enter" && doSearch()} /></div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Kỳ báo cáo</label>
                <NativeSelect value={draft.kyBaoCao} onChange={(e) => setDraft((d) => ({ ...d, kyBaoCao: e.target.value }))}><option value="all">Tất cả</option>{KY_BAO_CAO.map((k) => <option key={k} value={k}>{k}</option>)}</NativeSelect>
              </div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Trạng thái</label>
                <NativeSelect value={draft.trangThai} onChange={(e) => setDraft((d) => ({ ...d, trangThai: e.target.value as Filters["trangThai"] }))}><option value="all">Tất cả</option><option value="Nháp">Nháp</option><option value="Đã phát hành">Đã phát hành</option></NativeSelect>
              </div>
            </div>
            <div className="mt-4 flex gap-2.5"><Button onClick={doSearch}><Search className="size-4" />Tìm kiếm</Button><Button variant="outline" onClick={doReset}>Đặt lại</Button></div>
          </div>

          <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
            {paged.length ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead><tr className="border-b border-border bg-neutral-50"><Th className="w-11 text-center">STT</Th><Th>Mã TB</Th><Th>Tiêu đề</Th><Th>Kỳ báo cáo</Th><Th>Hạn nộp</Th><Th>Trạng thái</Th><Th className="text-right">Thao tác</Th></tr></thead>
                    <tbody>{paged.map((r, i) => {
                      const overdue = !!r.hanNop && r.hanNop < TODAY_ISO && r.trangThai === "Đã phát hành"
                      return (
                        <tr key={r.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                          <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{(page - 1) * pageSize + i + 1}</td>
                          <td className="px-4 py-3"><button onClick={() => setPopup({ type: "detail", id: r.id })} className="font-medium text-link hover:underline">{r.maTB}</button></td>
                          <td className="max-w-[260px] truncate px-4 py-3 text-foreground" title={r.tieuDe}>{r.tieuDe}</td>
                          <td className="px-4 py-3 text-foreground-muted">{r.kyBaoCao}</td>
                          <td className="px-4 py-3 tabular-nums">{r.hanNop ? <span className={overdue ? "font-medium text-red-600" : "text-foreground-muted"}>{fmtVN(r.hanNop)}</span> : "—"}</td>
                          <td className="px-4 py-3">{r.trangThai === "Nháp" ? <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11.5px] text-foreground-muted">Nháp</span> : <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11.5px] font-medium text-emerald-700">Đã phát hành</span>}</td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1.5">
                              <Button variant="outline" size="sm" onClick={() => setPopup({ type: "detail", id: r.id })}><Eye className="size-3.5" /></Button>
                              {r.trangThai === "Nháp" && <Button variant="outline" size="sm" onClick={() => setPopup({ type: "form", record: r })}><Pencil className="size-3.5" /></Button>}
                              {r.trangThai === "Nháp" && <Button variant="outline" size="sm" onClick={() => setPopup({ type: "delete", record: r })}><Trash2 className="size-3.5" /></Button>}
                            </div>
                          </td>
                        </tr>
                      )
                    })}</tbody>
                  </table>
                </div>
                <Pagination page={page} pageSize={pageSize} total={total} unit="thông báo" onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
              </>
            ) : (
              <EmptyState icon={<FileStack className="size-6" />} title="Không có thông báo đợt báo cáo" desc="Chưa có thông báo đợt báo cáo nào phù hợp với điều kiện tìm kiếm." />
            )}
          </div>
        </>
      )}

      {popup?.type === "form" && <ReportNotiFormDialog record={popup.record} currentUser={CURRENT_ORG_USER[role]} onClose={() => setPopup(null)} />}
      {popup?.type === "detail" && (() => {
        const live = all.find((r) => r.id === popup.id)
        return live ? <ReportNotiDetailDialog record={live} onEdit={() => setPopup({ type: "form", record: live })} onClose={() => setPopup(null)} /> : null
      })()}
      {popup?.type === "delete" && <DeleteReportNotiDialog record={popup.record} onClose={() => setPopup(null)} />}
    </div>
  )
}
