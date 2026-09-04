import { useMemo, useState } from "react"
import { Building2, Download, Eye, Pencil, Plus, Search, XCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { EmptyState, PageHeader, Th, inputCls } from "../ingestion/shared"
import { SimplePagination } from "./shared"
import { TerminateDialog } from "./dialogs"
import {
  CURRENT_ORG_USER, NOTI_ROLES, ORG_STATUSES, STATUS_BADGE, canExportOrg, canManageOrg, canViewOrg, ccvOf, ordersInScope,
  useOrgs, type TchnccOrg, type OrgRole, type OrgStatus,
} from "./config"
import { setCurrentRole, useCurrentRole } from "@/features/notifications/config"

type Filters = { ten: string; trangThai: "all" | OrgStatus }
const EMPTY: Filters = { ten: "", trangThai: "all" }

export function OrgListPage() {
  const navigate = useNavigate()
  const showToast = useToast()
  const role = useCurrentRole()
  useOrgs()
  const [draft, setDraft] = useState(EMPTY)
  const [applied, setApplied] = useState(EMPTY)
  const [page, setPage] = useState(1)
  const [terminating, setTerminating] = useState<TchnccOrg | null>(null)

  const scoped = ordersInScope(role)
  const rows = useMemo(() => {
    let r = scoped
    const k = applied.ten.trim().toLowerCase()
    if (k) r = r.filter((o) => o.ten.toLowerCase().includes(k))
    if (applied.trangThai !== "all") r = r.filter((o) => o.trangThai === applied.trangThai)
    return [...r].sort((a, b) => b.ngayTao.localeCompare(a.ngayTao))
  }, [scoped, applied])

  const doSearch = () => { setApplied(draft); setPage(1) }
  const doReset = () => { setDraft(EMPTY); setApplied(EMPTY); setPage(1) }
  const doExport = () => showToast(rows.length ? "Xuất danh sách tổ chức hành nghề công chứng thành công." : "Không có dữ liệu để xuất.", rows.length ? "ok" : "error")

  const pageSize = 10
  const total = rows.length
  const paged = rows.slice((page - 1) * pageSize, page * pageSize)
  const canManage = canManageOrg(role)

  return (
    <div className="space-y-4">
      <PageHeader title="Quản lý thông tin TCHNCC" desc="Quản lý danh sách tổ chức hành nghề công chứng theo phạm vi được phân quyền."
        actions={
          <div className="flex items-center gap-2.5">
            <span className="text-[12.5px] text-foreground-muted">Vai trò:</span>
            <NativeSelect value={role} onChange={(e) => setCurrentRole(e.target.value as OrgRole)} className="h-8 w-[220px] text-[12.5px]">
              {NOTI_ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </NativeSelect>
            {canManage && <Button size="sm" className="ml-1.5" onClick={() => navigate("/quan-ly-thong-tin/to-chuc-hncc/them-moi")}><Plus className="size-4" />Thêm mới</Button>}
          </div>
        } />

      {!canViewOrg(role) ? (
        <EmptyState icon={<Building2 className="size-6" />} title="Không có quyền truy cập" desc="Vai trò hiện tại không được gán quyền chức năng quản lý thông tin tổ chức hành nghề công chứng." />
      ) : (
      <>
      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-1.5 lg:col-span-2"><label className="text-xs font-semibold text-foreground-strong">Tên tổ chức</label><input value={draft.ten} onChange={(e) => setDraft((d) => ({ ...d, ten: e.target.value.slice(0, 250) }))} placeholder="Nhập tên tổ chức…" className={inputCls} onKeyDown={(e) => e.key === "Enter" && doSearch()} /></div>
          <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Trạng thái</label>
            <NativeSelect value={draft.trangThai} onChange={(e) => setDraft((d) => ({ ...d, trangThai: e.target.value as Filters["trangThai"] }))}><option value="all">Tất cả</option>{ORG_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</NativeSelect>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2.5">
          <Button onClick={doSearch}><Search className="size-4" />Tìm kiếm</Button>
          <Button variant="outline" onClick={doReset}>Reset</Button>
          {canExportOrg(role) && <Button variant="outline" onClick={doExport}><Download className="size-4" />Xuất Excel</Button>}
        </div>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        {paged.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full table-fixed border-collapse text-sm">
                <thead><tr className="border-b border-border bg-neutral-50">
                  <Th className="w-11 text-center">STT</Th>
                  <Th className="w-[24%]">Tên tổ chức</Th>
                  <Th className="w-[16%]">Trưởng VP</Th>
                  <Th className="w-[28%]">Địa chỉ trụ sở</Th>
                  <Th className="w-[150px]">Trạng thái</Th>
                  <Th className="w-[140px] text-right">Hành động</Th>
                </tr></thead>
                <tbody>{paged.map((o, i) => {
                  const badge = STATUS_BADGE[o.trangThai]
                  const truongVp = ccvNameOf(o)
                  return (
                    <tr key={o.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{(page - 1) * pageSize + i + 1}</td>
                      <td className="truncate px-4 py-3">
                        <button onClick={() => navigate(`/quan-ly-thong-tin/to-chuc-hncc/${o.id}`)} className="font-medium text-link hover:underline" title={o.ten}>{o.ten}</button>
                      </td>
                      <td className="truncate px-4 py-3 text-foreground-muted">{truongVp}</td>
                      <td className="truncate px-4 py-3 text-foreground-muted" title={`${o.diaChi}, ${o.phuongXa}, ${o.tinhThanh}`}>{o.diaChi}, {o.phuongXa}, {o.tinhThanh}</td>
                      <td className="px-4 py-3"><span className="inline-flex rounded-full px-2 py-0.5 text-[11.5px] font-medium" style={{ background: badge.bg, color: badge.fg }}>{o.trangThai}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          <Button variant="outline" size="sm" onClick={() => navigate(`/quan-ly-thong-tin/to-chuc-hncc/${o.id}`)}><Eye className="size-3.5" /></Button>
                          {canManage && <Button variant="outline" size="sm" onClick={() => navigate(`/quan-ly-thong-tin/to-chuc-hncc/${o.id}/chinh-sua`)}><Pencil className="size-3.5" /></Button>}
                          {canManage && o.trangThai !== "Chấm dứt hoạt động" && <Button variant="outline" size="sm" onClick={() => setTerminating(o)}><XCircle className="size-3.5" /></Button>}
                        </div>
                      </td>
                    </tr>
                  )
                })}</tbody>
              </table>
            </div>
            {total > 10 && <SimplePagination page={page} pageSize={pageSize} total={total} onPage={setPage} />}
          </>
        ) : (
          <EmptyState icon={<Building2 className="size-6" />} title="Không có dữ liệu" desc="Không có tổ chức hành nghề công chứng nào phù hợp với điều kiện tìm kiếm." />
        )}
      </div>
      </>
      )}

      {terminating && (
        <TerminateDialog
          org={terminating}
          actor={CURRENT_ORG_USER[role]}
          onClose={() => setTerminating(null)}
          onDone={() => setTerminating(null)}
        />
      )}
    </div>
  )
}

function ccvNameOf(o: TchnccOrg) {
  if (!o.truongVanPhongId) return "—"
  return ccvOf(o.id).find((c) => c.id === o.truongVanPhongId)?.hoTen ?? "—"
}
