export type JobStatus =
  | "receiving"
  | "matching"
  | "done"
  | "diff"
  | "error"
  | "cberr"

export interface ReconJob {
  id: string
  packet: string
  type: string
  src: string
  total: number
  matched: number
  mismatched: number
  onlyWh: number
  onlySrc: number
  valSkip: number
  sent: string
  recv: string
  done: string
  status: JobStatus
  resp: "sync" | "async"
  callback: string
  checksum: "match" | "mismatch"
  errCode?: string
  errStatus?: number
  errMsg?: string
}

export interface ReconEndpoint {
  src: string
  type: string
  auth: "API Key" | "OAuth2" | "mTLS"
  status: "active" | "paused"
  calls: number
  last: string
}

export interface HistoryEntry {
  time: string
  pName: string
  packet: string
  job: string
  src: string
  action: string
  records: number
  status: "ok" | "warn" | "fail"
  detail: string
}

export interface LogEntry {
  time: string
  level: "INFO" | "WARN" | "ERROR"
  event: string
  job: string
  packet: string
  srcId: string
  code: string
  ip: string
  msg: string
}

export interface MismatchRecord {
  kind: "MATCHED" | "MISMATCHED" | "ONLY_WAREHOUSE" | "ONLY_SOURCE"
  so: string
  year?: number
  ngay: string
  diffs: { field: string; wh: string; src: string }[]
}

export interface SourceInfo {
  sys: "A" | "B" | "C" | "C1" | "C2"
  name: string
}

export interface ReconDataset {
  /** Nhãn nhóm dữ liệu, ví dụ "Giao dịch công chứng" */
  groupLabel: string
  /** Nhãn loại con, ví dụ "Loại GDCC" */
  typeLabel: string
  /** Nhãn khi chưa chọn loại nào, ví dụ "Tất cả loại GDCC" */
  typeAllLabel: string
  /** Khóa đối soát hiển thị readonly */
  reconKey: string
  /** apiBase cho endpoint path, ví dụ "gdcc" */
  apiBase: string
  /** Tên cột mã bản ghi trong bảng sai lệch, ví dụ "SoCongChung" */
  idLabel: string
  /** codeName cho endpoint path param, ví dụ "gdcc_type_code" */
  codeName: string
  /** Hiển thị cột "Năm CC" trong bảng sai lệch (chỉ GDCC) */
  showYearColumn?: boolean
  types: [string, string][]
  sources: Record<string, SourceInfo>
  jobs: ReconJob[]
  endpoints: ReconEndpoint[]
  history: HistoryEntry[]
  logs: LogEntry[]
  mismatch: Record<string, MismatchRecord[]>
  schemaFields: { src: string; type: string; dest: string; req: boolean }[]
}
