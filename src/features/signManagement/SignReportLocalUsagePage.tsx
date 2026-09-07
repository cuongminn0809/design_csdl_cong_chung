import { useMemo, useState } from "react"
import { BarChart3 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { setCurrentRole, useCurrentRole } from "@/features/notifications/config"
import { EmptyState, PageHeader, Th } from "../ingestion/shared"
import { NOTI_ROLES, canViewReports, signsInScope, useSigns, type SignOwnerType, type SignRole } from "./config"

const YEARS = [2023, 2024, 2025, 2026]

function countDistinctSubjects(rows: { loaiChuThe: SignOwnerType; toChucCongChungId?: string; congChungVienId?: string; ngayTao: string }[], type: SignOwnerType, year: number) {
  const ids = new Set<string>()
  for (const r of rows) {
    if (r.loaiChuThe !== type) continue
    if (new Date(r.ngayTao).getFullYear() !== year) continue
    ids.add(type === "TCHNCC" ? (r.toChucCongChungId ?? "") : (r.congChungVienId ?? ""))
  }
  return ids.size
}

export function SignReportLocalUsagePage() {
  const role = useCurrentRole()
  const all = useSigns()
  const [year, setYear] = useState(2026)
  const [applied, setApplied] = useState(2026)

  const scoped = useMemo(() => signsInScope(role).filter((s) => !s.deleted), [all, role])

  const rows = useMemo(() => {
    const build = (type: SignOwnerType, label: string) => {
      const curCount = countDistinctSubjects(scoped, type, applied)
      const prevCount = countDistinctSubjects(scoped, type, applied - 1)
      const hasPrev = scoped.some((s) => s.loaiChuThe === type && new Date(s.ngayTao).getFullYear() === applied - 1)
      let compare: string
      if (!hasPrev) compare = "Không có dữ liệu năm trước"
      else if (curCount > prevCount) compare = `Tăng ${curCount - prevCount}`
      else if (curCount < prevCount) compare = `Giảm ${prevCount - curCount}`
      else compare = "Không thay đổi"
      return { label, curCount, compare }
    }
    return [build("CCV", "Công chứng viên"), build("TCHNCC", "Tổ chức HNCC")]
  }, [scoped, applied])

  return (
    <div className="space-y-4">
      <PageHeader title="Phân tích tỷ lệ sử dụng chữ ký số theo địa phương" desc="So sánh số lượng đăng ký chữ ký số theo năm trong phạm vi địa bàn quản lý."
        actions={
          <div className="flex items-center gap-2.5">
            <span className="text-[12.5px] text-foreground-muted">Vai trò:</span>
            <NativeSelect value={role} onChange={(e) => setCurrentRole(e.target.value as SignRole)} className="h-8 w-[220px] text-[12.5px]">
              {NOTI_ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </NativeSelect>
          </div>
        } />

      {!canViewReports(role) ? (
        <EmptyState icon={<BarChart3 className="size-6" />} title="Không có quyền truy cập" desc="Vai trò hiện tại không được gán quyền xem báo cáo phân tích theo địa phương." />
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

      <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead><tr className="border-b border-border bg-neutral-50"><Th>Đối tượng</Th><Th className="text-right">Năm {applied}</Th><Th className="text-right">So sánh với năm {applied - 1}</Th></tr></thead>
          <tbody>{rows.map((r) => (
            <tr key={r.label} className="border-b border-neutral-100 last:border-0">
              <td className="px-4 py-3 font-medium text-foreground">{r.label}</td>
              <td className="px-4 py-3 text-right tabular-nums text-foreground">{r.curCount}</td>
              <td className="px-4 py-3 text-right text-foreground-muted">{r.compare}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      </>
      )}
    </div>
  )
}
