import { useState } from "react"
import { createPortal } from "react-dom"
import { Trash2, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { NOTI_ROLES, roleLabel, type NotiRole } from "../notifications/config"
import {
  NOTI_EVENTS, NOTI_TYPE_SCOPES, activeNotiGroups, activeNotiTypes, createNotiGroup, createNotiType, deleteNotiGroup, deleteNotiType,
  fmtVN, getNotiType, updateNotiGroup, updateNotiType,
  type NotiGroupRecord, type NotiGroupStatus, type NotiTypeRecord, type NotiTypeScope, type NotiTypeStatus,
} from "./config"

function Modal({ title, wide, onClose, footer, children }: { title: string; wide?: boolean; onClose: () => void; footer?: React.ReactNode; children: React.ReactNode }) {
  return createPortal(
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={onClose}>
      <div className={cn("flex max-h-[88vh] w-full flex-col overflow-hidden rounded-xl bg-surface shadow-popover", wide ? "max-w-[680px]" : "max-w-[520px]")} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
          <span className="text-[15px] font-semibold text-foreground-strong">{title}</span>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="size-[18px]" /></Button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-border px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body
  )
}
function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return <div className="flex flex-col gap-0.5 border-b border-neutral-100 py-2"><div className="text-xs text-foreground-muted">{label}</div><div className="text-[13.5px] leading-snug text-foreground">{value || "—"}</div></div>
}
const lbl = "text-xs font-semibold text-foreground-strong"
const inputCls = "h-9 w-full rounded-md border border-input bg-surface px-3 text-sm shadow-xs outline-none focus-visible:border-border-focus focus-visible:ring-[3px] focus-visible:ring-ring/50"

/* ============================ SCR-A.9.2.2-02 — Thêm mới/Cập nhật loại thông báo ============================ */
export function NotiTypeFormDialog({ record, currentUser, onClose }: { record?: NotiTypeRecord; currentUser: string; onClose: () => void }) {
  const showToast = useToast()
  const [tenLoai, setTenLoai] = useState(record?.tenLoai ?? "")
  const [phamVi, setPhamVi] = useState<NotiTypeScope>(record?.phamVi ?? "Toàn hệ thống")
  const [trangThai, setTrangThai] = useState<NotiTypeStatus>(record?.trangThai ?? "Đang sử dụng")
  const [moTa, setMoTa] = useState(record?.moTa ?? "")
  const [error, setError] = useState("")

  const doSave = () => {
    const ten = tenLoai.trim()
    if (!ten) return setError("Tên loại không được để trống.")
    if (ten.length > 250) return setError("Tên loại tối đa 250 ký tự.")
    const dup = activeNotiTypes().some((t) => t.id !== record?.id && t.tenLoai.trim().toLowerCase() === ten.toLowerCase())
    if (dup) return setError("Tên loại thông báo đã tồn tại, vui lòng nhập tên khác.")
    setError("")
    if (record) updateNotiType(record.id, { tenLoai: ten, phamVi, trangThai, moTa: moTa.trim() }, currentUser)
    else createNotiType({ tenLoai: ten, phamVi, trangThai, moTa: moTa.trim() }, currentUser)
    showToast("Lưu loại thông báo thành công.")
    onClose()
  }

  return (
    <Modal title={record ? "Cập nhật loại thông báo" : "Thêm mới loại thông báo"} onClose={onClose} footer={<><Button variant="outline" onClick={onClose}>Hủy</Button><Button onClick={doSave}>Lưu</Button></>}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5"><label className={lbl}>Mã loại</label><input disabled value={record?.maLoai ?? "(Tự sinh khi lưu)"} className={cn(inputCls, "bg-neutral-50 text-foreground-muted")} /></div>
        <div className="flex flex-col gap-1.5"><label className={lbl}>Tên loại <span className="text-red-600">*</span></label><input value={tenLoai} onChange={(e) => setTenLoai(e.target.value)} maxLength={250} className={inputCls} /></div>
        <div className="flex flex-col gap-1.5"><label className={lbl}>Phạm vi áp dụng <span className="text-red-600">*</span></label>
          <NativeSelect value={phamVi} onChange={(e) => setPhamVi(e.target.value as NotiTypeScope)}>{NOTI_TYPE_SCOPES.map((s) => <option key={s} value={s}>{s}</option>)}</NativeSelect>
        </div>
        <div className="flex flex-col gap-1.5"><label className={lbl}>Trạng thái <span className="text-red-600">*</span></label>
          <div className="flex gap-4 text-[13.5px]">
            <label className="flex items-center gap-1.5"><input type="radio" checked={trangThai === "Đang sử dụng"} onChange={() => setTrangThai("Đang sử dụng")} />Đang sử dụng</label>
            <label className="flex items-center gap-1.5"><input type="radio" checked={trangThai === "Ngừng sử dụng"} onChange={() => setTrangThai("Ngừng sử dụng")} />Ngừng sử dụng</label>
          </div>
        </div>
        <div className="flex flex-col gap-1.5"><label className={lbl}>Mô tả</label><textarea value={moTa} onChange={(e) => setMoTa(e.target.value)} maxLength={500} rows={2} className={cn(inputCls, "h-auto py-2")} /></div>
      </div>
      {error && <div className="mt-3 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]">{error}</div>}
    </Modal>
  )
}

/* ============================ SCR-A.9.2.2-03 — Chi tiết loại thông báo ============================ */
export function NotiTypeDetailDialog({ record, onEdit, onClose }: { record: NotiTypeRecord; onEdit: () => void; onClose: () => void }) {
  return (
    <Modal title="Chi tiết loại thông báo" onClose={onClose} footer={<><Button variant="outline" onClick={onEdit}>Sửa</Button><Button onClick={onClose}>Đóng</Button></>}>
      <Field label="Mã loại" value={record.maLoai} />
      <Field label="Tên loại" value={record.tenLoai} />
      <Field label="Phạm vi áp dụng" value={record.phamVi} />
      <Field label="Trạng thái" value={record.trangThai} />
      <Field label="Mô tả" value={record.moTa} />
      <div className="mt-2 grid grid-cols-2 gap-x-6">
        <Field label="Người tạo" value={record.nguoiTao} />
        <Field label="Ngày tạo" value={fmtVN(record.ngayTao.slice(0, 10))} />
        <Field label="Người cập nhật" value={record.nguoiCapNhat} />
        <Field label="Ngày cập nhật" value={record.ngayCapNhat ? fmtVN(record.ngayCapNhat.slice(0, 10)) : undefined} />
      </div>
    </Modal>
  )
}

/* ============================ SCR-A.9.2.2-04 — Xác nhận xóa loại thông báo ============================ */
export function DeleteNotiTypeDialog({ record, onClose }: { record: NotiTypeRecord; onClose: () => void }) {
  const showToast = useToast()
  const doDelete = () => {
    const r = deleteNotiType(record.id)
    if (r.ok) showToast("Xóa loại thông báo thành công.")
    else showToast(r.reason!, "error")
    onClose()
  }
  return (
    <Modal title="Xóa loại thông báo" onClose={onClose} footer={<><Button variant="outline" onClick={onClose}>Hủy</Button><Button variant="destructive" onClick={doDelete}><Trash2 className="size-4" />Xóa</Button></>}>
      <div className="text-[13.5px] text-foreground">Bạn có chắc chắn muốn xóa loại thông báo <span className="font-semibold">{record.maLoai} — {record.tenLoai}</span>?</div>
      <div className="mt-2 text-[12.5px] text-foreground-muted">Nếu loại thông báo đang được sử dụng bởi nhóm thông tin nhận, thao tác xóa sẽ bị từ chối — hãy chuyển trạng thái Ngừng sử dụng thay thế.</div>
    </Modal>
  )
}

/* ============================ SCR-A.9.2.2-06 — Thêm mới/Cập nhật nhóm thông tin nhận thông báo ============================ */
export function NotiGroupFormDialog({ record, currentUser, onClose }: { record?: NotiGroupRecord; currentUser: string; onClose: () => void }) {
  const showToast = useToast()
  const types = activeNotiTypes()
  const [tenNhom, setTenNhom] = useState(record?.tenNhom ?? "")
  const [loaiThongBaoId, setLoaiThongBaoId] = useState(record?.loaiThongBaoId ?? types[0]?.id ?? "")
  const [suKien, setSuKien] = useState<string[]>(record?.suKien ?? [])
  const [doiTuongNhan, setDoiTuongNhan] = useState<NotiRole[]>(record?.doiTuongNhan ?? [])
  const [trangThai, setTrangThai] = useState<NotiGroupStatus>(record?.trangThai ?? "Đang sử dụng")
  const [moTa, setMoTa] = useState(record?.moTa ?? "")
  const [error, setError] = useState("")

  const toggleEvent = (e: string) => setSuKien((prev) => (prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]))
  const toggleRole = (r: NotiRole) => setDoiTuongNhan((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]))

  const doSave = () => {
    const ten = tenNhom.trim()
    if (!ten) return setError("Tên nhóm không được để trống.")
    if (ten.length > 250) return setError("Tên nhóm tối đa 250 ký tự.")
    if (!loaiThongBaoId) return setError("Vui lòng chọn loại thông báo.")
    if (suKien.length === 0) return setError("Vui lòng chọn ít nhất một sự kiện gửi thông báo.")
    if (doiTuongNhan.length === 0) return setError("Vui lòng chọn ít nhất một đối tượng nhận.")
    const dup = activeNotiGroupsExcl(record?.id).some((g) => g.tenNhom.trim().toLowerCase() === ten.toLowerCase())
    if (dup) return setError("Tên nhóm thông tin đã tồn tại, vui lòng nhập tên khác.")
    setError("")
    if (record) updateNotiGroup(record.id, { tenNhom: ten, loaiThongBaoId, suKien, doiTuongNhan, trangThai, moTa: moTa.trim() }, currentUser)
    else createNotiGroup({ tenNhom: ten, loaiThongBaoId, suKien, doiTuongNhan, trangThai, moTa: moTa.trim() }, currentUser)
    showToast("Lưu nhóm thông tin nhận thông báo thành công.")
    onClose()
  }

  return (
    <Modal title={record ? "Cập nhật nhóm thông tin nhận thông báo" : "Thêm mới nhóm thông tin nhận thông báo"} wide onClose={onClose} footer={<><Button variant="outline" onClick={onClose}>Hủy</Button><Button onClick={doSave}>Lưu</Button></>}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5"><label className={lbl}>Mã nhóm</label><input disabled value={record?.maNhom ?? "(Tự sinh khi lưu)"} className={cn(inputCls, "bg-neutral-50 text-foreground-muted")} /></div>
        <div className="flex flex-col gap-1.5"><label className={lbl}>Trạng thái <span className="text-red-600">*</span></label>
          <div className="flex h-9 items-center gap-4 text-[13.5px]">
            <label className="flex items-center gap-1.5"><input type="radio" checked={trangThai === "Đang sử dụng"} onChange={() => setTrangThai("Đang sử dụng")} />Đang sử dụng</label>
            <label className="flex items-center gap-1.5"><input type="radio" checked={trangThai === "Ngừng sử dụng"} onChange={() => setTrangThai("Ngừng sử dụng")} />Ngừng sử dụng</label>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2"><label className={lbl}>Tên nhóm <span className="text-red-600">*</span></label><input value={tenNhom} onChange={(e) => setTenNhom(e.target.value)} maxLength={250} className={inputCls} /></div>
        <div className="flex flex-col gap-1.5 sm:col-span-2"><label className={lbl}>Loại thông báo <span className="text-red-600">*</span></label>
          <NativeSelect value={loaiThongBaoId} onChange={(e) => setLoaiThongBaoId(e.target.value)}>{types.map((t) => <option key={t.id} value={t.id}>{t.tenLoai}</option>)}</NativeSelect>
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className={lbl}>Sự kiện gửi thông báo <span className="text-red-600">*</span></label>
          <div className="flex flex-col gap-1.5">
            {NOTI_EVENTS.map((e) => <label key={e} className="flex items-center gap-1.5 text-[13.5px]"><input type="checkbox" checked={suKien.includes(e)} onChange={() => toggleEvent(e)} />{e}</label>)}
          </div>
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className={lbl}>Đối tượng nhận <span className="text-red-600">*</span></label>
          <div className="flex flex-wrap gap-1.5">
            {NOTI_ROLES.map((r) => (
              <button key={r.key} type="button" onClick={() => toggleRole(r.key)} className={cn("rounded-full border px-2.5 py-1 text-[12.5px]", doiTuongNhan.includes(r.key) ? "border-neutral-900 bg-neutral-900 text-white" : "border-border bg-surface text-foreground-muted hover:bg-surface-muted")}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2"><label className={lbl}>Mô tả</label><textarea value={moTa} onChange={(e) => setMoTa(e.target.value)} maxLength={500} rows={2} className={cn(inputCls, "h-auto py-2")} /></div>
      </div>
      {error && <div className="mt-3 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]">{error}</div>}
    </Modal>
  )
}
function activeNotiGroupsExcl(excludeId?: string) {
  return activeNotiGroups().filter((g) => g.id !== excludeId)
}

/* ============================ SCR-A.9.2.2-07 — Chi tiết nhóm thông tin nhận thông báo ============================ */
export function NotiGroupDetailDialog({ record, onEdit, onClose }: { record: NotiGroupRecord; onEdit: () => void; onClose: () => void }) {
  const type = getNotiType(record.loaiThongBaoId)
  return (
    <Modal title="Chi tiết nhóm thông tin nhận thông báo" wide onClose={onClose} footer={<><Button variant="outline" onClick={onEdit}>Sửa</Button><Button onClick={onClose}>Đóng</Button></>}>
      <Field label="Mã nhóm" value={record.maNhom} />
      <Field label="Tên nhóm" value={record.tenNhom} />
      <Field label="Loại thông báo" value={type ? type.tenLoai + (type.trangThai === "Ngừng sử dụng" ? " (Ngừng sử dụng)" : "") : "—"} />
      <Field label="Sự kiện gửi" value={<ul className="list-disc pl-4">{record.suKien.map((e) => <li key={e}>{e}</li>)}</ul>} />
      <Field label="Đối tượng nhận" value={record.doiTuongNhan.map((r) => roleLabel(r)).join("; ")} />
      <Field label="Trạng thái" value={record.trangThai} />
      <Field label="Mô tả" value={record.moTa} />
      <div className="mt-2 grid grid-cols-2 gap-x-6">
        <Field label="Người tạo" value={record.nguoiTao} />
        <Field label="Ngày tạo" value={fmtVN(record.ngayTao.slice(0, 10))} />
        <Field label="Người cập nhật" value={record.nguoiCapNhat} />
        <Field label="Ngày cập nhật" value={record.ngayCapNhat ? fmtVN(record.ngayCapNhat.slice(0, 10)) : undefined} />
      </div>
    </Modal>
  )
}

/* ============================ SCR-A.9.2.2-08 — Xác nhận xóa nhóm thông tin nhận thông báo ============================ */
export function DeleteNotiGroupDialog({ record, onClose }: { record: NotiGroupRecord; onClose: () => void }) {
  const showToast = useToast()
  const doDelete = () => {
    const r = deleteNotiGroup(record.id)
    if (r.ok) showToast("Xóa nhóm thông tin nhận thông báo thành công.")
    else showToast(r.reason!, "error")
    onClose()
  }
  return (
    <Modal title="Xóa nhóm thông tin nhận thông báo" onClose={onClose} footer={<><Button variant="outline" onClick={onClose}>Hủy</Button><Button variant="destructive" onClick={doDelete}><Trash2 className="size-4" />Xóa</Button></>}>
      <div className="text-[13.5px] text-foreground">Bạn có chắc chắn muốn xóa nhóm thông tin <span className="font-semibold">{record.maNhom} — {record.tenNhom}</span>?</div>
      <div className="mt-2 text-[12.5px] text-foreground-muted">Nếu nhóm đang được dùng cho thông báo tự động, thao tác xóa sẽ bị từ chối — hãy chuyển trạng thái Ngừng sử dụng thay thế.</div>
    </Modal>
  )
}

/* ============================ SCR-A.9.2.2-11 — Xem trước thông báo ============================ */
export function PreviewNotiDialog({ tieuDe, noiDung, tepDinhKem, gioGuiText, onClose }: { tieuDe: string; noiDung: string; tepDinhKem: string[]; gioGuiText: string; onClose: () => void }) {
  const [tab, setTab] = useState<"phan-mem" | "email">("phan-mem")
  return (
    <Modal title="Xem trước thông báo" wide onClose={onClose} footer={<Button onClick={onClose}>Đóng</Button>}>
      <div className="mb-4 flex gap-1 border-b border-border">
        {(["phan-mem", "email"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("-mb-px border-b-4 px-3 py-2 text-[13.5px] outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50", tab === t ? "border-neutral-900 font-semibold text-foreground-strong" : "border-transparent font-medium text-foreground-muted hover:text-foreground")}>
            {t === "phan-mem" ? "Trong phần mềm" : "Email"}
          </button>
        ))}
      </div>
      {tab === "phan-mem" ? (
        <div className="rounded-md border border-border bg-surface p-4 shadow-sm">
          <div className="mb-1 flex items-center gap-1.5 text-[13.5px] font-semibold text-foreground-strong"><span className="size-1.5 rounded-full bg-red-600" />{tieuDe || "(Chưa có tiêu đề)"}</div>
          <div className="whitespace-pre-line text-[13px] text-foreground-muted">{noiDung || "(Chưa có nội dung)"}</div>
        </div>
      ) : (
        <div className="rounded-md border border-border bg-neutral-50 p-4">
          <div className="mb-2 border-b border-border pb-2 text-[12.5px] text-foreground-muted">Kho CSDLCC &lt;no-reply@congchung.gov.vn&gt;</div>
          <div className="mb-2 text-[15px] font-semibold text-foreground-strong">{tieuDe || "(Chưa có tiêu đề)"}</div>
          <div className="whitespace-pre-line text-[13.5px] text-foreground">{noiDung || "(Chưa có nội dung)"}</div>
        </div>
      )}
      {tepDinhKem.length > 0 && (
        <div className="mt-4">
          <div className="mb-1.5 text-xs font-semibold text-foreground-muted">Tệp đính kèm</div>
          <ul className="flex flex-col gap-1 text-[13px] text-foreground">{tepDinhKem.map((f) => <li key={f}>📎 {f}</li>)}</ul>
        </div>
      )}
      <div className="mt-4 text-[12.5px] text-foreground-muted">Thời gian gửi (dự kiến): <span className="font-medium text-foreground">{gioGuiText}</span></div>
    </Modal>
  )
}
