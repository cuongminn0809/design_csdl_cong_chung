import { useMemo, useState } from "react"
import { Printer, RotateCcw, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { inputCls } from "../ingestion/shared"
import { AdminOnlyGate, AdminReportHeader, DataTable, F, StatusBadge } from "./components"
import {
  DATA_TYPES, DEFAULT_FROM, DEFAULT_TO, ERROR_TYPES, POSTCHECK_ROWS, POSTCHECK_STATUSES, PROVINCES, STATUS_META,
  exportMsg, fmtNum, fmtVN, inRange, validateRange,
  type AdminRole, type PostcheckRow,
} from "./config"

export function DataPostcheckPage() {
  const showToast = useToast()
  const [role, setRole] = useState<AdminRole>("quan_tri")
  const [from, setFrom] = useState(DEFAULT_FROM)
  const [to, setTo] = useState(DEFAULT_TO)
  const [province, setProvince] = useState("all")
  const [dataType, setDataType] = useState("all")
  const [errorType, setErrorType] = useState("all")
  const [status, setStatus] = useState("all")
  const [applied, setApplied] = useState({ from: DEFAULT_FROM, to: DEFAULT_TO, province: "all", dataType: "all", errorType: "all", status: "all" })
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const rows = useMemo(() => {
    let r = POSTCHECK_ROWS.filter((c) => inRange(c.dateISO, applied.from, applied.to))
    if (applied.province !== "all") r = r.filter((c) => c.org === applied.province)
    if (applied.dataType !== "all") r = r.filter((c) => c.dataType === applied.dataType)
    if (applied.errorType !== "all") r = r.filter((c) => c.errorType === applied.errorType)
    if (applied.status !== "all") r = r.filter((c) => c.status === applied.status)
    return [...r].sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1))
  }, [applied])

  const reset = () => { setFrom(DEFAULT_FROM); setTo(DEFAULT_TO); setProvince("all"); setDataType("all"); setErrorType("all"); setStatus("all"); setError(""); setApplied({ from: DEFAULT_FROM, to: DEFAULT_TO, province: "all", dataType: "all", errorType: "all", status: "all" }); setPage(1) }
  const doSearch = () => { const err = validateRange(from, to); if (err) return setError(err); setError(""); setApplied({ from, to, province, dataType, errorType, status }); setPage(1) }
  const doExport = () => { const r = exportMsg(rows.length); showToast(`${r.msg}${r.kind === "ok" ? " (HauKiemDuLieu.xlsx)" : ""}`, r.kind) }

  const columns = [
    { key: "stt", header: "STT", cell: (_: PostcheckRow, i: number) => <span className="tabular-nums text-foreground-muted">{i + 1}</span>, className: "w-11 text-center" },
    { key: "date", header: "Ngày hậu kiểm", cell: (r: PostcheckRow) => <span className="tabular-nums text-foreground-muted">{fmtVN(r.dateISO)}</span> },
    { key: "code", header: "Mã bản ghi", cell: (r: PostcheckRow) => <span className="font-medium text-foreground">{r.code}</span> },
    { key: "type", header: "Loại dữ liệu", cell: (r: PostcheckRow) => <span className="text-foreground-muted">{r.dataType}</span> },
    { key: "org", header: "Tỉnh/Thành phố", cell: (r: PostcheckRow) => <span className="text-foreground-muted">{r.org}</span> },
    { key: "errorType", header: "Loại lỗi", cell: (r: PostcheckRow) => <span className="text-foreground-muted">{r.errorType}</span> },
    { key: "errorCount", header: "Số lượng lỗi", cell: (r: PostcheckRow) => <span className={cn("tabular-nums", r.errorCount > 0 ? "font-semibold text-[#b91c1c]" : "text-foreground-muted")}>{fmtNum(r.errorCount)}</span>, className: "text-right" },
    { key: "status", header: "Trạng thái xử lý", cell: (r: PostcheckRow) => <StatusBadge status={r.status} meta={STATUS_META} /> },
  ]

  return (
    <div className="space-y-4">
      <AdminReportHeader title="Báo cáo hậu kiểm dữ liệu" desc="Tổng hợp lỗi phát hiện sau khi nạp dữ liệu vào kho và tình trạng xử lý."
        role={role} onRole={setRole}
        actions={<><Button variant="outline" size="sm" onClick={doExport}>Xuất file ▾</Button><Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="size-4" />In báo cáo</Button></>} />
      <AdminOnlyGate role={role}>
        <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
          <div className="mb-1 text-[13px] font-semibold text-foreground-strong">Bộ lọc</div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <F label="Từ ngày" required><input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setError("") }} className={cn(inputCls, "text-[13.5px]")} /></F>
            <F label="Đến ngày" required><input type="date" value={to} onChange={(e) => { setTo(e.target.value); setError("") }} className={cn(inputCls, "text-[13.5px]")} /></F>
            <F label="Tỉnh/Thành phố"><NativeSelect value={province} onChange={(e) => setProvince(e.target.value)}><option value="all">Tất cả</option>{PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}</NativeSelect></F>
            <F label="Loại dữ liệu"><NativeSelect value={dataType} onChange={(e) => setDataType(e.target.value)}><option value="all">Tất cả</option>{DATA_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</NativeSelect></F>
            <F label="Loại lỗi"><NativeSelect value={errorType} onChange={(e) => setErrorType(e.target.value)}><option value="all">Tất cả</option>{ERROR_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</NativeSelect></F>
            <F label="Trạng thái xử lý"><NativeSelect value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">Tất cả</option>{POSTCHECK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</NativeSelect></F>
          </div>
          {error && <div className="mt-3 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]">{error}</div>}
          <div className="mt-4 flex flex-wrap gap-2.5">
            <Button variant="outline" onClick={reset}><RotateCcw className="size-4" />Đặt lại</Button>
            <Button onClick={doSearch}><Search className="size-4" />Tìm kiếm</Button>
          </div>
        </div>

        <DataTable title="Bảng chi tiết hậu kiểm dữ liệu" rows={rows} columns={columns} page={page} pageSize={pageSize} onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
      </AdminOnlyGate>
    </div>
  )
}
