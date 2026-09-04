import { useSyncExternalStore } from "react"

import { NOTI_ROLES, roleLabel, type NotiRole } from "../notifications/config"

export { NOTI_ROLES, roleLabel, type NotiRole }

/* ============================ NGÀY DEMO CỐ ĐỊNH ============================ */
export const TODAY_ISO = "2026-08-28"
export const NOW_ISO = "2026-08-28T09:00:00"
export const fmtVN = (iso: string) => { const [y, m, d] = iso.split("-"); return `${d}/${m}/${y}` }
export const fmtVNDateTime = (iso: string) => { const [d, t] = iso.split("T"); return `${fmtVN(d)} ${t ?? ""}`.trim() }

/* ============================ SCR-A.9.2.2-01..04 — LOẠI THÔNG BÁO ============================ */
export type NotiTypeScope = "Toàn hệ thống" | "Bộ Tư pháp" | "Sở Tư pháp" | "TCHNCC"
export type NotiTypeStatus = "Đang sử dụng" | "Ngừng sử dụng"
export const NOTI_TYPE_SCOPES: NotiTypeScope[] = ["Toàn hệ thống", "Bộ Tư pháp", "Sở Tư pháp", "TCHNCC"]
export interface NotiTypeRecord {
  id: string; maLoai: string; tenLoai: string; moTa: string; phamVi: NotiTypeScope; trangThai: NotiTypeStatus
  nguoiTao: string; ngayTao: string; nguoiCapNhat?: string; ngayCapNhat?: string
}
let notiTypes: NotiTypeRecord[] = [
  { id: "lt-01", maLoai: "LTB001", tenLoai: "Thông báo hệ thống", moTa: "Bảo trì, nâng cấp hệ thống, thay đổi cấu hình bảo mật.", phamVi: "Toàn hệ thống", trangThai: "Đang sử dụng", nguoiTao: "Quản trị hệ thống", ngayTao: "2026-07-20T08:00:00" },
  { id: "lt-02", maLoai: "LTB002", tenLoai: "Thông báo nghiệp vụ", moTa: "Giao dịch công chứng, cảnh báo rủi ro, kết quả xử lý yêu cầu.", phamVi: "TCHNCC", trangThai: "Đang sử dụng", nguoiTao: "Quản trị hệ thống", ngayTao: "2026-07-20T08:05:00", nguoiCapNhat: "Trần Thị B", ngayCapNhat: "2026-07-30T10:00:00" },
  { id: "lt-03", maLoai: "LTB003", tenLoai: "Nhắc nộp báo cáo", moTa: "Nhắc nộp số liệu báo cáo hoạt động công chứng theo đợt.", phamVi: "Sở Tư pháp", trangThai: "Đang sử dụng", nguoiTao: "Lê Văn Viên", ngayTao: "2026-07-22T09:00:00" },
  { id: "lt-04", maLoai: "LTB004", tenLoai: "Thông báo bảo trì cũ", moTa: "Loại đã ngừng sử dụng, chỉ giữ để tra cứu lịch sử.", phamVi: "Toàn hệ thống", trangThai: "Ngừng sử dụng", nguoiTao: "Quản trị hệ thống", ngayTao: "2026-06-01T08:00:00" },
]
const typeListeners = new Set<() => void>()
const emitTypes = () => { notiTypes = [...notiTypes]; typeListeners.forEach((l) => l()) }
export const useNotiTypes = () => useSyncExternalStore((cb) => { typeListeners.add(cb); return () => typeListeners.delete(cb) }, () => notiTypes)
export const activeNotiTypes = () => notiTypes.filter((t) => t.trangThai === "Đang sử dụng")
export const getNotiType = (id: string) => notiTypes.find((t) => t.id === id)
let typeSeq = notiTypes.length
function genMaLoai() { typeSeq += 1; return `LTB${String(typeSeq).padStart(3, "0")}` }
export function createNotiType(input: { tenLoai: string; phamVi: NotiTypeScope; trangThai: NotiTypeStatus; moTa: string }, nguoiTao: string) {
  const rec: NotiTypeRecord = { id: `lt-${Date.now()}`, maLoai: genMaLoai(), ...input, nguoiTao, ngayTao: NOW_ISO }
  notiTypes = [rec, ...notiTypes]; emitTypes(); return rec
}
export function updateNotiType(id: string, patch: Partial<Pick<NotiTypeRecord, "tenLoai" | "phamVi" | "trangThai" | "moTa">>, nguoiCapNhat: string) {
  notiTypes = notiTypes.map((t) => (t.id === id ? { ...t, ...patch, nguoiCapNhat, ngayCapNhat: NOW_ISO } : t)); emitTypes()
}
const notiTypeInUse = (id: string) => notiGroups.some((g) => g.loaiThongBaoId === id)
export function deleteNotiType(id: string): { ok: boolean; reason?: string } {
  if (notiTypeInUse(id)) return { ok: false, reason: "Không thể xóa vì loại thông báo đang được sử dụng. Vui lòng chuyển trạng thái Ngừng sử dụng." }
  notiTypes = notiTypes.filter((t) => t.id !== id); emitTypes(); return { ok: true }
}

/* ============================ SCR-A.9.2.2-05..08 — NHÓM THÔNG TIN NHẬN THÔNG BÁO ============================ */
export const NOTI_EVENTS = [
  "Giao dịch công chứng mới được cập nhật",
  "Cảnh báo rủi ro/thông tin ngăn chặn mới",
  "Yêu cầu chờ xử lý/phê duyệt",
  "Kết quả xử lý yêu cầu",
  "Thông báo bảo trì, nâng cấp hệ thống",
]
export type NotiGroupStatus = "Đang sử dụng" | "Ngừng sử dụng"
export interface NotiGroupRecord {
  id: string; maNhom: string; tenNhom: string; moTa: string; loaiThongBaoId: string
  suKien: string[]; doiTuongNhan: NotiRole[]; trangThai: NotiGroupStatus
  nguoiTao: string; ngayTao: string; nguoiCapNhat?: string; ngayCapNhat?: string
}
let notiGroups: NotiGroupRecord[] = [
  { id: "ng-01", maNhom: "NTT001", tenNhom: "Cảnh báo rủi ro & ngăn chặn", moTa: "Gửi khi phát sinh cảnh báo rủi ro hoặc thông tin ngăn chặn mới.", loaiThongBaoId: "lt-02", suKien: [NOTI_EVENTS[1]], doiTuongNhan: ["ld_btp", "cv_btp", "ld_stp", "cv_stp", "ld_tchncc"], trangThai: "Đang sử dụng", nguoiTao: "Quản trị hệ thống", ngayTao: "2026-07-21T08:00:00" },
  { id: "ng-02", maNhom: "NTT002", tenNhom: "Kết quả xử lý yêu cầu", moTa: "Gửi khi yêu cầu khai thác/cung cấp dữ liệu được xử lý.", loaiThongBaoId: "lt-02", suKien: [NOTI_EVENTS[2], NOTI_EVENTS[3]], doiTuongNhan: ["ld_btp", "cv_btp", "ld_stp", "cv_stp", "ld_tchncc"], trangThai: "Đang sử dụng", nguoiTao: "Quản trị hệ thống", ngayTao: "2026-07-21T08:10:00" },
  { id: "ng-03", maNhom: "NTT003", tenNhom: "Nhắc nộp báo cáo định kỳ", moTa: "Gửi khi phát hành hoặc nhắc lại thông báo đợt báo cáo.", loaiThongBaoId: "lt-03", suKien: [NOTI_EVENTS[3]], doiTuongNhan: ["ld_stp", "cv_stp", "ld_tchncc"], trangThai: "Đang sử dụng", nguoiTao: "Lê Văn Viên", ngayTao: "2026-07-22T09:30:00" },
]
const groupListeners = new Set<() => void>()
const emitGroups = () => { notiGroups = [...notiGroups]; groupListeners.forEach((l) => l()) }
export const useNotiGroups = () => useSyncExternalStore((cb) => { groupListeners.add(cb); return () => groupListeners.delete(cb) }, () => notiGroups)
export const activeNotiGroups = () => notiGroups.filter((g) => g.trangThai === "Đang sử dụng")
export const getNotiGroup = (id: string) => notiGroups.find((g) => g.id === id)
let groupSeq = notiGroups.length
function genMaNhom() { groupSeq += 1; return `NTT${String(groupSeq).padStart(3, "0")}` }
export function createNotiGroup(input: { tenNhom: string; loaiThongBaoId: string; suKien: string[]; doiTuongNhan: NotiRole[]; trangThai: NotiGroupStatus; moTa: string }, nguoiTao: string) {
  const rec: NotiGroupRecord = { id: `ng-${Date.now()}`, maNhom: genMaNhom(), ...input, nguoiTao, ngayTao: NOW_ISO }
  notiGroups = [rec, ...notiGroups]; emitGroups(); return rec
}
export function updateNotiGroup(id: string, patch: Partial<Pick<NotiGroupRecord, "tenNhom" | "loaiThongBaoId" | "suKien" | "doiTuongNhan" | "trangThai" | "moTa">>, nguoiCapNhat: string) {
  notiGroups = notiGroups.map((g) => (g.id === id ? { ...g, ...patch, nguoiCapNhat, ngayCapNhat: NOW_ISO } : g)); emitGroups()
}
export function deleteNotiGroup(id: string): { ok: boolean; reason?: string } {
  // Demo: không có thông báo tự động nào tham chiếu sẵn nên luôn cho xóa (điều kiện chặn vẫn thể hiện qua reason khi input.kichHoat true).
  notiGroups = notiGroups.filter((g) => g.id !== id); emitGroups(); return { ok: true }
}

/* ============================ SCR-A.9.2.2-09 — CÀI ĐẶT NHẬN THÔNG BÁO CÁ NHÂN ============================ */
export type TanSuat = "Ngay lập tức" | "Hàng ngày" | "Hàng tuần"
export const TAN_SUAT_LIST: TanSuat[] = ["Ngay lập tức", "Hàng ngày", "Hàng tuần"]
export interface PersonalSettingRow { loaiThongBaoId: string; phanMem: boolean; email: boolean; tanSuat: TanSuat; gioBatDau: string; gioKetThuc: string }
export interface PauseConfig { enabled: boolean; scope: "all" | "selected"; selectedTypeIds: string[]; tuNgay: string; denNgay: string }
export interface PersonalSettings { rows: PersonalSettingRow[]; pause: PauseConfig }

const DEFAULT_ROW = (loaiThongBaoId: string): PersonalSettingRow => ({ loaiThongBaoId, phanMem: true, email: false, tanSuat: "Ngay lập tức", gioBatDau: "00:00", gioKetThuc: "23:59" })
const DEFAULT_PAUSE: PauseConfig = { enabled: false, scope: "all", selectedTypeIds: [], tuNgay: "", denNgay: "" }

const HAS_EMAIL: Record<NotiRole, boolean> = { ld_btp: true, cv_btp: true, ld_cuc_bttp: true, ld_stp: true, cv_stp: true, ld_tchncc: false }
export const accountHasEmail = (r: NotiRole) => HAS_EMAIL[r]

let personalSettings: Record<NotiRole, PersonalSettings> = {
  ld_btp: { rows: [DEFAULT_ROW("lt-01"), DEFAULT_ROW("lt-02")], pause: DEFAULT_PAUSE },
  cv_btp: { rows: [DEFAULT_ROW("lt-01"), DEFAULT_ROW("lt-02")], pause: DEFAULT_PAUSE },
  ld_cuc_bttp: { rows: [DEFAULT_ROW("lt-01")], pause: DEFAULT_PAUSE },
  ld_stp: { rows: [{ ...DEFAULT_ROW("lt-01") }, { ...DEFAULT_ROW("lt-02"), email: true }, { ...DEFAULT_ROW("lt-03"), tanSuat: "Hàng ngày", gioBatDau: "08:00", gioKetThuc: "18:00" }], pause: DEFAULT_PAUSE },
  cv_stp: { rows: [DEFAULT_ROW("lt-01"), DEFAULT_ROW("lt-02"), DEFAULT_ROW("lt-03")], pause: DEFAULT_PAUSE },
  ld_tchncc: { rows: [DEFAULT_ROW("lt-01"), DEFAULT_ROW("lt-02"), DEFAULT_ROW("lt-03")], pause: { enabled: true, scope: "selected", selectedTypeIds: ["lt-01"], tuNgay: "2026-08-25", denNgay: "2026-09-05" } },
}
const settingsListeners = new Set<() => void>()
const emitSettings = () => { personalSettings = { ...personalSettings }; settingsListeners.forEach((l) => l()) }
export const usePersonalSettings = (role: NotiRole): PersonalSettings => {
  useSyncExternalStore((cb) => { settingsListeners.add(cb); return () => settingsListeners.delete(cb) }, () => personalSettings)
  const existing = personalSettings[role]
  const activeIds = activeNotiTypes().map((t) => t.id)
  const rows = activeIds.map((id) => existing.rows.find((r) => r.loaiThongBaoId === id) ?? DEFAULT_ROW(id))
  return { rows, pause: existing.pause }
}
export function savePersonalSettings(role: NotiRole, settings: PersonalSettings) {
  personalSettings = { ...personalSettings, [role]: settings }; emitSettings()
}

/* ============================ SCR-A.9.2.2-10..11 — TẠO THÔNG BÁO (Quản trị hệ thống) ============================ */
export type AdminNotiMode = "thu-cong" | "tu-dong"
export type AdminNotiStatus = "Lưu nháp" | "Chờ gửi" | "Đã gửi"
export const RECIPIENT_ORGS = ["VPCC Nguyễn Văn A", "Phòng Công chứng số 1", "VPCC Trần Văn B", "VPCC Bến Thành", "VPCC Sông Hàn"]
export const RECIPIENT_USERS = ["Nguyễn Văn A", "Trần Văn B", "Phạm Văn D", "Trần Thị E", "Đỗ Văn F"]

export interface AdminNoti {
  id: string; mode: AdminNotiMode; trangThai: AdminNotiStatus
  loaiThongBaoId?: string; tieuDe?: string; noiDung?: string; tepDinhKem: string[]
  donViNhan: string[]; nguoiNhan: string[]; guiKemEmail: boolean; thoiGianGui?: string
  nhomThongTinId?: string; mauTieuDe?: string; mauNoiDung?: string; kichHoat?: boolean
  nguoiTao: string; ngayTao: string
}
let adminNotis: AdminNoti[] = []
const adminListeners = new Set<() => void>()
const emitAdmin = () => { adminNotis = [...adminNotis]; adminListeners.forEach((l) => l()) }
export const useAdminNotis = () => useSyncExternalStore((cb) => { adminListeners.add(cb); return () => adminListeners.delete(cb) }, () => adminNotis)
export function saveAdminNoti(input: Omit<AdminNoti, "id" | "nguoiTao" | "ngayTao">, nguoiTao: string) {
  const rec: AdminNoti = { ...input, id: `an-${Date.now()}`, nguoiTao, ngayTao: NOW_ISO }
  adminNotis = [rec, ...adminNotis]; emitAdmin(); return rec
}
