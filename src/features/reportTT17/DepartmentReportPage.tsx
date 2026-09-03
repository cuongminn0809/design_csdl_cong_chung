import { useMemo, useState } from "react"
import { Download, Printer, RotateCcw, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { ReportHeader } from "../report/components"
import { Tt17DataTable, Tt17FormPreview } from "./components"
import { useExportFlow } from "./useExportFlow"
import {
  CURRENT_PROVINCE, DEPARTMENT_ROWS, PERIODS, REPORT_YEARS, TODAY_ISO, TT17_ROLES,
  checkViolations, fmtVN, isPeriodClosed, isSo, periodEndISO, periodOf, periodRangeLabel, reportFileName, totalRow,
  type PeriodKey, type Tt17Role,
} from "./config"

const GROUP_LABELS = { I: "I. Phòng công chứng", II: "II. Văn phòng công chứng" }

export function DepartmentReportPage() {
  const showToast = useToast()
  const [role, setRole] = useState<Tt17Role>("cv_stp")
  const [period, setPeriod] = useState<PeriodKey>("SB6T")
  const [year, setYear] = useState(REPORT_YEARS[0])
  const [quickTchncc, setQuickTchncc] = useState("all")
  const [mode, setMode] = useState<"data" | "form">("data")
  const [applied, setApplied] = useState({ period: "SB6T" as PeriodKey, year: REPORT_YEARS[0], quickTchncc: "all" })

  const apply = () => setApplied({ period, year, quickTchncc })
  const reset = () => { setPeriod("SB6T"); setYear(REPORT_YEARS[0]); setQuickTchncc("all"); setApplied({ period: "SB6T", year: REPORT_YEARS[0], quickTchncc: "all" }) }

  const total = useMemo(() => totalRow(DEPARTMENT_ROWS, "TỔNG SỐ TOÀN ĐỊA PHƯƠNG"), [])
  // Quick filter chỉ nhấn mạnh dòng khi XEM — không đổi phạm vi xuất (luôn toàn tỉnh).
  const highlightRow = applied.quickTchncc !== "all" ? DEPARTMENT_ROWS.find((r) => r.label === applied.quickTchncc)?.key : undefined
  const closed = isPeriodClosed(applied.period, applied.year)
  const periodLabel = `${periodOf(applied.period).label} - ${applied.year}`

  const exportFlow = useExportFlow({
    periodLabel,
    isClosed: closed,
    getViolations: () => checkViolations(total),
    doExport: () => showToast(`Đã tạo file Excel thành công (${reportFileName("10b")}).`),
  })
  const doExportClick = () => {
    if (mode === "data" && applied.quickTchncc !== "all") showToast("Bộ lọc TCHNCC chỉ áp dụng khi xem. File Biểu 10b sẽ xuất toàn bộ địa phương.", "info")
    exportFlow.trigger()
  }

  const cutoffLabel = closed ? `${fmtVN(periodEndISO(applied.period, applied.year))} 23:59` : `${fmtVN(TODAY_ISO)} 14:30`

  return (
    <div className="space-y-4">
      <ReportHeader title="Báo cáo kết quả hoạt động công chứng cấp Sở Tư pháp" desc="Khai thác, xem chi tiết và xuất báo cáo chi tiết TCHNCC thuộc địa phương theo Biểu 10b/TP/CC."
        role={role} onRole={(r) => setRole(r as Tt17Role)} roles={TT17_ROLES.filter((r) => isSo(r.key))} />

      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="mb-1 text-[13px] font-semibold text-foreground-strong">Bộ lọc</div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <F label="Kỳ báo cáo *"><NativeSelect value={period} onChange={(e) => setPeriod(e.target.value as PeriodKey)}>{PERIODS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}</NativeSelect></F>
          <F label="Năm báo cáo *"><NativeSelect value={year} onChange={(e) => setYear(Number(e.target.value))}>{REPORT_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}</NativeSelect></F>
          <F label="Tỉnh/Thành phố"><div className="flex h-9 items-center rounded-md border border-input bg-surface-muted px-3 text-sm text-foreground-muted">{CURRENT_PROVINCE}</div></F>
          <F label="TCHNCC (xem nhanh)"><NativeSelect value={quickTchncc} onChange={(e) => setQuickTchncc(e.target.value)}><option value="all">Tất cả</option>{DEPARTMENT_ROWS.map((r) => <option key={r.key} value={r.label}>{r.label}</option>)}</NativeSelect></F>
        </div>
        <div className="mt-4 flex gap-2.5"><Button onClick={apply}><Search className="size-4" />Áp dụng</Button><Button variant="outline" onClick={reset}><RotateCcw className="size-4" />Đặt lại</Button></div>
      </div>

      <div className="rounded-[14px] border border-border bg-surface p-4 text-[13px] shadow-sm">
        <div className="flex flex-wrap gap-x-8 gap-y-1.5">
          <span className="text-foreground-muted">Khoảng thời gian lấy số liệu: <span className="font-medium text-foreground">{periodRangeLabel(applied.period, applied.year)}</span></span>
          <span className="text-foreground-muted">Thời điểm cập nhật dữ liệu: <span className="font-medium text-foreground">{cutoffLabel}</span></span>
          <span className={cn("font-medium", closed ? "text-[#047857]" : "text-[#b45309]")}>{closed ? "● Kỳ đã chốt" : "● Kỳ hiện tại (chưa chốt)"}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-[13.5px]">
        <label className="flex cursor-pointer items-center gap-1.5"><input type="radio" checked={mode === "data"} onChange={() => setMode("data")} />Bảng số liệu</label>
        <label className="flex cursor-pointer items-center gap-1.5"><input type="radio" checked={mode === "form"} onChange={() => setMode("form")} />Xem biểu mẫu</label>
      </div>

      {mode === "data" ? (
        <Tt17DataTable rows={DEPARTMENT_ROWS.map((r) => highlightRow === r.key ? { ...r, label: `➤ ${r.label}` } : r)} total={total} showGhiChu nameLabel="Đơn vị" onClickName={(r) => showToast(`Đang mở chi tiết ${r.label.replace("➤ ", "")}…`)} groupLabels={GROUP_LABELS} />
      ) : (
        <Tt17FormPreview variant="10b" unitReport={`Sở Tư pháp ${CURRENT_PROVINCE}`} unitReceive="Bộ Tư pháp (Cục Kế hoạch - Tài chính)"
          rows={DEPARTMENT_ROWS} total={total} nameColLabel="Đơn vị" periodLabel={periodLabel} dateRangeLabel={periodRangeLabel(applied.period, applied.year)} groupLabels={GROUP_LABELS} />
      )}

      <div className="flex justify-end gap-2.5">
        {mode === "form" && <Button variant="outline" onClick={() => window.print()}><Printer className="size-4" />In báo cáo</Button>}
        <Button onClick={doExportClick}><Download className="size-4" />Xuất báo cáo</Button>
      </div>

      {exportFlow.dialog}
    </div>
  )
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">{label}</label>{children}</div>
}
