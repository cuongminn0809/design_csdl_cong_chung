import type { JobStatus } from "./types"

export interface StatusMeta {
  label: string
  bg: string
  fg: string
  dot: string
  bd: string
}

export const JOB_STATUS: Record<JobStatus, StatusMeta> = {
  receiving: { label: "Đang tiếp nhận", bg: "#eff6ff", fg: "#1d4ed8", dot: "#60a5fa", bd: "#bfdbfe" },
  matching: { label: "Đang so khớp", bg: "#eff6ff", fg: "#1d4ed8", dot: "#3b82f6", bd: "#bfdbfe" },
  done: { label: "Hoàn thành", bg: "#f0fdf4", fg: "#15803d", dot: "#22c55e", bd: "#bbf7d0" },
  diff: { label: "Hoàn thành có sai lệch", bg: "#fff7ed", fg: "#c2410c", dot: "#f97316", bd: "#fed7aa" },
  error: { label: "Lỗi", bg: "#fef2f2", fg: "#b91c1c", dot: "#ef4444", bd: "#fecaca" },
  cberr: { label: "Lỗi phản hồi", bg: "#fef2f2", fg: "#b91c1c", dot: "#ef4444", bd: "#f87171" },
}

/** Badge màu theo hệ thống nguồn (README §Design Tokens) */
export const SOURCE_BADGE_COLOR: Record<string, string> = {
  A: "#2563eb",
  B: "#ea580c",
  C: "#7c3aed",
  C1: "#0891b2",
  C2: "#d97706",
}

export function pillStyle(m: StatusMeta): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    fontWeight: 600,
    padding: "3px 10px 3px 8px",
    borderRadius: 9999,
    whiteSpace: "nowrap",
    background: m.bg,
    color: m.fg,
    border: `1px solid ${m.bd}`,
  }
}

export function dotStyle(color: string): React.CSSProperties {
  return { width: 6, height: 6, borderRadius: 9999, background: color, flex: "none" }
}
