/* ============================ VAI TRÒ (BR-01) ============================ */
// A.7.1 (cấp BTP): ld_btp/ld_cuc_bttp/cv_btp — xem toàn quốc + lọc Tỉnh/TP.
// A.7.2 (cấp STP): ld_stp/cv_stp — xem theo địa bàn cố định của người dùng, không có bộ lọc Tỉnh/TP (BR-09).
// A.7.3 (cấp TCHNCC): ld_tchncc/ccv — xem theo tổ chức cố định của người dùng, không có bộ lọc TCHNCC (BR-09).
export type DashboardRole = "ld_btp" | "ld_cuc_bttp" | "cv_btp" | "ld_stp" | "cv_stp" | "ld_tchncc" | "ccv" | "khac"
export const DASHBOARD_ROLES: { key: DashboardRole; label: string }[] = [
  { key: "ld_btp", label: "Lãnh đạo Bộ Tư pháp" },
  { key: "ld_cuc_bttp", label: "Lãnh đạo Cục BTTP" },
  { key: "cv_btp", label: "Chuyên viên Cục BTTP" },
  { key: "ld_stp", label: "Lãnh đạo phòng chuyên môn STP" },
  { key: "cv_stp", label: "Chuyên viên Sở Tư pháp" },
  { key: "ld_tchncc", label: "Lãnh đạo TCHNCC" },
  { key: "ccv", label: "Công chứng viên" },
  { key: "khac", label: "Vai trò khác (không có quyền)" },
]
export const canAccessDashboard = (r: DashboardRole) => r !== "khac"
export const isBoRole = (r: DashboardRole) => r === "ld_btp" || r === "ld_cuc_bttp" || r === "cv_btp"
export const isStpRole = (r: DashboardRole) => r === "ld_stp" || r === "cv_stp"
export const isTchnccRole = (r: DashboardRole) => r === "ld_tchncc" || r === "ccv"
// Địa bàn tỉnh/thành phố cố định của tài khoản STP demo (BR-09) — khớp quy ước "Sở Tư pháp Hà Nội" đã dùng ở các module khác.
export const STP_PROVINCE = "Hà Nội"
// Tổ chức HNCC cố định của tài khoản TCHNCC demo (BR-09) — khớp quy ước org↔tỉnh dùng chung toàn app.
export const TCHNCC_ORGS = ["VPCC Nguyễn Văn A", "Phòng Công chứng số 1", "VPCC Trần Văn B", "VPCC Bến Thành", "VPCC Sông Hàn"]
export const ORG_PROVINCE: Record<string, string> = {
  "VPCC Nguyễn Văn A": "Hà Nội", "Phòng Công chứng số 1": "Hà Nội",
  "VPCC Trần Văn B": "TP. Hồ Chí Minh", "VPCC Bến Thành": "TP. Hồ Chí Minh",
  "VPCC Sông Hàn": "Đà Nẵng",
}
export const TCHNCC_HOME_ORG = "VPCC Nguyễn Văn A"

/* ============================ DANH MỤC ĐỊA BÀN (34 Tỉnh/TP theo địa chỉ mới) ============================ */
export const PROVINCES_34 = [
  "Hà Nội", "Hải Phòng", "Đà Nẵng", "Huế", "Cần Thơ", "TP. Hồ Chí Minh",
  "Cao Bằng", "Lạng Sơn", "Lai Châu", "Điện Biên", "Sơn La", "Lào Cai", "Tuyên Quang",
  "Thái Nguyên", "Phú Thọ", "Bắc Ninh", "Hưng Yên", "Ninh Bình", "Quảng Ninh",
  "Thanh Hóa", "Nghệ An", "Hà Tĩnh", "Quảng Trị", "Quảng Ngãi", "Gia Lai", "Khánh Hòa",
  "Lâm Đồng", "Đắk Lắk", "Đồng Nai", "Tây Ninh", "Đồng Tháp", "Vĩnh Long", "An Giang", "Cà Mau",
]

/* ============================ BỘ LỌC THỜI GIAN (BR-03, BR-09) ============================ */
export const CURRENT_YEAR = 2026
export const TODAY_ISO = "2026-08-28"
export const D_MINUS_2 = "2026-08-26"
export const YEAR_OPTIONS = [2026, 2025, 2024, 2023, 2022] as const
export type PeriodKind = "ca-nam" | "theo-quy" | "theo-thang"
export const PERIOD_KINDS: { key: PeriodKind; label: string }[] = [
  { key: "ca-nam", label: "Cả năm" },
  { key: "theo-quy", label: "Quý" },
  { key: "theo-thang", label: "Tháng" },
]
export const QUARTERS = [{ key: 1, label: "Quý I" }, { key: 2, label: "Quý II" }, { key: 3, label: "Quý III" }, { key: 4, label: "Quý IV" }]
export const MONTHS = Array.from({ length: 12 }, (_, i) => ({ key: i + 1, label: `Tháng ${i + 1}` }))

export interface FilterState {
  year: number | "custom"
  kind: PeriodKind
  month: number
  quarter: number
  tuNgay: string
  denNgay: string
  province: string
}
export const DEFAULT_FILTER: FilterState = {
  year: CURRENT_YEAR, kind: "ca-nam", month: 8, quarter: 3, tuNgay: "", denNgay: "", province: "Toàn quốc",
}

const pad = (n: number) => String(n).padStart(2, "0")
const lastDay = (y: number, m: number) => new Date(y, m, 0).getDate()
export const fmtVN = (iso: string) => { const [y, m, d] = iso.split("-"); return `${d}/${m}/${y}` }

// VR-01..VR-06: kiểm tra bộ lọc, trả về chuỗi lỗi rỗng nếu hợp lệ.
export function validateFilter(f: FilterState): string {
  if (f.year === "custom") {
    if (!f.tuNgay || !f.denNgay) return "Vui lòng nhập đầy đủ Từ ngày và Đến ngày. Từ ngày phải nhỏ hơn hoặc bằng Đến ngày. Đến ngày phải nhỏ hơn hoặc bằng ngày hiện tại − 2."
    if (f.tuNgay > f.denNgay) return "Vui lòng nhập đầy đủ Từ ngày và Đến ngày. Từ ngày phải nhỏ hơn hoặc bằng Đến ngày. Đến ngày phải nhỏ hơn hoặc bằng ngày hiện tại − 2."
    if (f.denNgay > D_MINUS_2) return "Vui lòng nhập đầy đủ Từ ngày và Đến ngày. Từ ngày phải nhỏ hơn hoặc bằng Đến ngày. Đến ngày phải nhỏ hơn hoặc bằng ngày hiện tại − 2."
    return ""
  }
  if (f.kind === "theo-thang" && !f.month) return "Vui lòng chọn tháng thống kê."
  if (f.kind === "theo-quy" && !f.quarter) return "Vui lòng chọn quý thống kê."
  return ""
}

export interface ResolvedRange { from: string; to: string; label: string }
// BR-03/BR-09: khoảng thời gian phát sinh trong kỳ đã chọn (áp dụng D-2 khi Năm = năm hiện tại).
export function resolveRange(f: FilterState): ResolvedRange {
  if (f.year === "custom") return { from: f.tuNgay, to: f.denNgay, label: `${fmtVN(f.tuNgay)} – ${fmtVN(f.denNgay)}` }
  const y = f.year
  let from = `${y}-01-01`, to = `${y}-12-31`
  if (f.kind === "theo-quy") { const qm = (f.quarter - 1) * 3 + 1; from = `${y}-${pad(qm)}-01`; to = `${y}-${pad(qm + 2)}-${pad(lastDay(y, qm + 2))}` }
  else if (f.kind === "theo-thang") { from = `${y}-${pad(f.month)}-01`; to = `${y}-${pad(f.month)}-${pad(lastDay(y, f.month))}` }
  if (y === CURRENT_YEAR && to > D_MINUS_2) to = D_MINUS_2
  return { from, to, label: `${fmtVN(from)} – ${fmtVN(to)}` }
}

export interface Bucket { label: string; from: string; to: string }
// BR-03/7.2: trục Ox biểu đồ theo loại kỳ đã chọn.
export function buildBuckets(f: FilterState): Bucket[] {
  if (f.year === "custom") {
    if (!f.tuNgay || !f.denNgay) return []
    const days = (new Date(f.denNgay).getTime() - new Date(f.tuNgay).getTime()) / 86_400_000
    if (days <= 31) {
      const out: Bucket[] = []
      const d = new Date(f.tuNgay)
      const end = new Date(f.denNgay)
      while (d <= end) { const iso = d.toISOString().slice(0, 10); out.push({ label: String(d.getDate()), from: iso, to: iso }); d.setDate(d.getDate() + 1) }
      return out
    }
    const out: Bucket[] = []
    let d = new Date(f.tuNgay.slice(0, 8) + "01")
    const end = new Date(f.denNgay)
    while (d <= end) {
      const y = d.getFullYear(), m = d.getMonth() + 1
      out.push({ label: `T${m}/${y}`, from: `${y}-${pad(m)}-01`, to: `${y}-${pad(m)}-${pad(lastDay(y, m))}` })
      d = new Date(y, m, 1)
    }
    return out
  }
  const y = f.year
  if (f.kind === "theo-thang") {
    const n = lastDay(y, f.month)
    return Array.from({ length: n }, (_, i) => { const iso = `${y}-${pad(f.month)}-${pad(i + 1)}`; return { label: String(i + 1), from: iso, to: iso } })
  }
  const months = f.kind === "theo-quy" ? [1, 2, 3].map((i) => (f.quarter - 1) * 3 + i) : Array.from({ length: 12 }, (_, i) => i + 1)
  return months.map((m) => ({ label: `T${m}`, from: `${y}-${pad(m)}-01`, to: `${y}-${pad(m)}-${pad(lastDay(y, m))}` }))
}

export const inRange = (iso: string, from: string, to: string) => (!from || iso >= from) && (!to || iso <= to)

/* ============================ DANH MỤC NGHIỆP VỤ ============================ */
export const LOAI_GD_LIST = ["Chuyển nhượng", "Tặng cho", "Thế chấp", "Ủy quyền", "Khác"]
export const LOAI_TAISAN_LIST = ["Bất động sản", "Phương tiện", "Tài sản khác"]
export const DON_VI_KHAITHAC = ["Sở Tư pháp Hà Nội", "Sở Tư pháp TP. Hồ Chí Minh", "Sở Tư pháp Đà Nẵng", "TCHNCC", "Bộ Tư pháp"]
export const LOAI_DU_LIEU_KHAITHAC = ["Giao dịch công chứng", "Thông tin ngăn chặn", "Cảnh báo rủi ro", "VBCCĐT", "Công chứng viên", "TCHNCC", "Thông tin tài sản"]

/* ============================ DỮ LIỆU MẪU (Kho dữ liệu — phân hệ B) ============================ */
// PRNG có seed để dữ liệu mock ổn định giữa các lần render.
function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = mulberry32(20260828)
const pick = <T,>(arr: readonly T[], weights?: number[]) => {
  if (!weights) return arr[Math.floor(rand() * arr.length)]
  const total = weights.reduce((a, b) => a + b, 0)
  let r = rand() * total
  for (let i = 0; i < arr.length; i++) { r -= weights[i]; if (r <= 0) return arr[i] }
  return arr[arr.length - 1]
}
const isoInRange = (fromISO: string, toISO: string) => {
  const from = new Date(fromISO).getTime(), to = new Date(toISO).getTime()
  return new Date(from + rand() * (to - from)).toISOString().slice(0, 10)
}
const PROVINCE_WEIGHTS = PROVINCES_34.map((p) => (p === "Hà Nội" || p === "TP. Hồ Chí Minh" ? 8 : p === "Đà Nẵng" || p === "Hải Phòng" || p === "Cần Thơ" ? 4 : 1))
// Tỉnh → danh sách TCHNCC mô phỏng trong tỉnh đó (chỉ 3/34 tỉnh có TCHNCC mẫu — các tỉnh khác không gắn tổ chức cụ thể).
const ORGS_BY_PROVINCE: Record<string, string[]> = {}
TCHNCC_ORGS.forEach((o) => { (ORGS_BY_PROVINCE[ORG_PROVINCE[o]] ??= []).push(o) })

export interface GdccRec { ngayCC: string; tinh: string; toChuc: string; phuongThuc: string; loaiGD: string; trangThai: string }
export const GDCC_RECORDS: GdccRec[] = Array.from({ length: 4200 }, () => {
  const tinh = pick(PROVINCES_34, PROVINCE_WEIGHTS)
  return {
    ngayCC: isoInRange("2020-01-01", D_MINUS_2),
    tinh,
    toChuc: ORGS_BY_PROVINCE[tinh] ? pick(ORGS_BY_PROVINCE[tinh]) : "",
    phuongThuc: pick(["Công chứng giấy", "CCĐT trực tuyến", "CCĐT trực tiếp"], [65, 25, 10]),
    loaiGD: pick(LOAI_GD_LIST, [35, 15, 25, 15, 10]),
    trangThai: pick(["Có hiệu lực", "Đã hủy", "Vô hiệu"], [92, 5, 3]),
  }
})

export interface TchnccRec { ngayThanhLap: string; tinh: string; trangThai: string }
export const TCHNCC_RECORDS: TchnccRec[] = Array.from({ length: 420 }, () => ({
  ngayThanhLap: isoInRange("2015-01-01", D_MINUS_2),
  tinh: pick(PROVINCES_34, PROVINCE_WEIGHTS),
  trangThai: pick(["Đang hoạt động", "Ngừng hoạt động"], [94, 6]),
}))

export interface CcvRec { ngayCapCC: string; tinh: string; trangThai: string }
export const CCV_RECORDS: CcvRec[] = Array.from({ length: 1850 }, () => ({
  ngayCapCC: isoInRange("2015-01-01", D_MINUS_2),
  tinh: pick(PROVINCES_34, PROVINCE_WEIGHTS),
  trangThai: pick(["Đang hành nghề", "Đã nghỉ hành nghề"], [90, 10]),
}))

export interface NganChanRec { ngay: string; tinh: string; loai: "Thông tin ngăn chặn" | "Cảnh báo rủi ro"; trangThai: string; loaiTaiSan: string }
export const NGANCHAN_RECORDS: NganChanRec[] = Array.from({ length: 1600 }, () => ({
  ngay: isoInRange("2020-01-01", D_MINUS_2),
  tinh: pick(PROVINCES_34, PROVINCE_WEIGHTS),
  loai: pick(["Thông tin ngăn chặn", "Cảnh báo rủi ro"] as const, [60, 40]),
  trangThai: pick(["Đã duyệt", "Chờ duyệt", "Từ chối"], [85, 10, 5]),
  loaiTaiSan: pick(LOAI_TAISAN_LIST, [55, 30, 15]),
}))

export interface KhaiThacRec { ngay: string; donVi: string; loaiDuLieu: string }
export const KHAITHAC_RECORDS: KhaiThacRec[] = Array.from({ length: 9000 }, () => ({
  ngay: isoInRange("2020-01-01", D_MINUS_2),
  donVi: pick(DON_VI_KHAITHAC, [22, 20, 12, 30, 16]),
  loaiDuLieu: pick(LOAI_DU_LIEU_KHAITHAC, [30, 15, 10, 15, 10, 10, 10]),
}))

// C03 (A.7.3): hồ sơ scan/upload lưu trữ điện tử theo TCHNCC.
export interface LuuTruRec { ngay: string; toChuc: string }
export const LUUTRU_RECORDS: LuuTruRec[] = Array.from({ length: 3200 }, () => ({
  ngay: isoInRange("2020-01-01", D_MINUS_2),
  toChuc: pick(TCHNCC_ORGS),
}))

// B07 (A.7.3): yêu cầu khai thác chi tiết GDCC giữa các TCHNCC (nhận/gửi).
export interface YeuCauKtRec { ngay: string; tuToChuc: string; denToChuc: string }
export const YEUCAUKT_RECORDS: YeuCauKtRec[] = Array.from({ length: 900 }, () => {
  const tuToChuc = pick(TCHNCC_ORGS)
  let denToChuc = pick(TCHNCC_ORGS)
  while (denToChuc === tuToChuc) denToChuc = pick(TCHNCC_ORGS)
  return { ngay: isoInRange("2020-01-01", D_MINUS_2), tuToChuc, denToChuc }
})

/* ============================ TỔNG HỢP THEO PHẠM VI/KỲ ============================ */
export const scopeByProvince = <T extends { tinh: string }>(rows: T[], province: string) => province === "Toàn quốc" ? rows : rows.filter((r) => r.tinh === province)
export const scopeByOrg = <T extends { toChuc: string }>(rows: T[], org: string) => rows.filter((r) => r.toChuc === org)

export function countInRange<T>(rows: T[], dateOf: (r: T) => string, from: string, to: string) {
  return rows.filter((r) => inRange(dateOf(r), from, to)).length
}
export function sumByBucket<T>(rows: T[], dateOf: (r: T) => string, buckets: Bucket[]) {
  return buckets.map((b) => rows.filter((r) => inRange(dateOf(r), b.from, b.to)).length)
}
export function sumByBucketSeries<T>(rows: T[], dateOf: (r: T) => string, seriesKeyOf: (r: T) => string, seriesKeys: string[], buckets: Bucket[]) {
  return seriesKeys.map((key) => ({
    name: key,
    data: buckets.map((b) => rows.filter((r) => seriesKeyOf(r) === key && inRange(dateOf(r), b.from, b.to)).length),
  }))
}

/* ============================ KẾT XUẤT (BR-06) ============================ */
export function exportMsg(count: number): { msg: string; kind: "ok" | "error" } {
  if (count === 0) return { msg: "Không có dữ liệu theo bộ lọc đã chọn.", kind: "error" }
  return { msg: "Đã xuất biểu đồ thành công. Tệp đã được tải về máy của bạn.", kind: "ok" }
}
