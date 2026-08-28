import { useMemo, useState } from "react"
import { ArrowLeftRight, Ban, ShieldX } from "lucide-react"

import { cn } from "@/lib/utils"
import { useToast } from "@/features/reconciliation/components/Toast"
import { MultiSelect } from "@/features/reconciliation/components/MultiSelect"
import { ReportHeader, ReportTable, StatCard, TimeFilterBar } from "./components"
import {
  BIHUY_ROWS, CHUYENQUYEN_ROWS, DEFAULT_TIME, PROVINCES, VOHIEU_ROWS,
  exportFileName, exportResult, inRange, resolveRange, scopeRows, showCcv, showTinh, showToChuc,
  type ChuyenQuyenRow, type ReportRole, type TimeState, type VoHieuRow,
} from "./config"

type Tab = "vo-hieu" | "chuyen-quyen" | "bi-huy"
type BiHuyRow = VoHieuRow & { ngayBiHuy: string }

export function BienDongPhapLyPage() {
  const showToast = useToast()
  const [tab, setTab] = useState<Tab>("vo-hieu")
  const [role, setRole] = useState<ReportRole>("ld_btp")
  const [time, setTime] = useState<TimeState>(DEFAULT_TIME)
  const [tinh, setTinh] = useState<string[]>([])
  const [applied, setApplied] = useState<{ time: TimeState; tinh: string[] }>({ time: DEFAULT_TIME, tinh: [] })
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filt = <T extends { ngayCCISO?: string; ngayChuyenISO?: string; tinh: string; toChuc: string; ccv: string }>(data: T[]) => {
    const range = resolveRange(applied.time)
    if (range.error) return []
    let r = scopeRows(data, role).filter((x) => inRange((x.ngayCCISO ?? x.ngayChuyenISO)!, range))
    if (applied.tinh.length && showTinh(role)) r = r.filter((x) => applied.tinh.includes(x.tinh))
    return r
  }
  const voHieu = useMemo(() => filt(VOHIEU_ROWS), [role, applied])
  const biHuy = useMemo(() => filt(BIHUY_ROWS), [role, applied])
  const chuyen = useMemo(() => filt(CHUYENQUYEN_ROWS), [role, applied])

  const apply = () => { const rg = resolveRange(time); if (rg.error) return setError(rg.error); setError(""); setApplied({ time, tinh }); setPage(1) }
  const reset = () => { setTime(DEFAULT_TIME); setTinh([]); setApplied({ time: DEFAULT_TIME, tinh: [] }); setError(""); setPage(1) }

  const baseCols = <T extends VoHieuRow>(ngayLabel: string, ngayKey: (r: T) => string, soLabel: string) => [
    { key: "stt", header: "STT", cell: (_: T, i: number) => <span className="tabular-nums text-foreground-muted">{i + 1}</span>, className: "w-11 text-center" },
    { key: "soCC", header: soLabel, cell: (r: T) => <span className="font-mono text-[12.5px] font-semibold text-link">{r.soCC}</span> },
    { key: "tenGD", header: "Tên giao dịch", cell: (r: T) => r.tenGD, className: "min-w-[190px]" },
    { key: "ngayCC", header: "Ngày công chứng", cell: (r: T) => <span className="tabular-nums text-foreground-muted">{r.ngayCC}</span> },
    { key: "ngayBD", header: ngayLabel, cell: (r: T) => <span className="tabular-nums text-foreground-muted">{ngayKey(r)}</span> },
    ...(showToChuc(role) ? [{ key: "toChuc", header: "Tổ chức thực hiện", cell: (r: T) => <span className="text-foreground-muted">{r.toChuc}</span>, className: "min-w-[150px]" }] : []),
    ...(showCcv(role) ? [{ key: "ccv", header: "Công chứng viên", cell: (r: T) => <span className="text-foreground-muted">{r.ccv}</span> }] : []),
    ...(showTinh(role) ? [{ key: "tinh", header: "Tỉnh/Thành phố", cell: (r: T) => <span className="text-foreground-muted">{r.tinh}</span> }] : []),
  ]
  const vhCols = baseCols<VoHieuRow>("Ngày vô hiệu", (r) => r.ngayVoHieu, "Số công chứng vô hiệu")
  const bhCols = baseCols<BiHuyRow>("Ngày bị hủy", (r) => r.ngayBiHuy, "Số công chứng bị hủy")
  const cqCols = [
    { key: "stt", header: "STT", cell: (_: ChuyenQuyenRow, i: number) => <span className="tabular-nums text-foreground-muted">{i + 1}</span>, className: "w-11 text-center" },
    { key: "loai", header: "Loại chuyển quyền", cell: (r: ChuyenQuyenRow) => <span className="text-foreground">{r.loaiChuyen}</span>, className: "min-w-[160px]" },
    { key: "tcC", header: "Tổ chức chuyển", cell: (r: ChuyenQuyenRow) => <span className="text-foreground-muted">{r.toChucChuyen}</span>, className: "min-w-[160px]" },
    { key: "tcN", header: "Tổ chức nhận", cell: (r: ChuyenQuyenRow) => <span className="text-foreground-muted">{r.toChucNhan}</span>, className: "min-w-[160px]" },
    ...(showTinh(role) ? [{ key: "tinh", header: "Tỉnh/Thành phố", cell: (r: ChuyenQuyenRow) => <span className="text-foreground-muted">{r.tinh}</span> }] : []),
    { key: "ngay", header: "Ngày chuyển", cell: (r: ChuyenQuyenRow) => <span className="tabular-nums text-foreground-muted">{r.ngayChuyen}</span> },
    { key: "sl", header: "Số lượng giao dịch", cell: (r: ChuyenQuyenRow) => <span className="tabular-nums font-semibold text-foreground">{r.soLuong}</span>, className: "text-center" },
  ]

  const cqChiDinh = chuyen.filter((r) => r.loaiChuyen === "Chỉ định STP").reduce((s, r) => s + r.soLuong, 0)
  const cqThoaThuan = chuyen.filter((r) => r.loaiChuyen === "Thỏa thuận theo TCHNCC").reduce((s, r) => s + r.soLuong, 0)
  const rowsCount = tab === "vo-hieu" ? voHieu.length : tab === "bi-huy" ? biHuy.length : chuyen.length
  const doExport = () => showToast(`${exportResult(rowsCount).msg}${rowsCount ? ` (${exportFileName(role, "BaoCao_BienDongPhapLy")})` : ""}`, exportResult(rowsCount).kind)

  const tabs: [Tab, string][] = [["vo-hieu", "Giao dịch vô hiệu"], ["chuyen-quyen", "Chuyển quyền sở hữu"], ["bi-huy", "Giao dịch bị hủy"]]

  return (
    <div className="space-y-4">
      <ReportHeader title="Báo cáo biến động pháp lý giao dịch công chứng" desc="Thống kê các giao dịch công chứng vô hiệu, bị hủy và làm phát sinh biến động chuyển quyền sở hữu." role={role} onRole={(r) => { setRole(r); reset() }} />

      <div className="inline-flex gap-1 rounded-md border border-border bg-surface-muted p-[3px]">
        {tabs.map(([k, l]) => <button key={k} onClick={() => { setTab(k); setPage(1) }} className={cn("rounded-md px-4 py-1.5 text-[13px] font-medium", tab === k ? "bg-surface text-foreground-strong shadow-xs" : "text-foreground-muted hover:text-foreground")}>{l}</button>)}
      </div>

      <TimeFilterBar time={time} onTime={setTime} error={error} onApply={apply} onReset={reset}
        extra={showTinh(role) ? <MultiSelect label="Tỉnh/Thành phố" options={PROVINCES.map((s) => ({ value: s, label: s }))} selected={tinh} onChange={setTinh} emptyLabel="Tất cả" itemLabel={(n) => `${n} tỉnh/TP`} /> : undefined} />

      {tab === "vo-hieu" && <ReportTable title="Danh sách giao dịch vô hiệu" rows={voHieu} columns={vhCols} onExport={doExport} page={page} pageSize={pageSize} onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />}
      {tab === "bi-huy" && <ReportTable title="Danh sách giao dịch bị hủy" rows={biHuy} columns={bhCols} onExport={doExport} page={page} pageSize={pageSize} onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />}
      {tab === "chuyen-quyen" && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard label="Tổng giao dịch luân chuyển" value={cqChiDinh + cqThoaThuan} color="#8b5cf6" bg="#f5f3ff" icon={<ArrowLeftRight className="size-5" />} />
            <StatCard label="Chỉ định STP" value={cqChiDinh} icon={<ShieldX className="size-5" />} />
            <StatCard label="Thỏa thuận theo TCHNCC" value={cqThoaThuan} color="#b45309" bg="#fffbeb" icon={<Ban className="size-5" />} />
          </div>
          <ReportTable title="Danh sách giao dịch chuyển quyền sở hữu" rows={chuyen} columns={cqCols} onExport={doExport} page={page} pageSize={pageSize} onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
        </>
      )}
    </div>
  )
}
