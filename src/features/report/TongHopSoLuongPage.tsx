import { useMemo, useState } from "react"
import { Layers } from "lucide-react"

import { useToast } from "@/features/reconciliation/components/Toast"
import { MultiSelect } from "@/features/reconciliation/components/MultiSelect"
import { BarChart, DonutChart, ReportHeader, ReportTable, StatCard, TimeFilterBar } from "./components"
import {
  DATA_SOURCES, DEFAULT_TIME, GD_TXNS, METHODS, PROVINCES, TCHNCC_LIST,
  distribution, exportFileName, exportResult, inRange, resolveRange, scopeRows,
  showCcv, showTinh, showToChuc, type GDTxn, type ReportRole, type TimeState,
} from "./config"

interface Extras { nguon: string[]; pt: string[]; toChuc: string[]; tinh: string[] }
const EMPTY: Extras = { nguon: [], pt: [], toChuc: [], tinh: [] }

export function TongHopSoLuongPage() {
  const showToast = useToast()
  const [role, setRole] = useState<ReportRole>("ld_btp")
  const [time, setTime] = useState<TimeState>(DEFAULT_TIME)
  const [draft, setDraft] = useState<Extras>(EMPTY)
  const [applied, setApplied] = useState<{ time: TimeState; ex: Extras }>({ time: DEFAULT_TIME, ex: EMPTY })
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const rows = useMemo(() => {
    const range = resolveRange(applied.time)
    if (range.error) return []
    let r = scopeRows(GD_TXNS, role).filter((x) => inRange(x.ngayCCISO, range))
    const { nguon, pt, toChuc, tinh } = applied.ex
    if (nguon.length) r = r.filter((x) => nguon.includes(x.nguon))
    if (pt.length) r = r.filter((x) => pt.includes(x.phuongThuc))
    if (toChuc.length) r = r.filter((x) => toChuc.includes(x.toChuc))
    if (tinh.length && showTinh(role)) r = r.filter((x) => tinh.includes(x.tinh))
    return r
  }, [role, applied])

  const apply = () => { const rg = resolveRange(time); if (rg.error) return setError(rg.error); setError(""); setApplied({ time, ex: draft }); setPage(1) }
  const reset = () => { setTime(DEFAULT_TIME); setDraft(EMPTY); setApplied({ time: DEFAULT_TIME, ex: EMPTY }); setError(""); setPage(1) }
  const doExport = () => showToast(`${exportResult(rows.length).msg}${rows.length ? ` (${exportFileName(role, "BaoCao_GiaoDich")})` : ""}`, exportResult(rows.length).kind)

  const srcDist = distribution(rows, (r) => r.nguon, DATA_SOURCES)
  const methodDist = distribution(rows, (r) => r.phuongThuc, METHODS)

  const columns = [
    { key: "stt", header: "STT", cell: (_: GDTxn, i: number) => <span className="tabular-nums text-foreground-muted">{i + 1}</span>, className: "w-11 text-center" },
    { key: "soCC", header: "Số công chứng", cell: (r: GDTxn) => <span className="font-mono text-[12.5px] font-semibold text-link">{r.soCC}</span> },
    { key: "tenGD", header: "Tên giao dịch", cell: (r: GDTxn) => r.tenGD, className: "min-w-[200px]" },
    { key: "ngayCC", header: "Ngày công chứng", cell: (r: GDTxn) => <span className="tabular-nums text-foreground-muted">{r.ngayCC}</span> },
    ...(showToChuc(role) ? [{ key: "toChuc", header: "Tổ chức thực hiện", cell: (r: GDTxn) => <span className="text-foreground-muted">{r.toChuc}</span>, className: "min-w-[160px]" }] : []),
    ...(showCcv(role) ? [{ key: "ccv", header: "Công chứng viên", cell: (r: GDTxn) => <span className="text-foreground-muted">{r.ccv}</span> }] : []),
    { key: "pt", header: "Phương thức CC", cell: (r: GDTxn) => <span className="text-foreground-muted">{r.phuongThuc}</span>, className: "min-w-[140px]" },
    { key: "nguon", header: "Nguồn dữ liệu", cell: (r: GDTxn) => <span className="text-foreground-muted">{r.nguon}</span>, className: "min-w-[170px]" },
    { key: "yccs", header: "Số lần YCCS", cell: (r: GDTxn) => <span className="tabular-nums text-foreground-muted">{r.soLanYCCS}</span>, className: "text-center" },
    ...(showTinh(role) ? [{ key: "tinh", header: "Tỉnh/Thành phố", cell: (r: GDTxn) => <span className="text-foreground-muted">{r.tinh}</span> }] : []),
  ]

  return (
    <div className="space-y-4">
      <ReportHeader title="Thống kê tổng hợp số lượng giao dịch công chứng" desc="Thống kê, phân tích tổng hợp số lượng giao dịch công chứng theo thời gian, địa bàn và phương thức công chứng." role={role} onRole={(r) => { setRole(r); reset() }} />

      <TimeFilterBar time={time} onTime={setTime} error={error} onApply={apply} onReset={reset}
        extra={<>
          <MultiSelect label="Nguồn dữ liệu" options={DATA_SOURCES.map((s) => ({ value: s, label: s }))} selected={draft.nguon} onChange={(v) => setDraft({ ...draft, nguon: v })} emptyLabel="Tất cả" itemLabel={(n) => `${n} nguồn`} />
          <MultiSelect label="Phương thức công chứng" options={METHODS.map((s) => ({ value: s, label: s }))} selected={draft.pt} onChange={(v) => setDraft({ ...draft, pt: v })} emptyLabel="Tất cả" itemLabel={(n) => `${n} phương thức`} />
          <MultiSelect label="Tổ chức thực hiện" options={TCHNCC_LIST.map((s) => ({ value: s, label: s }))} selected={draft.toChuc} onChange={(v) => setDraft({ ...draft, toChuc: v })} emptyLabel="Tất cả" itemLabel={(n) => `${n} tổ chức`} />
          {showTinh(role) && <MultiSelect label="Tỉnh/Thành phố" options={PROVINCES.map((s) => ({ value: s, label: s }))} selected={draft.tinh} onChange={(v) => setDraft({ ...draft, tinh: v })} emptyLabel="Tất cả" itemLabel={(n) => `${n} tỉnh/TP`} />}
        </>}
      />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <StatCard label="Tổng số giao dịch" value={rows.length} icon={<Layers className="size-5" />} />
        <DonutChart title="Tỉ lệ theo nguồn dữ liệu" segments={srcDist} />
        <DonutChart title="Thống kê theo phương thức công chứng" segments={methodDist} />
      </div>

      <ReportTable title="Danh sách giao dịch công chứng" rows={rows} columns={columns} onExport={doExport}
        page={page} pageSize={pageSize} onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
    </div>
  )
}
