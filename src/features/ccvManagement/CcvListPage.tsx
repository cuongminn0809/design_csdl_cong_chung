import { useMemo, useState } from "react"
import { Download, Eye, History, Pencil, Plus, Search, UserRound, XCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { EmptyState, PageHeader, Th, inputCls } from "../ingestion/shared"
import { SimplePagination } from "../orgManagement/shared"
import { CcvStatusChangeDialog } from "./dialogs"
import { setCurrentRole, useCurrentRole } from "@/features/notifications/config"
import {
  CCV_STATUS_OPTIONS, CURRENT_ORG_USER, NOTI_ROLES, canExportCcv, canManageCcv, canViewCcv, canViewHistory,
  ccvStatusMeta, ccvsInScope, orgAddressOf, orgNameOf, useCcvs, useOrgs, type Ccv, type CcvRole,
} from "./config"

type Filters = { hoTen: string; soThe: string; toChuc: string; diaChi: string; trangThai: string }
const EMPTY: Filters = { hoTen: "", soThe: "", toChuc: "", diaChi: "", trangThai: "all" }

export function CcvListPage() {
  const navigate = useNavigate()
  const showToast = useToast()
  const role = useCurrentRole()
  useCcvs()
  useOrgs()
  const [draft, setDraft] = useState(EMPTY)
  const [applied, setApplied] = useState(EMPTY)
  const [page, setPage] = useState(1)
  const [changingStatus, setChangingStatus] = useState<Ccv | null>(null)

  const scoped = ccvsInScope(role)
  const rows = useMemo(() => {
    let r = scoped
    const kwTen = applied.hoTen.trim().toLowerCase()
    if (kwTen) r = r.filter((c) => c.hoTen.toLowerCase().includes(kwTen))
    const kwThe = applied.soThe.trim().toLowerCase()
    if (kwThe) r = r.filter((c) => (c.soThe ?? "").toLowerCase().includes(kwThe))
    const kwOrg = applied.toChuc.trim().toLowerCase()
    if (kwOrg) {
      if (kwOrg === "__none__") r = r.filter((c) => !c.toChucCongChungId)
      else r = r.filter((c) => (orgNameOf(c.toChucCongChungId) ?? "").toLowerCase().includes(kwOrg))
    }
    const kwDc = applied.diaChi.trim().toLowerCase()
    if (kwDc) r = r.filter((c) => (orgAddressOf(c.toChucCongChungId) ?? "").toLowerCase().includes(kwDc))
    if (applied.trangThai !== "all") r = r.filter((c) => c.trangThai === applied.trangThai)
    return [...r].sort((a, b) => b.ngayTao.localeCompare(a.ngayTao))
  }, [scoped, applied])

  const doSearch = () => { setApplied(draft); setPage(1) }
  const doReset = () => { setDraft(EMPTY); setApplied(EMPTY); setPage(1) }
  const doExport = () => showToast(rows.length ? "Xuất danh sách công chứng viên thành công." : "Không có dữ liệu Công chứng viên.", rows.length ? "ok" : "error")

  const pageSize = 10
  const total = rows.length
  const paged = rows.slice((page - 1) * pageSize, page * pageSize)
  const canManage = canManageCcv(role)

  return (
    <div className="space-y-4">
      <PageHeader title="Quản lý thông tin CCV" desc="Quản lý danh sách công chứng viên theo phạm vi được phân quyền."
        actions={
          <div className="flex items-center gap-2.5">
            <span className="text-[12.5px] text-foreground-muted">Vai trò:</span>
            <NativeSelect value={role} onChange={(e) => setCurrentRole(e.target.value as CcvRole)} className="h-8 w-[220px] text-[12.5px]">
              {NOTI_ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </NativeSelect>
            {canManage && <Button size="sm" className="ml-1.5" onClick={() => navigate("/quan-ly-thong-tin/cong-chung-vien/them-moi")}><Plus className="size-4" />Thêm mới</Button>}
          </div>
        } />

      {!canViewCcv(role) ? (
        <EmptyState icon={<UserRound className="size-6" />} title="Không có quyền truy cập" desc="Vai trò hiện tại không được gán quyền chức năng quản lý thông tin công chứng viên." />
      ) : (
        <>
          <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Họ và tên</label><input value={draft.hoTen} onChange={(e) => setDraft((d) => ({ ...d, hoTen: e.target.value.slice(0, 250) }))} placeholder="Nhập họ tên…" className={inputCls} onKeyDown={(e) => e.key === "Enter" && doSearch()} /></div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Số thẻ</label><input value={draft.soThe} onChange={(e) => setDraft((d) => ({ ...d, soThe: e.target.value.slice(0, 50) }))} placeholder="Nhập số thẻ…" className={inputCls} onKeyDown={(e) => e.key === "Enter" && doSearch()} /></div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Tổ chức công chứng</label>
                <NativeSelect value={draft.toChuc} onChange={(e) => setDraft((d) => ({ ...d, toChuc: e.target.value }))}>
                  <option value="">Tất cả</option>
                  <option value="__none__">Chưa gắn TCHNCC</option>
                </NativeSelect>
              </div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Địa chỉ trụ sở</label><input value={draft.diaChi} onChange={(e) => setDraft((d) => ({ ...d, diaChi: e.target.value.slice(0, 500) }))} placeholder="Nhập địa chỉ…" className={inputCls} onKeyDown={(e) => e.key === "Enter" && doSearch()} /></div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Trạng thái</label>
                <NativeSelect value={draft.trangThai} onChange={(e) => setDraft((d) => ({ ...d, trangThai: e.target.value }))}><option value="all">Tất cả</option>{CCV_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}</NativeSelect>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <Button onClick={doSearch}><Search className="size-4" />Tìm kiếm</Button>
              <Button variant="outline" onClick={doReset}>Reset</Button>
              {canExportCcv(role) && <Button variant="outline" onClick={doExport}><Download className="size-4" />Xuất Excel</Button>}
            </div>
          </div>

          <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
            {paged.length ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed border-collapse text-sm">
                    <thead><tr className="border-b border-border bg-neutral-50">
                      <Th className="w-11 text-center">STT</Th>
                      <Th className="w-[18%]">Họ và tên</Th>
                      <Th className="w-[11%]">Số thẻ</Th>
                      <Th className="w-[20%]">Tổ chức công chứng</Th>
                      <Th className="w-[14%]">Sở tư pháp</Th>
                      <Th className="w-[21%]">Địa chỉ trụ sở</Th>
                      <Th className="w-[140px]">Trạng thái</Th>
                      <Th className="w-[160px] text-right">Hành động</Th>
                    </tr></thead>
                    <tbody>{paged.map((c, i) => {
                      const badge = ccvStatusMeta(c.trangThai)
                      const orgTen = orgNameOf(c.toChucCongChungId)
                      return (
                        <tr key={c.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                          <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{(page - 1) * pageSize + i + 1}</td>
                          <td className="truncate px-4 py-3">
                            <button onClick={() => navigate(`/quan-ly-thong-tin/cong-chung-vien/${c.id}`)} className="font-medium text-link hover:underline" title={c.hoTen}>{c.hoTen}</button>
                          </td>
                          <td className="truncate px-4 py-3 text-foreground-muted">{c.soThe || "—"}</td>
                          <td className="truncate px-4 py-3 text-foreground-muted" title={orgTen ?? undefined}>{orgTen ?? "Chưa gắn TCHNCC"}</td>
                          <td className="truncate px-4 py-3 text-foreground-muted">{c.soTuPhap}</td>
                          <td className="truncate px-4 py-3 text-foreground-muted" title={orgAddressOf(c.toChucCongChungId) ?? undefined}>{orgAddressOf(c.toChucCongChungId) ?? "—"}</td>
                          <td className="px-4 py-3"><span className="inline-flex rounded-full px-2 py-0.5 text-[11.5px] font-medium" style={{ background: badge.bg, color: badge.fg }}>{c.trangThai}</span></td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1.5">
                              <Button variant="outline" size="sm" onClick={() => navigate(`/quan-ly-thong-tin/cong-chung-vien/${c.id}`)}><Eye className="size-3.5" /></Button>
                              {canManage && <Button variant="outline" size="sm" onClick={() => navigate(`/quan-ly-thong-tin/cong-chung-vien/${c.id}/chinh-sua`)}><Pencil className="size-3.5" /></Button>}
                              {canManage && c.trangThai !== "Thu hồi thẻ" && <Button variant="outline" size="sm" onClick={() => setChangingStatus(c)}><XCircle className="size-3.5" /></Button>}
                              {canViewHistory(role) && <Button variant="outline" size="sm" onClick={() => navigate(`/quan-ly-thong-tin/cong-chung-vien/lich-su-cap-nhat?ccv=${c.id}`)}><History className="size-3.5" /></Button>}
                            </div>
                          </td>
                        </tr>
                      )
                    })}</tbody>
                  </table>
                </div>
                {total > pageSize && <SimplePagination page={page} pageSize={pageSize} total={total} onPage={setPage} />}
              </>
            ) : (
              <EmptyState icon={<UserRound className="size-6" />} title="Không có dữ liệu" desc="Không có dữ liệu Công chứng viên phù hợp với điều kiện tìm kiếm." />
            )}
          </div>
        </>
      )}

      {changingStatus && (
        <CcvStatusChangeDialog
          ccv={changingStatus}
          actor={CURRENT_ORG_USER[role]}
          onClose={() => setChangingStatus(null)}
          onDone={() => setChangingStatus(null)}
        />
      )}
    </div>
  )
}
