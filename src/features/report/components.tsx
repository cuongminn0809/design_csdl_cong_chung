import { Clock, Download, RotateCcw, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { PageHeader, Pagination, Th, inputCls } from "../ingestion/shared"
import { REPORT_ROLES, YEARS, resolveRange, type ReportRole, type TimeState } from "./config"

export function ReportHeader({ title, desc, role, onRole }: { title: string; desc: string; role: ReportRole; onRole: (r: ReportRole) => void }) {
  return (
    <PageHeader title={title} desc={desc}
      actions={
        <div className="flex items-center gap-2">
          <span className="text-[12.5px] text-foreground-muted">Vai trò:</span>
          <NativeSelect value={role} onChange={(e) => onRole(e.target.value as ReportRole)} className="h-8 w-[210px] text-[12.5px]">
            {REPORT_ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
          </NativeSelect>
        </div>
      }
    />
  )
}

const F = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">{label}</label>{children}</div>
)

/** Thanh bộ lọc thời gian F01-F06 (VR-01) + slot filter mở rộng + Áp dụng/Đặt lại. */
export function TimeFilterBar({ time, onTime, extra, error, onApply, onReset }: {
  time: TimeState; onTime: (t: TimeState) => void; extra?: React.ReactNode; error?: string
  onApply: () => void; onReset: () => void
}) {
  const set = (p: Partial<TimeState>) => onTime({ ...time, ...p })
  const range = resolveRange(time)
  const custom = time.year === "custom"
  return (
    <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
      <div className="mb-1 text-[13px] font-semibold text-foreground-strong">Bộ lọc tìm kiếm</div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <F label="Năm *"><NativeSelect value={String(time.year)} onChange={(e) => set({ year: e.target.value === "custom" ? "custom" : Number(e.target.value) })}>{YEARS.map((y) => <option key={String(y)} value={String(y)}>{y === "custom" ? "Tùy chọn" : y}</option>)}</NativeSelect></F>
        {!custom && <F label="Loại kỳ *"><NativeSelect value={time.kind} onChange={(e) => set({ kind: e.target.value as TimeState["kind"] })}><option value="ca-nam">Cả năm</option><option value="theo-quy">Theo quý</option><option value="theo-thang">Theo tháng</option></NativeSelect></F>}
        {!custom && time.kind === "theo-thang" && <F label="Chọn tháng"><NativeSelect value={time.month} onChange={(e) => set({ month: Number(e.target.value) })}>{Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>Tháng {m}</option>)}</NativeSelect></F>}
        {!custom && time.kind === "theo-quy" && <F label="Chọn quý"><NativeSelect value={time.quarter} onChange={(e) => set({ quarter: Number(e.target.value) })}>{[1, 2, 3, 4].map((q) => <option key={q} value={q}>Quý {q}</option>)}</NativeSelect></F>}
        {custom && <F label="Từ ngày"><input type="date" value={time.tuNgay} onChange={(e) => set({ tuNgay: e.target.value })} className={cn(inputCls, "text-[13.5px]")} /></F>}
        {custom && <F label="Đến ngày"><input type="date" value={time.denNgay} onChange={(e) => set({ denNgay: e.target.value })} className={cn(inputCls, "text-[13.5px]")} /></F>}
        {extra}
      </div>

      {error && <div className="mt-3 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]">{error}</div>}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-md border border-border bg-surface-muted px-3 py-1.5 text-[12.5px] text-foreground-muted">
          <Clock className="size-3.5" />Khoảng thời gian thống kê hiện tại: <span className="font-semibold text-foreground-strong">{range.label || "—"}</span>
        </div>
        <div className="flex gap-2.5">
          <Button onClick={onApply}><Search className="size-4" />Áp dụng</Button>
          <Button variant="outline" onClick={onReset}><RotateCcw className="size-4" />Đặt lại</Button>
        </div>
      </div>
      <p className="mt-2 text-[11.5px] text-foreground-subtle">* Ngày kết thúc mặc định = ngày hiện tại − 2 (D-2, do độ trễ chuẩn hóa dữ liệu trong kho).</p>
    </div>
  )
}

/* ============================ CARD & BIỂU ĐỒ ============================ */
export function StatCard({ label, value, color = "#2563eb", bg = "#eff6ff", icon }: { label: string; value: number; color?: string; bg?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-[14px] border border-border bg-surface p-4 shadow-sm">
      {icon && <div className="flex size-11 items-center justify-center rounded-xl" style={{ background: bg, color }}>{icon}</div>}
      <div><div className="text-[24px] font-semibold tabular-nums" style={{ color }}>{value.toLocaleString("vi-VN")}</div><div className="text-[12px] text-foreground-muted">{label}</div></div>
    </div>
  )
}

const PALETTE = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#eab308"]
export function DonutChart({ title, segments }: { title: string; segments: { label: string; value: number; pct: number }[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0)
  let acc = 0
  const R = 52, C = 2 * Math.PI * R
  return (
    <div className="rounded-[14px] border border-border bg-surface p-4 shadow-sm">
      <div className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-foreground-subtle">{title}</div>
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 140 140" className="size-[132px] shrink-0">
          <circle cx="70" cy="70" r={R} fill="none" stroke="#f1f5f9" strokeWidth="16" />
          {total > 0 && segments.map((s, i) => {
            const len = (s.value / total) * C; const off = acc; acc += len
            return <circle key={i} cx="70" cy="70" r={R} fill="none" stroke={PALETTE[i % PALETTE.length]} strokeWidth="16" strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-off} transform="rotate(-90 70 70)" />
          })}
          <text x="70" y="66" textAnchor="middle" className="fill-foreground-strong" style={{ fontSize: 20, fontWeight: 700 }}>{total.toLocaleString("vi-VN")}</text>
          <text x="70" y="84" textAnchor="middle" className="fill-foreground-muted" style={{ fontSize: 9 }}>giao dịch</text>
        </svg>
        <div className="flex-1 space-y-1.5">
          {segments.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-[12px]">
              <span className="size-2.5 shrink-0 rounded-sm" style={{ background: PALETTE[i % PALETTE.length] }} />
              <span className="flex-1 truncate text-foreground-muted">{s.label}</span>
              <span className="font-semibold tabular-nums text-foreground-strong">{s.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function BarChart({ title, bars, horizontal }: { title: string; bars: { label: string; value: number }[]; horizontal?: boolean }) {
  const max = Math.max(1, ...bars.map((b) => b.value))
  return (
    <div className="rounded-[14px] border border-border bg-surface p-4 shadow-sm">
      <div className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-foreground-subtle">{title}</div>
      {!bars.length ? <div className="py-8 text-center text-[12px] text-foreground-subtle">Không có dữ liệu</div> : horizontal ? (
        <div className="space-y-2">
          {bars.map((b, i) => (
            <div key={i} className="flex items-center gap-2 text-[12px]">
              <span className="w-[150px] shrink-0 truncate text-foreground-muted">{b.label}</span>
              <div className="h-4 flex-1 rounded bg-neutral-100"><div className="h-4 rounded" style={{ width: `${(b.value / max) * 100}%`, background: PALETTE[i % PALETTE.length] }} /></div>
              <span className="w-8 shrink-0 text-right font-semibold tabular-nums text-foreground-strong">{b.value}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-[160px] items-end gap-2">
          {bars.map((b, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[11px] font-semibold tabular-nums text-foreground-strong">{b.value}</span>
              <div className="w-full rounded-t" style={{ height: `${(b.value / max) * 120}px`, background: PALETTE[i % PALETTE.length], minHeight: 2 }} />
              <span className="line-clamp-2 text-center text-[10px] leading-tight text-foreground-muted">{b.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ============================ BẢNG BÁO CÁO ============================ */
export function ReportTable<T>({ title, rows, columns, onExport, page, pageSize, onPage, onPageSize }: {
  title: string; rows: T[]; columns: { key: string; header: string; cell: (r: T, i: number) => React.ReactNode; className?: string }[]
  onExport: () => void; page: number; pageSize: number; onPage: (n: number) => void; onPageSize: (n: number) => void
}) {
  const start = (Math.min(page, Math.max(1, Math.ceil(rows.length / pageSize))) - 1) * pageSize
  const paged = rows.slice(start, start + pageSize)
  return (
    <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
        <div className="text-[13px] font-semibold text-foreground-strong">{title} <span className="ml-1 font-normal text-foreground-muted">({rows.length} bản ghi)</span></div>
        <Button variant="outline" size="sm" onClick={onExport} className="h-8 gap-1.5"><Download className="size-4" />Xuất báo cáo</Button>
      </div>
      {rows.length ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm" style={{ minWidth: columns.length * 130 }}>
              <thead><tr className="border-b border-border bg-neutral-50">{columns.map((c) => <Th key={c.key} className={c.className}>{c.header}</Th>)}</tr></thead>
              <tbody>
                {paged.map((r, i) => (
                  <tr key={i} className="border-b border-neutral-100 hover:bg-neutral-50">
                    {columns.map((c) => <td key={c.key} className={cn("px-4 py-3 text-[13px]", c.className)}>{c.cell(r, start + i)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pageSize={pageSize} total={rows.length} unit="bản ghi" onPage={onPage} onPageSize={onPageSize} />
        </>
      ) : (
        <div className="px-5 py-14 text-center text-[13px] text-foreground-muted">Không tìm thấy bản ghi dữ liệu báo cáo phù hợp với điều kiện tìm kiếm.</div>
      )}
    </div>
  )
}
