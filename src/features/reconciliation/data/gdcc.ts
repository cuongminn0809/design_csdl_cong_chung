import type { ReconDataset } from "../types"

// Dữ liệu mẫu cho nhóm GDCC — nguồn: prototype "B2.1 Doi Soat GDCC.dc.html"
export const GDCC_DATASET: ReconDataset = {
  groupLabel: "Giao dịch công chứng",
  typeLabel: "Loại GDCC",
  typeAllLabel: "Tất cả loại GDCC",
  reconKey: "(SoCongChung, YEAR(NgayCongChung), source_system_id)",
  apiBase: "gdcc",
  idLabel: "SoCongChung",
  codeName: "gdcc_type_code",
  showYearColumn: true,

  types: [
    ["UC0652", "Văn bản lựa chọn người giám hộ"],
    ["UC0457", "HĐ mua bán, thuê mua nhà ở, công trình XD"],
    ["UC0522", "HĐ chuyển nhượng, tặng cho, thế chấp QSDĐ"],
    ["UC0655", "Di chúc của người bị hạn chế thể chất"],
    ["UC0656", "Văn bản ủy quyền đại diện kháng cáo"],
    ["UC0658", "Văn bản thừa kế nhà ở"],
    ["UC0660", "Văn bản thừa kế QSDĐ và tài sản gắn liền"],
    ["UC0663", "Thỏa thuận chế độ tài sản vợ chồng trước kết hôn"],
    ["UC0664", "Thỏa thuận về việc mang thai hộ"],
    ["UC0666", "Hợp đồng cho thuê doanh nghiệp tư nhân"],
    ["UC0669", "Hợp đồng chuyển nhượng HĐ kinh doanh BĐS"],
    ["UC0673", "Hợp đồng chuyển nhượng Văn phòng Thừa phát lại"],
    ["UC0674", "Các giao dịch khác theo quy định"],
  ],

  sources: {
    NTPM_HN: { sys: "A", name: "Nền tảng công chứng — Hà Nội" },
    NTPM_TQ: { sys: "A", name: "Nền tảng công chứng — Toàn quốc" },
    PM_HCM: { sys: "B", name: "PM chuyển đổi CSDL — TP.HCM" },
    PM_DN: { sys: "B", name: "PM chuyển đổi CSDL — Đà Nẵng" },
  },

  jobs: [
    { id: "RC-GDCC-2411-0087", packet: "PKT-NTPM-9f2a13", type: "UC0457", src: "NTPM_HN", total: 1203, matched: 1200, mismatched: 3, onlyWh: 0, onlySrc: 0, valSkip: 0, sent: "21/11/2024 08:32:10", recv: "21/11/2024 08:32:11", done: "21/11/2024 08:33:02", status: "diff", resp: "async", callback: "https://ntpm.gov.vn/cb/recon?token=***", checksum: "match" },
    { id: "RC-GDCC-2411-0086", packet: "PKT-NTPM-8b1c02", type: "UC0522", src: "NTPM_TQ", total: 5400, matched: 5400, mismatched: 0, onlyWh: 0, onlySrc: 0, valSkip: 0, sent: "21/11/2024 07:15:44", recv: "21/11/2024 07:15:45", done: "21/11/2024 07:18:20", status: "done", resp: "async", callback: "https://ntpm.gov.vn/cb/recon?token=***", checksum: "match" },
    { id: "RC-GDCC-2411-0085", packet: "PKT-PMHCM-4471aa", type: "UC0457", src: "PM_HCM", total: 842, matched: 836, mismatched: 4, onlyWh: 2, onlySrc: 0, valSkip: 0, sent: "20/11/2024 22:04:11", recv: "20/11/2024 22:04:12", done: "20/11/2024 22:04:55", status: "diff", resp: "sync", callback: "", checksum: "mismatch" },
    { id: "RC-GDCC-2411-0084", packet: "PKT-PMDN-1180ff", type: "UC0658", src: "PM_DN", total: 0, matched: 0, mismatched: 0, onlyWh: 0, onlySrc: 120, valSkip: 0, sent: "20/11/2024 18:41:00", recv: "20/11/2024 18:41:01", done: "20/11/2024 18:41:12", status: "diff", resp: "sync", callback: "", checksum: "match" },
    { id: "RC-GDCC-2411-0083", packet: "PKT-NTPM-77de90", type: "UC0660", src: "NTPM_HN", total: 3120, matched: 3120, mismatched: 0, onlyWh: 0, onlySrc: 0, valSkip: 0, sent: "20/11/2024 14:20:33", recv: "20/11/2024 14:20:34", done: "", status: "matching", resp: "async", callback: "https://ntpm.gov.vn/cb/recon?token=***", checksum: "match" },
    { id: "RC-GDCC-2411-0082", packet: "PKT-NTPM-6ac541", type: "UC0674", src: "NTPM_TQ", total: 0, matched: 0, mismatched: 0, onlyWh: 0, onlySrc: 0, valSkip: 0, sent: "20/11/2024 14:19:50", recv: "20/11/2024 14:19:51", done: "", status: "receiving", resp: "async", callback: "https://ntpm.gov.vn/cb/recon?token=***", checksum: "match" },
    { id: "RC-GDCC-2411-0081", packet: "PKT-PMHCM-33aa71", type: "UC0522", src: "PM_HCM", total: 0, matched: 0, mismatched: 0, onlyWh: 0, onlySrc: 0, valSkip: 0, sent: "20/11/2024 09:02:18", recv: "20/11/2024 09:02:19", done: "20/11/2024 09:02:24", status: "error", resp: "sync", callback: "", checksum: "match", errCode: "ERR_PAYLOAD_TOO_LARGE", errStatus: 413, errMsg: "Gói tin vượt dung lượng tối đa 50MB (VR-09)." },
    { id: "RC-GDCC-2411-0080", packet: "PKT-NTPM-22bf08", type: "UC0457", src: "NTPM_HN", total: 980, matched: 975, mismatched: 2, onlyWh: 0, onlySrc: 3, valSkip: 1, sent: "19/11/2024 16:48:02", recv: "19/11/2024 16:48:03", done: "19/11/2024 16:48:41", status: "cberr", resp: "async", callback: "https://ntpm.gov.vn/cb/recon?token=***", checksum: "match", errCode: "ERR_CALLBACK_TIMEOUT", errStatus: 504, errMsg: "Gọi callback thất bại sau 3 lần thử — nguồn không phản hồi (VR-08)." },
    { id: "RC-GDCC-2411-0079", packet: "PKT-PMDN-90cd12", type: "UC0663", src: "PM_DN", total: 210, matched: 210, mismatched: 0, onlyWh: 0, onlySrc: 0, valSkip: 0, sent: "19/11/2024 11:30:00", recv: "19/11/2024 11:30:01", done: "19/11/2024 11:30:09", status: "done", resp: "sync", callback: "", checksum: "match" },
    { id: "RC-GDCC-2411-0078", packet: "PKT-NTPM-45ff21", type: "UC0673", src: "NTPM_TQ", total: 66, matched: 66, mismatched: 0, onlyWh: 0, onlySrc: 0, valSkip: 0, sent: "19/11/2024 08:12:44", recv: "19/11/2024 08:12:45", done: "19/11/2024 08:12:50", status: "done", resp: "sync", callback: "", checksum: "match" },
    { id: "RC-GDCC-2411-0077", packet: "PKT-PMHCM-71ab55", type: "UC0660", src: "PM_HCM", total: 1540, matched: 1531, mismatched: 6, onlyWh: 1, onlySrc: 2, valSkip: 0, sent: "18/11/2024 20:55:19", recv: "18/11/2024 20:55:20", done: "18/11/2024 20:56:12", status: "diff", resp: "async", callback: "https://pm-hcm.gov.vn/cb?token=***", checksum: "mismatch" },
    { id: "RC-GDCC-2411-0076", packet: "PKT-NTPM-08cc31", type: "UC0522", src: "NTPM_HN", total: 4200, matched: 4200, mismatched: 0, onlyWh: 0, onlySrc: 0, valSkip: 0, sent: "18/11/2024 15:10:03", recv: "18/11/2024 15:10:04", done: "18/11/2024 15:12:40", status: "done", resp: "async", callback: "https://ntpm.gov.vn/cb/recon?token=***", checksum: "match" },
    { id: "RC-GDCC-2411-0075", packet: "PKT-PMDN-63de77", type: "UC0457", src: "PM_DN", total: 315, matched: 315, mismatched: 0, onlyWh: 0, onlySrc: 0, valSkip: 0, sent: "18/11/2024 09:41:22", recv: "18/11/2024 09:41:23", done: "18/11/2024 09:41:31", status: "done", resp: "sync", callback: "", checksum: "match" },
    { id: "RC-GDCC-2411-0074", packet: "PKT-NTPM-11ae90", type: "UC0674", src: "NTPM_TQ", total: 88, matched: 85, mismatched: 3, onlyWh: 0, onlySrc: 0, valSkip: 0, sent: "17/11/2024 17:20:15", recv: "17/11/2024 17:20:16", done: "17/11/2024 17:20:29", status: "diff", resp: "sync", callback: "", checksum: "match" },
    { id: "RC-GDCC-2411-0073", packet: "PKT-PMHCM-52cd18", type: "UC0658", src: "PM_HCM", total: 640, matched: 640, mismatched: 0, onlyWh: 0, onlySrc: 0, valSkip: 0, sent: "17/11/2024 10:05:40", recv: "17/11/2024 10:05:41", done: "17/11/2024 10:05:58", status: "done", resp: "sync", callback: "", checksum: "match" },
  ],

  endpoints: [
    { src: "NTPM_HN", type: "UC0457", auth: "OAuth2", status: "active", calls: 1284, last: "21/11/2024 08:32:11" },
    { src: "NTPM_TQ", type: "GENERIC", auth: "OAuth2", status: "active", calls: 3021, last: "21/11/2024 07:15:45" },
    { src: "PM_HCM", type: "UC0457", auth: "API Key", status: "active", calls: 642, last: "20/11/2024 22:04:12" },
    { src: "PM_DN", type: "GENERIC", auth: "mTLS", status: "paused", calls: 118, last: "20/11/2024 18:41:01" },
    { src: "PM_HCM", type: "UC0660", auth: "API Key", status: "active", calls: 410, last: "18/11/2024 20:55:20" },
  ],

  history: [
    { time: "21/11/2024 08:33:02", pName: "Gói tin đối soát GDCC — Tháng 11/2024", packet: "PKT-NTPM-9f2a13", job: "RC-GDCC-2411-0087", src: "NTPM_HN", action: "callback", records: 1203, status: "warn", detail: "Phản hồi callback thành công — matched: 1200, mismatched: 3" },
    { time: "21/11/2024 08:32:11", pName: "Gói tin đối soát GDCC — Tháng 11/2024", packet: "PKT-NTPM-9f2a13", job: "RC-GDCC-2411-0087", src: "NTPM_HN", action: "receive", records: 1203, status: "ok", detail: "Tiếp nhận gói tin — 1203 bản ghi, 2.1MB" },
    { time: "21/11/2024 07:18:20", pName: "Đối soát QSDĐ Q4", packet: "PKT-NTPM-8b1c02", job: "RC-GDCC-2411-0086", src: "NTPM_TQ", action: "summary", records: 5400, status: "ok", detail: "Tổng hợp kết quả — khớp hoàn toàn 5400/5400" },
    { time: "20/11/2024 22:04:55", pName: "Đối soát HĐ mua bán nhà", packet: "PKT-PMHCM-4471aa", job: "RC-GDCC-2411-0085", src: "PM_HCM", action: "match", records: 842, status: "warn", detail: "So khớp hoàn tất — checksum mismatch (VR-11), matched: 836" },
    { time: "20/11/2024 18:41:12", pName: "Đối soát thừa kế nhà ở", packet: "PKT-PMDN-1180ff", job: "RC-GDCC-2411-0084", src: "PM_DN", action: "summary", records: 120, status: "warn", detail: "120 bản ghi chỉ có trong gói tin nguồn (ONLY_SOURCE)" },
    { time: "20/11/2024 14:20:34", pName: "Đối soát thừa kế QSDĐ", packet: "PKT-NTPM-77de90", job: "RC-GDCC-2411-0083", src: "NTPM_HN", action: "match", records: 3120, status: "ok", detail: "Bắt đầu so khớp — engine đang chạy" },
    { time: "20/11/2024 09:02:24", pName: "Đối soát QSDĐ đợt 2", packet: "PKT-PMHCM-33aa71", job: "RC-GDCC-2411-0081", src: "PM_HCM", action: "receive", records: 0, status: "fail", detail: "Từ chối gói tin — vượt dung lượng 50MB (ERR_PAYLOAD_TOO_LARGE)" },
    { time: "19/11/2024 16:48:41", pName: "Đối soát HĐ mua bán nhà", packet: "PKT-NTPM-22bf08", job: "RC-GDCC-2411-0080", src: "NTPM_HN", action: "callback", records: 980, status: "fail", detail: "Gọi callback thất bại sau 3 lần thử (ERR_CALLBACK_TIMEOUT)" },
    { time: "19/11/2024 11:30:09", pName: "Đối soát thỏa thuận tài sản", packet: "PKT-PMDN-90cd12", job: "RC-GDCC-2411-0079", src: "PM_DN", action: "response", records: 210, status: "ok", detail: "Phản hồi đồng bộ — khớp hoàn toàn 210/210" },
    { time: "18/11/2024 20:56:12", pName: "Đối soát thừa kế QSDĐ", packet: "PKT-PMHCM-71ab55", job: "RC-GDCC-2411-0077", src: "PM_HCM", action: "replay", records: 1540, status: "warn", detail: "Idempotent replay (AF-04) — cùng packet_id, trả kết quả đã lưu" },
    { time: "18/11/2024 15:12:40", pName: "Đối soát QSDĐ Q4", packet: "PKT-NTPM-08cc31", job: "RC-GDCC-2411-0076", src: "NTPM_HN", action: "validate", records: 4200, status: "ok", detail: "Validate OK — không có lỗi trường bắt buộc" },
    { time: "17/11/2024 17:20:29", pName: "Đối soát giao dịch khác", packet: "PKT-NTPM-11ae90", job: "RC-GDCC-2411-0074", src: "NTPM_TQ", action: "summary", records: 88, status: "warn", detail: "Tổng hợp — 3 bản ghi sai lệch (MISMATCHED)" },
  ],

  logs: [
    { time: "21/11/2024 08:33:02", level: "INFO", event: "CALLBACK_SENT", job: "RC-GDCC-2411-0087", packet: "PKT-NTPM-9f2a13", srcId: "NTPM_HN", code: "", ip: "203.113.4.10", msg: "CALLBACK_SENT job=RC-GDCC-2411-0087 url=https://ntpm.gov.vn/cb/recon status=200 durationMs=412\nmatched=1200 mismatched=3 only_warehouse=0 only_source=0" },
    { time: "21/11/2024 08:32:11", level: "INFO", event: "PACKET_RECEIVED", job: "RC-GDCC-2411-0087", packet: "PKT-NTPM-9f2a13", srcId: "NTPM_HN", code: "", ip: "203.113.4.10", msg: "PACKET_RECEIVED source=NTPM_HN size=2.1MB records=1203 idempotencyKey=PKT-NTPM-9f2a13" },
    { time: "20/11/2024 22:04:55", level: "WARN", event: "CHECKSUM_MISMATCH", job: "RC-GDCC-2411-0085", packet: "PKT-PMHCM-4471aa", srcId: "PM_HCM", code: "CHECKSUM_MISMATCH", ip: "118.69.22.4", msg: "CHECKSUM_MISMATCH (VR-11) expected=sha256:9a1f… actual=sha256:7c02… — không chặn, tiếp tục so khớp" },
    { time: "20/11/2024 18:41:12", level: "INFO", event: "RECONCILE_DONE", job: "RC-GDCC-2411-0084", packet: "PKT-PMDN-1180ff", srcId: "PM_DN", code: "", ip: "123.30.11.9", msg: "RECONCILE_DONE only_source=120 — kho chưa thu nhận dữ liệu tương ứng cho nguồn này" },
    { time: "20/11/2024 09:02:24", level: "ERROR", event: "VALIDATION_FAILED", job: "RC-GDCC-2411-0081", packet: "PKT-PMHCM-33aa71", srcId: "PM_HCM", code: "ERR_PAYLOAD_TOO_LARGE", ip: "118.69.22.4", msg: "VALIDATION_FAILED ERR_PAYLOAD_TOO_LARGE size=63.4MB limit=50MB (VR-09) httpStatus=413 — gói tin bị từ chối" },
    { time: "19/11/2024 16:48:41", level: "ERROR", event: "CALLBACK_FAILED", job: "RC-GDCC-2411-0080", packet: "PKT-NTPM-22bf08", srcId: "NTPM_HN", code: "ERR_CALLBACK_TIMEOUT", ip: "203.113.4.10", msg: "CALLBACK_FAILED ERR_CALLBACK_TIMEOUT attempts=3 lastHttpStatus=504 (VR-08) — kết quả vẫn lưu, nguồn cần replay packet_id" },
    { time: "19/11/2024 16:48:03", level: "WARN", event: "VALIDATION_SKIPPED", job: "RC-GDCC-2411-0080", packet: "PKT-NTPM-22bf08", srcId: "NTPM_HN", code: "WARN_FIELD_MISSING", ip: "203.113.4.10", msg: "VALIDATION_SKIPPED record_index=44 field=DiaDiemCongChung — thiếu trường không bắt buộc, bỏ qua" },
    { time: "19/11/2024 11:30:09", level: "INFO", event: "RESPONSE_SYNC", job: "RC-GDCC-2411-0079", packet: "PKT-PMDN-90cd12", srcId: "PM_DN", code: "", ip: "123.30.11.9", msg: "RESPONSE_SYNC records=210 matched=210 durationMs=8100 (AF-01 dưới ngưỡng đồng bộ)" },
    { time: "18/11/2024 20:56:12", level: "INFO", event: "IDEMPOTENT_REPLAY", job: "RC-GDCC-2411-0077", packet: "PKT-PMHCM-71ab55", srcId: "PM_HCM", code: "", ip: "118.69.22.4", msg: "IDEMPOTENT_REPLAY (AF-04) packet_id đã xử lý — trả kết quả cache, không chạy lại engine" },
    { time: "18/11/2024 15:10:04", level: "INFO", event: "PACKET_RECEIVED", job: "RC-GDCC-2411-0076", packet: "PKT-NTPM-08cc31", srcId: "NTPM_HN", code: "", ip: "203.113.4.10", msg: "PACKET_RECEIVED source=NTPM_HN size=7.8MB records=4200" },
  ],

  mismatch: {
    "RC-GDCC-2411-0087": [
      { kind: "MISMATCHED", so: "2024/001.203", year: 2024, ngay: "14/03/2024", diffs: [{ field: "TenGiaoDichCongChung", wh: "HĐ mua bán căn hộ A12", src: "HĐ mua bán căn hộ A-12" }] },
      { kind: "MISMATCHED", so: "2024/001.788", year: 2024, ngay: "02/07/2024", diffs: [{ field: "CongChungVien", wh: "Nguyễn Văn A", src: "Nguyễn Văn An" }] },
      { kind: "MISMATCHED", so: "2024/002.041", year: 2024, ngay: "19/09/2024", diffs: [{ field: "DiaDiemCongChung", wh: "Q. Hoàn Kiếm", src: "Quận Hoàn Kiếm" }] },
    ],
    "RC-GDCC-2411-0085": [
      { kind: "MISMATCHED", so: "2024/HCM.552", year: 2024, ngay: "11/05/2024", diffs: [{ field: "ToChucCongChung", wh: "VPCC Bến Thành", src: "VPCC Bến Thành 1" }] },
      { kind: "MISMATCHED", so: "2024/HCM.610", year: 2024, ngay: "22/06/2024", diffs: [{ field: "NgayCongChung", wh: "22/06/2024", src: "23/06/2024" }] },
      { kind: "ONLY_WAREHOUSE", so: "2024/HCM.701", year: 2024, ngay: "01/08/2024", diffs: [] },
      { kind: "ONLY_WAREHOUSE", so: "2024/HCM.702", year: 2024, ngay: "01/08/2024", diffs: [] },
    ],
    "RC-GDCC-2411-0084": [
      { kind: "ONLY_SOURCE", so: "2024/DN.120", year: 2024, ngay: "15/02/2024", diffs: [] },
      { kind: "ONLY_SOURCE", so: "2024/DN.121", year: 2024, ngay: "15/02/2024", diffs: [] },
      { kind: "ONLY_SOURCE", so: "2024/DN.122", year: 2024, ngay: "16/02/2024", diffs: [] },
    ],
  },

  schemaFields: [
    { src: "SoCongChung", type: "string", dest: "so_cong_chung", req: true },
    { src: "NgayCongChung", type: "date", dest: "ngay_cong_chung", req: true },
    { src: "LoaiGiaoDichCongChung", type: "string", dest: "loai_gdcc", req: true },
    { src: "TenGiaoDichCongChung", type: "string", dest: "ten_gdcc", req: true },
    { src: "CongChungVien", type: "string", dest: "cong_chung_vien", req: true },
    { src: "ToChucCongChung", type: "string", dest: "to_chuc_cc", req: true },
    { src: "DiaDiemCongChung", type: "string", dest: "dia_diem_cc", req: false },
  ],
}
