import { useMemo, useState } from "react"
import { AlertTriangle, CheckCircle2, Cpu, Download, FileDown, Printer, RefreshCw, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { inputCls } from "../ingestion/shared"
import { AdminOnlyGate, AdminReportHeader, DataTable, F, LineChart, ResourceBar, StatCard, StatusBadge } from "./components"
import {
  COMPONENT_TYPES, DEFAULT_FROM, DEFAULT_TO, MONITORING_METRICS, MONITORING_SERIES, OPERATION_STATUSES,
  SERIES_DATES, STATUS_META, SYSTEM_COMPONENTS,
  exportMsg, fmtNum, fmtVN, inRange, validateRange,
  type AdminRole, type MonitoringMetric, type SystemComponent,
} from "./config"

const severityRank: Record<string, number> = { "Sự cố": 0, "Cảnh báo": 1, "Hoạt động": 2 }

export function SystemMonitoringPage() {
  const showToast = useToast()
  const [role, setRole] = useState<AdminRole>("quan_tri")
  const [from, setFrom] = useState(DEFAULT_FROM)
  const [to, setTo] = useState(DEFAULT_TO)
  const [type, setType] = useState("all")
  const [status, setStatus] = useState("all")
  const [applied, setApplied] = useState({ from: DEFAULT_FROM, to: DEFAULT_TO, type: "all", status: "all" })
  const [error, setError] = useState("")
  const [quick, setQuick] = useState("")
  const [metric, setMetric] = useState<MonitoringMetric>("Khối lượng xử lý")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [updatedAt, setUpdatedAt] = useState("28/08/2026 09:15")

  const rows = useMemo(() => {
    let r = SYSTEM_COMPONENTS.filter((c) => inRange(c.updatedAtISO.slice(0, 10), applied.from, applied.to))
    if (applied.type !== "all") r = r.filter((c) => c.type === applied.type)
    if (applied.status !== "all") r = r.filter((c) => c.status === applied.status)
    if (quick.trim()) r = r.filter((c) => c.name.toLowerCase().includes(quick.trim().toLowerCase()))
    return [...r].sort((a, b) => severityRank[a.status] - severityRank[b.status] || (a.updatedAtISO < b.updatedAtISO ? 1 : -1))
  }, [applied, quick])

  const doSearch = () => { const err = validateRange(from, to); if (err) return setError(err); setError(""); setApplied({ from, to, type, status }); setPage(1) }
  const doRefresh = () => { setApplied({ ...applied }); setUpdatedAt("28/08/2026 09:20"); showToast("Đã làm mới số liệu giám sát.") }
  const doExport = (label: string) => { const r = exportMsg(rows.length); showToast(`${r.msg}${r.kind === "ok" ? ` (${label})` : ""}`, r.kind) }

  const active = rows.filter((c) => c.status !== "Sự cố").length
  const totalVolume = rows.reduce((s, c) => s + c.volume, 0)
  const avgSuccess = rows.length ? rows.reduce((s, c) => s + c.successRate, 0) / rows.length : 0
  const totalAlerts = rows.reduce((s, c) => s + c.alerts, 0)
  const avgCpu = rows.length ? Math.round(rows.reduce((s, c) => s + c.cpu, 0) / rows.length) : 0
  const avgRam = rows.length ? Math.round(rows.reduce((s, c) => s + c.ram, 0) / rows.length) : 0
  const avgDisk = rows.length ? Math.round(rows.reduce((s, c) => s + c.disk, 0) / rows.length) : 0

  const columns = [
    { key: "stt", header: "STT", cell: (_: SystemComponent, i: number) => <span className="tabular-nums text-foreground-muted">{i + 1}</span>, className: "w-11 text-center" },
    { key: "name", header: "Thành phần", cell: (r: SystemComponent) => <span className="font-medium text-foreground">{r.name}</span>, className: "min-w-[180px]" },
    { key: "type", header: "Loại", cell: (r: SystemComponent) => <span className="text-foreground-muted">{r.type}</span> },
    { key: "status", header: "Trạng thái", cell: (r: SystemComponent) => <StatusBadge status={r.status} meta={STATUS_META} /> },
    { key: "volume", header: "Khối lượng xử lý", cell: (r: SystemComponent) => <span className="tabular-nums text-foreground">{fmtNum(r.volume)}</span>, className: "text-right" },
    { key: "success", header: "Tỷ lệ thành công", cell: (r: SystemComponent) => <span className="tabular-nums text-foreground">{r.successRate.toFixed(1)}%</span>, className: "text-right" },
    { key: "resp", header: "TG phản hồi TB", cell: (r: SystemComponent) => <span className="tabular-nums text-foreground-muted">{r.avgResponseMs} ms</span>, className: "text-right" },
    { key: "cpu", header: "CPU", cell: (r: SystemComponent) => <span className="tabular-nums text-foreground-muted">{r.cpu.toFixed(1)}%</span>, className: "text-right" },
    { key: "ram", header: "RAM", cell: (r: SystemComponent) => <span className="tabular-nums text-foreground-muted">{r.ram.toFixed(1)}%</span>, className: "text-right" },
    { key: "disk", header: "Disk", cell: (r: SystemComponent) => <span className="tabular-nums text-foreground-muted">{r.disk.toFixed(1)}%</span>, className: "text-right" },
    { key: "alerts", header: "Cảnh báo", cell: (r: SystemComponent) => <span className={cn("tabular-nums", r.alerts > 0 ? "font-semibold text-[#b91c1c]" : "text-foreground-muted")}>{r.alerts}</span>, className: "text-center" },
    { key: "updated", header: "Cập nhật cuối", cell: (r: SystemComponent) => <span className="whitespace-nowrap tabular-nums text-foreground-muted">{fmtVN(r.updatedAtISO.slice(0, 10))} {r.updatedAtISO.slice(11, 16)}</span> },
  ]

  return (
    <div className="space-y-4">
      <AdminReportHeader title="Báo cáo giám sát hệ thống" desc="Tổng hợp trạng thái hoạt động, hiệu suất và tài nguyên hệ thống. Theo dõi trực tuyến và kết xuất báo cáo."
        role={role} onRole={setRole}
        actions={<><Button variant="outline" size="sm" onClick={doRefresh}><RefreshCw className="size-4" />Làm mới</Button><Button variant="outline" size="sm" onClick={() => doExport("GiamSatHeThong.xlsx")}><Download className="size-4" />Xuất Excel</Button></>} />
      <AdminOnlyGate role={role}>
        <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
          <div className="mb-1 text-[13px] font-semibold text-foreground-strong">Bộ lọc</div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <F label="Từ ngày" required><input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setError("") }} className={cn(inputCls, "text-[13.5px]")} /></F>
            <F label="Đến ngày" required><input type="date" value={to} onChange={(e) => { setTo(e.target.value); setError("") }} className={cn(inputCls, "text-[13.5px]")} /></F>
            <F label="Loại thành phần"><NativeSelect value={type} onChange={(e) => setType(e.target.value)}><option value="all">Tất cả</option>{COMPONENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</NativeSelect></F>
            <F label="Trạng thái"><NativeSelect value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">Tất cả</option>{OPERATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</NativeSelect></F>
          </div>
          {error && <div className="mt-3 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]">{error}</div>}
          <div className="mt-4 flex flex-wrap gap-2.5">
            <Button onClick={doSearch}><Search className="size-4" />Tra cứu</Button>
            <Button variant="outline" onClick={() => doExport("GiamSatHeThong.pdf")}><FileDown className="size-4" />Xuất PDF</Button>
            <Button variant="outline" onClick={() => window.print()}><Printer className="size-4" />In báo cáo</Button>
          </div>
          <div className="mt-3 text-[11.5px] text-foreground-subtle">Thời điểm cập nhật gần nhất: <span className="font-medium text-foreground">{updatedAt}</span></div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Thành phần hoạt động" value={`${active}/${rows.length}`} icon={<CheckCircle2 className="size-5" />} />
          <StatCard label="Khối lượng xử lý" value={fmtNum(totalVolume)} color="#7c3aed" bg="#f5f3ff" icon={<Cpu className="size-5" />} />
          <StatCard label="Tỷ lệ thành công" value={`${avgSuccess.toFixed(1)}%`} color="#047857" bg="#ecfdf5" icon={<CheckCircle2 className="size-5" />} />
          <StatCard label="Số cảnh báo" value={totalAlerts} danger={totalAlerts > 0} icon={<AlertTriangle className="size-5" />} />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <ResourceBar label="CPU" pct={avgCpu} warnAt={80} />
          <ResourceBar label="RAM" pct={avgRam} warnAt={80} />
          <ResourceBar label="Disk" pct={avgDisk} warnAt={90} />
        </div>

        <div className="rounded-[14px] border border-border bg-surface p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-foreground-strong">Biểu đồ diễn biến theo thời gian</span>
            <NativeSelect value={metric} onChange={(e) => setMetric(e.target.value as MonitoringMetric)} className="h-8 w-[190px] text-[12.5px]">{MONITORING_METRICS.map((m) => <option key={m} value={m}>{m}</option>)}</NativeSelect>
          </div>
          <LineChart labels={SERIES_DATES.map((d) => fmtVN(d).slice(0, 5))} data={MONITORING_SERIES[metric]} />
        </div>

        <DataTable title="Bảng trạng thái vận hành" rows={rows} columns={columns} page={page} pageSize={pageSize} onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }}
          quickFilterHint={<input value={quick} onChange={(e) => setQuick(e.target.value)} placeholder="Tìm nhanh theo tên thành phần…" className={cn(inputCls, "h-8 w-[240px] text-[12.5px]")} />} />
      </AdminOnlyGate>
    </div>
  )
}
