import { FileSearch, ShieldX } from "lucide-react"

import { cn } from "@/lib/utils"
import { EmptyState, PageHeader, Pagination, Th } from "../ingestion/shared"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { ADMIN_ROLES, type AdminRole } from "./config"

/* ============================ HEADER + VAI TRÒ (VR-01) ============================ */
export function AdminReportHeader({ title, desc, role, onRole, actions }: {
  title: string; desc: string; role: AdminRole; onRole: (r: AdminRole) => void; actions?: React.ReactNode
}) {
  return (
    <PageHeader title={title} desc={desc}
      actions={
        <div className="flex items-center gap-3">
          {actions}
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] text-foreground-muted">Vai trò:</span>
            <NativeSelect value={role} onChange={(e) => onRole(e.target.value as AdminRole)} className="h-8 w-[190px] text-[12.5px]">
              {ADMIN_ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </NativeSelect>
          </div>
        </div>
      }
    />
  )
}

/** Chặn truy cập khi vai trò khác Quản trị hệ thống (VR-01, MSG_E-00066_001). */
export function AdminOnlyGate({ role, children }: { role: AdminRole; children: React.ReactNode }) {
  if (role === "quan_tri") return <>{children}</>
  return (
    <div className="flex flex-col items-center gap-3 rounded-[14px] border border-[#fecaca] bg-[#fef2f2] px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-[#fee2e2] text-[#b91c1c]"><ShieldX className="size-6" /></div>
      <div className="text-[15px] font-semibold text-[#b91c1c]">Bạn không có quyền truy cập chức năng này.</div>
      <div className="max-w-md text-[13px] text-[#b91c1c]/80">Nhóm báo cáo dành cho Quản trị hệ thống chỉ dành cho tài khoản vai trò Quản trị hệ thống.</div>
    </div>
  )
}

/* ============================ Ô LỌC DÙNG CHUNG ============================ */
export function F({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">{label}{required && <span className="text-[#dc2626]"> *</span>}</label>{children}</div>
}

/* ============================ THẺ CHỈ SỐ ============================ */
export function StatCard({ label, value, color = "#2563eb", bg = "#eff6ff", icon, danger }: {
  label: string; value: string | number; color?: string; bg?: string; icon?: React.ReactNode; danger?: boolean
}) {
  const c = danger ? "#b91c1c" : color
  const b = danger ? "#fef2f2" : bg
  return (
    <div className="flex items-center gap-3 rounded-[14px] border border-border bg-surface p-4 shadow-sm">
      {icon && <div className="flex size-11 items-center justify-center rounded-xl" style={{ background: b, color: c }}>{icon}</div>}
      <div><div className="text-[22px] font-semibold tabular-nums" style={{ color: c }}>{value}</div><div className="text-[12px] text-foreground-muted">{label}</div></div>
    </div>
  )
}

/** Thanh tiến độ tài nguyên (CPU/RAM/Disk) — cảnh báo khi vượt ngưỡng. */
export function ResourceBar({ label, pct, warnAt }: { label: string; pct: number; warnAt: number }) {
  const warn = pct >= warnAt
  return (
    <div className="rounded-[14px] border border-border bg-surface p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[12.5px] font-semibold text-foreground-strong">{label}</span>
        <span className="flex items-center gap-1.5">
          <span className={cn("text-[13px] font-bold tabular-nums", warn ? "text-[#b91c1c]" : "text-foreground-strong")}>{pct}%</span>
          {warn && <span className="rounded-full border border-[#fecaca] bg-[#fef2f2] px-1.5 py-0.5 text-[10px] font-semibold text-[#b91c1c]">Cảnh báo</span>}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-100"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: warn ? "#ef4444" : "#2563eb" }} /></div>
    </div>
  )
}

/* ============================ BIỂU ĐỒ ĐƯỜNG (diễn biến theo thời gian) ============================ */
export function LineChart({ labels, data, empty }: { labels: string[]; data: number[]; empty?: boolean }) {
  if (empty || !data.length) return <div className="flex h-[180px] items-center justify-center text-[13px] text-foreground-subtle">Không có dữ liệu</div>
  const W = 760, H = 200, pad = 32
  const max = Math.max(...data) * 1.08 || 1
  const min = Math.min(0, Math.min(...data) * 0.92)
  const n = data.length
  const x = (i: number) => pad + (i * (W - pad * 2)) / (n - 1 || 1)
  const y = (v: number) => H - pad - ((v - min) / (max - min || 1)) * (H - pad * 2)
  const pts = data.map((v, i) => `${x(i)},${y(v)}`).join(" ")
  const area = `${pad},${H - pad} ${pts} ${x(n - 1)},${H - pad}`
  const step = Math.max(1, Math.ceil(n / 7))
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full">
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => <line key={i} x1={pad} x2={W - pad} y1={pad + f * (H - pad * 2)} y2={pad + f * (H - pad * 2)} stroke="#f1f5f9" strokeWidth={1} />)}
      <polygon points={area} fill="rgba(37,99,235,0.08)" />
      <polyline points={pts} fill="none" stroke="#2563eb" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r={3} fill="#fff" stroke="#2563eb" strokeWidth={2}><title>{`${labels[i]}: ${v.toLocaleString("vi-VN")}`}</title></circle>)}
      {labels.map((l, i) => (i % step === 0 || i === n - 1) && <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize={9} fill="#a3a3a3">{l}</text>)}
    </svg>
  )
}

/* ============================ BẢNG SỐ LIỆU (không kèm nút xuất — đặt riêng theo wireframe) ============================ */
export function DataTable<T>({ title, rows, columns, page, pageSize, onPage, onPageSize, quickFilterHint }: {
  title: string; rows: T[]; columns: { key: string; header: string; cell: (r: T, i: number) => React.ReactNode; className?: string }[]
  page: number; pageSize: number; onPage: (n: number) => void; onPageSize: (n: number) => void
  quickFilterHint?: React.ReactNode
}) {
  const start = (Math.min(page, Math.max(1, Math.ceil(rows.length / pageSize))) - 1) * pageSize
  const paged = rows.slice(start, start + pageSize)
  return (
    <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
        <div className="text-[13px] font-semibold text-foreground-strong">{title} <span className="ml-1 font-normal text-foreground-muted">({rows.length} bản ghi)</span></div>
        {quickFilterHint}
      </div>
      {rows.length ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm" style={{ minWidth: columns.length * 120 }}>
              <thead><tr className="border-b border-border bg-neutral-50">{columns.map((c) => <Th key={c.key} className={c.className}>{c.header}</Th>)}</tr></thead>
              <tbody>{paged.map((r, i) => (
                <tr key={i} className="border-b border-neutral-100 hover:bg-neutral-50">
                  {columns.map((c) => <td key={c.key} className={cn("px-4 py-3 text-[13px]", c.className)}>{c.cell(r, start + i)}</td>)}
                </tr>
              ))}</tbody>
            </table>
          </div>
          <Pagination page={page} pageSize={pageSize} total={rows.length} unit="bản ghi" onPage={onPage} onPageSize={onPageSize} />
        </>
      ) : (
        <EmptyState icon={<FileSearch className="size-6" />} title="Không có dữ liệu" desc="Không có dữ liệu thỏa mãn điều kiện tra cứu." />
      )}
    </div>
  )
}

/* ============================ BIỂU ĐỒ CỘT NGANG (tỷ trọng theo loại) ============================ */
export function BarChart({ data }: { data: { label: string; value: number }[] }) {
  if (!data.length) return <div className="flex h-[120px] items-center justify-center text-[13px] text-foreground-subtle">Không có dữ liệu</div>
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  const max = Math.max(...data.map((d) => d.value)) || 1
  return (
    <div className="space-y-2.5">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-[180px] shrink-0 truncate text-[12.5px] text-foreground-muted" title={d.label}>{d.label}</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-neutral-100"><div className="h-full rounded-full bg-[#2563eb]" style={{ width: `${(d.value / max) * 100}%` }} /></div>
          <span className="w-16 shrink-0 text-right text-[12.5px] tabular-nums text-foreground-strong">{((d.value / total) * 100).toFixed(1)}%</span>
        </div>
      ))}
    </div>
  )
}

export function StatusBadge({ status, meta }: { status: string; meta: Record<string, { badge: string; dot: string }> }) {
  const m = meta[status]
  if (!m) return <span className="text-foreground-muted">{status}</span>
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[12px] font-semibold", m.badge)}><span className="size-1.5 rounded-full" style={{ background: m.dot }} />{status}</span>
}
