import { useState } from "react"
import { ArrowLeft, Save } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { useCurrentRole } from "@/features/notifications/config"
import {
  CURRENT_ORG_USER, ORG_HOME_PROVINCE, ORG_STATUSES, ORG_TYPES, canManageOrg, createOrg, getOrg, recordCreateHistory,
  recordUpdateHistory, updateOrg, wardsOf, type OrgStatus, type OrgType,
} from "./config"

const isOrgInHomeScope = (tinhThanh: string) => tinhThanh === ORG_HOME_PROVINCE

const inputCls = "h-9 w-full rounded-md border border-input bg-surface px-3 text-sm shadow-xs outline-none focus-visible:border-border-focus focus-visible:ring-[3px] focus-visible:ring-ring/50"
const lbl = "text-xs font-semibold text-foreground-strong"
const PHONE_RE = /^0\d{9}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/

export function OrgFormPage({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const showToast = useToast()
  const role = useCurrentRole()
  const found = mode === "edit" && id ? getOrg(id) : undefined
  const src = found && isOrgInHomeScope(found.tinhThanh) ? found : undefined

  const [ten, setTen] = useState(src?.ten ?? "")
  const [loaiHinh, setLoaiHinh] = useState<OrgType>(src?.loaiHinh ?? "Văn phòng công chứng")
  const [diaChi, setDiaChi] = useState(src?.diaChi ?? "")
  const tinhThanh = src?.tinhThanh ?? ORG_HOME_PROVINCE
  const [phuongXa, setPhuongXa] = useState(src?.phuongXa ?? "")
  const [sdt, setSdt] = useState(src?.sdt ?? "")
  const [email, setEmail] = useState(src?.email ?? "")
  const [mst, setMst] = useState(src?.mst ?? "")
  const [trangThai, setTrangThai] = useState<OrgStatus>(src?.trangThai ?? "Đang hoạt động")
  const [error, setError] = useState("")

  const canManage = canManageOrg(role)
  const dirty = mode === "create"
    ? !!(ten || diaChi || phuongXa || sdt || email || mst)
    : !!src && (ten !== src.ten || loaiHinh !== src.loaiHinh || diaChi !== src.diaChi || tinhThanh !== src.tinhThanh || phuongXa !== src.phuongXa || (sdt ?? "") !== (src.sdt ?? "") || (email ?? "") !== (src.email ?? "") || (mst ?? "") !== (src.mst ?? "") || trangThai !== src.trangThai)

  const doCancel = () => {
    if (dirty && !window.confirm(mode === "create" ? "Dữ liệu đã nhập chưa được lưu. Bạn có chắc chắn muốn hủy thao tác?" : "Dữ liệu đã thay đổi chưa được lưu. Bạn có chắc chắn muốn hủy thao tác?")) return
    navigate("/quan-ly-thong-tin/to-chuc-hncc")
  }

  const validate = (): string | null => {
    if (!ten.trim()) return "Tên tổ chức công chứng là bắt buộc và không được vượt quá 250 ký tự."
    if (ten.trim().length > 250) return "Tên tổ chức công chứng là bắt buộc và không được vượt quá 250 ký tự."
    if (!loaiHinh || !diaChi.trim() || !tinhThanh || !phuongXa || !trangThai) return "Vui lòng nhập đầy đủ thông tin bắt buộc."
    if (sdt.trim() && !PHONE_RE.test(sdt.trim())) return "Số điện thoại không hợp lệ."
    if (email.trim() && !EMAIL_RE.test(email.trim())) return "Email không hợp lệ."
    return null
  }

  const doSave = () => {
    const err = validate()
    if (err) return setError(err)
    setError("")
    const actor = CURRENT_ORG_USER[role]
    const payload = { ten: ten.trim(), loaiHinh, diaChi: diaChi.trim(), tinhThanh, phuongXa, sdt: sdt.trim() || undefined, email: email.trim() || undefined, mst: mst.trim() || undefined, trangThai }

    if (mode === "create") {
      const r = createOrg({ ...payload, soTuPhap: ORG_HOME_PROVINCE }, actor)
      if (!r.ok) return setError(r.reason)
      recordCreateHistory(r.org, actor)
      showToast("Thêm mới tổ chức công chứng thành công.")
      navigate(`/quan-ly-thong-tin/to-chuc-hncc/${r.org.id}`)
    } else if (src) {
      const r = updateOrg(src.id, payload, src.version, actor)
      if (!r.ok) return setError(r.reason)
      recordUpdateHistory(src, r.org, actor)
      showToast("Cập nhật tổ chức công chứng thành công.")
      navigate(`/quan-ly-thong-tin/to-chuc-hncc/${src.id}`)
    }
  }

  if (mode === "edit" && !src) {
    return (
      <div className="rounded-[14px] border border-border bg-surface p-10 text-center shadow-sm">
        <div className="text-[15px] font-semibold text-foreground-strong">Không tìm thấy tổ chức công chứng hoặc bạn không có quyền chỉnh sửa.</div>
        <Button className="mt-4" variant="outline" onClick={() => navigate("/quan-ly-thong-tin/to-chuc-hncc")}><ArrowLeft className="size-4" />Quay lại</Button>
      </div>
    )
  }
  if (!canManage) {
    return (
      <div className="rounded-[14px] border border-border bg-surface p-10 text-center shadow-sm">
        <div className="text-[15px] font-semibold text-foreground-strong">Không có quyền truy cập chức năng này.</div>
        <Button className="mt-4" variant="outline" onClick={() => navigate("/quan-ly-thong-tin/to-chuc-hncc")}><ArrowLeft className="size-4" />Quay lại</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <button onClick={doCancel} className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-foreground-muted shadow-xs hover:bg-surface-muted"><ArrowLeft className="size-4" /></button>
        <div>
          <h3 className="text-[24px] font-semibold leading-tight tracking-[-0.02em] text-foreground-strong">{mode === "create" ? "Thêm mới tổ chức hành nghề công chứng" : `Chỉnh sửa: ${src?.ten}`}</h3>
          <p className="mt-1.5 text-sm text-foreground-muted">Nhập đầy đủ thông tin bắt buộc trước khi lưu.</p>
        </div>
      </div>

      <div className="rounded-[14px] border border-border bg-surface p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2"><label className={lbl}>Tên tổ chức công chứng <span className="text-red-600">*</span></label><input value={ten} onChange={(e) => setTen(e.target.value)} maxLength={250} className={inputCls} /></div>
          <div className="flex flex-col gap-1.5"><label className={lbl}>Loại tổ chức <span className="text-red-600">*</span></label>
            <NativeSelect value={loaiHinh} onChange={(e) => setLoaiHinh(e.target.value as OrgType)}>{ORG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</NativeSelect>
          </div>
          <div className="flex flex-col gap-1.5"><label className={lbl}>Sở Tư pháp</label><input disabled value={mode === "create" ? ORG_HOME_PROVINCE : src?.soTuPhap} className={cn(inputCls, "bg-neutral-50 text-foreground-muted")} /></div>
          <div className="flex flex-col gap-1.5 sm:col-span-2"><label className={lbl}>Địa chỉ <span className="text-red-600">*</span></label><input value={diaChi} onChange={(e) => setDiaChi(e.target.value)} maxLength={500} placeholder="Số nhà, tổ/thôn/xóm…" className={inputCls} /></div>
          <div className="flex flex-col gap-1.5"><label className={lbl}>Tỉnh/Thành phố <span className="text-red-600">*</span></label>
            <input disabled value={tinhThanh} className={cn(inputCls, "bg-neutral-50 text-foreground-muted")} title="Cố định theo Sở Tư pháp quản lý" />
          </div>
          <div className="flex flex-col gap-1.5"><label className={lbl}>Phường/Xã <span className="text-red-600">*</span></label>
            <NativeSelect value={phuongXa} onChange={(e) => setPhuongXa(e.target.value)}><option value="">— Chọn —</option>{wardsOf(tinhThanh).map((w) => <option key={w} value={w}>{w}</option>)}</NativeSelect>
          </div>
          <div className="flex flex-col gap-1.5"><label className={lbl}>Số điện thoại</label><input value={sdt} onChange={(e) => setSdt(e.target.value)} maxLength={10} placeholder="0241234567" className={inputCls} /></div>
          <div className="flex flex-col gap-1.5"><label className={lbl}>Email</label><input value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} placeholder="contact@vpcc.vn" className={inputCls} /></div>
          <div className="flex flex-col gap-1.5"><label className={lbl}>Mã số thuế</label><input value={mst} onChange={(e) => setMst(e.target.value)} maxLength={20} className={inputCls} /></div>
          <div className="flex flex-col gap-1.5"><label className={lbl}>Trạng thái <span className="text-red-600">*</span></label>
            <NativeSelect value={trangThai} onChange={(e) => setTrangThai(e.target.value as OrgStatus)}>{ORG_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</NativeSelect>
          </div>
        </div>

        {error && <div className="mt-4 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]">{error}</div>}

        <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" onClick={doCancel}>Hủy</Button>
          <Button onClick={doSave}><Save className="size-4" />Lưu</Button>
        </div>
      </div>
    </div>
  )
}
