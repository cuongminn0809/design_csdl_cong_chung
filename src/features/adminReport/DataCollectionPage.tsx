import { useMemo, useState } from "react"
import { Download, Printer, RotateCcw, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { inputCls } from "../ingestion/shared"
import { AdminOnlyGate, AdminReportHeader, DataTable, F, StatCard, StatusBadge } from "./components"
import {
  COLLECTION_ROWS, COLLECT_METHODS, DATA_TYPES, DEFAULT_FROM, DEFAULT_TO, RESULT_STATUSES, STATUS_META, TCHNCC_LIST,
  exportMsg, fmtNum, fmtVN, inRange, validateRange,
  type AdminRole, type CollectionRow,
} from "./config"

export function DataCollectionPage() {
  const showToast = useToast()
  const [role, setRole] = useState<AdminRole>("quan_tri")
  const [from, setFrom] = useState(DEFAULT_FROM)
  const [to, setTo] = useState(DEFAULT_TO)
  const [org, setOrg] = useState("all")
  const [method, setMethod] = useState("all")
  const [status, setStatus] = useState("all")
  const [dataType, setDataType] = useState("all")
  const [applied, setApplied] = useState({ from: DEFAULT_FROM, to: DEFAULT_TO, org: "all", method: "all", status: "all", dataType: "all" })
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const rows = useMemo(() => {
    let r = COLLECTION_ROWS.filter((c) => inRange(c.dateISO, applied.from, applied.to))
    if (applied.org !== "all") r = r.filter((c) => c.org === applied.org)
    if (applied.method !== "all") r = r.filter((c) => c.method === applied.method)
    if (applied.status !== "all") r = r.filter((c) => c.status === applied.status)
    if (applied.dataType !== "all") r = r.filter((c) => c.dataType === applied.dataType)
    return [...r].sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1))
  }, [applied])

  const reset = () => { setFrom(DEFAULT_FROM); setTo(DEFAULT_TO); setOrg("all"); setMethod("all"); setStatus("all"); setDataType("all"); setError(""); setApplied({ from: DEFAULT_FROM, to: DEFAULT_TO, org: "all", method: "all", status: "all", dataType: "all" }); setPage(1) }
  const doSearch = () => { const err = validateRange(from, to); if (err) return setError(err); setError(""); setApplied({ from, to, org, method, status, dataType }); setPage(1) }
  const doExport = (label: string) => { const r = exportMsg(rows.length); showToast(`${r.msg}${r.kind === "ok" ? ` (${label})` : ""}`, r.kind) }

  const totalPackages = rows.reduce((s, r) => s + r.packages, 0)
  const totalRecords = rows.reduce((s, r) => s + r.recordsOk, 0)
  const totalSizeMb = rows.reduce((s, r) => s + r.sizeMb, 0)

  const columns = [
    { key: "stt", header: "STT", cell: (_: CollectionRow, i: number) => <span className="tabular-nums text-foreground-muted">{i + 1}</span>, className: "w-11 text-center" },
    { key: "date", header: "Ngày thu thập", cell: (r: CollectionRow) => <span className="tabular-nums text-foreground-muted">{fmtVN(r.dateISO)}</span> },
    { key: "org", header: "Đơn vị", cell: (r: CollectionRow) => <span className="font-medium text-foreground">{r.org}</span>, className: "min-w-[200px]" },
    { key: "method", header: "Phương thức", cell: (r: CollectionRow) => <span className="text-foreground-muted">{r.method}</span> },
    { key: "type", header: "Loại dữ liệu", cell: (r: CollectionRow) => <span className="text-foreground-muted">{r.dataType}</span> },
    { key: "packages", header: "Số gói tin", cell: (r: CollectionRow) => <span className="tabular-nums text-foreground">{fmtNum(r.packages)}</span>, className: "text-right" },
    { key: "records", header: "Bản ghi thành công", cell: (r: CollectionRow) => <span className="tabular-nums text-foreground">{fmtNum(r.recordsOk)}</span>, className: "text-right" },
    { key: "size", header: "Dung lượng (MB)", cell: (r: CollectionRow) => <span className="tabular-nums text-foreground-muted">{fmtNum(r.sizeMb)}</span>, className: "text-right" },
    { key: "status", header: "Kết quả", cell: (r: CollectionRow) => <StatusBadge status={r.status} meta={STATUS_META} /> },
  ]

  return (
    <div className="space-y-4">
      <AdminReportHeader title="Báo cáo thu thập dữ liệu" desc="Theo dõi kết quả thu thập dữ liệu từ các Sở Tư pháp và tổ chức hành nghề công chứng."
        role={role} onRole={setRole}
        actions={<><Button variant="outline" size="sm" onClick={() => doExport("ThuThapDuLieu.xlsx")}>Xuất file ▾</Button><Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="size-4" />In báo cáo</Button></>} />
      <AdminOnlyGate role={role}>
        <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
          <div className="mb-1 text-[13px] font-semibold text-foreground-strong">Bộ lọc</div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <F label="Từ ngày" required><input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setError("") }} className={cn(inputCls, "text-[13.5px]")} /></F>
            <F label="Đến ngày" required><input type="date" value={to} onChange={(e) => { setTo(e.target.value); setError("") }} className={cn(inputCls, "text-[13.5px]")} /></F>
            <F label="Đơn vị"><NativeSelect value={org} onChange={(e) => setOrg(e.target.value)}><option value="all">Tất cả</option>{TCHNCC_LIST.map((o) => <option key={o} value={o}>{o}</option>)}</NativeSelect></F>
            <F label="Phương thức"><NativeSelect value={method} onChange={(e) => setMethod(e.target.value)}><option value="all">Tất cả</option>{COLLECT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}</NativeSelect></F>
            <F label="Kết quả"><NativeSelect value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">Tất cả</option>{RESULT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</NativeSelect></F>
            <F label="Loại dữ liệu"><NativeSelect value={dataType} onChange={(e) => setDataType(e.target.value)}><option value="all">Tất cả</option>{DATA_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</NativeSelect></F>
          </div>
          {error && <div className="mt-3 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]">{error}</div>}
          <div className="mt-4 flex flex-wrap gap-2.5">
            <Button variant="outline" onClick={reset}><RotateCcw className="size-4" />Đặt lại</Button>
            <Button onClick={doSearch}><Search className="size-4" />Tìm kiếm</Button>
            <Button variant="outline" onClick={() => doExport("ThuThapDuLieu.xlsx")}><Download className="size-4" />Xuất file</Button>
            <Button variant="outline" onClick={() => window.print()}><Printer className="size-4" />In</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard label="Tổng gói" value={fmtNum(totalPackages)} />
          <StatCard label="Tổng bản ghi" value={fmtNum(totalRecords)} color="#047857" bg="#ecfdf5" />
          <StatCard label="Tổng dung lượng (MB)" value={fmtNum(totalSizeMb)} color="#7c3aed" bg="#f5f3ff" />
        </div>

        <DataTable title="Bảng chi tiết thu thập dữ liệu" rows={rows} columns={columns} page={page} pageSize={pageSize} onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
      </AdminOnlyGate>
    </div>
  )
}
