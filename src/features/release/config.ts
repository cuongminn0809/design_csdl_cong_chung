import type { StatusMeta } from "../ingestion/shared"
import { PREVENT_STATUS, type ObjectType, type PreventStatus } from "../prevent/config"

/* ============================ Vai trò & trạng thái ============================ */

// Giải tỏa có thêm vai trò Công chứng viên (TCHNCC) so với module ngăn chặn.
export type ReleaseRole = "external" | "ccv" | "stp_specialist" | "stp_leader" | "btp_specialist" | "btp_leader"

export const ROLE_LABEL: Record<ReleaseRole, string> = {
  external: "Chuyên viên Đơn vị ngoài",
  ccv: "Công chứng viên (TCHNCC)",
  stp_specialist: "Chuyên viên Sở Tư pháp",
  stp_leader: "Lãnh đạo phòng STP",
  btp_specialist: "Chuyên viên BTP",
  btp_leader: "Lãnh đạo BTP",
}

export const isLeader = (r: ReleaseRole) => r === "stp_leader" || r === "btp_leader"
export const isCreatorRole = (r: ReleaseRole) => r === "external" || r === "ccv"
export const isCentral = (r: ReleaseRole) => r === "btp_specialist" || r === "btp_leader"

// Tái dùng trạng thái & meta của module ngăn chặn (giống hệt).
export type ReleaseStatus = PreventStatus
export const RELEASE_STATUS: Record<ReleaseStatus, StatusMeta> = PREVENT_STATUS

export const STATUS_TABS: [ReleaseStatus | "all", string][] = [
  ["all", "Tất cả"],
  ["pending_receipt", "Chờ tiếp nhận"],
  ["processing", "Đang xử lý"],
  ["pending_approval", "Chờ duyệt"],
  ["approved", "Đã duyệt"],
  ["rejected", "Từ chối"],
  ["draft", "Lưu nháp"],
]

/* ============================ Đối tượng bị ngăn chặn (ứng viên giải tỏa) ============================ */

export type BlockStatus = "blocked" | "released"
export const BLOCK_STATUS_LABEL: Record<BlockStatus, string> = { blocked: "Ngăn chặn", released: "Đã giải tỏa" }

export interface ReleaseBlock {
  id: string
  loai: ObjectType
  info: string // tóm tắt đối tượng
  donViGuiYeuCau: string
  ngayBanHanh: string
  soVanBan: string
  tinhThanhPho: string
  central?: boolean
  status: BlockStatus
}

// Pool các đối tượng đang bị ngăn chặn (trạng thái "Ngăn chặn") — nguồn cho popup chọn giải tỏa.
export const BLOCK_POOL: ReleaseBlock[] = [
  { id: "B-01", loai: "person", info: "Cá nhân Nguyễn Văn A — CCCD 012345678901", donViGuiYeuCau: "Công an TP. Hà Nội", ngayBanHanh: "23/06/2026", soVanBan: "12/NC-CA", tinhThanhPho: "Hà Nội", status: "blocked" },
  { id: "B-02", loai: "asset", info: "Ô tô, BKS 30A-12345 — GCN 5544332211", donViGuiYeuCau: "Công an TP. Hà Nội", ngayBanHanh: "18/06/2026", soVanBan: "77/NC-CA", tinhThanhPho: "Hà Nội", status: "blocked" },
  { id: "B-03", loai: "org", info: "Công ty TNHH ABC — ĐKKD 0102030405", donViGuiYeuCau: "Tòa án nhân dân TP. Hà Nội", ngayBanHanh: "20/06/2026", soVanBan: "88/NC-TA", tinhThanhPho: "Hà Nội", status: "blocked" },
  { id: "B-04", loai: "org", info: "Công ty CP XYZ — ĐKKD 0301998877", donViGuiYeuCau: "Cục Bổ trợ tư pháp", ngayBanHanh: "15/06/2026", soVanBan: "65/NC-BTP", tinhThanhPho: "TP. Hồ Chí Minh", central: true, status: "blocked" },
  { id: "B-05", loai: "asset", info: "Bất động sản, GCN CN-556677 — Bùi Văn G", donViGuiYeuCau: "Tòa án nhân dân TP. HCM", ngayBanHanh: "05/06/2026", soVanBan: "33/NC-TA", tinhThanhPho: "TP. Hồ Chí Minh", status: "blocked" },
  { id: "B-06", loai: "person", info: "Cá nhân Ngô Văn H — CCCD 001234567012", donViGuiYeuCau: "Công an TP. Hà Nội", ngayBanHanh: "01/06/2026", soVanBan: "21/NC-CA", tinhThanhPho: "Hà Nội", status: "released" },
  { id: "B-07", loai: "asset", info: "Tài khoản ngân hàng — Đoàn Văn E", donViGuiYeuCau: "Công an tỉnh Kiên Giang", ngayBanHanh: "24/05/2026", soVanBan: "18/NC-CA", tinhThanhPho: "Kiên Giang", status: "blocked" },
  { id: "B-08", loai: "person", info: "Cá nhân Trần Thị B — CCCD 012345678902", donViGuiYeuCau: "Công an tỉnh Kiên Giang", ngayBanHanh: "12/05/2026", soVanBan: "09/NC-CA", tinhThanhPho: "Kiên Giang", status: "blocked" },
]

export const blockById = (id: string) => BLOCK_POOL.find((b) => b.id === id)

/* ============================ Văn bản giải tỏa ============================ */

export interface HistoryEntry {
  time: string
  actor: string
  thaoTac: string
  truong?: string
  cu?: string
  moi?: string
}

export interface ReleaseRecord {
  id: string
  soVanBan: string
  trichYeu: string
  ghiChu: string
  donViGuiYeuCau: string
  ngayBanHanh: string
  soVanBanDen: string
  ngayNhan: string
  ngayNhap: string
  createdAt: string
  trangThai: ReleaseStatus
  tinhThanhPho: string
  creatorRole: ReleaseRole
  central?: boolean
  nguoiXuLy?: string
  lyDoTuChoi?: string
  fileName?: string
  blockIds: string[] // đối tượng ngăn chặn được giải tỏa
  history: HistoryEntry[]
}

export const linkedBlocks = (r: ReleaseRecord) => r.blockIds.map(blockById).filter(Boolean) as ReleaseBlock[]
export const releaseSummary = (r: ReleaseRecord) => {
  const bs = linkedBlocks(r)
  if (!bs.length) return "—"
  return bs.map((b) => b.info).join("; ")
}

const H = (time: string, actor: string, thaoTac: string, truong?: string, cu?: string, moi?: string): HistoryEntry => ({ time, actor, thaoTac, truong, cu, moi })

export const RELEASE_RECORDS: ReleaseRecord[] = [
  {
    id: "GT-006", soVanBan: "99/VB-GT", trichYeu: "Giải tỏa ngăn chặn giao dịch đối với cá nhân Ngô Văn H sau khi kết thúc điều tra.",
    ghiChu: "", donViGuiYeuCau: "Công an TP. Hà Nội", ngayBanHanh: "10/07/2026", soVanBanDen: "60/VB-ĐEN", ngayNhan: "11/07/2026", ngayNhap: "11/07/2026",
    createdAt: "11/07/2026 08:30:00", trangThai: "approved", tinhThanhPho: "Hà Nội", creatorRole: "external", nguoiXuLy: "cv_stp_hn", fileName: "VB_GiaiToa_99.pdf",
    blockIds: ["B-06"],
    history: [
      H("12/07/2026 09:00:00", "ld_stp_hn — Lãnh đạo phòng STP", "Duyệt hồ sơ"),
      H("11/07/2026 14:00:00", "cv_stp_hn — CV Sở Tư pháp", "Trình duyệt"),
      H("11/07/2026 10:00:00", "cv_stp_hn — CV Sở Tư pháp", "Tiếp nhận hồ sơ giải tỏa"),
      H("11/07/2026 08:30:00", "cv_ca_hn — CV Đơn vị ngoài", "Chuyển Sở Tư pháp"),
    ],
  },
  {
    id: "GT-005", soVanBan: "95/VB-GT", trichYeu: "Giải tỏa ngăn chặn tài sản ô tô BKS 30A-12345 do đã hoàn tất nghĩa vụ.",
    ghiChu: "Hồ sơ đầy đủ.", donViGuiYeuCau: "Công an TP. Hà Nội", ngayBanHanh: "12/07/2026", soVanBanDen: "62/VB-ĐEN", ngayNhan: "12/07/2026", ngayNhap: "12/07/2026",
    createdAt: "12/07/2026 09:00:00", trangThai: "pending_approval", tinhThanhPho: "Hà Nội", creatorRole: "stp_specialist", nguoiXuLy: "cv_stp_hn", fileName: "VB_GiaiToa_95.pdf",
    blockIds: ["B-02"],
    history: [
      H("12/07/2026 15:00:00", "cv_stp_hn — CV Sở Tư pháp", "Trình duyệt"),
      H("12/07/2026 09:00:00", "cv_stp_hn — CV Sở Tư pháp", "Thêm mới"),
    ],
  },
  {
    id: "GT-004", soVanBan: "90/VB-GT", trichYeu: "Giải tỏa ngăn chặn đối với Công ty TNHH ABC theo quyết định của Tòa án.",
    ghiChu: "", donViGuiYeuCau: "Tòa án nhân dân TP. Hà Nội", ngayBanHanh: "09/07/2026", soVanBanDen: "58/VB-ĐEN", ngayNhan: "09/07/2026", ngayNhap: "09/07/2026",
    createdAt: "09/07/2026 10:00:00", trangThai: "pending_receipt", tinhThanhPho: "Hà Nội", creatorRole: "ccv", fileName: "VB_GiaiToa_90.pdf",
    blockIds: ["B-03"],
    history: [H("09/07/2026 10:00:00", "ccv_nguyenb — Công chứng viên", "Chuyển Sở Tư pháp")],
  },
  {
    id: "GT-003", soVanBan: "85/VB-GT", trichYeu: "Giải tỏa ngăn chặn bất động sản của Bùi Văn G theo bản án phúc thẩm.",
    ghiChu: "", donViGuiYeuCau: "Cục Bổ trợ tư pháp", ngayBanHanh: "07/07/2026", soVanBanDen: "55/VB-ĐEN", ngayNhan: "07/07/2026", ngayNhap: "07/07/2026",
    createdAt: "07/07/2026 11:00:00", trangThai: "processing", tinhThanhPho: "TP. Hồ Chí Minh", creatorRole: "btp_specialist", central: true, nguoiXuLy: "cv_btp", fileName: "VB_GiaiToa_85.pdf",
    blockIds: ["B-05"],
    history: [
      H("07/07/2026 14:00:00", "cv_btp — CV BTP", "Tiếp nhận hồ sơ giải tỏa"),
      H("07/07/2026 11:00:00", "cv_btp — CV BTP", "Thêm mới"),
    ],
  },
  {
    id: "GT-002", soVanBan: "80/VB-GT", trichYeu: "Giải tỏa ngăn chặn tài khoản ngân hàng của Đoàn Văn E.",
    ghiChu: "Bản nháp.", donViGuiYeuCau: "Công an tỉnh Kiên Giang", ngayBanHanh: "05/07/2026", soVanBanDen: "", ngayNhan: "", ngayNhap: "05/07/2026",
    createdAt: "05/07/2026 16:00:00", trangThai: "draft", tinhThanhPho: "Kiên Giang", creatorRole: "external", fileName: "",
    blockIds: ["B-07"],
    history: [H("05/07/2026 16:00:00", "cv_ca_kg — CV Đơn vị ngoài", "Thêm mới")],
  },
  {
    id: "GT-001", soVanBan: "72/VB-GT", trichYeu: "Giải tỏa ngăn chặn đối với cá nhân Trần Thị B — hồ sơ bị từ chối do thiếu văn bản gốc.",
    ghiChu: "", donViGuiYeuCau: "Công an tỉnh Kiên Giang", ngayBanHanh: "02/07/2026", soVanBanDen: "50/VB-ĐEN", ngayNhan: "03/07/2026", ngayNhap: "03/07/2026",
    createdAt: "03/07/2026 08:00:00", trangThai: "rejected", tinhThanhPho: "Kiên Giang", creatorRole: "ccv", fileName: "VB_GiaiToa_72.pdf",
    lyDoTuChoi: "Thiếu văn bản gốc có dấu đỏ của cơ quan yêu cầu giải tỏa, đề nghị bổ sung.",
    blockIds: ["B-08"],
    history: [
      H("03/07/2026 10:00:00", "cv_stp_kg — CV Sở Tư pháp", "Từ chối tiếp nhận"),
      H("03/07/2026 08:00:00", "ccv_kg — Công chứng viên", "Chuyển Sở Tư pháp"),
    ],
  },
]

export const releaseById = (id?: string) => RELEASE_RECORDS.find((r) => r.id === id)

/** Đối tượng còn có thể giải tỏa: đang "Ngăn chặn" và chưa nằm trong văn bản giải tỏa khác đang xử lý/đã duyệt (BR002). */
export function selectableBlocks(): ReleaseBlock[] {
  const inUse = new Set<string>()
  RELEASE_RECORDS.forEach((r) => {
    if (r.trangThai !== "rejected") r.blockIds.forEach((id) => inUse.add(id))
  })
  return BLOCK_POOL.filter((b) => b.status === "blocked" && !inUse.has(b.id))
}

export const STAFF_STP = ["cv_stp_hn — Nguyễn Thị Lan", "cv_stp_hn2 — Trần Văn Minh", "cv_stp_kg — Lê Thị Hoa"]
export const STAFF_BTP = ["cv_btp — Phạm Quốc Hùng", "cv_btp2 — Vũ Thị Mai"]

export const PROVINCES = ["Hà Nội", "TP. Hồ Chí Minh", "Kiên Giang", "Cần Thơ", "Đà Nẵng", "Hải Phòng"]
