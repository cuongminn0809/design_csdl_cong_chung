import { fmtVN } from "./config"

/* ============================ NGỮ CẢNH ============================ */
export const DS_ORG = "VPCC Nguyễn Văn A"
export const DS_CCV_ACCOUNT = "nva" // tài khoản CCV đang đăng nhập (vai trò "ccv")
export const DS_CCVS = [
  { name: "Nguyễn Văn A", account: "nva" },
  { name: "Trần Thị Bích", account: "bichtth" },
  { name: "Lê Văn Cường", account: "cuonglv" },
]
export const ccvLabel = (name: string, account: string) => `${name} (${account})`

/* ============================ TAB ============================ */
export type DSTab = "ngan-chan" | "tai-san" | "tchncc" | "ccv"
export const DS_TABS: { key: DSTab; label: string; placeholder: string; file: string }[] = [
  { key: "ngan-chan", label: "Ngăn chặn và Cảnh báo rủi ro", placeholder: "Nhập CMND, Số GCN, tên...", file: "DoiSoatTraCuu_NganChan_CBRR" },
  { key: "tai-san", label: "Tài sản giao dịch", placeholder: "Số GCN, Biển số, Thửa đất...", file: "DoiSoatTraCuu_TaiSan" },
  { key: "tchncc", label: "Tổ chức hành nghề công chứng", placeholder: "Tên TCHNCC, Mã số...", file: "DoiSoatTraCuu_TCHNCC" },
  { key: "ccv", label: "Công chứng viên", placeholder: "Số thẻ CCV, Họ tên...", file: "DoiSoatTraCuu_CongChungVien" },
]

/* ============================ TRẠNG THÁI KẾT QUẢ ============================ */
export type DSStatus = "co-du-lieu" | "khong-du-lieu" | "loi"
export const DS_STATUSES: { key: DSStatus; label: string }[] = [
  { key: "co-du-lieu", label: "Thành công (Có dữ liệu)" },
  { key: "khong-du-lieu", label: "Thành công (Không dữ liệu)" },
  { key: "loi", label: "Thất bại / Lỗi" },
]
export const DS_STATUS_META: Record<DSStatus, { label: string; badge: string; dot: string }> = {
  "co-du-lieu": { label: "Thành công", badge: "border-[#a7f3d0] bg-[#ecfdf5] text-[#047857]", dot: "#10b981" },
  "khong-du-lieu": { label: "Thành công", badge: "border-border bg-neutral-100 text-foreground-muted", dot: "#64748b" },
  "loi": { label: "Thất bại / Lỗi", badge: "border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]", dot: "#ef4444" },
}

/* ============================ MASKING (BR-A6-05) ============================ */
export function maskKeyword(raw: string): string {
  if (!raw) return ""
  if (raw.length <= 1) return "*"
  if (raw.length === 2) return raw[0] + "*"
  return raw[0] + "*".repeat(raw.length - 2) + raw[raw.length - 1]
}

/* ============================ BẢN GHI NHẬT KÝ TRA CỨU ============================ */
export interface LookupLog {
  tab: DSTab
  thoiDiem: string; thoiDiemISO: string // "YYYY-MM-DD HH:mm:ss" dạng ISO ngày để lọc + hiển thị
  ccvName: string; ccvAccount: string
  tuKhoaRaw: string; tuKhoaPrefix: "Từ khóa" | "Bộ lọc"
  status: DSStatus
  soNganChan?: number; soCBRR?: number // chỉ tab ngan-chan
  soLuong?: number // các tab còn lại
  toChuc: string; ccv: string // dùng cho scopeRows (toChuc = TCHNCC quản lý, ccv = tên CCV thực hiện)
}

const log = (
  tab: DSTab, thoiDiem: string, ccvName: string, ccvAccount: string,
  tuKhoaRaw: string, prefix: "Từ khóa" | "Bộ lọc", status: DSStatus,
  extra: { soNganChan?: number; soCBRR?: number; soLuong?: number },
): LookupLog => {
  const iso = thoiDiem.slice(0, 10)
  return { tab, thoiDiem: `${fmtVN(iso)} ${thoiDiem.slice(11)}`, thoiDiemISO: thoiDiem, ccvName, ccvAccount, tuKhoaRaw, tuKhoaPrefix: prefix, status, toChuc: DS_ORG, ccv: ccvName, ...extra }
}

export const LOOKUP_LOGS: LookupLog[] = [
  // Tab Ngăn chặn & CBRR
  log("ngan-chan", "2026-08-08 08:30:00", "Nguyễn Văn A", "nva", "Văn phòng công chứng Hạ Long số 1", "Từ khóa", "co-du-lieu", { soNganChan: 2, soCBRR: 0 }),
  log("ngan-chan", "2026-08-08 09:15:22", "Trần Thị Bích", "bichtth", "Sở Tư pháp Quảng Ninh", "Bộ lọc", "khong-du-lieu", { soNganChan: 0, soCBRR: 0 }),
  log("ngan-chan", "2026-08-08 10:05:10", "Nguyễn Văn A", "nva", "Văn phòng công chứng Hạ Long số 1", "Từ khóa", "co-du-lieu", { soNganChan: 0, soCBRR: 1 }),
  log("ngan-chan", "2026-08-06 18:45:00", "Nguyễn Văn A", "nva", "Sở Tư pháp Quảng Ninh", "Bộ lọc", "khong-du-lieu", { soNganChan: 0, soCBRR: 0 }),
  log("ngan-chan", "2026-08-05 10:12:00", "Nguyễn Văn A", "nva", "Văn phòng công chứng Hạ Long số 1", "Từ khóa", "loi", {}),
  log("ngan-chan", "2026-06-14 14:20:30", "Lê Văn Cường", "cuonglv", "0123456789012", "Từ khóa", "co-du-lieu", { soNganChan: 1, soCBRR: 1 }),
  // Tab Tài sản giao dịch
  log("tai-san", "2026-08-07 11:00:00", "Nguyễn Văn A", "nva", "30A-123.45", "Từ khóa", "co-du-lieu", { soLuong: 3 }),
  log("tai-san", "2026-08-05 15:40:12", "Trần Thị Bích", "bichtth", "Thửa đất số 78, tờ bản đồ 12", "Từ khóa", "co-du-lieu", { soLuong: 1 }),
  log("tai-san", "2026-07-22 09:05:00", "Nguyễn Văn A", "nva", "GCN-QSDĐ-004521", "Từ khóa", "khong-du-lieu", { soLuong: 0 }),
  log("tai-san", "2026-06-30 16:20:45", "Lê Văn Cường", "cuonglv", "29B1-456.78", "Từ khóa", "loi", {}),
  // Tab Tổ chức HNCC
  log("tchncc", "2026-08-04 08:50:00", "Nguyễn Văn A", "nva", "Văn phòng công chứng Bến Thành", "Từ khóa", "co-du-lieu", { soLuong: 1 }),
  log("tchncc", "2026-07-18 13:10:20", "Trần Thị Bích", "bichtth", "0312345678", "Từ khóa", "khong-du-lieu", { soLuong: 0 }),
  log("tchncc", "2026-05-09 10:00:00", "Nguyễn Văn A", "nva", "Văn phòng công chứng Sông Hàn", "Từ khóa", "co-du-lieu", { soLuong: 1 }),
  // Tab Công chứng viên
  log("ccv", "2026-08-03 09:25:00", "Nguyễn Văn A", "nva", "CCV-00219", "Từ khóa", "co-du-lieu", { soLuong: 1 }),
  log("ccv", "2026-07-27 14:55:30", "Lê Văn Cường", "cuonglv", "Trần Thị E", "Từ khóa", "khong-du-lieu", { soLuong: 0 }),
  log("ccv", "2026-06-11 08:15:00", "Nguyễn Văn A", "nva", "001234567890", "Từ khóa", "loi", {}),
]

/* ============================ ĐỊNH DẠNG SỐ LƯỢNG KẾT QUẢ (BR-A6-07) ============================ */
export function resultLabel(r: LookupLog): string {
  if (r.status === "loi") return "Không xác định"
  if (r.tab === "ngan-chan") return `${r.soNganChan ?? 0} ngăn chặn, ${r.soCBRR ?? 0} cảnh báo rủi ro`
  return String(r.soLuong ?? 0)
}

/* ============================ TÊN FILE XUẤT (BR-A6-04) ============================ */
export const exportDsFileName = (tab: DSTab, isLanhDao: boolean) => {
  const file = DS_TABS.find((t) => t.key === tab)!.file
  return `${file}_${isLanhDao ? "LanhDaoTCHNCC" : "CCV"}.xlsx`
}
