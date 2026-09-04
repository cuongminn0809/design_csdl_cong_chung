import { useSyncExternalStore } from "react"

/* ============================ VAI TRÒ (demo) ============================ */
export type UtilRole = "admin" | "ld_btp" | "cv_btp" | "ld_cuc_bttp" | "ld_stp" | "cv_stp" | "ld_tchncc" | "ccv" | "khac"

export const UTIL_ROLES: { key: UtilRole; label: string }[] = [
  { key: "admin", label: "Quản trị hệ thống" },
  { key: "ld_btp", label: "Lãnh đạo Bộ Tư pháp" },
  { key: "cv_btp", label: "Chuyên viên BTP" },
  { key: "ld_cuc_bttp", label: "Lãnh đạo BTP" },
  { key: "ld_stp", label: "Lãnh đạo phòng chuyên môn STP" },
  { key: "cv_stp", label: "Chuyên viên Sở Tư pháp" },
  { key: "ld_tchncc", label: "Lãnh đạo TCHNCC" },
  { key: "ccv", label: "Công chứng viên" },
  { key: "khac", label: "Vai trò khác (không có quyền)" },
]
export const roleLabel = (r: UtilRole) => UTIL_ROLES.find((x) => x.key === r)?.label ?? r

/* ============================ MA TRẬN HIỂN THỊ THẺ TIỆN ÍCH (§6.1) ============================ */
export type UtilCard = "profile" | "instructions" | "faq" | "activities" | "history" | "sessions" | "sessionConfig" | "quickSearch"

const FULL_EXCEPT_CONFIG: UtilCard[] = ["profile", "instructions", "faq", "activities", "history", "sessions", "quickSearch"]

export const CARD_ACCESS: Record<UtilRole, UtilCard[]> = {
  admin: ["profile", "instructions", "faq", "activities", "history", "sessions", "sessionConfig", "quickSearch"],
  ld_btp: FULL_EXCEPT_CONFIG,
  cv_btp: FULL_EXCEPT_CONFIG,
  ld_cuc_bttp: ["profile", "instructions", "faq"],
  ld_stp: FULL_EXCEPT_CONFIG,
  cv_stp: FULL_EXCEPT_CONFIG,
  ld_tchncc: FULL_EXCEPT_CONFIG,
  ccv: ["profile", "activities", "history", "sessions", "quickSearch"],
  khac: [],
}
export const canOpenHub = (r: UtilRole) => r !== "khac"
export const hasCard = (r: UtilRole, c: UtilCard) => CARD_ACCESS[r].includes(c)

/* ============================ NGÀY DEMO CỐ ĐỊNH (khớp quy ước chung toàn app) ============================ */
export const TODAY_ISO = "2026-08-28"
export const NOW_ISO = "2026-08-28T09:00:00"
export const fmtVN = (iso: string) => { const [y, m, d] = iso.split("-"); return `${d}/${m}/${y}` }
export const fmtVNDateTime = (iso: string) => {
  const [d, t] = iso.split("T")
  return `${fmtVN(d)} ${t ?? ""}`.trim()
}
export function relativeTime(iso: string) {
  const diffMs = new Date(NOW_ISO).getTime() - new Date(iso).getTime()
  const min = Math.floor(diffMs / 60000)
  if (min < 1) return "Vừa xong"
  if (min < 60) return `${min} phút trước`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h} giờ trước`
  const d = Math.floor(h / 24)
  return `${d} ngày trước`
}

/* ============================ HỒ SƠ TÀI KHOẢN (§3.3 SCR-A.9.1-02) ============================ */
export interface AccountInfo {
  username: string; hoTen: string; donVi: string; chucVu: string
  sdt: string; email: string; diaChi: string; trangThai: "Hoạt động" | "Khóa"; vaiTro: string
}
export const CURRENT_USER: Record<UtilRole, AccountInfo> = {
  admin: { username: "quantrihethong", hoTen: "Đỗ Văn Quản", donVi: "Bộ Tư pháp", chucVu: "Quản trị hệ thống", sdt: "0900000000", email: "quantri@moj.gov.vn", diaChi: "Ba Đình, Hà Nội", trangThai: "Hoạt động", vaiTro: "Quản trị hệ thống" },
  ld_btp: { username: "ld.btp", hoTen: "Nguyễn Thị Bộ", donVi: "Bộ Tư pháp", chucVu: "Lãnh đạo Bộ", sdt: "0901111111", email: "ld.btp@moj.gov.vn", diaChi: "Ba Đình, Hà Nội", trangThai: "Hoạt động", vaiTro: "Lãnh đạo Bộ Tư pháp" },
  cv_btp: { username: "cv.btp", hoTen: "Trần Văn Chuyên", donVi: "Cục Bổ trợ tư pháp", chucVu: "Chuyên viên", sdt: "0902222222", email: "cv.btp@moj.gov.vn", diaChi: "Cầu Giấy, Hà Nội", trangThai: "Hoạt động", vaiTro: "Chuyên viên BTP" },
  ld_cuc_bttp: { username: "ld.cucbttp", hoTen: "Phạm Văn Cục", donVi: "Cục Bổ trợ tư pháp", chucVu: "Lãnh đạo Cục", sdt: "0903333333", email: "ld.cuc@moj.gov.vn", diaChi: "Đống Đa, Hà Nội", trangThai: "Hoạt động", vaiTro: "Lãnh đạo BTP" },
  ld_stp: { username: "ld.stp.hanoi", hoTen: "Vũ Thị Sở", donVi: "Sở Tư pháp Hà Nội", chucVu: "Lãnh đạo phòng Bổ trợ tư pháp", sdt: "0904444444", email: "ld.stp@hanoi.gov.vn", diaChi: "Hoàn Kiếm, Hà Nội", trangThai: "Hoạt động", vaiTro: "Lãnh đạo phòng chuyên môn STP" },
  cv_stp: { username: "cv.stp.hanoi", hoTen: "Lê Văn Viên", donVi: "Sở Tư pháp Hà Nội", chucVu: "Chuyên viên", sdt: "0905555555", email: "cv.stp@hanoi.gov.vn", diaChi: "Hai Bà Trưng, Hà Nội", trangThai: "Hoạt động", vaiTro: "Chuyên viên Sở Tư pháp" },
  ld_tchncc: { username: "ld.tchncc", hoTen: "Hoàng Văn Trưởng", donVi: "VPCC Nguyễn Văn A", chucVu: "Trưởng Văn phòng công chứng", sdt: "0906666666", email: "ld.tchncc@vpcc.vn", diaChi: "Ba Đình, Hà Nội", trangThai: "Hoạt động", vaiTro: "Lãnh đạo TCHNCC" },
  ccv: { username: "ccv.nguyenvana", hoTen: "Nguyễn Văn A", donVi: "VPCC Nguyễn Văn A", chucVu: "Công chứng viên", sdt: "0900000001", email: "a@vpcc.gov.vn", diaChi: "Ba Đình, Hà Nội", trangThai: "Hoạt động", vaiTro: "Công chứng viên" },
  khac: { username: "unknown", hoTen: "—", donVi: "-", chucVu: "-", sdt: "-", email: "-", diaChi: "-", trangThai: "Khóa", vaiTro: "Vai trò khác" },
}

/* ============================ HƯỚNG DẪN SỬ DỤNG (SCR-A.9.1-03/04) ============================ */
export interface Instruction { id: string; title: string; fileName?: string; fileSize?: string; createdAt: string; views: number; content: string }
let instructions: Instruction[] = [
  { id: "hd-01", title: "Hướng dẫn tra cứu thông tin công chứng viên và TCHNCC", fileName: "hdsd-tra-cuu-ccv-tchncc.pdf", fileSize: "1.2 MB", createdAt: "2026-07-24T08:30:00", views: 128, content: "Hướng dẫn các bước tra cứu thông tin công chứng viên và tổ chức hành nghề công chứng: truy cập menu Tra cứu thông tin, nhập từ khóa tìm kiếm, xem kết quả và mở chi tiết hồ sơ." },
  { id: "hd-02", title: "Hướng dẫn khai thác văn bản công chứng điện tử", fileName: "hdsd-khai-thac-vbccdt.pdf", fileSize: "2.4 MB", createdAt: "2026-07-20T10:00:00", views: 96, content: "Tài liệu mô tả quy trình tra cứu và tải văn bản công chứng điện tử, bao gồm cách tham chiếu mã VBCCĐT và xác thực chữ ký số." },
  { id: "hd-03", title: "Hướng dẫn đăng ký yêu cầu cung cấp dữ liệu", fileName: "hdsd-yeu-cau-cung-cap-du-lieu.pdf", fileSize: "980 KB", createdAt: "2026-07-18T09:15:00", views: 74, content: "Hướng dẫn tổ chức hành nghề công chứng lập yêu cầu khôi phục dữ liệu, gửi Sở Tư pháp tiếp nhận và theo dõi trạng thái xử lý." },
  { id: "hd-04", title: "Hướng dẫn xem báo cáo thống kê giao dịch công chứng", fileName: "hdsd-bao-cao-thong-ke.pdf", fileSize: "1.6 MB", createdAt: "2026-07-15T14:20:00", views: 61, content: "Tài liệu mô tả cách chọn kỳ báo cáo, bộ lọc địa bàn và xuất báo cáo thống kê giao dịch công chứng ra Excel." },
  { id: "hd-05", title: "Hướng dẫn xử lý thông tin ngăn chặn, giải tỏa", fileName: undefined, fileSize: undefined, createdAt: "2026-07-10T11:00:00", views: 40, content: "Nội dung hướng dẫn tiếp nhận, xử lý và giải tỏa thông tin ngăn chặn tài sản đang được cập nhật." },
  { id: "hd-06", title: "Hướng dẫn quản lý tài khoản và đổi mật khẩu", fileName: "hdsd-quan-ly-tai-khoan.pdf", fileSize: "620 KB", createdAt: "2026-07-05T08:00:00", views: 152, content: "Hướng dẫn xem hồ sơ tài khoản, cập nhật thông tin cá nhân và đổi mật khẩu đăng nhập." },
]
const instrListeners = new Set<() => void>()
const emitInstr = () => { instructions = [...instructions]; instrListeners.forEach((l) => l()) }
const subInstr = (cb: () => void) => { instrListeners.add(cb); return () => instrListeners.delete(cb) }
export const useInstructions = () => useSyncExternalStore(subInstr, () => instructions)
export const getInstruction = (id: string) => instructions.find((i) => i.id === id)
export function incrementInstructionViews(id: string) { instructions = instructions.map((i) => (i.id === id ? { ...i, views: i.views + 1 } : i)); emitInstr() }

/* ============================ FAQ (SCR-A.9.1-05/06) ============================ */
export type FaqAudience = "Tất cả" | "Bộ Tư pháp" | "Sở Tư pháp" | "TCHNCC" | "Công chứng viên"
export interface FaqAttachment { name: string; type: string; size: string }
export interface Faq { id: string; question: string; answer: string; topic: string; audience: FaqAudience; views: number; attachments: FaqAttachment[] }
let faqs: Faq[] = [
  { id: "faq-01", question: "Làm thế nào để tra cứu thông tin công chứng viên?", answer: "Truy cập menu Tra cứu thông tin → Công chứng viên và TCHNCC, nhập tên hoặc số chứng chỉ hành nghề vào ô tìm kiếm rồi bấm Tìm kiếm để xem danh sách kết quả phù hợp.", topic: "Tra cứu thông tin", audience: "Tất cả", views: 68, attachments: [] },
  { id: "faq-02", question: "Quên mật khẩu đăng nhập thì xử lý như thế nào?", answer: "Công chứng viên và Lãnh đạo TCHNCC liên hệ Sở Tư pháp quản lý để được cấp lại mật khẩu mặc định; cán bộ nhà nước đăng nhập lại qua nền tảng định danh và xác thực điện tử của Bộ Tư pháp.", topic: "Tài khoản", audience: "Tất cả", views: 54, attachments: [] },
  { id: "faq-03", question: "Thời gian phiên đăng nhập tối đa là bao lâu?", answer: "Thời gian hết hạn phiên (timeout) do Quản trị hệ thống cấu hình tại Cấu hình tham số hệ thống, mặc định 120 phút, trong khoảng cho phép 15-480 phút.", topic: "Bảo mật", audience: "Tất cả", views: 41, attachments: [] },
  { id: "faq-04", question: "Làm thế nào để xuất báo cáo thống kê ra Excel?", answer: "Tại màn hình báo cáo thống kê tương ứng, chọn kỳ báo cáo và bộ lọc cần thiết, sau đó bấm nút Xuất báo cáo để tải file Excel.", topic: "Báo cáo thống kê", audience: "Sở Tư pháp", views: 33, attachments: [{ name: "mau-bao-cao.xlsx", type: "XLSX", size: "48 KB" }] },
  { id: "faq-05", question: "Tổ chức hành nghề công chứng đăng ký yêu cầu cung cấp dữ liệu ở đâu?", answer: "Vào menu Quản lý yêu cầu cung cấp dữ liệu → Đăng ký yêu cầu cung cấp dữ liệu, điền thông tin khoảng thời gian cần khôi phục và lý do, sau đó gửi Sở Tư pháp tiếp nhận.", topic: "Yêu cầu dữ liệu", audience: "TCHNCC", views: 29, attachments: [{ name: "huong-dan-yeu-cau.pdf", type: "PDF", size: "310 KB" }] },
  { id: "faq-06", question: "Vì sao không thấy menu Quản trị hệ thống?", answer: "Menu Quản trị hệ thống chỉ hiển thị với tài khoản được gán vai trò Quản trị hệ thống; các vai trò nghiệp vụ khác không có quyền truy cập nhóm chức năng này.", topic: "Phân quyền", audience: "Tất cả", views: 18, attachments: [] },
  { id: "faq-07", question: "Làm thế nào để xem lại các thao tác mình đã thực hiện?", answer: "Vào Tiện ích → Lịch sử thao tác cá nhân để xem danh sách các thao tác thêm mới/cập nhật/xóa do chính tài khoản của bạn thực hiện trên hệ thống.", topic: "Tài khoản", audience: "Tất cả", views: 12, attachments: [] },
]
const faqListeners = new Set<() => void>()
const emitFaq = () => { faqs = [...faqs]; faqListeners.forEach((l) => l()) }
const subFaq = (cb: () => void) => { faqListeners.add(cb); return () => faqListeners.delete(cb) }
export const useFaqs = () => useSyncExternalStore(subFaq, () => faqs)
export const getFaq = (id: string) => faqs.find((f) => f.id === id)
export function incrementFaqViews(id: string) { faqs = faqs.map((f) => (f.id === id ? { ...f, views: f.views + 1 } : f)); emitFaq() }
export const FAQ_TOPICS = Array.from(new Set(faqs.map((f) => f.topic)))
export const FAQ_AUDIENCES: FaqAudience[] = ["Tất cả", "Bộ Tư pháp", "Sở Tư pháp", "TCHNCC", "Công chứng viên"]
export function popularityOf(views: number): "Cao" | "Trung bình" | "Thấp" {
  if (views >= 50) return "Cao"
  if (views >= 20) return "Trung bình"
  return "Thấp"
}
export const summarize = (html: string) => (html.length > 200 ? html.slice(0, 200).trim() + "…" : html)

/* ============================ HOẠT ĐỘNG GẦN ĐÂY (SCR-A.9.1-07) ============================ */
export type ActivityScope = "bo" | `stp:${string}` | `tchncc:${string}`
export interface ActivityLog { id: string; unit: string; action: string; object: string; time: string; scope: ActivityScope }
export const STP_HOME_PROVINCE = "Hà Nội"
export const TCHNCC_HOME_ORG = "VPCC Nguyễn Văn A"
export const RECENT_ACTIVITIES: ActivityLog[] = [
  { id: "act-01", unit: "Sở Tư pháp Hà Nội", action: "đã tạo mới", object: "Thông tin ngăn chặn NC.2026.0134", time: "2026-08-28T08:52:00", scope: "stp:Hà Nội" },
  { id: "act-02", unit: "VPCC Nguyễn Văn A", action: "đã cập nhật", object: "Giao dịch công chứng GD.2026.0871", time: "2026-08-28T08:45:00", scope: "tchncc:VPCC Nguyễn Văn A" },
  { id: "act-03", unit: "Sở Tư pháp TP. Hồ Chí Minh", action: "đã duyệt", object: "Yêu cầu cung cấp dữ liệu YK-2608-0007", time: "2026-08-28T08:30:00", scope: "stp:TP. Hồ Chí Minh" },
  { id: "act-04", unit: "VPCC Trần Văn B", action: "đã gửi", object: "Yêu cầu khai thác chi tiết GDCC KT.0092", time: "2026-08-28T08:10:00", scope: "tchncc:VPCC Trần Văn B" },
  { id: "act-05", unit: "Cục Bổ trợ tư pháp", action: "đã công bố", object: "Báo cáo kết quả HĐCC theo TT17 tháng 8/2026", time: "2026-08-28T07:40:00", scope: "bo" },
  { id: "act-06", unit: "Sở Tư pháp Đà Nẵng", action: "đã giải tỏa", object: "Thông tin ngăn chặn NC.2026.0098", time: "2026-08-28T07:15:00", scope: "stp:Đà Nẵng" },
  { id: "act-07", unit: "VPCC Nguyễn Văn A", action: "đã tuyên hủy", object: "Giao dịch công chứng GD.2026.0754", time: "2026-08-27T16:50:00", scope: "tchncc:VPCC Nguyễn Văn A" },
  { id: "act-08", unit: "Sở Tư pháp Hà Nội", action: "đã tiếp nhận", object: "Yêu cầu cung cấp dữ liệu YK-2608-0011", time: "2026-08-27T15:30:00", scope: "stp:Hà Nội" },
  { id: "act-09", unit: "Phòng Công chứng số 1", action: "đã cập nhật", object: "Hồ sơ công chứng viên Nguyễn Thị C", time: "2026-08-27T14:05:00", scope: "tchncc:Phòng Công chứng số 1" },
  { id: "act-10", unit: "Bộ Tư pháp", action: "đã đối soát", object: "Dữ liệu giao dịch công chứng điện tử tháng 8/2026", time: "2026-08-27T09:20:00", scope: "bo" },
]
export function activitiesForRole(role: UtilRole): ActivityLog[] {
  const scoped = RECENT_ACTIVITIES
  let filtered: ActivityLog[]
  if (role === "admin" || role === "ld_btp" || role === "cv_btp") filtered = scoped
  else if (role === "ld_stp" || role === "cv_stp") filtered = scoped.filter((a) => a.scope === `stp:${STP_HOME_PROVINCE}`)
  else if (role === "ld_tchncc" || role === "ccv") filtered = scoped.filter((a) => a.scope === `tchncc:${TCHNCC_HOME_ORG}`)
  else filtered = []
  return [...filtered].sort((a, b) => b.time.localeCompare(a.time)).slice(0, 5)
}

/* ============================ LỊCH SỬ THAO TÁC CÁ NHÂN (SCR-A.9.1-08/09) ============================ */
export interface HistoryChange { truong: string; cu: string; moi: string }
export interface PersonalHistoryEntry { id: string; hanhDong: "Thêm mới" | "Cập nhật" | "Xóa"; doiTuong: string; diaChiIP: string; thoiGian: string; changes: HistoryChange[] }
export const PERSONAL_HISTORY_TEMPLATE: PersonalHistoryEntry[] = [
  { id: "his-01", hanhDong: "Cập nhật", doiTuong: "Giao dịch công chứng GD.2026.0871", diaChiIP: "10.0.0.12", thoiGian: "2026-08-28T08:45:00", changes: [{ truong: "Tên giao dịch", cu: "Mua bán nhà đất (bản nháp)", moi: "Mua bán nhà đất" }, { truong: "Trạng thái", cu: "Lưu nháp", moi: "Đã công chứng" }] },
  { id: "his-02", hanhDong: "Thêm mới", doiTuong: "Yêu cầu cung cấp dữ liệu YK-2608-0011", diaChiIP: "10.0.0.12", thoiGian: "2026-08-27T15:12:00", changes: [{ truong: "Trạng thái", cu: "-", moi: "Lưu nháp" }] },
  { id: "his-03", hanhDong: "Cập nhật", doiTuong: "Hồ sơ tài khoản cá nhân", diaChiIP: "10.0.0.12", thoiGian: "2026-08-26T09:30:00", changes: [{ truong: "Số điện thoại", cu: "0900000000", moi: "0900000001" }] },
  { id: "his-04", hanhDong: "Xóa", doiTuong: "Bản nháp giao dịch GD.2026.0699", diaChiIP: "10.0.0.15", thoiGian: "2026-08-24T14:02:00", changes: [{ truong: "Trạng thái", cu: "Lưu nháp", moi: "-" }] },
  { id: "his-05", hanhDong: "Cập nhật", doiTuong: "Thông tin ngăn chặn NC.2026.0098", diaChiIP: "10.0.0.12", thoiGian: "2026-08-22T11:20:00", changes: [{ truong: "Trạng thái", cu: "Đang ngăn chặn", moi: "Đã giải tỏa" }] },
  { id: "his-06", hanhDong: "Thêm mới", doiTuong: "Giao dịch công chứng GD.2026.0754", diaChiIP: "10.0.0.12", thoiGian: "2026-08-20T10:05:00", changes: [{ truong: "Trạng thái", cu: "-", moi: "Lưu nháp" }] },
]
export const HISTORY_ACTIONS: PersonalHistoryEntry["hanhDong"][] = ["Thêm mới", "Cập nhật", "Xóa"]

/* ============================ PHIÊN ĐĂNG NHẬP (SCR-A.9.1-10/11) ============================ */
export interface OnlineSession { id: string; username: string; hoTen: string; sdt?: string; email?: string; loginTime: string; expireTime: string; ip: string; browser: string }
export const ADMIN_SESSIONS: OnlineSession[] = [
  { id: "ses-01", username: "quantrihethong", hoTen: "Đỗ Văn Quản", sdt: "0900000000", email: "quantri@moj.gov.vn", loginTime: "2026-08-28T08:00:00", expireTime: "2026-08-28T10:00:00", ip: "10.0.0.1", browser: "Chrome 126 trên Windows 11" },
  { id: "ses-02", username: "ld.btp", hoTen: "Nguyễn Thị Bộ", sdt: "0901111111", email: "ld.btp@moj.gov.vn", loginTime: "2026-08-28T07:50:00", expireTime: "2026-08-28T09:50:00", ip: "10.0.0.4", browser: "Edge 126 trên Windows 11" },
  { id: "ses-03", username: "cv.stp.hanoi", hoTen: "Lê Văn Viên", sdt: "0905555555", email: "cv.stp@hanoi.gov.vn", loginTime: "2026-08-28T08:20:00", expireTime: "2026-08-28T10:20:00", ip: "10.0.1.8", browser: "Chrome 126 trên macOS" },
  { id: "ses-04", username: "ccv.nguyenvana", hoTen: "Nguyễn Văn A", sdt: "0900000001", email: "a@vpcc.gov.vn", loginTime: "2026-08-28T08:35:00", expireTime: "2026-08-28T10:35:00", ip: "113.161.20.5", browser: "Chrome Mobile trên Android" },
  { id: "ses-05", username: "ld.tchncc", hoTen: "Hoàng Văn Trưởng", sdt: "0906666666", email: "ld.tchncc@vpcc.vn", loginTime: "2026-08-27T09:00:00", expireTime: "2026-08-27T11:00:00", ip: "113.161.20.9", browser: "Safari trên iPad" },
]
export function myOwnSessions(role: UtilRole): OnlineSession[] {
  const me = CURRENT_USER[role]
  const existing = ADMIN_SESSIONS.filter((s) => s.username === me.username)
  if (existing.length) return existing
  return [{ id: `ses-${me.username}`, username: me.username, hoTen: me.hoTen, sdt: me.sdt, email: me.email, loginTime: "2026-08-28T08:15:00", expireTime: "2026-08-28T10:15:00", ip: "10.0.2.6", browser: "Chrome 126 trên Windows 11" }]
}
