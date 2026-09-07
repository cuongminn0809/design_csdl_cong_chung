import { useMemo, useState } from "react"
import { Ban, Download, Eye, FileSignature, History, KeyRound, Lock, Pencil, Plus, Search, Send, ShieldCheck, Trash2, Unlock } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { setCurrentRole, useCurrentRole } from "@/features/notifications/config"
import { EmptyState, PageHeader, Pagination, Th, inputCls } from "../ingestion/shared"
import { useOrgs } from "../orgManagement/config"
import { CancelDialog, LockDialog, RenewDialog, SignHistoryDialog, SignUsageHistoryDialog, SubmitConfirmDialog, UnlockDialog } from "./dialogs"
import {
  CURRENT_ORG_USER, NOTI_ROLES, ORG_HOME_PROVINCE, SIGN_STATUSES, STATUS_BADGE, STATUS_LABEL, canCancel, canDeleteDraft,
  canEditOrSubmit, canLockUnlock, canRegisterCcv, canRegisterOrg, canRenew, canViewList, canViewUsageHistory, deleteDraft,
  getOrg, isDeptHeadStp, isStaffStp, ownerNameOf, orgNameOf, signsInScope, useSigns, type ChuKySo, type SignRole,
} from "./config"

type Filters = { keyword: string; toChuc: string; tuNgay: string; denNgay: string; trangThai: string }
const EMPTY: Filters = { keyword: "", toChuc: "all", tuNgay: "", denNgay: "", trangThai: "all" }

export function SignListPage() {
  const navigate = useNavigate()
  const showToast = useToast()
  const role = useCurrentRole()
  const [params] = useSearchParams()
  useSigns()
  const allOrgs = useOrgs()
  const hiddenLoaiChuThe = params.get("loaiChuThe")
  const hiddenTuNgayHetHan = params.get("tuNgayHetHan")
  const hiddenDenNgayHetHan = params.get("denNgayHetHan")
  const [draft, setDraft] = useState({ ...EMPTY, trangThai: params.get("trangThai") ?? "all" })
  const [applied, setApplied] = useState({ ...EMPTY, trangThai: params.get("trangThai") ?? "all" })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [dialog, setDialog] = useState<{ type: "renew" | "cancel" | "lock" | "unlock" | "submit" | "history" | "usage"; sign: ChuKySo } | null>(null)

  const scoped = signsInScope(role)
  const orgOptions = useMemo(() => {
    const ids = new Set(scoped.map((s) => (s.loaiChuThe === "TCHNCC" ? s.toChucCongChungId : undefined)).filter(Boolean) as string[])
    return allOrgs.filter((o) => ids.has(o.id) || o.tinhThanh === ORG_HOME_PROVINCE)
  }, [scoped, allOrgs])

  const rows = useMemo(() => {
    let r = scoped
    if (hiddenLoaiChuThe === "TCHNCC" || hiddenLoaiChuThe === "CCV") r = r.filter((s) => s.loaiChuThe === hiddenLoaiChuThe)
    if (hiddenTuNgayHetHan) r = r.filter((s) => s.ngayHetHan >= hiddenTuNgayHetHan)
    if (hiddenDenNgayHetHan) r = r.filter((s) => s.ngayHetHan <= hiddenDenNgayHetHan)
    const kw = applied.keyword.trim().toLowerCase()
    if (kw) r = r.filter((s) => ownerNameOf(s).toLowerCase().includes(kw))
    if (applied.toChuc !== "all") r = r.filter((s) => (s.loaiChuThe === "TCHNCC" ? s.toChucCongChungId === applied.toChuc : orgNameOf(s) === getOrg(applied.toChuc)?.ten))
    if (applied.tuNgay) r = r.filter((s) => s.ngayTao.slice(0, 10) >= applied.tuNgay)
    if (applied.denNgay) r = r.filter((s) => s.ngayTao.slice(0, 10) <= applied.denNgay)
    if (applied.trangThai !== "all") r = r.filter((s) => s.trangThai === applied.trangThai)
    return [...r].sort((a, b) => b.ngayTao.localeCompare(a.ngayTao) || ownerNameOf(a).localeCompare(ownerNameOf(b)))
  }, [scoped, applied, hiddenLoaiChuThe, hiddenTuNgayHetHan, hiddenDenNgayHetHan])

  const doSearch = () => { setApplied(draft); setPage(1) }
  const doReset = () => { setDraft(EMPTY); setApplied(EMPTY); setPage(1) }
  const total = rows.length
  const paged = rows.slice((page - 1) * pageSize, page * pageSize)

  const doOpenFile = (name?: string) => showToast(name ? `Đang mở file ${name}...` : "Không có file thông tin để tải xuống.", name ? "ok" : "error")
  const doDeleteDraft = (s: ChuKySo) => {
    if (!window.confirm("Xác nhận xóa bản nháp đăng ký chữ ký số? Dữ liệu nháp sẽ không hiển thị trên danh sách sau khi xóa.")) return
    const r = deleteDraft(s.id, s.version, CURRENT_ORG_USER[role])
    showToast(r.ok ? "Xóa bản nháp thành công." : r.reason, r.ok ? "ok" : "error")
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Quản lý thông tin đăng ký chữ ký số" desc="Quản lý danh sách đăng ký chữ ký số của tổ chức hành nghề công chứng và công chứng viên."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[12.5px] text-foreground-muted">Vai trò:</span>
            <NativeSelect value={role} onChange={(e) => setCurrentRole(e.target.value as SignRole)} className="h-8 w-[220px] text-[12.5px]">
              {NOTI_ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </NativeSelect>
            {(isDeptHeadStp(role) || isStaffStp(role)) && <Button size="sm" variant="outline" onClick={() => navigate("/ccv-tchncc/thong-tin-chu-ky-so/cho-phe-duyet")}><ShieldCheck className="size-4" />Danh sách chờ phê duyệt</Button>}
            {canRegisterCcv(role) && <Button size="sm" variant="outline" onClick={() => navigate("/ccv-tchncc/thong-tin-chu-ky-so/dang-ky-ccv")}><Plus className="size-4" />Đăng ký CKS của CCV</Button>}
            {canRegisterOrg(role) && <Button size="sm" onClick={() => navigate("/ccv-tchncc/thong-tin-chu-ky-so/dang-ky-tchncc")}><Plus className="size-4" />Đăng ký CKS của TCHNCC</Button>}
          </div>
        } />

      {!canViewList(role) ? (
        <EmptyState icon={<FileSignature className="size-6" />} title="Không có quyền truy cập" desc="Vai trò hiện tại không được gán quyền chức năng quản lý thông tin chữ ký số." />
      ) : (
        <>
          <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-1.5 lg:col-span-2"><label className="text-xs font-semibold text-foreground-strong">Từ khóa</label><input value={draft.keyword} onChange={(e) => setDraft((d) => ({ ...d, keyword: e.target.value.slice(0, 255) }))} placeholder="Tên tổ chức HNCC, CCV..." className={inputCls} onKeyDown={(e) => e.key === "Enter" && doSearch()} /></div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Tổ chức HNCC</label>
                <NativeSelect value={draft.toChuc} onChange={(e) => setDraft((d) => ({ ...d, toChuc: e.target.value }))}><option value="all">Tất cả</option>{orgOptions.map((o) => <option key={o.id} value={o.id}>{o.ten}</option>)}</NativeSelect>
              </div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Trạng thái</label>
                <NativeSelect value={draft.trangThai} onChange={(e) => setDraft((d) => ({ ...d, trangThai: e.target.value }))}><option value="all">Tất cả</option>{SIGN_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</NativeSelect>
              </div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Ngày đăng ký từ</label><input type="date" value={draft.tuNgay} onChange={(e) => setDraft((d) => ({ ...d, tuNgay: e.target.value }))} className={inputCls} /></div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Ngày đăng ký đến</label><input type="date" value={draft.denNgay} onChange={(e) => setDraft((d) => ({ ...d, denNgay: e.target.value }))} className={inputCls} /></div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <Button onClick={doSearch}><Search className="size-4" />Tìm kiếm</Button>
              <Button variant="outline" onClick={doReset}>Đặt lại</Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
            {paged.length ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed border-collapse text-sm">
                    <thead><tr className="border-b border-border bg-neutral-50">
                      <Th className="w-11 text-center">STT</Th>
                      <Th className="w-[16%]">Tổ chức HNCC</Th>
                      <Th className="w-[13%]">Công chứng viên</Th>
                      <Th className="w-[19%]">Thông tin CKS TCHNCC</Th>
                      <Th className="w-[19%]">Thông tin CKS CCV</Th>
                      <Th className="w-[110px]">Trạng thái</Th>
                      <Th className="w-[90px]">File</Th>
                      <Th className="w-[190px] text-right">Thao tác</Th>
                    </tr></thead>
                    <tbody>{paged.map((s, i) => {
                      const badge = STATUS_BADGE[s.trangThai]
                      const isOrgRow = s.loaiChuThe === "TCHNCC"
                      return (
                        <tr key={s.id} className="border-b border-neutral-100 align-top hover:bg-neutral-50">
                          <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{(page - 1) * pageSize + i + 1}</td>
                          <td className="truncate px-4 py-3 text-foreground">{orgNameOf(s) ?? "—"}</td>
                          <td className="truncate px-4 py-3 text-foreground">{isOrgRow ? "-" : ownerNameOf(s)}</td>
                          <td className="px-4 py-3 text-[12.5px] leading-snug text-foreground-muted">{isOrgRow ? (<><div className="font-medium text-foreground">{s.nhaCungCap}</div><div>Serial: {s.soSerial}</div><div>HL: {s.ngayHieuLuc}–{s.ngayHetHan}</div></>) : "-"}</td>
                          <td className="px-4 py-3 text-[12.5px] leading-snug text-foreground-muted">{!isOrgRow ? (<><div className="font-medium text-foreground">{s.nhaCungCap}</div><div>Serial: {s.soSerial}</div><div>HL: {s.ngayHieuLuc}–{s.ngayHetHan}</div></>) : "-"}</td>
                          <td className="px-4 py-3"><span className="inline-flex rounded-full px-2 py-0.5 text-[11.5px] font-medium" style={{ background: badge.bg, color: badge.fg }}>{STATUS_LABEL[s.trangThai]}</span></td>
                          <td className="px-4 py-3">
                            {s.fileDinhKem ? (
                              <button onClick={() => doOpenFile(s.fileDinhKem)} className="text-[12.5px] text-link hover:underline"><Download className="mr-1 inline size-3.5" />Tải file</button>
                            ) : <span className="text-[12.5px] text-foreground-muted">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap justify-end gap-1.5">
                              <Button variant="outline" size="sm" title="Xem thông tin" onClick={() => navigate(`/ccv-tchncc/thong-tin-chu-ky-so/${s.id}`)}><Eye className="size-3.5" /></Button>
                              {canEditOrSubmit(s, role) && <Button variant="outline" size="sm" title="Cập nhật" onClick={() => navigate(`/ccv-tchncc/thong-tin-chu-ky-so/${s.id}/cap-nhat`)}><Pencil className="size-3.5" /></Button>}
                              {canEditOrSubmit(s, role) && <Button variant="outline" size="sm" title="Gửi duyệt" onClick={() => setDialog({ type: "submit", sign: s })}><Send className="size-3.5" /></Button>}
                              {canDeleteDraft(s, role) && <Button variant="outline" size="sm" title="Xóa bản nháp" onClick={() => doDeleteDraft(s)}><Trash2 className="size-3.5" /></Button>}
                              {isDeptHeadStp(role) && s.trangThai === "CHO_DUYET" && <Button variant="outline" size="sm" title="Xem để phê duyệt" onClick={() => navigate("/ccv-tchncc/thong-tin-chu-ky-so/cho-phe-duyet")}><ShieldCheck className="size-3.5" /></Button>}
                              {canRenew(s, role) && <Button variant="outline" size="sm" title="Gia hạn thông tin CKS" onClick={() => setDialog({ type: "renew", sign: s })}><KeyRound className="size-3.5" /></Button>}
                              {canCancel(role) && s.trangThai !== "DA_HUY" && <Button variant="outline" size="sm" title="Hủy đăng ký" onClick={() => setDialog({ type: "cancel", sign: s })}><Ban className="size-3.5" /></Button>}
                              {canLockUnlock(role) && (s.trangThai === "CO_HIEU_LUC" || s.trangThai === "DA_HET_HAN") && <Button variant="outline" size="sm" title="Khóa thông tin CKS" onClick={() => setDialog({ type: "lock", sign: s })}><Lock className="size-3.5" /></Button>}
                              {canLockUnlock(role) && s.trangThai === "DA_KHOA" && <Button variant="outline" size="sm" title="Mở khóa thông tin CKS" onClick={() => setDialog({ type: "unlock", sign: s })}><Unlock className="size-3.5" /></Button>}
                              <Button variant="outline" size="sm" title="Xem lịch sử cập nhật" onClick={() => setDialog({ type: "history", sign: s })}><History className="size-3.5" /></Button>
                              {canViewUsageHistory(role) && <Button variant="outline" size="sm" title="Lịch sử sử dụng CKS" onClick={() => setDialog({ type: "usage", sign: s })}><FileSignature className="size-3.5" /></Button>}
                            </div>
                          </td>
                        </tr>
                      )
                    })}</tbody>
                  </table>
                </div>
                <Pagination page={page} pageSize={pageSize} total={total} unit="bản ghi" onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
              </>
            ) : (
              <EmptyState icon={<FileSignature className="size-6" />} title="Không có dữ liệu" desc="Không có dữ liệu thông tin chữ ký số phù hợp với điều kiện tìm kiếm." />
            )}
          </div>
        </>
      )}

      {dialog?.type === "submit" && <SubmitConfirmDialog sign={dialog.sign} actor={CURRENT_ORG_USER[role]} onClose={() => setDialog(null)} onDone={() => setDialog(null)} />}
      {dialog?.type === "renew" && <RenewDialog sign={dialog.sign} actor={CURRENT_ORG_USER[role]} onClose={() => setDialog(null)} onDone={() => setDialog(null)} />}
      {dialog?.type === "cancel" && <CancelDialog sign={dialog.sign} actor={CURRENT_ORG_USER[role]} onClose={() => setDialog(null)} onDone={() => setDialog(null)} />}
      {dialog?.type === "lock" && <LockDialog sign={dialog.sign} actor={CURRENT_ORG_USER[role]} onClose={() => setDialog(null)} onDone={() => setDialog(null)} />}
      {dialog?.type === "unlock" && <UnlockDialog sign={dialog.sign} actor={CURRENT_ORG_USER[role]} onClose={() => setDialog(null)} onDone={() => setDialog(null)} />}
      {dialog?.type === "history" && <SignHistoryDialog sign={dialog.sign} onClose={() => setDialog(null)} />}
      {dialog?.type === "usage" && <SignUsageHistoryDialog sign={dialog.sign} onClose={() => setDialog(null)} />}
    </div>
  )
}
