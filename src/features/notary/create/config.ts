/* ============================ Danh mục loại / tên giao dịch ============================ */

/** Loại giao dịch (cha) → danh sách Tên giao dịch (con). */
export const LOAI_GD: Record<string, string[]> = {
  "Hợp đồng chuyển quyền": ["Mua bán", "Tặng cho", "Chuyển nhượng QSDĐ"],
  "Hợp đồng bảo đảm": ["Thế chấp", "Cầm cố", "Bảo lãnh"],
  "Văn bản ủy quyền": ["Ủy quyền", "Hủy ủy quyền"],
  "Văn bản khác": ["Khai nhận di sản", "Văn bản thỏa thuận", "Di chúc"],
}

export const LOAI_GD_OPTIONS = Object.keys(LOAI_GD)

/** Tra ngược Tên giao dịch → Loại giao dịch (cha) — dùng khi load bản ghi để chỉnh sửa. */
export const TEN_TO_LOAI: Record<string, string> = Object.entries(LOAI_GD).reduce((acc, [loai, tens]) => {
  tens.forEach((t) => { acc[t] = loai })
  return acc
}, {} as Record<string, string>)

/** "dd/mm/yyyy" → "yyyy-mm-dd" cho input[type=date]. */
export const toISODate = (vn?: string) => {
  if (!vn) return ""
  const [dd, mm, yy] = vn.split("/")
  return yy ? `${yy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}` : ""
}

/** Loại giao dịch pháp lý (để lưu vào Transaction.loaiGD hiển thị). */
export const LOAI_GD_LABEL: Record<string, string> = {
  "Mua bán": "Hợp đồng mua bán",
  "Tặng cho": "Hợp đồng tặng cho",
  "Chuyển nhượng QSDĐ": "Hợp đồng chuyển nhượng QSDĐ",
  "Thế chấp": "Hợp đồng thế chấp",
  "Cầm cố": "Hợp đồng cầm cố",
  "Bảo lãnh": "Hợp đồng bảo lãnh",
  "Ủy quyền": "Văn bản ủy quyền",
  "Hủy ủy quyền": "Văn bản hủy ủy quyền",
  "Khai nhận di sản": "Văn bản khai nhận di sản",
  "Văn bản thỏa thuận": "Văn bản thỏa thuận",
  "Di chúc": "Di chúc",
}

export const PHUONG_THUC = ["Công chứng giấy", "Công chứng điện tử", "Công chứng điện tử trực tuyến"]

/** Danh mục loại bên liên quan theo Tên giao dịch (BR005). */
export const BEN_LIEN_QUAN: Record<string, string[]> = {
  "Mua bán": ["Bên bán", "Bên mua"],
  "Tặng cho": ["Bên tặng cho", "Bên được tặng cho"],
  "Chuyển nhượng QSDĐ": ["Bên chuyển nhượng", "Bên nhận chuyển nhượng"],
  "Thế chấp": ["Bên thế chấp", "Bên nhận thế chấp"],
  "Cầm cố": ["Bên cầm cố", "Bên nhận cầm cố"],
  "Bảo lãnh": ["Bên bảo lãnh", "Bên nhận bảo lãnh"],
  "Ủy quyền": ["Bên ủy quyền", "Bên nhận ủy quyền"],
  "Hủy ủy quyền": ["Bên ủy quyền", "Bên nhận ủy quyền"],
}
export const DEFAULT_BLQ = ["Bên A", "Bên B", "Bên C", "Bên thứ ba"]

export const benOptionsFor = (tenGD: string) => BEN_LIEN_QUAN[tenGD] ?? DEFAULT_BLQ

export const isTheChap = (tenGD: string) => tenGD === "Thế chấp" || tenGD === "Cầm cố" || tenGD === "Bảo lãnh"
export const isUyQuyen = (tenGD: string) => tenGD === "Ủy quyền" || tenGD === "Hủy ủy quyền"

/* ============================ Tài sản: 14 loại + trường động ============================ */

export const ASSET_TYPES = [
  "Đất", "Đất và tài sản gắn liền với đất", "Hợp đồng mua bán BĐS hình thành trong tương lai", "Bất động sản khác",
  "Ô tô", "Mô tô - xe máy", "Tàu biển", "Tàu kéo - ghe - thuyền", "Tàu cá", "Tàu bay",
  "Sổ tiết kiệm", "Trái phiếu", "Cổ phiếu", "Tài sản khác",
]

export interface AssetField { code: string; label: string }

/** Trường chi tiết đặc thù theo loại tài sản (rút gọn các trường quan trọng). */
export const ASSET_DETAIL_FIELDS: Record<string, AssetField[]> = {
  "Đất": [
    { code: "thuaDatSo", label: "Thửa đất số" }, { code: "toBanDoSo", label: "Tờ bản đồ số" },
    { code: "dienTich", label: "Diện tích (m²)" }, { code: "mucDich", label: "Mục đích sử dụng" },
    { code: "diaChi", label: "Địa chỉ thửa đất" },
  ],
  "Đất và tài sản gắn liền với đất": [
    { code: "thuaDatSo", label: "Thửa đất số" }, { code: "dienTich", label: "Diện tích đất (m²)" },
    { code: "loaiTaiSanGanLien", label: "Loại tài sản gắn liền" }, { code: "tenTaiSan", label: "Tên tài sản" },
    { code: "diaChi", label: "Địa chỉ" },
  ],
  "Hợp đồng mua bán BĐS hình thành trong tương lai": [
    { code: "soHopDong", label: "Số hợp đồng" }, { code: "tenHopDong", label: "Tên hợp đồng" },
    { code: "tenTaiSan", label: "Tên tài sản" }, { code: "dienTich", label: "Diện tích (m²)" }, { code: "diaChi", label: "Địa chỉ" },
  ],
  "Bất động sản khác": [
    { code: "soVaoSoGCN", label: "Số vào sổ GCN" }, { code: "thuaDatSo", label: "Thửa đất số" }, { code: "diaChi", label: "Địa chỉ" },
  ],
  "Ô tô": [
    { code: "bienKiemSoat", label: "Biển kiểm soát" }, { code: "soKhung", label: "Số khung" }, { code: "soMay", label: "Số máy" },
    { code: "nhanHieu", label: "Nhãn hiệu" }, { code: "mauSon", label: "Màu sơn" }, { code: "namSanXuat", label: "Năm sản xuất" },
  ],
  "Mô tô - xe máy": [
    { code: "bienKiemSoat", label: "Biển kiểm soát" }, { code: "soKhung", label: "Số khung" }, { code: "soMay", label: "Số máy" },
    { code: "nhanHieu", label: "Nhãn hiệu" }, { code: "mauSon", label: "Màu sơn" }, { code: "namSanXuat", label: "Năm sản xuất" },
  ],
  "Tàu biển": [
    { code: "tenTau", label: "Tên tàu" }, { code: "hoHieu", label: "Hô hiệu" }, { code: "loaiTau", label: "Loại tàu" },
    { code: "namDongTau", label: "Năm đóng tàu" }, { code: "cangDangKy", label: "Cảng đăng ký" },
  ],
  "Tàu kéo - ghe - thuyền": [
    { code: "tenPhuongTien", label: "Tên phương tiện" }, { code: "hoHieu", label: "Hô hiệu" },
    { code: "loaiPhuongTien", label: "Loại phương tiện" }, { code: "namDong", label: "Năm đóng" },
  ],
  "Tàu cá": [
    { code: "tenTau", label: "Tên tàu cá" }, { code: "soDangKy", label: "Số đăng ký tàu cá" },
    { code: "loaiTau", label: "Loại tàu cá" }, { code: "cangDangKy", label: "Cảng đăng ký" },
  ],
  "Tàu bay": [
    { code: "soHieuDangKy", label: "Số hiệu đăng ký" }, { code: "loaiTauBay", label: "Loại tàu bay" },
    { code: "nhaSanXuat", label: "Nhà sản xuất" }, { code: "namXuatXuong", label: "Năm xuất xưởng" },
  ],
  "Sổ tiết kiệm": [
    { code: "tenTaiSan", label: "Tên tài sản" }, { code: "soDuTienGui", label: "Số dư tiền gửi" }, { code: "kyHan", label: "Kỳ hạn" },
  ],
  "Trái phiếu": [
    { code: "tenTraiPhieu", label: "Tên trái phiếu" }, { code: "soLuong", label: "Số lượng" },
    { code: "menhGia", label: "Mệnh giá" }, { code: "kyHan", label: "Kỳ hạn" },
  ],
  "Cổ phiếu": [
    { code: "maSoCoPhieu", label: "Mã số cổ phiếu" }, { code: "soLuong", label: "Số lượng" },
    { code: "loaiCoPhieu", label: "Loại cổ phiếu" }, { code: "menhGia", label: "Mệnh giá / cổ phiếu" },
  ],
  "Tài sản khác": [
    { code: "tenTaiSan", label: "Tên tài sản" }, { code: "thongTinTaiSan", label: "Thông tin tài sản" },
  ],
}

export const GIOI_TINH = ["Nam", "Nữ", "Khác"]
export const QUOC_TICH = ["Việt Nam", "Hoa Kỳ", "Nhật Bản", "Hàn Quốc", "Trung Quốc", "Khác"]
export const PERSON_DOC_TYPES = ["Căn cước", "CMND", "Hộ chiếu", "Giấy khai sinh"]
export const ORG_DOC_TYPES = ["Giấy đăng ký kinh doanh", "Quyết định thành lập", "Giấy phép đầu tư"]
export const PROVINCES = ["Hà Nội", "TP. Hồ Chí Minh", "Kiên Giang", "Cần Thơ", "Đà Nẵng", "Hải Phòng", "An Giang"]

/* ============================ Đọc số tiền thành chữ (BR004) ============================ */

const DV = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"]

function readThree(n: number, full: boolean): string {
  const tram = Math.floor(n / 100)
  const chuc = Math.floor((n % 100) / 10)
  const donvi = n % 10
  let s = ""
  if (tram > 0) s += DV[tram] + " trăm"
  else if (full) s += "không trăm"
  if (chuc > 1) {
    s += " " + DV[chuc] + " mươi"
    if (donvi === 1) s += " mốt"
    else if (donvi === 5) s += " lăm"
    else if (donvi > 0) s += " " + DV[donvi]
  } else if (chuc === 1) {
    s += " mười"
    if (donvi === 5) s += " lăm"
    else if (donvi > 0) s += " " + DV[donvi]
  } else if (donvi > 0) {
    if (tram > 0 || full) s += " lẻ"
    s += " " + DV[donvi]
  }
  return s.trim()
}

/** Chuyển số tiền VND thành chữ tiếng Việt (BR004). */
export function docSoThanhChu(value: number): string {
  if (!value || value <= 0) return ""
  const units = ["", " nghìn", " triệu", " tỷ"]
  const groups: number[] = []
  let n = Math.floor(value)
  while (n > 0) { groups.push(n % 1000); n = Math.floor(n / 1000) }
  let result = ""
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] === 0) continue
    const isFirst = i === groups.length - 1
    const chunk = readThree(groups[i], !isFirst)
    if (chunk) result += (result ? " " : "") + chunk + units[i]
  }
  result = result.trim()
  return result ? result.charAt(0).toUpperCase() + result.slice(1) + " đồng chẵn" : ""
}
