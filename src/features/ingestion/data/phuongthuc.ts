import type { StatusMeta } from "../shared"

export interface MethodVersion {
  version: string
  status: "current" | "supported" | "deprecated"
  released: string
  eol: string | null
  changelog: string
}

export interface Method {
  code: string
  name: string
  src: "A" | "B" | "C1" | "C2"
  unit: string | null
  http: "GET" | "POST" | "PUT" | "DELETE"
  ep: string
  payload: string
  ver: string
  status: "active" | "inactive" | "deprecated"
  release: string
  desc: string
  note?: string
  versions?: MethodVersion[]
}

export const METHOD_SRC: Record<string, { label: string }> = {
  A: { label: "A — Cơ quan quản lý nhà nước" },
  B: { label: "B — Nội bộ hệ thống" },
  C1: { label: "C1 — Tổ chức hành nghề công chứng" },
  C2: { label: "C2 — Bên thứ ba" },
}

export const METHOD_STATUS: Record<string, StatusMeta> = {
  active: { label: "Hiệu lực", dot: "#52C41A", bg: "#f0fdf4", fg: "#15803d", bd: "#bbf7d0" },
  inactive: { label: "Ngừng hoạt động", dot: "#8C8C8C", bg: "#f5f5f5", fg: "#525252", bd: "#e5e5e5" },
  deprecated: { label: "Deprecated", dot: "#FA8C16", bg: "#fff7ed", fg: "#c2410c", bd: "#fed7aa" },
}

export const VSTATUS: Record<string, { label: string; bg: string; fg: string }> = {
  current: { label: "Current", bg: "#16a34a", fg: "#ffffff" },
  supported: { label: "Supported", bg: "#dcfce7", fg: "#15803d" },
  deprecated: { label: "Deprecated", bg: "#fff7ed", fg: "#c2410c" },
}

export const HTTP_COLOR: Record<string, string> = { GET: "#2563eb", POST: "#16a34a", PUT: "#b45309", DELETE: "#dc2626" }

export const METHOD_SEED: Method[] = [
  { code: "MT-GDCC-PUSH", name: "Push gói tin giao dịch công chứng", src: "A", unit: "Sở Tư pháp TP. Hà Nội", http: "POST", ep: "/api/v1/integration/gdcc/packages", payload: "JSON", ver: "v2.1", status: "active", release: "12/03/2024", desc: "Đẩy gói tin kết quả giao dịch công chứng từ tổ chức hành nghề lên kho CSDL công chứng tập trung.", note: "Áp dụng cho các đơn vị đã ký thỏa thuận tích hợp với Bộ Tư pháp.", versions: [
    { version: "v2.1", status: "current", released: "12/03/2024", eol: null, changelog: "Bổ sung trường mã tỉnh/thành, chuẩn hóa timestamp theo ISO-8601." },
    { version: "v2.0", status: "supported", released: "05/09/2023", eol: null, changelog: "Tách endpoint theo loại giao dịch, bổ sung ký số gói tin." },
    { version: "v1.0", status: "deprecated", released: "20/01/2022", eol: "31/12/2023", changelog: "Phiên bản khởi tạo." },
  ] },
  { code: "MT-NOTARY-OFFICER", name: "Đồng bộ danh mục công chứng viên", src: "B", unit: null, http: "GET", ep: "/api/v1/catalog/notary-officers", payload: "JSON", ver: "v1.2", status: "active", release: "18/06/2024", desc: "Đồng bộ danh sách công chứng viên đang hành nghề giữa các phân hệ nội bộ." },
  { code: "MT-ENOTARY-DOC", name: "Nhận hồ sơ công chứng điện tử", src: "C1", unit: "VPCC Nguyễn Huệ", http: "POST", ep: "/api/v1/e-notary/documents", payload: "JSON", ver: "v2.0", status: "active", release: "02/04/2024", desc: "Tiếp nhận hồ sơ công chứng điện tử được nộp trực tuyến từ tổ chức hành nghề công chứng." },
  { code: "MT-ASSET-BLOCK", name: "Tra cứu thông tin ngăn chặn tài sản", src: "C2", unit: "Trung tâm ĐK Giao dịch bảo đảm", http: "GET", ep: "/api/v1/assets/blocking-status", payload: "JSON", ver: "v1.5", status: "active", release: "10/11/2023", desc: "Kiểm tra tình trạng ngăn chặn, phong tỏa của tài sản trước khi thực hiện công chứng." },
  { code: "MT-AUTH-COPY", name: "Push kết quả chứng thực bản sao", src: "A", unit: "Sở Tư pháp TP. Hồ Chí Minh", http: "POST", ep: "/api/v1/authentication/certified-copies", payload: "XML", ver: "v1.0", status: "active", release: "28/02/2024", desc: "Gửi kết quả chứng thực bản sao từ bản chính lên hệ thống quản lý tập trung." },
  { code: "MT-CONTRACT-SYNC", name: "Đồng bộ trạng thái hợp đồng công chứng", src: "B", unit: null, http: "PUT", ep: "/api/v1/contracts/status", payload: "JSON", ver: "v3.0", status: "active", release: "15/05/2024", desc: "Cập nhật trạng thái vòng đời của hợp đồng công chứng giữa các phân hệ." },
  { code: "MT-POP-NOTIFY", name: "Nhận thông báo CSDL quốc gia về dân cư", src: "C1", unit: "Cục C06 - Bộ Công an", http: "POST", ep: "/api/v1/national-population/notifications", payload: "JSON", ver: "v2.2", status: "active", release: "22/07/2024", desc: "Tiếp nhận thông báo thay đổi thông tin công dân từ CSDL quốc gia về dân cư." },
  { code: "MT-ENT-LOOKUP", name: "Tra cứu thông tin doanh nghiệp", src: "C2", unit: "Cổng TTĐT Quốc gia về ĐKDN", http: "GET", ep: "/api/v1/enterprise/lookup", payload: "JSON", ver: "v1.1", status: "active", release: "09/01/2024", desc: "Tra cứu thông tin đăng ký doanh nghiệp phục vụ xác minh chủ thể hợp đồng." },
  { code: "MT-SECTX-LOG", name: "Push nhật ký giao dịch bảo đảm", src: "A", unit: "Bộ Tư pháp", http: "POST", ep: "/api/v1/secured-transactions/logs", payload: "JSON", ver: "v1.3", status: "active", release: "03/03/2024", desc: "Đẩy nhật ký đăng ký giao dịch bảo đảm liên quan tới hợp đồng công chứng." },
  { code: "MT-FORM-SYNC", name: "Đồng bộ biểu mẫu công chứng", src: "B", unit: null, http: "GET", ep: "/api/v1/catalog/notary-forms", payload: "JSON", ver: "v1.0", status: "active", release: "01/06/2024", desc: "Đồng bộ bộ biểu mẫu công chứng chuẩn dùng chung trong toàn hệ thống." },
  { code: "MT-CITIZEN-VERIFY", name: "Xác thực thông tin công dân", src: "C1", unit: "Cục C06 - Bộ Công an", http: "POST", ep: "/api/v1/citizen/verify", payload: "JSON", ver: "v2.4", status: "active", release: "19/08/2024", desc: "Xác thực thông tin định danh của công dân theo số CCCD phục vụ nghiệp vụ công chứng." },
  { code: "MT-LAND-INFO", name: "Tra cứu thông tin thửa đất", src: "C2", unit: "Sở Tài nguyên & Môi trường", http: "GET", ep: "/api/v1/land/parcel-info", payload: "JSON", ver: "v1.0", status: "active", release: "25/09/2023", desc: "Tra cứu thông tin thửa đất, giấy chứng nhận phục vụ công chứng giao dịch bất động sản." },
  { code: "MT-SIGN-VERIFY", name: "Kiểm tra chữ ký số", src: "B", unit: null, http: "POST", ep: "/api/v1/signature/verify", payload: "JSON", ver: "v2.0", status: "active", release: "11/04/2024", desc: "Kiểm tra tính hợp lệ của chữ ký số trên hồ sơ, gói tin công chứng." },
  { code: "MT-COURT-NOTIFY", name: "Nhận thông báo thụ lý từ Tòa án", src: "C1", unit: "Tòa án nhân dân tối cao", http: "POST", ep: "/api/v1/court/case-notifications", payload: "JSON", ver: "v1.1", status: "active", release: "07/12/2023", desc: "Tiếp nhận thông báo thụ lý vụ việc có liên quan tới văn bản công chứng." },
  { code: "MT-STAMP-DUTY", name: "Đồng bộ nghĩa vụ tài chính (lệ phí trước bạ)", src: "C2", unit: "Tổng cục Thuế", http: "GET", ep: "/api/v1/tax/stamp-duty", payload: "JSON", ver: "v1.2", status: "inactive", release: "14/10/2023", desc: "Tra cứu nghĩa vụ tài chính, lệ phí trước bạ đối với tài sản giao dịch.", note: "Tạm ngừng do đối tác nâng cấp hệ thống. Dự kiến khôi phục quý sau." },
  { code: "MT-LEGACY-EXPORT", name: "Xuất dữ liệu công chứng định kỳ (legacy)", src: "A", unit: "Sở Tư pháp TP. Hà Nội", http: "GET", ep: "/api/v1/legacy/export", payload: "XML", ver: "v1.0", status: "deprecated", release: "05/03/2021", desc: "Cơ chế xuất dữ liệu định kỳ theo lô của hệ thống cũ.", note: "Đã có phương thức thay thế: Push gói tin GDCC (v2.x)." },
]

export function genVersions(m: Method): MethodVersion[] {
  if (m.versions) return m.versions
  const arr: MethodVersion[] = [{ version: m.ver, status: "current", released: m.release, eol: null, changelog: "Phiên bản hiện hành, khuyến nghị sử dụng cho tích hợp mới." }]
  if (m.ver !== "v1.0") arr.push({ version: "v1.0", status: m.status === "deprecated" ? "deprecated" : "supported", released: "15/01/2022", eol: m.status === "deprecated" ? "31/12/2023" : null, changelog: "Phiên bản khởi tạo." })
  return arr
}
