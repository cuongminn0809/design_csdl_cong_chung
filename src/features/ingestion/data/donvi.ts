import type { StatusMeta } from "../shared"

export interface DonVi {
  code: string
  name: string
  shortName: string
  src: "A" | "B" | "C1" | "C2"
  province: string
  email: string
  contact: string
  phone: string
  status: "active" | "inactive"
  connected: string
  address: string
  scope: string
  note: string
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}

export const SRC_INFO: Record<string, { label: string }> = {
  A: { label: "A — Nền tảng công chứng" },
  B: { label: "B — PM chuyển đổi CSDL địa phương" },
  C1: { label: "C1 — Hệ thống cung cấp dữ liệu (HSCDL)" },
  C2: { label: "C2 — Bên thứ ba (PMCD)" },
}

export const DONVI_STATUS: Record<string, StatusMeta> = {
  active: { label: "Hoạt động", dot: "#52C41A", bg: "#f0fdf4", fg: "#15803d", bd: "#bbf7d0" },
  inactive: { label: "Ngừng hoạt động", dot: "#8C8C8C", bg: "#f5f5f5", fg: "#525252", bd: "#e5e5e5" },
}

export const PROVINCES = [
  "(Trung ương)", "TP. Hà Nội", "TP. Hồ Chí Minh", "TP. Đà Nẵng", "TP. Hải Phòng",
  "TP. Cần Thơ", "Tỉnh Quảng Ninh", "Tỉnh Nghệ An", "Tỉnh Bình Dương",
]

export const DONVI_SEED: DonVi[] = [
  { code: "BTP-CORE", name: "Bộ Tư pháp", shortName: "Bộ Tư pháp", src: "A", province: "(Trung ương)", email: "ketnoi@moj.gov.vn", contact: "Nguyễn Văn Minh", phone: "024 6273 9718", status: "active", connected: "02/01/2022", address: "60 Trần Phú, Ba Đình, Hà Nội", scope: "Gói tin giao dịch công chứng toàn quốc, danh mục dùng chung.", note: "Đơn vị quản lý nhà nước cấp trung ương.", createdAt: "02/01/2022", createdBy: "admin", updatedAt: "11/05/2026", updatedBy: "admin" },
  { code: "STP-HN-001", name: "Sở Tư pháp TP. Hà Nội", shortName: "STP Hà Nội", src: "A", province: "TP. Hà Nội", email: "ketnoi@stp.hanoi.gov.vn", contact: "Trần Thị Hương", phone: "024 3825 1234", status: "active", connected: "12/03/2024", address: "221 Trần Phú, Hà Đông, Hà Nội", scope: "Kết quả giao dịch công chứng trên địa bàn Hà Nội.", note: "", createdAt: "12/03/2024", createdBy: "admin", updatedAt: "20/06/2026", updatedBy: "admin" },
  { code: "STP-HCM-001", name: "Sở Tư pháp TP. Hồ Chí Minh", shortName: "STP TP.HCM", src: "A", province: "TP. Hồ Chí Minh", email: "ketnoi@stp.hochiminhcity.gov.vn", contact: "Lê Hoàng Nam", phone: "028 3829 7178", status: "active", connected: "28/02/2024", address: "141-143 Pasteur, Quận 3, TP.HCM", scope: "Chứng thực bản sao, giao dịch công chứng khu vực phía Nam.", note: "", createdAt: "28/02/2024", createdBy: "admin", updatedAt: "28/02/2024", updatedBy: "admin" },
  { code: "C06-BCA", name: "Cục Cảnh sát QLHC về TTXH (C06) - Bộ Công an", shortName: "Cục C06", src: "C1", province: "(Trung ương)", email: "dvc@c06.bca.gov.vn", contact: "Phạm Quốc Anh", phone: "069 234 1099", status: "active", connected: "22/07/2024", address: "47 Phạm Văn Đồng, Cầu Giấy, Hà Nội", scope: "Xác thực định danh công dân, thông báo biến động dân cư.", note: "Kết nối qua trục NGSP.", createdAt: "22/07/2024", createdBy: "admin", updatedAt: "19/08/2026", updatedBy: "admin" },
  { code: "VPCC-NH-045", name: "Văn phòng Công chứng Nguyễn Huệ", shortName: "VPCC Nguyễn Huệ", src: "B", province: "TP. Hồ Chí Minh", email: "tichhop@vpccnguyenhue.vn", contact: "Đỗ Thị Lan", phone: "028 3822 4567", status: "active", connected: "02/04/2024", address: "12 Nguyễn Huệ, Quận 1, TP.HCM", scope: "Hồ sơ công chứng điện tử của văn phòng.", note: "", createdAt: "02/04/2024", createdBy: "admin", updatedAt: "02/04/2024", updatedBy: "admin" },
  { code: "TTDKGDBD", name: "Trung tâm Đăng ký Giao dịch bảo đảm", shortName: "TT ĐKGDBĐ", src: "C2", province: "TP. Hà Nội", email: "dvc@dkgdbd.moj.gov.vn", contact: "Vũ Đình Khoa", phone: "024 3736 2555", status: "active", connected: "10/11/2023", address: "58-60 Trần Phú, Ba Đình, Hà Nội", scope: "Tình trạng ngăn chặn, phong tỏa tài sản.", note: "", createdAt: "10/11/2023", createdBy: "admin", updatedAt: "10/11/2023", updatedBy: "admin" },
  { code: "TCT-01", name: "Tổng cục Thuế", shortName: "Tổng cục Thuế", src: "C2", province: "(Trung ương)", email: "ketnoi@gdt.gov.vn", contact: "Hoàng Minh Tuấn", phone: "024 3972 8000", status: "inactive", connected: "14/10/2023", address: "123 Lò Đúc, Hai Bà Trưng, Hà Nội", scope: "Nghĩa vụ tài chính, lệ phí trước bạ.", note: "Tạm ngừng do đối tác nâng cấp hệ thống.", createdAt: "14/10/2023", createdBy: "admin", updatedAt: "01/03/2026", updatedBy: "admin" },
  { code: "DKKD-NPT", name: "Cổng TTĐT Quốc gia về Đăng ký doanh nghiệp", shortName: "Cổng ĐKDN", src: "C2", province: "(Trung ương)", email: "dvc@dangkykinhdoanh.gov.vn", contact: "Ngô Bảo Châu", phone: "024 3767 8888", status: "active", connected: "09/01/2024", address: "6B Hoàng Diệu, Ba Đình, Hà Nội", scope: "Thông tin đăng ký doanh nghiệp.", note: "", createdAt: "09/01/2024", createdBy: "admin", updatedAt: "09/01/2024", updatedBy: "admin" },
  { code: "STNMT-HN", name: "Sở Tài nguyên & Môi trường TP. Hà Nội", shortName: "STNMT Hà Nội", src: "C2", province: "TP. Hà Nội", email: "tichhop@tnmt.hanoi.gov.vn", contact: "Bùi Thanh Sơn", phone: "024 3773 4444", status: "active", connected: "25/09/2023", address: "18 Huỳnh Thúc Kháng, Đống Đa, Hà Nội", scope: "Thông tin thửa đất, giấy chứng nhận QSDĐ.", note: "", createdAt: "25/09/2023", createdBy: "admin", updatedAt: "25/09/2023", updatedBy: "admin" },
  { code: "TANDTC", name: "Tòa án nhân dân tối cao", shortName: "TAND tối cao", src: "C1", province: "(Trung ương)", email: "dvc@toaan.gov.vn", contact: "Đặng Thu Hà", phone: "024 6273 9999", status: "active", connected: "07/12/2023", address: "48 Lý Thường Kiệt, Hoàn Kiếm, Hà Nội", scope: "Thông báo thụ lý vụ việc liên quan văn bản công chứng.", note: "", createdAt: "07/12/2023", createdBy: "admin", updatedAt: "07/12/2023", updatedBy: "admin" },
  { code: "PMCD-DN", name: "PM chuyển đổi CSDL Sở Tư pháp Đà Nẵng", shortName: "PMCD Đà Nẵng", src: "B", province: "TP. Đà Nẵng", email: "tichhop@stp.danang.gov.vn", contact: "Trương Văn Hải", phone: "0236 3821 021", status: "inactive", connected: "18/08/2023", address: "10 Trần Phú, Hải Châu, Đà Nẵng", scope: "Chuyển đổi CSDL công chứng địa phương.", note: "Ngừng do sáp nhập hệ thống.", createdAt: "18/08/2023", createdBy: "admin", updatedAt: "15/02/2026", updatedBy: "admin" },
  { code: "VPCC-TP-112", name: "Văn phòng Công chứng Trần Phú", shortName: "VPCC Trần Phú", src: "B", province: "TP. Hải Phòng", email: "tichhop@vpcctranphu.vn", contact: "Lý Thị Mai", phone: "0225 3842 118", status: "active", connected: "14/05/2024", address: "88 Trần Phú, Ngô Quyền, Hải Phòng", scope: "Hồ sơ công chứng điện tử.", note: "", createdAt: "14/05/2024", createdBy: "admin", updatedAt: "14/05/2024", updatedBy: "admin" },
]

export const parseVnDate = (s: string) => {
  const [dd, mm, yy] = s.split("/")
  return new Date(+yy, +mm - 1, +dd).getTime()
}
