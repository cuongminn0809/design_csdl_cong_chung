import { useMemo, useState } from "react"
import { Eye, Layers, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { MultiSelect } from "@/features/reconciliation/components/MultiSelect"
import { inputCls } from "../ingestion/shared"
import { DonutChart, ReportHeader, ReportTable, StatCard, TimeFilterBar } from "./components"
import {
  DEFAULT_TIME, PROVINCES, REPORT_ROLES,
  distribution, exportFileName, exportResult, inRange, resolveRange, scopeRows, showTinh,
  type ReportRole, type TimeState,
} from "./config"
import {
  NC_LABEL, NC_RECORDS, NC_SOURCES, NC_STATUSES, NC_STATUS_COLOR,
  type NCKind, type NCRecord,
} from "./nganchan"

const ROLES = REPORT_ROLES.filter((r) => ["ld_btp", "cv_btp", "ld_stp", "cv_stp"].includes(r.key))
const TABS: [NCKind, string][] = [["ngan-chan", "Thông tin ngăn chặn"], ["giai-toa", "Thông tin giải tỏa ngăn chặn"], ["cbrr", "Thông tin cảnh báo rủi ro"], ["huy-cbrr", "Thông tin hủy cảnh báo rủi ro"]]

interface Extras { donVi: string; nguon: string[]; trangThai: string[]; tinh: string[] }
const EMPTY: Extras = { donVi: "", nguon: [], trangThai: [], tinh: [] }

export function NganChanReportPage() {
  const showToast = useToast()
  const [tab, setTab] = useState<NCKind>("ngan-chan")
  const [role, setRole] = useState<ReportRole>("ld_btp")
  const [time, setTime] = useState<TimeState>(DEFAULT_TIME)
  const [draft, setDraft] = useState<Extras>(EMPTY)
  const [applied, setApplied] = useState<{ time: TimeState; ex: Extras }>({ time: DEFAULT_TIME, ex: EMPTY })
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [detail, setDetail] = useState<NCRecord | null>(null)

  const meta = NC_LABEL[tab]
  const rows = useMemo(() => {
    const range = resolveRange(applied.time)
    if (range.error) return []
    const dateOf = (r: NCRecord) => meta.dateField === "banHanh" ? r.banHanhISO : r.taoISO
    let r = scopeRows(NC_RECORDS.filter((x) => x.kind === tab), role).filter((x) => inRange(dateOf(x), range))
    const { donVi, nguon, trangThai, tinh } = applied.ex
    if (donVi.trim()) r = r.filter((x) => x.donViGui.toLowerCase().includes(donVi.trim().toLowerCase()))
    if (nguon.length) r = r.filter((x) => nguon.includes(x.nguon))
    if (trangThai.length) r = r.filter((x) => trangThai.includes(x.trangThai))
    if (tinh.length && showTinh(role)) r = r.filter((x) => tinh.includes(x.tinh))
    // BR-A6-05: mặc định sắp xếp ngày (ban hành/tạo) giảm dần
    return [...r].sort((a, b) => (dateOf(a) < dateOf(b) ? 1 : -1))
  }, [role, applied, tab])

  const apply = () => { const rg = resolveRange(time); if (rg.error) return setError(rg.error); setError(""); setApplied({ time, ex: draft }); setPage(1) }
  const reset = () => { setTime(DEFAULT_TIME); setDraft(EMPTY); setApplied({ time: DEFAULT_TIME, ex: EMPTY }); setError(""); setPage(1) }
  const doExport = () => showToast(`${exportResult(rows.length).msg}${rows.length ? ` (${exportFileName(role, meta.file)})` : ""}`, exportResult(rows.length).kind)

  const srcDist = distribution(rows, (r) => r.nguon, NC_SOURCES)
  const statusCount = (s: string) => rows.filter((r) => r.trangThai === s).length

  const columns = [
    { key: "stt", header: "STT", cell: (_: NCRecord, i: number) => <span className="tabular-nums text-foreground-muted">{i + 1}</span>, className: "w-11 text-center" },
    { key: "soVB", header: "Số văn bản", cell: (r: NCRecord) => <button onClick={() => setDetail(r)} className="font-mono text-[12.5px] font-semibold text-link hover:underline">{r.soVanBan}</button>, className: "min-w-[130px]" },
    { key: "donVi", header: "Đơn vị gửi yêu cầu", cell: (r: NCRecord) => <span className="text-foreground-muted">{r.donViGui}</span>, className: "min-w-[190px]" },
    { key: "tt", header: meta.infoCol, cell: (r: NCRecord) => <span className="text-foreground">{r.thongTin}</span>, className: "min-w-[220px]" },
    { key: "banHanh", header: "Ngày ban hành", cell: (r: NCRecord) => <span className="tabular-nums text-foreground-muted">{r.ngayBanHanh}</span> },
    { key: "nguon", header: "Nguồn dữ liệu", cell: (r: NCRecord) => <span className="text-foreground-muted">{r.nguon}</span>, className: "min-w-[160px]" },
    { key: "trangThai", header: "Trạng thái", cell: (r: NCRecord) => <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[12px] font-semibold", NC_STATUS_COLOR[r.trangThai]?.badge)}>{r.trangThai}</span> },
    { key: "tao", header: "Ngày tạo", cell: (r: NCRecord) => <span className="tabular-nums text-foreground-muted">{r.ngayTao}</span> },
    { key: "act", header: "Thao tác", cell: (r: NCRecord) => <Button variant="outline" size="sm" onClick={() => setDetail(r)} className="h-7 gap-1 text-[12px]"><Eye className="size-3.5" />Xem</Button>, className: "text-center" },
  ]

  return (
    <div className="space-y-4">
      <ReportHeader title="Báo cáo thống kê thông tin ngăn chặn / cảnh báo rủi ro" desc="Thống kê, phân tích thông tin ngăn chặn, giải tỏa, cảnh báo rủi ro và hủy cảnh báo rủi ro theo phạm vi phân quyền." role={role} onRole={(r) => { setRole(r); reset() }} roles={ROLES} />

      <div className="inline-flex flex-wrap gap-1 rounded-md border border-border bg-surface-muted p-[3px]">
        {TABS.map(([k, l]) => <button key={k} onClick={() => { setTab(k); setPage(1) }} className={cn("rounded-md px-3.5 py-1.5 text-[13px] font-medium", tab === k ? "bg-surface text-foreground-strong shadow-xs" : "text-foreground-muted hover:text-foreground")}>{l}</button>)}
      </div>

      <TimeFilterBar time={time} onTime={setTime} error={error} onApply={apply} onReset={reset}
        extra={<>
          <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Đơn vị gửi yêu cầu</label><input value={draft.donVi} onChange={(e) => setDraft({ ...draft, donVi: e.target.value })} maxLength={255} className={inputCls} placeholder="Nhập tên đơn vị…" /></div>
          <MultiSelect label="Nguồn dữ liệu" options={NC_SOURCES.map((s) => ({ value: s, label: s }))} selected={draft.nguon} onChange={(v) => setDraft({ ...draft, nguon: v })} emptyLabel="Tất cả" itemLabel={(n) => `${n} nguồn`} />
          <MultiSelect label="Trạng thái" options={NC_STATUSES.map((s) => ({ value: s, label: s }))} selected={draft.trangThai} onChange={(v) => setDraft({ ...draft, trangThai: v })} emptyLabel="Tất cả" itemLabel={(n) => `${n} trạng thái`} />
          {showTinh(role) && <MultiSelect label="Tỉnh/Thành phố" options={PROVINCES.map((s) => ({ value: s, label: s }))} selected={draft.tinh} onChange={(v) => setDraft({ ...draft, tinh: v })} emptyLabel="Tất cả" itemLabel={(n) => `${n} tỉnh/TP`} />}
        </>}
      />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <StatCard label={`Tổng ${meta.tab.toLowerCase()}`} value={rows.length} icon={<Layers className="size-6" />} hero />
        <DonutChart title="Tỉ lệ theo nguồn dữ liệu" segments={srcDist} />
        <div className="rounded-[14px] border border-border bg-surface p-4 shadow-sm">
          <div className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-foreground-subtle">Tổng hợp trạng thái</div>
          <div className="grid grid-cols-2 gap-2.5">
            {NC_STATUSES.map((s) => (
              <div key={s} className="rounded-[10px] border border-border bg-surface-muted px-3 py-2.5">
                <div className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ background: NC_STATUS_COLOR[s].dot }} /><span className="text-[11.5px] text-foreground-muted">{s}</span></div>
                <div className="mt-0.5 text-[20px] font-bold tabular-nums text-foreground-strong">{statusCount(s)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ReportTable title={`Bảng thống kê ${meta.tab.toLowerCase()}`} rows={rows} columns={columns} onExport={doExport}
        page={page} pageSize={pageSize} onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />

      {detail && <DetailModal rec={detail} infoCol={meta.infoCol} onClose={() => setDetail(null)} />}
    </div>
  )
}

function DetailModal({ rec, infoCol, onClose }: { rec: NCRecord; infoCol: string; onClose: () => void }) {
  const fields: [string, string][] = [
    ["Số văn bản", rec.soVanBan], ["Đơn vị gửi yêu cầu", rec.donViGui], [infoCol, rec.thongTin],
    ["Ngày ban hành", rec.ngayBanHanh], ["Nguồn dữ liệu", rec.nguon], ["Trạng thái", rec.trangThai],
    ["Ngày tạo", rec.ngayTao], ["Tỉnh/Thành phố", rec.tinh],
  ]
  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={onClose}>
      <div className="flex max-h-[88vh] w-full max-w-[620px] flex-col overflow-hidden rounded-xl bg-surface shadow-popover" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <span className="text-[15px] font-semibold text-foreground-strong">Chi tiết văn bản</span>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="size-[18px]" /></Button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
            {fields.map(([l, v]) => (
              <div key={l} className={cn("flex flex-col gap-0.5 border-b border-neutral-100 py-2", l === infoCol && "sm:col-span-2")}><div className="text-xs text-foreground-muted">{l}</div><div className="text-[13.5px] text-foreground">{v}</div></div>
            ))}
          </div>
        </div>
        <div className="flex justify-end border-t border-border px-6 py-4"><Button variant="outline" onClick={onClose}>Đóng</Button></div>
      </div>
    </div>
  )
}
