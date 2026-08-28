import { useMemo, useState } from "react"
import { CheckCircle2, ClipboardCheck, XCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { useToast } from "@/features/reconciliation/components/Toast"
import { MultiSelect } from "@/features/reconciliation/components/MultiSelect"
import { ReportHeader, ReportTable, StatCard, TimeFilterBar } from "./components"
import {
  DEFAULT_TIME, DOISOAT_ROWS, HAUKIEM_ROWS, PROVINCES,
  exportFileName, exportResult, inRange, resolveRange, scopeRows, showTinh, showToChuc,
  type DoiSoatRow, type HauKiemRow, type ReportRole, type TimeState,
} from "./config"

type Tab = "doi-soat" | "hau-kiem"
const okBadge = "border-[#a7f3d0] bg-[#ecfdf5] text-[#047857]"
const badBadge = "border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]"
const Badge = ({ text, ok }: { text: string; ok: boolean }) => <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[12px] font-semibold", ok ? okBadge : badBadge)}>{text}</span>

export function SaiLechPage() {
  const showToast = useToast()
  const [tab, setTab] = useState<Tab>("doi-soat")
  const [role, setRole] = useState<ReportRole>("ld_btp")
  const [time, setTime] = useState<TimeState>(DEFAULT_TIME)
  const [tinh, setTinh] = useState<string[]>([])
  const [applied, setApplied] = useState<{ time: TimeState; tinh: string[] }>({ time: DEFAULT_TIME, tinh: [] })
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filterFn = <T extends { ngayCCISO: string; tinh: string; toChuc: string; ccv: string }>(data: T[]) => {
    const range = resolveRange(applied.time)
    if (range.error) return []
    let r = scopeRows(data, role).filter((x) => inRange(x.ngayCCISO, range))
    if (applied.tinh.length && showTinh(role)) r = r.filter((x) => applied.tinh.includes(x.tinh))
    return r
  }
  const doiSoat = useMemo(() => filterFn(DOISOAT_ROWS), [role, applied])
  const hauKiem = useMemo(() => filterFn(HAUKIEM_ROWS), [role, applied])

  const apply = () => { const rg = resolveRange(time); if (rg.error) return setError(rg.error); setError(""); setApplied({ time, tinh }); setPage(1) }
  const reset = () => { setTime(DEFAULT_TIME); setTinh([]); setApplied({ time: DEFAULT_TIME, tinh: [] }); setError(""); setPage(1) }

  const dsCols = [
    { key: "stt", header: "STT", cell: (_: DoiSoatRow, i: number) => <span className="tabular-nums text-foreground-muted">{i + 1}</span>, className: "w-11 text-center" },
    { key: "soCC", header: "Số công chứng", cell: (r: DoiSoatRow) => <span className="font-mono text-[12.5px] font-semibold text-link">{r.soCC}</span> },
    { key: "ngay", header: "Ngày công chứng", cell: (r: DoiSoatRow) => <span className="tabular-nums text-foreground-muted">{r.ngayCC}</span> },
    ...(showToChuc(role) ? [{ key: "toChuc", header: "Tổ chức thực hiện", cell: (r: DoiSoatRow) => <span className="text-foreground-muted">{r.toChuc}</span>, className: "min-w-[150px]" }] : []),
    { key: "nguon", header: "Nguồn đối soát", cell: (r: DoiSoatRow) => <span className="text-foreground-muted">{r.nguon}</span>, className: "min-w-[150px]" },
    { key: "kq", header: "Kết quả đối soát", cell: (r: DoiSoatRow) => <Badge text={r.ketQua} ok={r.ketQua === "Khớp"} /> },
    { key: "chiTiet", header: "Chi tiết sai lệch", cell: (r: DoiSoatRow) => <span className="text-foreground-muted">{r.chiTiet}</span>, className: "min-w-[200px]" },
    ...(showTinh(role) ? [{ key: "tinh", header: "Tỉnh/Thành phố", cell: (r: DoiSoatRow) => <span className="text-foreground-muted">{r.tinh}</span> }] : []),
  ]
  const hkCols = [
    { key: "stt", header: "STT", cell: (_: HauKiemRow, i: number) => <span className="tabular-nums text-foreground-muted">{i + 1}</span>, className: "w-11 text-center" },
    { key: "soCC", header: "Số công chứng", cell: (r: HauKiemRow) => <span className="font-mono text-[12.5px] font-semibold text-link">{r.soCC}</span> },
    { key: "ngay", header: "Ngày công chứng", cell: (r: HauKiemRow) => <span className="tabular-nums text-foreground-muted">{r.ngayCC}</span> },
    ...(showToChuc(role) ? [{ key: "toChuc", header: "Tổ chức thực hiện", cell: (r: HauKiemRow) => <span className="text-foreground-muted">{r.toChuc}</span>, className: "min-w-[150px]" }] : []),
    { key: "nhom", header: "Nhóm tiêu chí hậu kiểm", cell: (r: HauKiemRow) => <span className="text-foreground-muted">{r.nhomTieuChi}</span>, className: "min-w-[190px]" },
    { key: "kq", header: "Kết quả", cell: (r: HauKiemRow) => <Badge text={r.ketQua} ok={r.ketQua === "Đạt"} /> },
    ...(showTinh(role) ? [{ key: "tinh", header: "Tỉnh/Thành phố", cell: (r: HauKiemRow) => <span className="text-foreground-muted">{r.tinh}</span> }] : []),
  ]

  const rows = tab === "doi-soat" ? doiSoat : hauKiem
  const dsSai = doiSoat.filter((r) => r.ketQua === "Sai lệch").length
  const hkViPham = hauKiem.filter((r) => r.ketQua === "Vi phạm").length
  const doExport = () => showToast(`${exportResult(rows.length).msg}${rows.length ? ` (${exportFileName(role, tab === "doi-soat" ? "BaoCao_DoiSoat" : "BaoCao_HauKiem")})` : ""}`, exportResult(rows.length).kind)

  return (
    <div className="space-y-4">
      <ReportHeader title="Báo cáo dữ liệu sai lệch" desc="Thống kê các dữ liệu sai lệch, bất thường phát hiện từ quá trình đối soát và hậu kiểm dữ liệu giao dịch công chứng." role={role} onRole={(r) => { setRole(r); reset() }} />

      <div className="inline-flex gap-1 rounded-md border border-border bg-surface-muted p-[3px]">
        {([["doi-soat", "Đối soát dữ liệu"], ["hau-kiem", "Hậu kiểm dữ liệu"]] as [Tab, string][]).map(([k, l]) => (
          <button key={k} onClick={() => { setTab(k); setPage(1) }} className={cn("rounded-md px-4 py-1.5 text-[13px] font-medium", tab === k ? "bg-surface text-foreground-strong shadow-xs" : "text-foreground-muted hover:text-foreground")}>{l}</button>
        ))}
      </div>

      <TimeFilterBar time={time} onTime={setTime} error={error} onApply={apply} onReset={reset}
        extra={showTinh(role) ? <MultiSelect label="Tỉnh/Thành phố" options={PROVINCES.map((s) => ({ value: s, label: s }))} selected={tinh} onChange={setTinh} emptyLabel="Tất cả" itemLabel={(n) => `${n} tỉnh/TP`} /> : undefined} />

      {tab === "doi-soat" ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard label="Tổng bản ghi đối soát" value={doiSoat.length} icon={<ClipboardCheck className="size-5" />} />
            <StatCard label="Dữ liệu khớp" value={doiSoat.length - dsSai} color="#047857" bg="#ecfdf5" icon={<CheckCircle2 className="size-5" />} />
            <StatCard label="Dữ liệu sai lệch" value={dsSai} color="#b91c1c" bg="#fef2f2" icon={<XCircle className="size-5" />} />
          </div>
          <ReportTable title="Danh sách đối soát dữ liệu" rows={doiSoat} columns={dsCols} onExport={doExport} page={page} pageSize={pageSize} onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard label="Tổng bản ghi hậu kiểm" value={hauKiem.length} icon={<ClipboardCheck className="size-5" />} />
            <StatCard label="Đạt" value={hauKiem.length - hkViPham} color="#047857" bg="#ecfdf5" icon={<CheckCircle2 className="size-5" />} />
            <StatCard label="Vi phạm" value={hkViPham} color="#b91c1c" bg="#fef2f2" icon={<XCircle className="size-5" />} />
          </div>
          <ReportTable title="Danh sách hậu kiểm dữ liệu" rows={hauKiem} columns={hkCols} onExport={doExport} page={page} pageSize={pageSize} onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
        </>
      )}
    </div>
  )
}
