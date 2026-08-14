import type { StatusMeta } from "../ingestion/shared"
import type { SourceInfo } from "../reconciliation/types"

export type Variant = "cleaning" | "normalization"
export type ProcStatus = "pending" | "processing" | "done" | "warn" | "error" | "cancelled"

export interface GroupCfg {
  key: string
  groupLabel: string
  /** srcKeys dùng cho nhóm này */
  srcKeys: string[]
  subtypes: [string, string][]
  fields: [string, string][]
}

export interface Process {
  id: string
  name: string
  type: string
  src: string
  status: ProcStatus
  total: number
  proc: number
  err: number
  rules: string
  createdAt: string
  batch: boolean
}

export interface RuleDef {
  id: string
  title: string
  configTitle: string
  cfgs: { label: string; value: string; ph?: string; ro: boolean }[]
}

export const ALL_SOURCES: Record<string, SourceInfo> = {
  NTPM_HN: { sys: "A", name: "Nền tảng công chứng — Hà Nội" },
  NTPM_TQ: { sys: "A", name: "Nền tảng công chứng — Toàn quốc" },
  PM_HCM: { sys: "B", name: "PM chuyển đổi CSDL — TP.HCM" },
  PM_DN: { sys: "B", name: "PM chuyển đổi CSDL — Đà Nẵng" },
  HSCDL_TP: { sys: "C", name: "Hệ thống cung cấp dữ liệu (HSCDL)" },
  THA_DS: { sys: "C1", name: "Cơ quan thi hành án dân sự" },
  DAT_DAI: { sys: "C2", name: "CSDL quốc gia về đất đai" },
}

export const PROC_STATUS: Record<ProcStatus, StatusMeta> = {
  pending: { label: "Chờ xử lý", bg: "#f5f5f5", fg: "#525252", dot: "#a3a3a3", bd: "#e5e5e5" },
  processing: { label: "Đang xử lý", bg: "#eff6ff", fg: "#1d4ed8", dot: "#3b82f6", bd: "#bfdbfe" },
  done: { label: "Hoàn thành", bg: "#f0fdf4", fg: "#15803d", dot: "#22c55e", bd: "#bbf7d0" },
  warn: { label: "Hoàn thành có cảnh báo", bg: "#fefce8", fg: "#a16207", dot: "#eab308", bd: "#fde68a" },
  error: { label: "Lỗi", bg: "#fef2f2", fg: "#b91c1c", dot: "#ef4444", bd: "#fecaca" },
  cancelled: { label: "Đã hủy", bg: "#f5f5f5", fg: "#737373", dot: "#d4d4d4", bd: "#e5e5e5" },
}

// Cấu hình 9 nhóm dữ liệu (dùng chung B3.1/B3.3, key trùng nav slug)
export const GROUPS: Record<string, GroupCfg> = {
  gdcc: { key: "gdcc", groupLabel: "Loại giao dịch công chứng", srcKeys: ["NTPM_HN", "NTPM_TQ", "PM_HCM", "PM_DN"], subtypes: [["UC0718", "HĐ mua bán, thuê mua nhà ở"], ["UC0722", "HĐ chuyển nhượng QSDĐ"], ["UC0725", "Văn bản thừa kế nhà ở"], ["UC0730", "Văn bản ủy quyền"], ["UC0740", "Các giao dịch khác"]], fields: [["SoCongChung", "string"], ["NgayCongChung", "date"], ["LoaiGiaoDichCongChung", "enum"], ["TenGiaoDichCongChung", "string"], ["CongChungVien", "string"], ["ToChucCongChung", "string"], ["DiaDiemCongChung", "string"], ["MaDDGiaoDich", "string"]] },
  "ben-lien-quan": { key: "ben-lien-quan", groupLabel: "Bên liên quan tham gia GDCC", srcKeys: ["NTPM_HN", "NTPM_TQ", "PM_HCM", "PM_DN"], subtypes: [["UC0741", "Cá nhân tham gia GDCC"], ["UC0742", "Tổ chức tham gia GDCC"]], fields: [["HoTen", "string"], ["SoDinhDanh", "string"], ["NgaySinh", "date"], ["DiaChi", "string"], ["VaiTro", "enum"], ["QuocTich", "enum"]] },
  "tai-san": { key: "tai-san", groupLabel: "Tài sản hình thành từ GDCC", srcKeys: ["NTPM_HN", "NTPM_TQ", "PM_HCM", "PM_DN"], subtypes: [["UC0743", "Tài sản là đất"], ["UC0744", "Nhà ở"], ["UC0745", "Căn hộ chung cư"], ["UC0748", "Ô tô"], ["UC0756", "Tài sản khác"]], fields: [["LoaiTaiSan", "enum"], ["SoGiayChungNhan", "string"], ["DiaChiTaiSan", "string"], ["DienTich", "number"], ["GiaTri", "number"], ["BienSo", "string"]] },
  "ngan-chan-pmcd": { key: "ngan-chan-pmcd", groupLabel: "Ngăn chặn / CB rủi ro từ PMCD", srcKeys: ["PM_HCM", "PM_DN"], subtypes: [["UC0757", "Thông tin ngăn chặn"], ["UC0758", "Cảnh báo rủi ro"], ["UC0759", "Giải tỏa ngăn chặn"]], fields: [["SoQuyetDinh", "string"], ["CoQuanBanHanh", "string"], ["NgayBanHanh", "date"], ["DoiTuong", "string"], ["TinhTrang", "enum"]] },
  "ngan-chan-hscdl": { key: "ngan-chan-hscdl", groupLabel: "Ngăn chặn / CB rủi ro từ HSCDL", srcKeys: ["THA_DS", "DAT_DAI"], subtypes: [["UC0760", "Tài sản thi hành án"], ["UC0761", "Ngăn chặn quyền"], ["UC0762", "Thành phần ngăn chặn quyền"], ["UC0763", "GCN thu hồi / hủy"]], fields: [["SoQuyetDinh", "string"], ["CoQuanBanHanh", "string"], ["NgayBanHanh", "date"], ["DoiTuong", "string"], ["TinhTrang", "enum"]] },
  "to-chuc-hanh-nghe": { key: "to-chuc-hanh-nghe", groupLabel: "Tổ chức hành nghề công chứng", srcKeys: ["HSCDL_TP"], subtypes: [["UC0510", "Thông tin tổ chức hành nghề công chứng"]], fields: [["MaToChuc", "string"], ["TenToChuc", "string"], ["DiaChi", "string"], ["NguoiDaiDien", "string"], ["TinhTrang", "enum"]] },
  "cong-chung-vien": { key: "cong-chung-vien", groupLabel: "Công chứng viên từ HSCDL", srcKeys: ["HSCDL_TP"], subtypes: [["UC0765", "Thông tin công chứng viên"], ["UC0766", "Thẻ công chứng viên"]], fields: [["HoTen", "string"], ["SoThe", "string"], ["NgayCap", "date"], ["ToChucHanhNghe", "string"], ["TinhTrang", "enum"]] },
  "ho-so": { key: "ho-so", groupLabel: "Hồ sơ công chứng", srcKeys: ["NTPM_HN", "PM_HCM", "HSCDL_TP"], subtypes: [["UC0767", "Văn bản công chứng"], ["UC0791", "Văn bản sửa lỗi kỹ thuật"], ["UC0792", "Tài liệu công chứng liên quan"]], fields: [["SoHoSo", "string"], ["SoCongChung", "string"], ["LoaiVanBan", "enum"], ["NgayLap", "date"], ["TrangThai", "enum"]] },
  "danh-muc": { key: "danh-muc", groupLabel: "Danh mục", srcKeys: ["HSCDL_TP"], subtypes: [["UC0793", "Danh mục loại GDCC"], ["UC0796", "Danh mục tỉnh/thành phố"], ["UC0799", "Danh mục quốc tịch"], ["UC0805", "Danh mục khác"]], fields: [["MaMuc", "string"], ["TenMuc", "string"], ["MaCha", "string"], ["ThuTu", "number"], ["TrangThai", "enum"]] },
}

// Prefix mã tiến trình theo variant + nhóm
const PREFIX_SUFFIX: Record<string, string> = {
  gdcc: "GDCC", "ben-lien-quan": "BLQ", "tai-san": "TS", "ngan-chan-pmcd": "NCP", "ngan-chan-hscdl": "NCH",
  "to-chuc-hanh-nghe": "TCHNCC", "cong-chung-vien": "CCV", "ho-so": "HS", "danh-muc": "DM",
}
export const jobPrefix = (variant: Variant, groupKey: string) => `${variant === "cleaning" ? "LS" : "CH"}-${PREFIX_SUFFIX[groupKey]}`

export const CLEANING_RULES: RuleDef[] = [
  { id: "r1", title: "R1. Kiểm tra quy tắc về chuẩn định dạng", configTitle: "Cấu hình định dạng", cfgs: [{ label: "Định dạng ngày tháng", value: "dd/MM/yyyy", ro: true }, { label: "Pattern Regex (tùy chọn)", value: "", ph: "^[0-9]{1,10}$", ro: false }] },
  { id: "r2", title: "R2. Kiểm tra tính hợp lệ của dữ liệu", configTitle: "Cấu hình kiểm tra hợp lệ", cfgs: [{ label: "Kiểu dữ liệu", value: "Văn bản", ro: true }, { label: "Giá trị tối thiểu", value: "1", ro: false }, { label: "Giá trị tối đa", value: "500", ro: false }] },
  { id: "r3", title: "R3. Xử lý giá trị thiếu dữ liệu", configTitle: "Cấu hình xử lý giá trị thiếu", cfgs: [{ label: "Cách xử lý", value: "Đánh dấu lỗi (bỏ qua bản ghi)", ro: true }] },
  { id: "r4", title: "R4. Loại bỏ hoặc thay thế giá trị ngoại lệ", configTitle: "Cấu hình xử lý ngoại lệ", cfgs: [{ label: "Điều kiện ngoại lệ", value: "Khoảng trắng thừa", ro: true }, { label: "Hành động", value: "Trim / chuẩn hóa", ro: true }] },
]

export const NORMALIZATION_RULES: RuleDef[] = [
  { id: "n1", title: "N1. Kiểm tra đối sánh tồn tại dựa trên trường khóa", configTitle: "Cấu hình kiểm tra trường khóa", cfgs: [{ label: "Bảng tham chiếu", value: "GiaoDichCongChung", ro: true }, { label: "Hành động khi không tồn tại", value: "Từ chối bản ghi", ro: true }] },
  { id: "n2", title: "N2. Xử lý trùng lặp", configTitle: "Cấu hình xử lý trùng lặp", cfgs: [{ label: "Phương thức xử lý", value: "Giữ bản ghi đầu tiên", ro: true }, { label: "Phân biệt chữ hoa/thường", value: "Không", ro: true }] },
  { id: "n3", title: "N3. Xử lý vi phạm ràng buộc thuộc tính tham chiếu", configTitle: "Cấu hình kiểm tra ràng buộc", cfgs: [{ label: "Loại ràng buộc", value: "Foreign Key", ro: true }, { label: "Hành động vi phạm", value: "Từ chối bản ghi", ro: true }] },
]

interface Shape {
  st: ProcStatus
  total: number
  proc: number
  err: number
  rules: string
  batch?: boolean
}
const SHAPES: Shape[] = [
  { st: "processing", total: 15000, proc: 11250, err: 0, rules: "25/25" },
  { st: "done", total: 8500, proc: 8500, err: 0, rules: "18/18" },
  { st: "error", total: 12000, proc: 0, err: 0, rules: "20/20", batch: true },
  { st: "warn", total: 9800, proc: 9788, err: 12, rules: "22/22" },
  { st: "pending", total: 5000, proc: 0, err: 0, rules: "0/15" },
  { st: "done", total: 3200, proc: 3200, err: 0, rules: "15/15" },
  { st: "cancelled", total: 7000, proc: 2100, err: 0, rules: "19/19" },
  { st: "warn", total: 14200, proc: 14150, err: 50, rules: "24/24" },
  { st: "processing", total: 6400, proc: 1920, err: 0, rules: "17/17" },
  { st: "done", total: 2100, proc: 2100, err: 0, rules: "12/12" },
  { st: "done", total: 990, proc: 990, err: 0, rules: "14/14" },
  { st: "error", total: 4500, proc: 1200, err: 8, rules: "21/21" },
  { st: "done", total: 6700, proc: 6700, err: 0, rules: "16/16" },
  { st: "pending", total: 1500, proc: 0, err: 0, rules: "0/13" },
]
const TIMES = ["10/12/2024 08:30", "09/12/2024 16:45", "09/12/2024 14:15", "08/12/2024 11:20", "08/12/2024 09:00", "07/12/2024 15:30", "07/12/2024 10:10", "06/12/2024 17:05", "06/12/2024 08:40", "05/12/2024 14:00", "04/12/2024 09:25", "03/12/2024 16:50", "02/12/2024 11:15", "01/12/2024 08:05"]

export function buildProcesses(variant: Variant, cfg: GroupCfg): Process[] {
  const prefix = jobPrefix(variant, cfg.key)
  const verb = variant === "cleaning" ? "Làm sạch" : "Chuẩn hóa"
  return SHAPES.map((sh, i) => {
    const st = cfg.subtypes[i % cfg.subtypes.length]
    const src = cfg.srcKeys[i % cfg.srcKeys.length]
    const seq = ("000" + (42 - i * 3)).slice(-4)
    return { id: `${prefix}-${seq}`, name: `${verb} ${st[1].toLowerCase()} — đợt ${14 - i}`, type: st[0], src, status: sh.st, total: sh.total, proc: sh.proc, err: sh.err, rules: sh.rules, createdAt: TIMES[i], batch: !!sh.batch }
  })
}

export const nf = (n: number) => n.toLocaleString("vi-VN")
