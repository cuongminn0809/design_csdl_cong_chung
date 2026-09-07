import { useMemo, useState } from "react"
import { Download, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { useToast } from "@/features/reconciliation/components/Toast"
import { EmptyState, PageHeader, Th, inputCls } from "../ingestion/shared"
import { setCurrentRole, useCurrentRole } from "@/features/notifications/config"
import {
  CCV_STATUS_OPTIONS, GENDERS, NOTI_ROLES, ORG_HOME_PROVINCE, activeOrgsIn, canExportCcv, canViewStatsProvince,
  ccvsInScope, orgNameOf, useCcvs, useOrgs, type CcvRole,
} from "./config"

const AGE_GROUPS = ["Dưới 30", "30-45", "46-60", "Trên 60"]
const ageOf = (ngaySinh?: string) => { if (!ngaySinh) return -1; const y = Number(ngaySinh.slice(0, 4)); return 2026 - y }
const ageGroupOf = (ngaySinh?: string) => { const a = ageOf(ngaySinh); if (a < 0) return ""; if (a < 30) return "Dưới 30"; if (a <= 45) return "30-45"; if (a <= 60) return "46-60"; return "Trên 60" }

type Filters = { toChuc: string; trangThai: string; gioiTinh: string; tuoi: string; tuNgay: string; denNgay: string }
const EMPTY: Filters = { toChuc: "all", trangThai: "all", gioiTinh: "all", tuoi: "all", tuNgay: "", denNgay: "" }

export function CcvStatsProvincePage() {
  const role = useCurrentRole()
  const showToast = useToast()
  useCcvs()
  const allOrgs = useOrgs()
  const [draft, setDraft] = useState(EMPTY)
  const [applied, setApplied] = useState(EMPTY)

  const scoped = ccvsInScope(role)
  const orgsInScope = activeOrgsIn(ORG_HOME_PROVINCE, allOrgs)

  const filtered = useMemo(() => {
    let r = scoped
    if (applied.toChuc !== "all") r = r.filter((c) => (applied.toChuc === "__none__" ? !c.toChucCongChungId : c.toChucCongChungId === applied.toChuc))
    if (applied.trangThai !== "all") r = r.filter((c) => c.trangThai === applied.trangThai)
    if (applied.gioiTinh !== "all") r = r.filter((c) => c.gioiTinh === applied.gioiTinh)
    if (applied.tuoi !== "all") r = r.filter((c) => ageGroupOf(c.ngaySinh) === applied.tuoi)
    if (applied.tuNgay) r = r.filter((c) => (c.ngayCapNhat ?? c.ngayTao).slice(0, 10) >= applied.tuNgay)
    if (applied.denNgay) r = r.filter((c) => (c.ngayCapNhat ?? c.ngayTao).slice(0, 10) <= applied.denNgay)
    return r
  }, [scoped, applied])

  const total = filtered.length
  const hanhNghe = filtered.filter((c) => c.trangThai === "Đang hành nghề").length
  const tamDinhChi = filtered.filter((c) => c.trangThai === "Tạm đình chỉ hành nghề").length
  const mienNhiem = filtered.filter((c) => c.trangThai === "Đã miễn nhiệm").length

  const byOrg = useMemo(() => {
    const groups = new Map<string, typeof filtered>()
    for (const c of filtered) {
      const key = c.toChucCongChungId ?? "__none__"
      if (!groups.has(key)) groups.set(key, [] as typeof filtered)
      groups.get(key)!.push(c)
    }
    const rows = Array.from(groups.entries()).map(([key, list]) => ({
      key, ten: key === "__none__" ? "Chưa gắn TCHNCC" : (orgNameOf(key) ?? key),
      tong: list.length,
      hanhNghe: list.filter((c) => c.trangThai === "Đang hành nghề").length,
      tamDinhChi: list.filter((c) => c.trangThai === "Tạm đình chỉ hành nghề").length,
      mienNhiem: list.filter((c) => c.trangThai === "Đã miễn nhiệm").length,
    }))
    return rows.sort((a, b) => b.tong - a.tong)
  }, [filtered])

  const doSearch = () => setApplied(draft)
  const doReset = () => { setDraft(EMPTY); setApplied(EMPTY) }
  const doExport = () => showToast(total ? "Xuất báo cáo thống kê CCV thành công." : "Không có dữ liệu thống kê Công chứng viên.", total ? "ok" : "error")

  return (
    <div className="space-y-4">
      <PageHeader title="Thống kê CCV trên địa bàn" desc="Theo dõi số lượng và trạng thái công chứng viên trên địa bàn."
        actions={
          <div className="flex items-center gap-2.5">
            <span className="text-[12.5px] text-foreground-muted">Vai trò:</span>
            <NativeSelect value={role} onChange={(e) => setCurrentRole(e.target.value as CcvRole)} className="h-8 w-[220px] text-[12.5px]">
              {NOTI_ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </NativeSelect>
          </div>
        } />

      {!canViewStatsProvince(role) ? (
        <EmptyState icon={<Search className="size-6" />} title="Không có quyền truy cập" desc="Vai trò hiện tại không được gán quyền xem thống kê công chứng viên trên địa bàn." />
      ) : (
        <>
          <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Tổ chức công chứng</label>
                <NativeSelect value={draft.toChuc} onChange={(e) => setDraft((d) => ({ ...d, toChuc: e.target.value }))}>
                  <option value="all">Tất cả</option><option value="__none__">Chưa gắn TCHNCC</option>
                  {orgsInScope.map((o) => <option key={o.id} value={o.id}>{o.ten}</option>)}
                </NativeSelect>
              </div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Trạng thái</label>
                <NativeSelect value={draft.trangThai} onChange={(e) => setDraft((d) => ({ ...d, trangThai: e.target.value }))}><option value="all">Tất cả</option>{CCV_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}</NativeSelect>
              </div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Giới tính</label>
                <NativeSelect value={draft.gioiTinh} onChange={(e) => setDraft((d) => ({ ...d, gioiTinh: e.target.value }))}><option value="all">Tất cả</option>{GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}</NativeSelect>
              </div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Tuổi</label>
                <NativeSelect value={draft.tuoi} onChange={(e) => setDraft((d) => ({ ...d, tuoi: e.target.value }))}><option value="all">Tất cả</option>{AGE_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}</NativeSelect>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Từ ngày</label><input type="date" value={draft.tuNgay} onChange={(e) => setDraft((d) => ({ ...d, tuNgay: e.target.value }))} className={inputCls} /></div>
                <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Đến ngày</label><input type="date" value={draft.denNgay} onChange={(e) => setDraft((d) => ({ ...d, denNgay: e.target.value }))} className={inputCls} /></div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <Button onClick={doSearch}><Search className="size-4" />Xem thống kê</Button>
              <Button variant="outline" onClick={doReset}>Reset</Button>
              {canExportCcv(role) && <Button variant="outline" onClick={doExport}><Download className="size-4" />Xuất Excel</Button>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[["Tổng CCV", total, "#111827"], ["Đang hành nghề", hanhNghe, "#047857"], ["Tạm đình chỉ hành nghề", tamDinhChi, "#b45309"], ["Đã miễn nhiệm", mienNhiem, "#b91c1c"]].map(([label, val, color]) => (
              <div key={label as string} className="rounded-[14px] border border-border bg-surface p-4 shadow-sm">
                <div className="text-xs font-medium text-foreground-muted">{label}</div>
                <div className="mt-1 text-[26px] font-semibold tabular-nums" style={{ color: color as string }}>{val}</div>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
            {byOrg.length ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead><tr className="border-b border-border bg-neutral-50"><Th>Tổ chức công chứng</Th><Th className="text-right">Tổng số</Th><Th className="text-right">Hành nghề</Th><Th className="text-right">Tạm đình chỉ</Th><Th className="text-right">Miễn nhiệm</Th><Th className="text-right">Tỷ lệ</Th></tr></thead>
                  <tbody>{byOrg.map((r) => (
                    <tr key={r.key} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                      <td className="px-4 py-3 font-medium text-foreground">{r.ten}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-foreground-muted">{r.tong}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-foreground-muted">{r.hanhNghe}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-foreground-muted">{r.tamDinhChi}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-foreground-muted">{r.mienNhiem}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-foreground-muted">{total ? ((r.tong / total) * 100).toFixed(2) : "0.00"}%</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            ) : (
              <EmptyState icon={<Search className="size-6" />} title="Không có dữ liệu" desc="Không có dữ liệu thống kê Công chứng viên." />
            )}
          </div>
        </>
      )}
    </div>
  )
}
