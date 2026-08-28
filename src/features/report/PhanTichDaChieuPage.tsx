import { useMemo, useState } from "react"

import { MultiSelect } from "@/features/reconciliation/components/MultiSelect"
import { BarChart, DonutChart, ReportHeader, TimeFilterBar } from "./components"
import {
  ASSET_TYPES, DATA_SOURCES, DEFAULT_TIME, GD_TXNS, METHODS, PROVINCES,
  distribution, inRange, resolveRange, scopeRows, showTinh, topTchncc,
  type ReportRole, type TimeState,
} from "./config"

export function PhanTichDaChieuPage() {
  const [role, setRole] = useState<ReportRole>("ld_btp")
  const [time, setTime] = useState<TimeState>(DEFAULT_TIME)
  const [tinh, setTinh] = useState<string[]>([])
  const [applied, setApplied] = useState<{ time: TimeState; tinh: string[] }>({ time: DEFAULT_TIME, tinh: [] })
  const [error, setError] = useState("")

  const rows = useMemo(() => {
    const range = resolveRange(applied.time)
    if (range.error) return []
    let r = scopeRows(GD_TXNS, role).filter((x) => inRange(x.ngayCCISO, range))
    if (applied.tinh.length && showTinh(role)) r = r.filter((x) => applied.tinh.includes(x.tinh))
    return r
  }, [role, applied])

  const apply = () => { const rg = resolveRange(time); if (rg.error) return setError(rg.error); setError(""); setApplied({ time, tinh }) }
  const reset = () => { setTime(DEFAULT_TIME); setTinh([]); setApplied({ time: DEFAULT_TIME, tinh: [] }); setError("") }

  const methodDist = distribution(rows, (r) => r.phuongThuc, METHODS)
  const srcDist = distribution(rows, (r) => r.nguon, DATA_SOURCES)
  const top = topTchncc(rows, 10)
  const assetBars = ASSET_TYPES.map((t) => ({ label: t, value: rows.filter((r) => r.loaiTS === t).length })).filter((b) => b.value > 0)

  return (
    <div className="space-y-4">
      <ReportHeader title="Báo cáo phân tích dữ liệu đa chiều" desc="Phân tích dữ liệu giao dịch công chứng theo nhiều chiều: phương thức, nguồn dữ liệu, tổ chức thực hiện và loại tài sản." role={role} onRole={(r) => { setRole(r); reset() }} />

      <TimeFilterBar time={time} onTime={setTime} error={error} onApply={apply} onReset={reset}
        extra={showTinh(role) ? <MultiSelect label="Tỉnh/Thành phố" options={PROVINCES.map((s) => ({ value: s, label: s }))} selected={tinh} onChange={setTinh} emptyLabel="Tất cả" itemLabel={(n) => `${n} tỉnh/TP`} /> : undefined} />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <DonutChart title="Phân bổ theo phương thức công chứng" segments={methodDist} />
        <DonutChart title="Phân bổ theo nguồn dữ liệu" segments={srcDist} />
        <BarChart title="Top 10 TCHNCC có lượng giao dịch cao nhất" bars={top} horizontal />
        <BarChart title="Phân bổ theo loại tài sản" bars={assetBars} />
      </div>
      {!rows.length && <div className="rounded-[14px] border border-border bg-surface px-5 py-10 text-center text-[13px] text-foreground-muted shadow-sm">Không tìm thấy bản ghi dữ liệu báo cáo phù hợp với điều kiện tìm kiếm.</div>}
    </div>
  )
}
