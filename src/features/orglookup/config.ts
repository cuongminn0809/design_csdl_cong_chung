import type { StatusMeta } from "../ingestion/shared"
import { SO_TU_PHAP_OPTIONS } from "../ccv/config"

export { SO_TU_PHAP_OPTIONS }

/* ============================ DANH MỤC ============================ */
export const ORG_STATUS_OPTIONS = [
  "Đang hoạt động", "Chờ thành lập", "Tạm ngừng hoạt động", "Giải thể", "Chuyển đổi loại hình", "Chấm dứt hoạt động",
]
export const LOAI_TO_CHUC_OPTIONS = ["Văn phòng công chứng", "Phòng công chứng"]

export function orgStatusMeta(s: string): StatusMeta {
  if (s === "Đang hoạt động") return { label: s, bg: "#ecfdf5", fg: "#047857", dot: "#10b981", bd: "#a7f3d0" }
  if (s === "Chờ thành lập" || s === "Tạm ngừng hoạt động") return { label: s, bg: "#fffbeb", fg: "#b45309", dot: "#f59e0b", bd: "#fde68a" }
  if (s === "Giải thể" || s === "Chấm dứt hoạt động") return { label: s, bg: "#fef2f2", fg: "#b91c1c", dot: "#ef4444", bd: "#fecaca" }
  return { label: s, bg: "#eff6ff", fg: "#1d4ed8", dot: "#3b82f6", bd: "#bfdbfe" }
}

/* ============================ KIỂU DỮ LIỆU ============================ */
export interface OrgMember { hoTen: string; soThe: string; soChungChi: string }
export interface OrgRecord {
  id: string
  tenToChuc: string
  loaiToChuc: string
  soTuPhap: string
  truongVP: string
  diaChi: string // ngắn cho grid
  diaChiChiTiet: string
  tinhThanh: string
  phuongXa: string
  dienThoai: string
  email: string
  maSoThue: string
  trangThai: string
  updatedAt: string
  updatedISO: string
  members: OrgMember[]
}

export interface OrgSearchLog {
  id: string
  thoiGian: string
  nguoiTraCuu: string
  donVi: string
  scopeLevel: "bo" | "so" | "tchncc"
  scopeKey: string
  thongTinTraCuu: string
  ketQua: number
  soKetQuaDaXem: number
  ip: string
  viewedOrgIds: string[]
}

/* ============================ DỮ LIỆU MẪU ============================ */
export const ORG_RECORDS: OrgRecord[] = [
  {
    id: "O01", tenToChuc: "VPCC Minh Anh", loaiToChuc: "Văn phòng công chứng", soTuPhap: "TP Hà Nội", truongVP: "Nguyễn Văn A",
    diaChi: "Số 12 Bà Triệu, Hoàn Kiếm, Hà Nội", diaChiChiTiet: "Số 12 Bà Triệu", tinhThanh: "TP Hà Nội", phuongXa: "Phường Cửa Nam",
    dienThoai: "024 3826 1234", email: "vpccminhanh@congchung.vn", maSoThue: "0101234567", trangThai: "Đang hoạt động",
    updatedAt: "23/07/2026 10:30", updatedISO: "2026-07-23T10:30",
    members: [{ hoTen: "Nguyễn Văn A", soThe: "THN-12345", soChungChi: "CCHN-9999" }, { hoTen: "Nguyễn Thị F", soThe: "THN-12350", soChungChi: "CCHN-4444" }],
  },
  {
    id: "O02", tenToChuc: "VPCC Hoàn Kiếm", loaiToChuc: "Văn phòng công chứng", soTuPhap: "TP Hà Nội", truongVP: "Phạm Thị D",
    diaChi: "Số 5 Hàng Bài, Hoàn Kiếm, Hà Nội", diaChiChiTiet: "Số 5 Hàng Bài", tinhThanh: "TP Hà Nội", phuongXa: "Phường Cửa Nam",
    dienThoai: "024 3934 5678", email: "vpcchoankiem@congchung.vn", maSoThue: "0102345678", trangThai: "Tạm ngừng hoạt động",
    updatedAt: "20/07/2026 08:00", updatedISO: "2026-07-20T08:00",
    members: [{ hoTen: "Phạm Thị D", soThe: "THN-12348", soChungChi: "CCHN-6666" }],
  },
  {
    id: "O03", tenToChuc: "VPCC Sông Hàn", loaiToChuc: "Văn phòng công chứng", soTuPhap: "TP Đà Nẵng", truongVP: "Trần Thị B",
    diaChi: "Số 45 Bạch Đằng, Hải Châu, Đà Nẵng", diaChiChiTiet: "Số 45 Bạch Đằng", tinhThanh: "TP Đà Nẵng", phuongXa: "Phường Hải Châu 1",
    dienThoai: "0236 3812 999", email: "vpccsonghan@congchung.vn", maSoThue: "0400123456", trangThai: "Đang hoạt động",
    updatedAt: "22/07/2026 09:15", updatedISO: "2026-07-22T09:15",
    members: [{ hoTen: "Trần Thị B", soThe: "THN-12346", soChungChi: "CCHN-8888" }],
  },
  {
    id: "O04", tenToChuc: "VPCC Bến Thành", loaiToChuc: "Văn phòng công chứng", soTuPhap: "TP Hồ Chí Minh", truongVP: "Lê Văn C",
    diaChi: "Số 100 Lê Lợi, Quận 1, TP.HCM", diaChiChiTiet: "Số 100 Lê Lợi", tinhThanh: "TP Hồ Chí Minh", phuongXa: "Phường Bến Nghé",
    dienThoai: "028 3822 4567", email: "vpccbenthanh@congchung.vn", maSoThue: "0301456789", trangThai: "Đang hoạt động",
    updatedAt: "21/07/2026 16:40", updatedISO: "2026-07-21T16:40",
    members: [{ hoTen: "Lê Văn C", soThe: "THN-12347", soChungChi: "CCHN-7777" }],
  },
  {
    id: "O05", tenToChuc: "VPCC Rạch Giá", loaiToChuc: "Văn phòng công chứng", soTuPhap: "Tỉnh Kiên Giang", truongVP: "Nguyễn Văn E",
    diaChi: "Số 78 Trần Phú, Rạch Giá, Kiên Giang", diaChiChiTiet: "Số 78 Trần Phú", tinhThanh: "Tỉnh Kiên Giang", phuongXa: "Phường Vĩnh Thanh",
    dienThoai: "0297 3866 111", email: "vpccrachgia@congchung.vn", maSoThue: "1700234567", trangThai: "Đang hoạt động",
    updatedAt: "19/07/2026 14:00", updatedISO: "2026-07-19T14:00",
    members: [{ hoTen: "Nguyễn Văn E", soThe: "THN-12349", soChungChi: "CCHN-5555" }],
  },
  {
    id: "O06", tenToChuc: "VPCC Sài Gòn", loaiToChuc: "Văn phòng công chứng", soTuPhap: "TP Hồ Chí Minh", truongVP: "Đỗ Thị H",
    diaChi: "Số 22 Nguyễn Huệ, Quận 1, TP.HCM", diaChiChiTiet: "Số 22 Nguyễn Huệ", tinhThanh: "TP Hồ Chí Minh", phuongXa: "Phường Bến Nghé",
    dienThoai: "028 3829 7788", email: "vpccsaigon@congchung.vn", maSoThue: "0302567890", trangThai: "Chờ thành lập",
    updatedAt: "18/07/2026 11:20", updatedISO: "2026-07-18T11:20",
    members: [{ hoTen: "Đỗ Thị H", soThe: "THN-12355", soChungChi: "CCHN-3333" }],
  },
]

/* ============================ LỊCH SỬ (module-level) ============================ */
export const ORG_SEARCH_LOGS: OrgSearchLog[] = [
  { id: "LO001", thoiGian: "23/07/2026 10:30:15", nguoiTraCuu: "Nguyễn Văn A", donVi: "STP Hà Nội", scopeLevel: "so", scopeKey: "TP Hà Nội", thongTinTraCuu: "Từ khóa: Minh Anh; Bộ lọc: Sở Tư pháp — TP Hà Nội", ketQua: 2, soKetQuaDaXem: 2, ip: "10.0.0.1", viewedOrgIds: ["O01", "O02"] },
  { id: "LO002", thoiGian: "22/07/2026 15:05:40", nguoiTraCuu: "Trần Thị B", donVi: "Cục BTTP — Bộ Tư pháp", scopeLevel: "bo", scopeKey: "toanquoc", thongTinTraCuu: "Từ khóa CCV: THN-12346", ketQua: 1, soKetQuaDaXem: 1, ip: "192.168.2.30", viewedOrgIds: ["O03"] },
  { id: "LO003", thoiGian: "21/07/2026 09:12:03", nguoiTraCuu: "Lê Văn C", donVi: "VPCC Minh Anh", scopeLevel: "tchncc", scopeKey: "VPCC Minh Anh", thongTinTraCuu: "Bộ lọc: Trạng thái — Đang hoạt động", ketQua: 4, soKetQuaDaXem: 0, ip: "172.16.0.22", viewedOrgIds: [] },
]

let logSeq = 100
export function createLookup(thongTin: string, ketQua: number): OrgSearchLog {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  const log: OrgSearchLog = {
    id: `LO${++logSeq}`,
    thoiGian: `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
    nguoiTraCuu: "Nguyễn Văn A", donVi: "STP Hà Nội", scopeLevel: "so", scopeKey: "TP Hà Nội",
    thongTinTraCuu: thongTin || "(không có tiêu chí)", ketQua, soKetQuaDaXem: 0, ip: "10.0.0.1", viewedOrgIds: [],
  }
  ORG_SEARCH_LOGS.unshift(log)
  return log
}
export function markViewed(logId: string, orgId: string) {
  const log = ORG_SEARCH_LOGS.find((l) => l.id === logId)
  if (!log || log.viewedOrgIds.includes(orgId)) return
  log.viewedOrgIds.push(orgId)
  log.soKetQuaDaXem = log.viewedOrgIds.length
}
export const findLog = (id?: string) => ORG_SEARCH_LOGS.find((l) => l.id === id)
export const findOrg = (id?: string) => ORG_RECORDS.find((o) => o.id === id)

/* ============================ TÌM KIẾM ============================ */
export type LookupTab = "org" | "ccv"
export interface OrgFilter {
  tab: LookupTab
  tenToChuc: string; trangThai: string; soTuPhap: string // tab org
  hoTenCCV: string; soThe: string; soChungChi: string // tab ccv
}
export const EMPTY_ORG_FILTER: OrgFilter = { tab: "org", tenToChuc: "", trangThai: "all", soTuPhap: "all", hoTenCCV: "", soThe: "", soChungChi: "" }

export function hasCriteria(f: OrgFilter): boolean {
  if (f.tab === "org") return !!f.tenToChuc.trim() || f.trangThai !== "all" || f.soTuPhap !== "all"
  return !!f.hoTenCCV.trim() || !!f.soThe.trim() || !!f.soChungChi.trim()
}

export function searchOrg(rows: OrgRecord[], f: OrgFilter): OrgRecord[] {
  const inc = (h: string, kw: string) => h.toLowerCase().includes(kw.trim().toLowerCase())
  return rows
    .filter((r) => {
      if (f.tab === "org") {
        // BR-02: tên tổ chức gần đúng; trạng thái & Sở Tư pháp chính xác.
        if (f.tenToChuc.trim() && !inc(r.tenToChuc, f.tenToChuc)) return false
        if (f.trangThai !== "all" && r.trangThai !== f.trangThai) return false
        if (f.soTuPhap !== "all" && r.soTuPhap !== f.soTuPhap) return false
      } else {
        // BR-03: họ tên CCV gần đúng; số thẻ & số CCHN chính xác → xác định tổ chức.
        if (f.hoTenCCV.trim() && !r.members.some((m) => inc(m.hoTen, f.hoTenCCV))) return false
        if (f.soThe.trim() && !r.members.some((m) => inc(m.soThe, f.soThe))) return false
        if (f.soChungChi.trim() && !r.members.some((m) => inc(m.soChungChi, f.soChungChi))) return false
      }
      return true
    })
    .sort((a, b) => (a.updatedISO < b.updatedISO ? 1 : a.updatedISO > b.updatedISO ? -1 : 0))
}

export function describeCriteria(f: OrgFilter): string {
  const parts: string[] = []
  if (f.tab === "org") {
    if (f.tenToChuc.trim()) parts.push(`Từ khóa: ${f.tenToChuc.trim()}`)
    const loc: string[] = []
    if (f.trangThai !== "all") loc.push(`Trạng thái — ${f.trangThai}`)
    if (f.soTuPhap !== "all") loc.push(`Sở Tư pháp — ${f.soTuPhap}`)
    if (loc.length) parts.push(`Bộ lọc: ${loc.join(", ")}`)
  } else {
    const c: string[] = []
    if (f.hoTenCCV.trim()) c.push(`Họ tên CCV: ${f.hoTenCCV.trim()}`)
    if (f.soThe.trim()) c.push(`Số thẻ: ${f.soThe.trim()}`)
    if (f.soChungChi.trim()) c.push(`Số CCHN: ${f.soChungChi.trim()}`)
    if (c.length) parts.push(`Theo CCV — ${c.join(", ")}`)
  }
  return parts.join("; ")
}
