import { useRef, useState } from "react"
import { Download, RefreshCw, ShieldX } from "lucide-react"

import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { PageHeader } from "../ingestion/shared"
import { DASHBOARD_ROLES, isBoRole, isTchnccRole, type DashboardRole } from "./config"

/* ============================ HEADER + VAI TRÒ (BR-01) ============================ */
export function DashboardHeader({ role, onRole, actions }: { role: DashboardRole; onRole: (r: DashboardRole) => void; actions?: React.ReactNode }) {
  const bo = isBoRole(role)
  const tchncc = isTchnccRole(role)
  const scopeLabel = bo ? "Bộ Tư pháp" : tchncc ? "Tổ chức hành nghề công chứng" : "Sở Tư pháp"
  const scopeDesc = bo ? "trên phạm vi toàn quốc" : tchncc ? "thuộc tổ chức hành nghề công chứng" : "trên địa bàn tỉnh/thành phố"
  return (
    <PageHeader title={`Dashboard thông tin tổng hợp — ${scopeLabel}`}
      desc={tchncc
        ? `Thống kê tổng quan hồ sơ công chứng, VBCC điện tử, hồ sơ lưu trữ điện tử và yêu cầu khai thác ${scopeDesc}.`
        : `Thống kê tổng quan TCHNCC, CCV, giao dịch công chứng và ngăn chặn/cảnh báo rủi ro ${scopeDesc}.`}
      actions={
        <div className="flex items-center gap-3">
          {actions}
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] text-foreground-muted">Vai trò:</span>
            <NativeSelect value={role} onChange={(e) => onRole(e.target.value as DashboardRole)} className="h-8 w-[220px] text-[12.5px]">
              {DASHBOARD_ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </NativeSelect>
          </div>
        </div>
      } />
  )
}

/** BR-01/VR-07 (A.7.1) và BR-01/VR-06 (A.7.2): chặn truy cập khi tài khoản không thuộc BTP/STP (MSG_E-000701_001/MSG_E-000702_001). */
export function AccessGate({ role, children }: { role: DashboardRole; children: React.ReactNode }) {
  if (role !== "khac") return <>{children}</>
  return (
    <div className="flex flex-col items-center gap-3 rounded-[14px] border border-[#fecaca] bg-[#fef2f2] px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-[#fee2e2] text-[#b91c1c]"><ShieldX className="size-6" /></div>
      <div className="text-[15px] font-semibold text-[#b91c1c]">Bạn không có quyền truy cập.</div>
      <div className="max-w-md text-[13px] text-[#b91c1c]/80">Dashboard thông tin tổng hợp chỉ dành cho tài khoản Lãnh đạo/Chuyên viên Bộ Tư pháp, Lãnh đạo/Chuyên viên Sở Tư pháp, hoặc Lãnh đạo TCHNCC/Công chứng viên.</div>
    </div>
  )
}

export function F({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">{label}{required && <span className="text-[#dc2626]"> *</span>}</label>{children}</div>
}

/* ============================ THẺ CHỈ SỐ (C01–C05) ============================ */
export function StatCard({ label, value, color = "#2563eb", bg = "#eff6ff", icon }: { label: string; value: string | number; color?: string; bg?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-[14px] border border-border bg-surface p-4 shadow-sm">
      {icon && <div className="flex size-11 items-center justify-center rounded-xl" style={{ background: bg, color }}>{icon}</div>}
      <div>
        <div className="text-[22px] font-semibold tabular-nums" style={{ color }}>{value}</div>
        <div className="text-[12px] text-foreground-muted">{label}</div>
        <div className="text-[11px] text-foreground-subtle">Phát sinh trong kỳ</div>
      </div>
    </div>
  )
}

/* ============================ KHUNG BIỂU ĐỒ DÙNG CHUNG ============================ */
export function ChartCard({ title, onExport, toggleLabel, onToggle, children, legend }: {
  title: string; onExport: () => void; toggleLabel?: string; onToggle?: () => void; children: React.ReactNode; legend?: React.ReactNode
}) {
  return (
    <div className="rounded-[14px] border border-border bg-surface p-4 shadow-sm">
      <div className="mb-3 text-[13px] font-semibold text-foreground-strong">{title}</div>
      {children}
      {legend && <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12px] text-foreground-muted">{legend}</div>}
      <div className="mt-3 flex gap-2 border-t border-border pt-3">
        <button onClick={onExport} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-[12.5px] font-medium text-foreground-strong hover:bg-neutral-50"><Download className="size-3.5" />Xuất biểu đồ</button>
        {onToggle && <button onClick={onToggle} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-[12.5px] font-medium text-foreground-strong hover:bg-neutral-50"><RefreshCw className="size-3.5" />{toggleLabel ?? "Thay đổi hiển thị"}</button>}
      </div>
    </div>
  )
}

export const PALETTE = ["#2563eb", "#059669", "#f59e0b", "#dc2626", "#7c3aed", "#0891b2", "#db2777"]
const fmt = (n: number) => n.toLocaleString("vi-VN")

/* ============================ BR-05: HOVER TOOLTIP (tên vùng dữ liệu + số lượng + %) ============================ */
interface HoverTip { x: number; y: number; lines: string[] }
function useHoverTip() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [tip, setTip] = useState<HoverTip | null>(null)
  const show = (e: React.MouseEvent, lines: string[]) => {
    const box = wrapRef.current?.getBoundingClientRect()
    if (!box) return
    setTip({ x: e.clientX - box.left, y: e.clientY - box.top, lines })
  }
  const hide = () => setTip(null)
  return { wrapRef, tip, show, hide }
}
function HoverTipBox({ tip }: { tip: HoverTip | null }) {
  if (!tip) return null
  return (
    <div className="pointer-events-none absolute z-20 -translate-x-1/2 whitespace-nowrap rounded-md bg-neutral-900 px-2.5 py-1.5 text-[11px] leading-tight text-white shadow-lg"
      style={{ left: tip.x, top: tip.y - 12, transform: "translate(-50%, -100%)" }}>
      {tip.lines.map((l, i) => <div key={i} className={i === 0 ? "font-semibold" : "text-neutral-200"}>{l}</div>)}
    </div>
  )
}

/* ============================ B01/B03: TRÒN ↔ CỘT ============================ */
export function PieOrBar({ data, mode }: { data: { label: string; value: number; color: string }[]; mode: "pie" | "bar" }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  const { wrapRef, tip, show, hide } = useHoverTip()
  if (mode === "bar") {
    const max = Math.max(...data.map((d) => d.value), 1)
    return (
      <div ref={wrapRef} className="relative flex h-[220px] items-end justify-around gap-3 px-2">
        <HoverTipBox tip={tip} />
        {data.map((d) => (
          <div key={d.label} className="flex flex-1 flex-col items-center gap-1.5">
            <span className="text-[11px] font-medium tabular-nums text-foreground-strong">{fmt(d.value)}</span>
            <div className="w-full max-w-14 rounded-t-md" style={{ height: `${(d.value / max) * 160}px`, background: d.color }}
              onMouseMove={(e) => show(e, [d.label, `Số lượng: ${fmt(d.value)}`, `Tỉ lệ: ${((d.value / total) * 100).toFixed(1)}%`])} onMouseLeave={hide} />
            <span className="text-center text-[11px] text-foreground-muted">{d.label}</span>
          </div>
        ))}
      </div>
    )
  }
  let acc = 0
  const R = 70, C = 90
  const slices = data.map((d) => {
    const startAngle = (acc / total) * 2 * Math.PI; acc += d.value
    const endAngle = (acc / total) * 2 * Math.PI
    const large = endAngle - startAngle > Math.PI ? 1 : 0
    const x1 = C + R * Math.sin(startAngle), y1 = C - R * Math.cos(startAngle)
    const x2 = C + R * Math.sin(endAngle), y2 = C - R * Math.cos(endAngle)
    return { d: `M${C},${C} L${x1},${y1} A${R},${R} 0 ${large} 1 ${x2},${y2} Z`, ...d }
  })
  return (
    <div ref={wrapRef} className="relative flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
      <HoverTipBox tip={tip} />
      <svg viewBox="0 0 180 180" className="h-[180px] w-[180px] shrink-0">
        {slices.map((s) => <path key={s.label} d={s.d} fill={s.color} stroke="#fff" strokeWidth={1.5}
          onMouseMove={(e) => show(e, [s.label, `Số lượng: ${fmt(s.value)}`, `Tỉ lệ: ${((s.value / total) * 100).toFixed(1)}%`])} onMouseLeave={hide} />)}
        <circle cx={C} cy={C} r={40} fill="var(--color-surface, #fff)" />
      </svg>
      <div className="space-y-1.5">
        {data.map((d) => <div key={d.label} className="flex items-center gap-2 text-[12.5px]"><span className="size-2.5 rounded-full" style={{ background: d.color }} /><span className="text-foreground-muted">{d.label}:</span><span className="font-semibold tabular-nums text-foreground-strong">{((d.value / total) * 100).toFixed(1)}%</span></div>)}
      </div>
    </div>
  )
}

// Padding chung cho khung biểu đồ đường/cột theo thời gian: chừa chỗ cho nhãn số trục Oy + tiêu đề 2 trục.
const AXIS_PAD = { left: 50, right: 16, top: 16, bottom: 42 }
function AxisTitles({ W, H, xLabel, yLabel }: { W: number; H: number; xLabel: string; yLabel: string }) {
  return (
    <>
      <text x={(AXIS_PAD.left + (W - AXIS_PAD.right)) / 2} y={H - 6} textAnchor="middle" fontSize={10.5} fontWeight={600} fill="#71717a">{xLabel}</text>
      <text x={12} y={(AXIS_PAD.top + (H - AXIS_PAD.bottom)) / 2} textAnchor="middle" fontSize={10.5} fontWeight={600} fill="#71717a" transform={`rotate(-90 12 ${(AXIS_PAD.top + (H - AXIS_PAD.bottom)) / 2})`}>{yLabel}</text>
    </>
  )
}
function YTicks({ W, H, maxV }: { W: number; H: number; maxV: number }) {
  return <>{[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
    const yy = AXIS_PAD.top + f * (H - AXIS_PAD.top - AXIS_PAD.bottom)
    return (
      <g key={i}>
        <line x1={AXIS_PAD.left} x2={W - AXIS_PAD.right} y1={yy} y2={yy} stroke="#f1f5f9" strokeWidth={1} />
        <text x={AXIS_PAD.left - 8} y={yy + 3} textAnchor="end" fontSize={9} fill="#a3a3a3">{fmt(Math.round(maxV * (1 - f)))}</text>
      </g>
    )
  })}</>
}

/* ============================ B02/B07/B08/B11/B12: ĐƯỜNG ↔ VÙNG (1 hoặc nhiều series) ============================ */
export function LineOrArea({ categories, series, mode, xLabel = "Thời gian", yLabel = "Số lượng", width = 760 }: { categories: string[]; series: { name: string; color: string; data: number[] }[]; mode: "line" | "area"; xLabel?: string; yLabel?: string; width?: number }) {
  const W = width, H = 240
  const n = categories.length
  const maxV = Math.max(1, ...series.flatMap((s) => s.data)) * 1.1
  const total = series.reduce((s, ser) => s + ser.data.reduce((a, b) => a + b, 0), 0) || 1
  const x = (i: number) => AXIS_PAD.left + (i * (W - AXIS_PAD.left - AXIS_PAD.right)) / (Math.max(n, 2) - 1)
  const y = (v: number) => (H - AXIS_PAD.bottom) - (v / maxV) * (H - AXIS_PAD.top - AXIS_PAD.bottom)
  const step = Math.max(1, Math.ceil(n / 10))
  const { wrapRef, tip, show, hide } = useHoverTip()
  if (!n || series.every((s) => s.data.every((v) => v === 0))) return <div className="flex h-[240px] items-center justify-center text-[13px] text-foreground-subtle">Không có dữ liệu</div>
  return (
    <div ref={wrapRef} className="relative">
      <HoverTipBox tip={tip} />
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full">
        <YTicks W={W} H={H} maxV={maxV} />
        {series.map((s) => {
          const pts = s.data.map((v, i) => `${x(i)},${y(v)}`).join(" ")
          return (
            <g key={s.name}>
              {mode === "area" && <polygon points={`${AXIS_PAD.left},${H - AXIS_PAD.bottom} ${pts} ${x(n - 1)},${H - AXIS_PAD.bottom}`} fill={s.color} opacity={0.12} />}
              <polyline points={pts} fill="none" stroke={s.color} strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" />
              {s.data.map((v, i) => (
                <g key={i}>
                  <circle cx={x(i)} cy={y(v)} r={2.75} fill="#fff" stroke={s.color} strokeWidth={2} />
                  <circle cx={x(i)} cy={y(v)} r={9} fill="transparent"
                    onMouseMove={(e) => show(e, [`${s.name} — ${categories[i]}`, `Số lượng: ${fmt(v)}`, `Tỉ lệ: ${((v / total) * 100).toFixed(1)}%`])} onMouseLeave={hide} />
                </g>
              ))}
            </g>
          )
        })}
        {categories.map((l, i) => (i % step === 0 || i === n - 1) && <text key={i} x={x(i)} y={H - AXIS_PAD.bottom + 16} textAnchor="middle" fontSize={9} fill="#a3a3a3">{l}</text>)}
        <AxisTitles W={W} H={H} xLabel={xLabel} yLabel={yLabel} />
      </svg>
    </div>
  )
}

/* ============================ B09/B10: ĐƯỜNG NHIỀU SERIES ↔ CỘT XẾP CHỒNG ============================ */
export function LineOrStackedBar({ categories, series, mode, xLabel = "Thời gian", yLabel = "Số lượng" }: { categories: string[]; series: { name: string; color: string; data: number[] }[]; mode: "line" | "stackedBar"; xLabel?: string; yLabel?: string }) {
  const { wrapRef, tip, show, hide } = useHoverTip()
  if (mode === "line") return <LineOrArea categories={categories} series={series} mode="line" xLabel={xLabel} yLabel={yLabel} />
  const W = 760, H = 240
  const n = categories.length
  const totals = categories.map((_, i) => series.reduce((s, ser) => s + ser.data[i], 0))
  const grandTotal = totals.reduce((a, b) => a + b, 0) || 1
  const maxV = Math.max(1, ...totals) * 1.1
  const innerW = W - AXIS_PAD.left - AXIS_PAD.right
  const bw = Math.min(36, innerW / Math.max(n, 1) - 8)
  const x = (i: number) => AXIS_PAD.left + (i * innerW) / Math.max(n, 1) + (innerW / Math.max(n, 1) - bw) / 2
  const y = (v: number) => (H - AXIS_PAD.bottom) - (v / maxV) * (H - AXIS_PAD.top - AXIS_PAD.bottom)
  if (!n || totals.every((t) => t === 0)) return <div className="flex h-[240px] items-center justify-center text-[13px] text-foreground-subtle">Không có dữ liệu</div>
  return (
    <div ref={wrapRef} className="relative">
      <HoverTipBox tip={tip} />
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full">
        <YTicks W={W} H={H} maxV={maxV} />
        {categories.map((_, i) => {
          let acc = 0
          return series.map((s) => {
            const v = s.data[i]
            const yTop = y(acc + v), yBottom = y(acc)
            acc += v
            return <rect key={s.name} x={x(i)} y={yTop} width={bw} height={Math.max(0, yBottom - yTop)} fill={s.color}
              onMouseMove={(e) => show(e, [`${s.name} — ${categories[i]}`, `Số lượng: ${fmt(v)}`, `Tỉ lệ: ${((v / grandTotal) * 100).toFixed(1)}%`])} onMouseLeave={hide} />
          })
        })}
        {categories.map((l, i) => <text key={i} x={x(i) + bw / 2} y={H - AXIS_PAD.bottom + 16} textAnchor="middle" fontSize={9} fill="#a3a3a3">{l}</text>)}
        <AxisTitles W={W} H={H} xLabel={xLabel} yLabel={yLabel} />
      </svg>
    </div>
  )
}

/* ============================ B13: CỘT NGANG ↔ BẢNG DỮ LIỆU ============================ */
export interface ProvinceDist { tinh: string; dienTu: number; giay: number; total: number }
export function HorizontalBarOrTable({ data, mode }: { data: ProvinceDist[]; mode: "bar" | "table" }) {
  const totalAll = data.reduce((s, d) => s + d.total, 0) || 1
  if (mode === "table") {
    return (
      <div className="max-h-[420px] overflow-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-[13px]">
          <thead className="sticky top-0 bg-neutral-50"><tr>
            <th className="px-3 py-2 text-left font-semibold text-foreground-strong">STT</th>
            <th className="px-3 py-2 text-left font-semibold text-foreground-strong">Tỉnh/Thành phố</th>
            <th className="px-3 py-2 text-right font-semibold text-foreground-strong">GDCC điện tử</th>
            <th className="px-3 py-2 text-right font-semibold text-foreground-strong">GDCC giấy</th>
            <th className="px-3 py-2 text-right font-semibold text-foreground-strong">Tỉ lệ toàn quốc</th>
            <th className="px-3 py-2 text-right font-semibold text-foreground-strong">Tổng số</th>
          </tr></thead>
          <tbody>{data.map((d, i) => (
            <tr key={d.tinh} className="border-t border-neutral-100">
              <td className="px-3 py-2 text-foreground-muted">{i + 1}</td>
              <td className="px-3 py-2 font-medium text-foreground">{d.tinh}</td>
              <td className="px-3 py-2 text-right tabular-nums text-foreground-muted">{fmt(d.dienTu)}</td>
              <td className="px-3 py-2 text-right tabular-nums text-foreground-muted">{fmt(d.giay)}</td>
              <td className="px-3 py-2 text-right tabular-nums text-foreground-muted">{((d.total / totalAll) * 100).toFixed(1)}%</td>
              <td className="px-3 py-2 text-right tabular-nums font-semibold text-foreground-strong">{fmt(d.total)}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    )
  }
  const top = data.slice(0, 15)
  const max = Math.max(1, ...top.map((d) => d.total))
  const { wrapRef, tip, show, hide } = useHoverTip()
  return (
    <div ref={wrapRef} className="relative space-y-2">
      <HoverTipBox tip={tip} />
      {top.map((d) => (
        <div key={d.tinh} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-[12px] text-foreground-muted" title={d.tinh}>{d.tinh}</span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-neutral-100">
            <div className="h-full rounded-full bg-[#2563eb]" style={{ width: `${(d.total / max) * 100}%` }}
              onMouseMove={(e) => show(e, [d.tinh, `Số lượng: ${fmt(d.total)}`, `Tỉ lệ: ${((d.total / totalAll) * 100).toFixed(1)}%`])} onMouseLeave={hide} />
          </div>
          <span className="w-16 shrink-0 text-right text-[12px] tabular-nums text-foreground-strong">{fmt(d.total)}</span>
        </div>
      ))}
    </div>
  )
}

export function useToggle<T extends string>(a: T, b: T) {
  const [mode, setMode] = useState<T>(a)
  return { mode, toggle: () => setMode((m) => (m === a ? b : a)) }
}
