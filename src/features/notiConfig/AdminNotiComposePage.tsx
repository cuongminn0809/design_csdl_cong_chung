import { useState } from "react"
import { Eye, Send, ShieldAlert } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { UTIL_ROLES, type UtilRole } from "@/features/utilities/config"
import { EmptyState, PageHeader } from "../ingestion/shared"
import { PreviewNotiDialog } from "./dialogs"
import {
  RECIPIENT_ORGS, RECIPIENT_USERS, activeNotiGroups, activeNotiTypes, getNotiGroup, saveAdminNoti,
  type AdminNotiMode,
} from "./config"

const inputCls = "h-9 w-full rounded-md border border-input bg-surface px-3 text-sm shadow-xs outline-none focus-visible:border-border-focus focus-visible:ring-[3px] focus-visible:ring-ring/50"
const lbl = "text-xs font-semibold text-foreground-strong"

export function AdminNotiComposePage() {
  const showToast = useToast()
  const [role, setRole] = useState<UtilRole>("admin")
  const types = activeNotiTypes()
  const groups = activeNotiGroups()
  const isAdmin = role === "admin"

  const [mode, setMode] = useState<AdminNotiMode>("thu-cong")
  // Thủ công
  const [loaiThongBaoId, setLoaiThongBaoId] = useState(types[0]?.id ?? "")
  const [tieuDe, setTieuDe] = useState("")
  const [noiDung, setNoiDung] = useState("")
  const [tepDinhKem, setTepDinhKem] = useState<string[]>([])
  const [donViNhan, setDonViNhan] = useState<string[]>([])
  const [nguoiNhan, setNguoiNhan] = useState<string[]>([])
  const [guiKemEmail, setGuiKemEmail] = useState(true)
  const [lenLich, setLenLich] = useState(false)
  const [thoiGianGui, setThoiGianGui] = useState("")
  // Tự động
  const [nhomThongTinId, setNhomThongTinId] = useState(groups[0]?.id ?? "")
  const [mauTieuDe, setMauTieuDe] = useState("")
  const [mauNoiDung, setMauNoiDung] = useState("")
  const [kichHoat, setKichHoat] = useState(false)

  const [error, setError] = useState("")
  const [preview, setPreview] = useState(false)

  const toggleTag = (list: string[], setList: (v: string[]) => void, v: string) => setList(list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

  const doPreview = () => {
    const t = mode === "thu-cong" ? tieuDe : mauTieuDe
    const n = mode === "thu-cong" ? noiDung : mauNoiDung
    if (!t.trim() || !n.trim()) return setError("Vui lòng nhập tiêu đề và nội dung trước khi xem trước.")
    setError(""); setPreview(true)
  }

  const resetManual = () => { setTieuDe(""); setNoiDung(""); setTepDinhKem([]); setDonViNhan([]); setNguoiNhan([]); setGuiKemEmail(true); setLenLich(false); setThoiGianGui("") }

  const doSaveDraft = () => {
    if (!tieuDe.trim()) return setError("Vui lòng nhập tiêu đề.")
    setError("")
    saveAdminNoti({ mode: "thu-cong", trangThai: "Lưu nháp", loaiThongBaoId, tieuDe: tieuDe.trim(), noiDung, tepDinhKem, donViNhan, nguoiNhan, guiKemEmail }, "Quản trị hệ thống")
    showToast("Lưu nháp thông báo thành công.")
  }
  const doSendNow = () => {
    if (!loaiThongBaoId || !tieuDe.trim() || !noiDung.trim()) return setError("Vui lòng nhập/chọn loại thông báo, tiêu đề và nội dung.")
    if (donViNhan.length + nguoiNhan.length === 0) return setError("Vui lòng chọn ít nhất một người nhận.")
    if (!window.confirm("Bạn chắc chắn muốn gửi thông báo này ngay bây giờ?")) return
    setError("")
    saveAdminNoti({ mode: "thu-cong", trangThai: "Đã gửi", loaiThongBaoId, tieuDe: tieuDe.trim(), noiDung, tepDinhKem, donViNhan, nguoiNhan, guiKemEmail }, "Quản trị hệ thống")
    showToast("Gửi thông báo thành công.")
    resetManual()
  }
  const doSchedule = () => {
    if (!loaiThongBaoId || !tieuDe.trim() || !noiDung.trim()) return setError("Vui lòng nhập/chọn loại thông báo, tiêu đề và nội dung.")
    if (donViNhan.length + nguoiNhan.length === 0) return setError("Vui lòng chọn ít nhất một người nhận.")
    if (!thoiGianGui || thoiGianGui <= new Date().toISOString().slice(0, 16)) return setError("Thời gian gửi phải lớn hơn thời gian hiện tại.")
    setError("")
    saveAdminNoti({ mode: "thu-cong", trangThai: "Chờ gửi", loaiThongBaoId, tieuDe: tieuDe.trim(), noiDung, tepDinhKem, donViNhan, nguoiNhan, guiKemEmail, thoiGianGui }, "Quản trị hệ thống")
    showToast("Đã lên lịch gửi thông báo.")
    resetManual()
  }
  const doSaveAutoConfig = () => {
    if (!nhomThongTinId) return setError("Vui lòng chọn nhóm thông tin nhận.")
    if (!mauTieuDe.trim() || !mauNoiDung.trim()) return setError("Vui lòng nhập mẫu tiêu đề và mẫu nội dung.")
    setError("")
    saveAdminNoti({ mode: "tu-dong", trangThai: "Đã gửi", nhomThongTinId, mauTieuDe: mauTieuDe.trim(), mauNoiDung: mauNoiDung.trim(), kichHoat, tepDinhKem: [], donViNhan: [], nguoiNhan: [], guiKemEmail: false }, "Quản trị hệ thống")
    showToast("Lưu cấu hình thông báo tự động thành công.")
  }

  const selectedGroup = getNotiGroup(nhomThongTinId)
  const gioGuiText = mode === "tu-dong" ? "Khi sự kiện phát sinh" : lenLich && thoiGianGui ? new Date(thoiGianGui).toLocaleString("vi-VN") : "Ngay khi bấm Gửi"

  return (
    <div className="space-y-4">
      <PageHeader title="Tạo thông báo" desc="Tạo thông báo thủ công gửi tới đối tượng cụ thể, hoặc thiết lập thông báo tự động theo nhóm sự kiện."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] text-foreground-muted">Vai trò:</span>
            <NativeSelect value={role} onChange={(e) => setRole(e.target.value as UtilRole)} className="h-8 w-[220px] text-[12.5px]">
              {UTIL_ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </NativeSelect>
          </div>
        } />

      {!isAdmin ? (
        <EmptyState icon={<ShieldAlert className="size-6" />} title="Không có quyền truy cập" desc="Chỉ Quản trị hệ thống được tạo thông báo gửi tới các đối tượng khác." />
      ) : (
        <>
          <div className="flex gap-5 text-[13.5px]">
            <label className="flex items-center gap-1.5"><input type="radio" checked={mode === "thu-cong"} onChange={() => setMode("thu-cong")} />Thủ công</label>
            <label className="flex items-center gap-1.5"><input type="radio" checked={mode === "tu-dong"} onChange={() => setMode("tu-dong")} />Tự động</label>
          </div>

          <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
            {mode === "thu-cong" ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5"><label className={lbl}>Loại thông báo <span className="text-red-600">*</span></label>
                  <NativeSelect value={loaiThongBaoId} onChange={(e) => setLoaiThongBaoId(e.target.value)}>{types.map((t) => <option key={t.id} value={t.id}>{t.tenLoai}</option>)}</NativeSelect>
                </div>
                <div className="flex flex-col gap-1.5"><label className={lbl}>Tiêu đề <span className="text-red-600">*</span></label><input value={tieuDe} onChange={(e) => setTieuDe(e.target.value)} maxLength={250} className={inputCls} /></div>
                <div className="flex flex-col gap-1.5 sm:col-span-2"><label className={lbl}>Nội dung <span className="text-red-600">*</span></label><textarea value={noiDung} onChange={(e) => setNoiDung(e.target.value)} maxLength={4000} rows={4} className={cn(inputCls, "h-auto py-2")} /></div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className={lbl}>Người nhận — Đơn vị</label>
                  <div className="flex flex-wrap gap-1.5">
                    {RECIPIENT_ORGS.map((o) => (
                      <button key={o} type="button" onClick={() => toggleTag(donViNhan, setDonViNhan, o)} className={cn("rounded-full border px-2.5 py-1 text-[12.5px]", donViNhan.includes(o) ? "border-neutral-900 bg-neutral-900 text-white" : "border-border bg-surface text-foreground-muted hover:bg-surface-muted")}>{o}</button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className={lbl}>Người nhận — Cá nhân</label>
                  <div className="flex flex-wrap gap-1.5">
                    {RECIPIENT_USERS.map((u) => (
                      <button key={u} type="button" onClick={() => toggleTag(nguoiNhan, setNguoiNhan, u)} className={cn("rounded-full border px-2.5 py-1 text-[12.5px]", nguoiNhan.includes(u) ? "border-neutral-900 bg-neutral-900 text-white" : "border-border bg-surface text-foreground-muted hover:bg-surface-muted")}>{u}</button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[13.5px]"><input type="checkbox" checked={guiKemEmail} onChange={(e) => setGuiKemEmail(e.target.checked)} />Gửi kèm email</div>
                <div className="flex items-center gap-2 text-[13.5px]"><input type="checkbox" checked={lenLich} onChange={(e) => setLenLich(e.target.checked)} />Lên lịch gửi</div>
                {lenLich && (
                  <div className="flex flex-col gap-1.5 sm:col-span-2"><label className={lbl}>Thời gian gửi <span className="text-red-600">*</span></label><input type="datetime-local" min={new Date().toISOString().slice(0, 16)} value={thoiGianGui} onChange={(e) => setThoiGianGui(e.target.value)} className={inputCls} /></div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5 sm:col-span-2"><label className={lbl}>Nhóm thông tin nhận <span className="text-red-600">*</span></label>
                  <NativeSelect value={nhomThongTinId} onChange={(e) => setNhomThongTinId(e.target.value)}>{groups.map((g) => <option key={g.id} value={g.id}>{g.tenNhom}</option>)}</NativeSelect>
                  {selectedGroup && <div className="mt-1 text-[12px] text-foreground-muted">Sự kiện: {selectedGroup.suKien.join("; ")}</div>}
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2"><label className={lbl}>Mẫu tiêu đề <span className="text-red-600">*</span></label><input value={mauTieuDe} onChange={(e) => setMauTieuDe(e.target.value)} maxLength={250} placeholder="Ví dụ: {TenSuKien} — {ThoiGian}" className={inputCls} /></div>
                <div className="flex flex-col gap-1.5 sm:col-span-2"><label className={lbl}>Mẫu nội dung <span className="text-red-600">*</span></label><textarea value={mauNoiDung} onChange={(e) => setMauNoiDung(e.target.value)} maxLength={4000} rows={4} placeholder="Hỗ trợ biến {TenSuKien}, {ThoiGian}, {ChiTietSuKien}" className={cn(inputCls, "h-auto py-2")} /></div>
                <div className="flex items-center gap-2 text-[13.5px] sm:col-span-2">
                  <button type="button" onClick={() => setKichHoat((v) => !v)} aria-pressed={kichHoat} className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", kichHoat ? "bg-neutral-900" : "bg-neutral-200")}>
                    <span className="absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform" style={{ transform: kichHoat ? "translateX(22px)" : "translateX(0)" }} />
                  </button>
                  Kích hoạt (áp dụng ngay sau khi lưu)
                </div>
              </div>
            )}
            {error && <div className="mt-3 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]">{error}</div>}
            <div className="mt-4 flex flex-wrap gap-2.5">
              <Button variant="outline" onClick={doPreview}><Eye className="size-4" />Xem trước</Button>
              {mode === "thu-cong" ? (
                <>
                  <Button variant="outline" onClick={doSaveDraft}>Lưu nháp</Button>
                  {lenLich ? <Button onClick={doSchedule}><Send className="size-4" />Lưu &amp; Lên lịch</Button> : <Button onClick={doSendNow}><Send className="size-4" />Gửi ngay</Button>}
                </>
              ) : (
                <Button onClick={doSaveAutoConfig}><Send className="size-4" />Lưu cấu hình</Button>
              )}
            </div>
          </div>
        </>
      )}

      {preview && (
        <PreviewNotiDialog
          tieuDe={mode === "thu-cong" ? tieuDe : mauTieuDe}
          noiDung={mode === "thu-cong" ? noiDung : mauNoiDung}
          tepDinhKem={tepDinhKem}
          gioGuiText={gioGuiText}
          onClose={() => setPreview(false)}
        />
      )}
    </div>
  )
}
