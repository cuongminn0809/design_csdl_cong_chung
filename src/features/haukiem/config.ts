import type { StatusMeta } from "../ingestion/shared"

/* ============================ VAI TRÒ (BR-01) ============================ */
// Chỉ Lãnh đạo TCHNCC được truy cập. RoleSelect dùng để minh họa chặn quyền (MSG_HK_E002).
export type HkRole = "ld_tchncc" | "cv_stp" | "ld_bo"
export const HK_ROLES: { key: HkRole; label: string }[] = [
  { key: "ld_tchncc", label: "Lãnh đạo TCHNCC" },
  { key: "cv_stp", label: "Chuyên viên Sở Tư pháp" },
  { key: "ld_bo", label: "Lãnh đạo Bộ Tư pháp" },
]
export const canAccess = (r: HkRole) => r === "ld_tchncc"
// Phạm vi dữ liệu: TCHNCC của tài khoản đăng nhập.
export const VPPC_NAME = "VPCC Nguyễn Văn A"

/* ============================ NHÓM TIÊU CHÍ HẬU KIỂM ============================ */
export interface Criterion { code: string; label: string }
export interface CriteriaGroup { code: string; label: string; children: Criterion[] }

export const CRITERIA_GROUPS: CriteriaGroup[] = [
  {
    code: "G1", label: "Tính đầy đủ của hồ sơ và văn bản công chứng điện tử",
    children: [
      { code: "UC219", label: "Giao dịch CCĐT thiếu văn bản công chứng điện tử" },
      { code: "UC220", label: "Giao dịch CC giấy thiếu hồ sơ lưu trữ điện tử" },
    ],
  },
  {
    code: "G2", label: "Tính hợp lệ của chữ ký số",
    children: [
      { code: "UC221", label: "Chữ ký số của CCV không hợp lệ" },
      { code: "UC222", label: "Chữ ký số của TCHNCC không hợp lệ" },
    ],
  },
  {
    code: "G3", label: "Tuân thủ điều kiện hành nghề của công chứng viên",
    children: [
      { code: "UC223", label: "CCV ký trong thời gian bị đình chỉ/tạm đình chỉ" },
      { code: "UC224", label: "CCV công chứng cho hợp đồng của bản thân" },
      { code: "UC225", label: "CCV công chứng cho hợp đồng của người thân" },
      { code: "UC226", label: "CCV ký giao dịch tại 2 TCHNCC" },
    ],
  },
  {
    code: "G4", label: "Tình trạng pháp lý của tổ chức hành nghề công chứng",
    children: [
      { code: "UC227", label: "TCHNCC ký trong thời gian sáp nhập" },
      { code: "UC228", label: "TCHNCC ký trong thời gian tạm dừng" },
      { code: "UC229", label: "TCHNCC ký trong thời gian giải thể" },
    ],
  },
  {
    code: "G5", label: "Rủi ro, trùng lặp và đối soát chủ thể giao dịch",
    children: [
      { code: "UC230", label: "Giao dịch có bên liên quan bị ngăn chặn" },
      { code: "UC231", label: "Trùng số công chứng" },
      { code: "UC232", label: "Thông tin người tham gia không khớp dữ liệu gốc" },
    ],
  },
  {
    code: "G6", label: "Đối soát thông tin tài sản với dữ liệu gốc",
    children: [
      { code: "UC233", label: "Tài sản là đất không khớp dữ liệu gốc" },
      { code: "UC234", label: "Tài sản gắn liền với đất không khớp dữ liệu gốc" },
      { code: "UC235", label: "Xe mô tô, xe gắn máy không khớp dữ liệu gốc" },
      { code: "UC236", label: "Xe ô tô, rơ moóc… không khớp dữ liệu gốc" },
      { code: "UC237", label: "Tàu biển không khớp dữ liệu gốc" },
      { code: "UC238", label: "Phương tiện thủy nội địa không khớp dữ liệu gốc" },
      { code: "UC239", label: "Tàu cá không khớp dữ liệu gốc" },
      { code: "UC240", label: "Tàu bay không khớp dữ liệu gốc" },
    ],
  },
]

export const ALL_CRITERIA: Criterion[] = CRITERIA_GROUPS.flatMap((g) => g.children)
export const CRITERION_LABEL: Record<string, string> = Object.fromEntries(ALL_CRITERIA.map((c) => [c.code, c.label]))
const GROUP_OF: Record<string, string> = Object.fromEntries(CRITERIA_GROUPS.flatMap((g) => g.children.map((c) => [c.code, g.code])))
export const groupByCode = (code: string) => CRITERIA_GROUPS.find((g) => g.code === code)
// Tập mã tiêu chí con của một tham số (mã nhóm G* → các con; mã tiêu chí UC* → chính nó).
export function expandCriteria(codes: string[]): string[] {
  const out = new Set<string>()
  for (const c of codes) {
    const g = groupByCode(c)
    if (g) g.children.forEach((ch) => out.add(ch.code))
    else if (CRITERION_LABEL[c]) out.add(c)
  }
  return [...out]
}

/* ============================ DANH MỤC ============================ */
export const YEARS = [2026, 2025, 2024]
export const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
export const CCV_OPTIONS = ["Trần Văn B", "Phạm Văn D", "Lê Thị H", "Nguyễn Văn K"]
export const GD_STATUSES = ["Hoàn thành", "Đang xử lý"]
export const GD_STATUS_META: Record<string, StatusMeta> = {
  "Hoàn thành": { label: "Hoàn thành", bg: "#ecfdf5", fg: "#047857", dot: "#10b981", bd: "#a7f3d0" },
  "Đang xử lý": { label: "Đang xử lý", bg: "#fffbeb", fg: "#b45309", dot: "#f59e0b", bd: "#fde68a" },
}

/* ============================ GIAO DỊCH HẬU KIỂM ============================ */
export interface HkTxn {
  id: string; soCC: string; tenGD: string; benLienQuan: string; taiSan: string
  tchncc: string; ccv: string; trangThai: string
  year: number; month: number
  violations: string[]   // mã tiêu chí vi phạm (rỗng = hợp lệ)
}

const t = (
  id: string, soCC: string, tenGD: string, benLienQuan: string, taiSan: string, ccv: string,
  trangThai: string, year: number, month: number, violations: string[],
): HkTxn => ({ id, soCC, tenGD, benLienQuan, taiSan, tchncc: VPPC_NAME, ccv, trangThai, year, month, violations })

export const HK_TXNS: HkTxn[] = [
  t("HK01", "CC-2026-001", "Mua bán nhà đất", "Nguyễn Văn A", "Thửa đất số 12, tờ BĐ 5", "Trần Văn B", "Hoàn thành", 2026, 1, ["UC219"]),
  t("HK02", "CC-2026-002", "Thế chấp QSDĐ", "Lê Thị C", "Thửa đất số 34, tờ BĐ 7", "Phạm Văn D", "Hoàn thành", 2026, 1, ["UC220", "UC233"]),
  t("HK03", "CC-2026-003", "Chuyển nhượng QSDĐ", "Trần Văn E", "Thửa đất số 56", "Trần Văn B", "Hoàn thành", 2026, 2, ["UC221"]),
  t("HK04", "CC-2026-004", "Ủy quyền định đoạt", "Phạm Thị F", "Căn hộ CT2-1204", "Lê Thị H", "Đang xử lý", 2026, 2, ["UC222"]),
  t("HK05", "CC-2026-005", "Mua bán xe ô tô", "Hoàng Văn G", "Ô tô 30A-123.45", "Nguyễn Văn K", "Hoàn thành", 2026, 2, ["UC236"]),
  t("HK06", "CC-2026-006", "Tặng cho tài sản", "Đỗ Thị I", "Thửa đất số 78", "Trần Văn B", "Hoàn thành", 2026, 3, ["UC223"]),
  t("HK07", "CC-2026-007", "Hợp đồng thế chấp", "Vũ Văn J", "Nhà ở gắn liền đất", "Phạm Văn D", "Hoàn thành", 2026, 3, ["UC224", "UC234"]),
  t("HK08", "CC-2026-008", "Mua bán căn hộ", "Bùi Thị K", "Căn hộ A2-0801", "Lê Thị H", "Hoàn thành", 2026, 3, ["UC225"]),
  t("HK09", "CC-2026-009", "Chuyển nhượng QSDĐ", "Ngô Văn L", "Thửa đất số 90", "Nguyễn Văn K", "Đang xử lý", 2026, 3, ["UC226"]),
  t("HK10", "CC-2026-010", "Mua bán nhà đất", "Dương Thị M", "Thửa đất số 11", "Trần Văn B", "Hoàn thành", 2026, 4, ["UC227"]),
  t("HK11", "CC-2026-011", "Thế chấp tài sản", "Lý Văn N", "Xe mô tô 29B1-456.78", "Phạm Văn D", "Hoàn thành", 2026, 4, ["UC228", "UC235"]),
  t("HK12", "CC-2026-012", "Ủy quyền", "Phan Thị O", "Căn hộ B1-1105", "Lê Thị H", "Hoàn thành", 2026, 4, ["UC229"]),
  t("HK13", "CC-2026-013", "Mua bán nhà đất", "Cao Văn P", "Thửa đất số 22", "Nguyễn Văn K", "Hoàn thành", 2026, 5, ["UC230"]),
  t("HK14", "CC-2026-014", "Chuyển nhượng QSDĐ", "Đặng Thị Q", "Thửa đất số 33", "Trần Văn B", "Đang xử lý", 2026, 5, ["UC231"]),
  t("HK15", "CC-2026-015", "Mua bán tàu cá", "Trịnh Văn R", "Tàu cá KG-99999-TS", "Phạm Văn D", "Hoàn thành", 2026, 5, ["UC232", "UC239"]),
  t("HK16", "CC-2026-016", "Mua bán tàu biển", "Hồ Thị S", "Tàu biển VN-1234", "Lê Thị H", "Hoàn thành", 2026, 6, ["UC237"]),
  t("HK17", "CC-2026-017", "Thế chấp phương tiện", "Mai Văn T", "Phương tiện thủy VR-2020", "Nguyễn Văn K", "Hoàn thành", 2026, 6, ["UC238"]),
  t("HK18", "CC-2026-018", "Mua bán tàu bay", "Tạ Thị U", "Tàu bay VN-A321", "Trần Văn B", "Đang xử lý", 2026, 6, ["UC240"]),
  t("HK19", "CC-2026-019", "Mua bán nhà đất", "Lương Văn V", "Thửa đất số 44", "Phạm Văn D", "Hoàn thành", 2026, 7, ["UC219", "UC221"]),
  t("HK20", "CC-2026-020", "Chuyển nhượng QSDĐ", "Chu Thị X", "Thửa đất số 55", "Lê Thị H", "Hoàn thành", 2026, 7, []),
  t("HK21", "CC-2026-021", "Thế chấp QSDĐ", "Đoàn Văn Y", "Thửa đất số 66", "Nguyễn Văn K", "Hoàn thành", 2026, 7, []),
  t("HK22", "CC-2026-022", "Mua bán căn hộ", "Kiều Thị Z", "Căn hộ C3-0902", "Trần Văn B", "Hoàn thành", 2026, 8, []),
  t("HK23", "CC-2026-023", "Ủy quyền", "Tô Văn AA", "Thửa đất số 77", "Phạm Văn D", "Hoàn thành", 2026, 8, []),
  t("HK24", "CC-2026-024", "Mua bán xe ô tô", "Hà Thị BB", "Ô tô 51G-678.90", "Lê Thị H", "Hoàn thành", 2026, 8, ["UC236"]),
  // Dữ liệu 2025 để kiểm thử bộ lọc năm
  t("HK25", "CC-2025-101", "Mua bán nhà đất", "Nguyễn Văn CC", "Thửa đất số 88", "Trần Văn B", "Hoàn thành", 2025, 11, ["UC219"]),
  t("HK26", "CC-2025-102", "Thế chấp QSDĐ", "Lê Thị DD", "Thửa đất số 99", "Phạm Văn D", "Hoàn thành", 2025, 12, []),
]

/* ============================ THỐNG KÊ ============================ */
export interface HkFilter { year: number; months: number[] } // months rỗng = tất cả

export function filterByPeriod(rows: HkTxn[], f: HkFilter): HkTxn[] {
  return rows.filter((r) => r.year === f.year && (f.months.length === 0 || f.months.includes(r.month)))
}

// Card C01-C03.
export function overviewStats(rows: HkTxn[]) {
  const tong = rows.length
  const khongHopLe = rows.filter((r) => r.violations.length > 0).length
  return { tong, hopLe: tong - khongHopLe, khongHopLe }
}

// Số GD vi phạm cho một mã tiêu chí (đếm GD có chứa mã đó).
export const countCriterion = (rows: HkTxn[], code: string) => rows.filter((r) => r.violations.includes(code)).length
// Tổng vi phạm của nhóm = tổng theo từng tiêu chí con (BR: 15+10=25).
export const countGroup = (rows: HkTxn[], g: CriteriaGroup) => g.children.reduce((s, c) => s + countCriterion(rows, c.code), 0)

/* ============================ TÌM KIẾM DANH SÁCH (SCR-02) ============================ */
export const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/\s+/g, " ").trim()

export interface ListFilter {
  soCC: string; tenGD: string; ccvText: string; trangThai: string
  ccvChon: string[]; tieuChi: string[]
}

export function searchTxns(pool: HkTxn[], f: ListFilter): HkTxn[] {
  const inc = (hay: string, kw: string) => norm(hay).includes(norm(kw))
  return pool.filter((r) => {
    if (f.soCC.trim() && !inc(r.soCC, f.soCC)) return false
    if (f.tenGD.trim() && !inc(r.tenGD, f.tenGD)) return false
    if (f.ccvText.trim() && !inc(r.ccv, f.ccvText)) return false
    if (f.trangThai !== "all" && r.trangThai !== f.trangThai) return false
    // F05 nhiều CCV — quan hệ OR
    if (f.ccvChon.length && !f.ccvChon.includes(r.ccv)) return false
    // F06 nhiều tiêu chí — OR (vi phạm ít nhất một tiêu chí đã chọn)
    if (f.tieuChi.length && !r.violations.some((v) => f.tieuChi.includes(v))) return false
    return true
  })
}
