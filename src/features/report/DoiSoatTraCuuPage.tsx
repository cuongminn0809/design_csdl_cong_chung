import { useEffect, useMemo, useState } from "react"
import { AlertCircle, CheckCircle2, ClipboardList, MinusCircle, Search, XCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { useToast } from "@/features/reconciliation/components/Toast"
import { MultiSelect } from "@/features/reconciliation/components/MultiSelect"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { inputCls } from "../ingestion/shared"
import { ReportHeader, ReportTable, StatCard, TriStatusBar } from "./components"
import {
  CURRENT_YEAR, DEFAULT_TIME, YEARS, exportResult, resolveRange,
  type ReportRole, type TimeState,
} from "./config"
import {
  DS_CCVS, DS_ORG, DS_STATUSES, DS_STATUS_META, DS_TABS,
  LOOKUP_LOGS, ccvLabel, exportDsFileName, maskKeyword, resultLabel,
  type DSStatus, type DSTab, type LookupLog,
} from "./doisoat"

const ROLES: { key: ReportRole; label: string }[] = [
  { key: "ld_tchncc", label: "Lãnh đạo TCHNCC" },
  { key: "ccv", label: "Công chứng viên" },
]
const CURRENT_CCV_NAME = "Nguyễn Văn A"

export function DoiSoatTraCuuPage() {
  const showToast = useToast()
  const [role, setRole] = useState<ReportRole>("ld_tchncc")
  const [tab, setTab] = useState<DSTab>("ngan-chan")
  const [time, setTime] = useState<TimeState>(DEFAULT_TIME)
  const [ccvSel, setCcvSel] = useState<string[]>([])
  const [statusSel, setStatusSel] = useState<DSStatus[]>([])
  const [keywordInput, setKeywordInput] = useState("")
  const [keyword, setKeyword] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // VR-02: debounce 500ms trước khi áp dụng từ khóa tìm kiếm.
  useEffect(() => {
    const t = setTimeout(() => setKeyword(keywordInput.trim()), 500)
    return () => clearTimeout(t)
  }, [keywordInput])

  const isLanhDao = role === "ld_tchncc"
  const range = resolveRange(time, "today")

  const scoped = useMemo(() => {
    let r = LOOKUP_LOGS.filter((x) => x.tab === tab && x.toChuc === DS_ORG)
    if (!isLanhDao) r = r.filter((x) => x.ccvName === CURRENT_CCV_NAME)
    return r
  }, [tab, isLanhDao])

  const rows = useMemo(() => {
    if (range.error) return []
    let r = scoped.filter((x) => { const iso = x.thoiDiemISO.slice(0, 10); return (!range.from || iso >= range.from) && (!range.to || iso <= range.to) })
    if (isLanhDao && ccvSel.length) r = r.filter((x) => ccvSel.includes(x.ccvAccount))
    if (statusSel.length) r = r.filter((x) => statusSel.includes(x.status))
    if (keyword) r = r.filter((x) => x.tuKhoaRaw.toLowerCase().includes(keyword.toLowerCase()))
    return [...r].sort((a, b) => (a.thoiDiemISO < b.thoiDiemISO ? 1 : -1)) // CreatedDate DESC
  }, [scoped, range, ccvSel, statusSel, keyword, isLanhDao])

  const changeTab = (t: DSTab) => { setTab(t); setCcvSel([]); setStatusSel([]); setKeywordInput(""); setKeyword(""); setPage(1) }
  const changeRole = (r: ReportRole) => { setRole(r); setCcvSel([]); setStatusSel([]); setKeywordInput(""); setKeyword(""); setPage(1) }

  const c02 = rows.filter((r) => r.status === "co-du-lieu").length
  const c03 = rows.filter((r) => r.status === "khong-du-lieu").length
  const c04 = rows.filter((r) => r.status === "loi").length
  const total = rows.length
  const pct = (n: number) => (total ? Math.round((n / total) * 1000) / 10 : 0)

  const doExport = () => {
    const res = exportResult(rows.length)
    showToast(rows.length ? `${res.msg} (${exportDsFileName(tab, isLanhDao)})` : res.msg, res.kind)
  }

  const meta = DS_TABS.find((t) => t.key === tab)!
  const columns = [
    { key: "stt", header: "STT", cell: (_: LookupLog, i: number) => <span className="tabular-nums text-foreground-muted">{i + 1}</span>, className: "w-11 text-center" },
    { key: "tg", header: "Thời gian tra cứu", cell: (r: LookupLog) => <span className="tabular-nums text-foreground-muted">{r.thoiDiem}</span>, className: "min-w-[170px]" },
    ...(isLanhDao ? [{ key: "ccv", header: "Công chứng viên", cell: (r: LookupLog) => <span className="text-foreground">{ccvLabel(r.ccvName, r.ccvAccount)}</span>, className: "min-w-[170px]" }] : []),
    { key: "tk", header: "Từ khóa tra cứu", cell: (r: LookupLog) => <span className="inline-flex items-center rounded-full border border-border bg-surface-muted px-2.5 py-0.5 font-mono text-[12px] text-foreground-muted">[{r.tuKhoaPrefix}: {maskKeyword(r.tuKhoaRaw)}]</span>, className: "min-w-[220px]" },
    { key: "sl", header: "Số lượng kết quả", cell: (r: LookupLog) => <span className={cn("text-[13px]", r.status === "loi" ? "italic text-foreground-subtle" : "text-foreground")}>{resultLabel(r)}</span>, className: "min-w-[190px]" },
    { key: "tt", header: "Trạng thái", cell: (r: LookupLog) => (
      <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[12px] font-semibold", DS_STATUS_META[r.status].badge)}>
        <span className="size-1.5 rounded-full" style={{ background: DS_STATUS_META[r.status].dot }} />{DS_STATUS_META[r.status].label}
      </span>
    ) },
  ]

  return (
    <div className="space-y-4">
      <ReportHeader title="Báo cáo đối soát lịch sử tra cứu" desc="Giám sát và kiểm tra nhật ký tra cứu dữ liệu trên hệ thống CSDL Công chứng." role={role} onRole={changeRole} roles={ROLES} />

      <div className="inline-flex flex-wrap gap-1 rounded-md border border-border bg-surface-muted p-[3px]">
        {DS_TABS.map((t) => <button key={t.key} onClick={() => changeTab(t.key)} className={cn("rounded-md px-3.5 py-1.5 text-[13px] font-medium", tab === t.key ? "bg-surface text-foreground-strong shadow-xs" : "text-foreground-muted hover:text-foreground")}>{t.label}</button>)}
      </div>

      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <F label="Năm"><NativeSelect value={String(time.year)} onChange={(e) => setTime({ ...time, year: e.target.value === "custom" ? "custom" : Number(e.target.value) })}>{YEARS.map((y) => <option key={String(y)} value={String(y)}>{y === "custom" ? "Tùy chọn" : y}</option>)}</NativeSelect></F>
          {time.year !== "custom" && <F label="Loại kỳ"><NativeSelect value={time.kind} onChange={(e) => setTime({ ...time, kind: e.target.value as TimeState["kind"] })}><option value="ca-nam">Cả năm</option><option value="theo-quy">Theo quý</option><option value="theo-thang">Theo tháng</option></NativeSelect></F>}
          {time.year !== "custom" && time.kind === "theo-thang" && <F label="Chọn tháng"><NativeSelect value={time.month} onChange={(e) => setTime({ ...time, month: Number(e.target.value) })}>{Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>Tháng {m}</option>)}</NativeSelect></F>}
          {time.year !== "custom" && time.kind === "theo-quy" && <F label="Chọn quý"><NativeSelect value={time.quarter} onChange={(e) => setTime({ ...time, quarter: Number(e.target.value) })}>{[1, 2, 3, 4].map((q) => <option key={q} value={q}>Quý {q}</option>)}</NativeSelect></F>}
          {time.year === "custom" && <F label="Từ ngày"><input type="date" value={time.tuNgay} onChange={(e) => setTime({ ...time, tuNgay: e.target.value })} className={cn(inputCls, "text-[13.5px]")} /></F>}
          {time.year === "custom" && <F label="Đến ngày"><input type="date" value={time.denNgay} onChange={(e) => setTime({ ...time, denNgay: e.target.value })} className={cn(inputCls, "text-[13.5px]")} /></F>}
          {isLanhDao && <MultiSelect label="Công chứng viên" options={DS_CCVS.map((c) => ({ value: c.account, label: ccvLabel(c.name, c.account) }))} selected={ccvSel} onChange={setCcvSel} emptyLabel="Tất cả CCV" itemLabel={(n) => `${n} CCV đã chọn`} />}
          <MultiSelect label="Trạng thái kết quả" options={DS_STATUSES.map((s) => ({ value: s.key, label: s.label }))} selected={statusSel} onChange={(v) => setStatusSel(v as DSStatus[])} emptyLabel="Tất cả trạng thái" itemLabel={(n) => `${n} trạng thái`} />
          <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-2">
            <label className="text-xs font-semibold text-foreground-strong">Từ khóa tra cứu</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle" />
              <input value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} maxLength={255} className={cn(inputCls, "pl-9")} placeholder={meta.placeholder} />
            </div>
          </div>
        </div>
        {range.error && <div className="mt-3 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]"><AlertCircle className="mr-1 inline size-3.5" />{range.error}</div>}
        {!range.error && <div className="mt-3 text-[11.5px] text-foreground-subtle">Khoảng thời gian: {range.label}{time.year === CURRENT_YEAR || time.year === "custom" ? " (Đến ngày không vượt quá ngày hiện tại)" : ""}</div>}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tổng số lượt tra cứu" value={total} icon={<ClipboardList className="size-5" />} />
        <StatCard label="Thành công (Có dữ liệu)" value={c02} color="#047857" bg="#ecfdf5" icon={<CheckCircle2 className="size-5" />} />
        <StatCard label="Thành công (Không dữ liệu)" value={c03} color="#475569" bg="#f1f5f9" icon={<MinusCircle className="size-5" />} />
        <StatCard label="Thất bại / Lỗi" value={c04} color="#b91c1c" bg="#fef2f2" icon={<XCircle className="size-5" />} />
      </div>

      <TriStatusBar title={`Tỷ lệ trạng thái tra cứu — ${meta.label}`} segments={[
        { label: "Có dữ liệu", value: c02, pct: pct(c02), color: "#10b981" },
        { label: "Không có dữ liệu", value: c03, pct: pct(c03), color: "#64748b" },
        { label: "Lỗi / Thất bại", value: c04, pct: pct(c04), color: "#ef4444" },
      ]} />

      <ReportTable title="Chi tiết lịch sử lượt tra cứu" rows={rows} columns={columns} onExport={doExport}
        page={page} pageSize={pageSize} onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
    </div>
  )
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">{label}</label>{children}</div>
}
