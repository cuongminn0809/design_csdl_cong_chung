import { useState } from "react"
import { ArrowLeft, Save } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { useCurrentRole } from "@/features/notifications/config"
import { ConfirmDialog } from "./dialogs"
import {
  CCV_STATUS_OPTIONS, CURRENT_ORG_USER, GENDERS, NATIONALITIES, ORG_HOME_PROVINCE, PROVINCES_34, activeOrgsIn,
  canManageCcv, createCcv, emptyCert, getCcv, orgAddressOf, updateCcv, useOrgs, wardsOf,
  type Ccv, type CcvCertificate,
} from "./config"

const isCcvInHomeScope = (soTuPhap: string) => soTuPhap === ORG_HOME_PROVINCE
const inputCls = "h-9 w-full rounded-md border border-input bg-surface px-3 text-sm shadow-xs outline-none focus-visible:border-border-focus focus-visible:ring-[3px] focus-visible:ring-ring/50"
const lbl = "text-xs font-semibold text-foreground-strong"
const PHONE_RE = /^0\d{9,10}$/
const PHONE_INTL_RE = /^\+84\d{9,10}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/
const isFuture = (iso: string) => !!iso && iso > "2026-08-28"

function normalizePhone(raw: string): string | null {
  const s = raw.trim()
  if (!s) return ""
  if (PHONE_RE.test(s)) return s
  if (PHONE_INTL_RE.test(s)) return "0" + s.slice(3)
  return null
}

export function CcvFormPage({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const showToast = useToast()
  const role = useCurrentRole()
  const allOrgs = useOrgs()
  const found = mode === "edit" && id ? getCcv(id) : undefined
  const src = found && isCcvInHomeScope(found.soTuPhap) ? found : undefined
  const canManage = canManageCcv(role)

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [hoTen, setHoTen] = useState(src?.hoTen ?? "")
  const [ngaySinh, setNgaySinh] = useState(src?.ngaySinh ?? "")
  const [gioiTinh, setGioiTinh] = useState(src?.gioiTinh ?? "Nam")
  const [quocTich, setQuocTich] = useState(src?.quocTich ?? "Việt Nam")
  const [danToc, setDanToc] = useState(src?.danToc ?? "")
  const [sdt, setSdt] = useState(src?.sdt ?? "")
  const [email, setEmail] = useState(src?.email ?? "")
  const [soGiayTo, setSoGiayTo] = useState(src?.soGiayTo ?? "")
  const [ngayCapGiayTo, setNgayCapGiayTo] = useState(src?.ngayCapGiayTo ?? "")
  const [noiCapGiayTo, setNoiCapGiayTo] = useState(src?.noiCapGiayTo ?? "")
  const [diaChiThuongTru, setDiaChiThuongTru] = useState(src?.diaChiThuongTru ?? "")
  const [tinhThanh, setTinhThanh] = useState(src?.tinhThanh ?? ORG_HOME_PROVINCE)
  const [phuongXa, setPhuongXa] = useState(src?.phuongXa ?? "")
  const [trangThai, setTrangThai] = useState(src?.trangThai ?? "Đăng ký tập sự")
  const [toChucCongChungId, setToChucCongChungId] = useState(src?.toChucCongChungId ?? "")
  const [soThe, setSoThe] = useState(src?.soThe ?? "")
  const [laTruongVanPhong, setLaTruongVanPhong] = useState(src?.laTruongVanPhong ?? false)
  const [cert, setCert] = useState<CcvCertificate>(src?.certificate ?? emptyCert())
  const [error, setError] = useState("")
  const [confirmingCancel, setConfirmingCancel] = useState(false)

  const soTuPhap = src?.soTuPhap ?? ORG_HOME_PROVINCE
  const orgs = activeOrgsIn(soTuPhap, allOrgs)

  const dirty = mode === "create"
    ? !!(hoTen || ngaySinh || danToc || sdt || email || soGiayTo || ngayCapGiayTo || noiCapGiayTo || diaChiThuongTru || phuongXa || toChucCongChungId || soThe || cert.soChungChi)
    : !!src && (
      hoTen !== src.hoTen || ngaySinh !== (src.ngaySinh ?? "") || gioiTinh !== src.gioiTinh || quocTich !== src.quocTich ||
      danToc !== (src.danToc ?? "") || sdt !== (src.sdt ?? "") || email !== src.email || diaChiThuongTru !== src.diaChiThuongTru ||
      tinhThanh !== src.tinhThanh || phuongXa !== src.phuongXa || trangThai !== src.trangThai ||
      toChucCongChungId !== (src.toChucCongChungId ?? "") || soThe !== (src.soThe ?? "") || laTruongVanPhong !== src.laTruongVanPhong ||
      JSON.stringify(cert) !== JSON.stringify(src.certificate)
    )

  const goToParent = () => navigate(mode === "create" ? "/quan-ly-thong-tin/cong-chung-vien" : `/quan-ly-thong-tin/cong-chung-vien/${id}`)
  const doCancel = () => { if (dirty) setConfirmingCancel(true); else goToParent() }

  const validateStep1 = (): string | null => {
    if (!hoTen.trim()) return "Họ và tên là bắt buộc và không được vượt quá 250 ký tự."
    if (hoTen.trim().length > 250) return "Họ và tên là bắt buộc và không được vượt quá 250 ký tự."
    if (isFuture(ngaySinh) || isFuture(ngayCapGiayTo)) return "Thông tin ngày không hợp lệ."
    if (!gioiTinh || !quocTich || !soGiayTo.trim() || !ngayCapGiayTo || !noiCapGiayTo.trim() || !diaChiThuongTru.trim() || !tinhThanh || !phuongXa || !trangThai) {
      return "Vui lòng nhập đầy đủ thông tin bắt buộc."
    }
    if (sdt.trim() && normalizePhone(sdt) === null) return "Số điện thoại không hợp lệ."
    if (!EMAIL_RE.test(email.trim()) || email.trim().length > 250) return "Email không hợp lệ."
    return null
  }
  const validateStep2 = (): string | null => {
    if (laTruongVanPhong && !toChucCongChungId) return "Hãy chọn tổ chức hành nghề công chứng chưa có trưởng văn phòng trước khi xác định vai trò Trưởng văn phòng."
    return null
  }
  const validateStep3 = (): string | null => {
    if (cert.ngayHieuLuc && cert.ngayHetHan && cert.ngayHetHan < cert.ngayHieuLuc) return "Ngày hết hạn phải lớn hơn hoặc bằng ngày hiệu lực."
    return null
  }

  const goNext = () => {
    const err = step === 1 ? validateStep1() : validateStep2()
    if (err) return setError(err)
    setError("")
    setStep((s) => (s === 1 ? 2 : 3) as 1 | 2 | 3)
  }
  const goBack = () => { setError(""); setStep((s) => (s === 3 ? 2 : 1) as 1 | 2 | 3) }

  const doSave = () => {
    const err = validateStep3()
    if (err) return setError(err)
    setError("")
    const normPhone = normalizePhone(sdt)
    const actor = CURRENT_ORG_USER[role]
    const payload: Omit<Ccv, "id" | "maCcv" | "version" | "nguoiTao" | "ngayTao" | "ngayCapNhat"> = {
      hoTen: hoTen.trim(), ngaySinh: ngaySinh || undefined, gioiTinh, quocTich, danToc: danToc.trim() || undefined,
      sdt: normPhone || undefined, email: email.trim(), soGiayTo: soGiayTo.trim(), ngayCapGiayTo, noiCapGiayTo: noiCapGiayTo.trim(),
      diaChiThuongTru: diaChiThuongTru.trim(), tinhThanh, phuongXa, trangThai, soTuPhap,
      toChucCongChungId: toChucCongChungId || undefined, soThe: soThe.trim() || undefined, laTruongVanPhong,
      certificate: cert,
    }
    if (mode === "create") {
      const r = createCcv(payload, actor)
      if (!r.ok) return setError(r.reason)
      showToast("Thêm mới công chứng viên và tạo tài khoản thành công.")
      navigate(`/quan-ly-thong-tin/cong-chung-vien/${r.ccv.id}`)
    } else if (src) {
      const r = updateCcv(src.id, payload, src.version, actor)
      if (!r.ok) return setError(r.reason)
      showToast("Cập nhật công chứng viên thành công.")
      navigate(`/quan-ly-thong-tin/cong-chung-vien/${src.id}`)
    }
  }

  if (mode === "edit" && !src) {
    return (
      <div className="rounded-[14px] border border-border bg-surface p-10 text-center shadow-sm">
        <div className="text-[15px] font-semibold text-foreground-strong">Không tìm thấy công chứng viên hoặc bạn không có quyền chỉnh sửa.</div>
        <Button className="mt-4" variant="outline" onClick={() => navigate("/quan-ly-thong-tin/cong-chung-vien")}><ArrowLeft className="size-4" />Quay lại</Button>
      </div>
    )
  }
  if (!canManage) {
    return (
      <div className="rounded-[14px] border border-border bg-surface p-10 text-center shadow-sm">
        <div className="text-[15px] font-semibold text-foreground-strong">Không có quyền truy cập chức năng này.</div>
        <Button className="mt-4" variant="outline" onClick={() => navigate("/quan-ly-thong-tin/cong-chung-vien")}><ArrowLeft className="size-4" />Quay lại</Button>
      </div>
    )
  }

  const steps = ["Thông tin chung", "Thông tin tổ chức hành nghề", "Thông tin chứng chỉ hành nghề"]

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <button onClick={doCancel} className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-foreground-muted shadow-xs hover:bg-surface-muted"><ArrowLeft className="size-4" /></button>
        <div>
          <h3 className="text-[24px] font-semibold leading-tight tracking-[-0.02em] text-foreground-strong">{mode === "create" ? "Thêm mới công chứng viên" : `Chỉnh sửa: ${src?.hoTen}`}</h3>
          <p className="mt-1.5 text-sm text-foreground-muted">Nhập đầy đủ thông tin bắt buộc trước khi lưu.</p>
        </div>
      </div>

      <div className="flex gap-2">
        {steps.map((s, i) => (
          <div key={s} className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12.5px] font-medium ${step === i + 1 ? "bg-neutral-900 text-white" : "bg-neutral-100 text-foreground-muted"}`}>
            <span>{i + 1}.</span>{s}
          </div>
        ))}
      </div>

      <div className="rounded-[14px] border border-border bg-surface p-6 shadow-sm">
        {step === 1 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2"><label className={lbl}>Họ và tên <span className="text-red-600">*</span></label><input value={hoTen} onChange={(e) => setHoTen(e.target.value)} maxLength={250} className={inputCls} /></div>
            <div className="flex flex-col gap-1.5"><label className={lbl}>Ngày sinh</label><input type="date" value={ngaySinh} onChange={(e) => setNgaySinh(e.target.value)} className={inputCls} /></div>
            <div className="flex flex-col gap-1.5"><label className={lbl}>Giới tính <span className="text-red-600">*</span></label><NativeSelect value={gioiTinh} onChange={(e) => setGioiTinh(e.target.value)}>{GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}</NativeSelect></div>
            <div className="flex flex-col gap-1.5"><label className={lbl}>Quốc tịch <span className="text-red-600">*</span></label><NativeSelect value={quocTich} onChange={(e) => setQuocTich(e.target.value)}>{NATIONALITIES.map((n) => <option key={n} value={n}>{n}</option>)}</NativeSelect></div>
            <div className="flex flex-col gap-1.5"><label className={lbl}>Dân tộc</label><input value={danToc} onChange={(e) => setDanToc(e.target.value)} className={inputCls} /></div>
            <div className="flex flex-col gap-1.5"><label className={lbl}>Số điện thoại</label><input value={sdt} onChange={(e) => setSdt(e.target.value)} placeholder="0901234567" className={inputCls} /></div>
            <div className="flex flex-col gap-1.5"><label className={lbl}>Email <span className="text-red-600">*</span></label><input value={email} onChange={(e) => setEmail(e.target.value)} maxLength={250} placeholder="ccv@example.gov.vn" className={inputCls} /></div>
            <div className="flex flex-col gap-1.5"><label className={lbl}>Số giấy tờ <span className="text-red-600">*</span></label><input value={soGiayTo} onChange={(e) => setSoGiayTo(e.target.value)} disabled={mode === "edit"} className={cn(inputCls, mode === "edit" && "bg-neutral-50 text-foreground-muted")} /></div>
            <div className="flex flex-col gap-1.5"><label className={lbl}>Ngày cấp <span className="text-red-600">*</span></label><input type="date" value={ngayCapGiayTo} onChange={(e) => setNgayCapGiayTo(e.target.value)} disabled={mode === "edit"} className={cn(inputCls, mode === "edit" && "bg-neutral-50 text-foreground-muted")} /></div>
            <div className="flex flex-col gap-1.5 sm:col-span-2"><label className={lbl}>Nơi cấp <span className="text-red-600">*</span></label><input value={noiCapGiayTo} onChange={(e) => setNoiCapGiayTo(e.target.value)} maxLength={500} className={inputCls} /></div>
            <div className="flex flex-col gap-1.5 sm:col-span-2"><label className={lbl}>Địa chỉ thường trú <span className="text-red-600">*</span></label><input value={diaChiThuongTru} onChange={(e) => setDiaChiThuongTru(e.target.value)} maxLength={500} className={inputCls} /></div>
            <div className="flex flex-col gap-1.5"><label className={lbl}>Tỉnh/Thành phố <span className="text-red-600">*</span></label>
              <NativeSelect value={tinhThanh} onChange={(e) => { setTinhThanh(e.target.value); setPhuongXa("") }}>{PROVINCES_34.map((p) => <option key={p} value={p}>{p}</option>)}</NativeSelect>
            </div>
            <div className="flex flex-col gap-1.5"><label className={lbl}>Phường/Xã <span className="text-red-600">*</span></label>
              <NativeSelect value={phuongXa} onChange={(e) => setPhuongXa(e.target.value)}><option value="">— Chọn —</option>{wardsOf(tinhThanh).map((w) => <option key={w} value={w}>{w}</option>)}</NativeSelect>
            </div>
            <div className="flex flex-col gap-1.5"><label className={lbl}>Trạng thái <span className="text-red-600">*</span></label>
              <NativeSelect value={trangThai} onChange={(e) => setTrangThai(e.target.value)} disabled={mode === "create"}>{CCV_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}</NativeSelect>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5"><label className={lbl}>Tên tổ chức công chứng</label>
              <NativeSelect value={toChucCongChungId} onChange={(e) => { setToChucCongChungId(e.target.value); if (!e.target.value) setLaTruongVanPhong(false) }}>
                <option value="">— Chưa gắn TCHNCC —</option>
                {orgs.map((o) => <option key={o.id} value={o.id}>{o.ten}</option>)}
              </NativeSelect>
            </div>
            <div className="flex flex-col gap-1.5"><label className={lbl}>Địa chỉ tổ chức công chứng</label><input disabled value={orgAddressOf(toChucCongChungId) ?? ""} className={cn(inputCls, "bg-neutral-50 text-foreground-muted")} /></div>
            <div className="flex flex-col gap-1.5"><label className={lbl}>Số thẻ công chứng viên</label><input value={soThe} onChange={(e) => setSoThe(e.target.value)} disabled={mode === "edit"} className={cn(inputCls, mode === "edit" && "bg-neutral-50 text-foreground-muted")} /></div>
            <div className="flex items-center gap-2 pt-6"><input type="checkbox" id="head" disabled={!toChucCongChungId} checked={laTruongVanPhong} onChange={(e) => setLaTruongVanPhong(e.target.checked)} className="size-4" /><label htmlFor="head" className={lbl}>Trưởng văn phòng</label></div>
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5"><label className={lbl}>Số chứng chỉ</label><input value={cert.soChungChi} onChange={(e) => setCert((c) => ({ ...c, soChungChi: e.target.value }))} className={inputCls} /></div>
            <div className="flex flex-col gap-1.5"><label className={lbl}>Ngày cấp CCHN</label><input type="date" value={cert.ngayCap} onChange={(e) => setCert((c) => ({ ...c, ngayCap: e.target.value }))} className={inputCls} /></div>
            <div className="flex flex-col gap-1.5"><label className={lbl}>Nơi cấp chứng chỉ</label><input value={cert.noiCap} onChange={(e) => setCert((c) => ({ ...c, noiCap: e.target.value }))} maxLength={500} className={inputCls} /></div>
            <div className="flex flex-col gap-1.5"><label className={lbl}>Đơn vị cấp</label><input value={cert.donViCap} onChange={(e) => setCert((c) => ({ ...c, donViCap: e.target.value }))} className={inputCls} /></div>
            <div className="flex flex-col gap-1.5"><label className={lbl}>Ngày hiệu lực</label><input type="date" value={cert.ngayHieuLuc} onChange={(e) => setCert((c) => ({ ...c, ngayHieuLuc: e.target.value }))} className={inputCls} /></div>
            <div className="flex flex-col gap-1.5"><label className={lbl}>Ngày hết hạn</label><input type="date" value={cert.ngayHetHan} onChange={(e) => setCert((c) => ({ ...c, ngayHetHan: e.target.value }))} className={inputCls} /></div>
            <div className="flex flex-col gap-1.5"><label className={lbl}>Trạng thái CCHN</label>
              <NativeSelect value={cert.trangThai} onChange={(e) => setCert((c) => ({ ...c, trangThai: e.target.value }))}>
                <option value="Còn hiệu lực">Còn hiệu lực</option><option value="Hết hiệu lực">Hết hiệu lực</option><option value="Thu hồi">Thu hồi</option>
              </NativeSelect>
            </div>
          </div>
        )}

        {error && <div className="mt-4 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]">{error}</div>}

        <div className="mt-5 flex justify-between gap-2 border-t border-border pt-4">
          <div>{step > 1 && <Button variant="outline" onClick={goBack}>Quay lại</Button>}</div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={doCancel}>Hủy</Button>
            {step < 3 ? <Button onClick={goNext}>Tiếp tục</Button> : <Button onClick={doSave}><Save className="size-4" />Lưu</Button>}
          </div>
        </div>
      </div>

      {confirmingCancel && (
        <ConfirmDialog
          title="Xác nhận hủy thao tác"
          message={mode === "create" ? "Dữ liệu đã nhập chưa được lưu. Bạn có chắc chắn muốn hủy thao tác?" : "Dữ liệu đã thay đổi chưa được lưu. Bạn có chắc chắn muốn hủy thao tác?"}
          confirmLabel="Hủy thao tác"
          onCancel={() => setConfirmingCancel(false)}
          onConfirm={goToParent}
        />
      )}
    </div>
  )
}
