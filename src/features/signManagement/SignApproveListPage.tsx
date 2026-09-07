import { useMemo, useState } from "react"
import { CheckCircle2, Eye, Save, ShieldCheck, XCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { setCurrentRole, useCurrentRole } from "@/features/notifications/config"
import { EmptyState, PageHeader, Th, inputCls } from "../ingestion/shared"
import { ApproveDialog, RejectDialog } from "./dialogs"
import {
  CURRENT_ORG_USER, NOTI_ROLES, ORG_HOME_PROVINCE, REQUEST_TYPE_LABEL, fmtVNDateTime, getCcv, getOrg, isDeptHeadStp, isStaffStp,
  isStpRole, ownerNameOf, orgNameOf, saveAssessmentNote, useSigns, type ChuKySo, type SignOwnerType, type SignRequestType, type SignRole,
} from "./config"

function scopeProvinceOf(s: ChuKySo) {
  return s.loaiChuThe === "TCHNCC" ? getOrg(s.toChucCongChungId ?? "")?.tinhThanh : getCcv(s.congChungVienId ?? "")?.soTuPhap
}

type Filters = { keyword: string; loaiChuThe: "all" | SignOwnerType; loaiYeuCau: "all" | SignRequestType; tuNgay: string; denNgay: string }
const EMPTY: Filters = { keyword: "", loaiChuThe: "all", loaiYeuCau: "all", tuNgay: "", denNgay: "" }

export function SignApproveListPage() {
  const navigate = useNavigate()
  const showToast = useToast()
  const role = useCurrentRole()
  const all = useSigns()
  const [draft, setDraft] = useState(EMPTY)
  const [applied, setApplied] = useState(EMPTY)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [dialog, setDialog] = useState<{ type: "approve" | "reject"; sign: ChuKySo } | null>(null)

  const pending = useMemo(() => all.filter((s) => !s.deleted && s.trangThai === "CHO_DUYET" && scopeProvinceOf(s) === ORG_HOME_PROVINCE), [all])

  const rows = useMemo(() => {
    let r = pending
    const kw = applied.keyword.trim().toLowerCase()
    if (kw) r = r.filter((s) => ownerNameOf(s).toLowerCase().includes(kw))
    if (applied.loaiChuThe !== "all") r = r.filter((s) => s.loaiChuThe === applied.loaiChuThe)
    if (applied.loaiYeuCau !== "all") r = r.filter((s) => s.loaiYeuCau === applied.loaiYeuCau)
    if (applied.tuNgay) r = r.filter((s) => (s.ngayGuiDuyet ?? "").slice(0, 10) >= applied.tuNgay)
    if (applied.denNgay) r = r.filter((s) => (s.ngayGuiDuyet ?? "").slice(0, 10) <= applied.denNgay)
    return [...r].sort((a, b) => (a.ngayGuiDuyet ?? "").localeCompare(b.ngayGuiDuyet ?? ""))
  }, [pending, applied])

  const doSearch = () => setApplied(draft)
  const doReset = () => { setDraft(EMPTY); setApplied(EMPTY) }
  const doSaveNote = (s: ChuKySo) => {
    const note = notes[s.id] ?? s.ghiChuThamDinh ?? ""
    const r = saveAssessmentNote(s.id, note, s.version, CURRENT_ORG_USER[role])
    showToast(r.ok ? "Lưu ghi chú thẩm định thành công." : r.reason, r.ok ? "ok" : "error")
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Danh sách chờ phê duyệt" desc="Hồ sơ đăng ký và gia hạn chữ ký số đang chờ Lãnh đạo phòng chuyên môn của STP xử lý."
        actions={
          <div className="flex items-center gap-2.5">
            <span className="text-[12.5px] text-foreground-muted">Vai trò:</span>
            <NativeSelect value={role} onChange={(e) => setCurrentRole(e.target.value as SignRole)} className="h-8 w-[220px] text-[12.5px]">
              {NOTI_ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </NativeSelect>
          </div>
        } />

      {!isStpRole(role) ? (
        <EmptyState icon={<ShieldCheck className="size-6" />} title="Không có quyền truy cập" desc="Vai trò hiện tại không được gán quyền xem danh sách chờ phê duyệt." />
      ) : (
      <>

      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1.5 lg:col-span-2"><label className="text-xs font-semibold text-foreground-strong">Từ khóa</label><input value={draft.keyword} onChange={(e) => setDraft((d) => ({ ...d, keyword: e.target.value }))} placeholder="Tên tổ chức HNCC, CCV..." className={inputCls} onKeyDown={(e) => e.key === "Enter" && doSearch()} /></div>
          <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Loại chủ thể</label>
            <NativeSelect value={draft.loaiChuThe} onChange={(e) => setDraft((d) => ({ ...d, loaiChuThe: e.target.value as Filters["loaiChuThe"] }))}><option value="all">Tất cả</option><option value="TCHNCC">TCHNCC</option><option value="CCV">CCV</option></NativeSelect>
          </div>
          <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Loại yêu cầu</label>
            <NativeSelect value={draft.loaiYeuCau} onChange={(e) => setDraft((d) => ({ ...d, loaiYeuCau: e.target.value as Filters["loaiYeuCau"] }))}><option value="all">Tất cả</option><option value="DANG_KY">Đăng ký mới</option><option value="GIA_HAN">Gia hạn</option></NativeSelect>
          </div>
          <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Ngày gửi từ</label><input type="date" value={draft.tuNgay} onChange={(e) => setDraft((d) => ({ ...d, tuNgay: e.target.value }))} className={inputCls} /></div>
          <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Ngày gửi đến</label><input type="date" value={draft.denNgay} onChange={(e) => setDraft((d) => ({ ...d, denNgay: e.target.value }))} className={inputCls} /></div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2.5">
          <Button onClick={doSearch}>Tìm kiếm</Button>
          <Button variant="outline" onClick={doReset}>Đặt lại</Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead><tr className="border-b border-border bg-neutral-50">
                <Th>Loại chủ thể</Th><Th>Tổ chức HNCC</Th><Th>Công chứng viên</Th><Th>Loại yêu cầu</Th><Th>Nhà cung cấp</Th><Th>Số Serial</Th><Th>Ngày gửi</Th><Th className="w-[220px]">Ghi chú thẩm định</Th><Th className="text-right">Thao tác</Th>
              </tr></thead>
              <tbody>{rows.map((s) => (
                <tr key={s.id} className="border-b border-neutral-100 align-top last:border-0 hover:bg-neutral-50">
                  <td className="px-4 py-3 text-foreground">{s.loaiChuThe === "TCHNCC" ? "TCHNCC" : "CCV"}</td>
                  <td className="px-4 py-3 text-foreground-muted">{orgNameOf(s) ?? "—"}</td>
                  <td className="px-4 py-3 text-foreground-muted">{s.loaiChuThe === "CCV" ? ownerNameOf(s) : "-"}</td>
                  <td className="px-4 py-3 text-foreground-muted">{REQUEST_TYPE_LABEL[s.loaiYeuCau]}</td>
                  <td className="px-4 py-3 text-foreground-muted">{s.nhaCungCap}</td>
                  <td className="px-4 py-3 text-foreground-muted">{s.soSerial}</td>
                  <td className="px-4 py-3 tabular-nums text-foreground-muted">{s.ngayGuiDuyet ? fmtVNDateTime(s.ngayGuiDuyet) : "—"}</td>
                  <td className="px-4 py-3">
                    {isStaffStp(role) ? (
                      <div className="flex flex-col gap-1.5">
                        <textarea value={notes[s.id] ?? s.ghiChuThamDinh ?? ""} onChange={(e) => setNotes((n) => ({ ...n, [s.id]: e.target.value }))} maxLength={1000} rows={2} className={inputCls + " h-auto py-1.5 text-[12.5px]"} />
                        <Button size="sm" variant="outline" onClick={() => doSaveNote(s)}><Save className="size-3.5" />Lưu ghi chú</Button>
                      </div>
                    ) : (s.ghiChuThamDinh || "—")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <Button variant="outline" size="sm" title="Xem" onClick={() => navigate(`/ccv-tchncc/thong-tin-chu-ky-so/${s.id}`)}><Eye className="size-3.5" /></Button>
                      {isDeptHeadStp(role) && <Button variant="outline" size="sm" title="Phê duyệt" onClick={() => setDialog({ type: "approve", sign: s })}><CheckCircle2 className="size-3.5" /></Button>}
                      {isDeptHeadStp(role) && <Button variant="outline" size="sm" title="Từ chối" onClick={() => setDialog({ type: "reject", sign: s })}><XCircle className="size-3.5" /></Button>}
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={<ShieldCheck className="size-6" />} title="Không có dữ liệu" desc="Không có hồ sơ chữ ký số chờ phê duyệt." />
        )}
      </div>
      </>
      )}

      {dialog?.type === "approve" && <ApproveDialog sign={dialog.sign} actor={CURRENT_ORG_USER[role]} onClose={() => setDialog(null)} onDone={() => setDialog(null)} />}
      {dialog?.type === "reject" && <RejectDialog sign={dialog.sign} actor={CURRENT_ORG_USER[role]} onClose={() => setDialog(null)} onDone={() => setDialog(null)} />}
    </div>
  )
}
