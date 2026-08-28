import { useMemo, useState } from "react"
import { Activity, CheckCircle2, MinusCircle, XCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { useToast } from "@/features/reconciliation/components/Toast"
import { MultiSelect } from "@/features/reconciliation/components/MultiSelect"
import { inputCls } from "../ingestion/shared"
import { ReportHeader, ReportTable, StatCard, TimeFilterBar } from "./components"
import {
  DEFAULT_TIME, PROVINCES, REPORT_ROLES,
  exportFileName, exportResult, inRange, resolveRange, scopeRows, showTinh,
  type ReportRole, type TimeState,
} from "./config"
import { KHAI_THAC_LOGS, KT_STATUSES, KT_STATUS_COLOR, type KhaiThacLog } from "./nganchan"

const ROLES = REPORT_ROLES.filter((r) => ["ld_btp", "cv_btp", "ld_stp", "cv_stp"].includes(r.key))
interface Extras { donVi: string; trangThai: string[]; tinh: string[] }
const EMPTY: Extras = { donVi: "", trangThai: [], tinh: [] }

export function KhaiThacReportPage() {
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
    let r = scopeRows(KHAI_THAC_LOGS, role).filter((x) => inRange(x.thoiDiemISO, range))
    const { donVi, trangThai, tinh } = applied.ex
    if (donVi.trim()) r = r.filter((x) => x.donVi.toLowerCase().includes(donVi.trim().toLowerCase()))
    if (trangThai.length) r = r.filter((x) => trangThai.includes(x.trangThai))
    if (tinh.length && showTinh(role)) r = r.filter((x) => tinh.includes(x.tinh))
    return [...r].sort((a, b) => (a.thoiDiemISO < b.thoiDiemISO ? 1 : -1))
  }, [role, applied])

  const apply = () => { const rg = resolveRange(time); if (rg.error) return setError(rg.error); setError(""); setApplied({ time, ex: draft }); setPage(1) }
  const reset = () => { setTime(DEFAULT_TIME); setDraft(EMPTY); setApplied({ time: DEFAULT_TIME, ex: EMPTY }); setError(""); setPage(1) }
  const doExport = () => showToast(`${exportResult(rows.length).msg}${rows.length ? ` (${exportFileName(role, "BaoCao_TinhHinhKhaiThac")})` : ""}`, exportResult(rows.length).kind)

  const cnt = (s: string) => rows.filter((r) => r.trangThai === s).length
  const columns = [
    { key: "stt", header: "STT", cell: (_: KhaiThacLog, i: number) => <span className="tabular-nums text-foreground-muted">{i + 1}</span>, className: "w-11 text-center" },
    { key: "tg", header: "Thời điểm khai thác", cell: (r: KhaiThacLog) => <span className="tabular-nums text-foreground-muted">{r.thoiDiem}</span>, className: "min-w-[160px]" },
    { key: "donVi", header: "Đơn vị thực hiện", cell: (r: KhaiThacLog) => <span className="text-foreground-muted">{r.donVi}</span>, className: "min-w-[160px]" },
    { key: "tk", header: "Tài khoản", cell: (r: KhaiThacLog) => <span className="font-mono text-[12.5px] text-foreground">{r.taiKhoan}</span> },
    ...(showTinh(role) ? [{ key: "tinh", header: "Tỉnh/Thành phố", cell: (r: KhaiThacLog) => <span className="text-foreground-muted">{r.tinh}</span> }] : []),
    { key: "tuKhoa", header: "Từ khóa", cell: (r: KhaiThacLog) => <span className="text-foreground-muted">{r.tuKhoa}</span>, className: "min-w-[180px]" },
    { key: "tt", header: "Trạng thái", cell: (r: KhaiThacLog) => <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[12px] font-semibold", KT_STATUS_COLOR[r.trangThai])}>{r.trangThai}</span>, className: "min-w-[180px]" },
  ]

  return (
    <div className="space-y-4">
      <ReportHeader title="Báo cáo tình hình khai thác thông tin ngăn chặn / CBRR" desc="Thống kê nhật ký lịch sử các lượt tra cứu, khai thác thông tin ngăn chặn và cảnh báo rủi ro." role={role} onRole={(r) => { setRole(r); reset() }} roles={ROLES} />

      <TimeFilterBar time={time} onTime={setTime} error={error} onApply={apply} onReset={reset}
        extra={<>
          <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Đơn vị khai thác</label><input value={draft.donVi} onChange={(e) => setDraft({ ...draft, donVi: e.target.value })} maxLength={255} className={inputCls} placeholder="Nhập tên đơn vị…" /></div>
          <MultiSelect label="Trạng thái" options={KT_STATUSES.map((s) => ({ value: s, label: s }))} selected={draft.trangThai} onChange={(v) => setDraft({ ...draft, trangThai: v })} emptyLabel="Tất cả" itemLabel={(n) => `${n} trạng thái`} />
          {showTinh(role) && <MultiSelect label="Tỉnh/Thành phố" options={PROVINCES.map((s) => ({ value: s, label: s }))} selected={draft.tinh} onChange={(v) => setDraft({ ...draft, tinh: v })} emptyLabel="Tất cả" itemLabel={(n) => `${n} tỉnh/TP`} />}
        </>}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tổng lượt khai thác" value={rows.length} icon={<Activity className="size-5" />} />
        <StatCard label="Thành công có dữ liệu" value={cnt("Thành công có dữ liệu")} color="#047857" bg="#ecfdf5" icon={<CheckCircle2 className="size-5" />} />
        <StatCard label="Thành công không có dữ liệu" value={cnt("Thành công không có dữ liệu")} color="#b45309" bg="#fffbeb" icon={<MinusCircle className="size-5" />} />
        <StatCard label="Thất bại / Lỗi" value={cnt("Thất bại")} color="#b91c1c" bg="#fef2f2" icon={<XCircle className="size-5" />} />
      </div>

      <ReportTable title="Nhật ký khai thác thông tin ngăn chặn / CBRR" rows={rows} columns={columns} onExport={doExport}
        page={page} pageSize={pageSize} onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
    </div>
  )
}
