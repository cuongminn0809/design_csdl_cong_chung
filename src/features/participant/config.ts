import type { StatusMeta } from "../ingestion/shared"

/* ============================ VAI TRÒ (BR-01) ============================ */
export type PartRole = "ld_bo" | "cv_btp" | "cv_stp" | "ld_stp" | "ld_tchncc"
type Level = "bo" | "so" | "tchncc"
export const PART_ROLES: { key: PartRole; label: string; level: Level }[] = [
  { key: "ld_bo", label: "Lãnh đạo Bộ Tư pháp", level: "bo" },
  { key: "cv_btp", label: "Chuyên viên BTP", level: "bo" },
  { key: "cv_stp", label: "Chuyên viên Sở Tư pháp", level: "so" },
  { key: "ld_stp", label: "Lãnh đạo phòng chuyên môn STP", level: "so" },
  { key: "ld_tchncc", label: "Lãnh đạo TCHNCC", level: "tchncc" },
]
const LEVEL: Record<PartRole, Level> = Object.fromEntries(PART_ROLES.map((r) => [r.key, r.level])) as Record<PartRole, Level>
export const isBoLevel = (r: PartRole) => LEVEL[r] === "bo"
// Phạm vi dữ liệu mô phỏng: Bộ→toàn quốc; Sở→TP Hà Nội; TCHNCC→VPCC Nguyễn Văn A.
const STP_PROVINCE = "TP Hà Nội"
const TCHNCC_ORG = "VPCC Nguyễn Văn A"
export function scopePool(rows: Participant[], role: PartRole): Participant[] {
  const lv = LEVEL[role]
  if (lv === "bo") return rows
  if (lv === "so") return rows.filter((r) => r.tinh === STP_PROVINCE)
  return rows.filter((r) => r.tchncc === TCHNCC_ORG)
}
// Nhãn phạm vi (T07 lịch sử).
export const scopeLabel = (role: PartRole) => (LEVEL[role] === "bo" ? "Toàn quốc" : LEVEL[role] === "so" ? STP_PROVINCE : TCHNCC_ORG)
// BR-04/BR-05: quyền xem chi tiết GDCC / văn bản. Mô phỏng: TCHNCC chỉ xem giao dịch cùng tổ chức.
export const canViewGdcc = (role: PartRole, sameOrg: boolean) => (LEVEL[role] === "tchncc" ? sameOrg : true)

/* ============================ DANH MỤC ============================ */
export const BEN_LIEN_QUAN = [
  "Bên mua/Bên nhận chuyển nhượng", "Bên bán/Bên chuyển nhượng", "Bên thế chấp",
  "Bên nhận thế chấp", "Bên ủy quyền", "Bên nhận ủy quyền", "Khác",
]
export const PROVINCES = ["TP Hà Nội", "TP Hồ Chí Minh", "TP Đà Nẵng", "Tỉnh Kiên Giang"]
export const TCHNCC_OPTIONS = ["VPCC Nguyễn Văn A", "VPCC Nguyễn Văn B", "VPCC Bến Thành", "VPCC Sông Hàn", "VPCC Rạch Giá"]
export const CCV_OPTIONS = ["Trần Thị C", "Lê Văn C", "Nguyễn Văn B", "Phạm Văn E", "Đỗ Thị H"]

export const TXN_STATUS: Record<string, StatusMeta> = {
  "Đã công chứng": { label: "Đã công chứng", bg: "#ecfdf5", fg: "#047857", dot: "#10b981", bd: "#a7f3d0" },
  "Đã hủy": { label: "Đã hủy", bg: "#fef2f2", fg: "#b91c1c", dot: "#ef4444", bd: "#fecaca" },
}

/* ============================ KIỂU DỮ LIỆU ============================ */
export interface RelatedTxn {
  soCC: string; ngayCC: string; ngayCCISO: string; tenGD: string; benLienQuan: string
  ccv: string; tchncc: string; trangThai: string; sameOrg: boolean
}
export interface RelatedDoc { loaiVB: string; soCC: string; tenGD: string; ccv: string; tchncc: string; sameOrg: boolean }
export interface AccessLog { nguoi: string; donVi: string; ip: string; thoiGian: string }

export interface Participant {
  id: string
  loai: "Cá nhân" | "Tổ chức"
  hoTen: string
  soGiayTo: string          // CCCD/CMND/Hộ chiếu (cá nhân) hoặc MST (tổ chức)
  ngayCap: string           // Q05 Ngày cấp/Ngày đăng ký
  noiCap: string            // Q06 Nơi cấp/Cơ quan đăng ký
  gioiTinh: string          // Q07 (rỗng nếu tổ chức)
  ngaySinh: string          // Q08 Ngày sinh/Ngày thành lập
  soDienThoai: string       // Q09
  email: string             // Q10
  diaChi: string            // Q11/T05
  tinh: string              // BR-01 (F01)
  benLienQuan: string       // Q01 vai trò chính
  ccv: string               // F08
  tchncc: string            // F09/BR-01
  lienQuan: RelatedTxn[]
  vanBan: RelatedDoc[]
  nhatKy: AccessLog[]
}

// BR-10: giao dịch gần nhất = ngày CC lớn nhất; nếu trùng ngày → số CC lớn nhất.
const soCCNum = (s: string) => parseInt(s.replace(/\D.*$/, ""), 10) || 0
export function nearestTxn(p: Participant): RelatedTxn | null {
  if (!p.lienQuan.length) return null
  return [...p.lienQuan].sort((a, b) => (a.ngayCCISO === b.ngayCCISO ? soCCNum(b.soCC) - soCCNum(a.soCC) : b.ngayCCISO < a.ngayCCISO ? -1 : 1))[0]
}
export function nearestLabel(p: Participant): string {
  const t = nearestTxn(p)
  if (!t) return "—"
  const extra = p.lienQuan.length - 1
  return `${t.soCC} - ${t.ngayCC}${extra > 0 ? ` (và ${extra} giao dịch khác)` : ""}`
}

/* ============================ DỮ LIỆU MẪU ============================ */
const nk = (nguoi: string, donVi: string, ip: string, thoiGian: string): AccessLog => ({ nguoi, donVi, ip, thoiGian })

export const PARTICIPANTS: Participant[] = [
  {
    id: "P01", loai: "Cá nhân", hoTen: "Nguyễn Văn A", soGiayTo: "001234567890",
    ngayCap: "01/01/2020", noiCap: "Cục Cảnh sát ĐKQL cư trú", gioiTinh: "Nam", ngaySinh: "15/03/1985",
    soDienThoai: "0912345678", email: "nguyenvana@email.com", diaChi: "P. Dịch Vọng, Q. Cầu Giấy, TP. Hà Nội",
    tinh: "TP Hà Nội", benLienQuan: "Bên mua/Bên nhận chuyển nhượng", ccv: "Trần Thị C", tchncc: "VPCC Nguyễn Văn A",
    lienQuan: [
      // 2 giao dịch cùng ngày lớn nhất 18/05/2026 → chọn 152 (số CC lớn hơn)
      { soCC: "152/2026/HĐ", ngayCC: "18/05/2026", ngayCCISO: "2026-05-18", tenGD: "Hợp đồng chuyển nhượng QSDĐ", benLienQuan: "Bên mua/Bên nhận chuyển nhượng", ccv: "Trần Thị C", tchncc: "VPCC Nguyễn Văn A", trangThai: "Đã công chứng", sameOrg: true },
      { soCC: "100/2026/HĐ", ngayCC: "18/05/2026", ngayCCISO: "2026-05-18", tenGD: "Hợp đồng đặt cọc", benLienQuan: "Bên mua/Bên nhận chuyển nhượng", ccv: "Trần Thị C", tchncc: "VPCC Nguyễn Văn A", trangThai: "Đã công chứng", sameOrg: true },
      { soCC: "88/2026/HĐ", ngayCC: "10/05/2026", ngayCCISO: "2026-05-10", tenGD: "Hợp đồng thế chấp", benLienQuan: "Bên thế chấp", ccv: "Lê Văn C", tchncc: "VPCC Nguyễn Văn B", trangThai: "Đã công chứng", sameOrg: false },
    ],
    vanBan: [
      { loaiVB: "Văn bản công chứng", soCC: "152/2026/HĐ", tenGD: "Hợp đồng chuyển nhượng QSDĐ", ccv: "Trần Thị C", tchncc: "VPCC Nguyễn Văn A", sameOrg: true },
      { loaiVB: "Văn bản công chứng điện tử", soCC: "88/2026/HĐ", tenGD: "Hợp đồng thế chấp", ccv: "Lê Văn C", tchncc: "VPCC Nguyễn Văn B", sameOrg: false },
    ],
    nhatKy: [nk("Nguyễn Văn X", "Sở Tư pháp Hà Nội", "192.168.1.100", "21/07/2026 15:30:10"), nk("Trần Thị Y", "VPCC Nguyễn Văn A", "10.0.0.55", "20/07/2026 09:15:22")],
  },
  {
    id: "P02", loai: "Cá nhân", hoTen: "Trần Thị B", soGiayTo: "002345678901",
    ngayCap: "12/06/2019", noiCap: "Cục Cảnh sát ĐKQL cư trú", gioiTinh: "Nữ", ngaySinh: "22/09/1990",
    soDienThoai: "0987654321", email: "tranthib@email.com", diaChi: "P. Dịch Vọng Hậu, Q. Cầu Giấy, TP. Hà Nội",
    tinh: "TP Hà Nội", benLienQuan: "Bên bán/Bên chuyển nhượng", ccv: "Nguyễn Văn B", tchncc: "VPCC Nguyễn Văn B",
    lienQuan: [
      { soCC: "210/2026/HĐ", ngayCC: "02/06/2026", ngayCCISO: "2026-06-02", tenGD: "Hợp đồng mua bán căn hộ", benLienQuan: "Bên bán/Bên chuyển nhượng", ccv: "Nguyễn Văn B", tchncc: "VPCC Nguyễn Văn B", trangThai: "Đã công chứng", sameOrg: false },
    ],
    vanBan: [{ loaiVB: "Văn bản công chứng", soCC: "210/2026/HĐ", tenGD: "Hợp đồng mua bán căn hộ", ccv: "Nguyễn Văn B", tchncc: "VPCC Nguyễn Văn B", sameOrg: false }],
    nhatKy: [nk("Lê Văn Z", "Bộ Tư pháp", "172.16.0.100", "22/07/2026 16:45:03")],
  },
  {
    id: "P03", loai: "Tổ chức", hoTen: "Công ty CP Đầu tư XYZ", soGiayTo: "0101234567",
    ngayCap: "05/03/2018", noiCap: "Sở KH&ĐT TP. Hà Nội", gioiTinh: "", ngaySinh: "05/03/2018",
    soDienThoai: "02439998888", email: "info@xyz.com.vn", diaChi: "P. Trung Hòa, Q. Cầu Giấy, TP. Hà Nội",
    tinh: "TP Hà Nội", benLienQuan: "Bên nhận thế chấp", ccv: "Trần Thị C", tchncc: "VPCC Nguyễn Văn A",
    lienQuan: [
      { soCC: "175/2026/HĐ", ngayCC: "12/05/2026", ngayCCISO: "2026-05-12", tenGD: "Hợp đồng thế chấp tài sản", benLienQuan: "Bên nhận thế chấp", ccv: "Trần Thị C", tchncc: "VPCC Nguyễn Văn A", trangThai: "Đã công chứng", sameOrg: true },
    ],
    vanBan: [{ loaiVB: "Văn bản công chứng", soCC: "175/2026/HĐ", tenGD: "Hợp đồng thế chấp tài sản", ccv: "Trần Thị C", tchncc: "VPCC Nguyễn Văn A", sameOrg: true }],
    nhatKy: [nk("Nguyễn Văn X", "VPCC Nguyễn Văn A", "192.168.1.100", "19/07/2026 10:05:40")],
  },
  {
    id: "P04", loai: "Cá nhân", hoTen: "Lê Văn C", soGiayTo: "003456789012",
    ngayCap: "20/02/2021", noiCap: "Cục Cảnh sát ĐKQL cư trú", gioiTinh: "Nam", ngaySinh: "10/11/1978",
    soDienThoai: "0905112233", email: "levanc@email.com", diaChi: "P. Bến Nghé, Q.1, TP. Hồ Chí Minh",
    tinh: "TP Hồ Chí Minh", benLienQuan: "Bên ủy quyền", ccv: "Lê Văn C", tchncc: "VPCC Bến Thành",
    lienQuan: [
      { soCC: "301/2026/HĐ", ngayCC: "08/06/2026", ngayCCISO: "2026-06-08", tenGD: "Hợp đồng ủy quyền", benLienQuan: "Bên ủy quyền", ccv: "Lê Văn C", tchncc: "VPCC Bến Thành", trangThai: "Đã công chứng", sameOrg: false },
      { soCC: "260/2026/HĐ", ngayCC: "20/05/2026", ngayCCISO: "2026-05-20", tenGD: "Hợp đồng mua bán ô tô", benLienQuan: "Bên mua/Bên nhận chuyển nhượng", ccv: "Lê Văn C", tchncc: "VPCC Bến Thành", trangThai: "Đã hủy", sameOrg: false },
    ],
    vanBan: [{ loaiVB: "Văn bản công chứng điện tử", soCC: "301/2026/HĐ", tenGD: "Hợp đồng ủy quyền", ccv: "Lê Văn C", tchncc: "VPCC Bến Thành", sameOrg: false }],
    nhatKy: [nk("Phạm Văn E", "Sở Tư pháp TP.HCM", "10.0.1.20", "18/07/2026 08:20:11")],
  },
  {
    id: "P05", loai: "Cá nhân", hoTen: "Phạm Thị D", soGiayTo: "004567890123",
    ngayCap: "03/07/2020", noiCap: "Cục Cảnh sát ĐKQL cư trú", gioiTinh: "Nữ", ngaySinh: "30/12/1995",
    soDienThoai: "0918223344", email: "phamthid@email.com", diaChi: "P. Vĩnh Bảo, TP. Rạch Giá, Tỉnh Kiên Giang",
    tinh: "Tỉnh Kiên Giang", benLienQuan: "Bên nhận ủy quyền", ccv: "Phạm Văn E", tchncc: "VPCC Rạch Giá",
    lienQuan: [
      { soCC: "120/2026/HĐ", ngayCC: "12/05/2026", ngayCCISO: "2026-05-12", tenGD: "Hợp đồng ủy quyền định đoạt tài sản", benLienQuan: "Bên nhận ủy quyền", ccv: "Phạm Văn E", tchncc: "VPCC Rạch Giá", trangThai: "Đã công chứng", sameOrg: false },
    ],
    vanBan: [{ loaiVB: "Văn bản công chứng", soCC: "120/2026/HĐ", tenGD: "Hợp đồng ủy quyền định đoạt tài sản", ccv: "Phạm Văn E", tchncc: "VPCC Rạch Giá", sameOrg: false }],
    nhatKy: [nk("Nguyễn Văn X", "VPCC Rạch Giá", "10.0.2.30", "17/07/2026 15:40:55")],
  },
  {
    id: "P06", loai: "Tổ chức", hoTen: "Công ty TNHH Thương mại Đại Phát", soGiayTo: "0312345678-001",
    ngayCap: "18/09/2016", noiCap: "Sở KH&ĐT TP. Đà Nẵng", gioiTinh: "", ngaySinh: "18/09/2016",
    soDienThoai: "02363667788", email: "contact@daiphat.vn", diaChi: "P. Hải Châu 1, Q. Hải Châu, TP. Đà Nẵng",
    tinh: "TP Đà Nẵng", benLienQuan: "Bên bán/Bên chuyển nhượng", ccv: "Đỗ Thị H", tchncc: "VPCC Sông Hàn",
    lienQuan: [
      { soCC: "205/2026/HĐ", ngayCC: "05/06/2026", ngayCCISO: "2026-06-05", tenGD: "Hợp đồng chuyển nhượng dự án", benLienQuan: "Bên bán/Bên chuyển nhượng", ccv: "Đỗ Thị H", tchncc: "VPCC Sông Hàn", trangThai: "Đã công chứng", sameOrg: false },
    ],
    vanBan: [{ loaiVB: "Văn bản công chứng", soCC: "205/2026/HĐ", tenGD: "Hợp đồng chuyển nhượng dự án", ccv: "Đỗ Thị H", tchncc: "VPCC Sông Hàn", sameOrg: false }],
    nhatKy: [nk("Trần Thị Y", "Sở Tư pháp Đà Nẵng", "10.0.1.77", "16/07/2026 11:12:30")],
  },
]

/* ============================ LỊCH SỬ TRA CỨU (SCR-A.5.10-02) ============================ */
export interface PartSearchLog { nguoi: string; donVi: string; tuKhoa: string; thoiGian: string; thoiGianISO: string; soKQ: number; phamVi: string; ip: string }
export const SEARCH_LOGS: PartSearchLog[] = [
  { nguoi: "Nguyễn Văn A", donVi: "VPCC Nguyễn Văn A", tuKhoa: "CCCD: 001234567890", thoiGian: "21/07/2026 15:30:10", thoiGianISO: "2026-07-21", soKQ: 5, phamVi: "Toàn quốc", ip: "192.168.1.100" },
  { nguoi: "Trần Thị B", donVi: "Sở Tư pháp Hà Nội", tuKhoa: "Họ tên: Lê Văn C", thoiGian: "20/07/2026 09:15:22", thoiGianISO: "2026-07-20", soKQ: 12, phamVi: "TP. Hà Nội", ip: "10.0.0.55" },
  { nguoi: "Lê Văn Z", donVi: "Bộ Tư pháp", tuKhoa: "MST: 0101234567", thoiGian: "22/07/2026 16:45:03", thoiGianISO: "2026-07-22", soKQ: 3, phamVi: "Toàn quốc", ip: "172.16.0.100" },
]

/* ============================ HELPERS ============================ */
export const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/\s+/g, " ").trim()

// VR-04: CCCD 12 số | CMND 9 số | Hộ chiếu 6-9 ký tự chữ/số.
export const isValidCccd = (s: string) => /^\d{12}$/.test(s) || /^\d{9}$/.test(s) || /^[A-Za-z0-9]{6,9}$/.test(s)
// VR-05: MST 10 số hoặc 10 số-3 số.
export const isValidMst = (s: string) => /^\d{10}$/.test(s) || /^\d{10}-\d{3}$/.test(s)

export interface PartFilter {
  phamVi: "national" | "province"; tinh: string
  loai: "all" | "Cá nhân" | "Tổ chức"
  cccd: string; mst: string; hoTen: string; soCC: string; benLienQuan: string
  ccv: string; tchncc: string; tuNgay: string; denNgay: string
}
export const EMPTY_FILTER: PartFilter = {
  phamVi: "national", tinh: "all", loai: "all",
  cccd: "", mst: "", hoTen: "", soCC: "", benLienQuan: "all",
  ccv: "all", tchncc: "all", tuNgay: "", denNgay: "",
}

// VR-01: tối thiểu một trong F03-F06.
export const hasCriteria = (f: PartFilter): boolean => [f.cccd, f.mst, f.hoTen, f.soCC].some((v) => v.trim().length > 0)

export function searchParticipants(pool: Participant[], f: PartFilter, isBo: boolean): Participant[] {
  const inc = (hay: string, kw: string) => norm(hay).includes(norm(kw)) // BR-09
  const rows = pool.filter((r) => {
    if (f.loai !== "all" && r.loai !== f.loai) return false
    if (f.cccd.trim() && r.soGiayTo.trim() !== f.cccd.trim()) return false // F03 tuyệt đối
    if (f.mst.trim() && r.soGiayTo.trim() !== f.mst.trim()) return false   // F04 tuyệt đối
    if (f.hoTen.trim() && !inc(r.hoTen, f.hoTen)) return false             // F05 tương đối
    if (f.soCC.trim() && !r.lienQuan.some((t) => inc(t.soCC, f.soCC))) return false // F06 tương đối
    if (f.benLienQuan !== "all" && r.benLienQuan !== f.benLienQuan) return false
    if (f.ccv !== "all" && r.ccv !== f.ccv) return false
    if (f.tchncc !== "all" && r.tchncc !== f.tchncc) return false
    if (f.tuNgay && !r.lienQuan.some((t) => t.ngayCCISO >= f.tuNgay)) return false
    if (f.denNgay && !r.lienQuan.some((t) => t.ngayCCISO <= f.denNgay)) return false
    if (isBo && f.phamVi === "province" && f.tinh !== "all" && r.tinh !== f.tinh) return false
    return true
  })
  // BR-10: sắp xếp theo ngày giao dịch gần nhất giảm dần; trùng ngày → họ tên tăng dần.
  return rows.sort((a, b) => {
    const da = nearestTxn(a)?.ngayCCISO ?? ""
    const db = nearestTxn(b)?.ngayCCISO ?? ""
    if (da !== db) return db < da ? -1 : 1
    return a.hoTen.localeCompare(b.hoTen, "vi")
  })
}

export function describeCriteria(f: PartFilter): string {
  const p: string[] = []
  if (f.loai !== "all") p.push(`Loại: ${f.loai}`)
  if (f.cccd.trim()) p.push(`CCCD: ${f.cccd.trim()}`)
  if (f.mst.trim()) p.push(`MST: ${f.mst.trim()}`)
  if (f.hoTen.trim()) p.push(`Họ tên: ${f.hoTen.trim()}`)
  if (f.soCC.trim()) p.push(`Số CC: ${f.soCC.trim()}`)
  if (f.benLienQuan !== "all") p.push(`Bên liên quan: ${f.benLienQuan}`)
  return p.join("; ") || "(không có)"
}
