import { useMemo, useState } from "react"
import { BarChart3, Download } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { setCurrentRole, useCurrentRole } from "@/features/notifications/config"
import { EmptyState, PageHeader } from "../ingestion/shared"
import { ExportReportDialog } from "./dialogs"
import { NOTI_ROLES, canViewReports, isExpiringSoon, signsInScope, TODAY_ISO, useAlertConfig, useSigns, type SignRole } from "./config"

const YEARS = [2023, 2024, 2025, 2026]

export function SignReportExpiredPage() {
  const navigate = useNavigate()
  const role = useCurrentRole()
  const all = useSigns()
  const alertConfig = useAlertConfig()
  const [year, setYear] = useState(2026)
  const [applied, setApplied] = useState(2026)
  const [exporting, setExporting] = useState(false)

  const scoped = useMemo(() => signsInScope(role).filter((s) => !s.deleted), [all, role])

  const expiredInYear = useMemo(() => scoped.filter((s) => s.trangThai === "DA_HET_HAN" && new Date(s.ngayHetHan).getFullYear() === applied), [scoped, applied])
  const expiringSoon = useMemo(() => scoped.filter((s) => isExpiringSoon(s)), [scoped, alertConfig])
  const expiredNotRenewed = useMemo(() => scoped.filter((s) => s.trangThai === "DA_HET_HAN"), [scoped])

  const soonEnd = new Date(new Date(TODAY_ISO).getTime() + alertConfig.soNgayCanhBao * 86400000).toISOString().slice(0, 10)

  const goList = (trangThai: string, tuNgay?: string, denNgay?: string) => {
    const p = new URLSearchParams({ trangThai })
    if (tuNgay) p.set("tuNgayHetHan", tuNgay)
    if (denNgay) p.set("denNgayHetHan", denNgay)
    navigate(`/ccv-tchncc/thong-tin-chu-ky-so?${p.toString()}`)
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Báo cáo chữ ký số hết hạn theo kỳ" desc="Theo dõi số lượng chữ ký số đã hết hạn, sắp hết hạn và hết hạn chưa gia hạn trong phạm vi quản lý."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[12.5px] text-foreground-muted">Vai trò:</span>
            <NativeSelect value={role} onChange={(e) => setCurrentRole(e.target.value as SignRole)} className="h-8 w-[220px] text-[12.5px]">
              {NOTI_ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </NativeSelect>
            {canViewReports(role) && <Button variant="outline" onClick={() => setExporting(true)}><Download className="size-4" />Xuất báo cáo</Button>}
          </div>
        } />

      {!canViewReports(role) ? (
        <EmptyState icon={<BarChart3 className="size-6" />} title="Không có quyền truy cập" desc="Vai trò hiện tại không được gán quyền xem báo cáo chữ ký số hết hạn." />
      ) : (
      <>
      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Năm</label>
            <NativeSelect value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-[140px]">{YEARS.map((y) => <option key={y} value={y}>{y}</option>)}</NativeSelect>
          </div>
          <Button onClick={() => setApplied(year)}>Tìm kiếm</Button>
          <Button variant="outline" onClick={() => { setYear(2026); setApplied(2026) }}>Đặt lại</Button>
        </div>
      </div>

      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="text-xs font-medium text-foreground-muted">Số lượng chữ ký số đã hết hạn — năm {applied}</div>
        <div className="mt-1 text-[32px] font-semibold tabular-nums text-[#c2410c]">{expiredInYear.length}</div>
        <button className="mt-1 text-[12.5px] text-link hover:underline" onClick={() => goList("DA_HET_HAN", `${applied}-01-01`, `${applied}-12-31`)}>Xem danh sách</button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-[14px] border border-border bg-surface p-4 shadow-sm">
          <div className="text-xs font-medium text-foreground-muted">Sắp hết hạn</div>
          <div className="text-[11px] text-foreground-muted">Trong {alertConfig.soNgayCanhBao} ngày tới</div>
          <div className="mt-1 text-[26px] font-semibold tabular-nums text-[#b45309]">{expiringSoon.length}</div>
          <button className="mt-1 text-[12.5px] text-link hover:underline" onClick={() => goList("CO_HIEU_LUC", TODAY_ISO, soonEnd)}>Xem danh sách</button>
        </div>
        <div className="rounded-[14px] border border-border bg-surface p-4 shadow-sm">
          <div className="text-xs font-medium text-foreground-muted">Hết hạn chưa gia hạn</div>
          <div className="text-[11px] text-foreground-muted">Tại thời điểm xem</div>
          <div className="mt-1 text-[26px] font-semibold tabular-nums text-[#c2410c]">{expiredNotRenewed.length}</div>
          <button className="mt-1 text-[12.5px] text-link hover:underline" onClick={() => goList("DA_HET_HAN")}>Xem danh sách</button>
        </div>
      </div>

      </>
      )}

      {exporting && <ExportReportDialog tenBaoCao="Báo cáo chữ ký số hết hạn theo kỳ" dieuKien={`Năm ${applied}`} count={expiredInYear.length} onClose={() => setExporting(false)} />}
    </div>
  )
}
