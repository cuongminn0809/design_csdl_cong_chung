import { useMemo, useState } from "react"
import { Printer, RotateCcw, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { inputCls } from "../ingestion/shared"
import { AdminOnlyGate, AdminReportHeader, DataTable, F, StatCard, StatusBadge } from "./components"
import {
  DATA_TYPES, DEFAULT_FROM, DEFAULT_TO, PROVINCES, RECONCILE_ROWS, STATUS_META,
  exportMsg, fmtNum, fmtVN, inRange, validateRange,
  type AdminRole, type ReconcileRow,
} from "./config"

export function DataReconciliationPage() {
  const showToast = useToast()
  const [role, setRole] = useState<AdminRole>("quan_tri")
  const [from, setFrom] = useState(DEFAULT_FROM)
  const [to, setTo] = useState(DEFAULT_TO)
  const [province, setProvince] = useState("all")
  const [dataType, setDataType] = useState("all")
  const [applied, setApplied] = useState({ from: DEFAULT_FROM, to: DEFAULT_TO, province: "all", dataType: "all" })
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const rows = useMemo(() => {
    let r = RECONCILE_ROWS.filter((c) => inRange(c.dateISO, applied.from, applied.to))
    if (applied.province !== "all") r = r.filter((c) => c.org === applied.province)
    if (applied.dataType !== "all") r = r.filter((c) => c.dataType === applied.dataType)
    return [...r].sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1))
  }, [applied])

  const reset = () => { setFrom(DEFAULT_FROM); setTo(DEFAULT_TO); setProvince("all"); setDataType("all"); setError(""); setApplied({ from: DEFAULT_FROM, to: DEFAULT_TO, province: "all", dataType: "all" }); setPage(1) }
  const doSearch = () => { const err = validateRange(from, to); if (err) return setError(err); setError(""); setApplied({ from, to, province, dataType }); setPage(1) }
  const doExport = () => { const r = exportMsg(rows.length); showToast(`${r.msg}${r.kind === "ok" ? " (DoiSoatDuLieu.xlsx)" : ""}`, r.kind) }

  const matched = rows.filter((r) => r.result === "Khớp").length
  const mismatched = rows.filter((r) => r.result === "Có sai lệch").length

  const columns = [
    { key: "stt", header: "STT", cell: (_: ReconcileRow, i: number) => <span className="tabular-nums text-foreground-muted">{i + 1}</span>, className: "w-11 text-center" },
    { key: "date", header: "Ngày đối soát", cell: (r: ReconcileRow) => <span className="tabular-nums text-foreground-muted">{fmtVN(r.dateISO)}</span> },
    { key: "org", header: "Tỉnh/Thành phố", cell: (r: ReconcileRow) => <span className="text-foreground-muted">{r.org}</span> },
    { key: "type", header: "Loại dữ liệu", cell: (r: ReconcileRow) => <span className="text-foreground-muted">{r.dataType}</span> },
    { key: "source", header: "Dữ liệu nguồn", cell: (r: ReconcileRow) => <span className="tabular-nums text-foreground">{fmtNum(r.source)}</span>, className: "text-right" },
    { key: "matched", header: "Khớp", cell: (r: ReconcileRow) => <span className="tabular-nums text-foreground">{fmtNum(r.matched)}</span>, className: "text-right" },
    { key: "mismatched", header: "Sai lệch", cell: (r: ReconcileRow) => <span className={cn("tabular-nums", r.mismatched > 0 ? "font-semibold text-[#b91c1c]" : "text-foreground-muted")}>{fmtNum(r.mismatched)}</span>, className: "text-right" },
    { key: "result", header: "Kết quả", cell: (r: ReconcileRow) => <span className={cn("text-[12.5px] font-semibold", r.result === "Khớp" ? "text-[#047857]" : "text-[#b91c1c]")}>{r.result}</span> },
    { key: "status", header: "Trạng thái", cell: (r: ReconcileRow) => <StatusBadge status={r.status} meta={STATUS_META} /> },
  ]

  return (
    <div className="space-y-4">
      <AdminReportHeader title="Báo cáo đối soát dữ liệu" desc="So sánh dữ liệu nguồn với dữ liệu đã nạp vào kho, phát hiện sai lệch giữa các nguồn."
        role={role} onRole={setRole}
        actions={<><Button variant="outline" size="sm" onClick={doExport}>Xuất file ▾</Button><Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="size-4" />In báo cáo</Button></>} />
      <AdminOnlyGate role={role}>
        <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
          <div className="mb-1 text-[13px] font-semibold text-foreground-strong">Bộ lọc</div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <F label="Từ ngày" required><input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setError("") }} className={cn(inputCls, "text-[13.5px]")} /></F>
            <F label="Đến ngày" required><input type="date" value={to} onChange={(e) => { setTo(e.target.value); setError("") }} className={cn(inputCls, "text-[13.5px]")} /></F>
            <F label="Tỉnh/Thành phố"><NativeSelect value={province} onChange={(e) => setProvince(e.target.value)}><option value="all">Tất cả</option>{PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}</NativeSelect></F>
            <F label="Loại dữ liệu"><NativeSelect value={dataType} onChange={(e) => setDataType(e.target.value)}><option value="all">Tất cả</option>{DATA_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</NativeSelect></F>
          </div>
          {error && <div className="mt-3 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]">{error}</div>}
          <div className="mt-4 flex flex-wrap gap-2.5">
            <Button variant="outline" onClick={reset}><RotateCcw className="size-4" />Đặt lại</Button>
            <Button onClick={doSearch}><Search className="size-4" />Tìm kiếm</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <StatCard label="Số dòng khớp" value={matched} color="#047857" bg="#ecfdf5" />
          <StatCard label="Số dòng sai lệch" value={mismatched} danger={mismatched > 0} />
        </div>

        <DataTable title="Bảng chi tiết đối soát dữ liệu" rows={rows} columns={columns} page={page} pageSize={pageSize} onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
      </AdminOnlyGate>
    </div>
  )
}
