import { fmtVN } from "./config"

/* ============================ DANH MỤC ============================ */
export const NC_SOURCES = ["Hệ thống CSDL Công chứng", "Phần mềm chuyển đổi dữ liệu công chứng", "Hệ thống khác"]
export const NC_STATUSES = ["Đang xử lý", "Chờ duyệt", "Đã đăng tải", "Từ chối"]
export const NC_STATUS_COLOR: Record<string, { badge: string; dot: string }> = {
  "Đang xử lý": { badge: "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]", dot: "#2563eb" },
  "Chờ duyệt": { badge: "border-[#fde68a] bg-[#fffbeb] text-[#b45309]", dot: "#f59e0b" },
  "Đã đăng tải": { badge: "border-[#a7f3d0] bg-[#ecfdf5] text-[#047857]", dot: "#10b981" },
  "Từ chối": { badge: "border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]", dot: "#ef4444" },
}

export type NCKind = "ngan-chan" | "giai-toa" | "cbrr" | "huy-cbrr"
export const NC_LABEL: Record<NCKind, { title: string; tab: string; infoCol: string; file: string; dateField: "banHanh" | "tao" }> = {
  "ngan-chan": { title: "Báo cáo thống kê thông tin ngăn chặn", tab: "Thông tin ngăn chặn", infoCol: "Thông tin ngăn chặn", file: "BaoCao_NganChan", dateField: "banHanh" },
  "giai-toa": { title: "Báo cáo thống kê thông tin giải tỏa ngăn chặn", tab: "Thông tin giải tỏa ngăn chặn", infoCol: "Thông tin giải tỏa", file: "BaoCao_GiaiToaNganChan", dateField: "banHanh" },
  "cbrr": { title: "Báo cáo thống kê thông tin cảnh báo rủi ro", tab: "Thông tin cảnh báo rủi ro", infoCol: "Thông tin cảnh báo rủi ro", file: "BaoCao_CanhBaoRuiRo", dateField: "tao" },
  "huy-cbrr": { title: "Báo cáo thống kê thông tin hủy cảnh báo rủi ro", tab: "Thông tin hủy cảnh báo rủi ro", infoCol: "Thông tin hủy CBRR", file: "BaoCao_HuyCanhBaoRuiRo", dateField: "tao" },
}

/* ============================ BẢN GHI VĂN BẢN ============================ */
export interface NCRecord {
  kind: NCKind; soVanBan: string; donViGui: string; thongTin: string
  ngayBanHanh: string; banHanhISO: string; ngayTao: string; taoISO: string
  nguon: string; trangThai: string; tinh: string; toChuc?: string; ccv?: string
}
const rec = (kind: NCKind, soVB: string, donVi: string, tt: string, banHanhISO: string, taoISO: string, nguon: string, trangThai: string, tinh: string): NCRecord =>
  ({ kind, soVanBan: soVB, donViGui: donVi, thongTin: tt, ngayBanHanh: fmtVN(banHanhISO), banHanhISO, ngayTao: fmtVN(taoISO), taoISO, nguon, trangThai, tinh })

export const NC_RECORDS: NCRecord[] = [
  // Ngăn chặn
  rec("ngan-chan", "123/QĐ-UBND", "Sở Tài nguyên và Môi trường Hà Nội", "Ngăn chặn giao dịch nhà đất số 45 phố Bà Triệu", "2026-01-15", "2026-01-15", "Hệ thống khác", "Chờ duyệt", "Hà Nội"),
  rec("ngan-chan", "456/CV-TAND", "Tòa án nhân dân TP. Hồ Chí Minh", "Ngăn chặn tài sản ô tô 30F-123.45", "2026-01-20", "2026-01-20", "Hệ thống CSDL Công chứng", "Từ chối", "TP. Hồ Chí Minh"),
  rec("ngan-chan", "789/QĐ-THA", "Cục Thi hành án dân sự Hà Nội", "Ngăn chặn chuyển nhượng thửa đất số 78", "2026-03-05", "2026-03-06", "Hệ thống CSDL Công chứng", "Đã đăng tải", "Hà Nội"),
  rec("ngan-chan", "201/CV-CA", "Công an TP. Đà Nẵng", "Ngăn chặn giao dịch căn hộ CT2-1204", "2026-04-12", "2026-04-12", "Phần mềm chuyển đổi dữ liệu công chứng", "Đang xử lý", "Đà Nẵng"),
  rec("ngan-chan", "334/QĐ-UBND", "Sở Tài nguyên và Môi trường Hà Nội", "Ngăn chặn giao dịch QSDĐ số 90", "2026-05-22", "2026-05-22", "Hệ thống CSDL Công chứng", "Đã đăng tải", "Hà Nội"),
  // Giải tỏa
  rec("giai-toa", "GT-045/QĐ-THA", "Cục Thi hành án dân sự Hà Nội", "Giải tỏa ngăn chặn thửa đất số 45", "2026-02-10", "2026-02-10", "Hệ thống CSDL Công chứng", "Đã đăng tải", "Hà Nội"),
  rec("giai-toa", "GT-102/CV-TAND", "Tòa án nhân dân TP. Hồ Chí Minh", "Giải tỏa ngăn chặn ô tô 30F-123.45", "2026-03-18", "2026-03-19", "Hệ thống khác", "Chờ duyệt", "TP. Hồ Chí Minh"),
  rec("giai-toa", "GT-210/QĐ-UBND", "Sở Tài nguyên và Môi trường Đà Nẵng", "Giải tỏa ngăn chặn căn hộ CT2-1204", "2026-05-06", "2026-05-06", "Phần mềm chuyển đổi dữ liệu công chứng", "Đang xử lý", "Đà Nẵng"),
  // Cảnh báo rủi ro
  rec("cbrr", "CB-011/CBRR", "VPCC Nguyễn Văn A", "Cảnh báo rủi ro tài sản thế chấp nhiều nơi", "2026-02-01", "2026-02-01", "Hệ thống CSDL Công chứng", "Đã đăng tải", "Hà Nội"),
  rec("cbrr", "CB-058/CBRR", "VPCC Bến Thành", "Cảnh báo rủi ro giao dịch trùng lặp", "2026-04-08", "2026-04-08", "Hệ thống khác", "Chờ duyệt", "TP. Hồ Chí Minh"),
  rec("cbrr", "CB-093/CBRR", "VPCC Sông Hàn", "Cảnh báo rủi ro chủ thể bị hạn chế giao dịch", "2026-06-16", "2026-06-16", "Phần mềm chuyển đổi dữ liệu công chứng", "Đang xử lý", "Đà Nẵng"),
  // Hủy CBRR
  rec("huy-cbrr", "HCB-011/HUY", "VPCC Nguyễn Văn A", "Hủy cảnh báo rủi ro tài sản thế chấp", "2026-03-01", "2026-03-01", "Hệ thống CSDL Công chứng", "Đã đăng tải", "Hà Nội"),
  rec("huy-cbrr", "HCB-058/HUY", "VPCC Bến Thành", "Hủy cảnh báo rủi ro giao dịch trùng lặp", "2026-05-10", "2026-05-10", "Hệ thống khác", "Từ chối", "TP. Hồ Chí Minh"),
]

/* ============================ NHẬT KÝ KHAI THÁC (A.6.2.2-01) ============================ */
export const KT_STATUSES = ["Thành công có dữ liệu", "Thành công không có dữ liệu", "Thất bại"]
export const KT_STATUS_COLOR: Record<string, string> = {
  "Thành công có dữ liệu": "border-[#a7f3d0] bg-[#ecfdf5] text-[#047857]",
  "Thành công không có dữ liệu": "border-[#fde68a] bg-[#fffbeb] text-[#b45309]",
  "Thất bại": "border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]",
}
export interface KhaiThacLog { thoiDiem: string; thoiDiemISO: string; donVi: string; taiKhoan: string; tinh: string; tuKhoa: string; trangThai: string; toChuc?: string; ccv?: string }
const kt = (thoiDiem: string, iso: string, donVi: string, tk: string, tinh: string, tuKhoa: string, tt: string): KhaiThacLog =>
  ({ thoiDiem, thoiDiemISO: iso, donVi, taiKhoan: tk, tinh, tuKhoa, trangThai: tt })
export const KHAI_THAC_LOGS: KhaiThacLog[] = [
  kt("15/01/2026 09:12:05", "2026-01-15", "Sở Tư pháp Hà Nội", "lannt", "Hà Nội", "CCCD: 001234567890", "Thành công có dữ liệu"),
  kt("20/02/2026 14:30:22", "2026-02-20", "VPCC Nguyễn Văn A", "anv", "Hà Nội", "Số văn bản: 123/QĐ-UBND", "Thành công có dữ liệu"),
  kt("05/03/2026 08:45:10", "2026-03-05", "Sở Tư pháp TP.HCM", "minhtv", "TP. Hồ Chí Minh", "Tên: Nguyễn Văn B", "Thành công không có dữ liệu"),
  kt("18/04/2026 16:05:40", "2026-04-18", "VPCC Bến Thành", "honglt", "TP. Hồ Chí Minh", "MST: 0101234567", "Thất bại"),
  kt("22/05/2026 10:20:33", "2026-05-22", "Sở Tư pháp Đà Nẵng", "huypq", "Đà Nẵng", "Số văn bản: CB-058/CBRR", "Thành công có dữ liệu"),
  kt("16/06/2026 11:50:18", "2026-06-16", "VPCC Sông Hàn", "fdv", "Đà Nẵng", "CCCD: 004567890123", "Thành công không có dữ liệu"),
]
