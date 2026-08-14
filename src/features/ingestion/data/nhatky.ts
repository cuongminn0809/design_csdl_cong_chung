import type { StatusMeta } from "../shared"

export interface LogEntry {
  ts: string
  event: string
  unit: string
  method: string
  methodCode: string
  ver: string
  collect: "PUSH" | "PULL" | "Manual"
  status: "ThanhCong" | "ThatBai" | "DangXuLy" | "DaHuy"
  dur: number
  http: number | null
  req: string
  size: number | null
  err?: { code: string; msg: string; tech: string }
}

export const LOG_STATUS: Record<string, StatusMeta> = {
  ThanhCong: { label: "Thành công", dot: "#16a34a", bg: "#f0fdf4", fg: "#15803d", bd: "#bbf7d0" },
  ThatBai: { label: "Thất bại", dot: "#dc2626", bg: "#fef2f2", fg: "#b91c1c", bd: "#fecaca" },
  DangXuLy: { label: "Đang xử lý", dot: "#2563eb", bg: "#eff6ff", fg: "#1d4ed8", bd: "#bfdbfe" },
  DaHuy: { label: "Đã hủy", dot: "#737373", bg: "#f5f5f5", fg: "#525252", bd: "#e5e5e5" },
}

export const COLLECT: Record<string, { label: string; bg: string; fg: string; bd: string }> = {
  PUSH: { label: "PUSH", bg: "#f0fdfa", fg: "#0d9488", bd: "#99f6e4" },
  PULL: { label: "PULL", bg: "#eef2ff", fg: "#4f46e5", bd: "#c7d2fe" },
  Manual: { label: "Manual", bg: "#f5f5f5", fg: "#525252", bd: "#e5e5e5" },
}

export const LOG_SEED: LogEntry[] = [
  { ts: "15/07/2026 09:42:18", event: "evt-9f3a2c1b-7e4d", unit: "Sở Tư pháp TP. Hà Nội", method: "Push gói tin giao dịch công chứng", methodCode: "MT-GDCC-PUSH", ver: "v2.1", collect: "PUSH", status: "ThanhCong", dur: 842, http: 200, req: "req-2026-0715-8842", size: 184320 },
  { ts: "15/07/2026 09:38:05", event: "evt-1a7b8e0f-33c2", unit: "Cục C06 - Bộ Công an", method: "Xác thực thông tin công dân", methodCode: "MT-CITIZEN-VERIFY", ver: "v2.4", collect: "PULL", status: "ThanhCong", dur: 311, http: 200, req: "req-2026-0715-8841", size: 4096 },
  { ts: "15/07/2026 09:15:47", event: "evt-6c2d94af-1b58", unit: "VPCC Nguyễn Huệ", method: "Nhận hồ sơ công chứng điện tử", methodCode: "MT-ENOTARY-DOC", ver: "v2.0", collect: "PUSH", status: "ThatBai", dur: 1206, http: 422, req: "req-2026-0715-8840", size: 512400, err: { code: "ERR-VALIDATE-SCHEMA", msg: 'Gói tin không hợp lệ — sai định dạng trường "ngayKy". Từ chối tiếp nhận toàn bộ gói.', tech: 'HTTP 422 Unprocessable Entity\n{\n  "error": "schema_validation_failed",\n  "field": "records[3].ngayKy",\n  "expected": "ISO-8601 date-time",\n  "received": "17-06-2026",\n  "package_rejected": true\n}' } },
  { ts: "15/07/2026 08:59:33", event: "evt-b83f01e7-9a4c", unit: "Sở Tư pháp TP. Hồ Chí Minh", method: "Push kết quả chứng thực bản sao", methodCode: "MT-AUTH-COPY", ver: "v1.0", collect: "PUSH", status: "ThanhCong", dur: 967, http: 200, req: "req-2026-0715-8839", size: 92160 },
  { ts: "15/07/2026 08:44:12", event: "evt-4e5a6d2c-8f31", unit: "Trung tâm ĐK Giao dịch bảo đảm", method: "Tra cứu thông tin ngăn chặn tài sản", methodCode: "MT-ASSET-BLOCK", ver: "v1.5", collect: "PULL", status: "DangXuLy", dur: 0, http: null, req: "req-2026-0715-8838", size: null },
  { ts: "15/07/2026 08:21:59", event: "evt-7d1c3b9e-2a06", unit: "Tòa án nhân dân tối cao", method: "Nhận thông báo thụ lý từ Tòa án", methodCode: "MT-COURT-NOTIFY", ver: "v1.1", collect: "PUSH", status: "ThanhCong", dur: 534, http: 200, req: "req-2026-0715-8837", size: 20480 },
  { ts: "15/07/2026 07:58:40", event: "evt-2f8e5a1d-6c93", unit: "Cổng TTĐT Quốc gia về ĐKDN", method: "Tra cứu thông tin doanh nghiệp", methodCode: "MT-ENT-LOOKUP", ver: "v1.1", collect: "PULL", status: "ThatBai", dur: 5001, http: 504, req: "req-2026-0715-8836", size: null, err: { code: "ERR-GATEWAY-TIMEOUT", msg: "Hệ thống nguồn không phản hồi trong thời gian cho phép. Gói tin không được tiếp nhận.", tech: 'HTTP 504 Gateway Timeout\n{\n  "error": "upstream_timeout",\n  "timeout_ms": 5000,\n  "endpoint": "/api/v1/enterprise/lookup",\n  "retry_scheduled": true\n}' } },
  { ts: "15/07/2026 07:33:11", event: "evt-9b4d7f2a-0e15", unit: "Cục C06 - Bộ Công an", method: "Nhận thông báo CSDL quốc gia về dân cư", methodCode: "MT-POP-NOTIFY", ver: "v2.2", collect: "PUSH", status: "ThanhCong", dur: 428, http: 200, req: "req-2026-0715-8835", size: 15360 },
  { ts: "14/07/2026 22:04:56", event: "evt-3a6c8e1b-5d27", unit: "Sở Tư pháp TP. Hà Nội", method: "Push gói tin giao dịch công chứng", methodCode: "MT-GDCC-PUSH", ver: "v2.1", collect: "PUSH", status: "ThanhCong", dur: 1102, http: 200, req: "req-2026-0714-8720", size: 276480 },
  { ts: "14/07/2026 21:47:33", event: "evt-8e2f5b9c-4a10", unit: "Tổng cục Thuế", method: "Đồng bộ nghĩa vụ tài chính (lệ phí trước bạ)", methodCode: "MT-STAMP-DUTY", ver: "v1.2", collect: "PULL", status: "DaHuy", dur: 2340, http: null, req: "req-2026-0714-8719", size: null },
  { ts: "14/07/2026 20:12:08", event: "evt-1d9a4c7e-6f38", unit: "Sở Tài nguyên & Môi trường", method: "Tra cứu thông tin thửa đất", methodCode: "MT-LAND-INFO", ver: "v1.0", collect: "PULL", status: "ThanhCong", dur: 689, http: 200, req: "req-2026-0714-8718", size: 8192 },
  { ts: "14/07/2026 18:55:41", event: "evt-5c3e8a2d-9b04", unit: "VPCC Nguyễn Huệ", method: "Nhận hồ sơ công chứng điện tử", methodCode: "MT-ENOTARY-DOC", ver: "v2.0", collect: "PUSH", status: "ThanhCong", dur: 754, http: 200, req: "req-2026-0714-8717", size: 143360 },
  { ts: "14/07/2026 17:30:22", event: "evt-7f1b6d4a-3c89", unit: "Bộ Tư pháp", method: "Push nhật ký giao dịch bảo đảm", methodCode: "MT-SECTX-LOG", ver: "v1.3", collect: "PUSH", status: "ThatBai", dur: 398, http: 401, req: "req-2026-0714-8716", size: null, err: { code: "ERR-AUTH-TOKEN", msg: "Token xác thực hết hạn hoặc không hợp lệ. Gói tin bị từ chối tiếp nhận.", tech: 'HTTP 401 Unauthorized\n{\n  "error": "invalid_token",\n  "reason": "token_expired",\n  "expired_at": "2026-07-14T17:29:50Z"\n}' } },
  { ts: "14/07/2026 16:18:47", event: "evt-2b8d5f1c-7e46", unit: "Cục C06 - Bộ Công an", method: "Xác thực thông tin công dân", methodCode: "MT-CITIZEN-VERIFY", ver: "v2.4", collect: "PULL", status: "ThanhCong", dur: 276, http: 200, req: "req-2026-0714-8715", size: 3072 },
  { ts: "14/07/2026 15:02:19", event: "evt-9e4a7c2b-1d53", unit: "Sở Tư pháp TP. Hồ Chí Minh", method: "Push kết quả chứng thực bản sao", methodCode: "MT-AUTH-COPY", ver: "v1.0", collect: "PUSH", status: "ThanhCong", dur: 812, http: 200, req: "req-2026-0714-8714", size: 61440 },
  { ts: "14/07/2026 13:41:05", event: "evt-4d2e9a6f-8b17", unit: "Sở Tư pháp TP. Hà Nội", method: "Đồng bộ trạng thái hợp đồng công chứng", methodCode: "MT-CONTRACT-SYNC", ver: "v3.0", collect: "PUSH", status: "ThanhCong", dur: 503, http: 200, req: "req-2026-0714-8713", size: 24576 },
  { ts: "14/07/2026 11:27:38", event: "evt-6a1c4e8d-2f90", unit: "Trung tâm ĐK Giao dịch bảo đảm", method: "Tra cứu thông tin ngăn chặn tài sản", methodCode: "MT-ASSET-BLOCK", ver: "v1.5", collect: "PULL", status: "ThanhCong", dur: 441, http: 200, req: "req-2026-0714-8712", size: 5120 },
  { ts: "14/07/2026 09:53:14", event: "evt-8c5f2a9e-4d61", unit: "Cổng TTĐT Quốc gia về ĐKDN", method: "Tra cứu thông tin doanh nghiệp", methodCode: "MT-ENT-LOOKUP", ver: "v1.1", collect: "Manual", status: "ThanhCong", dur: 1893, http: 200, req: "req-2026-0714-8711", size: 10240 },
  { ts: "13/07/2026 23:11:49", event: "evt-1f7d3b6a-9c28", unit: "Cục C06 - Bộ Công an", method: "Nhận thông báo CSDL quốc gia về dân cư", methodCode: "MT-POP-NOTIFY", ver: "v2.2", collect: "PUSH", status: "ThatBai", dur: 672, http: 409, req: "req-2026-0713-8602", size: 31744, err: { code: "ERR-DUPLICATE-PACKAGE", msg: "Gói tin trùng lặp — request ID đã được tiếp nhận trước đó. Bỏ qua để tránh ghi trùng.", tech: 'HTTP 409 Conflict\n{\n  "error": "duplicate_request_id",\n  "original_request_id": "req-2026-0713-8588",\n  "package_rejected": true\n}' } },
  { ts: "13/07/2026 20:38:27", event: "evt-3e9a6c1d-5b74", unit: "VPCC Nguyễn Huệ", method: "Nhận hồ sơ công chứng điện tử", methodCode: "MT-ENOTARY-DOC", ver: "v2.0", collect: "PUSH", status: "ThanhCong", dur: 698, http: 200, req: "req-2026-0713-8601", size: 118784 },
  { ts: "13/07/2026 18:04:52", event: "evt-7b2d8f4a-1e39", unit: "Bộ Tư pháp", method: "Push nhật ký giao dịch bảo đảm", methodCode: "MT-SECTX-LOG", ver: "v1.3", collect: "PUSH", status: "ThanhCong", dur: 587, http: 200, req: "req-2026-0713-8600", size: 19456 },
  { ts: "13/07/2026 15:49:11", event: "evt-5a3c7e9d-8f62", unit: "Sở Tài nguyên & Môi trường", method: "Tra cứu thông tin thửa đất", methodCode: "MT-LAND-INFO", ver: "v1.0", collect: "PULL", status: "DangXuLy", dur: 0, http: null, req: "req-2026-0713-8599", size: null },
  { ts: "13/07/2026 12:22:36", event: "evt-9d6a2b5f-3c17", unit: "Sở Tư pháp TP. Hà Nội", method: "Push gói tin giao dịch công chứng", methodCode: "MT-GDCC-PUSH", ver: "v2.1", collect: "PUSH", status: "ThanhCong", dur: 934, http: 200, req: "req-2026-0713-8598", size: 210944 },
]

export const fmtBytes = (b: number | null) => {
  if (b == null) return "—"
  if (b < 1024) return b + " B"
  if (b < 1048576) return (b / 1024).toFixed(1) + " KB"
  return (b / 1048576).toFixed(2) + " MB"
}
export const fmtDur = (ms: number) => (ms > 0 ? ms.toLocaleString("vi") + " ms" : "—")
