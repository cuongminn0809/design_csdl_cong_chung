import type { StatusMeta } from "../ingestion/shared"

/* ============================ TRẠNG THÁI ============================ */
export type ReqStatus = "Chờ xác nhận" | "Đã xác nhận" | "Từ chối" | "Hết thời gian"
export const REQ_STATUS: Record<ReqStatus, StatusMeta> = {
  "Chờ xác nhận": { label: "Chờ xác nhận", bg: "#fffbeb", fg: "#b45309", dot: "#f59e0b", bd: "#fde68a" },
  "Đã xác nhận": { label: "Đã xác nhận", bg: "#ecfdf5", fg: "#047857", dot: "#10b981", bd: "#a7f3d0" },
  "Từ chối": { label: "Từ chối", bg: "#fef2f2", fg: "#b91c1c", dot: "#ef4444", bd: "#fecaca" },
  "Hết thời gian": { label: "Hết thời gian", bg: "#f8fafc", fg: "#64748b", dot: "#94a3b8", bd: "#e2e8f0" },
}
export const REQ_STATUS_OPTIONS: ReqStatus[] = ["Chờ xác nhận", "Đã xác nhận", "Từ chối", "Hết thời gian"]

export type SendMethod = "tchncc" | "email"

/* ============================ MASK BR-09 ============================ */
export const maskDoc = (s: string) => (s.length <= 4 ? s : s.slice(0, 2) + "*".repeat(Math.max(2, s.length - 4)) + s.slice(-2))
export const maskPhone = (s: string) => (s.length <= 4 ? s : s.slice(0, 2) + "*".repeat(Math.max(2, s.length - 4)) + s.slice(-2))
export const maskEmail = (s: string) => {
  const at = s.indexOf("@")
  if (at < 0) return s
  const local = s.slice(0, at), dom = s.slice(at)
  const ml = local.length <= 4 ? local : local.slice(0, 2) + "*".repeat(local.length - 4) + local.slice(-2)
  return ml + dom
}

/* ============================ KIỂU DỮ LIỆU ============================ */
export interface Participant { hoTen: string; soGiayTo: string; email: string; phone: string }
export interface VbccdtRecord {
  id: string; qr: string; soCC: string; ngayCC: string; tenGD: string; ccv: string; tchncc: string; soTuPhap: string
  participants: Participant[]
  fileName: string
}

export interface ReferenceRequest {
  id: string // mã yêu cầu YC-...
  thoiGianGui: string
  soCC: string; ngayCC: string; qr: string
  nguoiNhan: string; tchnccNhan: string
  nguoiGui: string; tchnccGui: string
  noiDung: string
  phuongThuc: SendMethod
  trangThai: ReqStatus
  lyDoTuChoi?: string
  thoiGianHieuLuc?: number // phút
  fileName: string
}

export interface ViewLog { id: string; thoiGianXem: string; soCC: string; ip: string; maYeuCau: string; nguoiGui: string; tchnccGui: string }

/* ============================ DANH MỤC ============================ */
export const SO_TU_PHAP = ["TP Hà Nội", "TP Hồ Chí Minh", "TP Đà Nẵng", "Tỉnh Kiên Giang"]
export const TCHNCC_BY_STP: Record<string, string[]> = {
  "TP Hà Nội": ["VPCC Nguyễn Văn B", "VPCC Trần Văn A"],
  "TP Hồ Chí Minh": ["VPCC Bến Thành"],
  "TP Đà Nẵng": ["VPCC Sông Hàn"],
  "Tỉnh Kiên Giang": ["VPCC Rạch Giá"],
}

/* ============================ VBCCĐT MẪU (tra cứu) ============================ */
const P = (hoTen: string, soGiayTo: string, email: string, phone: string): Participant => ({ hoTen, soGiayTo, email, phone })

export const VBCCDT_RECORDS: VbccdtRecord[] = [
  {
    id: "V1", qr: "TC-2026-001", soCC: "100/2026/HĐ", ngayCC: "15/05/2026", tenGD: "Hợp đồng chuyển nhượng QSDĐ", ccv: "Nguyễn Văn B", tchncc: "VPCC Nguyễn Văn B", soTuPhap: "TP Hà Nội",
    participants: [
      P("Trần Văn C", "001080012390", "tranvanc@email.com", "0901234567"),
      P("Lê Thị D", "001185009921", "lethid@gmail.com", "0938111243"),
    ],
    fileName: "VBCCDT_100_2026.pdf",
  },
  {
    id: "V2", qr: "TC-2026-002", soCC: "101/2026/HĐ", ngayCC: "18/05/2026", tenGD: "Hợp đồng thế chấp QSDĐ", ccv: "Nguyễn Văn B", tchncc: "VPCC Nguyễn Văn B", soTuPhap: "TP Hà Nội",
    participants: [
      P("Công ty TNHH ABC", "0123456789", "contact@abc.com.vn", "0243826999"),
      P("Ngân hàng TMCP X", "0100112233", "hanoi@bankx.vn", "0243512345"),
    ],
    fileName: "VBCCDT_101_2026.pdf",
  },
  {
    id: "V3", qr: "TC-2026-003", soCC: "205/2026/HĐ", ngayCC: "22/06/2026", tenGD: "Hợp đồng mua bán căn hộ", ccv: "Phạm Văn E", tchncc: "VPCC Rạch Giá", soTuPhap: "Tỉnh Kiên Giang",
    participants: [
      P("Hoàng Văn G", "091079004321", "hoangvang@email.com", "0907888999"),
      P("Lê Thị D", "001185099887", "lethid2@email.com", "0938111222"),
    ],
    fileName: "VBCCDT_205_2026.pdf",
  },
]

export function searchByQr(qr: string): VbccdtRecord[] {
  const k = qr.trim().toLowerCase()
  return k ? VBCCDT_RECORDS.filter((r) => r.qr.toLowerCase().includes(k)) : []
}
export function searchBySoCC(soCC: string, soTuPhap: string, tchncc: string): VbccdtRecord[] {
  const k = soCC.trim().toLowerCase()
  return VBCCDT_RECORDS.filter((r) => r.soCC.toLowerCase().includes(k) && r.soTuPhap === soTuPhap && r.tchncc === tchncc)
}

/* ============================ YÊU CẦU (module-level) ============================ */
const CUR_CCV = "Trần Văn A"
const CUR_TCHNCC = "VPCC Nguyễn Văn B"

export const REQUESTS: ReferenceRequest[] = [
  { id: "YC-2026-0001", thoiGianGui: "20/07/2026 14:30", soCC: "100/2026/HĐ", ngayCC: "15/05/2026", qr: "TC-2026-001", nguoiNhan: "Nguyễn Văn B", tchnccNhan: "VPCC Nguyễn Văn B", nguoiGui: "Trần Văn A", tchnccGui: "VPCC Trần Văn A", noiDung: "Xác minh tài sản thế chấp phục vụ giao dịch mới.", phuongThuc: "tchncc", trangThai: "Chờ xác nhận", fileName: "VBCCDT_100_2026.pdf" },
  { id: "YC-2026-0002", thoiGianGui: "19/07/2026 09:15", soCC: "101/2026/HĐ", ngayCC: "18/05/2026", qr: "TC-2026-002", nguoiNhan: "Lê Thị D", tchnccNhan: "VPCC Nguyễn Văn B", nguoiGui: "Trần Văn A", tchnccGui: "VPCC Trần Văn A", noiDung: "Đối chiếu nội dung hợp đồng thế chấp.", phuongThuc: "email", trangThai: "Đã xác nhận", thoiGianHieuLuc: 60, fileName: "VBCCDT_101_2026.pdf" },
  { id: "YC-2026-0003", thoiGianGui: "18/07/2026 16:00", soCC: "205/2026/HĐ", ngayCC: "22/06/2026", qr: "TC-2026-003", nguoiNhan: "Phạm Văn E", tchnccNhan: "VPCC Rạch Giá", nguoiGui: "Trần Văn A", tchnccGui: "VPCC Trần Văn A", noiDung: "Xác minh chủ sở hữu căn hộ.", phuongThuc: "tchncc", trangThai: "Từ chối", lyDoTuChoi: "Không đủ căn cứ xác minh, đề nghị bổ sung văn bản ủy quyền.", fileName: "VBCCDT_205_2026.pdf" },
  { id: "YC-2026-0004", thoiGianGui: "16/07/2026 10:05", soCC: "100/2026/HĐ", ngayCC: "15/05/2026", qr: "TC-2026-001", nguoiNhan: "Nguyễn Văn B", tchnccNhan: "VPCC Nguyễn Văn B", nguoiGui: "Trần Văn A", tchnccGui: "VPCC Trần Văn A", noiDung: "Tra cứu lịch sử giao dịch.", phuongThuc: "tchncc", trangThai: "Hết thời gian", thoiGianHieuLuc: 60, fileName: "VBCCDT_100_2026.pdf" },
]

let reqSeq = 4
const pad = (n: number) => String(n).padStart(2, "0")
function nowStr() {
  const d = new Date()
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// BR-04: mỗi VBCCĐT chỉ có tối đa 1 yêu cầu đang hoạt động (Chờ xác nhận / Đã xác nhận).
export const hasActiveRequest = (qr: string) => REQUESTS.some((r) => r.qr === qr && (r.trangThai === "Chờ xác nhận" || r.trangThai === "Đã xác nhận"))

export function createRequest(v: VbccdtRecord, participant: Participant, method: SendMethod, noiDung: string): ReferenceRequest {
  reqSeq += 1
  const req: ReferenceRequest = {
    id: `YC-2026-${String(reqSeq).padStart(4, "0")}`,
    thoiGianGui: nowStr(), soCC: v.soCC, ngayCC: v.ngayCC, qr: v.qr,
    nguoiNhan: method === "email" ? participant.hoTen : v.ccv, tchnccNhan: v.tchncc,
    nguoiGui: CUR_CCV, tchnccGui: CUR_TCHNCC, noiDung, phuongThuc: method, trangThai: "Chờ xác nhận", fileName: v.fileName,
  }
  REQUESTS.unshift(req)
  return req
}
export function approveRequest(id: string, minutes: number) {
  const r = REQUESTS.find((x) => x.id === id); if (!r) return
  r.trangThai = "Đã xác nhận"; r.thoiGianHieuLuc = minutes
}
export function rejectRequest(id: string, lyDo: string) {
  const r = REQUESTS.find((x) => x.id === id); if (!r) return
  r.trangThai = "Từ chối"; r.lyDoTuChoi = lyDo
}
export function cancelRequest(id: string) {
  const i = REQUESTS.findIndex((x) => x.id === id); if (i >= 0) REQUESTS.splice(i, 1)
}
export const findRequest = (id?: string) => REQUESTS.find((r) => r.id === id)

/* ============================ LỊCH SỬ XEM FILE ============================ */
export const VIEW_LOGS: ViewLog[] = [
  { id: "VL1", thoiGianXem: "10:30 15/07/2026", soCC: "100/2026/HĐ", ip: "192.168.1.10", maYeuCau: "YC-2026-0002", nguoiGui: "Trần Văn A", tchnccGui: "VPCC Nguyễn Văn B" },
  { id: "VL2", thoiGianXem: "09:12 14/07/2026", soCC: "101/2026/HĐ", ip: "192.168.1.24", maYeuCau: "YC-2026-0002", nguoiGui: "Trần Văn A", tchnccGui: "VPCC Nguyễn Văn B" },
]

/* ============================ THỐNG KÊ ============================ */
export function stats() {
  return {
    den: REQUESTS.length,
    daXacNhan: REQUESTS.filter((r) => r.trangThai === "Đã xác nhận").length,
    tuChoi: REQUESTS.filter((r) => r.trangThai === "Từ chối").length,
    daXem: VIEW_LOGS.length,
  }
}
