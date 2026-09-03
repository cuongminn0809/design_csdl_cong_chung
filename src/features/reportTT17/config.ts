import { CURRENT_YEAR, PROVINCES, TCHNCC_LIST, TODAY_ISO, fmtVN } from "../report/config"

export { PROVINCES, TCHNCC_LIST, CURRENT_YEAR, TODAY_ISO, fmtVN }

/* ============================ VAI TRÒ ============================ */
export type Tt17Role = "ld_btp" | "cv_btp" | "ld_stp" | "cv_stp" | "ld_tchncc"
export const TT17_ROLES: { key: Tt17Role; label: string }[] = [
  { key: "ld_btp", label: "Lãnh đạo Bộ Tư pháp" },
  { key: "cv_btp", label: "Chuyên viên BTP" },
  { key: "ld_stp", label: "Lãnh đạo phòng chuyên môn STP" },
  { key: "cv_stp", label: "Chuyên viên Sở Tư pháp" },
  { key: "ld_tchncc", label: "Lãnh đạo TCHNCC" },
]
export const isBo = (r: Tt17Role) => r === "ld_btp" || r === "cv_btp"
export const isSo = (r: Tt17Role) => r === "ld_stp" || r === "cv_stp"

export const CURRENT_PROVINCE = "Hà Nội"
export const CURRENT_ORG = "VPCC Nguyễn Văn A"

/* ============================ KỲ BÁO CÁO ============================ */
export type PeriodKey = "SB6T" | "SBN" | "TN"
export const PERIODS: { key: PeriodKey; label: string; from: string; toMD: string; formHan: string }[] = [
  { key: "SB6T", label: "Sơ bộ 6 tháng", from: "01/01", toMD: "05-31", formHan: "31/05" },
  { key: "SBN", label: "Sơ bộ năm", from: "01/01", toMD: "10-31", formHan: "31/10" },
  { key: "TN", label: "Tròn năm", from: "01/01", toMD: "12-31", formHan: "31/12" },
]
export const periodOf = (k: PeriodKey) => PERIODS.find((p) => p.key === k)!
export const periodRangeLabel = (k: PeriodKey, year: number) => `01/01/${year} – ${periodOf(k).formHan}/${year}`
export const periodEndISO = (k: PeriodKey, year: number) => `${year}-${periodOf(k).toMD}`
// BR-12/BR-13: kỳ đã chốt (quá khứ) hay đang mở (chưa đến ngày chốt).
export const isPeriodClosed = (k: PeriodKey, year: number) => year < CURRENT_YEAR || (year === CURRENT_YEAR && TODAY_ISO > periodEndISO(k, year))
export const REPORT_YEARS = [2026, 2025, 2024]

/* ============================ CHỈ TIÊU (C1–C19) ============================ */
export interface Indicators { c1: number; c2: number; c3: number; c4: number; c5: number; c6: number; c7: number; c9: number; c10: number }
export interface Tt17Row extends Indicators { key: string; label: string; group?: "I" | "II"; ghiChu?: string }

export const COL_LABELS: { code: string; label: string; unit: string }[] = [
  { code: "1", label: "Số công chứng viên đang hành nghề", unit: "Người" },
  { code: "2", label: "Tổng số việc công chứng giao dịch", unit: "Việc" },
  { code: "3", label: "Công chứng giao dịch về bất động sản", unit: "Việc" },
  { code: "4", label: "Công chứng giao dịch điện tử về BĐS", unit: "Việc" },
  { code: "5", label: "Công chứng giao dịch khác", unit: "Việc" },
  { code: "6", label: "Công chứng giao dịch điện tử khác", unit: "Việc" },
  { code: "7", label: "Phí công chứng", unit: "Đồng" },
  { code: "8", label: "Phí khai thác, sử dụng thông tin liên quan đến giao dịch", unit: "Đồng" },
  { code: "9", label: "Giá dịch vụ theo yêu cầu liên quan đến việc công chứng", unit: "Đồng" },
  { code: "10", label: "Chi phí khác", unit: "Đồng" },
  { code: "11", label: "Tổng số lượng bản sao được chứng thực", unit: "Bản" },
  { code: "12", label: "Chứng thực bản sao điện tử từ bản chính", unit: "Bản" },
  { code: "13", label: "Phí chứng thực bản sao", unit: "Đồng" },
  { code: "14", label: "Số việc chứng thực chữ ký trong giấy tờ, văn bản", unit: "Việc" },
  { code: "15", label: "Phí chứng thực chữ ký trong giấy tờ, văn bản", unit: "Đồng" },
  { code: "16", label: "Số việc chứng thực chữ ký người dịch", unit: "Việc" },
  { code: "17", label: "Phí chứng thực chữ ký người dịch", unit: "Đồng" },
  { code: "18", label: "Tổng số tiền nộp vào ngân sách nhà nước/thuế", unit: "Đồng" },
  { code: "19", label: "Ghi chú", unit: "" },
]

/* ============================ CÔNG THỨC KIỂM SOÁT (BR-07–BR-09) ============================ */
export interface Violation { rule: string; desc: string; detail: string }
export function checkViolations(r: Indicators): Violation[] {
  const v: Violation[] = []
  if (r.c2 !== r.c3 + r.c5) v.push({ rule: "BR-07", desc: "Tổng số việc ≠ BĐS + Khác", detail: `C2=${r.c2}; C3+C5=${r.c3 + r.c5}` })
  if (!(r.c4 >= 0 && r.c4 <= r.c3)) v.push({ rule: "BR-08", desc: "BĐS điện tử > BĐS", detail: `C4=${r.c4}; C3=${r.c3}` })
  if (!(r.c6 >= 0 && r.c6 <= r.c5)) v.push({ rule: "BR-09", desc: "Khác điện tử > Khác", detail: `C6=${r.c6}; C5=${r.c5}` })
  return v
}

/* ============================ DỮ LIỆU MẪU — CẤP BỘ (theo Tỉnh/TP, Biểu 10b) ============================ */
const ind = (c1: number, c2: number, c3: number, c4: number, c5: number, c6: number, c7: number, c9: number, c10: number): Indicators => ({ c1, c2, c3, c4, c5, c6, c7, c9, c10 })
export const MINISTRY_ROWS: Tt17Row[] = [
  // Hà Nội: cố ý gieo vi phạm BR-07/08/09 để minh họa Dialog SCR-A.6.5.5-01 (khớp ví dụ wireframe).
  { key: "hanoi", label: "Hà Nội", ...ind(1200, 100, 45, 50, 28, 30, 42_500_000_000, 18_200_000_000, 3_100_000_000) },
  { key: "hcm", label: "TP. Hồ Chí Minh", ...ind(1450, 620, 380, 95, 240, 60, 58_000_000_000, 24_600_000_000, 4_200_000_000) },
  { key: "danang", label: "Đà Nẵng", ...ind(380, 210, 130, 40, 80, 25, 15_800_000_000, 6_900_000_000, 1_100_000_000) },
  { key: "kiengiang", label: "Kiên Giang", ...ind(150, 95, 60, 12, 35, 8, 6_200_000_000, 2_400_000_000, 420_000_000) },
]
export function totalRow(rows: Tt17Row[], label: string): Tt17Row {
  const sum = (k: keyof Indicators) => rows.reduce((s, r) => s + r[k], 0)
  return { key: "total", label, c1: sum("c1"), c2: sum("c2"), c3: sum("c3"), c4: sum("c4"), c5: sum("c5"), c6: sum("c6"), c7: sum("c7"), c9: sum("c9"), c10: sum("c10") }
}

/* ============================ DỮ LIỆU MẪU — CẤP SỞ (theo TCHNCC, Biểu 10b) ============================ */
// Hà Nội quản lý 2 TCHNCC: Phòng công chứng số 1 (nhóm I) + VPCC Nguyễn Văn A (nhóm II, cố ý gieo vi phạm).
export const DEPARTMENT_ROWS: Tt17Row[] = [
  { key: "pcc1", label: "Phòng công chứng số 1", group: "I", ...ind(6, 40, 22, 5, 18, 4, 16_000_000_000, 6_800_000_000, 1_050_000_000) },
  { key: "vpcc-nva", label: "VPCC Nguyễn Văn A", group: "II", ...ind(1194, 100, 45, 50, 28, 30, 42_500_000_000, 18_200_000_000, 3_100_000_000) },
]

/* ============================ DỮ LIỆU MẪU — CẤP TCHNCC (Biểu 10a, 1 dòng, không vi phạm) ============================ */
export const NOTARY_ORG_ROW: Indicators = ind(6, 40, 22, 5, 18, 4, 16_000_000_000, 6_800_000_000, 1_050_000_000)

/* ============================ ĐỊNH DẠNG ============================ */
export const fmtNum = (n: number) => n.toLocaleString("vi-VN")
export const fmtBlank = () => "–" // BR-02: chỉ tiêu chưa có dữ liệu để trống
export const todayLongVN = () => { const [y, m, d] = TODAY_ISO.split("-"); return `ngày ${d} tháng ${m} năm ${y}` }

/* ============================ TÊN FILE XUẤT (BR-10) ============================ */
const yyyyMMdd = () => TODAY_ISO.replace(/-/g, "")
export const reportFileName = (bieu: "10a" | "10b") => `${yyyyMMdd()}_Báo cáo kết quả hoạt động công chứng theo TT17-2025-TT-BTP_${bieu}.xlsx`
export const comparisonFileName = (years: number[]) => `${yyyyMMdd()}_Báo cáo phân tích so sánh_${[...years].sort((a, b) => b - a).join("-")}.xlsx`
export const historyFileName = () => `${yyyyMMdd()}_Báo cáo lịch sử xuất báo cáo.xlsx`

/* ============================ PHÂN TÍCH SO SÁNH (BR-04) ============================ */
export const COMPARE_INDICATORS = ["Số công chứng viên", "Tổng số việc công chứng", "Tổng số giao dịch công chứng về bất động sản", "Tổng số giao dịch công chứng khác", "Tổng số giao dịch công chứng điện tử về bất động sản", "Tổng số giao dịch công chứng điện tử khác", "Phí công chứng"] as const

// Dữ liệu mẫu theo năm cho phạm vi Toàn quốc (Tổng toàn quốc mỗi năm), dùng cho tab Phân tích so sánh.
export const YEARLY_TOTALS: Record<number, Record<(typeof COMPARE_INDICATORS)[number], number>> = {
  2026: { "Số công chứng viên": 3180, "Tổng số việc công chứng": 1025, "Tổng số giao dịch công chứng về bất động sản": 615, "Tổng số giao dịch công chứng khác": 410, "Tổng số giao dịch công chứng điện tử về bất động sản": 197, "Tổng số giao dịch công chứng điện tử khác": 123, "Phí công chứng": 122_500_000_000 },
  2025: { "Số công chứng viên": 2960, "Tổng số việc công chứng": 960, "Tổng số giao dịch công chứng về bất động sản": 580, "Tổng số giao dịch công chứng khác": 380, "Tổng số giao dịch công chứng điện tử về bất động sản": 150, "Tổng số giao dịch công chứng điện tử khác": 95, "Phí công chứng": 112_000_000_000 },
  2024: { "Số công chứng viên": 2740, "Tổng số việc công chứng": 895, "Tổng số giao dịch công chứng về bất động sản": 545, "Tổng số giao dịch công chứng khác": 350, "Tổng số giao dịch công chứng điện tử về bất động sản": 80, "Tổng số giao dịch công chứng điện tử khác": 52, "Phí công chứng": 101_000_000_000 },
}
export function diffAndRate(a: number, b: number): { diff: number; rate: string } {
  const diff = a - b
  if (b === 0) return { diff, rate: "Không xác định" }
  const rate = (diff / b) * 100
  return { diff, rate: `${rate >= 0 ? "+" : ""}${rate.toFixed(2)}%` }
}

/* ============================ LỊCH SỬ BÁO CÁO ============================ */
export interface HistoryRecord { maBaoCao: string; ky: string; pham_vi: string; bieuMau: string; nguoiTH: string; thoiDiem: string; thoiDiemISO: string; loai: "REPORT" | "COMPARISON" }
export const HISTORY_RECORDS: HistoryRecord[] = [
  { maBaoCao: "BTP-SB6T-2026-001", ky: "SB 6T - 2026", pham_vi: "Toàn quốc", bieuMau: "10b/TP/CC", nguoiTH: "Nguyễn Văn A", thoiDiem: "27/07/2026 14:30", thoiDiemISO: "2026-07-27", loai: "REPORT" },
  { maBaoCao: "STP01-TN-2025-014", ky: "Tròn năm - 2025", pham_vi: "TP. Hà Nội", bieuMau: "10b/TP/CC", nguoiTH: "Trần Thị B", thoiDiem: "15/01/2026 09:00", thoiDiemISO: "2026-01-15", loai: "REPORT" },
  { maBaoCao: "VPCC01-SBN-2025-007", ky: "SB năm - 2025", pham_vi: "VPCC Nguyễn Văn A", bieuMau: "10a/TP/CC", nguoiTH: "Lê Văn C", thoiDiem: "05/11/2025 16:20", thoiDiemISO: "2025-11-05", loai: "REPORT" },
  { maBaoCao: "SS-2026-2025-2024-002", ky: "Tròn năm", pham_vi: "Toàn quốc", bieuMau: "So sánh", nguoiTH: "Nguyễn Văn A", thoiDiem: "27/07/2026 15:10", thoiDiemISO: "2026-07-27", loai: "COMPARISON" },
  { maBaoCao: "BTP-SBN-2025-030", ky: "SB năm - 2025", pham_vi: "Toàn quốc", bieuMau: "10b/TP/CC", nguoiTH: "Phạm Thị D", thoiDiem: "08/11/2025 10:05", thoiDiemISO: "2025-11-08", loai: "REPORT" },
]
