import { useMemo, useState } from "react"
import { Eye, Info, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { MultiSelect } from "@/features/reconciliation/components/MultiSelect"
import { Th } from "../ingestion/shared"
import { ReportHeader, ReportTable, TimeFilterBar } from "./components"
import {
  ALERTS, ALERT_LEGEND, ALERT_LEVELS, ALERT_TYPES, DEFAULT_TIME, PROVINCES, TCHNCC_LIST,
  exportFileName, exportResult, inRange, resolveRange, scopeRows, showTinh,
  type AlertRow, type ReportRole, type TimeState,
} from "./config"

const LEVEL_BADGE: Record<string, string> = {
  "Cao": "border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]",
  "Trung bình": "border-[#fde68a] bg-[#fffbeb] text-[#b45309]",
  "Thấp": "border-[#a7f3d0] bg-[#ecfdf5] text-[#047857]",
}
const Badge = ({ level }: { level: string }) => <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[12px] font-semibold", LEVEL_BADGE[level])}>{level}</span>

interface Extras { toChuc: string[]; loai: string[]; mucDo: string[]; tinh: string[] }
const EMPTY: Extras = { toChuc: [], loai: [], mucDo: [], tinh: [] }

export function CanhBaoBatThuongPage() {
  const showToast = useToast()
  const [role, setRole] = useState<ReportRole>("ld_btp")
  const [time, setTime] = useState<TimeState>(DEFAULT_TIME)
  const [draft, setDraft] = useState<Extras>(EMPTY)
  const [applied, setApplied] = useState<{ time: TimeState; ex: Extras }>({ time: DEFAULT_TIME, ex: EMPTY })
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [legend, setLegend] = useState(false)
  const [detail, setDetail] = useState<AlertRow | null>(null)

  const rows = useMemo(() => {
    const range = resolveRange(applied.time)
    if (range.error) return []
    let r = scopeRows(ALERTS, role).filter((x) => inRange(x.ngayCanhBaoISO, range))
    const { toChuc, loai, mucDo, tinh } = applied.ex
    if (toChuc.length) r = r.filter((x) => toChuc.includes(x.toChuc))
    if (loai.length) r = r.filter((x) => loai.includes(x.loaiCanhBao))
    if (mucDo.length) r = r.filter((x) => mucDo.includes(x.mucDo))
    if (tinh.length && showTinh(role)) r = r.filter((x) => tinh.includes(x.tinh))
    return [...r].sort((a, b) => (a.ngayCanhBaoISO < b.ngayCanhBaoISO ? 1 : -1)) // BR-A6-05 mới nhất lên trên
  }, [role, applied])

  const apply = () => { const rg = resolveRange(time); if (rg.error) return setError(rg.error); setError(""); setApplied({ time, ex: draft }); setPage(1) }
  const reset = () => { setTime(DEFAULT_TIME); setDraft(EMPTY); setApplied({ time: DEFAULT_TIME, ex: EMPTY }); setError(""); setPage(1) }
  const doExport = () => showToast(`${exportResult(rows.length).msg}${rows.length ? ` (${exportFileName(role, "BaoCao_CanhBao_TruyCap_LuuTru")})` : ""}`, exportResult(rows.length).kind)

  const columns = [
    { key: "stt", header: "STT", cell: (_: AlertRow, i: number) => <span className="tabular-nums text-foreground-muted">{i + 1}</span>, className: "w-11 text-center" },
    { key: "ngay", header: "Ngày cảnh báo", cell: (r: AlertRow) => <span className="tabular-nums text-foreground-muted">{r.ngayCanhBao}</span> },
    { key: "soCC", header: "Số công chứng", cell: (r: AlertRow) => <span className="font-mono text-[12.5px] font-semibold text-link">{r.soCC}</span> },
    { key: "toChuc", header: "Tổ chức thực hiện", cell: (r: AlertRow) => <span className="text-foreground-muted">{r.toChuc}</span>, className: "min-w-[150px]" },
    { key: "nguoiXem", header: "Người xem", cell: (r: AlertRow) => <span className="text-foreground">{r.nguoiXem} <span className="text-foreground-subtle">({r.taiKhoan})</span></span>, className: "min-w-[160px]" },
    { key: "loai", header: "Loại cảnh báo", cell: (r: AlertRow) => <span className="text-foreground-muted">{r.loaiCanhBao}</span>, className: "min-w-[140px]" },
    { key: "mucDo", header: "Mức độ", cell: (r: AlertRow) => <Badge level={r.mucDo} /> },
    ...(showTinh(role) ? [{ key: "tinh", header: "Tỉnh/Thành phố", cell: (r: AlertRow) => <span className="text-foreground-muted">{r.tinh}</span> }] : []),
    { key: "act", header: "Thao tác", cell: (r: AlertRow) => <Button variant="outline" size="sm" onClick={() => setDetail(r)} className="h-7 gap-1 text-[12px]"><Eye className="size-3.5" />Xem chi tiết</Button>, className: "text-center" },
  ]

  return (
    <div className="space-y-4">
      <ReportHeader title="Báo cáo cảnh báo bất thường truy cập hồ sơ lưu trữ" desc="Thống kê, quản lý và tra cứu danh sách các cảnh báo bất thường khi truy cập hồ sơ công chứng lưu trữ." role={role} onRole={(r) => { setRole(r); reset() }} />

      <TimeFilterBar time={time} onTime={setTime} error={error} onApply={apply} onReset={reset}
        extra={<>
          <MultiSelect label="Tổ chức thực hiện" options={TCHNCC_LIST.map((s) => ({ value: s, label: s }))} selected={draft.toChuc} onChange={(v) => setDraft({ ...draft, toChuc: v })} emptyLabel="Tất cả" itemLabel={(n) => `${n} tổ chức`} />
          <MultiSelect label="Loại cảnh báo" options={ALERT_TYPES.map((s) => ({ value: s, label: s }))} selected={draft.loai} onChange={(v) => setDraft({ ...draft, loai: v })} emptyLabel="Tất cả" itemLabel={(n) => `${n} loại`} />
          <MultiSelect label="Mức độ cảnh báo" options={ALERT_LEVELS.map((s) => ({ value: s, label: s }))} selected={draft.mucDo} onChange={(v) => setDraft({ ...draft, mucDo: v })} emptyLabel="Tất cả" itemLabel={(n) => `${n} mức độ`} />
          {showTinh(role) && <MultiSelect label="Tỉnh/Thành phố" options={PROVINCES.map((s) => ({ value: s, label: s }))} selected={draft.tinh} onChange={(v) => setDraft({ ...draft, tinh: v })} emptyLabel="Tất cả" itemLabel={(n) => `${n} tỉnh/TP`} />}
        </>}
      />

      <div className="flex items-center justify-end">
        <Button variant="outline" size="sm" onClick={() => setLegend((v) => !v)} className="h-8 gap-1.5"><Info className="size-4" />Chú thích tham số cảnh báo</Button>
      </div>
      {legend && (
        <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
          <div className="border-b border-border px-5 py-3 text-[13px] font-semibold text-foreground-strong">Chú thích tham số cảnh báo</div>
          <table className="w-full border-collapse text-sm">
            <thead><tr className="border-b border-border bg-neutral-50"><Th>Loại cảnh báo</Th><Th className="min-w-[280px]">Chi tiết bất thường</Th><Th>Mức độ cảnh báo</Th></tr></thead>
            <tbody>{ALERT_LEGEND.map((l, i) => (
              <tr key={i} className="border-b border-neutral-100 last:border-0">
                <td className="px-4 py-3 text-[13px] font-medium text-foreground">{l.loai}</td>
                <td className="px-4 py-3 text-[13px] text-foreground-muted">{l.chiTiet}</td>
                <td className="px-4 py-3"><Badge level={l.mucDo} /></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      <ReportTable title="Danh sách cảnh báo bất thường" rows={rows} columns={columns} onExport={doExport}
        page={page} pageSize={pageSize} onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />

      {detail && <DetailModal row={detail} onClose={() => setDetail(null)} />}
    </div>
  )
}

function DetailModal({ row, onClose }: { row: AlertRow; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={onClose}>
      <div className="flex max-h-[88vh] w-full max-w-[760px] flex-col overflow-hidden rounded-xl bg-surface shadow-popover" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <span className="text-[15px] font-semibold text-foreground-strong">Chi tiết lượt xem bất thường</span>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="size-[18px]" /></Button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-foreground-subtle">Thông tin lượt xem bất thường</div>
          <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
            {[["Số công chứng", row.soCC], ["Tổ chức thực hiện", row.toChuc], ["Người xem", `${row.nguoiXem} (${row.taiKhoan})`], ["Đơn vị của người xem", row.donViNguoiXem], ["Loại cảnh báo", row.loaiCanhBao], ["Chi tiết bất thường", row.chiTietBatThuong]].map(([l, v]) => (
              <div key={l} className="flex flex-col gap-0.5 border-b border-neutral-100 py-2"><div className="text-xs text-foreground-muted">{l}</div><div className="text-[13.5px] text-foreground">{v}</div></div>
            ))}
            <div className="flex items-center gap-2 py-2"><span className="text-xs text-foreground-muted">Mức độ rủi ro:</span><Badge level={row.mucDo} /></div>
          </div>
          <div className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wide text-foreground-subtle">Danh sách lịch sử lượt xem</div>
          <div className="overflow-hidden rounded-[10px] border border-border">
            <table className="w-full border-collapse text-[13px]">
              <thead><tr className="border-b border-border bg-neutral-50"><Th className="w-11 px-3.5 py-2.5 text-center">STT</Th><Th className="px-3.5 py-2.5">Thời gian chi tiết</Th><Th className="px-3.5 py-2.5">Loại hồ sơ</Th><Th className="px-3.5 py-2.5">Địa chỉ IP</Th></tr></thead>
              <tbody>{row.lichSu.map((l, i) => (
                <tr key={i} className="border-b border-neutral-100 last:border-0">
                  <td className="px-3.5 py-2.5 text-center text-foreground-muted">{i + 1}</td>
                  <td className="px-3.5 py-2.5 tabular-nums text-foreground-muted">{l.thoiGian}</td>
                  <td className="px-3.5 py-2.5 text-foreground">{l.loaiHoSo}</td>
                  <td className="px-3.5 py-2.5 font-mono text-[12px] text-foreground-muted">{l.ip}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
        <div className="flex justify-end border-t border-border px-6 py-4"><Button variant="outline" onClick={onClose}>Đóng</Button></div>
      </div>
    </div>
  )
}
