import { useMemo, useState } from "react"
import { BarChart3, Download, RotateCcw, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { EmptyState, Pagination, Th, inputCls } from "../ingestion/shared"
import { BarChart, ReportHeader } from "../report/components"
import {
  COMPARE_INDICATORS, HISTORY_RECORDS, PERIODS, REPORT_YEARS, TT17_ROLES, YEARLY_TOTALS,
  comparisonFileName, diffAndRate, fmtNum, historyFileName, isBo, isSo,
  type PeriodKey, type Tt17Role,
} from "./config"

type Tab = "compare" | "history"

export function AnalysisHistoryPage() {
  const [tab, setTab] = useState<Tab>("compare")
  const [role, setRole] = useState<Tt17Role>("ld_btp")
  const scope = isBo(role) ? "Toàn quốc" : isSo(role) ? "TP. Hà Nội" : "VPCC Nguyễn Văn A"

  return (
    <div className="space-y-4">
      <ReportHeader title="Phân tích so sánh và Lịch sử báo cáo" desc="Phân tích so sánh dữ liệu giữa nhiều kỳ báo cáo và tra cứu lịch sử các lần xuất báo cáo trước đó."
        role={role} onRole={(r) => setRole(r as Tt17Role)} roles={TT17_ROLES} />

      <div className="inline-flex gap-1 rounded-md border border-border bg-surface-muted p-[3px]">
        {([["compare", "Phân tích so sánh"], ["history", "Lịch sử báo cáo"]] as [Tab, string][]).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={cn("rounded-md px-4 py-1.5 text-[13px] font-medium", tab === k ? "bg-surface text-foreground-strong shadow-xs" : "text-foreground-muted hover:text-foreground")}>{l}</button>
        ))}
      </div>

      {tab === "compare" ? <ComparePanel scope={scope} /> : <HistoryPanel scope={scope} />}
    </div>
  )
}

/* ============================ TAB PHÂN TÍCH SO SÁNH ============================ */
function ComparePanel({ scope }: { scope: string }) {
  const showToast = useToast()
  const [period, setPeriod] = useState<PeriodKey>("TN")
  const [yGoc, setYGoc] = useState(REPORT_YEARS[0])
  const [y1, setY1] = useState<number | "none">(REPORT_YEARS[1])
  const [y2, setY2] = useState<number | "none">(REPORT_YEARS[2])
  const [checked, setChecked] = useState<Set<string>>(new Set(COMPARE_INDICATORS))
  const [applied, setApplied] = useState({ yGoc: REPORT_YEARS[0], years: [REPORT_YEARS[0], REPORT_YEARS[1], REPORT_YEARS[2]] as number[] })
  const [error, setError] = useState("")

  const doCompare = () => {
    const years = [yGoc, y1, y2].filter((y): y is number => y !== "none")
    if (years.length < 2 || years.length > 3) return setError("Chọn từ 2 đến 3 năm cùng loại kỳ để so sánh.")
    setError(""); setApplied({ yGoc, years })
  }
  const reset = () => { setPeriod("TN"); setYGoc(REPORT_YEARS[0]); setY1(REPORT_YEARS[1]); setY2(REPORT_YEARS[2]); setChecked(new Set(COMPARE_INDICATORS)); setApplied({ yGoc: REPORT_YEARS[0], years: [REPORT_YEARS[0], REPORT_YEARS[1], REPORT_YEARS[2]] }); setError("") }

  const years = applied.years // đã sort giảm dần theo lựa chọn năm gốc trước
  const rows = useMemo(() => COMPARE_INDICATORS.filter((c) => checked.has(c)).map((c) => {
    const values = years.map((y) => YEARLY(c, y))
    const pairs = values.slice(0, -1).map((v, i) => diffAndRate(v, values[i + 1]))
    return { indicator: c, values, pairs }
  }), [years, checked])

  // Biểu đồ chỉ minh họa theo 1 chỉ tiêu số việc (đơn vị đồng nhất), tránh cộng lẫn với Phí công chứng (đơn vị Đồng).
  const chartIndicator = rows.find((r) => r.indicator === "Tổng số việc công chứng") ?? rows[0]
  const chartBars = chartIndicator ? years.map((y, i) => ({ label: String(y), value: chartIndicator.values[i] })) : []

  const doExport = () => showToast(`Đã tạo file Excel thành công (${comparisonFileName(years)}).`)

  return (
    <div className="space-y-4">
      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="mb-1 text-[13px] font-semibold text-foreground-strong">Bộ lọc so sánh</div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <F label="Kỳ báo cáo"><NativeSelect value={period} onChange={(e) => setPeriod(e.target.value as PeriodKey)}>{PERIODS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}</NativeSelect></F>
          <F label="Năm gốc"><NativeSelect value={yGoc} onChange={(e) => setYGoc(Number(e.target.value))}>{REPORT_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}</NativeSelect></F>
          <F label="Năm so sánh 1"><NativeSelect value={y1} onChange={(e) => setY1(e.target.value === "none" ? "none" : Number(e.target.value))}><option value="none">Không chọn</option>{REPORT_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}</NativeSelect></F>
          <F label="Năm so sánh 2"><NativeSelect value={y2} onChange={(e) => setY2(e.target.value === "none" ? "none" : Number(e.target.value))}><option value="none">Không chọn</option>{REPORT_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}</NativeSelect></F>
        </div>
        <div className="mt-3 text-[12.5px] text-foreground-muted">Phạm vi: <span className="font-medium text-foreground">{scope}</span> (theo quyền dữ liệu)</div>
        {error && <div className="mt-3 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]">{error}</div>}
        <div className="mt-4 flex gap-2.5"><Button onClick={doCompare}><Search className="size-4" />So sánh</Button><Button variant="outline" onClick={reset}><RotateCcw className="size-4" />Đặt lại</Button></div>
      </div>

      <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {COMPARE_INDICATORS.map((c) => (
          <label key={c} className="flex cursor-pointer items-start gap-2 text-[12.5px]">
            <input type="checkbox" className="mt-0.5" checked={checked.has(c)} onChange={(e) => setChecked((s) => { const n = new Set(s); e.target.checked ? n.add(c) : n.delete(c); return n })} />
            <span className="text-foreground-muted">{c}</span>
          </label>
        ))}
      </div>

      {chartBars.length ? <BarChart title={`Biểu đồ so sánh theo năm — ${chartIndicator!.indicator}`} bars={chartBars} /> : (
        <EmptyState icon={<BarChart3 className="size-6" />} title="Chưa có đủ dữ liệu để hiển thị biểu đồ so sánh" desc="Chọn từ 2 đến 3 năm cùng loại kỳ và bấm “So sánh”." />
      )}

      {rows.length > 0 && (
        <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <div className="text-[13px] font-semibold text-foreground-strong">Bảng giá trị so sánh</div>
            <Button variant="outline" size="sm" onClick={doExport} className="h-8 gap-1.5"><Download className="size-4" />Xuất kết quả so sánh</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-border bg-neutral-50">
                  <Th className="min-w-[220px]">Chỉ tiêu</Th>
                  {years.map((y) => <Th key={y} className="text-right">Năm {y}</Th>)}
                  {years.slice(0, -1).map((y, i) => <Th key={`cl-${y}`} className="text-right">CL ({y} vs {years[i + 1]})</Th>)}
                  {years.slice(0, -1).map((y, i) => <Th key={`tl-${y}`} className="text-right">Tỷ lệ BĐ ({y}/{years[i + 1]})</Th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.indicator} className="border-b border-neutral-100 last:border-0">
                    <td className="px-4 py-2.5 text-foreground">{r.indicator}</td>
                    {r.values.map((v, i) => <td key={i} className="px-4 py-2.5 text-right tabular-nums text-foreground-muted">{fmtNum(v)}</td>)}
                    {r.pairs.map((p, i) => <td key={`d${i}`} className={cn("px-4 py-2.5 text-right tabular-nums font-medium", p.diff > 0 ? "text-[#047857]" : p.diff < 0 ? "text-[#b91c1c]" : "text-foreground-muted")}>{p.diff > 0 ? "+" : ""}{fmtNum(p.diff)}</td>)}
                    {r.pairs.map((p, i) => <td key={`r${i}`} className={cn("px-4 py-2.5 text-right tabular-nums font-medium", p.rate.startsWith("+") ? "text-[#047857]" : p.rate.startsWith("-") ? "text-[#b91c1c]" : "text-foreground-subtle")}>{p.rate}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border px-5 py-2.5 text-[11.5px] text-foreground-subtle">Ghi chú: Khi so sánh 2 năm, chỉ hiển thị 1 cột Chênh lệch và 1 cột Tỷ lệ BĐ. Khi so sánh 3 năm, hiển thị 2 cột mỗi loại.</div>
        </div>
      )}
    </div>
  )
}
function YEARLY(indicator: (typeof COMPARE_INDICATORS)[number], year: number) {
  return YEARLY_TOTALS[year]?.[indicator] ?? 0
}

/* ============================ TAB LỊCH SỬ BÁO CÁO ============================ */
function HistoryPanel({ scope }: { scope: string }) {
  const showToast = useToast()
  const [ky, setKy] = useState("all")
  const [nam, setNam] = useState("all")
  const [tuNgay, setTuNgay] = useState("")
  const [denNgay, setDenNgay] = useState("")
  const [applied, setApplied] = useState({ ky: "all", nam: "all", tuNgay: "", denNgay: "" })
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const rows = useMemo(() => {
    let r = HISTORY_RECORDS.filter((h) => scope === "Toàn quốc" ? true : h.pham_vi === scope)
    if (applied.ky !== "all") r = r.filter((h) => h.ky.startsWith(PERIODS.find((p) => p.key === applied.ky)!.label))
    if (applied.nam !== "all") r = r.filter((h) => h.ky.endsWith(applied.nam))
    if (applied.tuNgay) r = r.filter((h) => h.thoiDiemISO >= applied.tuNgay)
    if (applied.denNgay) r = r.filter((h) => h.thoiDiemISO <= applied.denNgay)
    return [...r].sort((a, b) => (a.thoiDiemISO < b.thoiDiemISO ? 1 : -1))
  }, [applied, scope])

  const doSearch = () => {
    if (tuNgay && denNgay && tuNgay > denNgay) return setError("Ngày đến phải lớn hơn hoặc bằng ngày từ.")
    if (tuNgay && denNgay) { const months = (new Date(denNgay).getTime() - new Date(tuNgay).getTime()) / (1000 * 60 * 60 * 24 * 30); if (months > 24) return setError("Khoảng thời gian tìm kiếm tối đa là 24 tháng.") }
    setError(""); setApplied({ ky, nam, tuNgay, denNgay }); setPage(1)
  }
  const reset = () => { setKy("all"); setNam("all"); setTuNgay(""); setDenNgay(""); setApplied({ ky: "all", nam: "all", tuNgay: "", denNgay: "" }); setError(""); setPage(1) }
  const doExport = () => showToast(rows.length ? `Đã tạo file Excel thành công (${historyFileName()}).` : "Không có lịch sử phù hợp để xuất.", rows.length ? "success" : "info")

  const start = (Math.min(page, Math.max(1, Math.ceil(rows.length / pageSize))) - 1) * pageSize
  const paged = rows.slice(start, start + pageSize)

  return (
    <div className="space-y-4">
      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="mb-1 text-[13px] font-semibold text-foreground-strong">Bộ lọc lịch sử</div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <F label="Kỳ báo cáo"><NativeSelect value={ky} onChange={(e) => setKy(e.target.value)}><option value="all">Tất cả</option>{PERIODS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}</NativeSelect></F>
          <F label="Năm"><NativeSelect value={nam} onChange={(e) => setNam(e.target.value)}><option value="all">Tất cả</option>{REPORT_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}</NativeSelect></F>
          <F label="Từ ngày"><input type="date" value={tuNgay} onChange={(e) => setTuNgay(e.target.value)} className={cn(inputCls, "text-[13.5px]")} /></F>
          <F label="Đến ngày"><input type="date" value={denNgay} onChange={(e) => setDenNgay(e.target.value)} className={cn(inputCls, "text-[13.5px]")} /></F>
        </div>
        {error && <div className="mt-3 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]">{error}</div>}
        <div className="mt-4 flex gap-2.5">
          <Button onClick={doSearch}><Search className="size-4" />Tìm kiếm</Button>
          <Button variant="outline" onClick={reset}><RotateCcw className="size-4" />Đặt lại</Button>
          <Button variant="outline" onClick={doExport}><Download className="size-4" />Xuất Excel</Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        <div className="border-b border-border px-5 py-3 text-[13px] font-semibold text-foreground-strong">Danh sách lịch sử báo cáo đã xuất <span className="ml-1 font-normal text-foreground-muted">({rows.length} bản ghi)</span></div>
        {rows.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-sm">
                <thead><tr className="border-b border-border bg-neutral-50"><Th className="w-11 text-center">STT</Th><Th>Mã báo cáo</Th><Th>Kỳ báo cáo</Th><Th>Đơn vị/Phạm vi</Th><Th>Biểu mẫu</Th><Th>Người thực hiện</Th><Th>Thời điểm xuất</Th></tr></thead>
                <tbody>{paged.map((h, i) => (
                  <tr key={h.maBaoCao} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{start + i + 1}</td>
                    <td className="px-4 py-3 font-mono text-[12.5px] font-semibold text-link">{h.maBaoCao}</td>
                    <td className="px-4 py-3 text-foreground-muted">{h.ky}</td>
                    <td className="px-4 py-3 text-foreground">{h.pham_vi}</td>
                    <td className="px-4 py-3 text-foreground-muted">{h.bieuMau}</td>
                    <td className="px-4 py-3 text-foreground-muted">{h.nguoiTH}</td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-foreground-muted">{h.thoiDiem}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={pageSize} total={rows.length} unit="bản ghi" onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
          </>
        ) : (
          <EmptyState icon={<BarChart3 className="size-6" />} title="Không tìm thấy lịch sử phù hợp" desc="Không có bản ghi lịch sử nào khớp với bộ lọc hiện tại." actionLabel="Đặt lại bộ lọc" onAction={reset} />
        )}
      </div>
    </div>
  )
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">{label}</label>{children}</div>
}
