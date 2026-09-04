import { useSyncExternalStore } from "react"

import { CURRENT_ORG_USER, NOTI_ROLES, roleLabel, type NotiRole } from "../notifications/config"

export { CURRENT_ORG_USER, NOTI_ROLES, roleLabel }
export type OrgRole = NotiRole

/* ============================ NGÀY DEMO CỐ ĐỊNH ============================ */
export const TODAY_ISO = "2026-08-28"
export const NOW_ISO = "2026-08-28T09:00:00"
export const fmtVN = (iso: string) => { const [y, m, d] = iso.split("-"); return `${d}/${m}/${y}` }
export const fmtVNDateTime = (iso: string) => { const [d, t] = iso.split("T"); return `${fmtVN(d)} ${(t ?? "").slice(0, 8)}`.trim() }

// Chuẩn hóa Unicode + trim + gộp khoảng trắng + so sánh không phân biệt hoa/thường, GIỮ dấu tiếng Việt (BR-14/BR-U08).
export const normalizeName = (s: string) => s.normalize("NFC").trim().replace(/\s+/g, " ").toLowerCase()

/* ============================ PHẠM VI QUYỀN (BR-01/BR-M04) ============================ */
export const ORG_HOME_PROVINCE = "Hà Nội"
export const isStpRole = (r: OrgRole) => r === "ld_stp" || r === "cv_stp"
export const isBoRole = (r: OrgRole) => r === "ld_btp" || r === "cv_btp" || r === "ld_cuc_bttp"
export const canManageOrg = (r: OrgRole) => r === "cv_stp"
export const canViewOrg = (r: OrgRole) => isStpRole(r) || isBoRole(r)
export const canExportOrg = (r: OrgRole) => isStpRole(r) || isBoRole(r)
export const canViewHistory = (r: OrgRole) => isStpRole(r)
export const canViewStatsProvince = (r: OrgRole) => isStpRole(r)
export const canViewStatsNational = (r: OrgRole) => isBoRole(r)
export const scopeProvinceFor = (r: OrgRole) => (isStpRole(r) ? ORG_HOME_PROVINCE : undefined)

/* ============================ DANH MỤC DÙNG CHUNG ============================ */
export type OrgType = "Văn phòng công chứng" | "Phòng công chứng"
export const ORG_TYPES: OrgType[] = ["Văn phòng công chứng", "Phòng công chứng"]
export type OrgStatus =
  | "Đang hoạt động" | "Chờ thành lập" | "Giải thể" | "Chấm dứt hoạt động" | "Chưa hoạt động"
  | "Thu hồi QĐ cho phép thành lập" | "Chờ cấp Giấy ĐKHĐ" | "Từ chối cấp Giấy ĐKHĐ" | "Đã hợp nhất"
export const ORG_STATUSES: OrgStatus[] = [
  "Đang hoạt động", "Chờ thành lập", "Chưa hoạt động", "Chấm dứt hoạt động", "Giải thể",
  "Thu hồi QĐ cho phép thành lập", "Chờ cấp Giấy ĐKHĐ", "Từ chối cấp Giấy ĐKHĐ", "Đã hợp nhất",
]
export const STATUS_BADGE: Record<OrgStatus, { bg: string; fg: string }> = {
  "Đang hoạt động": { bg: "#ecfdf5", fg: "#047857" },
  "Chờ thành lập": { bg: "#eff6ff", fg: "#1d4ed8" },
  "Chưa hoạt động": { bg: "#f4f4f5", fg: "#52525b" },
  "Chấm dứt hoạt động": { bg: "#fef2f2", fg: "#b91c1c" },
  "Giải thể": { bg: "#fef2f2", fg: "#991b1b" },
  "Thu hồi QĐ cho phép thành lập": { bg: "#fff7ed", fg: "#c2410c" },
  "Chờ cấp Giấy ĐKHĐ": { bg: "#fefce8", fg: "#a16207" },
  "Từ chối cấp Giấy ĐKHĐ": { bg: "#fef2f2", fg: "#b91c1c" },
  "Đã hợp nhất": { bg: "#f5f3ff", fg: "#6d28d9" },
}
export const PROVINCES_34 = [
  "Hà Nội", "Hải Phòng", "Đà Nẵng", "Huế", "Cần Thơ", "TP. Hồ Chí Minh",
  "Cao Bằng", "Lạng Sơn", "Lai Châu", "Điện Biên", "Sơn La", "Lào Cai", "Tuyên Quang",
  "Thái Nguyên", "Phú Thọ", "Bắc Ninh", "Hưng Yên", "Ninh Bình", "Quảng Ninh",
  "Thanh Hóa", "Nghệ An", "Hà Tĩnh", "Quảng Trị", "Quảng Ngãi", "Gia Lai", "Khánh Hòa",
  "Lâm Đồng", "Đắk Lắk", "Đồng Nai", "Tây Ninh", "Đồng Tháp", "Vĩnh Long", "An Giang", "Cà Mau",
]
export const WARDS_BY_PROVINCE: Record<string, string[]> = {
  "Hà Nội": ["Phường Hoàn Kiếm", "Phường Ba Đình", "Phường Cầu Giấy", "Phường Đống Đa", "Phường Hai Bà Trưng"],
  "TP. Hồ Chí Minh": ["Phường Bến Thành", "Phường Tân Định", "Phường An Phú", "Phường Thủ Đức"],
  "Đà Nẵng": ["Phường Hải Châu", "Phường Thanh Khê", "Phường Sơn Trà"],
}
export const wardsOf = (province: string) => WARDS_BY_PROVINCE[province] ?? []

/* ============================ CÔNG CHỨNG VIÊN (gắn với tổ chức) ============================ */
export interface OrgCcv { id: string; hoTen: string; soGiayTo: string; soThe: string; chucVu: "Công chứng viên" | "Trưởng văn phòng"; trangThai: string }
const CCV_BY_ORG: Record<string, OrgCcv[]> = {
  "org-01": [
    { id: "ccv-01", hoTen: "Nguyễn Văn A", soGiayTo: "001078012345", soThe: "THN-12345", chucVu: "Trưởng văn phòng", trangThai: "Đang hành nghề" },
    { id: "ccv-02", hoTen: "Lê Thị D", soGiayTo: "001078054321", soThe: "THN-22345", chucVu: "Công chứng viên", trangThai: "Đang hành nghề" },
  ],
  "org-02": [
    { id: "ccv-03", hoTen: "Phạm Văn Đ", soGiayTo: "001078099887", soThe: "THN-33345", chucVu: "Trưởng văn phòng", trangThai: "Đang hành nghề" },
  ],
  "org-03": [
    { id: "ccv-04", hoTen: "Trần Văn B", soGiayTo: "079088123456", soThe: "THN-44345", chucVu: "Trưởng văn phòng", trangThai: "Đang hành nghề" },
    { id: "ccv-05", hoTen: "Ngô Thị E", soGiayTo: "079088654321", soThe: "THN-55345", chucVu: "Công chứng viên", trangThai: "Tạm đình chỉ hành nghề" },
  ],
  "org-04": [
    { id: "ccv-06", hoTen: "Trần Thị Bến", soGiayTo: "079088111222", soThe: "THN-66345", chucVu: "Trưởng văn phòng", trangThai: "Đang hành nghề" },
  ],
  "org-05": [
    { id: "ccv-07", hoTen: "Đỗ Văn Sông", soGiayTo: "048088333444", soThe: "THN-77345", chucVu: "Trưởng văn phòng", trangThai: "Đang hành nghề" },
  ],
}
export const ccvOf = (orgId: string) => CCV_BY_ORG[orgId] ?? []

/* ============================ TỔ CHỨC HÀNH NGHỀ CÔNG CHỨNG ============================ */
export interface TchnccOrg {
  id: string; maToChuc: string; ten: string; loaiHinh: OrgType; soTuPhap: string
  diaChi: string; tinhThanh: string; phuongXa: string; sdt?: string; email?: string; mst?: string
  trangThai: OrgStatus; truongVanPhongId?: string; version: number
  nguoiTao: string; ngayTao: string; nguoiCapNhat?: string; ngayCapNhat: string
}
let orgs: TchnccOrg[] = [
  { id: "org-01", maToChuc: "TCH001", ten: "VPCC Nguyễn Văn A", loaiHinh: "Văn phòng công chứng", soTuPhap: "Hà Nội", diaChi: "Số 12 Bà Triệu", tinhThanh: "Hà Nội", phuongXa: "Phường Hoàn Kiếm", sdt: "0241234567", email: "contact@vpccnva.vn", mst: "0101234567", trangThai: "Đang hoạt động", truongVanPhongId: "ccv-01", version: 1, nguoiTao: "Lê Văn Viên", ngayTao: "2024-03-10T08:00:00", ngayCapNhat: "2026-08-20T09:00:00" },
  { id: "org-02", maToChuc: "TCH002", ten: "Phòng Công chứng số 1", loaiHinh: "Phòng công chứng", soTuPhap: "Hà Nội", diaChi: "Số 5 Tràng Thi", tinhThanh: "Hà Nội", phuongXa: "Phường Ba Đình", sdt: "0247654321", trangThai: "Đang hoạt động", truongVanPhongId: "ccv-03", version: 1, nguoiTao: "Lê Văn Viên", ngayTao: "2023-01-15T08:00:00", ngayCapNhat: "2026-08-18T10:00:00" },
  { id: "org-03", maToChuc: "TCH003", ten: "VPCC Trần Văn B", loaiHinh: "Văn phòng công chứng", soTuPhap: "TP. Hồ Chí Minh", diaChi: "Số 20 Lê Lợi", tinhThanh: "TP. Hồ Chí Minh", phuongXa: "Phường Bến Thành", email: "vpcctvb@gmail.com", trangThai: "Đang hoạt động", truongVanPhongId: "ccv-04", version: 1, nguoiTao: "Nguyễn Thị Sài Gòn", ngayTao: "2022-06-01T08:00:00", ngayCapNhat: "2026-08-25T14:00:00" },
  { id: "org-04", maToChuc: "TCH004", ten: "VPCC Bến Thành", loaiHinh: "Văn phòng công chứng", soTuPhap: "TP. Hồ Chí Minh", diaChi: "Số 8 Nguyễn Huệ", tinhThanh: "TP. Hồ Chí Minh", phuongXa: "Phường Bến Thành", trangThai: "Chờ cấp Giấy ĐKHĐ", version: 1, nguoiTao: "Nguyễn Thị Sài Gòn", ngayTao: "2026-07-01T08:00:00", ngayCapNhat: "2026-08-15T11:00:00" },
  { id: "org-05", maToChuc: "TCH005", ten: "VPCC Sông Hàn", loaiHinh: "Văn phòng công chứng", soTuPhap: "Đà Nẵng", diaChi: "Số 30 Bạch Đằng", tinhThanh: "Đà Nẵng", phuongXa: "Phường Hải Châu", sdt: "0236123456", trangThai: "Đang hoạt động", truongVanPhongId: "ccv-07", version: 1, nguoiTao: "Hồ Thị Đà Nẵng", ngayTao: "2021-09-20T08:00:00", ngayCapNhat: "2026-08-10T09:00:00" },
  { id: "org-06", maToChuc: "TCH006", ten: "VPCC Hoàn Kiếm cũ", loaiHinh: "Văn phòng công chứng", soTuPhap: "Hà Nội", diaChi: "Số 45 Hàng Bài", tinhThanh: "Hà Nội", phuongXa: "Phường Hoàn Kiếm", trangThai: "Chấm dứt hoạt động", version: 2, nguoiTao: "Lê Văn Viên", ngayTao: "2018-04-12T08:00:00", nguoiCapNhat: "Lê Văn Viên", ngayCapNhat: "2026-06-01T10:00:00" },
]
const orgListeners = new Set<() => void>()
const emitOrgs = () => { orgs = [...orgs]; orgListeners.forEach((l) => l()) }
export const useOrgs = () => useSyncExternalStore((cb) => { orgListeners.add(cb); return () => orgListeners.delete(cb) }, () => orgs)
export const getOrg = (id: string) => orgs.find((o) => o.id === id)
export function ordersInScope(role: OrgRole) {
  if (!canViewOrg(role)) return []
  const p = scopeProvinceFor(role)
  return p ? orgs.filter((o) => o.tinhThanh === p) : orgs
}
let orgSeq = orgs.length
function genMaToChuc() { orgSeq += 1; return `TCH${String(orgSeq).padStart(3, "0")}` }

export type SaveOrgResult = { ok: true; org: TchnccOrg } | { ok: false; reason: string }
export function createOrg(input: Omit<TchnccOrg, "id" | "maToChuc" | "version" | "nguoiTao" | "ngayTao" | "ngayCapNhat">, nguoiTao: string): SaveOrgResult {
  const dupMst = input.mst && orgs.some((o) => o.mst === input.mst)
  if (dupMst) return { ok: false, reason: "Mã số thuế đã tồn tại, vui lòng kiểm tra lại." }
  const dupName = orgs.some((o) => o.soTuPhap === input.soTuPhap && normalizeName(o.ten) === normalizeName(input.ten))
  if (dupName) return { ok: false, reason: "Tên tổ chức công chứng đã tồn tại trong phạm vi Sở Tư pháp này." }
  const rec: TchnccOrg = { ...input, id: `org-${Date.now()}`, maToChuc: genMaToChuc(), version: 1, nguoiTao, ngayTao: NOW_ISO, ngayCapNhat: NOW_ISO }
  orgs = [rec, ...orgs]; emitOrgs()
  return { ok: true, org: rec }
}
export function updateOrg(id: string, patch: Partial<Pick<TchnccOrg, "ten" | "loaiHinh" | "diaChi" | "tinhThanh" | "phuongXa" | "sdt" | "email" | "mst" | "trangThai">>, expectedVersion: number, nguoiCapNhat: string): SaveOrgResult {
  const cur = getOrg(id)
  if (!cur) return { ok: false, reason: "Bản ghi không tồn tại hoặc đã bị xóa." }
  if (cur.version !== expectedVersion) return { ok: false, reason: "Thông tin tổ chức công chứng đã được người khác cập nhật. Vui lòng tải lại dữ liệu trước khi tiếp tục." }
  if (patch.mst && orgs.some((o) => o.id !== id && o.mst === patch.mst)) return { ok: false, reason: "Mã số thuế đã tồn tại." }
  const ten = patch.ten ?? cur.ten
  const soTuPhap = cur.soTuPhap
  if (orgs.some((o) => o.id !== id && o.soTuPhap === soTuPhap && normalizeName(o.ten) === normalizeName(ten))) {
    return { ok: false, reason: "Tên tổ chức công chứng đã tồn tại trong phạm vi Sở Tư pháp này." }
  }
  const updated: TchnccOrg = { ...cur, ...patch, version: cur.version + 1, nguoiCapNhat, ngayCapNhat: NOW_ISO }
  orgs = orgs.map((o) => (o.id === id ? updated : o)); emitOrgs()
  return { ok: true, org: updated }
}
export function terminateOrg(id: string, expectedVersion: number, actor: string): SaveOrgResult {
  const cur = getOrg(id)
  if (!cur) return { ok: false, reason: "Không tìm thấy tổ chức công chứng hoặc bạn không có quyền thực hiện." }
  if (cur.trangThai === "Chấm dứt hoạt động") return { ok: false, reason: "Tổ chức công chứng đã ở trạng thái Chấm dứt hoạt động." }
  if (cur.version !== expectedVersion) return { ok: false, reason: "Thông tin hoặc trạng thái của tổ chức đã thay đổi. Vui lòng tải lại và xác nhận lại." }
  const updated: TchnccOrg = { ...cur, trangThai: "Chấm dứt hoạt động", version: cur.version + 1, nguoiCapNhat: actor, ngayCapNhat: NOW_ISO }
  orgs = orgs.map((o) => (o.id === id ? updated : o)); emitOrgs()
  addHistory({ orgId: id, orgTen: updated.ten, soTuPhap: updated.soTuPhap, diaChi: updated.diaChi, thaoTac: "Chấm dứt hoạt động", nguoiThucHien: actor, diaChiIp: "10.0.0.12", noiDung: `Chuyển trạng thái từ "${cur.trangThai}" sang "Chấm dứt hoạt động"`, changes: [{ truong: "Trạng thái", cu: cur.trangThai, moi: "Chấm dứt hoạt động" }] })
  return { ok: true, org: updated }
}

/* ============================ LỊCH SỬ CẬP NHẬT (UC414) ============================ */
export interface HistoryChange { truong: string; cu: string; moi: string }
export interface OrgHistoryEntry {
  id: string; orgId: string; orgTen: string; soTuPhap: string; diaChi: string
  thaoTac: "Thêm mới" | "Cập nhật" | "Chấm dứt hoạt động"
  nguoiThucHien: string; diaChiIp: string; thoiGian: string; noiDung: string; changes: HistoryChange[]
}
let history: OrgHistoryEntry[] = [
  { id: "h-01", orgId: "org-01", orgTen: "VPCC Nguyễn Văn A", soTuPhap: "Hà Nội", diaChi: "Số 12 Bà Triệu", thaoTac: "Thêm mới", nguoiThucHien: "Lê Văn Viên", diaChiIp: "10.0.0.12", thoiGian: "2024-03-10T08:00:00", noiDung: "Tạo mới tổ chức công chứng VPCC Nguyễn Văn A", changes: [] },
  { id: "h-02", orgId: "org-01", orgTen: "VPCC Nguyễn Văn A", soTuPhap: "Hà Nội", diaChi: "Số 12 Bà Triệu", thaoTac: "Cập nhật", nguoiThucHien: "Lê Văn Viên", diaChiIp: "10.0.0.12", thoiGian: "2026-08-20T09:00:00", noiDung: "Cập nhật thông tin liên hệ", changes: [{ truong: "Email", cu: "-", moi: "contact@vpccnva.vn" }] },
  { id: "h-03", orgId: "org-06", orgTen: "VPCC Hoàn Kiếm cũ", soTuPhap: "Hà Nội", diaChi: "Số 45 Hàng Bài", thaoTac: "Chấm dứt hoạt động", nguoiThucHien: "Lê Văn Viên", diaChiIp: "10.0.0.12", thoiGian: "2026-06-01T10:00:00", noiDung: 'Chuyển trạng thái từ "Đang hoạt động" sang "Chấm dứt hoạt động"', changes: [{ truong: "Trạng thái", cu: "Đang hoạt động", moi: "Chấm dứt hoạt động" }] },
]
const historyListeners = new Set<() => void>()
const emitHistory = () => { history = [...history]; historyListeners.forEach((l) => l()) }
export const useHistory = () => useSyncExternalStore((cb) => { historyListeners.add(cb); return () => historyListeners.delete(cb) }, () => history)
export const getHistoryEntry = (id: string) => history.find((h) => h.id === id)
export const HISTORY_ACTIONS: OrgHistoryEntry["thaoTac"][] = ["Thêm mới", "Cập nhật", "Chấm dứt hoạt động"]
function addHistory(input: Omit<OrgHistoryEntry, "id" | "thoiGian">) {
  history = [{ ...input, id: `h-${Date.now()}`, thoiGian: NOW_ISO }, ...history]; emitHistory()
}
export function recordCreateHistory(org: TchnccOrg, actor: string) {
  addHistory({ orgId: org.id, orgTen: org.ten, soTuPhap: org.soTuPhap, diaChi: org.diaChi, thaoTac: "Thêm mới", nguoiThucHien: actor, diaChiIp: "10.0.0.12", noiDung: `Tạo mới tổ chức công chứng ${org.ten}`, changes: [] })
}
export function recordUpdateHistory(before: TchnccOrg, after: TchnccOrg, actor: string) {
  const changes: HistoryChange[] = []
  const fields: { key: keyof TchnccOrg; label: string }[] = [
    { key: "ten", label: "Tên tổ chức" }, { key: "loaiHinh", label: "Loại tổ chức" }, { key: "diaChi", label: "Địa chỉ" },
    { key: "tinhThanh", label: "Tỉnh/Thành phố" }, { key: "phuongXa", label: "Phường/Xã" }, { key: "sdt", label: "Số điện thoại" },
    { key: "email", label: "Email" }, { key: "mst", label: "Mã số thuế" }, { key: "trangThai", label: "Trạng thái" },
  ]
  for (const f of fields) {
    const cu = String(before[f.key] ?? "")
    const moi = String(after[f.key] ?? "")
    if (cu !== moi) changes.push({ truong: f.label, cu: cu || "-", moi: moi || "-" })
  }
  if (changes.length === 0) return
  addHistory({ orgId: after.id, orgTen: after.ten, soTuPhap: after.soTuPhap, diaChi: after.diaChi, thaoTac: "Cập nhật", nguoiThucHien: actor, diaChiIp: "10.0.0.12", noiDung: `Cập nhật thông tin tổ chức ${after.ten}`, changes })
}
