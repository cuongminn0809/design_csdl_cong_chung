import { useSyncExternalStore } from "react"

import { CURRENT_ORG_USER, NOTI_ROLES, roleLabel, type NotiRole } from "../notifications/config"
import { CCV_STATUS_OPTIONS, ccvStatusMeta, certStatusMeta } from "../ccv/config"
import { ORG_HOME_PROVINCE, PROVINCES_34, isBoRole, isStpRole, wardsOf, getOrg, useOrgs, type TchnccOrg } from "../orgManagement/config"

export { CURRENT_ORG_USER, NOTI_ROLES, roleLabel, CCV_STATUS_OPTIONS, ccvStatusMeta, certStatusMeta, ORG_HOME_PROVINCE, PROVINCES_34, wardsOf, useOrgs, isStpRole, isBoRole }
export type CcvRole = NotiRole

/* ============================ NGÀY DEMO CỐ ĐỊNH ============================ */
export const TODAY_ISO = "2026-08-28"
export const NOW_ISO = "2026-08-28T09:00:00"
export const fmtVN = (iso: string) => { const [y, m, d] = iso.split("-"); return `${d}/${m}/${y}` }
export const fmtVNDateTime = (iso: string) => { const [d, t] = iso.split("T"); return `${fmtVN(d)} ${(t ?? "").slice(0, 8)}`.trim() }
export const normalizeEmail = (s: string) => s.trim().toLowerCase()

/* ============================ PHẠM VI QUYỀN (BR-01/BR-06/BR-09) ============================ */
export const canManageCcv = (r: CcvRole) => r === "cv_stp"
export const canViewCcv = (r: CcvRole) => isStpRole(r) || isBoRole(r)
export const canExportCcv = (r: CcvRole) => isStpRole(r) || isBoRole(r)
export const canViewHistory = (r: CcvRole) => isStpRole(r)
export const canViewCert = (r: CcvRole) => canViewCcv(r)
export const canViewPracticeHistory = (r: CcvRole) => canViewCcv(r)
export const canViewStatsProvince = (r: CcvRole) => isStpRole(r)
export const canViewStatsNational = (r: CcvRole) => isBoRole(r)
export const scopeProvinceFor = (r: CcvRole) => (isStpRole(r) ? ORG_HOME_PROVINCE : undefined)

export const GENDERS = ["Nam", "Nữ"]
export const NATIONALITIES = ["Việt Nam", "Khác"]
export const TARGET_STATUS = "Thu hồi thẻ"
export const HEADLINE_STATUSES = ["Đang hành nghề", "Tạm đình chỉ hành nghề", "Đã miễn nhiệm"] as const

/* ============================ KIỂU DỮ LIỆU ============================ */
export interface CcvCertificate { soChungChi: string; ngayCap: string; noiCap: string; ngayHieuLuc: string; ngayHetHan: string; donViCap: string; trangThai: string; fileDinhKem?: string }
export const emptyCert = (): CcvCertificate => ({ soChungChi: "", ngayCap: "", noiCap: "", ngayHieuLuc: "", ngayHetHan: "", donViCap: "", trangThai: "Còn hiệu lực" })

export interface PracticeEntry {
  id: string; toChucId?: string; toChucTen: string; tuNgay: string; denNgay?: string
  trangThai: "Đang hành nghề" | "Đã kết thúc"; soThe?: string; soQuyetDinh?: string; ngayQuyetDinh?: string; ngayHieuLuc?: string; ghiChu?: string; fileDinhKem?: string
}

export interface Ccv {
  id: string; maCcv: string; anhDaiDien?: string
  hoTen: string; ngaySinh?: string; gioiTinh: string; quocTich: string; danToc?: string
  sdt?: string; email: string
  soGiayTo: string; ngayCapGiayTo: string; noiCapGiayTo: string
  diaChiThuongTru: string; tinhThanh: string; phuongXa: string
  trangThai: string
  soTuPhap: string
  toChucCongChungId?: string
  soThe?: string
  laTruongVanPhong: boolean
  certificate: CcvCertificate
  version: number
  nguoiTao: string; ngayTao: string; nguoiCapNhat?: string; ngayCapNhat?: string
}

export const orgNameOf = (id?: string) => (id ? getOrg(id)?.ten : undefined)
export const orgAddressOf = (id?: string) => { const o = id ? getOrg(id) : undefined; return o ? `${o.diaChi}, ${o.phuongXa}, ${o.tinhThanh}` : undefined }
export const activeOrgsIn = (province: string, allOrgs: TchnccOrg[]): TchnccOrg[] => allOrgs.filter((o) => o.tinhThanh === province && o.trangThai === "Đang hoạt động")

/* ============================ DỮ LIỆU MẪU ============================ */
let ccvs: Ccv[] = [
  {
    id: "ccvm-01", maCcv: "CCV001", hoTen: "Nguyễn Văn A", ngaySinh: "1978-03-15", gioiTinh: "Nam", quocTich: "Việt Nam", danToc: "Kinh",
    sdt: "0901234567", email: "nva@vpccnva.vn", soGiayTo: "001078012345", ngayCapGiayTo: "2018-10-10", noiCapGiayTo: "Cục CS ĐKQL cư trú và DLQG về dân cư",
    diaChiThuongTru: "Số 34 Nguyễn Trãi", tinhThanh: "Hà Nội", phuongXa: "Phường Thanh Xuân Trung", trangThai: "Đang hành nghề",
    soTuPhap: "Hà Nội", toChucCongChungId: "org-01", soThe: "THN-12345", laTruongVanPhong: true,
    certificate: { soChungChi: "CCHN-9999", ngayCap: "2010-05-15", noiCap: "Bộ Tư pháp", ngayHieuLuc: "2010-06-01", ngayHetHan: "", donViCap: "Bộ Tư pháp", trangThai: "Còn hiệu lực" },
    version: 1, nguoiTao: "Lê Văn Viên", ngayTao: "2024-03-10T08:00:00", ngayCapNhat: "2026-08-20T09:00:00",
  },
  {
    id: "ccvm-02", maCcv: "CCV002", hoTen: "Lê Thị D", ngaySinh: "1985-09-20", gioiTinh: "Nữ", quocTich: "Việt Nam", danToc: "Kinh",
    sdt: "0905111222", email: "ltd@vpccnva.vn", soGiayTo: "001085006789", ngayCapGiayTo: "2020-05-05", noiCapGiayTo: "Cục CS ĐKQL cư trú và DLQG về dân cư",
    diaChiThuongTru: "Số 8 Trần Phú", tinhThanh: "Hà Nội", phuongXa: "Phường Hoàn Kiếm", trangThai: "Đang hành nghề",
    soTuPhap: "Hà Nội", toChucCongChungId: "org-01", soThe: "THN-22345", laTruongVanPhong: false,
    certificate: { soChungChi: "CCHN-8888", ngayCap: "2013-08-20", noiCap: "Bộ Tư pháp", ngayHieuLuc: "2013-09-01", ngayHetHan: "", donViCap: "Bộ Tư pháp", trangThai: "Còn hiệu lực" },
    version: 1, nguoiTao: "Lê Văn Viên", ngayTao: "2024-05-02T08:00:00", ngayCapNhat: "2026-08-18T10:00:00",
  },
  {
    id: "ccvm-03", maCcv: "CCV003", hoTen: "Phạm Văn Đ", ngaySinh: "1972-02-02", gioiTinh: "Nam", quocTich: "Việt Nam", danToc: "Kinh",
    sdt: "0908333444", email: "pvd@pcc1hn.vn", soGiayTo: "001072004321", ngayCapGiayTo: "2019-12-12", noiCapGiayTo: "Cục CS ĐKQL cư trú và DLQG về dân cư",
    diaChiThuongTru: "Số 22 Nguyễn Huệ", tinhThanh: "Hà Nội", phuongXa: "Phường Ba Đình", trangThai: "Đang hành nghề",
    soTuPhap: "Hà Nội", toChucCongChungId: "org-02", soThe: "THN-33345", laTruongVanPhong: true,
    certificate: { soChungChi: "CCHN-7777", ngayCap: "2008-03-10", noiCap: "Bộ Tư pháp", ngayHieuLuc: "2008-04-01", ngayHetHan: "", donViCap: "Bộ Tư pháp", trangThai: "Còn hiệu lực" },
    version: 1, nguoiTao: "Lê Văn Viên", ngayTao: "2022-06-01T08:00:00", ngayCapNhat: "2026-08-25T14:00:00",
  },
  {
    id: "ccvm-04", maCcv: "CCV004", hoTen: "Nguyễn Thị F", ngaySinh: "1992-05-25", gioiTinh: "Nữ", quocTich: "Việt Nam", danToc: "Kinh",
    sdt: "0902777888", email: "ntf@example.vn", soGiayTo: "001192007766", ngayCapGiayTo: "2022-03-15", noiCapGiayTo: "Cục CS ĐKQL cư trú và DLQG về dân cư",
    diaChiThuongTru: "Số 40 Giải Phóng", tinhThanh: "Hà Nội", phuongXa: "Phường Đống Đa", trangThai: "Đăng ký tập sự",
    soTuPhap: "Hà Nội", toChucCongChungId: undefined, laTruongVanPhong: false,
    certificate: emptyCert(),
    version: 1, nguoiTao: "Lê Văn Viên", ngayTao: "2026-07-18T11:20:00", ngayCapNhat: "2026-07-18T11:20:00",
  },
  {
    id: "ccvm-05", maCcv: "CCV005", hoTen: "Phạm Thị Kiếm", ngaySinh: "1980-07-18", gioiTinh: "Nữ", quocTich: "Việt Nam", danToc: "Kinh",
    sdt: "0903555666", email: "ptk@example.vn", soGiayTo: "001180009988", ngayCapGiayTo: "2021-01-01", noiCapGiayTo: "Cục CS ĐKQL cư trú và DLQG về dân cư",
    diaChiThuongTru: "Số 9 Lý Thường Kiệt", tinhThanh: "Hà Nội", phuongXa: "Phường Hoàn Kiếm", trangThai: "Tạm đình chỉ hành nghề",
    soTuPhap: "Hà Nội", toChucCongChungId: undefined, soThe: "THN-12348", laTruongVanPhong: false,
    certificate: { soChungChi: "CCHN-6666", ngayCap: "2011-05-05", noiCap: "Bộ Tư pháp", ngayHieuLuc: "2011-06-01", ngayHetHan: "2026-05-05", donViCap: "Bộ Tư pháp", trangThai: "Hết hiệu lực" },
    version: 2, nguoiTao: "Lê Văn Viên", ngayTao: "2020-07-20T08:00:00", nguoiCapNhat: "Lê Văn Viên", ngayCapNhat: "2026-06-05T08:00:00",
  },
  {
    id: "ccvm-06", maCcv: "CCV006", hoTen: "Trần Văn B", ngaySinh: "1983-11-30", gioiTinh: "Nam", quocTich: "Việt Nam", danToc: "Kinh",
    sdt: "0907888999", email: "tvb@vpcctvb.vn", soGiayTo: "079083001122", ngayCapGiayTo: "2020-06-20", noiCapGiayTo: "Cục CS ĐKQL cư trú và DLQG về dân cư",
    diaChiThuongTru: "Số 3 Nguyễn Trung Trực", tinhThanh: "TP. Hồ Chí Minh", phuongXa: "Phường Bến Thành", trangThai: "Đang hành nghề",
    soTuPhap: "TP. Hồ Chí Minh", toChucCongChungId: "org-03", soThe: "THN-44345", laTruongVanPhong: true,
    certificate: { soChungChi: "CCHN-5555", ngayCap: "2014-09-18", noiCap: "Bộ Tư pháp", ngayHieuLuc: "2014-10-01", ngayHetHan: "", donViCap: "Bộ Tư pháp", trangThai: "Còn hiệu lực" },
    version: 1, nguoiTao: "Nguyễn Thị Sài Gòn", ngayTao: "2022-06-01T08:00:00", ngayCapNhat: "2026-08-10T09:00:00",
  },
]
const ccvListeners = new Set<() => void>()
const emitCcvs = () => { ccvs = [...ccvs]; ccvListeners.forEach((l) => l()) }
export const useCcvs = () => useSyncExternalStore((cb) => { ccvListeners.add(cb); return () => ccvListeners.delete(cb) }, () => ccvs)
export const getCcv = (id: string) => ccvs.find((c) => c.id === id)
export function ccvsInScope(role: CcvRole) {
  if (!canViewCcv(role)) return []
  const p = scopeProvinceFor(role)
  return p ? ccvs.filter((c) => c.soTuPhap === p) : ccvs
}
let ccvSeq = ccvs.length
function genMaCcv() { ccvSeq += 1; return `CCV${String(ccvSeq).padStart(3, "0")}` }

/* ============================ LỊCH SỬ HÀNH NGHỀ (UC421, BR-02/BR-03/BR-421-03) ============================ */
let practice: Record<string, PracticeEntry[]> = {
  "ccvm-01": [{ id: "ph-01", toChucId: "org-01", toChucTen: "VPCC Nguyễn Văn A", tuNgay: "2024-03-10", trangThai: "Đang hành nghề", soThe: "THN-12345", soQuyetDinh: "QĐ-101/2024", ngayQuyetDinh: "2024-03-05", ngayHieuLuc: "2024-03-10" }],
  "ccvm-02": [{ id: "ph-02", toChucId: "org-01", toChucTen: "VPCC Nguyễn Văn A", tuNgay: "2024-05-02", trangThai: "Đang hành nghề", soThe: "THN-22345", soQuyetDinh: "QĐ-142/2024", ngayQuyetDinh: "2024-04-28", ngayHieuLuc: "2024-05-02" }],
  "ccvm-03": [{ id: "ph-03", toChucId: "org-02", toChucTen: "Phòng Công chứng số 1", tuNgay: "2022-06-01", trangThai: "Đang hành nghề", soThe: "THN-33345", soQuyetDinh: "QĐ-088/2022", ngayQuyetDinh: "2022-05-25", ngayHieuLuc: "2022-06-01" }],
  "ccvm-05": [{ id: "ph-05", toChucId: "org-06", toChucTen: "VPCC Hoàn Kiếm cũ", tuNgay: "2020-07-20", denNgay: "2026-06-01", trangThai: "Đã kết thúc", soThe: "THN-12348", ghiChu: "Kết thúc do tổ chức chuyển sang Chấm dứt hoạt động" }],
  "ccvm-06": [{ id: "ph-06", toChucId: "org-03", toChucTen: "VPCC Trần Văn B", tuNgay: "2022-06-01", trangThai: "Đang hành nghề", soThe: "THN-44345", soQuyetDinh: "QĐ-055/2022", ngayQuyetDinh: "2022-05-20", ngayHieuLuc: "2022-06-01" }],
}
const practiceListeners = new Set<() => void>()
const emitPractice = () => { practice = { ...practice }; practiceListeners.forEach((l) => l()) }
export const usePracticeHistory = (ccvId: string) => useSyncExternalStore((cb) => { practiceListeners.add(cb); return () => practiceListeners.delete(cb) }, () => practice[ccvId] ?? [])
function sortedPractice(list: PracticeEntry[]) {
  return [...list].sort((a, b) => {
    if (a.trangThai !== b.trangThai) return a.trangThai === "Đang hành nghề" ? -1 : 1
    return b.tuNgay.localeCompare(a.tuNgay)
  })
}
export const getPracticeHistory = (ccvId: string) => sortedPractice(practice[ccvId] ?? [])
let practiceSeq = 100
function addPracticeEntry(ccvId: string, entry: Omit<PracticeEntry, "id">) {
  const list = practice[ccvId] ?? []
  practice = { ...practice, [ccvId]: [{ ...entry, id: `ph-${++practiceSeq}` }, ...list] }
  emitPractice()
}
function endPracticeEntry(ccvId: string, orgId?: string) {
  if (!orgId) return
  const list = practice[ccvId] ?? []
  practice = { ...practice, [ccvId]: list.map((p) => (p.toChucId === orgId && p.trangThai === "Đang hành nghề" ? { ...p, denNgay: TODAY_ISO, trangThai: "Đã kết thúc" } : p)) }
  emitPractice()
}

/* ============================ LƯU CCV (BR-14..BR-21, BR-U01..BR-U08, BR-X01..BR-X06) ============================ */
export type SaveCcvResult = { ok: true; ccv: Ccv } | { ok: false; reason: string }
type CcvInput = Omit<Ccv, "id" | "maCcv" | "version" | "nguoiTao" | "ngayTao" | "ngayCapNhat">

function checkOrgAndHead(orgId: string | undefined, wantHead: boolean, excludeCcvId?: string): string | null {
  if (orgId) {
    const org = getOrg(orgId)
    if (!org || org.trangThai !== "Đang hoạt động") return "Tổ chức hành nghề công chứng đã chọn không còn hoạt động hoặc không thuộc phạm vi quản lý."
    if (wantHead && ccvs.some((c) => c.id !== excludeCcvId && c.toChucCongChungId === orgId && c.laTruongVanPhong)) {
      return "Tổ chức hành nghề công chứng chưa được chọn hoặc đã có trưởng văn phòng khác."
    }
  } else if (wantHead) {
    return "Hãy chọn tổ chức hành nghề công chứng chưa có trưởng văn phòng trước khi xác định vai trò Trưởng văn phòng."
  }
  return null
}

export function createCcv(input: CcvInput, nguoiTao: string): SaveCcvResult {
  if (ccvs.some((c) => c.soGiayTo === input.soGiayTo)) return { ok: false, reason: "Số CCCD/CMND/Hộ chiếu đã tồn tại." }
  if (input.soThe && ccvs.some((c) => c.soThe === input.soThe)) return { ok: false, reason: "Số thẻ đã tồn tại." }
  if (ccvs.some((c) => normalizeEmail(c.email) === normalizeEmail(input.email))) return { ok: false, reason: "Email đã được sử dụng bởi công chứng viên khác." }
  const headErr = checkOrgAndHead(input.toChucCongChungId, input.laTruongVanPhong)
  if (headErr) return { ok: false, reason: headErr }
  const rec: Ccv = { ...input, id: `ccvm-${Date.now()}`, maCcv: genMaCcv(), version: 1, nguoiTao, ngayTao: NOW_ISO, ngayCapNhat: NOW_ISO }
  ccvs = [rec, ...ccvs]; emitCcvs()
  if (rec.toChucCongChungId) {
    addPracticeEntry(rec.id, { toChucId: rec.toChucCongChungId, toChucTen: orgNameOf(rec.toChucCongChungId) ?? "", tuNgay: TODAY_ISO, trangThai: "Đang hành nghề", soThe: rec.soThe })
  }
  recordCreateHistory(rec, nguoiTao)
  return { ok: true, ccv: rec }
}

export function updateCcv(id: string, patch: Partial<CcvInput>, expectedVersion: number, nguoiCapNhat: string): SaveCcvResult {
  const cur = getCcv(id)
  if (!cur) return { ok: false, reason: "Bản ghi không tồn tại hoặc đã bị xóa." }
  if (cur.version !== expectedVersion) return { ok: false, reason: "Thông tin công chứng viên đã được người khác cập nhật. Vui lòng tải lại dữ liệu trước khi tiếp tục." }
  if (patch.soThe && ccvs.some((c) => c.id !== id && c.soThe === patch.soThe)) return { ok: false, reason: "Số thẻ đã tồn tại." }
  if (patch.email && ccvs.some((c) => c.id !== id && normalizeEmail(c.email) === normalizeEmail(patch.email!))) return { ok: false, reason: "Email đã được sử dụng bởi công chứng viên khác." }
  const newOrgId = "toChucCongChungId" in patch ? patch.toChucCongChungId : cur.toChucCongChungId
  const newHead = patch.laTruongVanPhong ?? cur.laTruongVanPhong
  const headErr = checkOrgAndHead(newOrgId, newHead, id)
  if (headErr) return { ok: false, reason: headErr }
  const updated: Ccv = { ...cur, ...patch, toChucCongChungId: newOrgId, laTruongVanPhong: newHead, version: cur.version + 1, nguoiCapNhat, ngayCapNhat: NOW_ISO }
  ccvs = ccvs.map((c) => (c.id === id ? updated : c)); emitCcvs()
  if (cur.toChucCongChungId !== updated.toChucCongChungId) {
    endPracticeEntry(id, cur.toChucCongChungId)
    if (updated.toChucCongChungId) addPracticeEntry(id, { toChucId: updated.toChucCongChungId, toChucTen: orgNameOf(updated.toChucCongChungId) ?? "", tuNgay: TODAY_ISO, trangThai: "Đang hành nghề", soThe: updated.soThe })
  }
  recordUpdateHistory(cur, updated, nguoiCapNhat)
  return { ok: true, ccv: updated }
}

export function changeCcvStatus(id: string, expectedVersion: number, actor: string): SaveCcvResult {
  const cur = getCcv(id)
  if (!cur) return { ok: false, reason: "Không tìm thấy công chứng viên hoặc bạn không có quyền chuyển trạng thái." }
  if (cur.trangThai === TARGET_STATUS) return { ok: false, reason: "Công chứng viên đã ở trạng thái Thu hồi thẻ." }
  if (cur.version !== expectedVersion) return { ok: false, reason: "Thông tin Công chứng viên đã được người khác cập nhật. Vui lòng tải lại dữ liệu và xác nhận lại." }
  const updated: Ccv = { ...cur, trangThai: TARGET_STATUS, version: cur.version + 1, nguoiCapNhat: actor, ngayCapNhat: NOW_ISO }
  ccvs = ccvs.map((c) => (c.id === id ? updated : c)); emitCcvs()
  recordStatusHistory(cur, updated, actor)
  return { ok: true, ccv: updated }
}

/* ============================ LỊCH SỬ CẬP NHẬT (UC418) ============================ */
export interface HistoryChange { truong: string; cu: string; moi: string }
export interface CcvHistoryEntry {
  id: string; ccvId: string; ccvTen: string; toChuc: string; soThe: string
  thaoTac: "Thêm mới" | "Cập nhật"
  nguoiThucHien: string; diaChiIp: string; thoiGian: string; noiDung: string; changes: HistoryChange[]
}
let history: CcvHistoryEntry[] = [
  { id: "ch-01", ccvId: "ccvm-01", ccvTen: "Nguyễn Văn A", toChuc: "VPCC Nguyễn Văn A", soThe: "THN-12345", thaoTac: "Thêm mới", nguoiThucHien: "Lê Văn Viên", diaChiIp: "10.0.0.12", thoiGian: "2024-03-10T08:00:00", noiDung: "Tạo mới công chứng viên Nguyễn Văn A", changes: [] },
  { id: "ch-02", ccvId: "ccvm-01", ccvTen: "Nguyễn Văn A", toChuc: "VPCC Nguyễn Văn A", soThe: "THN-12345", thaoTac: "Cập nhật", nguoiThucHien: "Lê Văn Viên", diaChiIp: "10.0.0.12", thoiGian: "2026-08-20T09:00:00", noiDung: "Cập nhật thông tin liên hệ", changes: [{ truong: "Số điện thoại", cu: "-", moi: "0901234567" }] },
  { id: "ch-03", ccvId: "ccvm-05", ccvTen: "Phạm Thị Kiếm", toChuc: "-", soThe: "THN-12348", thaoTac: "Cập nhật", nguoiThucHien: "Lê Văn Viên", diaChiIp: "10.0.0.12", thoiGian: "2026-06-05T08:00:00", noiDung: "Cập nhật do tổ chức hành nghề chấm dứt hoạt động", changes: [{ truong: "Tổ chức công chứng", cu: "VPCC Hoàn Kiếm cũ", moi: "-" }] },
]
const historyListeners = new Set<() => void>()
const emitHistory = () => { history = [...history]; historyListeners.forEach((l) => l()) }
export const useHistory = () => useSyncExternalStore((cb) => { historyListeners.add(cb); return () => historyListeners.delete(cb) }, () => history)
export const getHistoryEntry = (id: string) => history.find((h) => h.id === id)
export const HISTORY_ACTIONS: CcvHistoryEntry["thaoTac"][] = ["Thêm mới", "Cập nhật"]
function addHistory(input: Omit<CcvHistoryEntry, "id" | "thoiGian">) {
  history = [{ ...input, id: `ch-${Date.now()}`, thoiGian: NOW_ISO }, ...history]; emitHistory()
}
export function recordCreateHistory(ccv: Ccv, actor: string) {
  addHistory({ ccvId: ccv.id, ccvTen: ccv.hoTen, toChuc: orgNameOf(ccv.toChucCongChungId) ?? "-", soThe: ccv.soThe ?? "-", thaoTac: "Thêm mới", nguoiThucHien: actor, diaChiIp: "10.0.0.12", noiDung: `Tạo mới công chứng viên ${ccv.hoTen}`, changes: [] })
}
function diffFields(before: Ccv, after: Ccv): HistoryChange[] {
  const changes: HistoryChange[] = []
  const simple: { key: keyof Ccv; label: string }[] = [
    { key: "hoTen", label: "Họ và tên" }, { key: "ngaySinh", label: "Ngày sinh" }, { key: "gioiTinh", label: "Giới tính" },
    { key: "quocTich", label: "Quốc tịch" }, { key: "danToc", label: "Dân tộc" }, { key: "sdt", label: "Số điện thoại" },
    { key: "email", label: "Email" }, { key: "diaChiThuongTru", label: "Địa chỉ thường trú" }, { key: "tinhThanh", label: "Tỉnh/Thành phố" },
    { key: "phuongXa", label: "Phường/Xã" }, { key: "trangThai", label: "Trạng thái" }, { key: "soThe", label: "Số thẻ" },
  ]
  for (const f of simple) {
    const cu = String(before[f.key] ?? ""); const moi = String(after[f.key] ?? "")
    if (cu !== moi) changes.push({ truong: f.label, cu: cu || "-", moi: moi || "-" })
  }
  if (before.toChucCongChungId !== after.toChucCongChungId) {
    changes.push({ truong: "Tổ chức công chứng", cu: orgNameOf(before.toChucCongChungId) ?? "-", moi: orgNameOf(after.toChucCongChungId) ?? "-" })
  }
  if (before.laTruongVanPhong !== after.laTruongVanPhong) {
    changes.push({ truong: "Trưởng văn phòng", cu: before.laTruongVanPhong ? "Có" : "Không", moi: after.laTruongVanPhong ? "Có" : "Không" })
  }
  const c1 = before.certificate, c2 = after.certificate
  const certFields: { key: keyof CcvCertificate; label: string }[] = [
    { key: "soChungChi", label: "Số chứng chỉ" }, { key: "ngayCap", label: "Ngày cấp CCHN" }, { key: "noiCap", label: "Nơi cấp CCHN" },
    { key: "ngayHieuLuc", label: "Ngày hiệu lực CCHN" }, { key: "ngayHetHan", label: "Ngày hết hạn CCHN" }, { key: "donViCap", label: "Đơn vị cấp" }, { key: "trangThai", label: "Trạng thái CCHN" },
  ]
  for (const f of certFields) {
    const cu = String(c1[f.key] ?? ""); const moi = String(c2[f.key] ?? "")
    if (cu !== moi) changes.push({ truong: f.label, cu: cu || "-", moi: moi || "-" })
  }
  return changes
}
export function recordUpdateHistory(before: Ccv, after: Ccv, actor: string) {
  const changes = diffFields(before, after)
  if (changes.length === 0) return
  addHistory({ ccvId: after.id, ccvTen: after.hoTen, toChuc: orgNameOf(after.toChucCongChungId) ?? "-", soThe: after.soThe ?? "-", thaoTac: "Cập nhật", nguoiThucHien: actor, diaChiIp: "10.0.0.12", noiDung: `Cập nhật thông tin công chứng viên ${after.hoTen}`, changes })
}
function recordStatusHistory(before: Ccv, after: Ccv, actor: string) {
  addHistory({ ccvId: after.id, ccvTen: after.hoTen, toChuc: orgNameOf(after.toChucCongChungId) ?? "-", soThe: after.soThe ?? "-", thaoTac: "Cập nhật", nguoiThucHien: actor, diaChiIp: "10.0.0.12", noiDung: `Chuyển trạng thái từ "${before.trangThai}" sang "${after.trangThai}"`, changes: [{ truong: "Trạng thái", cu: before.trangThai, moi: after.trangThai }] })
}
