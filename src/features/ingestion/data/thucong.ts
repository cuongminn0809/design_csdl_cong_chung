import type { StatusMeta } from "../shared"

export interface Process {
  id: string
  t: number
  srcName: string
  srcType: "A" | "B"
  method: string
  status: string
  created: string
  started: string | null
  ended: string | null
  total: number
  written: number | null
  skipped: number | null
  sec: string
  service: string
  desc: string
  creator: string
  actor: string | null
  soCC?: string
  errCode?: string
  errMsg?: string
  cancelReason?: string
}

export const TYPES = [
  "Văn bản lựa chọn người giám hộ", "Văn bản tặng cho bất động sản", "Di chúc của người bị hạn chế thể chất",
  "Văn bản ủy quyền kháng cáo (dân sự)", "HĐ mua bán, thuê mua nhà ở (cá nhân)", "HĐ mua bán, tặng cho, thế chấp nhà ở",
  "Văn bản thừa kế nhà ở", "HĐ chuyển nhượng QSDĐ và tài sản gắn liền", "Văn bản thừa kế QSDĐ",
  "HĐ thuê đất xây dựng nhà ở", "HĐ thuê đất xây dựng công trình", "Thỏa thuận tài sản vợ chồng trước kết hôn",
  "Thỏa thuận mang thai hộ", "Sửa đổi thỏa thuận tài sản vợ chồng", "HĐ cho thuê doanh nghiệp tư nhân",
  "Ủy quyền kháng cáo (hành chính)", "Ủy quyền mua nhà ở cũ tài sản công", "HĐ chuyển nhượng HĐ kinh doanh BĐS",
  "Đưa QSDĐ vào doanh nghiệp", "Ủy quyền thi hành án khi xuất cảnh", "Ủy quyền thực hiện quyền khiếu nại",
  "HĐ chuyển nhượng Văn phòng Thừa phát lại", "Các giao dịch khác theo quy định",
]

export const LEGAL: Record<number, string> = {
  0: "Khoản 2 Điều 48, BLDS 2015",
  7: "Điều 167 Luật Đất đai 2013",
  6: "Điều 122 Luật Nhà ở 2014",
}

export const PROC_STATUS: Record<string, StatusMeta> = {
  ChoXuLy: { label: "Chờ xử lý", dot: "#8C8C8C", bg: "#f5f5f5", fg: "#525252", bd: "#e5e5e5" },
  DangXuLy: { label: "Đang xử lý", dot: "#1890FF", bg: "#eff6ff", fg: "#1d4ed8", bd: "#bfdbfe" },
  TamDung: { label: "Tạm dừng", dot: "#FA8C16", bg: "#fff7ed", fg: "#c2410c", bd: "#fed7aa" },
  HoanThanh: { label: "Hoàn thành", dot: "#52C41A", bg: "#f0fdf4", fg: "#15803d", bd: "#bbf7d0" },
  Loi: { label: "Lỗi", dot: "#F5222D", bg: "#fef2f2", fg: "#b91c1c", bd: "#fecaca" },
  LoiKetNoi: { label: "Lỗi kết nối", dot: "#A8071A", bg: "#fef2f2", fg: "#991b1b", bd: "#fecaca" },
  DaHuy: { label: "Đã hủy", dot: "#D9D9D9", bg: "#fafafa", fg: "#737373", bd: "#e5e5e5" },
}

export const SEC_STYLE: Record<string, { bg: string; fg: string; bd: string }> = {
  "Công khai": { bg: "#f5f5f5", fg: "#525252", bd: "#e5e5e5" },
  "Nội bộ": { bg: "#eff6ff", fg: "#1d4ed8", bd: "#bfdbfe" },
  "Bí mật": { bg: "#fff7ed", fg: "#c2410c", bd: "#fed7aa" },
  "Tối mật": { bg: "#fef2f2", fg: "#b91c1c", bd: "#fecaca" },
}

export const ERR_TYPE: Record<string, { bg: string; fg: string }> = {
  "Thiếu trường": { bg: "#fff7ed", fg: "#c2410c" },
  "Trùng lặp": { bg: "#eef2ff", fg: "#4f46e5" },
  "Sai định dạng": { bg: "#fef2f2", fg: "#b91c1c" },
}

export const FIELD_MAP = [
  { src: "id", type: "string", dst: "ma_gdcc" },
  { src: "full_name", type: "string", dst: "ten_chu_the" },
  { src: "cccd_number", type: "string", dst: "so_dinh_danh" },
  { src: "contract_date", type: "date", dst: "ngay_cong_chung" },
  { src: "notary_code", type: "string", dst: "ma_ccv" },
  { src: "so_cong_chung", type: "string", dst: "so_cong_chung" },
]

export const PROC_SEED: Process[] = [
  { id: "TT-20260518-001", t: 0, srcName: "Nền tảng công chứng", srcType: "A", method: "API", status: "ChoXuLy", created: "18/05/2026 08:30:00", started: null, ended: null, total: 1500, written: null, skipped: null, sec: "Bí mật", service: "Tích hợp GDCC - Sở TP Hà Nội", desc: "Thu thập GDCC từ Nền tảng công chứng", creator: "Nền tảng CC", actor: null },
  { id: "TT-20260517-009", t: 7, srcName: "PM chuyển đổi CSDL - Sở TP Hà Nội", srcType: "B", method: "File upload", status: "HoanThanh", created: "17/05/2026 14:05:11", started: "17/05/2026 14:20:00", ended: "17/05/2026 14:27:32", total: 890, written: 882, skipped: 8, sec: "Nội bộ", service: "Tích hợp GDCC - PM địa phương HN", desc: "Batch GDCC chuyển đổi từ hệ thống cũ", creator: "PM địa phương HN", actor: "admin@congchung.gov.vn", soCC: "123/2024" },
  { id: "TT-20260517-004", t: 4, srcName: "Nền tảng công chứng", srcType: "A", method: "API", status: "DangXuLy", created: "17/05/2026 09:15:00", started: "17/05/2026 09:16:00", ended: null, total: 3200, written: 1400, skipped: 0, sec: "Nội bộ", service: "Tích hợp GDCC - Nền tảng CC", desc: "Đồng bộ HĐ mua bán nhà ở", creator: "Nền tảng CC", actor: "admin@congchung.gov.vn" },
  { id: "TT-20260516-011", t: 5, srcName: "PM chuyển đổi CSDL - Sở TP Đà Nẵng", srcType: "B", method: "DB kết nối", status: "LoiKetNoi", created: "16/05/2026 22:41:00", started: "16/05/2026 22:42:00", ended: "16/05/2026 22:42:33", total: 1200, written: 0, skipped: 0, sec: "Bí mật", service: "Tích hợp GDCC - PM Đà Nẵng", desc: "Chuyển đổi HĐ nhà ở địa phương", creator: "PM địa phương ĐN", actor: "admin@congchung.gov.vn", errCode: "ERR_CONN_001", errMsg: "Connection timeout after 30s. Không thể kết nối tới endpoint nguồn." },
  { id: "TT-20260516-002", t: 1, srcName: "Nền tảng công chứng", srcType: "A", method: "API", status: "HoanThanh", created: "16/05/2026 08:02:00", started: "16/05/2026 08:05:00", ended: "16/05/2026 08:09:12", total: 500, written: 500, skipped: 0, sec: "Công khai", service: "Tích hợp GDCC - Nền tảng CC", desc: "Văn bản tặng cho BĐS", creator: "Nền tảng CC", actor: "admin@congchung.gov.vn" },
  { id: "TT-20260515-020", t: 8, srcName: "PM chuyển đổi CSDL - Sở TP Hải Phòng", srcType: "B", method: "File upload", status: "Loi", created: "15/05/2026 16:30:00", started: "15/05/2026 16:35:00", ended: "15/05/2026 16:40:44", total: 2000, written: 1200, skipped: 45, sec: "Bí mật", service: "Tích hợp GDCC - PM Hải Phòng", desc: "Văn bản thừa kế QSDĐ", creator: "PM địa phương HP", actor: "admin@congchung.gov.vn", errCode: "ERR_VALIDATION", errMsg: "Nhiều bản ghi sai định dạng theo Schema Registry. Xem tab Lỗi bản ghi." },
  { id: "TT-20260515-007", t: 2, srcName: "Nền tảng công chứng", srcType: "A", method: "API", status: "TamDung", created: "15/05/2026 10:12:00", started: "15/05/2026 10:14:00", ended: null, total: 750, written: 300, skipped: 0, sec: "Tối mật", service: "Tích hợp GDCC - Nền tảng CC", desc: "Di chúc đặc biệt", creator: "Nền tảng CC", actor: "admin@congchung.gov.vn" },
  { id: "TT-20260514-013", t: 22, srcName: "Nền tảng công chứng", srcType: "A", method: "API", status: "DaHuy", created: "14/05/2026 11:20:00", started: null, ended: "14/05/2026 11:35:00", total: 600, written: null, skipped: null, sec: "Nội bộ", service: "Tích hợp GDCC - Nền tảng CC", desc: "Các giao dịch khác", creator: "Nền tảng CC", actor: "admin@congchung.gov.vn", cancelReason: "Nguồn gửi sai loại giao dịch, cần gửi lại." },
  { id: "TT-20260514-005", t: 3, srcName: "PM chuyển đổi CSDL - Sở TP Cần Thơ", srcType: "B", method: "DB kết nối", status: "HoanThanh", created: "14/05/2026 07:44:00", started: "14/05/2026 07:50:00", ended: "14/05/2026 07:54:19", total: 430, written: 430, skipped: 0, sec: "Nội bộ", service: "Tích hợp GDCC - PM Cần Thơ", desc: "Ủy quyền kháng cáo dân sự", creator: "PM địa phương CT", actor: "admin@congchung.gov.vn" },
  { id: "TT-20260513-018", t: 6, srcName: "Nền tảng công chứng", srcType: "A", method: "API", status: "ChoXuLy", created: "13/05/2026 19:03:00", started: null, ended: null, total: 2100, written: null, skipped: null, sec: "Nội bộ", service: "Tích hợp GDCC - Nền tảng CC", desc: "HĐ thế chấp nhà ở", creator: "Nền tảng CC", actor: null },
]

export const fmtN = (n: number | null) => (n == null ? "–" : n.toLocaleString("vi"))
export const isErr = (s: string) => s === "Loi" || s === "LoiKetNoi"

export function genHistory(p: Process) {
  const h: { time: string; status: string; actor: string; action: string; detail: string }[] = []
  const rec = (t: string, s: string, actor: string, action: string, detail: string) => h.push({ time: t, status: s, actor, action, detail })
  rec(p.created, "ChoXuLy", p.creator, "Tạo tiến trình", `${fmtN(p.total)} bản ghi`)
  if (p.started) rec(p.started, "DangXuLy", p.actor ?? "admin@congchung.gov.vn", "Khởi tạo", "—")
  if (p.status === "LoiKetNoi" && p.ended) rec(p.ended, "LoiKetNoi", "Hệ thống", `Lỗi kết nối ${p.errCode ?? ""}`, "Rollback dữ liệu đã ghi")
  else if (p.status === "Loi" && p.ended) rec(p.ended, "Loi", "Hệ thống", "Dừng do lỗi validate", `${fmtN(p.written)} ghi / ${fmtN(p.skipped)} bỏ qua`)
  else if (p.status === "HoanThanh" && p.ended) rec(p.ended, "HoanThanh", "Hệ thống", "Hoàn thành", `${fmtN(p.written)} ghi / ${fmtN(p.skipped)} bỏ qua`)
  else if (p.status === "TamDung") rec(p.started ?? p.created, "TamDung", "Hệ thống", "Tạm dừng do bảo trì", "—")
  else if (p.status === "DaHuy" && p.ended) rec(p.ended, "DaHuy", p.actor ?? "admin@congchung.gov.vn", "Hủy tiến trình", p.cancelReason ?? "—")
  return h
}

export function genErrors(p: Process) {
  if (!p.skipped) return []
  const kinds: [string, string][] = [["Sai định dạng", "ngay_cong_chung"], ["Thiếu trường", "so_cong_chung"], ["Trùng lặp", "ma_gdcc"]]
  const descs: Record<string, string> = {
    "Sai định dạng": "Giá trị ngày không đúng định dạng ISO-8601.",
    "Thiếu trường": "Trường bắt buộc bị thiếu trong bản ghi nguồn.",
    "Trùng lặp": "Mã GDCC đã tồn tại trong kho, bỏ qua để tránh ghi trùng.",
  }
  const n = Math.min(p.skipped, 6)
  return Array.from({ length: n }, (_, i) => {
    const k = kinds[i % kinds.length]
    return { stt: i + 1, id: `REC-${String(i + 1).padStart(3, "0")}`, type: k[0], field: k[1], desc: descs[k[0]] }
  })
}
