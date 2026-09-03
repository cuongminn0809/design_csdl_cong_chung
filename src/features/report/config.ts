/* ============================ VAI TRÒ & PHẠM VI (BR-A6-01) ============================ */
export type ReportRole = "ld_btp" | "cv_btp" | "ld_stp" | "cv_stp" | "ld_tchncc" | "ccv"
export const REPORT_ROLES: { key: ReportRole; label: string }[] = [
  { key: "ld_btp", label: "Lãnh đạo Bộ Tư pháp" },
  { key: "cv_btp", label: "Chuyên viên BTP" },
  { key: "ld_stp", label: "Lãnh đạo Sở Tư pháp" },
  { key: "cv_stp", label: "Chuyên viên Sở Tư pháp" },
  { key: "ld_tchncc", label: "Lãnh đạo TCHNCC" },
  { key: "ccv", label: "Công chứng viên" },
]
export const isBo = (r: ReportRole) => r === "ld_btp" || r === "cv_btp"
export const isSo = (r: ReportRole) => r === "ld_stp" || r === "cv_stp"
export const isTchncc = (r: ReportRole) => r === "ld_tchncc"
export const isCcv = (r: ReportRole) => r === "ccv"
// Ẩn/hiện bộ lọc & cột theo Actor.
export const showTinh = (r: ReportRole) => isBo(r)               // F10/T10 Tỉnh/TP
export const showToChuc = (r: ReportRole) => isBo(r) || isSo(r)  // T05 Tổ chức thực hiện
export const showCcv = (r: ReportRole) => !isCcv(r)              // T06 Công chứng viên

const SO_PROVINCE = "Hà Nội"
const TCHNCC_ORG = "VPCC Nguyễn Văn A"
const CCV_NAME = "Nguyễn Văn A"
// Lọc dữ liệu theo phạm vi phân quyền (mô phỏng).
export function scopeRows<T extends { tinh?: string; toChuc?: string; ccv?: string }>(rows: T[], r: ReportRole): T[] {
  if (isBo(r)) return rows
  if (isSo(r)) return rows.filter((x) => x.tinh === SO_PROVINCE)
  if (isTchncc(r)) return rows.filter((x) => x.toChuc === TCHNCC_ORG)
  return rows.filter((x) => x.ccv === CCV_NAME)
}
export const exportFileName = (r: ReportRole, base: string) =>
  `${base}_${isBo(r) ? "BTP" : isSo(r) ? "STP" : isTchncc(r) ? "LanhDaoTCHNCC" : "CCV"}.xlsx`

/* ============================ DANH MỤC ============================ */
export const DATA_SOURCES = ["Hệ thống CSDL Công chứng", "Nền tảng CCĐT", "Phần mềm chuyển đổi DLCC"]
export const METHODS = ["Công chứng giấy", "CCĐT trực tiếp", "CCĐT trực tuyến"]
export const TCHNCC_LIST = ["VPCC Nguyễn Văn A", "VPCC Trần Văn B", "Phòng Công chứng số 1", "VPCC Bến Thành", "VPCC Sông Hàn"]
export const PROVINCES = ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Kiên Giang"]
export const ASSET_TYPES = ["Nhà ở/Đất ở", "Đất nông nghiệp", "Ô tô/Xe máy", "Sổ tiết kiệm", "Cổ phần/Cổ phiếu", "Tàu thuyền", "TS khác"]

/* ============================ BỘ LỌC THỜI GIAN (VR-01) ============================ */
export const CURRENT_YEAR = 2026
export const YEARS: (number | "custom")[] = [2026, 2025, 2024, 2023, 2022, 2021, 2020, "custom"]
export type PeriodKind = "ca-nam" | "theo-quy" | "theo-thang"
export interface TimeState { year: number | "custom"; kind: PeriodKind; month: number; quarter: number; tuNgay: string; denNgay: string }
export const DEFAULT_TIME: TimeState = { year: CURRENT_YEAR, kind: "ca-nam", month: 1, quarter: 1, tuNgay: "", denNgay: "" }

// D-2 (độ trễ chuẩn hóa). Hôm nay 28/08/2026 → 26/08/2026.
export const D_MINUS_2 = "2026-08-26"
export const TODAY_ISO = "2026-08-28"
const pad = (n: number) => String(n).padStart(2, "0")
const lastDay = (y: number, m: number) => new Date(y, m, 0).getDate()
export const fmtVN = (iso: string) => { const [y, m, d] = iso.split("-"); return `${d}/${m}/${y}` }

export interface ResolvedRange { from: string; to: string; label: string; error?: string }
// capMode "d2" (mặc định, A.6.1.x): Đến ngày <= D-2. "today" (A.6.3): Đến ngày <= Ngày hiện tại.
export function resolveRange(t: TimeState, capMode: "d2" | "today" = "d2"): ResolvedRange {
  const cap = capMode === "today" ? TODAY_ISO : D_MINUS_2
  const capMsg = capMode === "today" ? "Thời gian từ ngày không được lớn hơn đến ngày và đến ngày không được vượt quá ngày hiện tại. Vui lòng kiểm tra lại." : "Ngày kết thúc không được vượt quá ngày hiện tại - 2 (D-2). Vui lòng kiểm tra lại."
  const capTo = (to: string, year: number) => (year === CURRENT_YEAR && to > cap ? cap : to)
  if (t.year === "custom") {
    if (!t.tuNgay || !t.denNgay) return { from: t.tuNgay, to: t.denNgay, label: "Chưa chọn đủ khoảng thời gian", error: "" }
    if (t.tuNgay > t.denNgay) return { from: t.tuNgay, to: t.denNgay, label: "", error: "Thời gian từ ngày không được lớn hơn đến ngày. Vui lòng kiểm tra lại." }
    if (t.denNgay > cap) return { from: t.tuNgay, to: t.denNgay, label: "", error: capMsg }
    return { from: t.tuNgay, to: t.denNgay, label: `Từ ${fmtVN(t.tuNgay)} đến ${fmtVN(t.denNgay)}` }
  }
  const y = t.year
  let from = `${y}-01-01`, to = `${y}-12-31`
  if (t.kind === "theo-quy") { const qm = (t.quarter - 1) * 3 + 1; from = `${y}-${pad(qm)}-01`; to = `${y}-${pad(qm + 2)}-${pad(lastDay(y, qm + 2))}` }
  else if (t.kind === "theo-thang") { from = `${y}-${pad(t.month)}-01`; to = `${y}-${pad(t.month)}-${pad(lastDay(y, t.month))}` }
  to = capTo(to, y)
  return { from, to, label: `Từ ${fmtVN(from)} đến ${fmtVN(to)}` }
}
export const inRange = (iso: string, r: ResolvedRange) => (!r.from || iso >= r.from) && (!r.to || iso <= r.to)

/* ============================ XUẤT BÁO CÁO (BR-A6-04) ============================ */
export type ToastKind = "success" | "info" | "error"
export function exportResult(count: number): { msg: string; kind: ToastKind } {
  if (count === 0) return { msg: "Không tìm thấy bản ghi dữ liệu báo cáo phù hợp với điều kiện tìm kiếm.", kind: "error" }
  if (count > 50000) return { msg: "Số lượng bản ghi xuất báo cáo vượt quá 50.000 bản ghi. Vui lòng thu hẹp điều kiện lọc.", kind: "error" }
  if (count > 5000) return { msg: "Hệ thống đang tổng hợp dữ liệu báo cáo, vui lòng đợi…", kind: "info" }
  return { msg: "Xuất báo cáo dữ liệu Excel thành công.", kind: "success" }
}

/* ============================ DỮ LIỆU MẪU — GIAO DỊCH (SCR-A.6.1.1-01, A.6.2.1-01) ============================ */
export interface GDTxn {
  soCC: string; tenGD: string; ngayCC: string; ngayCCISO: string
  toChuc: string; ccv: string; phuongThuc: string; nguon: string; soLanYCCS: number; tinh: string; loaiTS: string
}
const g = (soCC: string, tenGD: string, iso: string, toChuc: string, ccv: string, pt: string, nguon: string, yccs: number, tinh: string, ts: string): GDTxn =>
  ({ soCC, tenGD, ngayCC: fmtVN(iso), ngayCCISO: iso, toChuc, ccv, phuongThuc: pt, nguon, soLanYCCS: yccs, tinh, loaiTS: ts })
export const GD_TXNS: GDTxn[] = [
  g("1234/2026/TP", "Hợp đồng chuyển nhượng QSDĐ", "2026-01-15", "VPCC Nguyễn Văn A", "Nguyễn Văn A", "Công chứng giấy", "Hệ thống CSDL Công chứng", 2, "Hà Nội", "Nhà ở/Đất ở"),
  g("5678/2026/TP", "Hợp đồng thế chấp tài sản", "2026-01-20", "VPCC Trần Văn B", "Lê Thị C", "CCĐT trực tiếp", "Nền tảng CCĐT", 0, "TP. Hồ Chí Minh", "Sổ tiết kiệm"),
  g("1290/2026/TP", "Hợp đồng mua bán ô tô", "2026-02-10", "VPCC Nguyễn Văn A", "Nguyễn Văn A", "Công chứng giấy", "Hệ thống CSDL Công chứng", 1, "Hà Nội", "Ô tô/Xe máy"),
  g("2011/2026/TP", "Hợp đồng tặng cho QSDĐ", "2026-02-25", "Phòng Công chứng số 1", "Phạm Văn D", "CCĐT trực tuyến", "Phần mềm chuyển đổi DLCC", 3, "Hà Nội", "Nhà ở/Đất ở"),
  g("3050/2026/TP", "Hợp đồng ủy quyền", "2026-03-05", "VPCC Bến Thành", "Trần Thị E", "CCĐT trực tiếp", "Nền tảng CCĐT", 0, "TP. Hồ Chí Minh", "TS khác"),
  g("3311/2026/TP", "Hợp đồng chuyển nhượng QSDĐ", "2026-03-18", "VPCC Nguyễn Văn A", "Nguyễn Văn A", "Công chứng giấy", "Hệ thống CSDL Công chứng", 0, "Hà Nội", "Đất nông nghiệp"),
  g("4102/2026/TP", "Hợp đồng thế chấp căn hộ", "2026-04-08", "VPCC Sông Hàn", "Đỗ Văn F", "CCĐT trực tiếp", "Nền tảng CCĐT", 1, "Đà Nẵng", "Nhà ở/Đất ở"),
  g("4550/2026/TP", "Hợp đồng mua bán tàu cá", "2026-04-22", "VPCC Bến Thành", "Trần Thị E", "Công chứng giấy", "Hệ thống CSDL Công chứng", 0, "TP. Hồ Chí Minh", "Tàu thuyền"),
  g("5120/2026/TP", "Hợp đồng chuyển nhượng cổ phần", "2026-05-12", "Phòng Công chứng số 1", "Phạm Văn D", "CCĐT trực tuyến", "Phần mềm chuyển đổi DLCC", 2, "Hà Nội", "Cổ phần/Cổ phiếu"),
  g("5680/2026/TP", "Hợp đồng chuyển nhượng QSDĐ", "2026-05-28", "VPCC Nguyễn Văn A", "Nguyễn Văn A", "Công chứng giấy", "Hệ thống CSDL Công chứng", 0, "Hà Nội", "Nhà ở/Đất ở"),
  g("6210/2026/TP", "Hợp đồng thế chấp QSDĐ", "2026-06-16", "VPCC Sông Hàn", "Đỗ Văn F", "CCĐT trực tiếp", "Nền tảng CCĐT", 0, "Đà Nẵng", "Đất nông nghiệp"),
  g("7001/2026/TP", "Hợp đồng ủy quyền định đoạt", "2026-07-09", "VPCC Trần Văn B", "Lê Thị C", "CCĐT trực tuyến", "Phần mềm chuyển đổi DLCC", 1, "TP. Hồ Chí Minh", "TS khác"),
]

/* ============================ CẢNH BÁO BẤT THƯỜNG (SCR-A.6.1.1-02) ============================ */
export const ALERT_TYPES = ["Ngoài giờ hành chính", "Tần suất xem cao"]
export const ALERT_LEVELS = ["Cao", "Trung bình", "Thấp"]
export interface AlertViewLog { thoiGian: string; loaiHoSo: string; ip: string }
export interface AlertRow {
  ngayCanhBao: string; ngayCanhBaoISO: string; soCC: string; toChuc: string; nguoiXem: string; taiKhoan: string
  loaiCanhBao: string; mucDo: string; tinh: string; ccv: string
  chiTietBatThuong: string; donViNguoiXem: string; lichSu: AlertViewLog[]
}
const vlog = (tg: string, loai: string, ip: string): AlertViewLog => ({ thoiGian: tg, loaiHoSo: loai, ip })
export const ALERTS: AlertRow[] = [
  { ngayCanhBao: "15/01/2026", ngayCanhBaoISO: "2026-01-15", soCC: "1234/2026/TP", toChuc: "VPCC Nguyễn Văn A", nguoiXem: "Nguyễn Thị Lan", taiKhoan: "lannt", loaiCanhBao: "Tần suất xem cao", mucDo: "Cao", tinh: "Hà Nội", ccv: "Nguyễn Văn A", chiTietBatThuong: "Xem các hồ sơ quá 50 lần trong vòng 1 ngày", donViNguoiXem: "VPCC Nguyễn Văn A", lichSu: [vlog("15/01/2026 23:47:12", "Văn bản công chứng điện tử", "14.225.22.105"), vlog("15/01/2026 23:46:05", "Hồ sơ lưu trữ điện tử", "14.225.22.105")] },
  { ngayCanhBao: "12/03/2026", ngayCanhBaoISO: "2026-03-12", soCC: "3311/2026/TP", toChuc: "VPCC Nguyễn Văn A", nguoiXem: "Trần Văn Minh", taiKhoan: "minhtv", loaiCanhBao: "Ngoài giờ hành chính", mucDo: "Trung bình", tinh: "Hà Nội", ccv: "Nguyễn Văn A", chiTietBatThuong: "Truy cập hồ sơ từ 22h tối đến 5h sáng", donViNguoiXem: "Sở Tư pháp Hà Nội", lichSu: [vlog("12/03/2026 02:15:40", "Hồ sơ lưu trữ điện tử", "10.0.0.55")] },
  { ngayCanhBao: "22/04/2026", ngayCanhBaoISO: "2026-04-22", soCC: "4550/2026/TP", toChuc: "VPCC Bến Thành", nguoiXem: "Lê Thị Hồng", taiKhoan: "honglt", loaiCanhBao: "Ngoài giờ hành chính", mucDo: "Trung bình", tinh: "TP. Hồ Chí Minh", ccv: "Trần Thị E", chiTietBatThuong: "Truy cập hồ sơ từ 22h tối đến 5h sáng", donViNguoiXem: "VPCC Bến Thành", lichSu: [vlog("22/04/2026 23:05:11", "Văn bản công chứng điện tử", "42.112.8.9")] },
  { ngayCanhBao: "16/06/2026", ngayCanhBaoISO: "2026-06-16", soCC: "6210/2026/TP", toChuc: "VPCC Sông Hàn", nguoiXem: "Phạm Quốc Huy", taiKhoan: "huypq", loaiCanhBao: "Tần suất xem cao", mucDo: "Cao", tinh: "Đà Nẵng", ccv: "Đỗ Văn F", chiTietBatThuong: "Xem các hồ sơ quá 50 lần trong vòng 1 ngày", donViNguoiXem: "VPCC Sông Hàn", lichSu: [vlog("16/06/2026 14:22:30", "Hồ sơ lưu trữ điện tử", "113.161.4.20"), vlog("16/06/2026 14:20:02", "Văn bản công chứng điện tử", "113.161.4.20")] },
]
export const ALERT_LEGEND = [
  { loai: "Ngoài giờ hành chính", chiTiet: "Từ 22h tối đến 5h sáng", mucDo: "Trung bình" },
  { loai: "Tần suất xem cao", chiTiet: "Xem các hồ sơ quá 50 lần trong vòng 1 ngày", mucDo: "Cao" },
]

/* ============================ SAI LỆCH: ĐỐI SOÁT / HẬU KIỂM (SCR-A.6.1.1-03/04) ============================ */
export interface DoiSoatRow { soCC: string; ngayCC: string; ngayCCISO: string; toChuc: string; nguon: string; ketQua: string; chiTiet: string; tinh: string; ccv: string }
const ds = (soCC: string, iso: string, toChuc: string, nguon: string, kq: string, ct: string, tinh: string, ccv: string): DoiSoatRow =>
  ({ soCC, ngayCC: fmtVN(iso), ngayCCISO: iso, toChuc, nguon, ketQua: kq, chiTiet: ct, tinh, ccv })
export const DOISOAT_ROWS: DoiSoatRow[] = [
  ds("1234/2026/TP", "2026-01-15", "VPCC Nguyễn Văn A", "Hệ thống đất đai", "Sai lệch", "Diện tích thửa đất không khớp", "Hà Nội", "Nguyễn Văn A"),
  ds("5678/2026/TP", "2026-01-20", "VPCC Trần Văn B", "Hệ thống ngân hàng", "Khớp", "—", "TP. Hồ Chí Minh", "Lê Thị C"),
  ds("2011/2026/TP", "2026-02-25", "Phòng Công chứng số 1", "Hệ thống đất đai", "Sai lệch", "Thông tin chủ sở hữu chưa cập nhật", "Hà Nội", "Phạm Văn D"),
  ds("4102/2026/TP", "2026-04-08", "VPCC Sông Hàn", "Hệ thống cư trú", "Khớp", "—", "Đà Nẵng", "Đỗ Văn F"),
  ds("5120/2026/TP", "2026-05-12", "Phòng Công chứng số 1", "Hệ thống đăng ký DN", "Sai lệch", "Vốn điều lệ không khớp", "Hà Nội", "Phạm Văn D"),
  ds("7001/2026/TP", "2026-07-09", "VPCC Trần Văn B", "Hệ thống cư trú", "Khớp", "—", "TP. Hồ Chí Minh", "Lê Thị C"),
]
export interface HauKiemRow { soCC: string; ngayCC: string; ngayCCISO: string; toChuc: string; nhomTieuChi: string; ketQua: string; tinh: string; ccv: string }
const hk = (soCC: string, iso: string, toChuc: string, nhom: string, kq: string, tinh: string, ccv: string): HauKiemRow =>
  ({ soCC, ngayCC: fmtVN(iso), ngayCCISO: iso, toChuc, nhomTieuChi: nhom, ketQua: kq, tinh, ccv })
export const HAUKIEM_ROWS: HauKiemRow[] = [
  hk("1290/2026/TP", "2026-02-10", "VPCC Nguyễn Văn A", "Tính hợp lệ của chữ ký số", "Vi phạm", "Hà Nội", "Nguyễn Văn A"),
  hk("3050/2026/TP", "2026-03-05", "VPCC Bến Thành", "Tính đầy đủ hồ sơ & VBCCĐT", "Đạt", "TP. Hồ Chí Minh", "Trần Thị E"),
  hk("3311/2026/TP", "2026-03-18", "VPCC Nguyễn Văn A", "Đối soát thông tin tài sản", "Vi phạm", "Hà Nội", "Nguyễn Văn A"),
  hk("4550/2026/TP", "2026-04-22", "VPCC Bến Thành", "Điều kiện hành nghề CCV", "Đạt", "TP. Hồ Chí Minh", "Trần Thị E"),
  hk("6210/2026/TP", "2026-06-16", "VPCC Sông Hàn", "Rủi ro, trùng lặp, đối soát", "Vi phạm", "Đà Nẵng", "Đỗ Văn F"),
]

/* ============================ BIẾN ĐỘNG PHÁP LÝ (SCR-A.6.2.1-02/03/04) ============================ */
export interface VoHieuRow { soCC: string; tenGD: string; ngayCC: string; ngayCCISO: string; ngayVoHieu: string; toChuc: string; ccv: string; tinh: string }
const vh = (soCC: string, tenGD: string, iso: string, ngayVH: string, toChuc: string, ccv: string, tinh: string): VoHieuRow =>
  ({ soCC, tenGD, ngayCC: fmtVN(iso), ngayCCISO: iso, ngayVoHieu: ngayVH, toChuc, ccv, tinh })
export const VOHIEU_ROWS: VoHieuRow[] = [
  vh("1234/2026/TP", "Hợp đồng chuyển nhượng QSDĐ", "2026-01-15", "20/03/2026", "VPCC Nguyễn Văn A", "Nguyễn Văn A", "Hà Nội"),
  vh("3050/2026/TP", "Hợp đồng ủy quyền", "2026-03-05", "18/05/2026", "VPCC Bến Thành", "Trần Thị E", "TP. Hồ Chí Minh"),
  vh("4102/2026/TP", "Hợp đồng thế chấp căn hộ", "2026-04-08", "30/06/2026", "VPCC Sông Hàn", "Đỗ Văn F", "Đà Nẵng"),
]
export const BIHUY_ROWS: (VoHieuRow & { ngayBiHuy: string })[] = [
  { ...vh("5678/2026/TP", "Hợp đồng thế chấp tài sản", "2026-01-20", "", "VPCC Trần Văn B", "Lê Thị C", "TP. Hồ Chí Minh"), ngayBiHuy: "12/04/2026" },
  { ...vh("3311/2026/TP", "Hợp đồng chuyển nhượng QSDĐ", "2026-03-18", "", "VPCC Nguyễn Văn A", "Nguyễn Văn A", "Hà Nội"), ngayBiHuy: "05/05/2026" },
  { ...vh("5120/2026/TP", "Hợp đồng chuyển nhượng cổ phần", "2026-05-12", "", "Phòng Công chứng số 1", "Phạm Văn D", "Hà Nội"), ngayBiHuy: "20/06/2026" },
]
export interface ChuyenQuyenRow { loaiChuyen: string; toChucChuyen: string; toChucNhan: string; tinh: string; ngayChuyen: string; ngayChuyenISO: string; soLuong: number; toChuc: string; ccv: string }
const cq = (loai: string, tcC: string, tcN: string, tinh: string, iso: string, sl: number): ChuyenQuyenRow =>
  ({ loaiChuyen: loai, toChucChuyen: tcC, toChucNhan: tcN, tinh, ngayChuyen: fmtVN(iso), ngayChuyenISO: iso, soLuong: sl, toChuc: tcC, ccv: "" })
export const CHUYENQUYEN_ROWS: ChuyenQuyenRow[] = [
  cq("Chỉ định STP", "VPCC Nguyễn Văn A", "Phòng Công chứng số 1", "Hà Nội", "2026-02-01", 120),
  cq("Thỏa thuận theo TCHNCC", "VPCC Trần Văn B", "VPCC Bến Thành", "TP. Hồ Chí Minh", "2026-03-15", 85),
  cq("Chỉ định STP", "VPCC Sông Hàn", "VPCC Nguyễn Văn A", "Đà Nẵng", "2026-05-20", 60),
  cq("Thỏa thuận theo TCHNCC", "Phòng Công chứng số 1", "VPCC Trần Văn B", "Hà Nội", "2026-06-10", 45),
]

/* ============================ TÍNH TOÁN THỐNG KÊ ============================ */
export function distribution<T>(rows: T[], key: (r: T) => string, keys: string[]) {
  const total = rows.length
  return keys.map((k) => { const n = rows.filter((r) => key(r) === k).length; return { label: k, value: n, pct: total ? Math.round((n / total) * 1000) / 10 : 0 } })
}
export function topTchncc(rows: GDTxn[], n = 10) {
  const map = new Map<string, number>()
  rows.forEach((r) => map.set(r.toChuc, (map.get(r.toChuc) ?? 0) + 1))
  return [...map.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, n)
}
