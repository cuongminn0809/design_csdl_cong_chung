import type { Method } from "../config"

/* ============================ Kiểu dữ liệu ============================ */

export type UpdateAction = "Thêm mới" | "Cập nhật" | "Xóa" | "Khôi phục"
export type OpAction = "Xem thông tin" | "Mở tài liệu" | "Ký số văn bản"
export type ExchangeAction = "Tiếp nhận" | "Chia sẻ dữ liệu"
export type SyncStatus = "Thành công" | "Thất bại"
export type RevokeAction = "Lập yêu cầu" | "Trình duyệt" | "Yêu cầu sửa" | "Phê duyệt hủy" | "Hủy yêu cầu"

export interface FieldChange { field: string; old: string; new: string }

/** Tab 1 — Lịch sử cập nhật thông tin. */
export interface UpdateLog {
  id: string
  method: Method
  time: string // dd/mm/yyyy hh:mm:ss
  soCC: string
  org: string
  action: UpdateAction
  actor: string
  content: string
  ip: string
  changes: FieldChange[]
}

/** Tab 2 — Lịch sử thao tác. */
export interface OpLog {
  id: string
  method: Method
  time: string
  soCC: string
  action: OpAction
  actor: string
  content: string
  ip: string
}

/** Tab 3 — Lịch sử trao đổi (đồng bộ). */
export interface ExchangeLog {
  id: string
  method: Method
  time: string
  soCC: string
  sys: string
  action: ExchangeAction
  status: SyncStatus
  payload: string // JSON string
}

/** Thùng rác — giao dịch đã xóa tạm thời. */
export interface TrashItem {
  id: string
  method: Method
  soCC: string
  ngayCC: string
  asset: string
  deleter: string
  deletedDate: string // dd/mm/yyyy
}

/** Lịch sử xử lý tuyên hủy. */
export interface RevokeHistoryLog {
  id: string
  time: string
  soCCGoc: string
  soQD: string
  actor: string
  action: RevokeAction
  content: string
  ip: string
}

/* ============================ Metadata hiển thị ============================ */

export const UPDATE_ACTION_META: Record<UpdateAction, { bg: string; fg: string; bd: string }> = {
  "Thêm mới": { bg: "#f0fdf4", fg: "#15803d", bd: "#bbf7d0" },
  "Cập nhật": { bg: "#eff6ff", fg: "#1d4ed8", bd: "#bfdbfe" },
  "Xóa": { bg: "#fef2f2", fg: "#b91c1c", bd: "#fecaca" },
  "Khôi phục": { bg: "#faf5ff", fg: "#9333ea", bd: "#e9d5ff" },
}

export const SYNC_STATUS_META: Record<SyncStatus, { bg: string; fg: string; bd: string }> = {
  "Thành công": { bg: "#f0fdf4", fg: "#15803d", bd: "#bbf7d0" },
  "Thất bại": { bg: "#fef2f2", fg: "#b91c1c", bd: "#fecaca" },
}

export const REVOKE_ACTION_META: Record<RevokeAction, { bg: string; fg: string; bd: string }> = {
  "Lập yêu cầu": { bg: "#f5f5f5", fg: "#525252", bd: "#e5e5e5" },
  "Trình duyệt": { bg: "#eff6ff", fg: "#1d4ed8", bd: "#bfdbfe" },
  "Yêu cầu sửa": { bg: "#fffbeb", fg: "#b45309", bd: "#fde68a" },
  "Phê duyệt hủy": { bg: "#f0fdf4", fg: "#15803d", bd: "#bbf7d0" },
  "Hủy yêu cầu": { bg: "#fef2f2", fg: "#b91c1c", bd: "#fecaca" },
}

/** Tùy chọn dropdown "Thao tác" trong bộ lọc — điện tử có thêm Ký số / Mở file. */
export const OP_FILTER_OPTIONS = (method: Method): string[] =>
  method === "electronic"
    ? ["Tất cả", "Thêm mới", "Cập nhật", "Xóa", "Khôi phục", "Xem chi tiết", "Mở file", "Ký số"]
    : ["Tất cả", "Thêm mới", "Cập nhật", "Xóa", "Khôi phục", "Xem chi tiết", "Tải file"]

/* ============================ Dữ liệu mẫu ============================ */

export const UPDATE_LOGS: UpdateLog[] = [
  {
    id: "UL-01", method: "paper", time: "05/08/2026 10:30:22", soCC: "102/2026", org: "VPCC Rạch Giá",
    action: "Cập nhật", actor: "ccv_diendm", content: "Cập nhật thông tin bên nhận thế chấp (Sửa MST)", ip: "192.168.1.15",
    changes: [
      { field: "MST bên nhận thế chấp", old: "0300123456", new: "0300123457" },
      { field: "Giá trị giao dịch", old: "1.500.000.000 VND", new: "2.000.000.000 VND" },
    ],
  },
  {
    id: "UL-02", method: "paper", time: "04/08/2026 09:12:00", soCC: "101/2026", org: "VPCC Rạch Giá",
    action: "Thêm mới", actor: "ccv_nguyena", content: "Khởi tạo mới văn bản ủy quyền", ip: "192.168.1.16",
    changes: [
      { field: "Số công chứng", old: "", new: "101/2026" },
      { field: "Loại giao dịch", old: "", new: "Văn bản ủy quyền" },
    ],
  },
  {
    id: "UL-03", method: "paper", time: "02/08/2026 15:40:10", soCC: "97/2026", org: "VPCC Kiên Giang",
    action: "Khôi phục", actor: "truong_kg", content: "Khôi phục giao dịch từ thùng rác", ip: "192.168.1.30",
    changes: [{ field: "Trạng thái hồ sơ", old: "Đã xóa tạm thời", new: "Đã duyệt" }],
  },
  {
    id: "UL-04", method: "electronic", time: "05/08/2026 11:15:40", soCC: "105/2026", org: "VPCC Rạch Giá",
    action: "Cập nhật", actor: "ccv_nguyenb", content: "Cập nhật thông tin bên nhận chuyển nhượng (Sửa CCCD)", ip: "192.168.1.20",
    changes: [
      { field: "CCCD bên nhận chuyển nhượng", old: "001192002345", new: "001192002346" },
      { field: "Địa chỉ bên nhận", old: "TP. Rạch Giá", new: "TP. Hà Tiên" },
    ],
  },
  {
    id: "UL-05", method: "electronic", time: "04/08/2026 14:02:19", soCC: "104/2026", org: "VPCC Rạch Giá",
    action: "Cập nhật", actor: "ccv_nguyenb", content: "Ký số văn bản công chứng điện tử", ip: "192.168.1.20",
    changes: [
      { field: "Trạng thái ký số văn bản", old: "Chưa ký", new: "Đã ký số thành công" },
      { field: "Mã chứng thư số", old: "-", new: "CA-9981-GST-VN" },
      { field: "Kết quả xác thực chữ ký", old: "-", new: "Hợp lệ (Thời gian ký: 04/08/2026 14:02)" },
    ],
  },
  {
    id: "UL-06", method: "electronic", time: "01/08/2026 16:22:00", soCC: "96/2026", org: "VPCC Kiên Giang",
    action: "Xóa", actor: "ccv_nguyenb", content: "Xóa tạm thời giao dịch thế chấp căn hộ", ip: "192.168.1.21",
    changes: [{ field: "Trạng thái hồ sơ", old: "Đã duyệt", new: "Đã xóa tạm thời" }],
  },
]

export const OP_LOGS: OpLog[] = [
  { id: "OP-01", method: "paper", time: "05/08/2026 10:32:15", soCC: "102/2026", action: "Mở tài liệu", actor: "ccv_diendm", content: "Mở văn bản scan HopDongTheChap.pdf", ip: "192.168.1.15" },
  { id: "OP-02", method: "paper", time: "05/08/2026 10:31:02", soCC: "102/2026", action: "Xem thông tin", actor: "ccv_diendm", content: "Xem chi tiết giao dịch công chứng giấy", ip: "192.168.1.15" },
  { id: "OP-03", method: "paper", time: "03/08/2026 08:05:44", soCC: "99/2026", action: "Xem thông tin", actor: "truong_rg", content: "Xem chi tiết hồ sơ trước khi duyệt", ip: "192.168.1.11" },
  { id: "OP-04", method: "electronic", time: "05/08/2026 11:18:22", soCC: "105/2026", action: "Mở tài liệu", actor: "ccv_nguyenb", content: "Mở file đính kèm VanBanCongChungDT.pdf", ip: "192.168.1.20" },
  { id: "OP-05", method: "electronic", time: "04/08/2026 14:02:05", soCC: "104/2026", action: "Ký số văn bản", actor: "ccv_nguyenb", content: "Ký số thành công — Xác thực chữ ký số hợp lệ", ip: "192.168.1.20" },
  { id: "OP-06", method: "electronic", time: "01/08/2026 09:10:00", soCC: "96/2026", action: "Xem thông tin", actor: "truong_kg", content: "Xem văn bản công chứng điện tử", ip: "192.168.1.31" },
]

const PAYLOAD_PAPER = JSON.stringify({
  transaction_code: "102/2026",
  organization: "Văn phòng công chứng Rạch Giá",
  action: "SyncPaper",
  status: "Success",
  details: { transfer_method: "API Gateway", ack: "RECEIVED" },
}, null, 2)

const PAYLOAD_DT = JSON.stringify({
  transaction_code: "105/2026",
  organization: "Văn phòng công chứng Rạch Giá",
  action: "Sync",
  status: "Success",
  details: { signature_valid: true, verified_by: "CA-9981-GST-VN" },
}, null, 2)

export const EXCHANGE_LOGS: ExchangeLog[] = [
  { id: "EX-01", method: "paper", time: "05/08/2026 10:35:10", soCC: "102/2026", sys: "Hệ thống Một cửa", action: "Chia sẻ dữ liệu", status: "Thành công", payload: PAYLOAD_PAPER },
  { id: "EX-02", method: "paper", time: "04/08/2026 09:20:00", soCC: "101/2026", sys: "Hệ thống Sở Tư pháp", action: "Chia sẻ dữ liệu", status: "Thành công", payload: PAYLOAD_PAPER.replace("102/2026", "101/2026") },
  { id: "EX-03", method: "paper", time: "02/08/2026 17:01:33", soCC: "97/2026", sys: "Hệ thống Một cửa", action: "Tiếp nhận", status: "Thất bại", payload: PAYLOAD_PAPER.replace("102/2026", "97/2026").replace("\"Success\"", "\"Failed\"") },
  { id: "EX-04", method: "electronic", time: "05/08/2026 11:20:05", soCC: "105/2026", sys: "Hệ thống Sở Tư pháp", action: "Chia sẻ dữ liệu", status: "Thành công", payload: PAYLOAD_DT },
  { id: "EX-05", method: "electronic", time: "04/08/2026 14:05:12", soCC: "104/2026", sys: "Hệ thống Bộ Tư pháp", action: "Chia sẻ dữ liệu", status: "Thành công", payload: PAYLOAD_DT.replace("105/2026", "104/2026") },
  { id: "EX-06", method: "electronic", time: "01/08/2026 16:30:44", soCC: "96/2026", sys: "Hệ thống Sở Tư pháp", action: "Tiếp nhận", status: "Thất bại", payload: PAYLOAD_DT.replace("105/2026", "96/2026").replace("true", "false") },
]

export const TRASH_ITEMS: TrashItem[] = [
  { id: "TR-01", method: "paper", soCC: "456/2026", ngayCC: "10/04/2026", asset: "Căn hộ chung cư B", deleter: "ccv_linhpt", deletedDate: "01/08/2026" },
  { id: "TR-02", method: "paper", soCC: "440/2026", ngayCC: "02/03/2026", asset: "Thửa đất số 12, TP. Rạch Giá", deleter: "ccv_diendm", deletedDate: "15/07/2026" },
  { id: "TR-03", method: "paper", soCC: "398/2026", ngayCC: "18/02/2026", asset: "Ô tô Toyota Vios 68A-123.45", deleter: "truong_rg", deletedDate: "08/07/2026" },
  { id: "TR-04", method: "electronic", soCC: "789/2026", ngayCC: "12/05/2026", asset: "Căn hộ chung cư C", deleter: "ccv_linhpt", deletedDate: "05/08/2026" },
  { id: "TR-05", method: "electronic", soCC: "765/2026", ngayCC: "20/04/2026", asset: "Thửa đất số 40, TP. Rạch Giá", deleter: "ccv_nguyenb", deletedDate: "20/07/2026" },
  { id: "TR-06", method: "electronic", soCC: "742/2026", ngayCC: "05/03/2026", asset: "Nhà số 12 Nguyễn Trung Trực", deleter: "truong_kg", deletedDate: "07/07/2026" },
]

export const REVOKE_HISTORY: RevokeHistoryLog[] = [
  { id: "RH-01", time: "05/08/2026 09:20:10", soCCGoc: "99/2026", soQD: "99/2026/VBH", actor: "truong_rg", action: "Phê duyệt hủy", content: "Đã phê duyệt tuyên hủy, giao dịch gốc chuyển sang trạng thái Đã hủy.", ip: "192.168.1.11" },
  { id: "RH-02", time: "04/08/2026 15:40:00", soCCGoc: "96/2026", soQD: "96/2026/VBH", actor: "truong_kg", action: "Phê duyệt hủy", content: "Phê duyệt tuyên hủy hợp đồng thế chấp căn hộ.", ip: "192.168.1.31" },
  { id: "RH-03", time: "03/08/2026 11:05:33", soCCGoc: "105/2026", soQD: "105/2026/VBH", actor: "ccv_nguyenb", action: "Trình duyệt", content: "Trình Trưởng TCHNCC phê duyệt yêu cầu tuyên hủy.", ip: "192.168.1.20" },
  { id: "RH-04", time: "02/08/2026 08:30:00", soCCGoc: "102/2026", soQD: "102/2026/VBH", actor: "truong_rg", action: "Yêu cầu sửa", content: "Thiếu file đính kèm văn bản hủy, đề nghị bổ sung bản scan.", ip: "192.168.1.11" },
  { id: "RH-05", time: "01/08/2026 16:12:45", soCCGoc: "101/2026", soQD: "101/2026/VBH", actor: "ccv_nguyena", action: "Lập yêu cầu", content: "Lập mới yêu cầu tuyên hủy văn bản ủy quyền.", ip: "192.168.1.16" },
  { id: "RH-06", time: "31/07/2026 10:00:00", soCCGoc: "104/2026", soQD: "104/2026/VBH", actor: "ccv_nguyenb", action: "Phê duyệt hủy", content: "Phê duyệt tuyên hủy hợp đồng tặng cho căn hộ.", ip: "192.168.1.20" },
]

/* ============================ Tiện ích ============================ */

/** Parse "dd/mm/yyyy" hoặc "dd/mm/yyyy hh:mm:ss" → timestamp phần ngày. */
export const parseVnDate = (s: string) => {
  const [d] = s.split(" ")
  const [dd, mm, yy] = d.split("/")
  return new Date(+yy, +mm - 1, +dd).getTime()
}

export const todayISO = () => new Date().toISOString().slice(0, 10)
export const daysAgoISO = (n: number) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10)

/** Số ngày còn lại trước khi xóa vĩnh viễn (30 ngày kể từ ngày xóa). */
export const daysRemaining = (deletedDate: string) => {
  const elapsed = Math.floor((Date.now() - parseVnDate(deletedDate)) / 86400000)
  return 30 - elapsed
}
