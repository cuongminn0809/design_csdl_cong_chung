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
  MINISTRY_ROWS, PERIODS, PROVINCES, REPORT_YEARS, TODAY_ISO, TT17_ROLES,
  checkViolations, fmtVN, isPeriodClosed, isBo, periodEndISO, periodOf, periodRangeLabel, reportFileName, totalRow,
  type PeriodKey, type Tt17Role,
} from "./config"

export function MinistryReportPage() {
  const showToast = useToast()
  const [role, setRole] = useState<Tt17Role>("cv_btp")
  const [period, setPeriod] = useState<PeriodKey>("SB6T")
  const [year, setYear] = useState(REPORT_YEARS[0])
  const [province, setProvince] = useState("all")
  const [mode, setMode] = useState<"data" | "form">("data")
  const [applied, setApplied] = useState({ period: "SB6T" as PeriodKey, year: REPORT_YEARS[0], province: "all" })

  const apply = () => setApplied({ period, year, province })
  const reset = () => { setPeriod("SB6T"); setYear(REPORT_YEARS[0]); setProvince("all"); setApplied({ period: "SB6T", year: REPORT_YEARS[0], province: "all" }) }

  const scopeRows = useMemo(() => applied.province === "all" ? MINISTRY_ROWS : MINISTRY_ROWS.filter((r) => r.label === applied.province), [applied.province])
  const total = useMemo(() => totalRow(scopeRows, applied.province === "all" ? "TỔNG TOÀN QUỐC" : `TỔNG ${applied.province.toUpperCase()}`), [scopeRows, applied.province])
  const closed = isPeriodClosed(applied.period, applied.year)
  const periodLabel = `${periodOf(applied.period).label} - ${applied.year}`

  const exportFlow = useExportFlow({
    periodLabel,
    isClosed: closed,
    getViolations: () => checkViolations(total),
    doExport: () => showToast(`Đã tạo file Excel thành công (${reportFileName("10b")}).`),
  })

  const cutoffLabel = closed ? `${fmtVN(periodEndISO(applied.period, applied.year))} 23:59` : `${fmtVN(TODAY_ISO)} 14:30`

  return (
    <div className="space-y-4">
      <ReportHeader title="Báo cáo kết quả hoạt động công chứng cấp Bộ Tư pháp" desc="Khai thác, xem chi tiết và xuất báo cáo tổng hợp toàn quốc theo Biểu 10b/TP/CC (Thông tư 17/2025/TT-BTP)."
        role={role} onRole={(r) => setRole(r as Tt17Role)} roles={TT17_ROLES.filter((r) => isBo(r.key))} />

      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="mb-1 text-[13px] font-semibold text-foreground-strong">Bộ lọc</div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <F label="Kỳ báo cáo *"><NativeSelect value={period} onChange={(e) => setPeriod(e.target.value as PeriodKey)}>{PERIODS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}</NativeSelect></F>
          <F label="Năm báo cáo *"><NativeSelect value={year} onChange={(e) => setYear(Number(e.target.value))}>{REPORT_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}</NativeSelect></F>
          <F label="Tỉnh/Thành phố"><NativeSelect value={province} onChange={(e) => setProvince(e.target.value)}><option value="all">Toàn quốc</option>{PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}</NativeSelect></F>
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
        <Tt17DataTable rows={scopeRows} total={total} showGhiChu nameLabel="Tỉnh/Thành phố" onClickName={(r) => showToast(`Đang mở Biểu 10b/TP/CC của ${r.label}…`)} />
      ) : (
        <Tt17FormPreview variant="10b"
          bieuSoLabel={applied.province === "all" ? "Tổng hợp toàn quốc theo cấu trúc chỉ tiêu 10b" : undefined}
          unitReport={applied.province === "all" ? "Bộ Tư pháp" : `Sở Tư pháp ${applied.province}`}
          unitReceive={applied.province === "all" ? "—" : "Bộ Tư pháp (Cục Kế hoạch - Tài chính)"}
          rows={scopeRows} total={total} nameColLabel="Tỉnh/Thành phố" periodLabel={periodLabel} dateRangeLabel={periodRangeLabel(applied.period, applied.year)}
          ghiChuNote={applied.province === "all" ? "Bảng tổng hợp toàn quốc theo cấu trúc chỉ tiêu Biểu 10b, mỗi tỉnh/thành phố một dòng." : undefined} />
      )}

      <div className="flex justify-end gap-2.5">
        {mode === "form" && <Button variant="outline" onClick={() => window.print()}><Printer className="size-4" />In báo cáo</Button>}
        <Button onClick={exportFlow.trigger}><Download className="size-4" />Xuất báo cáo</Button>
      </div>

      {exportFlow.dialog}
    </div>
  )
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">{label}</label>{children}</div>
}
