import type { StatusMeta } from "../shared"
import { TYPES, LEGAL, ERR_TYPE } from "./thucong"

export { TYPES, LEGAL, ERR_TYPE }

export interface Config {
  code: string
  name: string
  t: number
  src: string
  srcType: "A" | "B"
  conn: string
  sync: string
  freq: string | null
  status: string
  lastRun: string | null
  nextRun: string | null
  created: string
  updated: string
  sec: string
  system: string
  unitName: string
  supName: string
  supEmail: string
  supContact: string
  baseUrl: string
  runsSeed: number
}

export const CFG_STATUS: Record<string, StatusMeta> = {
  ChuaKH: { label: "Chưa kích hoạt", dot: "#8C8C8C", bg: "#f5f5f5", fg: "#525252", bd: "#e5e5e5" },
  DangHD: { label: "Đang hoạt động", dot: "#52C41A", bg: "#f0fdf4", fg: "#15803d", bd: "#bbf7d0" },
  DaDung: { label: "Đã dừng", dot: "#D9D9D9", bg: "#fafafa", fg: "#737373", bd: "#e5e5e5" },
  Loi: { label: "Lỗi cấu hình", dot: "#F5222D", bg: "#fef2f2", fg: "#b91c1c", bd: "#fecaca" },
}

export const RUN_STATUS: Record<string, { label: string; bg: string; fg: string; bd: string }> = {
  DangChay: { label: "Đang chạy", bg: "#eff6ff", fg: "#1d4ed8", bd: "#bfdbfe" },
  HoanThanh: { label: "Hoàn thành", bg: "#f0fdf4", fg: "#15803d", bd: "#bbf7d0" },
  CanhBao: { label: "Hoàn thành có cảnh báo", bg: "#fffbeb", fg: "#b45309", bd: "#fde68a" },
  LoiKetNoi: { label: "Lỗi kết nối", bg: "#fef2f2", fg: "#b91c1c", bd: "#fecaca" },
  Loi: { label: "Lỗi", bg: "#fef2f2", fg: "#991b1b", bd: "#fecaca" },
}

export const CFG_SEED: Config[] = [
  { code: "CFG-UC0522-001", name: "Tích hợp GDCC - Nền tảng CC Hà Nội", t: 0, src: "Nền tảng công chứng", srcType: "A", conn: "REST", sync: "Scheduled", freq: "Hàng ngày", status: "DangHD", lastRun: "20/05/2026 06:00:00", nextRun: "21/05/2026 06:00:00", created: "19/12/2025 09:00:00", updated: "20/05/2026 06:00:00", sec: "Nội bộ", system: "Nền tảng công chứng", unitName: "Sở Tư pháp TP. Hà Nội", supName: "Sở Tư pháp TP. Hà Nội", supEmail: "ketnoi@stp.hanoi.gov.vn", supContact: "Trần Thị Hương SĐT: 0912 345 678", baseUrl: "https://api.congchung.gov.vn", runsSeed: 3 },
  { code: "CFG-UC0522-002", name: "Tích hợp GDCC - PM chuyển đổi HN", t: 0, src: "PM chuyển đổi CSDL - Sở TP Hà Nội", srcType: "B", conn: "DB", sync: "Batch", freq: "Mỗi 1 giờ", status: "ChuaKH", lastRun: null, nextRun: null, created: "18/12/2025 14:30:00", updated: "18/12/2025 14:30:00", sec: "Nội bộ", system: "PM chuyển đổi địa phương", unitName: "Sở Tư pháp TP. Hà Nội", supName: "Sở Tư pháp TP. Hà Nội", supEmail: "pmcd@stp.hanoi.gov.vn", supContact: "Lê Văn Hải SĐT: 0987 111 222", baseUrl: "db://10.0.2.14:5432/gdcc", runsSeed: 0 },
  { code: "CFG-UC0529-004", name: "Tích hợp GDCC - Nền tảng CC HCM", t: 7, src: "Nền tảng công chứng", srcType: "A", conn: "REST", sync: "Scheduled", freq: "Mỗi 30 phút", status: "DangHD", lastRun: "20/05/2026 15:30:00", nextRun: "20/05/2026 16:00:00", created: "02/01/2026 10:15:00", updated: "15/05/2026 11:00:00", sec: "Bí mật", system: "Nền tảng công chứng", unitName: "Sở Tư pháp TP. Hồ Chí Minh", supName: "Sở Tư pháp TP. Hồ Chí Minh", supEmail: "ketnoi@stp.hcm.gov.vn", supContact: "Nguyễn Hoàng Nam SĐT: 0909 333 444", baseUrl: "https://api.congchung.gov.vn", runsSeed: 4 },
  { code: "CFG-UC0524-007", name: "Tích hợp GDCC - PM Đà Nẵng", t: 5, src: "PM chuyển đổi CSDL - Sở TP Đà Nẵng", srcType: "B", conn: "File", sync: "Batch", freq: "Hàng ngày", status: "Loi", lastRun: "19/05/2026 06:00:00", nextRun: null, created: "20/02/2026 08:00:00", updated: "19/05/2026 06:05:00", sec: "Bí mật", system: "PM chuyển đổi địa phương", unitName: "Sở Tư pháp TP. Đà Nẵng", supName: "Sở Tư pháp TP. Đà Nẵng", supEmail: "pmcd@stp.danang.gov.vn", supContact: "Trương Văn Hải SĐT: 0905 666 777", baseUrl: "sftp://10.0.5.20/export/gdcc", runsSeed: 2 },
  { code: "CFG-UC0523-009", name: "Tích hợp GDCC - Nền tảng CC (di chúc)", t: 2, src: "Nền tảng công chứng", srcType: "A", conn: "REST", sync: "Scheduled", freq: "Hàng tuần", status: "DaDung", lastRun: "10/05/2026 02:00:00", nextRun: null, created: "05/03/2026 09:30:00", updated: "12/05/2026 09:00:00", sec: "Tối mật", system: "Nền tảng công chứng", unitName: "Bộ Tư pháp", supName: "Bộ Tư pháp", supEmail: "ketnoi@moj.gov.vn", supContact: "Phạm Quốc Anh SĐT: 0988 555 666", baseUrl: "https://api.congchung.gov.vn", runsSeed: 2 },
  { code: "CFG-UC0522-011", name: "Tích hợp GDCC - PM Hải Phòng", t: 8, src: "PM chuyển đổi CSDL - Sở TP Hải Phòng", srcType: "B", conn: "DB", sync: "Batch", freq: "Mỗi 1 giờ", status: "DangHD", lastRun: "20/05/2026 15:00:00", nextRun: "20/05/2026 16:00:00", created: "14/03/2026 07:44:00", updated: "14/05/2026 10:00:00", sec: "Nội bộ", system: "PM chuyển đổi địa phương", unitName: "Sở Tư pháp TP. Hải Phòng", supName: "Sở Tư pháp TP. Hải Phòng", supEmail: "pmcd@stp.haiphong.gov.vn", supContact: "Lý Thị Mai SĐT: 0913 888 999", baseUrl: "db://10.0.7.11:5432/gdcc", runsSeed: 5 },
  { code: "CFG-UC0530-013", name: "Tích hợp GDCC - Nền tảng CC (thừa kế)", t: 6, src: "Nền tảng công chứng", srcType: "A", conn: "REST", sync: "Real-time", freq: null, status: "DangHD", lastRun: "20/05/2026 15:58:00", nextRun: "—", created: "01/04/2026 08:20:00", updated: "01/04/2026 08:20:00", sec: "Nội bộ", system: "Nền tảng công chứng", unitName: "Sở Tư pháp TP. Hà Nội", supName: "Sở Tư pháp TP. Hà Nội", supEmail: "ketnoi@stp.hanoi.gov.vn", supContact: "Trần Thị Hương SĐT: 0912 345 678", baseUrl: "https://api.congchung.gov.vn", runsSeed: 6 },
  { code: "CFG-UC0540-016", name: "Tích hợp GDCC - Nền tảng CC (khác)", t: 22, src: "Nền tảng công chứng", srcType: "A", conn: "SOAP", sync: "Scheduled", freq: "Hàng tháng", status: "ChuaKH", lastRun: null, nextRun: null, created: "10/05/2026 11:00:00", updated: "10/05/2026 11:00:00", sec: "Công khai", system: "Nền tảng công chứng", unitName: "Bộ Tư pháp", supName: "Bộ Tư pháp", supEmail: "ketnoi@moj.gov.vn", supContact: "Ngô Bảo Châu SĐT: 0977 222 333", baseUrl: "https://api.congchung.gov.vn", runsSeed: 0 },
]

export interface Run {
  id: string
  start: string
  end: string | null
  status: string
  total: number
  written: number
  skipped: number
  errCode: string | null
}

export function genRuns(c: Config): Run[] {
  const n = c.runsSeed
  if (!n) return []
  const out: Run[] = []
  const day = 20
  const statuses = ["HoanThanh", "CanhBao", "HoanThanh", "LoiKetNoi", "Loi", "HoanThanh"]
  for (let i = 0; i < n; i++) {
    const st = c.status === "Loi" && i === 0 ? "Loi" : statuses[i % statuses.length]
    const total = [500, 890, 1200, 430, 750, 300][i % 6]
    const skipped = st === "CanhBao" ? Math.round(total * 0.02) : 0
    const written = st === "Loi" || st === "LoiKetNoi" ? Math.round(total * 0.6) : total - skipped
    out.push({
      id: `RUN-202605${day - i}-${String(i + 1).padStart(3, "0")}`,
      start: `${day - i}/05/2026 06:00:0${i}`,
      end: `${day - i}/05/2026 06:0${2 + i}:30`,
      status: st,
      total,
      written,
      skipped,
      errCode: st === "LoiKetNoi" ? "ERR_CONN_001" : st === "Loi" ? "ERR_LIMIT" : null,
    })
  }
  return out
}

export function genRunErrors(run: Run) {
  if (!run.skipped) return []
  const kinds: [string, string][] = [["Sai định dạng", "ngay_cong_chung"], ["Thiếu trường", "so_cong_chung"], ["Trùng lặp", "ma_gdcc"]]
  const n = Math.min(run.skipped, 6)
  return Array.from({ length: n }, (_, i) => {
    const k = kinds[i % kinds.length]
    return { stt: i + 1, id: `REC-${String(i + 1).padStart(3, "0")}`, type: k[0], field: k[1] }
  })
}

export const fmtN2 = (n: number | null) => (n == null ? "–" : n.toLocaleString("vi"))
