import type { StatusMeta } from "../ingestion/shared"

/* ============================ Vai trò & trạng thái ============================ */

export type PreventRole = "external" | "stp_specialist" | "stp_leader" | "btp_specialist" | "btp_leader"

export const ROLE_LABEL: Record<PreventRole, string> = {
  external: "Chuyên viên Đơn vị ngoài",
  stp_specialist: "Chuyên viên Sở Tư pháp",
  stp_leader: "Lãnh đạo phòng STP",
  btp_specialist: "Chuyên viên BTP",
  btp_leader: "Lãnh đạo BTP",
}

export const isLeader = (r: PreventRole) => r === "stp_leader" || r === "btp_leader"
export const isSpecialist = (r: PreventRole) => r === "stp_specialist" || r === "btp_specialist" || r === "external"
export const isCentral = (r: PreventRole) => r === "btp_specialist" || r === "btp_leader"

export type PreventStatus = "draft" | "pending_receipt" | "processing" | "pending_approval" | "approved" | "rejected"

export const PREVENT_STATUS: Record<PreventStatus, StatusMeta> = {
  draft: { label: "Lưu nháp", bg: "#f5f5f5", fg: "#525252", dot: "#a3a3a3", bd: "#e5e5e5" },
  pending_receipt: { label: "Chờ tiếp nhận", bg: "#fff7ed", fg: "#c2410c", dot: "#f97316", bd: "#fed7aa" },
  processing: { label: "Đang xử lý", bg: "#eff6ff", fg: "#1d4ed8", dot: "#3b82f6", bd: "#bfdbfe" },
  pending_approval: { label: "Chờ duyệt", bg: "#fffbeb", fg: "#b45309", dot: "#f59e0b", bd: "#fde68a" },
  approved: { label: "Đã duyệt", bg: "#f0fdf4", fg: "#15803d", dot: "#22c55e", bd: "#bbf7d0" },
  rejected: { label: "Từ chối", bg: "#fef2f2", fg: "#b91c1c", dot: "#ef4444", bd: "#fecaca" },
}

/** Thứ tự tab trạng thái cho cán bộ Sở/Bộ. */
export const STATUS_TABS: [PreventStatus | "all", string][] = [
  ["all", "Tất cả"],
  ["pending_receipt", "Chờ tiếp nhận"],
  ["processing", "Đang xử lý"],
  ["pending_approval", "Chờ duyệt"],
  ["approved", "Đã duyệt"],
  ["rejected", "Từ chối"],
  ["draft", "Lưu nháp"],
]

/* ============================ Đối tượng ngăn chặn ============================ */

export type ObjectType = "asset" | "person" | "org"
export const OBJECT_LABEL: Record<ObjectType, string> = { asset: "Tài sản", person: "Cá nhân", org: "Tổ chức" }

export interface PreventPerson {
  hoTen: string
  loaiGiayTo: string
  soGiayTo: string
  ngaySinh?: string
  diaChi?: string
  tinhThanh?: string
  gioiTinh?: string
  quocTich?: string
}
export interface PreventOrg {
  tenToChuc: string
  loaiGiayTo: string
  soGiayTo: string
  diaChi?: string
  tinhThanh?: string
  nguoiDaiDien?: string
  chucVu?: string
}
export interface PreventAsset {
  loaiTaiSan: string
  soGiayChungNhan: string
  chuSoHuu: string
  ngayCap?: string
  noiCap?: string
  thongTinKhac?: string
}

export interface HistoryEntry {
  time: string
  actor: string
  thaoTac: string
  truong?: string
  cu?: string
  moi?: string
}

export interface PreventRecord {
  id: string
  soVanBan: string
  trichYeu: string
  donViGuiYeuCau: string
  ngayBanHanh: string
  soVanBanDen: string
  ngayVanBanDen: string
  createdAt: string
  trangThai: PreventStatus
  tinhThanhPho: string
  /** Vai trò tạo bản ghi (mô phỏng quyền sở hữu). */
  creatorRole: PreventRole
  /** Cấp phát sinh: tỉnh (STP) hay trung ương (BTP). */
  central?: boolean
  nguoiXuLy?: string
  lyDoTuChoi?: string
  fileName?: string
  persons: PreventPerson[]
  orgs: PreventOrg[]
  assets: PreventAsset[]
  history: HistoryEntry[]
}

export const objectTypesOf = (r: PreventRecord): ObjectType[] => {
  const t: ObjectType[] = []
  if (r.assets.length) t.push("asset")
  if (r.persons.length) t.push("person")
  if (r.orgs.length) t.push("org")
  return t
}

/** Trích yếu kèm loại đối tượng in đậm (dùng cho cột grid). */
export const objectSummary = (r: PreventRecord) => objectTypesOf(r).map((t) => OBJECT_LABEL[t]).join(", ") || "—"

/* ============================ Danh mục ============================ */

export const PROVINCES = ["Hà Nội", "TP. Hồ Chí Minh", "Kiên Giang", "Cần Thơ", "Đà Nẵng", "Hải Phòng"]
export const PERSON_DOC_TYPES = ["Căn cước", "CMND", "Hộ chiếu"]
export const ORG_DOC_TYPES = ["Giấy đăng ký kinh doanh", "Quyết định thành lập", "Giấy phép đầu tư"]
export const ASSET_TYPES = ["Bất động sản", "Ô tô / Xe máy", "Tàu thuyền", "Tài khoản ngân hàng", "Khác"]

/* ============================ Dữ liệu mẫu ============================ */

const H = (time: string, actor: string, thaoTac: string, truong?: string, cu?: string, moi?: string): HistoryEntry => ({ time, actor, thaoTac, truong, cu, moi })

export const PREVENT_RECORDS: PreventRecord[] = [
  {
    id: "NC-012", soVanBan: "12/NC-CA", trichYeu: "Quyết định ngăn chặn giao dịch đối với cá nhân Nguyễn Văn A do liên quan điều tra hình sự.",
    donViGuiYeuCau: "Công an TP. Hà Nội", ngayBanHanh: "23/06/2026", soVanBanDen: "45/VB-ĐEN", ngayVanBanDen: "24/06/2026",
    createdAt: "22/06/2026 08:10:00", trangThai: "processing", tinhThanhPho: "Hà Nội", creatorRole: "external", nguoiXuLy: "cv_stp_hn",
    fileName: "QD_NganChan_12NC.pdf",
    persons: [{ hoTen: "Nguyễn Văn A", loaiGiayTo: "Căn cước", soGiayTo: "012345678901", ngaySinh: "01/01/1985", diaChi: "123 Cầu Giấy, Hà Nội", tinhThanh: "Hà Nội", gioiTinh: "Nam", quocTich: "Việt Nam" }],
    orgs: [], assets: [],
    history: [
      H("24/06/2026 09:30:15", "cv_stp_hn — CV Sở Tư pháp", "Tiếp nhận hồ sơ"),
      H("22/06/2026 08:10:00", "cv_ca_hn — CV Đơn vị ngoài", "Thêm mới"),
    ],
  },
  {
    id: "NC-011", soVanBan: "88/NC-TA", trichYeu: "Ngăn chặn chuyển nhượng bất động sản của Công ty TNHH ABC theo bản án dân sự.",
    donViGuiYeuCau: "Tòa án nhân dân TP. Hà Nội", ngayBanHanh: "20/06/2026", soVanBanDen: "40/VB-ĐEN", ngayVanBanDen: "21/06/2026",
    createdAt: "20/06/2026 10:00:00", trangThai: "pending_approval", tinhThanhPho: "Hà Nội", creatorRole: "stp_specialist", nguoiXuLy: "cv_stp_hn",
    fileName: "BanAn_88NC.pdf",
    persons: [], orgs: [{ tenToChuc: "Công ty TNHH ABC", loaiGiayTo: "Giấy đăng ký kinh doanh", soGiayTo: "0102030405", diaChi: "456 Trần Duy Hưng, Hà Nội", tinhThanh: "Hà Nội", nguoiDaiDien: "Nguyễn Văn A", chucVu: "Giám đốc" }],
    assets: [{ loaiTaiSan: "Bất động sản", soGiayChungNhan: "CN-778899", chuSoHuu: "Công ty TNHH ABC", noiCap: "Sở TN&MT Hà Nội" }],
    history: [
      H("21/06/2026 14:20:00", "cv_stp_hn — CV Sở Tư pháp", "Trình duyệt"),
      H("20/06/2026 10:00:00", "cv_stp_hn — CV Sở Tư pháp", "Thêm mới"),
    ],
  },
  {
    id: "NC-010", soVanBan: "77/NC-CA", trichYeu: "Ngăn chặn giao dịch ô tô biển số 29A-12345 của cá nhân Trần Thị B.",
    donViGuiYeuCau: "Công an TP. Hà Nội", ngayBanHanh: "18/06/2026", soVanBanDen: "38/VB-ĐEN", ngayVanBanDen: "19/06/2026",
    createdAt: "18/06/2026 09:00:00", trangThai: "pending_receipt", tinhThanhPho: "Hà Nội", creatorRole: "external",
    fileName: "QD_77NC.pdf",
    persons: [{ hoTen: "Trần Thị B", loaiGiayTo: "Căn cước", soGiayTo: "012345678902", diaChi: "12 Đội Cấn, Hà Nội", tinhThanh: "Hà Nội", gioiTinh: "Nữ", quocTich: "Việt Nam" }],
    orgs: [],
    assets: [{ loaiTaiSan: "Ô tô / Xe máy", soGiayChungNhan: "5544332211", chuSoHuu: "Trần Thị B", noiCap: "Công an TP Hà Nội", thongTinKhac: "Xe màu đỏ, biển 29A-12345" }],
    history: [H("18/06/2026 09:00:00", "cv_ca_hn — CV Đơn vị ngoài", "Chuyển Sở Tư pháp")],
  },
  {
    id: "NC-009", soVanBan: "65/NC-BTP", trichYeu: "Ngăn chặn giao dịch tài sản đối với tổ chức XYZ trên phạm vi toàn quốc.",
    donViGuiYeuCau: "Cục Bổ trợ tư pháp", ngayBanHanh: "15/06/2026", soVanBanDen: "30/VB-ĐEN", ngayVanBanDen: "16/06/2026",
    createdAt: "15/06/2026 11:00:00", trangThai: "approved", tinhThanhPho: "TP. Hồ Chí Minh", creatorRole: "btp_specialist", central: true, nguoiXuLy: "cv_btp",
    fileName: "QD_65NC.pdf",
    persons: [], orgs: [{ tenToChuc: "Công ty CP XYZ", loaiGiayTo: "Giấy đăng ký kinh doanh", soGiayTo: "0301998877", diaChi: "99 Nguyễn Huệ, Q1", tinhThanh: "TP. Hồ Chí Minh", nguoiDaiDien: "Lê Văn C", chucVu: "Tổng giám đốc" }],
    assets: [],
    history: [
      H("16/06/2026 15:00:00", "ld_btp — Lãnh đạo BTP", "Duyệt hồ sơ"),
      H("15/06/2026 16:00:00", "cv_btp — CV BTP", "Trình duyệt"),
      H("15/06/2026 11:00:00", "cv_btp — CV BTP", "Thêm mới"),
    ],
  },
  {
    id: "NC-008", soVanBan: "54/NC-CA", trichYeu: "Ngăn chặn giao dịch nhà đất của cá nhân Phạm Văn D tại Kiên Giang.",
    donViGuiYeuCau: "Công an tỉnh Kiên Giang", ngayBanHanh: "12/06/2026", soVanBanDen: "25/VB-ĐEN", ngayVanBanDen: "13/06/2026",
    createdAt: "12/06/2026 08:30:00", trangThai: "rejected", tinhThanhPho: "Kiên Giang", creatorRole: "external",
    fileName: "QD_54NC.pdf", lyDoTuChoi: "Thiếu văn bản gốc có dấu đỏ, đề nghị bổ sung và gửi lại.",
    persons: [{ hoTen: "Phạm Văn D", loaiGiayTo: "Căn cước", soGiayTo: "091234567890", diaChi: "TP. Rạch Giá", tinhThanh: "Kiên Giang", gioiTinh: "Nam", quocTich: "Việt Nam" }],
    orgs: [],
    assets: [{ loaiTaiSan: "Bất động sản", soGiayChungNhan: "CN-112233", chuSoHuu: "Phạm Văn D" }],
    history: [
      H("13/06/2026 10:15:00", "cv_stp_kg — CV Sở Tư pháp", "Từ chối tiếp nhận"),
      H("12/06/2026 08:30:00", "cv_ca_kg — CV Đơn vị ngoài", "Chuyển Sở Tư pháp"),
    ],
  },
  {
    id: "NC-007", soVanBan: "48/NC-CA", trichYeu: "Ngăn chặn giao dịch tài khoản ngân hàng của cá nhân Võ Thị E.",
    donViGuiYeuCau: "Công an tỉnh Kiên Giang", ngayBanHanh: "10/06/2026", soVanBanDen: "20/VB-ĐEN", ngayVanBanDen: "11/06/2026",
    createdAt: "10/06/2026 14:00:00", trangThai: "draft", tinhThanhPho: "Kiên Giang", creatorRole: "stp_specialist", nguoiXuLy: "cv_stp_kg",
    fileName: "",
    persons: [{ hoTen: "Võ Thị E", loaiGiayTo: "Căn cước", soGiayTo: "091234567891", tinhThanh: "Kiên Giang", gioiTinh: "Nữ", quocTich: "Việt Nam" }],
    orgs: [], assets: [],
    history: [H("10/06/2026 14:00:00", "cv_stp_kg — CV Sở Tư pháp", "Thêm mới")],
  },
  {
    id: "NC-006", soVanBan: "40/NC-CA", trichYeu: "Ngăn chặn chuyển nhượng cổ phần của tổ chức DEF theo yêu cầu điều tra.",
    donViGuiYeuCau: "Công an TP. Hồ Chí Minh", ngayBanHanh: "08/06/2026", soVanBanDen: "18/VB-ĐEN", ngayVanBanDen: "09/06/2026",
    createdAt: "08/06/2026 09:15:00", trangThai: "processing", tinhThanhPho: "TP. Hồ Chí Minh", creatorRole: "external", nguoiXuLy: "cv_stp_hcm",
    fileName: "QD_40NC.pdf",
    persons: [], orgs: [{ tenToChuc: "Công ty CP DEF", loaiGiayTo: "Giấy đăng ký kinh doanh", soGiayTo: "0309887766", tinhThanh: "TP. Hồ Chí Minh", nguoiDaiDien: "Đặng Văn F", chucVu: "Chủ tịch HĐQT" }],
    assets: [],
    history: [
      H("09/06/2026 10:00:00", "cv_stp_hcm — CV Sở Tư pháp", "Tiếp nhận hồ sơ"),
      H("08/06/2026 09:15:00", "cv_ca_hcm — CV Đơn vị ngoài", "Chuyển Sở Tư pháp"),
    ],
  },
  {
    id: "NC-005", soVanBan: "33/NC-TA", trichYeu: "Ngăn chặn giao dịch bất động sản của cá nhân Bùi Văn G theo bản án.",
    donViGuiYeuCau: "Tòa án nhân dân TP. HCM", ngayBanHanh: "05/06/2026", soVanBanDen: "15/VB-ĐEN", ngayVanBanDen: "06/06/2026",
    createdAt: "05/06/2026 15:30:00", trangThai: "pending_approval", tinhThanhPho: "TP. Hồ Chí Minh", creatorRole: "btp_specialist", central: true, nguoiXuLy: "cv_btp",
    fileName: "BanAn_33NC.pdf",
    persons: [{ hoTen: "Bùi Văn G", loaiGiayTo: "Căn cước", soGiayTo: "079123456780", tinhThanh: "TP. Hồ Chí Minh", gioiTinh: "Nam", quocTich: "Việt Nam" }],
    orgs: [], assets: [{ loaiTaiSan: "Bất động sản", soGiayChungNhan: "CN-556677", chuSoHuu: "Bùi Văn G" }],
    history: [
      H("06/06/2026 09:00:00", "cv_btp — CV BTP", "Trình duyệt"),
      H("05/06/2026 15:30:00", "cv_btp — CV BTP", "Thêm mới"),
    ],
  },
  {
    id: "NC-004", soVanBan: "21/NC-CA", trichYeu: "Ngăn chặn giao dịch của cá nhân Ngô Văn H — hồ sơ đã được phê duyệt và có hiệu lực.",
    donViGuiYeuCau: "Công an TP. Hà Nội", ngayBanHanh: "01/06/2026", soVanBanDen: "10/VB-ĐEN", ngayVanBanDen: "02/06/2026",
    createdAt: "01/06/2026 08:00:00", trangThai: "approved", tinhThanhPho: "Hà Nội", creatorRole: "external", nguoiXuLy: "cv_stp_hn",
    fileName: "QD_21NC.pdf",
    persons: [{ hoTen: "Ngô Văn H", loaiGiayTo: "Căn cước", soGiayTo: "001234567012", tinhThanh: "Hà Nội", gioiTinh: "Nam", quocTich: "Việt Nam" }],
    orgs: [], assets: [],
    history: [
      H("02/06/2026 11:00:00", "ld_stp_hn — Lãnh đạo phòng STP", "Duyệt hồ sơ"),
      H("01/06/2026 16:00:00", "cv_stp_hn — CV Sở Tư pháp", "Trình duyệt"),
      H("01/06/2026 10:00:00", "cv_stp_hn — CV Sở Tư pháp", "Tiếp nhận hồ sơ"),
      H("01/06/2026 08:00:00", "cv_ca_hn — CV Đơn vị ngoài", "Chuyển Sở Tư pháp"),
    ],
  },
]

export const preventById = (id?: string) => PREVENT_RECORDS.find((r) => r.id === id)

/* Danh sách cán bộ cho popup phân công (mô phỏng). */
export const STAFF_STP = ["cv_stp_hn — Nguyễn Thị Lan", "cv_stp_hn2 — Trần Văn Minh", "cv_stp_kg — Lê Thị Hoa"]
export const STAFF_BTP = ["cv_btp — Phạm Quốc Hùng", "cv_btp2 — Vũ Thị Mai"]
