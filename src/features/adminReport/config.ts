import { PROVINCES, TCHNCC_LIST, TODAY_ISO } from "../report/config"

export { PROVINCES, TCHNCC_LIST, TODAY_ISO }

/* ============================ VAI TRÒ (VR-01) ============================ */
export type AdminRole = "quan_tri" | "ccv"
export const ADMIN_ROLES: { key: AdminRole; label: string }[] = [
  { key: "quan_tri", label: "Quản trị hệ thống" },
  { key: "ccv", label: "Công chứng viên" },
]

/* ============================ LOẠI DỮ LIỆU (BR-05) ============================ */
export const DATA_TYPES = [
  "Giao dịch công chứng", "Thông tin ngăn chặn", "Thông tin rủi ro", "Tài sản hình thành từ giao dịch",
  "Bên liên quan", "Văn bản công chứng điện tử", "Công chứng viên", "Tổ chức hành nghề công chứng",
]

/* ============================ KHOẢNG THỜI GIAN MẶC ĐỊNH (BR-01) ============================ */
function addDaysISO(iso: string, days: number) { const d = new Date(iso); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10) }
export const DEFAULT_FROM = addDaysISO(TODAY_ISO, -29)
export const DEFAULT_TO = TODAY_ISO
export const fmtVN = (iso: string) => { const [y, m, d] = iso.split("-"); return `${d}/${m}/${y}` }
export const fmtNum = (n: number) => n.toLocaleString("vi-VN")

// VR-02: Từ ngày <= Đến ngày, khoảng lọc <= 366 ngày. VR-04: không được để trống.
export function validateRange(from: string, to: string): string {
  if (!from || !to) return "Vui lòng nhập Từ ngày và Đến ngày."
  if (from > to) return "Khoảng thời gian không hợp lệ."
  const days = (new Date(to).getTime() - new Date(from).getTime()) / 86_400_000
  if (days > 366) return "Khoảng thời gian không hợp lệ."
  return ""
}
export const inRange = (iso: string, from: string, to: string) => (!from || iso >= from) && (!to || iso <= to)

/* ============================ XUẤT BÁO CÁO (VR-03, BR-04, BR-06) ============================ */
export function exportMsg(count: number): { msg: string; kind: "ok" | "error" } {
  if (count === 0) return { msg: "Không có dữ liệu thỏa mãn điều kiện tra cứu.", kind: "error" }
  if (count > 100_000) return { msg: "Dữ liệu kết xuất vượt quá giới hạn 100.000 dòng. Hệ thống đã tự động giới hạn 100.000 dòng đầu tiên.", kind: "error" }
  return { msg: "Kết xuất báo cáo thành công. Tệp đã được tải về máy của bạn.", kind: "ok" }
}

/* ============================ TRẠNG THÁI DÙNG CHUNG ============================ */
export const STATUS_META: Record<string, { badge: string; dot: string }> = {
  "Hoạt động": { badge: "border-[#a7f3d0] bg-[#ecfdf5] text-[#047857]", dot: "#10b981" },
  "Cảnh báo": { badge: "border-[#fde68a] bg-[#fffbeb] text-[#b45309]", dot: "#f59e0b" },
  "Sự cố": { badge: "border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]", dot: "#ef4444" },
  "Thành công": { badge: "border-[#a7f3d0] bg-[#ecfdf5] text-[#047857]", dot: "#10b981" },
  "Thất bại": { badge: "border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]", dot: "#ef4444" },
  "Đang xử lý": { badge: "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]", dot: "#3b82f6" },
  "OK": { badge: "border-[#a7f3d0] bg-[#ecfdf5] text-[#047857]", dot: "#10b981" },
  "Lỗi": { badge: "border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]", dot: "#ef4444" },
  "Mới": { badge: "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]", dot: "#3b82f6" },
  "Đã xử lý": { badge: "border-[#a7f3d0] bg-[#ecfdf5] text-[#047857]", dot: "#10b981" },
}

/* ============================ SCR-A.6.6-01: GIÁM SÁT HỆ THỐNG ============================ */
export const COMPONENT_TYPES = ["API Gateway", "Cơ sở dữ liệu", "Dịch vụ ETL", "Máy chủ ứng dụng", "Khác"]
export const OPERATION_STATUSES = ["Hoạt động", "Cảnh báo", "Sự cố"]
export interface SystemComponent {
  key: string; name: string; type: string; status: string
  volume: number; successRate: number; avgResponseMs: number
  cpu: number; ram: number; disk: number; alerts: number; updatedAtISO: string
}
export const SYSTEM_COMPONENTS: SystemComponent[] = [
  { key: "c1", name: "API Gateway", type: "API Gateway", status: "Hoạt động", volume: 12500, successRate: 99.2, avgResponseMs: 120, cpu: 45, ram: 60, disk: 38, alerts: 0, updatedAtISO: "2026-08-28T09:12:00" },
  { key: "c2", name: "CSDL Công chứng - Primary", type: "Cơ sở dữ liệu", status: "Cảnh báo", volume: 48210, successRate: 98.5, avgResponseMs: 85, cpu: 82, ram: 74, disk: 91, alerts: 2, updatedAtISO: "2026-08-28T09:10:00" },
  { key: "c3", name: "Dịch vụ ETL - Thu thập", type: "Dịch vụ ETL", status: "Sự cố", volume: 3200, successRate: 62.1, avgResponseMs: 540, cpu: 91, ram: 88, disk: 55, alerts: 5, updatedAtISO: "2026-08-28T08:55:00" },
  { key: "c4", name: "Máy chủ ứng dụng - Web", type: "Máy chủ ứng dụng", status: "Hoạt động", volume: 9800, successRate: 99.8, avgResponseMs: 95, cpu: 38, ram: 52, disk: 40, alerts: 0, updatedAtISO: "2026-08-28T09:14:00" },
  { key: "c5", name: "Dịch vụ ETL - Chuẩn hóa", type: "Dịch vụ ETL", status: "Hoạt động", volume: 7600, successRate: 97.4, avgResponseMs: 210, cpu: 55, ram: 61, disk: 33, alerts: 0, updatedAtISO: "2026-08-28T09:05:00" },
  { key: "c6", name: "Cổng xác thực (IAM)", type: "Khác", status: "Cảnh báo", volume: 15400, successRate: 96.9, avgResponseMs: 130, cpu: 80, ram: 68, disk: 25, alerts: 1, updatedAtISO: "2026-08-28T09:08:00" },
  { key: "c7", name: "CSDL Công chứng - Replica", type: "Cơ sở dữ liệu", status: "Hoạt động", volume: 22000, successRate: 99.5, avgResponseMs: 70, cpu: 40, ram: 45, disk: 60, alerts: 0, updatedAtISO: "2026-08-28T09:13:00" },
]
// Chuỗi thời gian mô phỏng 14 ngày cho từng chỉ số biểu đồ G01.
export const MONITORING_METRICS = ["Khối lượng xử lý", "Tỷ lệ thành công", "CPU", "RAM", "Disk"] as const
export type MonitoringMetric = (typeof MONITORING_METRICS)[number]
export const MONITORING_SERIES: Record<MonitoringMetric, number[]> = {
  "Khối lượng xử lý": [98000, 101000, 99500, 105000, 108000, 112000, 110500, 115000, 118500, 116000, 119500, 121000, 118000, 122500],
  "Tỷ lệ thành công": [98.9, 99.0, 98.7, 99.1, 99.0, 98.5, 98.8, 99.2, 99.3, 99.0, 99.1, 98.9, 99.0, 99.2],
  "CPU": [58, 60, 62, 65, 63, 68, 70, 72, 69, 71, 74, 73, 70, 68],
  "RAM": [62, 63, 65, 64, 66, 68, 70, 71, 69, 70, 72, 71, 70, 69],
  "Disk": [40, 41, 41, 42, 43, 43, 44, 44, 45, 45, 46, 46, 47, 47],
}
export const SERIES_DATES = Array.from({ length: 14 }, (_, i) => addDaysISO(TODAY_ISO, -13 + i))

/* ============================ SCR-A.6.6-02: KHAI THÁC DỮ LIỆU ============================ */
// TCHNCC → Tỉnh/TP tương ứng, khớp mapping đã dùng chung toàn app.
export const ORG_PROVINCE: Record<string, string> = {
  "VPCC Nguyễn Văn A": "Hà Nội", "Phòng Công chứng số 1": "Hà Nội",
  "VPCC Trần Văn B": "TP. Hồ Chí Minh", "VPCC Bến Thành": "TP. Hồ Chí Minh",
  "VPCC Sông Hàn": "Đà Nẵng",
}
export interface ExploitLog { key: string; dateISO: string; province: string; org: string; dataType: string; count: number }
const ex = (key: string, dateISO: string, org: string, dataType: string, count: number): ExploitLog => ({ key, dateISO, province: ORG_PROVINCE[org], org, dataType, count })
export const EXPLOIT_LOGS: ExploitLog[] = [
  ex("e1", "2026-08-05", "Phòng Công chứng số 1", "Giao dịch công chứng", 152),
  ex("e2", "2026-08-05", "VPCC Trần Văn B", "Thông tin ngăn chặn", 88),
  ex("e3", "2026-08-06", "VPCC Nguyễn Văn A", "Giao dịch công chứng", 210),
  ex("e4", "2026-08-06", "VPCC Sông Hàn", "Công chứng viên", 34),
  ex("e5", "2026-08-07", "VPCC Bến Thành", "Tài sản hình thành từ giao dịch", 66),
  ex("e6", "2026-08-08", "Phòng Công chứng số 1", "Giao dịch công chứng", 175),
  ex("e7", "2026-08-10", "VPCC Trần Văn B", "Bên liên quan", 41),
  ex("e8", "2026-08-12", "VPCC Nguyễn Văn A", "Văn bản công chứng điện tử", 58),
  ex("e9", "2026-08-14", "VPCC Sông Hàn", "Thông tin rủi ro", 22),
  ex("e10", "2026-08-16", "VPCC Bến Thành", "Giao dịch công chứng", 190),
  ex("e11", "2026-08-18", "Phòng Công chứng số 1", "Tổ chức hành nghề công chứng", 15),
  ex("e12", "2026-08-20", "VPCC Nguyễn Văn A", "Giao dịch công chứng", 240),
  ex("e13", "2026-08-22", "VPCC Trần Văn B", "Công chứng viên", 47),
  ex("e14", "2026-08-24", "VPCC Sông Hàn", "Giao dịch công chứng", 130),
  ex("e15", "2026-08-26", "VPCC Bến Thành", "Bên liên quan", 36),
  ex("e16", "2026-08-27", "Phòng Công chứng số 1", "Văn bản công chứng điện tử", 29),
  ex("e17", "2026-08-28", "VPCC Nguyễn Văn A", "Giao dịch công chứng", 152),
]

/* ============================ SCR-A.6.6-03: THU THẬP DỮ LIỆU (Phân hệ B) ============================ */
export const COLLECT_METHODS = ["API", "Thủ công", "Đồng bộ tự động", "Khác"]
export const RESULT_STATUSES = ["Thành công", "Thất bại", "Đang xử lý"]
export interface CollectionRow { key: string; dateISO: string; org: string; method: string; packages: number; recordsOk: number; sizeMb: number; status: string; dataType: string }
const cl = (key: string, dateISO: string, org: string, method: string, packages: number, recordsOk: number, sizeMb: number, status: string, dataType: string): CollectionRow =>
  ({ key, dateISO, org, method, packages, recordsOk, sizeMb, status, dataType })
export const COLLECTION_ROWS: CollectionRow[] = [
  cl("cl1", "2026-08-05", "Sở Tư pháp Hà Nội", "API", 120, 15000, 250, "Thành công", "Giao dịch công chứng"),
  cl("cl2", "2026-08-08", "Sở Tư pháp TP. Hồ Chí Minh", "Đồng bộ tự động", 98, 12400, 210, "Thành công", "Giao dịch công chứng"),
  cl("cl3", "2026-08-12", "Sở Tư pháp Đà Nẵng", "Thủ công", 15, 1800, 30, "Đang xử lý", "Bên liên quan"),
  cl("cl4", "2026-08-16", "Sở Tư pháp Hà Nội", "API", 60, 5400, 90, "Thất bại", "Thông tin ngăn chặn"),
  cl("cl5", "2026-08-20", "Sở Tư pháp Kiên Giang", "Khác", 34, 3100, 48, "Thành công", "Công chứng viên"),
  cl("cl6", "2026-08-24", "Sở Tư pháp TP. Hồ Chí Minh", "API", 142, 17800, 305, "Thành công", "Tài sản hình thành từ giao dịch"),
]

/* ============================ SCR-A.6.6-04/05: LÀM SẠCH & CHUẨN HÓA DỮ LIỆU (Phân hệ B) ============================ */
export interface ProcessRow { key: string; dateISO: string; code: string; dataType: string; org: string; processed: number; errors: number; status: string }
const pr = (key: string, dateISO: string, code: string, dataType: string, org: string, processed: number, errors: number, status: string): ProcessRow =>
  ({ key, dateISO, code, dataType, org, processed, errors, status })
export const CLEANSING_ROWS: ProcessRow[] = [
  pr("cs1", "2026-08-06", "TT-001", "Giao dịch công chứng", "Hà Nội", 5000, 12, "Thành công"),
  pr("cs2", "2026-08-10", "TT-002", "Bên liên quan", "TP. Hồ Chí Minh", 3200, 0, "Thành công"),
  pr("cs3", "2026-08-14", "TT-003", "Thông tin ngăn chặn", "Đà Nẵng", 800, 45, "Đang xử lý"),
  pr("cs4", "2026-08-18", "TT-004", "Tài sản hình thành từ giao dịch", "Hà Nội", 2100, 3, "Thành công"),
  pr("cs5", "2026-08-22", "TT-005", "Công chứng viên", "Kiên Giang", 450, 0, "Thất bại"),
]
export const NORMALIZATION_ROWS: ProcessRow[] = [
  pr("nm1", "2026-08-07", "CH-001", "Giao dịch công chứng", "Hà Nội", 4800, 8, "Thành công"),
  pr("nm2", "2026-08-11", "CH-002", "Văn bản công chứng điện tử", "TP. Hồ Chí Minh", 1500, 2, "Thành công"),
  pr("nm3", "2026-08-15", "CH-003", "Thông tin rủi ro", "Đà Nẵng", 620, 15, "Đang xử lý"),
  pr("nm4", "2026-08-19", "CH-004", "Tổ chức hành nghề công chứng", "Hà Nội", 90, 0, "Thành công"),
]

/* ============================ SCR-A.6.6-06: ĐỐI SOÁT DỮ LIỆU (Phân hệ B) ============================ */
export interface ReconcileRow { key: string; dateISO: string; org: string; dataType: string; source: number; matched: number; mismatched: number; status: string; result: "Khớp" | "Có sai lệch" }
const rc = (key: string, dateISO: string, org: string, dataType: string, source: number, matched: number, status: string): ReconcileRow =>
  ({ key, dateISO, org, dataType, source, matched, mismatched: source - matched, status, result: source === matched ? "Khớp" : "Có sai lệch" })
export const RECONCILE_ROWS: ReconcileRow[] = [
  rc("rc1", "2026-08-05", "Hà Nội", "Giao dịch công chứng", 1000, 998, "Thành công"),
  rc("rc2", "2026-08-09", "TP. Hồ Chí Minh", "Bên liên quan", 850, 850, "Thành công"),
  rc("rc3", "2026-08-13", "Đà Nẵng", "Tài sản hình thành từ giao dịch", 420, 415, "Thành công"),
  rc("rc4", "2026-08-17", "Kiên Giang", "Thông tin ngăn chặn", 210, 210, "Thành công"),
  rc("rc5", "2026-08-21", "Hà Nội", "Công chứng viên", 130, 122, "Đang xử lý"),
]

/* ============================ SCR-A.6.6-07: HẬU KIỂM DỮ LIỆU (Phân hệ B) ============================ */
export const ERROR_TYPES = ["Trùng lặp", "Thiếu trường bắt buộc", "Sai định dạng", "Không khớp dữ liệu gốc", "Vi phạm quy tắc nghiệp vụ"]
export const POSTCHECK_STATUSES = ["Mới", "Đã xử lý", "Đang xử lý"]
export interface PostcheckRow { key: string; dateISO: string; code: string; dataType: string; org: string; errorType: string; errorCount: number; status: string }
const pc = (key: string, dateISO: string, code: string, dataType: string, org: string, errorType: string, errorCount: number, status: string): PostcheckRow =>
  ({ key, dateISO, code, dataType, org, errorType, errorCount, status })
export const POSTCHECK_ROWS: PostcheckRow[] = [
  pc("hk1", "2026-08-06", "HK-001", "Giao dịch công chứng", "Hà Nội", "Trùng lặp", 5, "Mới"),
  pc("hk2", "2026-08-10", "HK-002", "Tài sản hình thành từ giao dịch", "TP. Hồ Chí Minh", "Không khớp dữ liệu gốc", 3, "Đang xử lý"),
  pc("hk3", "2026-08-14", "HK-003", "Bên liên quan", "Đà Nẵng", "Sai định dạng", 8, "Đã xử lý"),
  pc("hk4", "2026-08-18", "HK-004", "Công chứng viên", "Hà Nội", "Thiếu trường bắt buộc", 2, "Mới"),
  pc("hk5", "2026-08-22", "HK-005", "Thông tin ngăn chặn", "Kiên Giang", "Vi phạm quy tắc nghiệp vụ", 1, "Đã xử lý"),
]
