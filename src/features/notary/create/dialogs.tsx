import { useMemo, useState } from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { inputCls } from "../../ingestion/shared"
import type { Party, Asset } from "../config"
import {
  ASSET_DETAIL_FIELDS, ASSET_TYPES, GIOI_TINH, ORG_DOC_TYPES, PERSON_DOC_TYPES, PROVINCES, QUOC_TICH,
} from "./config"

const today = () => new Date().toISOString().slice(0, 10)

function Overlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={onClose}>{children}</div>
  )
}

function F({ label, required, error, className, children }: { label: string; required?: boolean; error?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-xs font-semibold text-foreground-strong">{label}{required && <span className="ml-1 text-red-600">*</span>}</label>
      {children}
      {error && <span className="text-[12px] text-red-600">{error}</span>}
    </div>
  )
}

/** SCR-A.3.1.1-02 — Popup thêm/sửa bên liên quan (Cá nhân / Tổ chức). */
export function PersonOrgDialog({ vaiTro, initial, onSave, onClose }: { vaiTro: string; initial?: Party; onSave: (p: Party) => void; onClose: () => void }) {
  const [isOrg, setIsOrg] = useState(initial?.isOrg ?? false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Cá nhân
  const [hoTen, setHoTen] = useState(initial && !initial.isOrg ? initial.name : "")
  const [gioiTinh, setGioiTinh] = useState("Nam")
  const [ngaySinh, setNgaySinh] = useState("")
  const [loaiGT, setLoaiGT] = useState(PERSON_DOC_TYPES[0])
  const [soGT, setSoGT] = useState(initial && !initial.isOrg ? stripDoc(initial.giayTo) : "")
  const [quocTich, setQuocTich] = useState("Việt Nam")
  const [dienThoai, setDienThoai] = useState("")
  const [email, setEmail] = useState("")
  const [diaChi, setDiaChi] = useState(initial?.diaChi ?? "")
  const [tinh, setTinh] = useState("")

  // Tổ chức
  const [tenTC, setTenTC] = useState(initial && initial.isOrg ? initial.name : "")
  const [loaiGTPN, setLoaiGTPN] = useState(ORG_DOC_TYPES[0])
  const [soGTPN, setSoGTPN] = useState(initial && initial.isOrg ? stripDoc(initial.giayTo) : "")
  const [nguoiDaiDien, setNguoiDaiDien] = useState("")
  const [chucVu, setChucVu] = useState("")

  const save = () => {
    const e: Record<string, string> = {}
    if (!isOrg) {
      if (!hoTen.trim()) e.hoTen = "Thông tin Họ và tên là bắt buộc"
      if (!soGT.trim()) e.soGT = "Thông tin Số giấy tờ là bắt buộc"
      else if (soGT.length > 12 || /[^0-9a-zA-Z]/.test(soGT)) e.soGT = "Sai định dạng thông tin (tối đa 12 ký tự, không ký tự đặc biệt)"
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Sai định dạng thông tin"
      if (dienThoai && !/^0\d{9,10}$/.test(dienThoai)) e.dienThoai = "Sai định dạng thông tin"
      if (ngaySinh && ngaySinh > today()) e.ngaySinh = "Ngày sinh không được vượt quá ngày hiện tại"
    } else {
      if (!tenTC.trim()) e.tenTC = "Thông tin Tên tổ chức là bắt buộc"
      if (!soGTPN.trim()) e.soGTPN = "Thông tin Số giấy tờ pháp nhân là bắt buộc"
      if (!nguoiDaiDien.trim()) e.nguoiDaiDien = "Thông tin Người đại diện là bắt buộc"
    }
    setErrors(e)
    if (Object.keys(e).length) return
    const p: Party = isOrg
      ? { name: tenTC.trim(), isOrg: true, giayTo: `${loaiGTPN}: ${soGTPN}`, diaChi: diaChi || "—", vaiTro }
      : { name: hoTen.trim(), isOrg: false, giayTo: `${loaiGT}: ${soGT}`, diaChi: diaChi || "—", vaiTro }
    onSave(p)
  }

  return (
    <Overlay onClose={onClose}>
      <div className="flex max-h-[86vh] w-[720px] max-w-full flex-col overflow-hidden rounded-xl bg-surface shadow-popover" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
          <span className="text-[15px] font-semibold text-foreground-strong">{initial ? "Chỉnh sửa" : "Thêm mới"} bên liên quan — {vaiTro}</span>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="size-[18px]" /></Button>
        </div>
        <div className="border-b border-border px-6 py-3">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-[13px]"><input type="radio" checked={!isOrg} onChange={() => setIsOrg(false)} className="size-4 accent-neutral-900" />Cá nhân</label>
            <label className="flex items-center gap-2 text-[13px]"><input type="radio" checked={isOrg} onChange={() => setIsOrg(true)} className="size-4 accent-neutral-900" />Tổ chức</label>
          </div>
        </div>
        <div className="overflow-y-auto px-6 py-5">
          {!isOrg ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <F label="Họ và tên" required error={errors.hoTen}><input value={hoTen} onChange={(e) => setHoTen(e.target.value)} className={inputCls} /></F>
              <F label="Giới tính" required><NativeSelect value={gioiTinh} onChange={(e) => setGioiTinh(e.target.value)}>{GIOI_TINH.map((g) => <option key={g}>{g}</option>)}</NativeSelect></F>
              <F label="Ngày sinh" error={errors.ngaySinh}><input type="date" max={today()} value={ngaySinh} onChange={(e) => setNgaySinh(e.target.value)} className={cn(inputCls, "text-[13.5px]")} /></F>
              <F label="Quốc tịch" required><NativeSelect value={quocTich} onChange={(e) => setQuocTich(e.target.value)}>{QUOC_TICH.map((q) => <option key={q}>{q}</option>)}</NativeSelect></F>
              <F label="Loại giấy tờ nhân thân"><NativeSelect value={loaiGT} onChange={(e) => setLoaiGT(e.target.value)}>{PERSON_DOC_TYPES.map((t) => <option key={t}>{t}</option>)}</NativeSelect></F>
              <F label="Số giấy tờ nhân thân" required error={errors.soGT}><input value={soGT} maxLength={12} onChange={(e) => setSoGT(e.target.value)} className={inputCls} /></F>
              <F label="Số điện thoại" error={errors.dienThoai}><input value={dienThoai} onChange={(e) => setDienThoai(e.target.value)} className={inputCls} /></F>
              <F label="Email" error={errors.email}><input value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} /></F>
              <F label="Địa chỉ hiện tại" className="sm:col-span-2"><input value={diaChi} onChange={(e) => setDiaChi(e.target.value)} className={inputCls} /></F>
              <F label="Tỉnh/Thành phố hiện tại"><NativeSelect value={tinh} onChange={(e) => setTinh(e.target.value)}><option value="">— Chọn —</option>{PROVINCES.map((p) => <option key={p}>{p}</option>)}</NativeSelect></F>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <F label="Tên tổ chức" required error={errors.tenTC} className="sm:col-span-2"><input value={tenTC} onChange={(e) => setTenTC(e.target.value)} className={inputCls} /></F>
              <F label="Loại giấy tờ pháp nhân"><NativeSelect value={loaiGTPN} onChange={(e) => setLoaiGTPN(e.target.value)}>{ORG_DOC_TYPES.map((t) => <option key={t}>{t}</option>)}</NativeSelect></F>
              <F label="Số giấy tờ pháp nhân" required error={errors.soGTPN}><input value={soGTPN} onChange={(e) => setSoGTPN(e.target.value)} className={inputCls} /></F>
              <F label="Địa chỉ tổ chức" className="sm:col-span-2"><input value={diaChi} onChange={(e) => setDiaChi(e.target.value)} className={inputCls} /></F>
              <F label="Người đại diện" required error={errors.nguoiDaiDien}><input value={nguoiDaiDien} onChange={(e) => setNguoiDaiDien(e.target.value)} className={inputCls} /></F>
              <F label="Chức vụ người đại diện"><input value={chucVu} onChange={(e) => setChucVu(e.target.value)} className={inputCls} /></F>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={save}>Lưu</Button>
        </div>
      </div>
    </Overlay>
  )
}

const stripDoc = (s: string) => (s.includes(":") ? s.split(":").slice(1).join(":").trim() : s)

/** SCR-A.3.1.1-03 — Popup thêm/sửa tài sản giao dịch (14 loại động). */
export function AssetDialog({ initial, onSave, onClose }: { initial?: Asset; onSave: (a: Asset) => void; onClose: () => void }) {
  const [loai, setLoai] = useState(initial?.loai ?? "")
  const [soGCN, setSoGCN] = useState(initial?.gcn ? stripDoc(initial.gcn) : "")
  const [ngayCap, setNgayCap] = useState("")
  const [noiCap, setNoiCap] = useState("")
  const [chuSoHuu, setChuSoHuu] = useState(initial?.chuSoHuu ?? "")
  const [thongTinKhac, setThongTinKhac] = useState("")
  const [detail, setDetail] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const detailFields = useMemo(() => ASSET_DETAIL_FIELDS[loai] ?? [], [loai])

  const save = () => {
    const e: Record<string, string> = {}
    if (!loai) e.loai = "Thông tin Loại tài sản là bắt buộc"
    if (!soGCN.trim()) e.soGCN = "Thông tin Số giấy chứng nhận là bắt buộc"
    if (!chuSoHuu.trim()) e.chuSoHuu = "Thông tin Chủ sở hữu là bắt buộc"
    if (ngayCap && ngayCap > today()) e.ngayCap = "Ngày cấp không được vượt quá ngày hiện tại"
    setErrors(e)
    if (Object.keys(e).length) return
    // Gói các trường chi tiết + nơi cấp + thông tin khác vào "đặc điểm".
    const parts = detailFields.map((f) => detail[f.code]).filter(Boolean)
    if (noiCap) parts.push(`Nơi cấp: ${noiCap}`)
    if (thongTinKhac) parts.push(thongTinKhac)
    onSave({ loai, gcn: `GCN: ${soGCN}`, chuSoHuu: chuSoHuu.trim(), dacDiem: parts.join("; ") || "—" })
  }

  return (
    <Overlay onClose={onClose}>
      <div className="flex max-h-[86vh] w-[760px] max-w-full flex-col overflow-hidden rounded-xl bg-surface shadow-popover" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
          <span className="text-[15px] font-semibold text-foreground-strong">{initial ? "Chỉnh sửa" : "Thêm mới"} tài sản giao dịch</span>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="size-[18px]" /></Button>
        </div>
        <div className="overflow-y-auto px-6 py-5">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">Thông tin chung</div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <F label="Loại tài sản" required error={errors.loai}>
              <NativeSelect value={loai} onChange={(e) => { setLoai(e.target.value); setDetail({}) }}>
                <option value="">— Chọn loại tài sản —</option>
                {ASSET_TYPES.map((t) => <option key={t}>{t}</option>)}
              </NativeSelect>
            </F>
            <F label="Số giấy chứng nhận" required error={errors.soGCN}><input value={soGCN} onChange={(e) => setSoGCN(e.target.value)} className={inputCls} /></F>
            <F label="Ngày cấp" error={errors.ngayCap}><input type="date" max={today()} value={ngayCap} onChange={(e) => setNgayCap(e.target.value)} className={cn(inputCls, "text-[13.5px]")} /></F>
            <F label="Nơi cấp"><input value={noiCap} onChange={(e) => setNoiCap(e.target.value)} className={inputCls} /></F>
            <F label="Chủ sở hữu" required error={errors.chuSoHuu} className="sm:col-span-2"><input value={chuSoHuu} onChange={(e) => setChuSoHuu(e.target.value)} className={inputCls} /></F>
            <F label="Thông tin khác" className="sm:col-span-2"><input value={thongTinKhac} onChange={(e) => setThongTinKhac(e.target.value)} className={inputCls} /></F>
          </div>

          {loai && detailFields.length > 0 && (
            <>
              <div className="mb-2 mt-5 border-t border-neutral-100 pt-4 text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">Thông tin chi tiết — {loai}</div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {detailFields.map((f) => (
                  <F key={f.code} label={f.label}>
                    <input value={detail[f.code] ?? ""} onChange={(e) => setDetail((d) => ({ ...d, [f.code]: e.target.value }))} className={inputCls} />
                  </F>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={save}>Lưu</Button>
        </div>
      </div>
    </Overlay>
  )
}
