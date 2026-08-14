import type { StatusMeta } from "../ingestion/shared"

export type Method = "paper" | "electronic"
export type NguonDL = "platform" | "converter"
export type HoSoStatus = "draft" | "pending" | "revise" | "approved"
export type GiaiChap = "none" | "chua" | "da"

export interface Party {
  name: string
  isOrg?: boolean
  giayTo: string
  diaChi: string
  vaiTro: string
}
export interface Asset {
  loai: string
  gcn: string
  chuSoHuu: string
  dacDiem: string
}
export interface DocFile {
  name: string
  group?: "taisan" | "nhanthan"
}

export interface Transaction {
  id: string
  method: Method
  soCC: string
  ngayCC: string
  tenGD: string
  loaiGD: string
  parties: Party[]
  assets: Asset[]
  toChuc: string
  ccv: string
  nguon: NguonDL
  createdAt: string
  trangThaiHoSo: HoSoStatus
  giaiChap: GiaiChap
  // detail
  giaTri: number
  giaTriChu: string
  diaDiem: string
  maThamChieu: string
  noiDung: string
  phi: number
  thuLao: number
  ghiChu: string
  thoiHanGiaiChap?: string
  ngayGiaiChap?: string
  ghiChuGiaiChap?: string
  scanFile?: string
  hoSoLuuTru?: string[]
  signedFile?: string
  signValid?: boolean
  thanhPhan?: DocFile[]
  /** Ý kiến phản hồi của Trưởng TCHNCC khi Yêu cầu sửa (BR-04). */
  ghiChuPhanHoi?: string
}

export const TEN_GD_OPTIONS = ["Mua bán", "Tặng cho", "Thế chấp", "Ủy quyền", "Khai nhận di sản", "Văn bản thỏa thuận"]

export const NGUON_LABEL: Record<NguonDL, string> = { platform: "Tên nền tảng CC", converter: "PM Chuyển đổi" }
export const NGUON_DETAIL_LABEL: Record<NguonDL, string> = { platform: "Nền tảng công chứng", converter: "Phần mềm chuyển đổi" }
export const NGUON_COLOR: Record<NguonDL, { bg: string; fg: string; bd: string }> = {
  platform: { bg: "#eff6ff", fg: "#1d4ed8", bd: "#bfdbfe" },
  converter: { bg: "#fff7ed", fg: "#c2410c", bd: "#fed7aa" },
}

export const HOSO_STATUS: Record<HoSoStatus, StatusMeta> = {
  draft: { label: "Lưu nháp", bg: "#f5f5f5", fg: "#525252", dot: "#a3a3a3", bd: "#e5e5e5" },
  pending: { label: "Chờ duyệt", bg: "#eff6ff", fg: "#1d4ed8", dot: "#3b82f6", bd: "#bfdbfe" },
  revise: { label: "Yêu cầu sửa", bg: "#fffbeb", fg: "#b45309", dot: "#f59e0b", bd: "#fde68a" },
  approved: { label: "Đã duyệt", bg: "#f0fdf4", fg: "#15803d", dot: "#22c55e", bd: "#bbf7d0" },
}

export const GIAICHAP_META: Record<GiaiChap, { label: string; bg?: string; fg?: string; bd?: string }> = {
  none: { label: "—" },
  chua: { label: "Chưa giải chấp", bg: "#fffbeb", fg: "#b45309", bd: "#fde68a" },
  da: { label: "Đã giải chấp", bg: "#f0fdf4", fg: "#15803d", bd: "#bbf7d0" },
}

const P = (name: string, giayTo: string, diaChi: string, vaiTro: string, isOrg = false): Party => ({ name, giayTo, diaChi, vaiTro, isOrg })
const A = (loai: string, gcn: string, chuSoHuu: string, dacDiem: string): Asset => ({ loai, gcn, chuSoHuu, dacDiem })

export const TRANSACTIONS: Transaction[] = [
  // ---- Giấy ----
  {
    id: "PAP-102-2026", method: "paper", soCC: "102/2026", ngayCC: "28/06/2026", tenGD: "Thế chấp", loaiGD: "Hợp đồng thế chấp",
    parties: [P("Nguyễn Văn A", "CCCD: 001095001234", "Hà Nội", "Bản thân"), P("Ngân hàng TMCP Kiên Long", "MST: 0300123456", "Rạch Giá, Kiên Giang", "Bên nhận thế chấp", true)],
    assets: [A("Đất", "GCN số 123/2024", "Nguyễn Văn A", "Thửa đất số 10, Bản đồ số 4, TP. Rạch Giá")],
    toChuc: "VPCC Rạch Giá", ccv: "Dương Minh Diển", nguon: "platform", createdAt: "28/06/2026 14:30:22", trangThaiHoSo: "approved", giaiChap: "chua",
    giaTri: 2_000_000_000, giaTriChu: "Hai tỷ đồng chẵn", diaDiem: "Văn phòng công chứng Rạch Giá", maThamChieu: "Ref-123456",
    noiDung: "Thế chấp quyền sử dụng đất tại Rạch Giá để vay vốn.", phi: 1_500_000, thuLao: 500_000, ghiChu: "Hồ sơ đầy đủ.",
    thoiHanGiaiChap: "36 tháng", ngayGiaiChap: "--", ghiChuGiaiChap: "--",
    scanFile: "VanBanCongChungScan.pdf", hoSoLuuTru: ["GiayToNhanThan_BenA.pdf", "GiayChungNhanQSDD.pdf"],
  },
  {
    id: "PAP-101-2026", method: "paper", soCC: "101/2026", ngayCC: "28/06/2026", tenGD: "Ủy quyền", loaiGD: "Văn bản ủy quyền",
    parties: [P("Trần Thị B", "CCCD: 001188005678", "TP. Rạch Giá", "Bên ủy quyền"), P("Lê Văn C", "CCCD: 001190009012", "TP. Hà Tiên", "Bên được ủy quyền")],
    assets: [A("Ô tô", "Đăng ký xe: 68A-123.45", "Trần Thị B", "Toyota Vios, màu trắng, biển số 68A-123.45")],
    toChuc: "VPCC Rạch Giá", ccv: "Nguyễn A", nguon: "platform", createdAt: "28/06/2026 09:12:00", trangThaiHoSo: "approved", giaiChap: "none",
    giaTri: 0, giaTriChu: "Không", diaDiem: "Văn phòng công chứng Rạch Giá", maThamChieu: "Ref-123455",
    noiDung: "Ủy quyền định đoạt tài sản là xe ô tô.", phi: 200_000, thuLao: 100_000, ghiChu: "",
    scanFile: "VanBanUyQuyen.pdf", hoSoLuuTru: ["DangKyXe_Oto.pdf"],
  },
  {
    id: "PAP-99-2026", method: "paper", soCC: "99/2026", ngayCC: "25/06/2026", tenGD: "Thế chấp", loaiGD: "Hợp đồng thế chấp",
    parties: [P("Phạm Văn D", "CCCD: 001085001111", "TP. Rạch Giá", "Bên thế chấp")],
    assets: [A("Đất", "GCN số 88/2023", "Phạm Văn D", "Thửa đất số 25, Bản đồ số 7, TP. Rạch Giá")],
    toChuc: "VPCC Rạch Giá", ccv: "Trần B", nguon: "converter", createdAt: "25/06/2026 09:15:00", trangThaiHoSo: "approved", giaiChap: "da",
    giaTri: 1_200_000_000, giaTriChu: "Một tỷ hai trăm triệu đồng", diaDiem: "Văn phòng công chứng Rạch Giá", maThamChieu: "Ref-123400",
    noiDung: "Thế chấp quyền sử dụng đất.", phi: 900_000, thuLao: 300_000, ghiChu: "Đã tất toán khoản vay.",
    thoiHanGiaiChap: "24 tháng", ngayGiaiChap: "20/06/2026", ghiChuGiaiChap: "Đã giải chấp toàn bộ.",
    scanFile: "HopDongTheChap_D.pdf", hoSoLuuTru: ["GiayToNhanThan_D.pdf", "SoDo_D.pdf"],
  },
  {
    id: "PAP-97-2026", method: "paper", soCC: "97/2026", ngayCC: "22/06/2026", tenGD: "Mua bán", loaiGD: "Hợp đồng mua bán",
    parties: [P("Võ Thị E", "CCCD: 001192003333", "TP. Rạch Giá", "Bên bán"), P("Đặng Văn F", "CCCD: 001188004444", "TP. Cần Thơ", "Bên mua")],
    assets: [A("Nhà ở", "GCN số 45/2022", "Võ Thị E", "Nhà số 12 đường Nguyễn Trung Trực, TP. Rạch Giá")],
    toChuc: "VPCC Kiên Giang", ccv: "Nguyễn A", nguon: "platform", createdAt: "22/06/2026 15:40:10", trangThaiHoSo: "approved", giaiChap: "none",
    giaTri: 3_000_000_000, giaTriChu: "Ba tỷ đồng chẵn", diaDiem: "Văn phòng công chứng Kiên Giang", maThamChieu: "Ref-123390",
    noiDung: "Mua bán nhà ở.", phi: 2_200_000, thuLao: 700_000, ghiChu: "",
    scanFile: "HopDongMuaBan_Nha.pdf", hoSoLuuTru: ["GiayToNhanThan_E.pdf", "GiayToNhanThan_F.pdf"],
  },
  {
    id: "PAP-95-2026", method: "paper", soCC: "95/2026", ngayCC: "20/06/2026", tenGD: "Tặng cho", loaiGD: "Hợp đồng tặng cho",
    parties: [P("Bùi Văn G", "CCCD: 001060005555", "TP. Rạch Giá", "Bên tặng cho"), P("Bùi Thị H", "CCCD: 001195006666", "TP. Rạch Giá", "Bên được tặng cho")],
    assets: [A("Đất", "GCN số 66/2020", "Bùi Văn G", "Thửa đất số 30, Bản đồ số 2, TP. Rạch Giá")],
    toChuc: "VPCC Rạch Giá", ccv: "Trần B", nguon: "converter", createdAt: "20/06/2026 10:05:33", trangThaiHoSo: "pending", giaiChap: "none",
    giaTri: 800_000_000, giaTriChu: "Tám trăm triệu đồng", diaDiem: "Văn phòng công chứng Rạch Giá", maThamChieu: "Ref-123380",
    noiDung: "Tặng cho quyền sử dụng đất giữa cha và con.", phi: 600_000, thuLao: 200_000, ghiChu: "Chờ bổ sung giấy tờ.",
    scanFile: "", hoSoLuuTru: ["GiayToNhanThan_G.pdf"],
  },
  {
    id: "PAP-93-2026", method: "paper", soCC: "93/2026", ngayCC: "18/06/2026", tenGD: "Khai nhận di sản", loaiGD: "Văn bản khai nhận di sản",
    parties: [P("Trương Thị K", "CCCD: 001178007777", "TP. Rạch Giá", "Người khai nhận")],
    assets: [A("Nhà ở", "GCN số 21/2019", "Trương Văn L (đã mất)", "Nhà số 7 đường Trần Phú, TP. Rạch Giá")],
    toChuc: "VPCC Kiên Giang", ccv: "Nguyễn A", nguon: "platform", createdAt: "18/06/2026 11:20:44", trangThaiHoSo: "revise", giaiChap: "none",
    giaTri: 1_500_000_000, giaTriChu: "Một tỷ năm trăm triệu đồng", diaDiem: "Văn phòng công chứng Kiên Giang", maThamChieu: "Ref-123370",
    noiDung: "Khai nhận di sản thừa kế nhà ở.", phi: 1_100_000, thuLao: 400_000, ghiChu: "Cần bổ sung giấy chứng tử.",
    ghiChuPhanHoi: "Thiếu giấy chứng tử của người để lại di sản và văn bản từ chối nhận di sản của các đồng thừa kế. Đề nghị bổ sung và trình duyệt lại.",
    scanFile: "", hoSoLuuTru: [],
  },
  {
    id: "PAP-90-2026", method: "paper", soCC: "90/2026", ngayCC: "15/06/2026", tenGD: "Văn bản thỏa thuận", loaiGD: "Văn bản thỏa thuận phân chia tài sản",
    parties: [P("Ngô Văn M", "CCCD: 001082008888", "TP. Rạch Giá", "Bên thứ nhất"), P("Ngô Thị N", "CCCD: 001185009999", "TP. Rạch Giá", "Bên thứ hai")],
    assets: [A("Đất", "GCN số 11/2018", "Ngô Văn M & Ngô Thị N", "Thửa đất số 5, Bản đồ số 1, TP. Rạch Giá")],
    toChuc: "VPCC Rạch Giá", ccv: "Trần B", nguon: "platform", createdAt: "15/06/2026 08:00:00", trangThaiHoSo: "draft", giaiChap: "none",
    giaTri: 0, giaTriChu: "Không", diaDiem: "Văn phòng công chứng Rạch Giá", maThamChieu: "Ref-123350",
    noiDung: "Thỏa thuận phân chia tài sản chung.", phi: 300_000, thuLao: 100_000, ghiChu: "Bản nháp.",
    scanFile: "", hoSoLuuTru: [],
  },

  // ---- Điện tử ----
  {
    id: "ELE-105-2026", method: "electronic", soCC: "105/2026", ngayCC: "29/06/2026", tenGD: "Mua bán", loaiGD: "Hợp đồng mua bán",
    parties: [P("Nguyễn Văn A", "CCCD: 001090001234", "Hà Nội", "Bên chuyển nhượng"), P("Lý Thị B", "CCCD: 001192002345", "TP. Rạch Giá", "Bên nhận chuyển nhượng")],
    assets: [A("Đất", "GCN số 456/2026", "Nguyễn Văn A", "Thửa đất số 12, Bản đồ số 4, TP. Rạch Giá")],
    toChuc: "VPCC Rạch Giá", ccv: "Nguyễn B", nguon: "platform", createdAt: "29/06/2026 10:11:45", trangThaiHoSo: "approved", giaiChap: "none",
    giaTri: 3_500_000_000, giaTriChu: "Ba tỷ năm trăm triệu đồng chẵn", diaDiem: "Văn phòng công chứng Rạch Giá", maThamChieu: "Ref-987654",
    noiDung: "Mua bán nhà đất tại Rạch Giá giữa Bên A và Bên B.", phi: 2_500_000, thuLao: 800_000, ghiChu: "Đầy đủ chữ ký số của các bên tham gia.",
    signedFile: "VanBanCongChungDT.pdf", signValid: true,
    thanhPhan: [{ name: "GiayChungNhanQSDD.pdf", group: "taisan" }, { name: "CCCD_BenA.pdf", group: "nhanthan" }, { name: "CCCD_BenB.pdf", group: "nhanthan" }],
  },
  {
    id: "ELE-104-2026", method: "electronic", soCC: "104/2026", ngayCC: "28/06/2026", tenGD: "Tặng cho", loaiGD: "Hợp đồng tặng cho",
    parties: [P("Hồ Văn C", "CCCD: 001075003456", "TP. Rạch Giá", "Bên tặng cho"), P("Hồ Thị D", "CCCD: 001198004567", "TP. Rạch Giá", "Bên được tặng cho")],
    assets: [A("Căn hộ chung cư", "GCN số 302/2025", "Hồ Văn C", "Căn hộ A-1203, chung cư Kiên Giang Tower")],
    toChuc: "VPCC Rạch Giá", ccv: "Nguyễn B", nguon: "platform", createdAt: "28/06/2026 14:02:19", trangThaiHoSo: "approved", giaiChap: "none",
    giaTri: 2_100_000_000, giaTriChu: "Hai tỷ một trăm triệu đồng", diaDiem: "Văn phòng công chứng Rạch Giá", maThamChieu: "Ref-987640",
    noiDung: "Tặng cho căn hộ chung cư.", phi: 1_600_000, thuLao: 500_000, ghiChu: "",
    signedFile: "TangCho_CanHo.pdf", signValid: true,
    thanhPhan: [{ name: "GCN_CanHo.pdf", group: "taisan" }, { name: "CCCD_HoVanC.pdf", group: "nhanthan" }],
  },
  {
    id: "ELE-96-2026", method: "electronic", soCC: "96/2026", ngayCC: "24/06/2026", tenGD: "Thế chấp", loaiGD: "Hợp đồng thế chấp",
    parties: [P("Đoàn Văn E", "CCCD: 001083005678", "TP. Rạch Giá", "Bên thế chấp"), P("Ngân hàng TMCP Đại Dương", "MST: 0301998877", "TP.HCM", "Bên nhận thế chấp", true)],
    assets: [A("Căn hộ chung cư", "GCN số 210/2024", "Đoàn Văn E", "Căn hộ B-0801, chung cư Rạch Sỏi")],
    toChuc: "VPCC Kiên Giang", ccv: "Nguyễn B", nguon: "converter", createdAt: "24/06/2026 16:22:00", trangThaiHoSo: "approved", giaiChap: "chua",
    giaTri: 1_800_000_000, giaTriChu: "Một tỷ tám trăm triệu đồng", diaDiem: "Văn phòng công chứng Kiên Giang", maThamChieu: "Ref-987600",
    noiDung: "Thế chấp căn hộ chung cư để vay vốn ngân hàng.", phi: 1_400_000, thuLao: 450_000, ghiChu: "",
    thoiHanGiaiChap: "48 tháng", ngayGiaiChap: "--", ghiChuGiaiChap: "--",
    signedFile: "TheChap_CanHo.pdf", signValid: true,
    thanhPhan: [{ name: "GCN_CanHo_E.pdf", group: "taisan" }, { name: "CCCD_DoanVanE.pdf", group: "nhanthan" }],
  },
  {
    id: "ELE-92-2026", method: "electronic", soCC: "92/2026", ngayCC: "20/06/2026", tenGD: "Ủy quyền", loaiGD: "Văn bản ủy quyền",
    parties: [P("Cao Thị F", "CCCD: 001194006789", "TP. Rạch Giá", "Bên ủy quyền"), P("Cao Văn G", "CCCD: 001091007890", "TP. Hà Tiên", "Bên được ủy quyền")],
    assets: [],
    toChuc: "VPCC Rạch Giá", ccv: "Nguyễn B", nguon: "platform", createdAt: "20/06/2026 08:44:12", trangThaiHoSo: "pending", giaiChap: "none",
    giaTri: 0, giaTriChu: "Không", diaDiem: "Văn phòng công chứng Rạch Giá", maThamChieu: "Ref-987560",
    noiDung: "Ủy quyền thực hiện thủ tục hành chính.", phi: 150_000, thuLao: 100_000, ghiChu: "Đang chờ duyệt.",
    signedFile: "UyQuyen_HanhChinh.pdf", signValid: true,
    thanhPhan: [{ name: "CCCD_CaoThiF.pdf", group: "nhanthan" }],
  },
  {
    id: "ELE-88-2026", method: "electronic", soCC: "88/2026", ngayCC: "16/06/2026", tenGD: "Mua bán", loaiGD: "Hợp đồng mua bán",
    parties: [P("Dương Văn H", "CCCD: 001079008901", "TP. Rạch Giá", "Bên bán"), P("Dương Thị K", "CCCD: 001196009012", "TP. Cần Thơ", "Bên mua")],
    assets: [A("Đất", "GCN số 501/2025", "Dương Văn H", "Thửa đất số 40, Bản đồ số 9, TP. Rạch Giá")],
    toChuc: "VPCC Kiên Giang", ccv: "Nguyễn B", nguon: "converter", createdAt: "16/06/2026 13:30:55", trangThaiHoSo: "revise", giaiChap: "none",
    giaTri: 2_800_000_000, giaTriChu: "Hai tỷ tám trăm triệu đồng", diaDiem: "Văn phòng công chứng Kiên Giang", maThamChieu: "Ref-987500",
    noiDung: "Mua bán quyền sử dụng đất.", phi: 2_000_000, thuLao: 650_000, ghiChu: "Cần cập nhật thông tin bên mua.",
    ghiChuPhanHoi: "Thông tin số giấy tờ tùy thân của bên mua chưa khớp với giấy chứng nhận. Đề nghị rà soát, chuẩn hóa và trình duyệt lại.",
    signedFile: "MuaBan_Dat_H.pdf", signValid: false,
    thanhPhan: [{ name: "GCN_Dat_H.pdf", group: "taisan" }, { name: "CCCD_DuongVanH.pdf", group: "nhanthan" }],
  },
  {
    id: "ELE-85-2026", method: "electronic", soCC: "85/2026", ngayCC: "12/06/2026", tenGD: "Văn bản thỏa thuận", loaiGD: "Văn bản thỏa thuận tài sản vợ chồng",
    parties: [P("Mai Văn L", "CCCD: 001084001010", "TP. Rạch Giá", "Bên thứ nhất"), P("Mai Thị M", "CCCD: 001187002020", "TP. Rạch Giá", "Bên thứ hai")],
    assets: [],
    toChuc: "VPCC Rạch Giá", ccv: "Nguyễn B", nguon: "platform", createdAt: "12/06/2026 09:00:00", trangThaiHoSo: "draft", giaiChap: "none",
    giaTri: 0, giaTriChu: "Không", diaDiem: "Văn phòng công chứng Rạch Giá", maThamChieu: "Ref-987450",
    noiDung: "Thỏa thuận về chế độ tài sản của vợ chồng.", phi: 250_000, thuLao: 150_000, ghiChu: "Bản nháp.",
    signedFile: "ThoaThuan_TaiSan.pdf", signValid: true,
    thanhPhan: [{ name: "CCCD_MaiVanL.pdf", group: "nhanthan" }, { name: "CCCD_MaiThiM.pdf", group: "nhanthan" }],
  },
]

export const nfCurrency = (n: number) => (n > 0 ? n.toLocaleString("vi-VN") + " VND" : "—")
export const partySummary = (t: Transaction) => t.parties.map((p) => p.name).join("; ")
export const assetSummary = (t: Transaction) => (t.assets.length ? t.assets.map((a) => `${a.loai} (${a.gcn})`).join("; ") : "—")
