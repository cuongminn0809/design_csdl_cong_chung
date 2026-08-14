import type {
  HistoryEntry,
  LogEntry,
  MismatchRecord,
  ReconDataset,
  ReconEndpoint,
  ReconJob,
  SourceInfo,
} from "../types"

// Nguồn: cấu hình GROUPS + generator trong prototype "B2.1 Doi Soat *.dc.html" (bản clone).
const ALL_SOURCES: Record<string, SourceInfo> = {
  NTPM_HN: { sys: "A", name: "Nền tảng công chứng — Hà Nội" },
  NTPM_TQ: { sys: "A", name: "Nền tảng công chứng — Toàn quốc" },
  PM_HCM: { sys: "B", name: "PM chuyển đổi CSDL — TP.HCM" },
  PM_DN: { sys: "B", name: "PM chuyển đổi CSDL — Đà Nẵng" },
  HSCDL_TP: { sys: "C", name: "Hệ thống cung cấp dữ liệu (HSCDL)" },
  THA_DS: { sys: "C1", name: "Cơ quan thi hành án dân sự" },
  DAT_DAI: { sys: "C2", name: "CSDL quốc gia về đất đai" },
}

interface GroupConfig {
  groupLabel: string
  apiBase: string
  codeName: string
  jobPrefix: string
  idLabel: string
  reconKey: string
  packetName: string
  srcKeys: string[]
  subtypes: [string, string][]
  schema: [string, string, string, 0 | 1][]
  idGen: (i: number) => string
}

const GROUPS: Record<string, GroupConfig> = {
  BEN_LIEN_QUAN: {
    groupLabel: "Bên liên quan tham gia GDCC",
    apiBase: "participants",
    codeName: "participant_type_code",
    jobPrefix: "RC-BLQ",
    idLabel: "participant_id",
    reconKey: "(participant_id, participant_type_code, source_system_id)",
    packetName: "Gói tin đối soát bên liên quan",
    srcKeys: ["NTPM_HN", "NTPM_TQ", "PM_HCM", "PM_DN"],
    subtypes: [
      ["UC0675", "Bên liên quan — Cá nhân"],
      ["UC0676", "Bên liên quan — Tổ chức"],
    ],
    schema: [
      ["HoTen", "string", "ho_ten", 1],
      ["SoDinhDanh", "string", "so_dinh_danh", 1],
      ["NgaySinh", "date", "ngay_sinh", 0],
      ["DiaChi", "string", "dia_chi", 0],
      ["VaiTro", "string", "vai_tro", 1],
    ],
    idGen: (i) => `BLQ-2024-${4210 + i}`,
  },
  TAI_SAN_GDCC: {
    groupLabel: "Tài sản hình thành từ GDCC",
    apiBase: "assets",
    codeName: "asset_type_code",
    jobPrefix: "RC-TS",
    idLabel: "source_asset_id",
    reconKey: "(source_asset_id, source_transaction_id, asset_type)",
    packetName: "Gói tin đối soát tài sản",
    srcKeys: ["NTPM_HN", "NTPM_TQ", "PM_HCM", "PM_DN"],
    subtypes: [
      ["UC0482", "Tài sản là đất"],
      ["UC0483", "Nhà ở"],
      ["UC0484", "Căn hộ chung cư"],
      ["UC0485", "Công trình xây dựng"],
      ["UC0486", "Tài sản gắn liền với đất"],
      ["UC0487", "Quyền sử dụng đất"],
      ["UC0488", "Ô tô"],
      ["UC0489", "Tàu biển"],
      ["UC0490", "Tàu bay"],
      ["UC0491", "Phần vốn góp"],
      ["UC0492", "Cổ phần / cổ phiếu"],
      ["UC0493", "Quyền tài sản"],
      ["UC0494", "Tài sản hình thành trong tương lai"],
      ["UC0495", "Tài sản khác"],
    ],
    schema: [
      ["LoaiTaiSan", "string", "loai_tai_san", 1],
      ["SoGiayChungNhan", "string", "so_gcn", 1],
      ["DiaChiTaiSan", "string", "dia_chi_ts", 0],
      ["DienTich", "number", "dien_tich", 0],
      ["GiaTri", "number", "gia_tri", 1],
    ],
    idGen: (i) => `AS-2024-${3100 + i}`,
  },
  NGAN_CHAN: {
    groupLabel: "Thông tin ngăn chặn / cảnh báo rủi ro",
    apiBase: "block-warning",
    codeName: "block_warning_type_code",
    jobPrefix: "RC-NC",
    idLabel: "source_record_id",
    reconKey: "(source_record_id, block_warning_type_code, source_system_id)",
    packetName: "Gói tin đối soát ngăn chặn/CB rủi ro",
    srcKeys: ["NTPM_HN", "PM_HCM", "THA_DS", "DAT_DAI"],
    subtypes: [
      ["UC0705", "Thông tin ngăn chặn"],
      ["UC0706", "Thông tin giải tỏa ngăn chặn"],
      ["UC0707", "Cảnh báo rủi ro"],
      ["UC0497", "Tài sản thi hành án"],
      ["UC0498", "Ngăn chặn quyền"],
      ["UC0499", "Tạm dừng ngăn chặn quyền"],
      ["UC0500", "GCN bị thu hồi, hủy"],
    ],
    schema: [
      ["SoQuyetDinh", "string", "so_quyet_dinh", 1],
      ["CoQuanBanHanh", "string", "co_quan_bh", 1],
      ["NgayBanHanh", "date", "ngay_bh", 1],
      ["DoiTuong", "string", "doi_tuong", 1],
      ["TinhTrang", "string", "tinh_trang", 0],
    ],
    idGen: (i) => `BW-2024-${5100 + i}`,
  },
  TCHNCC: {
    groupLabel: "Tổ chức hành nghề công chứng (HSCDL)",
    apiBase: "organizations",
    codeName: "type_code",
    jobPrefix: "RC-TCHNCC",
    idLabel: "organization_code",
    reconKey: "(organization_code, source_system_id)",
    packetName: "Gói tin đối soát tổ chức hành nghề công chứng",
    srcKeys: ["HSCDL_TP"],
    subtypes: [["UC0510", "Thông tin tổ chức hành nghề công chứng"]],
    schema: [
      ["MaToChuc", "string", "ma_to_chuc", 1],
      ["TenToChuc", "string", "ten_to_chuc", 1],
      ["DiaChi", "string", "dia_chi", 0],
      ["NguoiDaiDien", "string", "nguoi_dai_dien", 1],
      ["TinhTrang", "string", "tinh_trang", 0],
    ],
    idGen: (i) => `TCHNCC-${1200 + i}`,
  },
  CONG_CHUNG_VIEN: {
    groupLabel: "Thông tin công chứng viên",
    apiBase: "notaries",
    codeName: "notary_data_type_code",
    jobPrefix: "RC-CCV",
    idLabel: "notary_code",
    reconKey: "(notary_code | card_number, source_system_id)",
    packetName: "Gói tin đối soát công chứng viên",
    srcKeys: ["HSCDL_TP"],
    subtypes: [
      ["UC0511", "Thông tin công chứng viên"],
      ["UC0512", "Thẻ công chứng viên"],
    ],
    schema: [
      ["HoTen", "string", "ho_ten", 1],
      ["SoThe", "string", "so_the", 1],
      ["NgayCap", "date", "ngay_cap", 0],
      ["ToChucHanhNghe", "string", "to_chuc_hn", 1],
      ["TinhTrang", "string", "tinh_trang", 0],
    ],
    idGen: (i) => `CCV-${820 + i}`,
  },
  HO_SO_CONG_CHUNG: {
    groupLabel: "Thông tin hồ sơ công chứng",
    apiBase: "dossiers",
    codeName: "dossier_type_code",
    jobPrefix: "RC-HS",
    idLabel: "dossier_id",
    reconKey: "(dossier_id | document_id, source_system_id)",
    packetName: "Gói tin đối soát hồ sơ công chứng",
    srcKeys: ["NTPM_HN", "PM_HCM", "HSCDL_TP"],
    subtypes: [
      ["UC0513", "Văn bản công chứng"],
      ["UC0514", "Văn bản sửa lỗi công chứng"],
      ["UC0515", "Tài liệu công chứng liên quan"],
    ],
    schema: [
      ["SoHoSo", "string", "so_ho_so", 1],
      ["SoCongChung", "string", "so_cong_chung", 1],
      ["LoaiVanBan", "string", "loai_van_ban", 1],
      ["NgayLap", "date", "ngay_lap", 0],
      ["TrangThai", "string", "trang_thai", 0],
    ],
    idGen: (i) => `HS-2024-${7100 + i}`,
  },
  DANH_MUC: {
    groupLabel: "Danh mục",
    apiBase: "catalogs",
    codeName: "catalog_code",
    jobPrefix: "RC-DM",
    idLabel: "catalog_item_code",
    reconKey: "(catalog_item_code, catalog_code, source_system_id)",
    packetName: "Gói tin đối soát danh mục",
    srcKeys: ["HSCDL_TP"],
    subtypes: [
      ["UC0881", "Danh mục loại GDCC"],
      ["UC0882", "Danh mục tổ chức hành nghề CC"],
      ["UC0883", "Danh mục công chứng viên"],
      ["UC0884", "Danh mục tỉnh/thành phố"],
      ["UC0885", "Danh mục quận/huyện"],
      ["UC0886", "Danh mục phường/xã"],
      ["UC0887", "Danh mục quốc tịch"],
      ["UC0888", "Danh mục dân tộc"],
      ["UC0889", "Danh mục loại giấy tờ"],
      ["UC0890", "Danh mục loại tài sản"],
      ["UC0891", "Danh mục cơ quan cấp"],
      ["UC0892", "Danh mục nghề nghiệp"],
      ["UC0893", "Danh mục khác"],
    ],
    schema: [
      ["MaMuc", "string", "ma_muc", 1],
      ["TenMuc", "string", "ten_muc", 1],
      ["MaCha", "string", "ma_cha", 0],
      ["ThuTu", "number", "thu_tu", 0],
      ["TrangThai", "string", "trang_thai", 1],
    ],
    idGen: (i) => `DM-${1200 + i}`,
  },
}

const TIMES = [
  "21/11/2024 08:32:11", "21/11/2024 07:15:45", "20/11/2024 22:04:12", "20/11/2024 18:41:01",
  "20/11/2024 14:20:34", "20/11/2024 14:19:51", "20/11/2024 09:02:19", "19/11/2024 16:48:03",
  "19/11/2024 11:30:01", "19/11/2024 08:12:45", "18/11/2024 20:55:20", "18/11/2024 15:10:04",
  "18/11/2024 09:41:23", "17/11/2024 17:20:16",
]

interface Shape {
  status: ReconJob["status"]
  total: number
  mm?: number
  ow?: number
  os?: number
  vs?: number
  checksum?: "match" | "mismatch"
  resp?: "sync" | "async"
}

const SHAPES: Shape[] = [
  { status: "diff", total: 1203, mm: 3 },
  { status: "done", total: 5400 },
  { status: "diff", total: 842, mm: 4, ow: 2, checksum: "mismatch", resp: "sync" },
  { status: "diff", total: 120, mm: 0, os: 120, resp: "sync" },
  { status: "matching", total: 3120 },
  { status: "receiving", total: 0 },
  { status: "error", total: 0, resp: "sync" },
  { status: "cberr", total: 980, mm: 2, os: 3, vs: 1 },
  { status: "done", total: 210, resp: "sync" },
  { status: "done", total: 66, resp: "sync" },
  { status: "diff", total: 1540, mm: 6, ow: 1, os: 2, checksum: "mismatch" },
  { status: "done", total: 4200 },
  { status: "done", total: 315, resp: "sync" },
  { status: "diff", total: 88, mm: 3, resp: "sync" },
]

const nfvi = (n: number) => n.toLocaleString("vi-VN")

function buildJobs(cfg: GroupConfig): ReconJob[] {
  return SHAPES.map((sh, i) => {
    const st = cfg.subtypes[i % cfg.subtypes.length]
    const src = cfg.srcKeys[i % cfg.srcKeys.length]
    const mm = sh.mm ?? 0
    const ow = sh.ow ?? 0
    const os = sh.os ?? 0
    const matched = Math.max(0, sh.total - mm - ow)
    const t = TIMES[i]
    const running = sh.status === "matching" || sh.status === "receiving"
    const resp = sh.resp ?? "async"
    const suffix = ("0" + (87 - i)).slice(-2)
    return {
      id: `${cfg.jobPrefix}-2411-00${suffix}`,
      packet: `PKT-${src}-${((i * 971) % 9000 + 1000).toString(16)}`,
      type: st[0],
      src,
      total: sh.total,
      matched,
      mismatched: mm,
      onlyWh: ow,
      onlySrc: os,
      valSkip: sh.vs ?? 0,
      sent: t,
      recv: t,
      done: running ? "" : t,
      status: sh.status,
      resp,
      callback: resp === "async" ? `https://${src.toLowerCase()}.gov.vn/cb/recon?token=***` : "",
      checksum: sh.checksum ?? "match",
      errCode: sh.status === "error" ? "ERR_PAYLOAD_TOO_LARGE" : sh.status === "cberr" ? "ERR_CALLBACK_TIMEOUT" : undefined,
      errStatus: sh.status === "error" ? 413 : sh.status === "cberr" ? 504 : undefined,
      errMsg:
        sh.status === "error"
          ? "Gói tin vượt dung lượng tối đa 50MB (VR-09)."
          : sh.status === "cberr"
            ? "Gọi callback thất bại sau 3 lần thử — nguồn không phản hồi (VR-08)."
            : undefined,
    }
  })
}

function buildEndpoints(cfg: GroupConfig): ReconEndpoint[] {
  const auths: ReconEndpoint["auth"][] = ["OAuth2", "API Key", "mTLS"]
  return cfg.srcKeys.slice(0, 4).map((src, i) => ({
    src,
    type: i === 1 ? "GENERIC" : cfg.subtypes[i % cfg.subtypes.length][0],
    auth: ALL_SOURCES[src].sys.startsWith("C") ? (i % 2 ? "mTLS" : "OAuth2") : auths[i % 3],
    status: i === 3 ? "paused" : "active",
    calls: [1284, 3021, 642, 118][i] ?? 220,
    last: TIMES[i] ?? TIMES[0],
  }))
}

function buildMismatch(cfg: GroupConfig, job: ReconJob): MismatchRecord[] {
  const rows: MismatchRecord[] = []
  let idx = 0
  const reqFields = cfg.schema.filter((f) => f[3]).slice(0, 3)
  const dt = (k: number) => `${((k * 7) % 27) + 1}/0${((k * 3) % 9) + 1}/2024`
  for (let k = 0; k < job.mismatched && rows.length < 8; k++) {
    const f = reqFields[k % reqFields.length]
    rows.push({ kind: "MISMATCHED", so: cfg.idGen(idx), ngay: dt(idx), diffs: [{ field: f[0], wh: `${f[0]} (kho)`, src: `${f[0]} (nguồn)` }] })
    idx++
  }
  for (let k = 0; k < job.onlyWh && rows.length < 8; k++) {
    rows.push({ kind: "ONLY_WAREHOUSE", so: cfg.idGen(idx), ngay: dt(idx), diffs: [] })
    idx++
  }
  for (let k = 0; k < job.onlySrc && rows.length < 8; k++) {
    rows.push({ kind: "ONLY_SOURCE", so: cfg.idGen(idx), ngay: dt(idx), diffs: [] })
    idx++
  }
  return rows
}

function histFromJob(j: ReconJob): { action: string; status: HistoryEntry["status"]; detail: string } {
  if (j.status === "diff") return { action: "summary", status: "warn", detail: `Tổng hợp — sai lệch ${j.mismatched}, chỉ kho ${j.onlyWh}, chỉ nguồn ${j.onlySrc}` }
  if (j.status === "done") return { action: j.resp === "sync" ? "response" : "callback", status: "ok", detail: `Khớp hoàn toàn ${nfvi(j.matched)}/${nfvi(j.total)}` }
  if (j.status === "matching") return { action: "match", status: "ok", detail: "Bắt đầu so khớp — engine đang chạy" }
  if (j.status === "receiving") return { action: "receive", status: "ok", detail: "Tiếp nhận gói tin — đang validate" }
  if (j.status === "error") return { action: "receive", status: "fail", detail: "Từ chối gói tin — vượt dung lượng (ERR_PAYLOAD_TOO_LARGE)" }
  return { action: "callback", status: "fail", detail: "Gọi callback thất bại sau 3 lần thử (ERR_CALLBACK_TIMEOUT)" }
}

function logFromJob(j: ReconJob): { level: LogEntry["level"]; event: string; code: string; msg: string } {
  if (j.status === "error") return { level: "ERROR", event: "VALIDATION_FAILED", code: "ERR_PAYLOAD_TOO_LARGE", msg: "VALIDATION_FAILED ERR_PAYLOAD_TOO_LARGE size=63.4MB limit=50MB (VR-09) httpStatus=413 — gói tin bị từ chối" }
  if (j.status === "cberr") return { level: "ERROR", event: "CALLBACK_FAILED", code: "ERR_CALLBACK_TIMEOUT", msg: "CALLBACK_FAILED ERR_CALLBACK_TIMEOUT attempts=3 lastHttpStatus=504 (VR-08) — kết quả vẫn lưu, nguồn cần replay packet_id" }
  if (j.status === "diff" && j.checksum === "mismatch") return { level: "WARN", event: "CHECKSUM_MISMATCH", code: "CHECKSUM_MISMATCH", msg: "CHECKSUM_MISMATCH (VR-11) expected=sha256:9a1f… actual=sha256:7c02… — không chặn, tiếp tục so khớp" }
  if (j.status === "diff") return { level: "INFO", event: "RECONCILE_DONE", code: "", msg: `RECONCILE_DONE matched=${j.matched} mismatched=${j.mismatched} only_warehouse=${j.onlyWh} only_source=${j.onlySrc}` }
  if (j.status === "matching") return { level: "INFO", event: "MATCH_STARTED", code: "", msg: `MATCH_STARTED job=${j.id} records=${j.total} — engine bắt đầu so khớp` }
  if (j.status === "receiving") return { level: "INFO", event: "PACKET_RECEIVED", code: "", msg: `PACKET_RECEIVED source=${j.src} idempotencyKey=${j.packet} — đang validate` }
  return { level: "INFO", event: "PACKET_RECEIVED", code: "", msg: `PACKET_RECEIVED source=${j.src} records=${j.total} matched=${j.matched}` }
}

function buildDataset(cfg: GroupConfig): ReconDataset {
  const jobs = buildJobs(cfg)
  const sources: Record<string, SourceInfo> = {}
  cfg.srcKeys.forEach((k) => (sources[k] = ALL_SOURCES[k]))

  const history: HistoryEntry[] = jobs.slice(0, 12).map((j) => {
    const h = histFromJob(j)
    return { time: j.done || j.recv, pName: cfg.packetName, packet: j.packet, job: j.id, src: j.src, action: h.action, records: j.total, status: h.status, detail: h.detail }
  })

  const logs: LogEntry[] = jobs.slice(0, 9).map((j) => {
    const l = logFromJob(j)
    return { time: j.recv, level: l.level, event: l.event, job: j.id, packet: j.packet, srcId: j.src, code: l.code, ip: "", msg: l.msg }
  })

  const mismatch: Record<string, MismatchRecord[]> = {}
  jobs.forEach((j) => {
    const rows = buildMismatch(cfg, j)
    if (rows.length) mismatch[j.id] = rows
  })

  return {
    groupLabel: cfg.groupLabel,
    typeLabel: "Loại dữ liệu",
    typeAllLabel: "Tất cả loại",
    reconKey: cfg.reconKey,
    apiBase: cfg.apiBase,
    idLabel: cfg.idLabel,
    codeName: cfg.codeName,
    showYearColumn: false,
    types: cfg.subtypes,
    sources,
    jobs,
    endpoints: buildEndpoints(cfg),
    history,
    logs,
    mismatch,
    schemaFields: cfg.schema.map(([src, type, dest, req]) => ({ src, type, dest, req: req === 1 })),
  }
}

// Ánh xạ slug route (B2 — 8 nhóm) → dataset. GDCC dùng dataset chi tiết riêng (xem data/gdcc.ts).
export const B2_GENERATED: Record<string, ReconDataset> = {
  "ben-lien-quan": buildDataset(GROUPS.BEN_LIEN_QUAN),
  "tai-san": buildDataset(GROUPS.TAI_SAN_GDCC),
  "ngan-chan": buildDataset(GROUPS.NGAN_CHAN),
  "to-chuc-hanh-nghe": buildDataset(GROUPS.TCHNCC),
  "cong-chung-vien": buildDataset(GROUPS.CONG_CHUNG_VIEN),
  "ho-so": buildDataset(GROUPS.HO_SO_CONG_CHUNG),
  "danh-muc": buildDataset(GROUPS.DANH_MUC),
}
