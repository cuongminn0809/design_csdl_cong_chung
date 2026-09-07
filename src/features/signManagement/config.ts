import { useSyncExternalStore } from "react"

import { CURRENT_ORG_USER, NOTI_ROLES, roleLabel, TODAY_ISO, NOW_ISO, fmtVN, fmtVNDateTime, type NotiRole } from "../notifications/config"
import { ORG_HOME_PROVINCE, isStpRole, getOrg, useOrgs } from "../orgManagement/config"
import { getCcv, useCcvs } from "../ccvManagement/config"

export { CURRENT_ORG_USER, NOTI_ROLES, roleLabel, TODAY_ISO, NOW_ISO, fmtVN, fmtVNDateTime, ORG_HOME_PROVINCE, isStpRole, getOrg, useOrgs, getCcv, useCcvs }
export type SignRole = NotiRole

/* ============================ NHÂN VẬT MẶC ĐỊNH (demo) ============================ */
export const CURRENT_TCHNCC_ORG_ID = "org-01"
export const CURRENT_CCV_ID = "ccvm-01"

/* ============================ PHẠM VI QUYỀN ============================ */
export const isDeptHeadStp = (r: SignRole) => r === "ld_stp"
export const isStaffStp = (r: SignRole) => r === "cv_stp"
export const isTchnccLead = (r: SignRole) => r === "ld_tchncc"
export const isCcvRole = (r: SignRole) => r === "ccv"
export const isAdminRole = (r: SignRole) => r === "qths"

export const canViewList = (r: SignRole) => isStpRole(r) || isTchnccLead(r) || isCcvRole(r) || isAdminRole(r)
export const canRegisterOrg = (r: SignRole) => isTchnccLead(r)
export const canRegisterCcv = (r: SignRole) => isTchnccLead(r) || isCcvRole(r)
export const canApprove = (r: SignRole) => isDeptHeadStp(r)
export const canAssess = (r: SignRole) => isStaffStp(r)
export const canCancel = (r: SignRole) => isAdminRole(r)
export const canLockUnlock = (r: SignRole) => isAdminRole(r)
export const canViewUsageHistory = (r: SignRole) => isAdminRole(r)
export const canViewReports = (r: SignRole) => isStpRole(r)
export const canConfigAlert = (r: SignRole) => isAdminRole(r)

/* ============================ DANH MỤC ============================ */
export type SignStatus = "LUU_NHAP" | "CHO_DUYET" | "DA_PHE_DUYET" | "DA_TU_CHOI" | "CO_HIEU_LUC" | "DA_HET_HAN" | "DA_HUY" | "DA_KHOA"
export const SIGN_STATUSES: SignStatus[] = ["LUU_NHAP", "CHO_DUYET", "DA_PHE_DUYET", "DA_TU_CHOI", "CO_HIEU_LUC", "DA_HET_HAN", "DA_HUY", "DA_KHOA"]
export const STATUS_LABEL: Record<SignStatus, string> = {
  LUU_NHAP: "Lưu nháp", CHO_DUYET: "Chờ duyệt", DA_PHE_DUYET: "Đã phê duyệt", DA_TU_CHOI: "Đã từ chối",
  CO_HIEU_LUC: "Có hiệu lực", DA_HET_HAN: "Đã hết hạn", DA_HUY: "Đã hủy", DA_KHOA: "Đã khóa",
}
export const STATUS_BADGE: Record<SignStatus, { bg: string; fg: string }> = {
  LUU_NHAP: { bg: "#f4f4f5", fg: "#52525b" },
  CHO_DUYET: { bg: "#fefce8", fg: "#a16207" },
  DA_PHE_DUYET: { bg: "#eff6ff", fg: "#1d4ed8" },
  DA_TU_CHOI: { bg: "#fef2f2", fg: "#b91c1c" },
  CO_HIEU_LUC: { bg: "#ecfdf5", fg: "#047857" },
  DA_HET_HAN: { bg: "#fff7ed", fg: "#c2410c" },
  DA_HUY: { bg: "#f4f4f5", fg: "#3f3f46" },
  DA_KHOA: { bg: "#fdf2f8", fg: "#9d174d" },
}
export type SignRequestType = "DANG_KY" | "GIA_HAN"
export const REQUEST_TYPE_LABEL: Record<SignRequestType, string> = { DANG_KY: "Đăng ký mới", GIA_HAN: "Gia hạn" }
export type SignOwnerType = "TCHNCC" | "CCV"
export const PROVIDERS = ["VNPT-CA", "Viettel-CA", "MobiFone-CA", "FPT-CA"]
export const CANCEL_TYPES = [{ key: "VI_PHAM", label: "Vi phạm" }, { key: "HET_HIEU_LUC", label: "Hết hiệu lực" }] as const

/* ============================ ĐIỀU KIỆN ĐƯỢC KÝ (BR-SIGN-COMMON-01) ============================ */
export const canSignWith = (rec: ChuKySo) =>
  (rec.trangThai === "DA_PHE_DUYET" || rec.trangThai === "CO_HIEU_LUC" || (rec.trangThai === "CHO_DUYET" && rec.loaiYeuCau === "GIA_HAN")) &&
  rec.ngayHieuLuc <= TODAY_ISO && TODAY_ISO <= rec.ngayHetHan

function effectiveStatus(ngayHieuLuc: string, ngayHetHan: string): "DA_PHE_DUYET" | "CO_HIEU_LUC" | "DA_HET_HAN" {
  if (TODAY_ISO > ngayHetHan) return "DA_HET_HAN"
  if (TODAY_ISO >= ngayHieuLuc) return "CO_HIEU_LUC"
  return "DA_PHE_DUYET"
}

/* ============================ KIỂU DỮ LIỆU ============================ */
export interface ChuKySo {
  id: string; maCks: string
  loaiChuThe: SignOwnerType
  toChucCongChungId?: string
  congChungVienId?: string
  nhaCungCap: string
  soSerial: string
  ngayHieuLuc: string
  ngayHetHan: string
  ghiChu?: string
  fileDinhKem?: string
  trangThai: SignStatus
  trangThaiTruocKhiKhoa?: SignStatus
  loaiYeuCau: SignRequestType
  nguoiGuiDuyet?: string; ngayGuiDuyet?: string
  nguoiPheDuyet?: string; ngayPheDuyet?: string
  ghiChuThamDinh?: string
  lyDoTuChoi?: string
  lyDoHuy?: string; loaiHuy?: "VI_PHAM" | "HET_HIEU_LUC"; fileMinhChungHuy?: string
  lyDoKhoa?: string; fileMinhChungKhoa?: string
  lyDoMoKhoa?: string
  ngayHieuLucMoi?: string; ngayHetHanMoi?: string
  version: number
  nguoiTao: string; ngayTao: string; nguoiCapNhat?: string; ngayCapNhat: string
  deleted?: boolean
}

export function ownerNameOf(rec: ChuKySo): string {
  if (rec.loaiChuThe === "TCHNCC") return getOrg(rec.toChucCongChungId ?? "")?.ten ?? "—"
  return getCcv(rec.congChungVienId ?? "")?.hoTen ?? "—"
}
export function orgNameOf(rec: ChuKySo): string | undefined {
  if (rec.loaiChuThe === "TCHNCC") return getOrg(rec.toChucCongChungId ?? "")?.ten
  const ccv = getCcv(rec.congChungVienId ?? "")
  return ccv?.toChucCongChungId ? getOrg(ccv.toChucCongChungId)?.ten : undefined
}
function ownerOrgId(rec: ChuKySo): string | undefined {
  if (rec.loaiChuThe === "TCHNCC") return rec.toChucCongChungId
  return getCcv(rec.congChungVienId ?? "")?.toChucCongChungId
}
function ownerProvince(rec: ChuKySo): string | undefined {
  if (rec.loaiChuThe === "TCHNCC") return getOrg(rec.toChucCongChungId ?? "")?.tinhThanh
  return getCcv(rec.congChungVienId ?? "")?.soTuPhap
}

export function inScope(rec: ChuKySo, role: SignRole): boolean {
  if (isAdminRole(role)) return true
  if (isStpRole(role)) return ownerProvince(rec) === ORG_HOME_PROVINCE
  if (isTchnccLead(role)) return ownerOrgId(rec) === CURRENT_TCHNCC_ORG_ID
  if (isCcvRole(role)) return rec.congChungVienId === CURRENT_CCV_ID
  return false
}
export function canEditOrSubmit(rec: ChuKySo, role: SignRole): boolean {
  if (rec.deleted) return false
  if (!(rec.trangThai === "LUU_NHAP" || rec.trangThai === "DA_TU_CHOI") || rec.loaiYeuCau !== "DANG_KY") return false
  return inScope(rec, role) && (isTchnccLead(role) || isCcvRole(role))
}
export const canRenew = (rec: ChuKySo, role: SignRole) =>
  !rec.deleted && (rec.trangThai === "CO_HIEU_LUC" || rec.trangThai === "DA_HET_HAN") && inScope(rec, role) && (isTchnccLead(role) || isCcvRole(role))
export const canDeleteDraft = (rec: ChuKySo, role: SignRole) =>
  !rec.deleted && rec.trangThai === "LUU_NHAP" && inScope(rec, role) && (isTchnccLead(role) || isCcvRole(role))

/* ============================ DỮ LIỆU MẪU ============================ */
let signs: ChuKySo[] = [
  { id: "cks-01", maCks: "CKS001", loaiChuThe: "TCHNCC", toChucCongChungId: "org-01", nhaCungCap: "VNPT-CA", soSerial: "ORG-VNPT-001", ngayHieuLuc: "2025-01-01", ngayHetHan: "2027-01-01", ghiChu: "Đăng ký ban đầu", trangThai: "CO_HIEU_LUC", loaiYeuCau: "DANG_KY", nguoiGuiDuyet: "Hoàng Văn Trưởng", ngayGuiDuyet: "2024-12-20T09:00:00", nguoiPheDuyet: "Vũ Thị Sở", ngayPheDuyet: "2024-12-22T10:00:00", version: 3, nguoiTao: "Hoàng Văn Trưởng", ngayTao: "2024-12-18T08:00:00", nguoiCapNhat: "Vũ Thị Sở", ngayCapNhat: "2024-12-22T10:00:00" },
  { id: "cks-02", maCks: "CKS002", loaiChuThe: "TCHNCC", toChucCongChungId: "org-02", nhaCungCap: "Viettel-CA", soSerial: "ORG-VTT-002", ngayHieuLuc: "2024-06-01", ngayHetHan: "2026-06-01", ghiChu: "Gia hạn năm 2026", fileDinhKem: "gia-han-org02.pdf", trangThai: "CHO_DUYET", loaiYeuCau: "GIA_HAN", nguoiGuiDuyet: "Hoàng Văn Trưởng", ngayGuiDuyet: "2026-08-20T09:00:00", ngayHieuLucMoi: "2026-06-01", ngayHetHanMoi: "2028-06-01", version: 4, nguoiTao: "Hoàng Văn Trưởng", ngayTao: "2023-05-20T08:00:00", nguoiCapNhat: "Hoàng Văn Trưởng", ngayCapNhat: "2026-08-20T09:00:00" },
  { id: "cks-03", maCks: "CKS003", loaiChuThe: "CCV", congChungVienId: "ccvm-01", nhaCungCap: "Viettel-CA", soSerial: "CCV-VTT-001", ngayHieuLuc: "2025-02-01", ngayHetHan: "2026-09-20", ghiChu: "Chứng thư cá nhân", trangThai: "CO_HIEU_LUC", loaiYeuCau: "DANG_KY", nguoiGuiDuyet: "Nguyễn Văn A", ngayGuiDuyet: "2025-01-25T09:00:00", nguoiPheDuyet: "Vũ Thị Sở", ngayPheDuyet: "2025-01-27T10:00:00", version: 2, nguoiTao: "Nguyễn Văn A", ngayTao: "2025-01-20T08:00:00", nguoiCapNhat: "Vũ Thị Sở", ngayCapNhat: "2025-01-27T10:00:00" },
  { id: "cks-04", maCks: "CKS004", loaiChuThe: "CCV", congChungVienId: "ccvm-02", nhaCungCap: "MobiFone-CA", soSerial: "CCV-MBF-002", ngayHieuLuc: "2026-09-01", ngayHetHan: "2028-09-01", ghiChu: "Đăng ký mới cho CCV trực thuộc", trangThai: "LUU_NHAP", loaiYeuCau: "DANG_KY", version: 1, nguoiTao: "Hoàng Văn Trưởng", ngayTao: "2026-08-25T08:00:00", ngayCapNhat: "2026-08-25T08:00:00" },
  { id: "cks-05", maCks: "CKS005", loaiChuThe: "CCV", congChungVienId: "ccvm-03", nhaCungCap: "FPT-CA", soSerial: "CCV-FPT-003", ngayHieuLuc: "2026-09-05", ngayHetHan: "2028-09-05", ghiChu: "Đăng ký mới", fileDinhKem: "dang-ky-ccv03.pdf", trangThai: "CHO_DUYET", loaiYeuCau: "DANG_KY", nguoiGuiDuyet: "Phạm Văn Đ", ngayGuiDuyet: "2026-08-24T09:30:00", ghiChuThamDinh: "Hồ sơ đầy đủ, đề nghị phê duyệt.", version: 1, nguoiTao: "Phạm Văn Đ", ngayTao: "2026-08-22T08:00:00", ngayCapNhat: "2026-08-24T09:30:00" },
  { id: "cks-06", maCks: "CKS006", loaiChuThe: "CCV", congChungVienId: "ccvm-06", nhaCungCap: "VNPT-CA", soSerial: "CCV-VNPT-006", ngayHieuLuc: "2024-01-01", ngayHetHan: "2027-01-01", ghiChu: "Tạm khóa do phát hiện rủi ro sử dụng bất thường", trangThai: "DA_KHOA", trangThaiTruocKhiKhoa: "CO_HIEU_LUC", loaiYeuCau: "DANG_KY", lyDoKhoa: "Phát hiện dấu hiệu sử dụng chữ ký số bất thường trên nhiều hồ sơ trong thời gian ngắn.", version: 3, nguoiTao: "Trần Văn B", ngayTao: "2024-01-01T08:00:00", nguoiCapNhat: "Quản trị viên hệ thống", ngayCapNhat: "2026-07-15T10:00:00" },
  { id: "cks-07", maCks: "CKS007", loaiChuThe: "CCV", congChungVienId: "ccvm-04", nhaCungCap: "Viettel-CA", soSerial: "CCV-VTT-004", ngayHieuLuc: "2025-01-01", ngayHetHan: "2027-01-01", ghiChu: "Hủy do vi phạm quy định hành nghề", trangThai: "DA_HUY", loaiYeuCau: "DANG_KY", loaiHuy: "VI_PHAM", lyDoHuy: "CCV bị xử lý kỷ luật do vi phạm quy định hành nghề công chứng.", version: 2, nguoiTao: "Nguyễn Thị F", ngayTao: "2025-01-01T08:00:00", nguoiCapNhat: "Quản trị viên hệ thống", ngayCapNhat: "2026-05-10T09:00:00" },
  { id: "cks-08", maCks: "CKS008", loaiChuThe: "CCV", congChungVienId: "ccvm-05", nhaCungCap: "MobiFone-CA", soSerial: "CCV-MBF-005", ngayHieuLuc: "2024-05-01", ngayHetHan: "2026-06-01", ghiChu: "Đã hết hạn, chưa gia hạn", trangThai: "DA_HET_HAN", loaiYeuCau: "DANG_KY", nguoiGuiDuyet: "Phạm Thị Kiếm", ngayGuiDuyet: "2024-04-25T09:00:00", nguoiPheDuyet: "Vũ Thị Sở", ngayPheDuyet: "2024-04-27T10:00:00", version: 2, nguoiTao: "Phạm Thị Kiếm", ngayTao: "2024-04-20T08:00:00", ngayCapNhat: "2026-06-01T00:30:00" },
  { id: "cks-09", maCks: "CKS009", loaiChuThe: "TCHNCC", toChucCongChungId: "org-05", nhaCungCap: "FPT-CA", soSerial: "ORG-FPT-005", ngayHieuLuc: "2026-08-01", ngayHetHan: "2028-08-01", ghiChu: "Hồ sơ còn thiếu minh chứng năng lực", trangThai: "DA_TU_CHOI", loaiYeuCau: "DANG_KY", nguoiGuiDuyet: "Đỗ Văn Sông", ngayGuiDuyet: "2026-08-10T09:00:00", nguoiPheDuyet: "Vũ Thị Sở", ngayPheDuyet: "2026-08-12T10:00:00", lyDoTuChoi: "Hồ sơ đăng ký chưa đính kèm minh chứng chứng thư số hợp lệ. Đề nghị bổ sung và gửi duyệt lại.", version: 2, nguoiTao: "Đỗ Văn Sông", ngayTao: "2026-08-08T08:00:00", nguoiCapNhat: "Vũ Thị Sở", ngayCapNhat: "2026-08-12T10:00:00" },
]
const signListeners = new Set<() => void>()
const emitSigns = () => { signs = [...signs]; signListeners.forEach((l) => l()) }
export const useSigns = () => useSyncExternalStore((cb) => { signListeners.add(cb); return () => signListeners.delete(cb) }, () => signs)
export const getSign = (id: string) => signs.find((s) => s.id === id)
export function signsInScope(role: SignRole) {
  if (!canViewList(role)) return []
  return signs.filter((s) => !s.deleted && inScope(s, role))
}
let signSeq = signs.length
function genMaCks() { signSeq += 1; return `CKS${String(signSeq).padStart(3, "0")}` }

/* ============================ LỊCH SỬ CẬP NHẬT (UC426) ============================ */
export type SignHistoryAction = "Thêm mới" | "Chỉnh sửa" | "Trình duyệt" | "Phê duyệt" | "Từ chối" | "Cập nhật trạng thái (hệ thống)" | "Hủy đăng ký" | "Khóa" | "Mở khóa" | "Xóa nháp"
export interface SignHistoryChange { truong: string; cu: string; moi: string }
export interface SignHistoryEntry {
  id: string; chuKySoId: string; chuThe: string; loaiChuThe: SignOwnerType
  thaoTac: SignHistoryAction; nguoiThucHien: string; diaChiIp: string; thoiGian: string; noiDung: string; changes: SignHistoryChange[]
}
export const HISTORY_ACTIONS: SignHistoryAction[] = ["Thêm mới", "Chỉnh sửa", "Trình duyệt", "Phê duyệt", "Từ chối", "Cập nhật trạng thái (hệ thống)", "Hủy đăng ký", "Khóa", "Mở khóa", "Xóa nháp"]
let history: SignHistoryEntry[] = [
  { id: "sh-01", chuKySoId: "cks-01", chuThe: "VPCC Nguyễn Văn A", loaiChuThe: "TCHNCC", thaoTac: "Thêm mới", nguoiThucHien: "Hoàng Văn Trưởng", diaChiIp: "10.0.0.20", thoiGian: "2024-12-18T08:00:00", noiDung: "Tạo mới đăng ký chữ ký số của VPCC Nguyễn Văn A", changes: [] },
  { id: "sh-02", chuKySoId: "cks-01", chuThe: "VPCC Nguyễn Văn A", loaiChuThe: "TCHNCC", thaoTac: "Trình duyệt", nguoiThucHien: "Hoàng Văn Trưởng", diaChiIp: "10.0.0.20", thoiGian: "2024-12-20T09:00:00", noiDung: "Gửi duyệt đăng ký chữ ký số", changes: [{ truong: "Trạng thái", cu: "Lưu nháp", moi: "Chờ duyệt" }] },
  { id: "sh-03", chuKySoId: "cks-01", chuThe: "VPCC Nguyễn Văn A", loaiChuThe: "TCHNCC", thaoTac: "Phê duyệt", nguoiThucHien: "Vũ Thị Sở", diaChiIp: "10.0.0.5", thoiGian: "2024-12-22T10:00:00", noiDung: "Phê duyệt đăng ký chữ ký số", changes: [{ truong: "Trạng thái", cu: "Chờ duyệt", moi: "Đã phê duyệt" }] },
  { id: "sh-04", chuKySoId: "cks-06", chuThe: "Trần Văn B", loaiChuThe: "CCV", thaoTac: "Khóa", nguoiThucHien: "Quản trị viên hệ thống", diaChiIp: "10.0.0.1", thoiGian: "2026-07-15T10:00:00", noiDung: "Tạm khóa do phát hiện rủi ro sử dụng bất thường", changes: [{ truong: "Trạng thái", cu: "Có hiệu lực", moi: "Đã khóa" }] },
  { id: "sh-05", chuKySoId: "cks-09", chuThe: "VPCC Sông Hàn", loaiChuThe: "TCHNCC", thaoTac: "Từ chối", nguoiThucHien: "Vũ Thị Sở", diaChiIp: "10.0.0.5", thoiGian: "2026-08-12T10:00:00", noiDung: "Từ chối đăng ký: hồ sơ chưa đính kèm minh chứng chứng thư số hợp lệ.", changes: [{ truong: "Trạng thái", cu: "Chờ duyệt", moi: "Đã từ chối" }] },
]
const historyListeners = new Set<() => void>()
const emitHistory = () => { history = [...history]; historyListeners.forEach((l) => l()) }
export const useSignHistory = () => useSyncExternalStore((cb) => { historyListeners.add(cb); return () => historyListeners.delete(cb) }, () => history)
function addHistory(input: Omit<SignHistoryEntry, "id" | "thoiGian">) {
  history = [{ ...input, id: `sh-${Date.now()}`, thoiGian: NOW_ISO }, ...history]; emitHistory()
}
function logHistory(rec: ChuKySo, thaoTac: SignHistoryAction, actor: string, noiDung: string, changes: SignHistoryChange[] = []) {
  addHistory({ chuKySoId: rec.id, chuThe: ownerNameOf(rec), loaiChuThe: rec.loaiChuThe, thaoTac, nguoiThucHien: actor, diaChiIp: "10.0.0.12", noiDung, changes })
}

/* ============================ LỊCH SỬ SỬ DỤNG CKS (UC436, chỉ Quản trị hệ thống) ============================ */
export interface SignUsageEntry { id: string; chuKySoId: string; thoiGian: string; soHoSo: string; loaiSuDung: string; nguoiSuDung: string }
export const USAGE_HISTORY: SignUsageEntry[] = [
  { id: "su-01", chuKySoId: "cks-01", thoiGian: "2026-08-20T09:12:00", soHoSo: "HS-2026-01123", loaiSuDung: "Ký số hồ sơ công chứng điện tử", nguoiSuDung: "Nguyễn Văn A" },
  { id: "su-02", chuKySoId: "cks-01", thoiGian: "2026-08-18T14:05:00", soHoSo: "HS-2026-01098", loaiSuDung: "Ký số hồ sơ công chứng điện tử", nguoiSuDung: "Lê Thị D" },
  { id: "su-03", chuKySoId: "cks-03", thoiGian: "2026-08-25T10:30:00", soHoSo: "HS-2026-01201", loaiSuDung: "Ký số hồ sơ công chứng điện tử", nguoiSuDung: "Nguyễn Văn A" },
]
export const usageHistoryOf = (chuKySoId: string) => USAGE_HISTORY.filter((u) => u.chuKySoId === chuKySoId).sort((a, b) => b.thoiGian.localeCompare(a.thoiGian))

/* ============================ THIẾT LẬP CẢNH BÁO (UC432) ============================ */
export interface AlertConfig { gioGui: string; baoSoTuPhap: boolean; baoTchncc: boolean; baoCcv: boolean; soNgayCanhBao: number; soNgayYeuCauGiaHan: number }
let alertConfig: AlertConfig = { gioGui: "08:00", baoSoTuPhap: true, baoTchncc: true, baoCcv: true, soNgayCanhBao: 30, soNgayYeuCauGiaHan: 15 }
const alertListeners = new Set<() => void>()
export const useAlertConfig = () => useSyncExternalStore((cb) => { alertListeners.add(cb); return () => alertListeners.delete(cb) }, () => alertConfig)
export function saveAlertConfig(next: AlertConfig): { ok: true } | { ok: false; reason: string } {
  if (!/^\d{2}:\d{2}$/.test(next.gioGui)) return { ok: false, reason: "Thời gian gửi thông báo không hợp lệ." }
  if (!next.baoSoTuPhap && !next.baoTchncc && !next.baoCcv) return { ok: false, reason: "Vui lòng chọn ít nhất một đối tượng nhận thông báo." }
  if (!Number.isInteger(next.soNgayCanhBao) || next.soNgayCanhBao < 1 || next.soNgayCanhBao > 365) return { ok: false, reason: "Số ngày thông báo trước hết hạn phải trong khoảng 1-365." }
  if (!Number.isInteger(next.soNgayYeuCauGiaHan) || next.soNgayYeuCauGiaHan < 1 || next.soNgayYeuCauGiaHan > 365) return { ok: false, reason: "Số ngày yêu cầu gia hạn phải trong khoảng 1-365." }
  if (next.soNgayYeuCauGiaHan > next.soNgayCanhBao) return { ok: false, reason: "Số ngày yêu cầu gia hạn phải nhỏ hơn hoặc bằng số ngày thông báo trước hết hạn." }
  alertConfig = { ...next }; alertListeners.forEach((l) => l())
  return { ok: true }
}
export const isExpiringSoon = (rec: ChuKySo) => rec.trangThai === "CO_HIEU_LUC" && daysUntil(rec.ngayHetHan) <= alertConfig.soNgayCanhBao && daysUntil(rec.ngayHetHan) >= 0
function daysUntil(iso: string) { return Math.round((new Date(iso).getTime() - new Date(TODAY_ISO).getTime()) / 86400000) }

/* ============================ TẠO / CẬP NHẬT / XỬ LÝ ============================ */
export type SaveSignResult = { ok: true; sign: ChuKySo } | { ok: false; reason: string }

function checkDuplicateSerial(nhaCungCap: string, soSerial: string, excludeId?: string): boolean {
  return signs.some((s) => s.id !== excludeId && !s.deleted && s.trangThai !== "DA_HUY" && s.nhaCungCap === nhaCungCap && s.soSerial === soSerial)
}

export interface CreateSignInput {
  loaiChuThe: SignOwnerType; toChucCongChungId?: string; congChungVienId?: string
  nhaCungCap: string; soSerial: string; ngayHieuLuc: string; ngayHetHan: string; ghiChu?: string; fileDinhKem?: string
}
export function createSign(input: CreateSignInput, actor: string): SaveSignResult {
  if (checkDuplicateSerial(input.nhaCungCap, input.soSerial)) return { ok: false, reason: "Số Serial này đã được đăng ký cho một chữ ký số khác." }
  if (input.loaiChuThe === "CCV") {
    const ccv = getCcv(input.congChungVienId ?? "")
    if (!ccv?.toChucCongChungId) return { ok: false, reason: "Công chứng viên chưa được gắn với tổ chức hành nghề công chứng hợp lệ." }
  }
  const rec: ChuKySo = {
    ...input, id: `cks-${Date.now()}`, maCks: genMaCks(), trangThai: "LUU_NHAP", loaiYeuCau: "DANG_KY",
    version: 1, nguoiTao: actor, ngayTao: NOW_ISO, ngayCapNhat: NOW_ISO,
  }
  signs = [rec, ...signs]; emitSigns()
  logHistory(rec, "Thêm mới", actor, `Lưu nháp đăng ký chữ ký số của ${ownerNameOf(rec)}`)
  return { ok: true, sign: rec }
}

export function updateSignDraft(id: string, patch: Partial<CreateSignInput>, expectedVersion: number, actor: string): SaveSignResult {
  const cur = getSign(id)
  if (!cur) return { ok: false, reason: "Bản ghi không tồn tại hoặc đã bị xóa." }
  if (cur.version !== expectedVersion) return { ok: false, reason: "Bản ghi đã được người khác cập nhật, vui lòng tải lại dữ liệu." }
  if (!(cur.trangThai === "LUU_NHAP" || cur.trangThai === "DA_TU_CHOI")) return { ok: false, reason: "Không thể cập nhật bản ghi ở trạng thái hiện tại." }
  if ((patch.nhaCungCap || patch.soSerial) && checkDuplicateSerial(patch.nhaCungCap ?? cur.nhaCungCap, patch.soSerial ?? cur.soSerial, id)) {
    return { ok: false, reason: "Số Serial này đã được đăng ký cho một chữ ký số khác." }
  }
  const before = cur
  const updated: ChuKySo = { ...cur, ...patch, version: cur.version + 1, nguoiCapNhat: actor, ngayCapNhat: NOW_ISO }
  signs = signs.map((s) => (s.id === id ? updated : s)); emitSigns()
  const changes: SignHistoryChange[] = []
  const fields: { key: keyof ChuKySo; label: string }[] = [
    { key: "nhaCungCap", label: "Nhà cung cấp" }, { key: "soSerial", label: "Số Serial" },
    { key: "ngayHieuLuc", label: "Ngày hiệu lực" }, { key: "ngayHetHan", label: "Ngày hết hạn" }, { key: "ghiChu", label: "Ghi chú" },
  ]
  for (const f of fields) {
    const cu = String(before[f.key] ?? ""); const moi = String(updated[f.key] ?? "")
    if (cu !== moi) changes.push({ truong: f.label, cu: cu || "-", moi: moi || "-" })
  }
  if (changes.length) logHistory(updated, "Chỉnh sửa", actor, `Chỉnh sửa thông tin chữ ký số của ${ownerNameOf(updated)}`, changes)
  return { ok: true, sign: updated }
}

export function submitSign(id: string, expectedVersion: number, actor: string): SaveSignResult {
  const cur = getSign(id)
  if (!cur) return { ok: false, reason: "Bản ghi không tồn tại hoặc đã bị xóa." }
  if (cur.version !== expectedVersion) return { ok: false, reason: "Bản ghi đã được người khác cập nhật, vui lòng tải lại dữ liệu." }
  if (!(cur.trangThai === "LUU_NHAP" || cur.trangThai === "DA_TU_CHOI")) return { ok: false, reason: "Không thể gửi duyệt bản ghi ở trạng thái hiện tại." }
  const updated: ChuKySo = { ...cur, trangThai: "CHO_DUYET", loaiYeuCau: "DANG_KY", nguoiGuiDuyet: actor, ngayGuiDuyet: NOW_ISO, lyDoTuChoi: undefined, version: cur.version + 1, nguoiCapNhat: actor, ngayCapNhat: NOW_ISO }
  signs = signs.map((s) => (s.id === id ? updated : s)); emitSigns()
  logHistory(updated, "Trình duyệt", actor, `Gửi duyệt đăng ký chữ ký số của ${ownerNameOf(updated)}`, [{ truong: "Trạng thái", cu: STATUS_LABEL[cur.trangThai], moi: STATUS_LABEL["CHO_DUYET"] }])
  return { ok: true, sign: updated }
}

export interface RenewInput { ngayHieuLucMoi: string; ngayHetHanMoi: string; ghiChu?: string; fileDinhKem?: string }
export function submitRenew(id: string, input: RenewInput, expectedVersion: number, actor: string): SaveSignResult {
  const cur = getSign(id)
  if (!cur) return { ok: false, reason: "Bản ghi không tồn tại hoặc đã bị xóa." }
  if (cur.version !== expectedVersion) return { ok: false, reason: "Bản ghi đã được người khác cập nhật, vui lòng tải lại dữ liệu." }
  if (!(cur.trangThai === "CO_HIEU_LUC" || cur.trangThai === "DA_HET_HAN")) return { ok: false, reason: "Không thể gia hạn chữ ký số ở trạng thái hiện tại." }
  if (input.ngayHetHanMoi < input.ngayHieuLucMoi) return { ok: false, reason: "Ngày hết hạn mới không được nhỏ hơn ngày hiệu lực mới." }
  if (input.ngayHieuLucMoi < TODAY_ISO || input.ngayHieuLucMoi < cur.ngayHetHan) return { ok: false, reason: "Thời hạn gia hạn không hợp lệ: ngày hiệu lực mới phải nối tiếp thời hạn hiện tại." }
  if (input.ngayHetHanMoi <= cur.ngayHetHan) return { ok: false, reason: "Thời hạn gia hạn không hợp lệ: ngày hết hạn mới phải lớn hơn ngày hết hạn hiện tại." }
  const updated: ChuKySo = {
    ...cur, trangThai: "CHO_DUYET", loaiYeuCau: "GIA_HAN", nguoiGuiDuyet: actor, ngayGuiDuyet: NOW_ISO,
    ngayHieuLucMoi: input.ngayHieuLucMoi, ngayHetHanMoi: input.ngayHetHanMoi, ghiChu: input.ghiChu ?? cur.ghiChu, fileDinhKem: input.fileDinhKem ?? cur.fileDinhKem,
    version: cur.version + 1, nguoiCapNhat: actor, ngayCapNhat: NOW_ISO,
  }
  signs = signs.map((s) => (s.id === id ? updated : s)); emitSigns()
  logHistory(updated, "Trình duyệt", actor, `Gửi duyệt gia hạn chữ ký số của ${ownerNameOf(updated)}`, [{ truong: "Trạng thái", cu: STATUS_LABEL[cur.trangThai], moi: STATUS_LABEL["CHO_DUYET"] }])
  return { ok: true, sign: updated }
}

export function saveAssessmentNote(id: string, note: string, expectedVersion: number, actor: string): SaveSignResult {
  const cur = getSign(id)
  if (!cur) return { ok: false, reason: "Bản ghi không tồn tại hoặc đã bị xóa." }
  if (cur.version !== expectedVersion) return { ok: false, reason: "Bản ghi đã được người khác cập nhật, vui lòng tải lại dữ liệu." }
  if (cur.trangThai !== "CHO_DUYET") return { ok: false, reason: "Không thể lưu ghi chú thẩm định ở trạng thái hiện tại." }
  if (note.length > 1000) return { ok: false, reason: "Ghi chú thẩm định không được vượt quá 1000 ký tự." }
  const updated: ChuKySo = { ...cur, ghiChuThamDinh: note.trim(), version: cur.version + 1, nguoiCapNhat: actor, ngayCapNhat: NOW_ISO }
  signs = signs.map((s) => (s.id === id ? updated : s)); emitSigns()
  return { ok: true, sign: updated }
}

export function approveSign(id: string, approvalNote: string, expectedVersion: number, actor: string): SaveSignResult {
  const cur = getSign(id)
  if (!cur) return { ok: false, reason: "Bản ghi không tồn tại hoặc đã bị xóa." }
  if (cur.version !== expectedVersion) return { ok: false, reason: "Bản ghi đã được người khác cập nhật, vui lòng tải lại dữ liệu." }
  if (cur.trangThai !== "CHO_DUYET") return { ok: false, reason: "Không thể phê duyệt hồ sơ ở trạng thái hiện tại." }
  if (!approvalNote.trim()) return { ok: false, reason: "Vui lòng nhập thông tin phê duyệt." }
  if (approvalNote.length > 1000) return { ok: false, reason: "Thông tin phê duyệt không được vượt quá 1000 ký tự." }
  const ngayHieuLuc = cur.loaiYeuCau === "GIA_HAN" ? (cur.ngayHieuLucMoi ?? cur.ngayHieuLuc) : cur.ngayHieuLuc
  const ngayHetHan = cur.loaiYeuCau === "GIA_HAN" ? (cur.ngayHetHanMoi ?? cur.ngayHetHan) : cur.ngayHetHan
  const trangThai = effectiveStatus(ngayHieuLuc, ngayHetHan)
  const updated: ChuKySo = {
    ...cur, ngayHieuLuc, ngayHetHan, trangThai, nguoiPheDuyet: actor, ngayPheDuyet: NOW_ISO,
    ngayHieuLucMoi: undefined, ngayHetHanMoi: undefined, version: cur.version + 1, nguoiCapNhat: actor, ngayCapNhat: NOW_ISO,
  }
  signs = signs.map((s) => (s.id === id ? updated : s)); emitSigns()
  logHistory(updated, "Phê duyệt", actor, `Phê duyệt ${cur.loaiYeuCau === "GIA_HAN" ? "gia hạn" : "đăng ký"} chữ ký số của ${ownerNameOf(updated)}: ${approvalNote.trim()}`, [{ truong: "Trạng thái", cu: STATUS_LABEL[cur.trangThai], moi: STATUS_LABEL[trangThai] }])
  return { ok: true, sign: updated }
}

export function rejectSign(id: string, reason: string, expectedVersion: number, actor: string): SaveSignResult {
  const cur = getSign(id)
  if (!cur) return { ok: false, reason: "Bản ghi không tồn tại hoặc đã bị xóa." }
  if (cur.version !== expectedVersion) return { ok: false, reason: "Bản ghi đã được người khác cập nhật, vui lòng tải lại dữ liệu." }
  if (cur.trangThai !== "CHO_DUYET") return { ok: false, reason: "Không thể từ chối hồ sơ ở trạng thái hiện tại." }
  if (!reason.trim()) return { ok: false, reason: "Vui lòng nhập lý do từ chối." }
  if (reason.length > 1000) return { ok: false, reason: "Lý do từ chối không được vượt quá 1000 ký tự." }
  const trangThai: SignStatus = cur.loaiYeuCau === "GIA_HAN" ? effectiveStatus(cur.ngayHieuLuc, cur.ngayHetHan) : "DA_TU_CHOI"
  const updated: ChuKySo = {
    ...cur, trangThai, lyDoTuChoi: reason.trim(), nguoiPheDuyet: actor, ngayPheDuyet: NOW_ISO,
    ngayHieuLucMoi: undefined, ngayHetHanMoi: undefined, version: cur.version + 1, nguoiCapNhat: actor, ngayCapNhat: NOW_ISO,
  }
  signs = signs.map((s) => (s.id === id ? updated : s)); emitSigns()
  logHistory(updated, "Từ chối", actor, `Từ chối ${cur.loaiYeuCau === "GIA_HAN" ? "gia hạn" : "đăng ký"} chữ ký số của ${ownerNameOf(updated)}: ${reason.trim()}`, [{ truong: "Trạng thái", cu: STATUS_LABEL[cur.trangThai], moi: STATUS_LABEL[trangThai] }])
  return { ok: true, sign: updated }
}

export function cancelSign(id: string, loaiHuy: "VI_PHAM" | "HET_HIEU_LUC", lyDo: string, file: string | undefined, expectedVersion: number, actor: string): SaveSignResult {
  const cur = getSign(id)
  if (!cur) return { ok: false, reason: "Bản ghi không tồn tại hoặc đã bị xóa." }
  if (cur.version !== expectedVersion) return { ok: false, reason: "Bản ghi đã được người khác cập nhật, vui lòng tải lại dữ liệu." }
  if (cur.trangThai === "DA_HUY") return { ok: false, reason: "Không thể hủy đăng ký chữ ký số ở trạng thái hiện tại." }
  if (!lyDo.trim()) return { ok: false, reason: "Vui lòng nhập lý do huỷ." }
  const updated: ChuKySo = { ...cur, trangThai: "DA_HUY", loaiHuy, lyDoHuy: lyDo.trim(), fileMinhChungHuy: file, version: cur.version + 1, nguoiCapNhat: actor, ngayCapNhat: NOW_ISO }
  signs = signs.map((s) => (s.id === id ? updated : s)); emitSigns()
  logHistory(updated, "Hủy đăng ký", actor, `Hủy đăng ký chữ ký số của ${ownerNameOf(updated)}: ${lyDo.trim()}`, [{ truong: "Trạng thái", cu: STATUS_LABEL[cur.trangThai], moi: STATUS_LABEL["DA_HUY"] }])
  return { ok: true, sign: updated }
}

export function lockSign(id: string, lyDo: string, file: string | undefined, expectedVersion: number, actor: string): SaveSignResult {
  const cur = getSign(id)
  if (!cur) return { ok: false, reason: "Bản ghi không tồn tại hoặc đã bị xóa." }
  if (cur.version !== expectedVersion) return { ok: false, reason: "Bản ghi đã được người khác cập nhật, vui lòng tải lại dữ liệu." }
  if (!(cur.trangThai === "CO_HIEU_LUC" || cur.trangThai === "DA_HET_HAN")) return { ok: false, reason: "Chữ ký số đã bị khóa hoặc không thể khóa." }
  if (!lyDo.trim()) return { ok: false, reason: "Vui lòng nhập lý do khóa." }
  const updated: ChuKySo = { ...cur, trangThai: "DA_KHOA", trangThaiTruocKhiKhoa: cur.trangThai, lyDoKhoa: lyDo.trim(), fileMinhChungKhoa: file, version: cur.version + 1, nguoiCapNhat: actor, ngayCapNhat: NOW_ISO }
  signs = signs.map((s) => (s.id === id ? updated : s)); emitSigns()
  logHistory(updated, "Khóa", actor, `Tạm khóa chữ ký số của ${ownerNameOf(updated)}: ${lyDo.trim()}`, [{ truong: "Trạng thái", cu: STATUS_LABEL[cur.trangThai], moi: STATUS_LABEL["DA_KHOA"] }])
  return { ok: true, sign: updated }
}

export function unlockSign(id: string, lyDo: string, expectedVersion: number, actor: string): SaveSignResult {
  const cur = getSign(id)
  if (!cur) return { ok: false, reason: "Bản ghi không tồn tại hoặc đã bị xóa." }
  if (cur.version !== expectedVersion) return { ok: false, reason: "Bản ghi đã được người khác cập nhật, vui lòng tải lại dữ liệu." }
  if (cur.trangThai !== "DA_KHOA") return { ok: false, reason: "Chỉ có thể mở khóa chữ ký số đang bị khóa." }
  if (!lyDo.trim()) return { ok: false, reason: "Vui lòng nhập lý do mở khóa." }
  const trangThai = effectiveStatus(cur.ngayHieuLuc, cur.ngayHetHan) === "DA_PHE_DUYET" ? "CO_HIEU_LUC" : effectiveStatus(cur.ngayHieuLuc, cur.ngayHetHan)
  const updated: ChuKySo = { ...cur, trangThai, trangThaiTruocKhiKhoa: undefined, lyDoMoKhoa: lyDo.trim(), version: cur.version + 1, nguoiCapNhat: actor, ngayCapNhat: NOW_ISO }
  signs = signs.map((s) => (s.id === id ? updated : s)); emitSigns()
  logHistory(updated, "Mở khóa", actor, `Mở khóa chữ ký số của ${ownerNameOf(updated)}: ${lyDo.trim()}`, [{ truong: "Trạng thái", cu: STATUS_LABEL["DA_KHOA"], moi: STATUS_LABEL[trangThai] }])
  return { ok: true, sign: updated }
}

export function deleteDraft(id: string, expectedVersion: number, actor: string): SaveSignResult {
  const cur = getSign(id)
  if (!cur) return { ok: false, reason: "Bản ghi không tồn tại hoặc đã bị xóa." }
  if (cur.version !== expectedVersion) return { ok: false, reason: "Bản ghi đã được người khác cập nhật, vui lòng tải lại dữ liệu." }
  if (cur.trangThai !== "LUU_NHAP") return { ok: false, reason: "Không thể thực hiện thao tác với trạng thái hiện tại của chữ ký số." }
  const updated: ChuKySo = { ...cur, deleted: true, version: cur.version + 1, nguoiCapNhat: actor, ngayCapNhat: NOW_ISO }
  signs = signs.map((s) => (s.id === id ? updated : s)); emitSigns()
  logHistory(updated, "Xóa nháp", actor, `Xóa bản nháp đăng ký chữ ký số của ${ownerNameOf(updated)}`)
  return { ok: true, sign: updated }
}
