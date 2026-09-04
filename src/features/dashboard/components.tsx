import { useRef, useState } from "react"
import { ChevronLeft, Download, GripVertical, Pencil, RefreshCw, RotateCcw, ShieldX, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { PageHeader } from "../ingestion/shared"
import {
  DASHBOARD_ROLES, EXPORT_FORMATS, EXPORT_TIME_PRESETS, PROVINCES_34, isBoRole, isTchnccRole,
  type DashboardRole, type DashboardType, type ExportFilterState, type ExportFormat, type ExportTimePreset, type WidgetConfig, type WidgetWidth,
} from "./config"

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

/* ============================================================================
   A.7.4: CẤU HÌNH HIỂN THỊ DASHBOARD
   ============================================================================ */

export interface WidgetMeta { id: string; group: "card" | "chart"; defaultTitle: string }

/** BR-07/8.3: 3 mức độ rộng cố định → flex-basis, tự động reflow theo hàng. */
const WIDTH_CLASS: Record<WidgetWidth, string> = {
  "30": "w-full md:w-[calc(33.333%-0.5rem)]",
  "50": "w-full md:w-[calc(50%-0.375rem)]",
  "100": "w-full",
}
export function WidgetGrid({ items }: { items: { id: string; width: WidgetWidth; node: React.ReactNode }[] }) {
  return (
    <div className="flex flex-wrap gap-3">
      {items.map((it) => <div key={it.id} className={WIDTH_CLASS[it.width]}>{it.node}</div>)}
    </div>
  )
}

function ConfirmDialog({ title, message, onCancel, onConfirm }: { title: string; message: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-6" onClick={onCancel}>
      <div className="w-full max-w-[440px] rounded-xl bg-surface p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="text-[15px] font-semibold text-foreground-strong">{title}</div>
        <p className="mt-2 text-[13.5px] leading-relaxed text-foreground-muted">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>Hủy</Button>
          <Button onClick={onConfirm}>Xác nhận</Button>
        </div>
      </div>
    </div>
  )
}

/** SCR-A.7.4-01: Panel cấu hình hiển thị (2 tab: Thành phần / Bố cục) — Drawer từ phải sang. */
export function ConfigPanel({ open, onClose, widgets, configs, onToggleVisible, onRename, onWidthChange, onReorder, onRestoreDefault, onOpenExport }: {
  open: boolean; onClose: () => void; widgets: WidgetMeta[]; configs: Record<string, WidgetConfig>
  onToggleVisible: (id: string) => void; onRename: (id: string, name: string) => string
  onWidthChange: (id: string, w: WidgetWidth) => void; onReorder: (dragId: string, dropId: string) => void
  onRestoreDefault: () => void; onOpenExport: () => void
}) {
  const [tab, setTab] = useState<"thanh-phan" | "bo-cuc">("thanh-phan")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState("")
  const [nameError, setNameError] = useState("")
  const [confirmRestore, setConfirmRestore] = useState(false)
  const [dragId, setDragId] = useState<string | null>(null)
  if (!open) return null

  const ordered = [...widgets].sort((a, b) => (configs[a.id]?.order ?? 0) - (configs[b.id]?.order ?? 0))
  const cards = ordered.filter((w) => w.group === "card")
  const charts = ordered.filter((w) => w.group === "chart")

  const startEdit = (w: WidgetMeta) => { setEditingId(w.id); setDraftName(configs[w.id]?.customName || w.defaultTitle); setNameError("") }
  const commitEdit = () => {
    if (!editingId) return
    const err = onRename(editingId, draftName.trim())
    if (err) { setNameError(err); return }
    setEditingId(null); setNameError("")
  }

  const row = (w: WidgetMeta) => {
    const cfg = configs[w.id]
    const title = cfg?.customName || w.defaultTitle
    return (
      <div key={w.id} className="flex items-center justify-between gap-3 border-b border-neutral-100 px-4 py-2.5 last:border-0">
        <label className="flex min-w-0 flex-1 items-center gap-2.5">
          <input type="checkbox" checked={cfg?.visible ?? true} onChange={() => onToggleVisible(w.id)} className="size-4 shrink-0 accent-[#2563eb]" />
          {editingId === w.id ? (
            <span className="min-w-0 flex-1">
              <input autoFocus value={draftName} onChange={(e) => setDraftName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditingId(null) }}
                onBlur={commitEdit} className="h-8 w-full rounded-md border border-border px-2 text-[13px]" />
              {nameError && <span className="mt-1 block text-[11px] text-[#b91c1c]">{nameError}</span>}
            </span>
          ) : (
            <span className="truncate text-[13.5px] text-foreground-strong">{title}</span>
          )}
        </label>
        {editingId !== w.id && (
          <button onClick={() => startEdit(w)} className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-foreground-subtle hover:bg-neutral-100 hover:text-foreground-strong" title="Sửa tên">
            <Pencil className="size-3.5" />
          </button>
        )}
      </div>
    )
  }

  const layoutRow = (w: WidgetMeta) => {
    const cfg = configs[w.id]
    const title = cfg?.customName || w.defaultTitle
    return (
      <div key={w.id} draggable
        onDragStart={() => setDragId(w.id)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => { if (dragId && dragId !== w.id) onReorder(dragId, w.id); setDragId(null) }}
        className={cn2("flex items-center gap-3 border-b border-neutral-100 px-4 py-2.5 last:border-0", dragId === w.id && "opacity-40")}>
        <GripVertical className="size-4 shrink-0 cursor-grab text-foreground-subtle active:cursor-grabbing" />
        <span className="min-w-0 flex-1 truncate text-[13.5px] text-foreground-strong">{title}</span>
        <div className="flex shrink-0 gap-1">
          {(["30", "50", "100"] as WidgetWidth[]).map((w2) => (
            <button key={w2} onClick={() => onWidthChange(w.id, w2)}
              className={cn2("h-7 rounded-md border px-2 text-[11.5px] font-medium", cfg?.width === w2 ? "border-[#2563eb] bg-[#eff6ff] text-[#2563eb]" : "border-border text-foreground-muted hover:bg-neutral-50")}>
              {w2}%
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div className="flex h-full w-full max-w-xl flex-col bg-surface shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="text-[15px] font-semibold text-foreground-strong">Cấu hình hiển thị Dashboard</div>
          <button onClick={onClose} className="inline-flex size-8 items-center justify-center rounded-md text-foreground-subtle hover:bg-neutral-100"><X className="size-4" /></button>
        </div>
        <div className="flex border-b border-border px-5">
          <button onClick={() => setTab("thanh-phan")} className={cn2("border-b-2 px-3 py-2.5 text-[13.5px] font-medium", tab === "thanh-phan" ? "border-[#2563eb] text-[#2563eb]" : "border-transparent text-foreground-muted")}>Thành phần hiển thị</button>
          <button onClick={() => setTab("bo-cuc")} className={cn2("border-b-2 px-3 py-2.5 text-[13.5px] font-medium", tab === "bo-cuc" ? "border-[#2563eb] text-[#2563eb]" : "border-transparent text-foreground-muted")}>Bố cục hiển thị</button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {tab === "thanh-phan" ? (
            <div className="space-y-5">
              <div>
                <div className="mb-2 text-[12.5px] font-semibold text-foreground-strong">Card thống kê</div>
                <div className="rounded-lg border border-border">{cards.map(row)}</div>
              </div>
              <div>
                <div className="mb-2 text-[12.5px] font-semibold text-foreground-strong">Biểu đồ</div>
                <div className="rounded-lg border border-border">{charts.map(row)}</div>
              </div>
              <p className="text-[11.5px] text-foreground-subtle">Tối thiểu 1 widget phải hiển thị. Tên tùy chỉnh chỉ hiển thị với chính bạn.</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border">{ordered.map(layoutRow)}</div>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-border px-5 py-4">
          <Button variant="outline" onClick={() => setConfirmRestore(true)}><RotateCcw className="size-4" />Khôi phục mặc định</Button>
          <Button onClick={onOpenExport}><Download className="size-4" />Kết xuất báo cáo</Button>
        </div>
      </div>
      {confirmRestore && (
        <ConfirmDialog title="Khôi phục bố cục mặc định?" message="Toàn bộ cấu hình tùy chỉnh (ẩn/hiện, tên, vị trí, độ rộng) sẽ bị xóa."
          onCancel={() => setConfirmRestore(false)} onConfirm={() => { onRestoreDefault(); setConfirmRestore(false) }} />
      )}
    </div>
  )
}
function cn2(...cls: (string | false | undefined)[]) { return cls.filter(Boolean).join(" ") }

/** SCR-A.7.4-02: Dialog kết xuất báo cáo — 2 bước (chọn điều kiện → xem trước). */
export function ExportDialog({ open, onClose, dashboardType, showProvince, filter, onChangeFilter, previewItems, onExport, rangeLabel }: {
  open: boolean; onClose: () => void; dashboardType: DashboardType; showProvince: boolean
  filter: ExportFilterState; onChangeFilter: (f: ExportFilterState) => void
  previewItems: { id: string; title: string; node: React.ReactNode }[]
  onExport: (f: ExportFilterState) => void
  rangeLabel: string
}) {
  const [step, setStep] = useState<1 | 2>(1)
  const [error, setError] = useState("")
  if (!open) return null

  const doPreview = () => {
    if (!filter.preset) { setError("Vui lòng chọn phạm vi thời gian kết xuất."); return }
    if (filter.preset === "Tùy chọn" && (!filter.tuNgay || !filter.denNgay || filter.tuNgay > filter.denNgay)) {
      setError("Vui lòng chọn khoảng thời gian hợp lệ (Từ ngày ≤ Đến ngày)."); return
    }
    setError(""); setStep(2)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-6" onClick={onClose}>
      <div className="flex max-h-[88vh] w-full max-w-3xl flex-col rounded-xl bg-surface shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="text-[15px] font-semibold text-foreground-strong">Kết xuất báo cáo Dashboard</div>
          <button onClick={onClose} className="inline-flex size-8 items-center justify-center rounded-md text-foreground-subtle hover:bg-neutral-100"><X className="size-4" /></button>
        </div>

        {step === 1 ? (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <F label="Phạm vi thời gian" required>
                  <NativeSelect value={filter.preset} onChange={(e) => onChangeFilter({ ...filter, preset: e.target.value as ExportTimePreset })}>
                    {EXPORT_TIME_PRESETS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </NativeSelect>
                </F>
                {showProvince && (
                  <F label="Phạm vi Tỉnh/Thành phố">
                    <NativeSelect value={filter.province} onChange={(e) => onChangeFilter({ ...filter, province: e.target.value })}>
                      <option value="Toàn quốc">Toàn quốc</option>
                      {PROVINCES_34.map((p) => <option key={p} value={p}>{p}</option>)}
                    </NativeSelect>
                  </F>
                )}
                {filter.preset === "Tùy chọn" && (
                  <>
                    <F label="Từ ngày" required><input type="date" value={filter.tuNgay} onChange={(e) => onChangeFilter({ ...filter, tuNgay: e.target.value })} className="h-9 w-full rounded-lg border border-border px-3 text-[13.5px]" /></F>
                    <F label="Đến ngày" required><input type="date" value={filter.denNgay} onChange={(e) => onChangeFilter({ ...filter, denNgay: e.target.value })} className="h-9 w-full rounded-lg border border-border px-3 text-[13.5px]" /></F>
                  </>
                )}
              </div>
              <div>
                <div className="mb-2 text-[12.5px] font-semibold text-foreground-strong">Định dạng kết xuất</div>
                <div className="flex flex-wrap gap-4">
                  {EXPORT_FORMATS.map((fmt) => (
                    <label key={fmt} className="flex cursor-pointer items-center gap-1.5 text-[13.5px]">
                      <input type="radio" name="export-format" checked={filter.format === fmt} onChange={() => onChangeFilter({ ...filter, format: fmt as ExportFormat })} className="accent-[#2563eb]" />
                      {fmt}
                    </label>
                  ))}
                </div>
              </div>
              {error && <div className="rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]">{error}</div>}
            </div>
            <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
              <Button variant="outline" onClick={onClose}>Hủy</Button>
              <Button onClick={doPreview}>Xem trước</Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="rounded-lg border border-border bg-neutral-50 p-5">
                <div className="text-center">
                  <div className="text-[15px] font-bold uppercase text-foreground-strong">Báo cáo tổng hợp — Dashboard cấp {dashboardType}</div>
                  <div className="mt-1 text-[12.5px] text-foreground-muted">Thời gian: {filter.preset} ({rangeLabel}){showProvince && <> | Phạm vi: {filter.province}</>}</div>
                </div>
                <div className="my-4 border-t border-dashed border-border" />
                {previewItems.length ? <div className="flex flex-wrap gap-3">{previewItems.map((it) => <div key={it.id} className="w-full md:w-[calc(50%-0.375rem)]">{it.node}</div>)}</div>
                  : <div className="py-10 text-center text-[13px] text-foreground-subtle">Không có dữ liệu theo điều kiện kết xuất đã chọn.</div>}
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
              <Button variant="outline" onClick={() => setStep(1)}><ChevronLeft className="size-4" />Quay lại</Button>
              <Button onClick={() => onExport(filter)}><Download className="size-4" />Xuất file</Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
