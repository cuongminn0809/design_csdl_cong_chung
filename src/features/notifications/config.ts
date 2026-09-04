import { useSyncExternalStore } from "react"

/* ============================ VAI TRÒ (demo, dùng chung 1 store để Bell và các trang đồng bộ) ============================ */
export type NotiRole = "ld_btp" | "cv_btp" | "ld_cuc_bttp" | "ld_stp" | "cv_stp" | "ld_tchncc"
export const NOTI_ROLES: { key: NotiRole; label: string }[] = [
  { key: "ld_btp", label: "Lãnh đạo Bộ Tư pháp" },
  { key: "cv_btp", label: "Chuyên viên BTP" },
  { key: "ld_cuc_bttp", label: "Lãnh đạo BTP" },
  { key: "ld_stp", label: "Lãnh đạo phòng chuyên môn STP" },
  { key: "cv_stp", label: "Chuyên viên Sở Tư pháp" },
  { key: "ld_tchncc", label: "Lãnh đạo TCHNCC" },
]
export const roleLabel = (r: NotiRole) => NOTI_ROLES.find((x) => x.key === r)?.label ?? r

let currentRole: NotiRole = "ld_tchncc"
const roleListeners = new Set<() => void>()
const emitRole = () => roleListeners.forEach((l) => l())
export function setCurrentRole(r: NotiRole) { currentRole = r; emitRole() }
export const useCurrentRole = () => useSyncExternalStore((cb) => { roleListeners.add(cb); return () => roleListeners.delete(cb) }, () => currentRole)

export const isTchncc = (r: NotiRole) => r === "ld_tchncc"
export const canManageReportNoti = (r: NotiRole) => r === "cv_stp" || r === "ld_stp" || r === "ld_tchncc"
export const CURRENT_ORG_USER: Record<NotiRole, string> = {
  ld_btp: "Nguyễn Thị Bộ", cv_btp: "Trần Văn Chuyên", ld_cuc_bttp: "Phạm Văn Cục",
  ld_stp: "Vũ Thị Sở", cv_stp: "Lê Văn Viên", ld_tchncc: "Hoàng Văn Trưởng",
}

/* ============================ NGÀY DEMO CỐ ĐỊNH ============================ */
export const TODAY_ISO = "2026-08-28"
export const NOW_ISO = "2026-08-28T09:00:00"
export const fmtVN = (iso: string) => { const [y, m, d] = iso.split("-"); return `${d}/${m}/${y}` }
export const fmtVNDateTime = (iso: string) => { const [d, t] = iso.split("T"); return `${fmtVN(d)} ${t ?? ""}`.trim() }
export function relativeTime(iso: string) {
  const diffMs = new Date(NOW_ISO).getTime() - new Date(iso).getTime()
  const min = Math.floor(diffMs / 60000)
  if (min < 1) return "Vừa xong"
  if (min < 60) return `${min} phút trước`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h} giờ trước`
  const d = Math.floor(h / 24)
  if (d === 1) return "Hôm qua"
  return fmtVN(iso.slice(0, 10))
}

/* ============================ SCR-A.9.2.1-02/03/04 — THÔNG BÁO NHẬN CỦA TÔI ============================ */
export type NotiType = "Thông báo hệ thống" | "Thông báo nghiệp vụ"
export type NotiPriority = "Cao" | "Bình thường"
export interface NotiAttachment { name: string; size: string }
export interface NotiRelatedLink { label: string; path: string }
export interface MyNotification {
  id: string
  title: string
  type: NotiType
  priority: NotiPriority
  source: string
  receivedAt: string
  read: boolean
  content: string
  attachments: NotiAttachment[]
  related?: NotiRelatedLink
  deleted: boolean
}
let notifications: MyNotification[] = [
  { id: "tb-01", title: "Bảo trì hệ thống ngày 05/08/2026", type: "Thông báo hệ thống", priority: "Cao", source: "Quản trị hệ thống", receivedAt: "2026-08-28T08:50:00", read: false, content: "Hệ thống tạm dừng phục vụ từ 22:00 ngày 05/08/2026 đến 02:00 ngày 06/08/2026 để bảo trì định kỳ. Đề nghị người dùng hoàn tất thao tác trước thời điểm trên.", attachments: [{ name: "ke-hoach-bao-tri.pdf", size: "180 KB" }], related: { label: "Xem chi tiết giao dịch CC #GD00123", path: "/notary-transaction/electronic/list" }, deleted: false },
  { id: "tb-02", title: "Cảnh báo rủi ro mới tại địa bàn", type: "Thông báo nghiệp vụ", priority: "Cao", source: "Hệ thống", receivedAt: "2026-08-28T08:00:00", read: false, content: "Có thông tin ngăn chặn mới liên quan đến tài sản trong địa bàn quản lý của bạn. Vui lòng kiểm tra chi tiết.", attachments: [], related: { label: "Xem thông tin ngăn chặn NC.2026.0134", path: "/prevent-info/search" }, deleted: false },
  { id: "tb-03", title: "Kết quả xử lý yêu cầu khai thác", type: "Thông báo nghiệp vụ", priority: "Bình thường", source: "Hệ thống", receivedAt: "2026-08-27T15:20:00", read: false, content: "Yêu cầu khai thác chi tiết GDCC KT.0092 của bạn đã được phê duyệt và cung cấp dữ liệu.", attachments: [{ name: "ket-qua-khai-thac.pdf", size: "420 KB" }], related: { label: "Xem yêu cầu KT.0092", path: "/exploit-request/sent" }, deleted: false },
  { id: "tb-04", title: "Nhắc nộp báo cáo hoạt động công chứng Quý III/2026", type: "Thông báo nghiệp vụ", priority: "Bình thường", source: "Sở Tư pháp Hà Nội", receivedAt: "2026-08-26T09:00:00", read: true, content: "Đề nghị đơn vị hoàn tất và nộp số liệu báo cáo hoạt động công chứng Quý III/2026 trước ngày 10/09/2026.", attachments: [], related: { label: "Xem thông báo đợt báo cáo", path: "/tien-ich/thong-bao/dot-bao-cao" }, deleted: false },
  { id: "tb-05", title: "Cập nhật chính sách bảo mật phiên đăng nhập", type: "Thông báo hệ thống", priority: "Bình thường", source: "Hệ thống", receivedAt: "2026-08-24T10:30:00", read: true, content: "Thời gian hết hạn phiên làm việc mặc định đã được điều chỉnh còn 120 phút theo cấu hình mới.", attachments: [], deleted: false },
  { id: "tb-06", title: "Yêu cầu cung cấp dữ liệu đã được duyệt", type: "Thông báo nghiệp vụ", priority: "Bình thường", source: "Hệ thống", receivedAt: "2026-08-20T14:10:00", read: true, content: "Yêu cầu cung cấp dữ liệu YK-2608-0007 của tổ chức bạn đã được Sở Tư pháp phê duyệt.", attachments: [], deleted: false },
]
const listeners = new Set<() => void>()
const emit = () => { notifications = [...notifications]; listeners.forEach((l) => l()) }
const subscribe = (cb: () => void) => { listeners.add(cb); return () => listeners.delete(cb) }
export const useNotifications = () => useSyncExternalStore(subscribe, () => notifications)
export const activeNotifications = () => notifications.filter((n) => !n.deleted)
export const unreadCount = () => activeNotifications().filter((n) => !n.read).length
export function markRead(id: string) { notifications = notifications.map((n) => (n.id === id ? { ...n, read: true } : n)); emit() }
export function softDeleteNoti(id: string) { notifications = notifications.map((n) => (n.id === id ? { ...n, deleted: true } : n)); emit() }
export const getNotification = (id: string) => notifications.find((n) => n.id === id)
export const NOTI_TYPES: NotiType[] = ["Thông báo hệ thống", "Thông báo nghiệp vụ"]

/* ============================ SCR-A.9.2.1-05 — ĐĂNG KÝ NHẬN THÔNG BÁO ============================ */
export interface NotiGroup { id: string; name: string; events: string; applicableRoles: NotiRole[] }
export const NOTI_GROUPS: NotiGroup[] = [
  { id: "grp-01", name: "Cảnh báo rủi ro & ngăn chặn", events: "Phát sinh cảnh báo rủi ro mới; Cập nhật ngăn chặn/giải tỏa", applicableRoles: ["ld_btp", "cv_btp", "ld_stp", "cv_stp", "ld_tchncc"] },
  { id: "grp-02", name: "Kết quả xử lý yêu cầu", events: "Duyệt/từ chối yêu cầu khai thác; Duyệt yêu cầu cung cấp dữ liệu", applicableRoles: ["ld_btp", "cv_btp", "ld_stp", "cv_stp", "ld_tchncc"] },
  { id: "grp-03", name: "Nhắc nộp báo cáo định kỳ", events: "Phát hành thông báo đợt báo cáo; Nhắc lại khi chưa nộp", applicableRoles: ["ld_stp", "cv_stp", "ld_tchncc"] },
  { id: "grp-04", name: "Thông báo hệ thống", events: "Bảo trì hệ thống; Thay đổi cấu hình bảo mật", applicableRoles: ["ld_btp", "cv_btp", "ld_stp", "cv_stp", "ld_tchncc"] },
]
let subscriptions: Record<string, boolean> = { "grp-01": true, "grp-02": true, "grp-03": true, "grp-04": true }
const subListeners = new Set<() => void>()
export const useSubscriptions = () => useSyncExternalStore((cb) => { subListeners.add(cb); return () => subListeners.delete(cb) }, () => subscriptions)
export function saveSubscriptions(next: Record<string, boolean>) { subscriptions = { ...subscriptions, ...next }; subListeners.forEach((l) => l()) }

/* ============================ SCR-A.9.2.1-06 — THÔNG BÁO PHẢN HỒI DỮ LIỆU (Lãnh đạo TCHNCC) ============================ */
export type FeedbackType = "xu-ly" | "hau-kiem"
export type FeedbackStatus = "Chờ xử lý" | "Đã xử lý"
export interface FeedbackNoti { id: string; feedbackType: FeedbackType; title: string; content: string; relatedLabel: string; relatedPath: string; receivedAt: string; read: boolean; status: FeedbackStatus }
let feedbacks: FeedbackNoti[] = [
  { id: "pf-01", feedbackType: "xu-ly", title: "Đồng bộ giao dịch công chứng GD.2026.0871 thất bại", content: "Hệ thống đồng bộ giao dịch công chứng GD.2026.0871 lên nền tảng công chứng gặp lỗi định dạng dữ liệu tài sản. Vui lòng kiểm tra và đồng bộ lại.", relatedLabel: "Mở giao dịch GD.2026.0871", relatedPath: "/notary-transaction/electronic/list", receivedAt: "2026-08-28T07:30:00", read: false, status: "Chờ xử lý" },
  { id: "pf-02", feedbackType: "hau-kiem", title: "Phát hiện sai lệch dữ liệu tài sản qua hậu kiểm", content: "Kết quả hậu kiểm phát hiện thông tin diện tích tài sản trong hồ sơ GD.2026.0754 không khớp với dữ liệu đất đai tham chiếu.", relatedLabel: "Mở hồ sơ GD.2026.0754", relatedPath: "/notary-transaction/electronic/list", receivedAt: "2026-08-27T13:15:00", read: false, status: "Chờ xử lý" },
  { id: "pf-03", feedbackType: "xu-ly", title: "Đồng bộ thông tin công chứng viên thành công", content: "Hồ sơ công chứng viên Nguyễn Thị C đã được đồng bộ thành công lên nền tảng công chứng.", relatedLabel: "Mở hồ sơ công chứng viên", relatedPath: "/quan-tri/nguoi-dung", receivedAt: "2026-08-24T09:00:00", read: true, status: "Đã xử lý" },
  { id: "pf-04", feedbackType: "hau-kiem", title: "Hậu kiểm hoàn tất, không phát hiện sai lệch", content: "Đợt hậu kiểm dữ liệu giao dịch công chứng tháng 7/2026 hoàn tất, không phát hiện sai lệch nào cần xử lý.", relatedLabel: "Mở báo cáo hậu kiểm", relatedPath: "/khai-thac-thong-tin/hau-kiem-du-lieu", receivedAt: "2026-08-18T10:00:00", read: true, status: "Đã xử lý" },
]
const fbListeners = new Set<() => void>()
const emitFb = () => { feedbacks = [...feedbacks]; fbListeners.forEach((l) => l()) }
export const useFeedbacks = () => useSyncExternalStore((cb) => { fbListeners.add(cb); return () => fbListeners.delete(cb) }, () => feedbacks)
export const getFeedback = (id: string) => feedbacks.find((f) => f.id === id)
export function markFeedbackRead(id: string) { feedbacks = feedbacks.map((f) => (f.id === id ? { ...f, read: true } : f)); emitFb() }
export function markFeedbackResolved(id: string) { feedbacks = feedbacks.map((f) => (f.id === id ? { ...f, status: "Đã xử lý" } : f)); emitFb() }

/* ============================ SCR-A.9.2.1-07..10 — THÔNG BÁO ĐỢT BÁO CÁO ============================ */
export type ReportNotiStatus = "Nháp" | "Đã phát hành"
export interface ReportNotiTracking { donVi: string; ttNhan: "Chưa xem" | "Đã xem"; ttNop: "Chưa nộp" | "Đã nộp"; capNhat?: string }
export interface ReportNoti {
  id: string; maTB: string; tieuDe: string; kyBaoCao: string; hanNop?: string
  trangThai: ReportNotiStatus; noiDung: string; donViNhan: string[]
  nguoiTao: string; ngayTao: string; ngayPhatHanh?: string
  tracking: ReportNotiTracking[]; lastRemindAt?: string
}
export const KY_BAO_CAO = ["6 tháng đầu năm 2026", "Năm 2026", "Quý III/2026", "Đột xuất"]
export const RECIPIENT_ORGS = ["VPCC Nguyễn Văn A", "Phòng Công chứng số 1", "VPCC Trần Văn B", "VPCC Bến Thành", "VPCC Sông Hàn"]
let reportNotis: ReportNoti[] = [
  {
    id: "rn-01", maTB: "TBBC001", tieuDe: "Nhắc nộp báo cáo hoạt động công chứng Quý III/2026", kyBaoCao: "Quý III/2026", hanNop: "2026-09-10",
    trangThai: "Đã phát hành", noiDung: "Đề nghị các tổ chức hành nghề công chứng hoàn tất và nộp số liệu báo cáo hoạt động công chứng Quý III/2026 trước hạn.",
    donViNhan: ["VPCC Nguyễn Văn A", "Phòng Công chứng số 1", "VPCC Trần Văn B"], nguoiTao: "Lê Văn Viên", ngayTao: "2026-08-20T09:00:00", ngayPhatHanh: "2026-08-20T09:30:00",
    tracking: [
      { donVi: "VPCC Nguyễn Văn A", ttNhan: "Đã xem", ttNop: "Đã nộp", capNhat: "2026-08-25T10:00:00" },
      { donVi: "Phòng Công chứng số 1", ttNhan: "Đã xem", ttNop: "Chưa nộp", capNhat: "2026-08-22T08:00:00" },
      { donVi: "VPCC Trần Văn B", ttNhan: "Chưa xem", ttNop: "Chưa nộp" },
    ],
  },
  {
    id: "rn-02", maTB: "TBBC002", tieuDe: "Thông báo nộp báo cáo 6 tháng đầu năm 2026", kyBaoCao: "6 tháng đầu năm 2026", hanNop: "2026-07-15",
    trangThai: "Đã phát hành", noiDung: "Đề nghị các đơn vị nộp báo cáo hoạt động công chứng 6 tháng đầu năm 2026 đúng hạn.",
    donViNhan: ["VPCC Nguyễn Văn A", "VPCC Bến Thành", "VPCC Sông Hàn"], nguoiTao: "Lê Văn Viên", ngayTao: "2026-06-25T09:00:00", ngayPhatHanh: "2026-06-25T09:15:00",
    tracking: [
      { donVi: "VPCC Nguyễn Văn A", ttNhan: "Đã xem", ttNop: "Đã nộp", capNhat: "2026-07-10T10:00:00" },
      { donVi: "VPCC Bến Thành", ttNhan: "Đã xem", ttNop: "Đã nộp", capNhat: "2026-07-12T14:00:00" },
      { donVi: "VPCC Sông Hàn", ttNhan: "Đã xem", ttNop: "Đã nộp", capNhat: "2026-07-08T09:00:00" },
    ],
  },
  {
    id: "rn-03", maTB: "TBBC003", tieuDe: "Dự thảo nhắc nộp báo cáo đột xuất", kyBaoCao: "Đột xuất", hanNop: "2026-09-05",
    trangThai: "Nháp", noiDung: "", donViNhan: [], nguoiTao: "Lê Văn Viên", ngayTao: "2026-08-27T15:00:00", tracking: [],
  },
]
const rnListeners = new Set<() => void>()
const emitRn = () => { reportNotis = [...reportNotis]; rnListeners.forEach((l) => l()) }
export const useReportNotis = () => useSyncExternalStore((cb) => { rnListeners.add(cb); return () => rnListeners.delete(cb) }, () => reportNotis)
export const getReportNoti = (id: string) => reportNotis.find((r) => r.id === id)
let rnSeq = reportNotis.length
export function genMaTB() { rnSeq += 1; return `TBBC${String(rnSeq).padStart(3, "0")}` }
export function createReportNoti(input: { tieuDe: string; kyBaoCao?: string; hanNop?: string; noiDung?: string; donViNhan: string[] }, nguoiTao: string) {
  const rec: ReportNoti = { id: `rn-${Date.now()}`, maTB: genMaTB(), tieuDe: input.tieuDe, kyBaoCao: input.kyBaoCao ?? "", hanNop: input.hanNop, trangThai: "Nháp", noiDung: input.noiDung ?? "", donViNhan: input.donViNhan, nguoiTao, ngayTao: NOW_ISO, tracking: [] }
  reportNotis = [rec, ...reportNotis]; emitRn(); return rec
}
export function updateReportNotiDraft(id: string, patch: Partial<Pick<ReportNoti, "tieuDe" | "kyBaoCao" | "hanNop" | "noiDung" | "donViNhan">>) {
  reportNotis = reportNotis.map((r) => (r.id === id && r.trangThai === "Nháp" ? { ...r, ...patch } : r)); emitRn()
}
export function publishReportNoti(id: string) {
  reportNotis = reportNotis.map((r) => r.id === id ? {
    ...r, trangThai: "Đã phát hành" as const, ngayPhatHanh: NOW_ISO,
    tracking: r.donViNhan.map((donVi) => ({ donVi, ttNhan: "Chưa xem" as const, ttNop: "Chưa nộp" as const })),
  } : r)
  emitRn()
}
export function deleteReportNoti(id: string) { reportNotis = reportNotis.filter((r) => r.id !== id); emitRn() }
export function remindReportNoti(id: string) { reportNotis = reportNotis.map((r) => (r.id === id ? { ...r, lastRemindAt: NOW_ISO } : r)); emitRn() }
export const canRemindToday = (r: ReportNoti) => !r.lastRemindAt || r.lastRemindAt.slice(0, 10) !== TODAY_ISO
export const hasUnsubmitted = (r: ReportNoti) => r.tracking.some((t) => t.ttNop === "Chưa nộp")
