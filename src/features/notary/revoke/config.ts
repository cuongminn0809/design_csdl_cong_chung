import type { StatusMeta } from "../../ingestion/shared"
import { TRANSACTIONS, type Method, type Transaction } from "../config"

/** Trạng thái yêu cầu tuyên hủy (khác trạng thái hồ sơ GDCC gốc). */
export type RevokeStatus = "draft" | "pending" | "revise" | "approved"

/** Vai trò người dùng — dùng để mô phỏng Visibility Rules (CCV vs Trưởng TCHNCC). */
export type Role = "ccv" | "truong"

export const ROLE_LABEL: Record<Role, string> = {
  ccv: "Công chứng viên",
  truong: "Trưởng TCHNCC",
}

export const REVOKE_STATUS: Record<RevokeStatus, StatusMeta> = {
  draft: { label: "Lưu nháp", bg: "#f5f5f5", fg: "#525252", dot: "#a3a3a3", bd: "#e5e5e5" },
  pending: { label: "Chờ duyệt", bg: "#eff6ff", fg: "#1d4ed8", dot: "#3b82f6", bd: "#bfdbfe" },
  revise: { label: "Yêu cầu sửa", bg: "#fffbeb", fg: "#b45309", dot: "#f59e0b", bd: "#fde68a" },
  approved: { label: "Phê duyệt", bg: "#f0fdf4", fg: "#15803d", dot: "#22c55e", bd: "#bbf7d0" },
}

/** Bản ghi yêu cầu hủy — kế thừa dữ liệu bên liên quan / tài sản từ giao dịch gốc. */
export interface RevokeRequest {
  id: string
  sourceId: string // Id giao dịch gốc trong TRANSACTIONS
  method: Method
  status: RevokeStatus
  // Văn bản hủy
  soCC: string
  ngayCC: string
  createdAt: string
  toChuc: string
  ccv: string
  diaDiem: string
  noiDung: string
  phi: number
  thuLao: number
  ghiChu: string
  reviseReason?: string // lý do Trưởng TCHNCC yêu cầu sửa
  // Tài liệu đính kèm của văn bản hủy
  signedFile?: string // .pdf văn bản hủy (điện tử)
  scanFile?: string // bản scan văn bản hủy (giấy)
  signValid?: boolean
  hoSoKhac: string[]
}

/** Truy xuất giao dịch gốc của một yêu cầu hủy. */
export const getSource = (r: RevokeRequest): Transaction | undefined =>
  TRANSACTIONS.find((t) => t.id === r.sourceId)

const src = (id: string) => TRANSACTIONS.find((t) => t.id === id)!

export const REVOKE_REQUESTS: RevokeRequest[] = [
  {
    id: "VBH-99-2026", sourceId: "PAP-99-2026", method: "paper", status: "approved",
    soCC: "99/2026/VBH", ngayCC: "10/07/2026", createdAt: "10/07/2026 09:22:10",
    toChuc: src("PAP-99-2026").toChuc, ccv: "Dương Minh Diển", diaDiem: "Văn phòng công chứng Rạch Giá",
    noiDung: "Hủy hợp đồng thế chấp quyền sử dụng đất do các bên thỏa thuận chấm dứt.",
    phi: 500_000, thuLao: 200_000, ghiChu: "Đã thống nhất giữa các bên.",
    scanFile: "VanBanHuy_99.pdf", hoSoKhac: ["ThoaThuanHuy_BenA.pdf"],
  },
  {
    id: "VBH-96-2026", sourceId: "ELE-96-2026", method: "electronic", status: "approved",
    soCC: "96/2026/VBH", ngayCC: "08/07/2026", createdAt: "08/07/2026 15:40:00",
    toChuc: src("ELE-96-2026").toChuc, ccv: "Nguyễn B", diaDiem: "Văn phòng công chứng Kiên Giang",
    noiDung: "Hủy hợp đồng thế chấp căn hộ chung cư sau khi tất toán khoản vay.",
    phi: 450_000, thuLao: 180_000, ghiChu: "",
    signedFile: "VanBanHuy_96.pdf", signValid: true, hoSoKhac: ["XacNhanTatToan.pdf"],
  },
  {
    id: "VBH-105-2026", sourceId: "ELE-105-2026", method: "electronic", status: "pending",
    soCC: "105/2026/VBH", ngayCC: "12/07/2026", createdAt: "12/07/2026 11:05:33",
    toChuc: src("ELE-105-2026").toChuc, ccv: "Nguyễn B", diaDiem: "Văn phòng công chứng Rạch Giá",
    noiDung: "Hủy hợp đồng mua bán nhà đất do phát sinh tranh chấp giữa các bên.",
    phi: 600_000, thuLao: 250_000, ghiChu: "Trình Trưởng TCHNCC phê duyệt.",
    signedFile: "VanBanHuy_105.pdf", signValid: true, hoSoKhac: [],
  },
  {
    id: "VBH-102-2026", sourceId: "PAP-102-2026", method: "paper", status: "revise",
    soCC: "102/2026/VBH", ngayCC: "11/07/2026", createdAt: "11/07/2026 08:30:00",
    toChuc: src("PAP-102-2026").toChuc, ccv: "Dương Minh Diển", diaDiem: "Văn phòng công chứng Rạch Giá",
    noiDung: "Hủy hợp đồng thế chấp quyền sử dụng đất.",
    phi: 500_000, thuLao: 200_000, ghiChu: "",
    reviseReason: "Thiếu file đính kèm văn bản hủy, đề nghị bổ sung bản scan có chữ ký công chứng viên.",
    scanFile: "", hoSoKhac: [],
  },
  {
    id: "VBH-101-2026", sourceId: "PAP-101-2026", method: "paper", status: "draft",
    soCC: "101/2026/VBH", ngayCC: "11/07/2026", createdAt: "11/07/2026 16:12:45",
    toChuc: src("PAP-101-2026").toChuc, ccv: "Nguyễn A", diaDiem: "Văn phòng công chứng Rạch Giá",
    noiDung: "Hủy văn bản ủy quyền định đoạt tài sản là xe ô tô.",
    phi: 200_000, thuLao: 100_000, ghiChu: "Bản nháp.",
    scanFile: "", hoSoKhac: [],
  },
  {
    id: "VBH-104-2026", sourceId: "ELE-104-2026", method: "electronic", status: "approved",
    soCC: "104/2026/VBH", ngayCC: "09/07/2026", createdAt: "09/07/2026 10:00:00",
    toChuc: src("ELE-104-2026").toChuc, ccv: "Nguyễn B", diaDiem: "Văn phòng công chứng Rạch Giá",
    noiDung: "Hủy hợp đồng tặng cho căn hộ chung cư.",
    phi: 400_000, thuLao: 150_000, ghiChu: "",
    signedFile: "VanBanHuy_104.pdf", signValid: true, hoSoKhac: ["VanBanThoaThuan.pdf"],
  },
]

/** Trạng thái tuyên hủy hiện hành của một giao dịch gốc (dùng cho BR010/BR011). */
export function revokeStateOf(sourceId: string): "none" | "pending" | "revoked" {
  const list = REVOKE_REQUESTS.filter((r) => r.sourceId === sourceId)
  if (list.some((r) => r.status === "approved")) return "revoked"
  if (list.some((r) => r.status === "draft" || r.status === "pending" || r.status === "revise")) return "pending"
  return "none"
}

export const revokeById = (id?: string) => REVOKE_REQUESTS.find((r) => r.id === id)
