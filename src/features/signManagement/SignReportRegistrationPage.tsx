import { useMemo, useState } from "react"
import { BarChart3, Download, LayoutGrid, Table2 } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { setCurrentRole, useCurrentRole } from "@/features/notifications/config"
import { EmptyState, PageHeader, Th } from "../ingestion/shared"
import { ExportReportDialog } from "./dialogs"
import { NOTI_ROLES, canViewReports, signsInScope, useSigns, type ChuKySo, type SignOwnerType, type SignRole, type SignStatus } from "./config"

const GROUPS: { key: string; label: string; statuses: SignStatus[]; color: string }[] = [
  { key: "moi", label: "Mới đăng ký", statuses: ["LUU_NHAP", "CHO_DUYET", "DA_TU_CHOI"], color: "#f59e0b" },
  { key: "duyet", label: "Đã duyệt", statuses: ["DA_PHE_DUYET", "CO_HIEU_LUC", "DA_HET_HAN"], color: "#10b981" },
  { key: "huy", label: "Đã hủy", statuses: ["DA_HUY"], color: "#71717a" },
  { key: "khoa", label: "Đã khóa", statuses: ["DA_KHOA"], color: "#db2777" },
]

export function SignReportRegistrationPage() {
  const navigate = useNavigate()
  const role = useCurrentRole()
  const all = useSigns()
  const [tab, setTab] = useState<SignOwnerType>("TCHNCC")
  const [mode, setMode] = useState<"table" | "chart">("table")
  const [exporting, setExporting] = useState(false)

  const scoped = useMemo(() => signsInScope(role).filter((s) => !s.deleted), [all, role])
  const byTab = (t: SignOwnerType) => scoped.filter((s) => s.loaiChuThe === t)

  const orgActive = byTab("TCHNCC").filter((s) => s.trangThai === "CO_HIEU_LUC").length
  const ccvActive = byTab("CCV").filter((s) => s.trangThai === "CO_HIEU_LUC").length

  const rows = useMemo(() => {
    const list = byTab(tab)
    return GROUPS.map((g) => ({ ...g, count: list.filter((s: ChuKySo) => g.statuses.includes(s.trangThai)).length }))
  }, [scoped, tab])
  const total = rows.reduce((s, r) => s + r.count, 0)
  const maxCount = Math.max(1, ...rows.map((r) => r.count))

  const goList = (loaiChuThe: SignOwnerType, trangThai: string) => navigate(`/ccv-tchncc/thong-tin-chu-ky-so?loaiChuThe=${loaiChuThe}&trangThai=${trangThai}`)

  return (
    <div className="space-y-4">
      <PageHeader title="Báo cáo đăng ký chữ ký số" desc="Thống kê tình hình đăng ký và hiệu lực chữ ký số của CCV và TCHNCC thuộc phạm vi quản lý."
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
        <EmptyState icon={<BarChart3 className="size-6" />} title="Không có quyền truy cập" desc="Vai trò hiện tại không được gán quyền xem báo cáo đăng ký chữ ký số." />
      ) : (
      <>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-[14px] border border-border bg-surface p-4 shadow-sm">
          <div className="text-xs font-medium text-foreground-muted">CKS Công chứng viên đang có hiệu lực</div>
          <div className="mt-1 text-[28px] font-semibold tabular-nums text-[#047857]">{ccvActive}</div>
          <button className="mt-1 text-[12.5px] text-link hover:underline" onClick={() => goList("CCV", "CO_HIEU_LUC")}>Xem danh sách</button>
        </div>
        <div className="rounded-[14px] border border-border bg-surface p-4 shadow-sm">
          <div className="text-xs font-medium text-foreground-muted">CKS Tổ chức HNCC đang có hiệu lực</div>
          <div className="mt-1 text-[28px] font-semibold tabular-nums text-[#047857]">{orgActive}</div>
          <button className="mt-1 text-[12.5px] text-link hover:underline" onClick={() => goList("TCHNCC", "CO_HIEU_LUC")}>Xem danh sách</button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button onClick={() => setTab("TCHNCC")} className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-medium ${tab === "TCHNCC" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-foreground-muted"}`}>Tổ chức HNCC</button>
          <button onClick={() => setTab("CCV")} className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-medium ${tab === "CCV" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-foreground-muted"}`}>Công chứng viên</button>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant={mode === "table" ? "default" : "outline"} onClick={() => setMode("table")}><Table2 className="size-3.5" />Bảng</Button>
          <Button size="sm" variant={mode === "chart" ? "default" : "outline"} onClick={() => setMode("chart")}><LayoutGrid className="size-3.5" />Biểu đồ cột</Button>
        </div>
      </div>

      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        {total === 0 ? (
          <EmptyState icon={<BarChart3 className="size-6" />} title="Không có dữ liệu" desc="Không có dữ liệu báo cáo đăng ký chữ ký số." />
        ) : mode === "table" ? (
          <table className="w-full border-collapse text-sm">
            <thead><tr className="border-b border-border bg-neutral-50"><Th>Trạng thái</Th><Th className="text-right">Số lượng</Th></tr></thead>
            <tbody>{rows.map((r) => (
              <tr key={r.key} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3"><button className="text-link hover:underline" onClick={() => goList(tab, r.statuses[0])}>{r.label}</button></td>
                <td className="px-4 py-3 text-right tabular-nums text-foreground">{r.count}</td>
              </tr>
            ))}</tbody>
          </table>
        ) : (
          <div className="flex h-[220px] items-end gap-6 px-4">
            {rows.map((r) => (
              <button key={r.key} className="flex flex-1 flex-col items-center gap-2" onClick={() => goList(tab, r.statuses[0])} title={`${r.label}: ${r.count}`}>
                <div className="text-[12.5px] font-semibold text-foreground">{r.count}</div>
                <div className="w-full rounded-t-md" style={{ height: `${(r.count / maxCount) * 160 + 4}px`, background: r.color }} />
                <div className="text-[11.5px] text-foreground-muted">{r.label}</div>
              </button>
            ))}
          </div>
        )}
      </div>
      </>
      )}

      {exporting && <ExportReportDialog tenBaoCao="Báo cáo đăng ký chữ ký số" dieuKien={`Loại chủ thể: ${tab === "TCHNCC" ? "Tổ chức HNCC" : "Công chứng viên"}`} count={total} onClose={() => setExporting(false)} />}
    </div>
  )
}
