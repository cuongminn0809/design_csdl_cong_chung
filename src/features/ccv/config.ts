import type { StatusMeta } from "../ingestion/shared"

/* ============================ DANH MỤC ============================ */
export const CCV_STATUS_OPTIONS = [
  "Đăng ký tập sự", "Đang tập sự", "Tạm ngừng tập sự", "Chấm dứt tập sự", "Hoàn thành tập sự",
  "Chờ tiếp nhận bổ nhiệm", "Chờ bổ nhiệm", "Đã bổ nhiệm", "Đang hành nghề", "Tạm đình chỉ hành nghề",
  "Đã bổ nhiệm lại", "Đã miễn nhiệm", "Chờ bổ sung", "Đã bổ sung", "Từ chối bổ nhiệm",
  "Đã thay đổi nơi tập sự", "Chờ tiếp nhận miễn nhiệm", "Chờ tiếp nhận bổ nhiệm lại", "Từ chối miễn nhiệm",
  "Chờ bổ nhiệm lại", "Từ chối bổ nhiệm lại", "Chờ miễn nhiệm", "Thu hồi thẻ", "Chờ cấp thẻ",
  "Từ chối cấp thẻ", "Đạt kết quả tập sự",
]

export const SO_TU_PHAP_OPTIONS = ["TP Hà Nội", "TP Đà Nẵng", "TP Hồ Chí Minh", "Tỉnh Kiên Giang"]

export const TCHNCC_BY_STP: Record<string, string[]> = {
  "TP Hà Nội": ["VPCC Minh Anh", "VPCC Hoàn Kiếm"],
  "TP Đà Nẵng": ["VPCC Sông Hàn"],
  "TP Hồ Chí Minh": ["VPCC Bến Thành", "VPCC Sài Gòn"],
  "Tỉnh Kiên Giang": ["VPCC Rạch Giá"],
}
export const ALL_TCHNCC = Object.values(TCHNCC_BY_STP).flat()

/* ============================ TRẠNG THÁI (badge màu) ============================ */
export function ccvStatusMeta(s: string): StatusMeta {
  if (/hành nghề$/.test(s) || s === "Đã bổ nhiệm" || s === "Đã bổ nhiệm lại" || s === "Đã bổ sung")
    return { label: s, bg: "#ecfdf5", fg: "#047857", dot: "#10b981", bd: "#a7f3d0" }
  if (/^Tạm|^Chờ|tập sự$|^Đăng ký|^Đạt/.test(s))
    return { label: s, bg: "#fffbeb", fg: "#b45309", dot: "#f59e0b", bd: "#fde68a" }
  if (/^Từ chối|^Thu hồi|^Chấm dứt|^Đã miễn nhiệm/.test(s))
    return { label: s, bg: "#fef2f2", fg: "#b91c1c", dot: "#ef4444", bd: "#fecaca" }
  return { label: s, bg: "#eff6ff", fg: "#1d4ed8", dot: "#3b82f6", bd: "#bfdbfe" }
}
export function certStatusMeta(s: string): StatusMeta {
  if (s === "Còn hiệu lực") return { label: s, bg: "#ecfdf5", fg: "#047857", dot: "#10b981", bd: "#a7f3d0" }
  if (s === "Thu hồi") return { label: s, bg: "#fef2f2", fg: "#b91c1c", dot: "#ef4444", bd: "#fecaca" }
  return { label: s, bg: "#f8fafc", fg: "#64748b", dot: "#94a3b8", bd: "#e2e8f0" }
}

/* ============================ KIỂU DỮ LIỆU ============================ */
export interface Certificate {
  soChungChi: string; ngayCap: string; noiCap: string; ngayHieuLuc: string; ngayHetHan: string; donViCap: string; trangThai: string
}
export interface CcvRecord {
  id: string
  hoTen: string
  soThe: string
  soTuPhap: string
  tchncc: string
  diaChi: string
  trangThai: string
  updatedAt: string // dd/mm/yyyy HH:mm
  updatedISO: string // để sắp xếp
  // Lớp 1 — thông tin chung
  ngaySinh: string; gioiTinh: string; quocTich: string; danToc: string; sdt: string; email: string
  soGiayTo: string; ngayCapGT: string; noiCapGT: string
  diaChiThuongTru: string; tinhThanh: string; phuongXa: string
  // Lớp 2 — tổ chức hành nghề
  laTruongVanPhong: boolean
  // Lớp 3 — chứng chỉ hành nghề
  certificate: Certificate
  fileDinhKem: string
}

// Lịch sử tra cứu (SCR-A.5.6-03/04)
export interface CcvSearchLog {
  id: string
  thoiGian: string
  nguoiTraCuu: string
  donVi: string
  scopeLevel: "bo" | "so" | "tchncc"
  scopeKey: string // tên Sở hoặc tên TCHNCC để lọc phạm vi
  thongTinTraCuu: string
  ketQua: number
  soKetQuaDaXem: number
  ip: string
  viewedCcvIds: string[]
}

/* ============================ DỮ LIỆU MẪU ============================ */
const cert = (o: Partial<Certificate>): Certificate => ({
  soChungChi: "", ngayCap: "", noiCap: "Bộ Tư pháp", ngayHieuLuc: "", ngayHetHan: "—", donViCap: "Bộ Tư pháp", trangThai: "Còn hiệu lực", ...o,
})

export const CCV_RECORDS: CcvRecord[] = [
  {
    id: "C01", hoTen: "Nguyễn Văn A", soThe: "THN-12345", soTuPhap: "TP Hà Nội", tchncc: "VPCC Minh Anh",
    diaChi: "Số 12 Bà Triệu, Hoàn Kiếm, Hà Nội", trangThai: "Đang hành nghề", updatedAt: "23/07/2026 10:30", updatedISO: "2026-07-23T10:30",
    ngaySinh: "15/03/1978", gioiTinh: "Nam", quocTich: "Việt Nam", danToc: "Kinh", sdt: "0901234567", email: "nva@vpccminhanh.vn",
    soGiayTo: "001078012345", ngayCapGT: "10/10/2018", noiCapGT: "Cục CS ĐKQL cư trú và DLQG về dân cư",
    diaChiThuongTru: "Số 34 Nguyễn Trãi", tinhThanh: "TP Hà Nội", phuongXa: "Phường Thanh Xuân Trung",
    laTruongVanPhong: true, certificate: cert({ soChungChi: "CCHN-9999", ngayCap: "15/05/2010", ngayHieuLuc: "01/06/2010" }), fileDinhKem: "CCHN-9999.pdf",
  },
  {
    id: "C02", hoTen: "Trần Thị B", soThe: "THN-12346", soTuPhap: "TP Đà Nẵng", tchncc: "VPCC Sông Hàn",
    diaChi: "Số 45 Bạch Đằng, Hải Châu, Đà Nẵng", trangThai: "Đang hành nghề", updatedAt: "22/07/2026 09:15", updatedISO: "2026-07-22T09:15",
    ngaySinh: "20/09/1985", gioiTinh: "Nữ", quocTich: "Việt Nam", danToc: "Kinh", sdt: "0905111222", email: "ttb@vpccsonghan.vn",
    soGiayTo: "048185006789", ngayCapGT: "05/05/2020", noiCapGT: "Cục CS ĐKQL cư trú và DLQG về dân cư",
    diaChiThuongTru: "Số 8 Trần Phú", tinhThanh: "TP Đà Nẵng", phuongXa: "Phường Hải Châu 1",
    laTruongVanPhong: false, certificate: cert({ soChungChi: "CCHN-8888", ngayCap: "20/08/2013", ngayHieuLuc: "01/09/2013" }), fileDinhKem: "CCHN-8888.pdf",
  },
  {
    id: "C03", hoTen: "Lê Văn C", soThe: "THN-12347", soTuPhap: "TP Hồ Chí Minh", tchncc: "VPCC Bến Thành",
    diaChi: "Số 100 Lê Lợi, Quận 1, TP.HCM", trangThai: "Tạm đình chỉ hành nghề", updatedAt: "21/07/2026 16:40", updatedISO: "2026-07-21T16:40",
    ngaySinh: "02/02/1972", gioiTinh: "Nam", quocTich: "Việt Nam", danToc: "Kinh", sdt: "0908333444", email: "lvc@vpccbenthanh.vn",
    soGiayTo: "079072004321", ngayCapGT: "12/12/2019", noiCapGT: "Cục CS ĐKQL cư trú và DLQG về dân cư",
    diaChiThuongTru: "Số 22 Nguyễn Huệ", tinhThanh: "TP Hồ Chí Minh", phuongXa: "Phường Bến Nghé",
    laTruongVanPhong: true, certificate: cert({ soChungChi: "CCHN-7777", ngayCap: "10/03/2008", ngayHieuLuc: "01/04/2008", trangThai: "Còn hiệu lực" }), fileDinhKem: "CCHN-7777.pdf",
  },
  {
    id: "C04", hoTen: "Phạm Thị D", soThe: "THN-12348", soTuPhap: "TP Hà Nội", tchncc: "VPCC Hoàn Kiếm",
    diaChi: "Số 5 Hàng Bài, Hoàn Kiếm, Hà Nội", trangThai: "Đã miễn nhiệm", updatedAt: "20/07/2026 08:00", updatedISO: "2026-07-20T08:00",
    ngaySinh: "18/07/1980", gioiTinh: "Nữ", quocTich: "Việt Nam", danToc: "Kinh", sdt: "0903555666", email: "ptd@vpcchoankiem.vn",
    soGiayTo: "001180009988", ngayCapGT: "01/01/2021", noiCapGT: "Cục CS ĐKQL cư trú và DLQG về dân cư",
    diaChiThuongTru: "Số 9 Lý Thường Kiệt", tinhThanh: "TP Hà Nội", phuongXa: "Phường Cửa Nam",
    laTruongVanPhong: false, certificate: cert({ soChungChi: "CCHN-6666", ngayCap: "05/05/2011", ngayHieuLuc: "01/06/2011", ngayHetHan: "05/05/2026", trangThai: "Hết hiệu lực" }), fileDinhKem: "CCHN-6666.pdf",
  },
  {
    id: "C05", hoTen: "Nguyễn Văn E", soThe: "THN-12349", soTuPhap: "Tỉnh Kiên Giang", tchncc: "VPCC Rạch Giá",
    diaChi: "Số 78 Trần Phú, Rạch Giá, Kiên Giang", trangThai: "Đang hành nghề", updatedAt: "19/07/2026 14:00", updatedISO: "2026-07-19T14:00",
    ngaySinh: "30/11/1983", gioiTinh: "Nam", quocTich: "Việt Nam", danToc: "Kinh", sdt: "0907888999", email: "nve@vpccrachgia.vn",
    soGiayTo: "091083001122", ngayCapGT: "20/06/2020", noiCapGT: "Cục CS ĐKQL cư trú và DLQG về dân cư",
    diaChiThuongTru: "Số 3 Nguyễn Trung Trực", tinhThanh: "Tỉnh Kiên Giang", phuongXa: "Phường Vĩnh Thanh",
    laTruongVanPhong: true, certificate: cert({ soChungChi: "CCHN-5555", ngayCap: "18/09/2014", ngayHieuLuc: "01/10/2014" }), fileDinhKem: "CCHN-5555.pdf",
  },
  {
    id: "C06", hoTen: "Nguyễn Thị F", soThe: "THN-12350", soTuPhap: "TP Hà Nội", tchncc: "VPCC Minh Anh",
    diaChi: "Số 12 Bà Triệu, Hoàn Kiếm, Hà Nội", trangThai: "Đang tập sự", updatedAt: "18/07/2026 11:20", updatedISO: "2026-07-18T11:20",
    ngaySinh: "25/05/1992", gioiTinh: "Nữ", quocTich: "Việt Nam", danToc: "Kinh", sdt: "0902777888", email: "ntf@vpccminhanh.vn",
    soGiayTo: "001192007766", ngayCapGT: "15/03/2022", noiCapGT: "Cục CS ĐKQL cư trú và DLQG về dân cư",
    diaChiThuongTru: "Số 40 Giải Phóng", tinhThanh: "TP Hà Nội", phuongXa: "Phường Phương Liệt",
    laTruongVanPhong: false, certificate: cert({ soChungChi: "CCHN-4444", ngayCap: "10/01/2024", ngayHieuLuc: "01/02/2024" }), fileDinhKem: "CCHN-4444.pdf",
  },
]

/* ============================ LỊCH SỬ (module-level, mutate được) ============================ */
export const SEARCH_LOGS: CcvSearchLog[] = [
  { id: "L001", thoiGian: "23/07/2026 10:30:15", nguoiTraCuu: "Nguyễn Văn A", donVi: "STP Hà Nội", scopeLevel: "so", scopeKey: "TP Hà Nội", thongTinTraCuu: "Từ khóa: Nguyễn Văn A; Bộ lọc: Sở Tư pháp — TP Hà Nội", ketQua: 3, soKetQuaDaXem: 2, ip: "10.0.0.1", viewedCcvIds: ["C01", "C06"] },
  { id: "L002", thoiGian: "22/07/2026 15:05:40", nguoiTraCuu: "Trần Thị B", donVi: "Cục BTTP — Bộ Tư pháp", scopeLevel: "bo", scopeKey: "toanquoc", thongTinTraCuu: "Từ khóa: THN-12346", ketQua: 1, soKetQuaDaXem: 1, ip: "192.168.2.30", viewedCcvIds: ["C02"] },
  { id: "L003", thoiGian: "21/07/2026 09:12:03", nguoiTraCuu: "Lê Văn C", donVi: "VPCC Minh Anh", scopeLevel: "tchncc", scopeKey: "VPCC Minh Anh", thongTinTraCuu: "Bộ lọc: Trạng thái — Đang hành nghề", ketQua: 2, soKetQuaDaXem: 0, ip: "172.16.0.22", viewedCcvIds: [] },
]

let logSeq = 100
export function createLookup(thongTin: string, ketQua: number): CcvSearchLog {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  const log: CcvSearchLog = {
    id: `L${++logSeq}`,
    thoiGian: `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
    nguoiTraCuu: "Nguyễn Văn A", donVi: "STP Hà Nội", scopeLevel: "so", scopeKey: "TP Hà Nội",
    thongTinTraCuu: thongTin || "(không có tiêu chí)", ketQua, soKetQuaDaXem: 0, ip: "10.0.0.1", viewedCcvIds: [],
  }
  SEARCH_LOGS.unshift(log)
  return log
}
// BR-07: chỉ tính 1 lần mỗi CCV trong cùng lookupHistoryId.
export function markViewed(logId: string, ccvId: string) {
  const log = SEARCH_LOGS.find((l) => l.id === logId)
  if (!log || log.viewedCcvIds.includes(ccvId)) return
  log.viewedCcvIds.push(ccvId)
  log.soKetQuaDaXem = log.viewedCcvIds.length
}
export const findLog = (id?: string) => SEARCH_LOGS.find((l) => l.id === id)
export const findCcv = (id?: string) => CCV_RECORDS.find((c) => c.id === id)

/* ============================ TÌM KIẾM ============================ */
export interface CcvFilter { keyword: string; trangThai: string; soTuPhap: string; tchncc: string }
export const EMPTY_CCV_FILTER: CcvFilter = { keyword: "", trangThai: "all", soTuPhap: "all", tchncc: "all" }

export const hasCriteria = (f: CcvFilter) => !!f.keyword.trim() || f.trangThai !== "all" || f.soTuPhap !== "all" || f.tchncc !== "all"

export function searchCcv(rows: CcvRecord[], f: CcvFilter): CcvRecord[] {
  const kw = f.keyword.trim().toLowerCase()
  return rows
    .filter((r) => {
      if (kw) {
        // BR-02: họ tên gần đúng; số thẻ/số CCHN chính xác (dạng chứa).
        const hit = r.hoTen.toLowerCase().includes(kw) || r.soThe.toLowerCase().includes(kw) || r.certificate.soChungChi.toLowerCase().includes(kw)
        if (!hit) return false
      }
      if (f.trangThai !== "all" && r.trangThai !== f.trangThai) return false
      if (f.soTuPhap !== "all" && r.soTuPhap !== f.soTuPhap) return false
      if (f.tchncc !== "all" && r.tchncc !== f.tchncc) return false
      return true
    })
    .sort((a, b) => (a.updatedISO < b.updatedISO ? 1 : a.updatedISO > b.updatedISO ? -1 : 0))
}

export function describeCriteria(f: CcvFilter): string {
  const parts: string[] = []
  if (f.keyword.trim()) parts.push(`Từ khóa: ${f.keyword.trim()}`)
  const loc: string[] = []
  if (f.trangThai !== "all") loc.push(`Trạng thái — ${f.trangThai}`)
  if (f.soTuPhap !== "all") loc.push(`Sở Tư pháp — ${f.soTuPhap}`)
  if (f.tchncc !== "all") loc.push(`TCHNCC — ${f.tchncc}`)
  if (loc.length) parts.push(`Bộ lọc: ${loc.join(", ")}`)
  return parts.join("; ")
}
