import { useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { AlertTriangle, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { useToast } from "@/features/reconciliation/components/Toast"
import { EmptyState, Th, inputCls } from "../ingestion/shared"
import {
  CANCEL_TYPES, HISTORY_ACTIONS, REQUEST_TYPE_LABEL, STATUS_LABEL, approveSign, cancelSign, fmtVN, fmtVNDateTime, lockSign,
  ownerNameOf, rejectSign, submitRenew, submitSign, unlockSign, useSignHistory, usageHistoryOf, type ChuKySo,
} from "./config"

function Modal({ title, wide, onClose, footer, children }: { title: string; wide?: boolean; onClose: () => void; footer?: React.ReactNode; children: React.ReactNode }) {
  return createPortal(
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className={`flex max-h-[85vh] w-full ${wide ? "max-w-[640px]" : "max-w-[480px]"} flex-col rounded-[14px] bg-surface shadow-xl`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h4 className="text-[15px] font-semibold text-foreground-strong">{title}</h4>
          <button onClick={onClose} className="flex size-7 items-center justify-center rounded-md text-foreground-muted hover:bg-surface-muted"><X className="size-4" /></button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-border px-5 py-3.5">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return <div className="flex flex-col gap-0.5 border-b border-neutral-100 py-2.5"><div className="text-xs text-foreground-muted">{label}</div><div className="text-[13.5px] leading-snug text-foreground">{value || "—"}</div></div>
}
const lbl = "text-xs font-semibold text-foreground-strong"

/* ============================ Xác nhận gửi duyệt ============================ */
export function SubmitConfirmDialog({ sign, actor, isRenew, onClose, onDone }: { sign: ChuKySo; actor: string; isRenew?: boolean; onClose: () => void; onDone: () => void }) {
  const showToast = useToast()
  const isOrg = sign.loaiChuThe === "TCHNCC"
  const text = isRenew
    ? (isOrg ? "Xác nhận gửi duyệt thông tin gia hạn chữ ký số của TCHNCC?" : "Xác nhận gửi duyệt thông tin gia hạn chữ ký số của CCV?")
    : (isOrg ? "Xác nhận gửi duyệt đăng ký thông tin chữ ký số của TCHNCC?" : "Xác nhận gửi duyệt đăng ký thông tin chữ ký số của CCV?")
  const doConfirm = () => {
    const r = submitSign(sign.id, sign.version, actor)
    if (!r.ok) { showToast(r.reason, "error"); return }
    showToast("Gửi duyệt thành công.")
    onDone()
  }
  return (
    <Modal title="Xác nhận gửi duyệt" onClose={onClose} footer={<><Button variant="outline" onClick={onClose}>Hủy</Button><Button onClick={doConfirm}>Xác nhận</Button></>}>
      <p className="text-[13.5px] text-foreground">{text}</p>
      <p className="mt-3 text-[12.5px] text-foreground-muted">Chuyên viên Sở Tư pháp thẩm định; Lãnh đạo phòng chuyên môn của STP phê duyệt.</p>
    </Modal>
  )
}

/* ============================ Phê duyệt ============================ */
export function ApproveDialog({ sign, actor, onClose, onDone }: { sign: ChuKySo; actor: string; onClose: () => void; onDone: () => void }) {
  const showToast = useToast()
  const [note, setNote] = useState("")
  const [error, setError] = useState("")
  const isOrg = sign.loaiChuThe === "TCHNCC"
  const doConfirm = () => {
    const r = approveSign(sign.id, note, sign.version, actor)
    if (!r.ok) return setError(r.reason)
    showToast("Phê duyệt thông tin chữ ký số thành công.")
    onDone()
  }
  return (
    <Modal title="Xác nhận phê duyệt" onClose={onClose} footer={<><Button variant="outline" onClick={onClose}>Hủy</Button><Button onClick={doConfirm}>Phê duyệt</Button></>}>
      <p className="mb-3 text-[13.5px] font-medium text-foreground">Xác nhận phê duyệt thông tin chữ ký số của {isOrg ? "TCHNCC" : "CCV"}?</p>
      <Field label="Chủ thể" value={ownerNameOf(sign)} />
      <Field label="Loại yêu cầu" value={REQUEST_TYPE_LABEL[sign.loaiYeuCau]} />
      <Field label="Nhà cung cấp" value={sign.nhaCungCap} />
      <Field label="Số Serial" value={sign.soSerial} />
      <Field label="Ghi chú thẩm định" value={sign.ghiChuThamDinh} />
      <div className="flex flex-col gap-1.5 pt-2.5"><label className={lbl}>Thông tin phê duyệt <span className="text-red-600">*</span></label><textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} rows={3} className={inputCls + " h-auto py-2"} /></div>
      {error && <div className="mt-3 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]">{error}</div>}
    </Modal>
  )
}

/* ============================ Từ chối ============================ */
export function RejectDialog({ sign, actor, onClose, onDone }: { sign: ChuKySo; actor: string; onClose: () => void; onDone: () => void }) {
  const showToast = useToast()
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")
  const doConfirm = () => {
    const r = rejectSign(sign.id, reason, sign.version, actor)
    if (!r.ok) return setError(r.reason)
    showToast("Từ chối thông tin chữ ký số thành công.")
    onDone()
  }
  return (
    <Modal title="Xác nhận từ chối" onClose={onClose} footer={<><Button variant="outline" onClick={onClose}>Hủy</Button><Button variant="destructive" onClick={doConfirm}>Từ chối</Button></>}>
      <Field label="Chủ thể" value={ownerNameOf(sign)} />
      <Field label="Loại yêu cầu" value={REQUEST_TYPE_LABEL[sign.loaiYeuCau]} />
      <Field label="Số Serial" value={sign.soSerial} />
      <div className="flex flex-col gap-1.5 pt-2.5"><label className={lbl}>Lý do từ chối <span className="text-red-600">*</span></label><textarea value={reason} onChange={(e) => setReason(e.target.value)} maxLength={1000} rows={3} className={inputCls + " h-auto py-2"} /></div>
      {error && <div className="mt-3 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]">{error}</div>}
    </Modal>
  )
}

/* ============================ Gia hạn ============================ */
export function RenewDialog({ sign, actor, onClose, onDone }: { sign: ChuKySo; actor: string; onClose: () => void; onDone: () => void }) {
  const showToast = useToast()
  const [ngayHieuLucMoi, setNgayHieuLucMoi] = useState("")
  const [ngayHetHanMoi, setNgayHetHanMoi] = useState("")
  const [ghiChu, setGhiChu] = useState("")
  const [error, setError] = useState("")
  const doSubmit = () => {
    const r = submitRenew(sign.id, { ngayHieuLucMoi, ngayHetHanMoi, ghiChu }, sign.version, actor)
    if (!r.ok) return setError(r.reason)
    showToast("Gửi duyệt thành công.")
    onDone()
  }
  return (
    <Modal title="Gia hạn thông tin chữ ký số" onClose={onClose} footer={<><Button variant="outline" onClick={onClose}>Hủy</Button><Button onClick={doSubmit}>Trình duyệt gia hạn</Button></>}>
      <Field label="Chủ thể" value={ownerNameOf(sign)} />
      <Field label="Nhà cung cấp" value={sign.nhaCungCap} />
      <Field label="Số Serial" value={sign.soSerial} />
      <Field label="Thời hạn hiện tại" value={`${fmtVN(sign.ngayHieuLuc)} — ${fmtVN(sign.ngayHetHan)}`} />
      <div className="grid grid-cols-2 gap-3 pt-2.5">
        <div className="flex flex-col gap-1.5"><label className={lbl}>Ngày hiệu lực mới <span className="text-red-600">*</span></label><input type="date" value={ngayHieuLucMoi} onChange={(e) => setNgayHieuLucMoi(e.target.value)} className={inputCls} /></div>
        <div className="flex flex-col gap-1.5"><label className={lbl}>Ngày hết hạn mới <span className="text-red-600">*</span></label><input type="date" value={ngayHetHanMoi} onChange={(e) => setNgayHetHanMoi(e.target.value)} className={inputCls} /></div>
      </div>
      <div className="flex flex-col gap-1.5 pt-2.5"><label className={lbl}>Ghi chú</label><textarea value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} maxLength={1000} rows={2} className={inputCls + " h-auto py-2"} /></div>
      {error && <div className="mt-3 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]">{error}</div>}
    </Modal>
  )
}

/* ============================ Hủy đăng ký ============================ */
export function CancelDialog({ sign, actor, onClose, onDone }: { sign: ChuKySo; actor: string; onClose: () => void; onDone: () => void }) {
  const showToast = useToast()
  const [loaiHuy, setLoaiHuy] = useState<"" | "VI_PHAM" | "HET_HIEU_LUC">("")
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")
  const doConfirm = () => {
    if (!loaiHuy) return setError("Vui lòng chọn loại huỷ.")
    const r = cancelSign(sign.id, loaiHuy, reason, undefined, sign.version, actor)
    if (!r.ok) return setError(r.reason)
    showToast("Hủy đăng ký chữ ký số thành công.")
    onDone()
  }
  return (
    <Modal title="Hủy đăng ký chữ ký số" onClose={onClose} footer={<><Button variant="outline" onClick={onClose}>Hủy</Button><Button variant="destructive" onClick={doConfirm}>Xác nhận hủy</Button></>}>
      <div className="mb-3 flex items-start gap-2.5 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2.5 text-[12.5px] text-[#991b1b]">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <span>Chữ ký số sau khi hủy sẽ không thể sử dụng để ký số và không thể khôi phục.</span>
      </div>
      <Field label="Chủ thể" value={ownerNameOf(sign)} />
      <Field label="Nhà cung cấp" value={sign.nhaCungCap} />
      <Field label="Số Serial" value={sign.soSerial} />
      <div className="flex flex-col gap-1.5 pt-2.5"><label className={lbl}>Loại hủy <span className="text-red-600">*</span></label>
        <NativeSelect value={loaiHuy} onChange={(e) => setLoaiHuy(e.target.value as typeof loaiHuy)}>
          <option value="">— Chọn —</option>{CANCEL_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-1.5 pt-2.5"><label className={lbl}>Lý do hủy <span className="text-red-600">*</span></label><textarea value={reason} onChange={(e) => setReason(e.target.value)} maxLength={1000} rows={3} className={inputCls + " h-auto py-2"} /></div>
      {error && <div className="mt-3 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]">{error}</div>}
    </Modal>
  )
}

/* ============================ Khóa ============================ */
export function LockDialog({ sign, actor, onClose, onDone }: { sign: ChuKySo; actor: string; onClose: () => void; onDone: () => void }) {
  const showToast = useToast()
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")
  const doConfirm = () => {
    const r = lockSign(sign.id, reason, undefined, sign.version, actor)
    if (!r.ok) return setError(r.reason)
    showToast("Tạm khóa chữ ký số thành công.")
    onDone()
  }
  return (
    <Modal title="Tạm khóa chữ ký số" onClose={onClose} footer={<><Button variant="outline" onClick={onClose}>Hủy</Button><Button variant="destructive" onClick={doConfirm}>Xác nhận khóa</Button></>}>
      <Field label="Chủ thể" value={ownerNameOf(sign)} />
      <Field label="Nhà cung cấp" value={sign.nhaCungCap} />
      <Field label="Số Serial" value={sign.soSerial} />
      <div className="flex flex-col gap-1.5 pt-2.5"><label className={lbl}>Lý do khóa <span className="text-red-600">*</span></label><textarea value={reason} onChange={(e) => setReason(e.target.value)} maxLength={1000} rows={3} className={inputCls + " h-auto py-2"} /></div>
      {error && <div className="mt-3 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]">{error}</div>}
    </Modal>
  )
}

/* ============================ Lịch sử cập nhật (UC426) ============================ */
export function SignHistoryDialog({ sign, onClose }: { sign: ChuKySo; onClose: () => void }) {
  const all = useSignHistory()
  const [thaoTac, setThaoTac] = useState("all")
  const rows = useMemo(() => {
    let r = all.filter((h) => h.chuKySoId === sign.id)
    if (thaoTac !== "all") r = r.filter((h) => h.thaoTac === thaoTac)
    return [...r].sort((a, b) => b.thoiGian.localeCompare(a.thoiGian))
  }, [all, thaoTac, sign.id])
  return (
    <Modal title={`Lịch sử cập nhật — ${ownerNameOf(sign)}`} wide onClose={onClose} footer={<Button variant="outline" onClick={onClose}>Đóng</Button>}>
      <div className="mb-3 flex items-center gap-2">
        <label className="text-xs font-semibold text-foreground-strong">Loại cập nhật</label>
        <NativeSelect value={thaoTac} onChange={(e) => setThaoTac(e.target.value)} className="h-8 w-[220px] text-[12.5px]">
          <option value="all">Tất cả</option>{HISTORY_ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
        </NativeSelect>
      </div>
      {rows.length === 0 ? (
        <EmptyState icon={<AlertTriangle className="size-6" />} title="Không có dữ liệu" desc="Không có lịch sử cập nhật thông tin chữ ký số." />
      ) : (
        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full border-collapse text-sm">
            <thead><tr className="border-b border-border bg-neutral-50"><Th>Thời gian</Th><Th>Loại cập nhật</Th><Th>Người cập nhật</Th><Th>Nội dung</Th></tr></thead>
            <tbody>{rows.map((h) => (
              <tr key={h.id} className="border-b border-neutral-100 last:border-0">
                <td className="whitespace-nowrap px-4 py-2.5 tabular-nums text-foreground-muted">{fmtVNDateTime(h.thoiGian)}</td>
                <td className="px-4 py-2.5 text-foreground">{h.thaoTac}</td>
                <td className="px-4 py-2.5 text-foreground-muted">{h.nguoiThucHien}</td>
                <td className="px-4 py-2.5 text-foreground-muted">{h.noiDung}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </Modal>
  )
}

/* ============================ Lịch sử sử dụng CKS (UC436, chỉ Quản trị hệ thống) ============================ */
export function SignUsageHistoryDialog({ sign, onClose }: { sign: ChuKySo; onClose: () => void }) {
  const rows = usageHistoryOf(sign.id)
  return (
    <Modal title={`Lịch sử sử dụng CKS — ${ownerNameOf(sign)}`} wide onClose={onClose} footer={<Button variant="outline" onClick={onClose}>Đóng</Button>}>
      {rows.length === 0 ? (
        <EmptyState icon={<AlertTriangle className="size-6" />} title="Không có dữ liệu" desc="Không có lịch sử sử dụng chữ ký số." />
      ) : (
        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full border-collapse text-sm">
            <thead><tr className="border-b border-border bg-neutral-50"><Th>Thời gian sử dụng</Th><Th>Số hồ sơ công chứng</Th><Th>Loại sử dụng</Th><Th>Người sử dụng</Th></tr></thead>
            <tbody>{rows.map((u) => (
              <tr key={u.id} className="border-b border-neutral-100 last:border-0">
                <td className="whitespace-nowrap px-4 py-2.5 tabular-nums text-foreground-muted">{fmtVNDateTime(u.thoiGian)}</td>
                <td className="px-4 py-2.5 font-medium text-foreground">{u.soHoSo}</td>
                <td className="px-4 py-2.5 text-foreground-muted">{u.loaiSuDung}</td>
                <td className="px-4 py-2.5 text-foreground-muted">{u.nguoiSuDung}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </Modal>
  )
}

/* ============================ Xuất báo cáo ============================ */
export function ExportReportDialog({ tenBaoCao, dieuKien, count, onClose }: { tenBaoCao: string; dieuKien: string; count: number; onClose: () => void }) {
  const showToast = useToast()
  const doExport = () => {
    if (count === 0) { showToast("Không có dữ liệu để xuất.", "error"); return }
    showToast("Xuất dữ liệu thành công.")
    onClose()
  }
  return (
    <Modal title="Xuất báo cáo chữ ký số" onClose={onClose} footer={<><Button variant="outline" onClick={onClose}>Hủy</Button><Button onClick={doExport}>Xác nhận xuất</Button></>}>
      <Field label="Tên báo cáo" value={tenBaoCao} />
      <Field label="Điều kiện áp dụng" value={dieuKien} />
      <Field label="Số dòng dự kiến" value={String(count)} />
      <div className="flex flex-col gap-1.5 pt-2.5"><label className={lbl}>Định dạng xuất</label>
        <div className="flex items-center gap-2 text-[13.5px] text-foreground"><input type="radio" checked readOnly className="size-4" />Excel (.xlsx)</div>
      </div>
    </Modal>
  )
}

/* ============================ Mở khóa ============================ */
export function UnlockDialog({ sign, actor, onClose, onDone }: { sign: ChuKySo; actor: string; onClose: () => void; onDone: () => void }) {
  const showToast = useToast()
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")
  const doConfirm = () => {
    const r = unlockSign(sign.id, reason, sign.version, actor)
    if (!r.ok) return setError(r.reason)
    showToast("Mở khóa chữ ký số thành công.")
    onDone()
  }
  return (
    <Modal title="Mở khóa chữ ký số" onClose={onClose} footer={<><Button variant="outline" onClick={onClose}>Hủy</Button><Button onClick={doConfirm}>Xác nhận mở khóa</Button></>}>
      <Field label="Chủ thể" value={ownerNameOf(sign)} />
      <Field label="Nhà cung cấp" value={sign.nhaCungCap} />
      <Field label="Số Serial" value={sign.soSerial} />
      <Field label="Trạng thái trước khi khóa" value={sign.trangThaiTruocKhiKhoa ? STATUS_LABEL[sign.trangThaiTruocKhiKhoa] : undefined} />
      <div className="flex flex-col gap-1.5 pt-2.5"><label className={lbl}>Lý do mở khóa <span className="text-red-600">*</span></label><textarea value={reason} onChange={(e) => setReason(e.target.value)} maxLength={1000} rows={3} className={inputCls + " h-auto py-2"} /></div>
      {error && <div className="mt-3 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]">{error}</div>}
    </Modal>
  )
}
