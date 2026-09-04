import { useSyncExternalStore } from "react"

import type { StatusMeta } from "../ingestion/shared"
import { TCHNCC_LIST } from "../report/config"

/* ============================ VAI TRÒ ============================ */
export type DprRole = "t_tchncc" | "cv_stp" | "ld_stp_dept" | "ld_stp"
export const ROLES: { key: DprRole; label: string }[] = [
  { key: "t_tchncc", label: "Trưởng tổ chức HNCC" },
  { key: "cv_stp", label: "Chuyên viên Sở Tư pháp" },
  { key: "ld_stp_dept", label: "Lãnh đạo phòng chuyên môn STP" },
  { key: "ld_stp", label: "Lãnh đạo Sở Tư pháp" },
]
export const isTchncc = (r: DprRole) => r === "t_tchncc"
export const isCvStp = (r: DprRole) => r === "cv_stp"
export const isLanhDao = (r: DprRole) => r === "ld_stp_dept" || r === "ld_stp"

/* ============================ NGỮ CẢNH NGƯỜI DÙNG DEMO ============================ */
export const CURRENT_ORG = "VPCC Nguyễn Văn A"
export const CURRENT_REQUESTER = "Nguyễn Văn A"
export const CURRENT_CV_NAME = "Lê Thị M"
export interface LanhDao { name: string; role: DprRole; label: string }
export const LANH_DAO_LIST: LanhDao[] = [
  { name: "Trần Văn B", role: "ld_stp", label: "Trần Văn B — Lãnh đạo Sở Tư pháp" },
  { name: "Phạm Thị N", role: "ld_stp_dept", label: "Phạm Thị N — Lãnh đạo phòng chuyên môn STP" },
]
export const CURRENT_LANHDAO_NAME: Record<DprRole, string> = { t_tchncc: "", cv_stp: "", ld_stp: "Trần Văn B", ld_stp_dept: "Phạm Thị N" }

export { TCHNCC_LIST }
export const ORG_PLATFORM: Record<string, string> = {
  "VPCC Nguyễn Văn A": "Nền tảng công chứng OneNot",
  "VPCC Trần Văn B": "Nền tảng công chứng ePro",
  "Phòng Công chứng số 1": "Nền tảng công chứng GovNotary",
  "VPCC Bến Thành": "Nền tảng công chứng ePro",
  "VPCC Sông Hàn": "Nền tảng công chứng OneNot",
}
export const PLATFORMS = [...new Set(Object.values(ORG_PLATFORM))]

/* ============================ THỜI GIAN (D-2) ============================ */
export const TODAY_ISO = "2026-08-28"
export const D_MINUS_2 = "2026-08-26"
export const fmtVN = (iso: string) => { const [y, m, d] = iso.split("-"); return `${d}/${m}/${y}` }

/* ============================ TRẠNG THÁI YÊU CẦU (mục 1.3) ============================ */
export type ReqStatus = "Lưu nháp" | "Chờ tiếp nhận" | "Đã tiếp nhận" | "Từ chối" | "Chờ duyệt" | "Đã phê duyệt" | "Đang chia sẻ dữ liệu" | "Đã cung cấp dữ liệu"
export const STATUS_LIST: ReqStatus[] = ["Lưu nháp", "Chờ tiếp nhận", "Đã tiếp nhận", "Từ chối", "Chờ duyệt", "Đã phê duyệt", "Đang chia sẻ dữ liệu", "Đã cung cấp dữ liệu"]
export const STATUS_META: Record<ReqStatus, StatusMeta> = {
  "Lưu nháp": { label: "Lưu nháp", bg: "#f4f4f5", fg: "#52525b", dot: "#a1a1aa", bd: "#e4e4e7" },
  "Chờ tiếp nhận": { label: "Chờ tiếp nhận", bg: "#fffbeb", fg: "#b45309", dot: "#f59e0b", bd: "#fde68a" },
  "Đã tiếp nhận": { label: "Đã tiếp nhận", bg: "#eff6ff", fg: "#1d4ed8", dot: "#3b82f6", bd: "#bfdbfe" },
  "Từ chối": { label: "Từ chối", bg: "#fef2f2", fg: "#b91c1c", dot: "#ef4444", bd: "#fecaca" },
  "Chờ duyệt": { label: "Chờ duyệt", bg: "#fffbeb", fg: "#b45309", dot: "#f59e0b", bd: "#fde68a" },
  "Đã phê duyệt": { label: "Đã phê duyệt", bg: "#eff6ff", fg: "#1d4ed8", dot: "#3b82f6", bd: "#bfdbfe" },
  "Đang chia sẻ dữ liệu": { label: "Đang chia sẻ dữ liệu", bg: "#f5f3ff", fg: "#7c3aed", dot: "#8b5cf6", bd: "#e9d5ff" },
  "Đã cung cấp dữ liệu": { label: "Đã cung cấp dữ liệu", bg: "#ecfdf5", fg: "#047857", dot: "#10b981", bd: "#a7f3d0" },
}
// BR-08: nhóm trạng thái phục vụ thống kê.
export const isDangXuLy = (s: ReqStatus) => s === "Chờ tiếp nhận" || s === "Đã tiếp nhận" || s === "Chờ duyệt" || s === "Đã phê duyệt" || s === "Đang chia sẻ dữ liệu"
export const isHoanThanh = (s: ReqStatus) => s === "Đã cung cấp dữ liệu"
export const isTuChoi = (s: ReqStatus) => s === "Từ chối"

export type ShareStatus = "Chưa chia sẻ" | "Đang chia sẻ" | "Đã chia sẻ" | "Chia sẻ lỗi"

/* ============================ DANH SÁCH GDCC MẪU THEO TCHNCC (BR-04) ============================ */
export interface GdccRow { soCC: string; ngayCC: string; tenGD: string; benLienQuan: string; taiSan: string; ccv: string; trangThai: string }
const LOAI_GD = ["Hợp đồng chuyển nhượng QSDĐ", "Hợp đồng thế chấp", "Hợp đồng tặng cho", "Hợp đồng ủy quyền", "Hợp đồng mua bán tài sản"]
const TAI_SAN = ["Thửa đất 120m² P.Yên Hòa", "Căn hộ chung cư CT2", "Ô tô Toyota Vios", "Sổ tiết kiệm 500tr", "Nhà ở 3 tầng Q.Cầu Giấy"]
const BEN_LQ = ["Nguyễn Văn B", "Trần Thị C", "Lê Văn D", "Phạm Thị E", "Đỗ Văn F"]
const CCV_LIST = ["Nguyễn Văn A", "Trần Thị H", "Lê Minh K"]
function buildGdccPool(seed: number): GdccRow[] {
  const rows: GdccRow[] = []
  for (let i = 0; i < 24; i++) {
    const month = 1 + ((seed + i) % 8) // Jan..Aug 2026
    const day = 1 + ((seed * 3 + i * 7) % 27)
    const iso = `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    rows.push({
      soCC: `${100 + seed * 30 + i}/2026/HĐ`,
      ngayCC: iso,
      tenGD: LOAI_GD[(seed + i) % LOAI_GD.length],
      benLienQuan: BEN_LQ[(seed + i) % BEN_LQ.length],
      taiSan: TAI_SAN[(seed + i * 2) % TAI_SAN.length],
      ccv: CCV_LIST[(seed + i) % CCV_LIST.length],
      trangThai: "Đã công chứng",
    })
  }
  return rows.sort((a, b) => (a.ngayCC < b.ngayCC ? 1 : -1))
}
export const GDCC_POOL: Record<string, GdccRow[]> = Object.fromEntries(TCHNCC_LIST.map((org, i) => [org, buildGdccPool(i + 1)]))
export const gdccInRange = (org: string, tuNgay: string, denNgay: string) => (GDCC_POOL[org] ?? []).filter((r) => r.ngayCC >= tuNgay && r.ngayCC <= denNgay)

/* ============================ MÃ YÊU CẦU (BR-02) ============================ */
export function genMaYeuCau(existing: string[]): string {
  const yy = TODAY_ISO.slice(2, 4), mm = TODAY_ISO.slice(5, 7)
  const prefix = `YK-${yy}${mm}-`
  const nums = existing.filter((m) => m.startsWith(prefix)).map((m) => Number(m.slice(prefix.length)))
  const next = (nums.length ? Math.max(...nums) : 0) + 1
  return `${prefix}${String(next).padStart(4, "0")}`
}
export const tenYeuCau = (tuNgay: string, denNgay: string) => `Khôi phục dữ liệu ${fmtVN(tuNgay)}-${fmtVN(denNgay)}`

/* ============================ HỒ SƠ YÊU CẦU ============================ */
export interface HistoryEntry { thoiGian: string; nguoiThucHien: string; hanhDong: string; ghiChu?: string }
export interface DataProvideRequest {
  id: string
  maYeuCau: string
  toChuc: string
  nguoiYeuCau: string
  nenTang: string
  tuNgay: string; denNgay: string
  lyDo: string
  fileName?: string; fileSize?: string
  trangThai: ReqStatus
  nguoiTao: string
  vaiTroNguoiTao: DprRole
  ngayGui?: string
  nguoiTiepNhan?: string; ngayTiepNhan?: string
  lyDoTuChoi?: string
  ghiChuTrinh?: string
  lanhDaoXuLy?: string
  ghiChuPhaDuyet?: string
  gdccSnapshot?: GdccRow[]
  shareStatuses?: Record<string, ShareStatus>
  lichSu: HistoryEntry[]
}

const hist = (thoiGian: string, nguoiThucHien: string, hanhDong: string, ghiChu?: string): HistoryEntry => ({ thoiGian, nguoiThucHien, hanhDong, ghiChu })

function makeShareStatuses(rows: GdccRow[], errorEvery = 0): Record<string, ShareStatus> {
  const out: Record<string, ShareStatus> = {}
  rows.forEach((r, i) => { out[r.soCC] = errorEvery > 0 && (i + 1) % errorEvery === 0 ? "Chia sẻ lỗi" : "Đã chia sẻ" })
  return out
}

const SEED: DataProvideRequest[] = [
  { id: "REQ-1", maYeuCau: "YK-2608-0057", toChuc: "VPCC Nguyễn Văn A", nguoiYeuCau: "Nguyễn Văn A", nenTang: ORG_PLATFORM["VPCC Nguyễn Văn A"], tuNgay: "2026-08-01", denNgay: "2026-08-31", lyDo: "Đề nghị khôi phục dữ liệu tháng 8 phục vụ đối soát nội bộ đơn vị.", trangThai: "Lưu nháp", nguoiTao: "Nguyễn Văn A", vaiTroNguoiTao: "t_tchncc", lichSu: [hist("28/08/2026 08:20", "Nguyễn Văn A", "Tạo yêu cầu (lưu nháp)")] },
  { id: "REQ-2", maYeuCau: "YK-2608-0058", toChuc: "VPCC Trần Văn B", nguoiYeuCau: "Trần Văn B", nenTang: ORG_PLATFORM["VPCC Trần Văn B"], tuNgay: "2026-08-01", denNgay: "2026-08-31", lyDo: "CV STP tạo thay đơn vị do đơn vị báo mất đồng bộ dữ liệu tháng 8.", trangThai: "Lưu nháp", nguoiTao: "Lê Thị M", vaiTroNguoiTao: "cv_stp", lichSu: [hist("28/08/2026 09:00", "Lê Thị M", "Tạo yêu cầu thay TCHNCC (lưu nháp)")] },
  { id: "REQ-3", maYeuCau: "YK-2608-0056", toChuc: "VPCC Nguyễn Văn A", nguoiYeuCau: "Nguyễn Văn A", nenTang: ORG_PLATFORM["VPCC Nguyễn Văn A"], tuNgay: "2026-07-01", denNgay: "2026-07-31", lyDo: "Mất đồng bộ dữ liệu do sự cố hệ thống ngày 02/08/2026, đề nghị khôi phục dữ liệu tháng 7.", fileName: "cong_van_de_nghi.pdf", fileSize: "0.8 MB", trangThai: "Chờ tiếp nhận", nguoiTao: "Nguyễn Văn A", vaiTroNguoiTao: "t_tchncc", ngayGui: "2026-08-01T09:15:00", lichSu: [hist("01/08/2026 09:15", "Nguyễn Văn A", "Tạo và gửi yêu cầu")] },
  { id: "REQ-4", maYeuCau: "YK-2608-0055", toChuc: "VPCC Trần Văn B", nguoiYeuCau: "Trần Văn B", nenTang: ORG_PLATFORM["VPCC Trần Văn B"], tuNgay: "2026-06-01", denNgay: "2026-06-30", lyDo: "Đề nghị khôi phục dữ liệu tháng 6 phục vụ thanh tra định kỳ.", trangThai: "Đã tiếp nhận", nguoiTao: "Trần Văn B", vaiTroNguoiTao: "t_tchncc", ngayGui: "2026-07-28T10:00:00", nguoiTiepNhan: "Lê Thị M", ngayTiepNhan: "2026-07-28T14:20:00", lichSu: [hist("28/07/2026 10:00", "Trần Văn B", "Tạo và gửi yêu cầu"), hist("28/07/2026 14:20", "Lê Thị M", "Xác nhận tiếp nhận")] },
  { id: "REQ-5", maYeuCau: "YK-2607-0102", toChuc: "Phòng Công chứng số 1", nguoiYeuCau: "Phạm Văn D", nenTang: ORG_PLATFORM["Phòng Công chứng số 1"], tuNgay: "2026-05-01", denNgay: "2026-05-31", lyDo: "Đề nghị khôi phục dữ liệu tháng 5 do lỗi đồng bộ phần mềm quản lý hồ sơ.", trangThai: "Chờ duyệt", nguoiTao: "Phạm Văn D", vaiTroNguoiTao: "t_tchncc", ngayGui: "2026-07-20T08:30:00", nguoiTiepNhan: "Lê Thị M", ngayTiepNhan: "2026-07-20T11:00:00", ghiChuTrinh: "Hồ sơ đầy đủ, đề nghị lãnh đạo xem xét phê duyệt.", lanhDaoXuLy: "Trần Văn B", lichSu: [hist("20/07/2026 08:30", "Phạm Văn D", "Tạo và gửi yêu cầu"), hist("20/07/2026 11:00", "Lê Thị M", "Xác nhận tiếp nhận"), hist("20/07/2026 15:40", "Lê Thị M", "Trình duyệt", "Hồ sơ đầy đủ, đề nghị lãnh đạo xem xét phê duyệt.")] },
  { id: "REQ-6", maYeuCau: "YK-2607-0098", toChuc: "VPCC Bến Thành", nguoiYeuCau: "Trần Thị E", nenTang: ORG_PLATFORM["VPCC Bến Thành"], tuNgay: "2026-04-01", denNgay: "2026-04-30", lyDo: "Đề nghị khôi phục dữ liệu tháng 4 phục vụ báo cáo định kỳ Sở Tư pháp.", trangThai: "Đã phê duyệt", nguoiTao: "Trần Thị E", vaiTroNguoiTao: "t_tchncc", ngayGui: "2026-07-15T08:00:00", nguoiTiepNhan: "Lê Thị M", ngayTiepNhan: "2026-07-15T10:00:00", ghiChuTrinh: "Đề xuất phê duyệt cung cấp dữ liệu theo đúng phạm vi yêu cầu.", lanhDaoXuLy: "Phạm Thị N", ghiChuPhaDuyet: "Đồng ý cung cấp dữ liệu theo đúng phạm vi đã trình.", lichSu: [hist("15/07/2026 08:00", "Trần Thị E", "Tạo và gửi yêu cầu"), hist("15/07/2026 10:00", "Lê Thị M", "Xác nhận tiếp nhận"), hist("15/07/2026 13:30", "Lê Thị M", "Trình duyệt", "Đề xuất phê duyệt cung cấp dữ liệu theo đúng phạm vi yêu cầu."), hist("16/07/2026 09:10", "Phạm Thị N", "Phê duyệt", "Đồng ý cung cấp dữ liệu theo đúng phạm vi đã trình.")] },
  { id: "REQ-7", maYeuCau: "YK-2606-0071", toChuc: "VPCC Sông Hàn", nguoiYeuCau: "Đỗ Văn F", nenTang: ORG_PLATFORM["VPCC Sông Hàn"], tuNgay: "2026-03-01", denNgay: "2026-03-31", lyDo: "Đề nghị khôi phục dữ liệu quý I do nâng cấp hệ thống nội bộ.", trangThai: "Đang chia sẻ dữ liệu", nguoiTao: "Đỗ Văn F", vaiTroNguoiTao: "t_tchncc", ngayGui: "2026-06-10T08:00:00", nguoiTiepNhan: "Lê Thị M", ngayTiepNhan: "2026-06-10T10:00:00", ghiChuTrinh: "Đề xuất phê duyệt.", lanhDaoXuLy: "Trần Văn B", ghiChuPhaDuyet: "Phê duyệt cung cấp.", lichSu: [hist("10/06/2026 08:00", "Đỗ Văn F", "Tạo và gửi yêu cầu"), hist("10/06/2026 10:00", "Lê Thị M", "Xác nhận tiếp nhận"), hist("10/06/2026 13:00", "Lê Thị M", "Trình duyệt", "Đề xuất phê duyệt."), hist("11/06/2026 09:00", "Trần Văn B", "Phê duyệt", "Phê duyệt cung cấp."), hist("12/06/2026 09:30", "Lê Thị M", "Xác nhận cung cấp dữ liệu")] },
  { id: "REQ-8", maYeuCau: "YK-2605-0044", toChuc: "VPCC Nguyễn Văn A", nguoiYeuCau: "Nguyễn Văn A", nenTang: ORG_PLATFORM["VPCC Nguyễn Văn A"], tuNgay: "2026-02-01", denNgay: "2026-02-28", lyDo: "Đề nghị khôi phục dữ liệu tháng 2 phục vụ rà soát hồ sơ lưu trữ điện tử.", trangThai: "Đã cung cấp dữ liệu", nguoiTao: "Nguyễn Văn A", vaiTroNguoiTao: "t_tchncc", ngayGui: "2026-05-05T08:00:00", nguoiTiepNhan: "Lê Thị M", ngayTiepNhan: "2026-05-05T10:00:00", ghiChuTrinh: "Đề xuất phê duyệt.", lanhDaoXuLy: "Phạm Thị N", ghiChuPhaDuyet: "Phê duyệt cung cấp.", lichSu: [hist("05/05/2026 08:00", "Nguyễn Văn A", "Tạo và gửi yêu cầu"), hist("05/05/2026 10:00", "Lê Thị M", "Xác nhận tiếp nhận"), hist("05/05/2026 13:00", "Lê Thị M", "Trình duyệt", "Đề xuất phê duyệt."), hist("06/05/2026 09:00", "Phạm Thị N", "Phê duyệt", "Phê duyệt cung cấp."), hist("07/05/2026 09:30", "Lê Thị M", "Xác nhận cung cấp dữ liệu"), hist("07/05/2026 09:45", "Hệ thống", "Chia sẻ dữ liệu qua API thành công toàn bộ bản ghi")] },
  { id: "REQ-9", maYeuCau: "YK-2607-0090", toChuc: "VPCC Trần Văn B", nguoiYeuCau: "Trần Văn B", nenTang: ORG_PLATFORM["VPCC Trần Văn B"], tuNgay: "2026-05-01", denNgay: "2026-05-31", lyDo: "Đề nghị khôi phục dữ liệu tháng 5 do lỗi thao tác nhập liệu.", trangThai: "Từ chối", nguoiTao: "Trần Văn B", vaiTroNguoiTao: "t_tchncc", ngayGui: "2026-07-05T08:00:00", lyDoTuChoi: "Nội dung yêu cầu chưa nêu rõ phạm vi dữ liệu cần khôi phục, đề nghị bổ sung và gửi lại.", lichSu: [hist("05/07/2026 08:00", "Trần Văn B", "Tạo và gửi yêu cầu"), hist("05/07/2026 11:00", "Lê Thị M", "Từ chối tiếp nhận", "Nội dung yêu cầu chưa nêu rõ phạm vi dữ liệu cần khôi phục, đề nghị bổ sung và gửi lại.")] },
]
SEED.forEach((r) => {
  if (r.trangThai === "Đã tiếp nhận" || r.trangThai === "Chờ duyệt" || r.trangThai === "Đã phê duyệt" || r.trangThai === "Đang chia sẻ dữ liệu" || r.trangThai === "Đã cung cấp dữ liệu") {
    r.gdccSnapshot = gdccInRange(r.toChuc, r.tuNgay, r.denNgay)
  }
  if (r.trangThai === "Đang chia sẻ dữ liệu") r.shareStatuses = makeShareStatuses(r.gdccSnapshot ?? [], 4)
  if (r.trangThai === "Đã cung cấp dữ liệu") r.shareStatuses = makeShareStatuses(r.gdccSnapshot ?? [], 0)
})

/* ============================ STORE (chia sẻ giữa danh sách & thống kê) ============================ */
let requests: DataProvideRequest[] = SEED
const listeners = new Set<() => void>()
const emit = () => { requests = [...requests]; listeners.forEach((l) => l()) }
const subscribe = (cb: () => void) => { listeners.add(cb); return () => { listeners.delete(cb) } }
const getSnapshot = () => requests
export const useRequests = () => useSyncExternalStore(subscribe, getSnapshot)
export const getRequest = (id: string) => requests.find((r) => r.id === id)

function updateReq(id: string, patch: Partial<DataProvideRequest>, entry: HistoryEntry) {
  requests = requests.map((r) => r.id === id ? { ...r, ...patch, lichSu: [...r.lichSu, entry] } : r)
  emit()
}

// Ngày cố định theo bối cảnh demo (TODAY_ISO) — chỉ lấy giờ:phút thực tế, tránh lệch sang ngày thật của máy chủ.
function nowIso() {
  const t = new Date()
  return `${TODAY_ISO}T${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}:00`
}

let seq = requests.length
export function createRequest(input: { toChuc: string; nguoiYeuCau: string; nenTang: string; tuNgay: string; denNgay: string; lyDo: string; fileName?: string; fileSize?: string }, trangThai: ReqStatus, actor: { name: string; role: DprRole }) {
  seq += 1
  const maYeuCau = genMaYeuCau(requests.map((r) => r.maYeuCau))
  const now = nowIso()
  const entry = trangThai === "Chờ tiếp nhận"
    ? hist(fmtDateTime(now), actor.name, "Tạo và gửi yêu cầu")
    : trangThai === "Đã tiếp nhận"
      ? hist(fmtDateTime(now), actor.name, "Tạo và tiếp nhận yêu cầu thay TCHNCC")
      : hist(fmtDateTime(now), actor.name, "Tạo yêu cầu (lưu nháp)")
  const req: DataProvideRequest = {
    id: `REQ-${Date.now()}-${seq}`, maYeuCau, ...input, trangThai, nguoiTao: actor.name, vaiTroNguoiTao: actor.role,
    ngayGui: trangThai !== "Lưu nháp" ? now : undefined,
    nguoiTiepNhan: trangThai === "Đã tiếp nhận" ? actor.name : undefined,
    ngayTiepNhan: trangThai === "Đã tiếp nhận" ? now : undefined,
    gdccSnapshot: trangThai === "Đã tiếp nhận" ? gdccInRange(input.toChuc, input.tuNgay, input.denNgay) : undefined,
    lichSu: [entry],
  }
  requests = [req, ...requests]
  emit()
  return req
}

export function updateDraft(id: string, input: { toChuc: string; nguoiYeuCau: string; nenTang: string; tuNgay: string; denNgay: string; lyDo: string; fileName?: string; fileSize?: string }, trangThai: ReqStatus, actor: { name: string; role: DprRole }) {
  const now = nowIso()
  if (trangThai === "Lưu nháp") { updateReq(id, { ...input }, hist(fmtDateTime(now), actor.name, "Cập nhật yêu cầu (lưu nháp)")); return }
  if (trangThai === "Chờ tiếp nhận") { updateReq(id, { ...input, trangThai, ngayGui: now }, hist(fmtDateTime(now), actor.name, "Gửi yêu cầu")); return }
  if (trangThai === "Đã tiếp nhận") {
    updateReq(id, { ...input, trangThai, ngayGui: input.toChuc ? now : now, nguoiTiepNhan: actor.name, ngayTiepNhan: now, gdccSnapshot: gdccInRange(input.toChuc, input.tuNgay, input.denNgay) }, hist(fmtDateTime(now), actor.name, "Tiếp nhận yêu cầu thay TCHNCC"))
  }
}

export function respondAccept(id: string, actor: string) {
  const r = getRequest(id); if (!r) return
  const now = nowIso()
  updateReq(id, { trangThai: "Đã tiếp nhận", nguoiTiepNhan: actor, ngayTiepNhan: now, gdccSnapshot: gdccInRange(r.toChuc, r.tuNgay, r.denNgay) }, hist(fmtDateTime(now), actor, "Xác nhận tiếp nhận"))
}
export function respondReject(id: string, actor: string, lyDo: string) {
  const now = nowIso()
  updateReq(id, { trangThai: "Từ chối", lyDoTuChoi: lyDo }, hist(fmtDateTime(now), actor, "Từ chối tiếp nhận", lyDo))
}
export function submitForApproval(id: string, actor: string, lanhDao: string, ghiChu: string) {
  const now = nowIso()
  updateReq(id, { trangThai: "Chờ duyệt", lanhDaoXuLy: lanhDao, ghiChuTrinh: ghiChu }, hist(fmtDateTime(now), actor, "Trình duyệt", ghiChu))
}
export function decideApprove(id: string, actor: string, ghiChu: string) {
  const now = nowIso()
  updateReq(id, { trangThai: "Đã phê duyệt", ghiChuPhaDuyet: ghiChu }, hist(fmtDateTime(now), actor, "Phê duyệt", ghiChu || undefined))
}
export function decideReject(id: string, actor: string, lyDo: string) {
  const now = nowIso()
  updateReq(id, { trangThai: "Từ chối", lyDoTuChoi: lyDo }, hist(fmtDateTime(now), actor, "Từ chối phê duyệt", lyDo))
}
// UC380/UC381: xác nhận cung cấp -> mô phỏng chia sẻ API (đa số thành công, một vài lỗi để minh họa nút Thử lại).
export function confirmProvide(id: string, actor: string) {
  const r = getRequest(id); if (!r) return
  const now = nowIso()
  const rows = r.gdccSnapshot ?? []
  const shareStatuses = makeShareStatuses(rows, rows.length >= 5 ? 4 : 0)
  const allOk = Object.values(shareStatuses).every((s) => s === "Đã chia sẻ")
  updateReq(id, { trangThai: allOk ? "Đã cung cấp dữ liệu" : "Đang chia sẻ dữ liệu", shareStatuses },
    hist(fmtDateTime(now), actor, "Xác nhận cung cấp dữ liệu"))
  if (allOk) updateReq(id, {}, hist(fmtDateTime(now), "Hệ thống", "Chia sẻ dữ liệu qua API thành công toàn bộ bản ghi"))
}
export function retryShare(id: string, actor: string) {
  const r = getRequest(id); if (!r || !r.shareStatuses) return
  const now = nowIso()
  const next: Record<string, ShareStatus> = { ...r.shareStatuses }
  Object.keys(next).forEach((k) => { if (next[k] === "Chia sẻ lỗi") next[k] = "Đã chia sẻ" })
  const allOk = Object.values(next).every((s) => s === "Đã chia sẻ")
  updateReq(id, { shareStatuses: next, trangThai: allOk ? "Đã cung cấp dữ liệu" : "Đang chia sẻ dữ liệu" }, hist(fmtDateTime(now), actor, "Thử lại chia sẻ bản ghi lỗi"))
  if (allOk) updateReq(id, {}, hist(fmtDateTime(now), "Hệ thống", "Chia sẻ dữ liệu qua API thành công toàn bộ bản ghi"))
}

function fmtDateTime(iso: string) { const d = new Date(iso); const p = (n: number) => String(n).padStart(2, "0"); return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}` }

/* ============================ PHẠM VI DỮ LIỆU (BR-01) ============================ */
export function scopeByRole(rows: DataProvideRequest[], role: DprRole) {
  if (isTchncc(role)) return rows.filter((r) => r.toChuc === CURRENT_ORG)
  return rows // CV STP / Lãnh đạo STP: toàn bộ TCHNCC thuộc phạm vi Sở (mô phỏng: toàn bộ danh sách mẫu)
}

/* ============================ VALIDATION ============================ */
export function validateForm(f: { toChuc: string; nguoiYeuCau: string; nenTang: string; tuNgay: string; denNgay: string; lyDo: string }): string {
  if (!f.toChuc || !f.nguoiYeuCau || !f.nenTang || !f.tuNgay || !f.denNgay || !f.lyDo.trim()) return "Vui lòng nhập đầy đủ thông tin bắt buộc."
  if (f.tuNgay > f.denNgay) return "Vui lòng chọn khoảng thời gian khôi phục hợp lệ."
  if (f.tuNgay > TODAY_ISO || f.denNgay > TODAY_ISO) return "Vui lòng chọn khoảng thời gian khôi phục hợp lệ."
  if (f.lyDo.trim().length < 10 || f.lyDo.trim().length > 500) return "Lý do yêu cầu khôi phục phải từ 10 đến 500 ký tự."
  return ""
}

export const exportMsg = (count: number) => count === 0 ? { msg: "Không có dữ liệu để xuất.", kind: "error" as const } : { msg: "Xuất danh sách yêu cầu thành công.", kind: "ok" as const }
