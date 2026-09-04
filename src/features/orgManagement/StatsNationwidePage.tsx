import { useMemo, useState } from "react"
import { ArrowDown, ArrowUp, ArrowUpDown, Globe, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { setCurrentRole, useCurrentRole } from "@/features/notifications/config"
import { EmptyState, PageHeader, Th, inputCls } from "../ingestion/shared"
import { SimplePagination } from "./shared"
import {
  NOTI_ROLES, ORG_STATUSES, ORG_TYPES, canViewStatsNational, ordersInScope,
  type OrgRole, type OrgStatus, type OrgType, type TchnccOrg,
} from "./config"

type SortKey = "tinh" | "tong" | OrgStatus | "tyLe"
type Filters = { loaiHinh: "all" | OrgType; trangThai: "all" | OrgStatus; tuNgay: string; denNgay: string }
const EMPTY: Filters = { loaiHinh: "all", trangThai: "all", tuNgay: "", denNgay: "" }

interface ProvinceRow { tinh: string; tong: number; counts: Record<OrgStatus, number>; tyLe: number }

export function StatsNationwidePage() {
  const role = useCurrentRole()
  const [draft, setDraft] = useState(EMPTY)
  const [applied, setApplied] = useState(EMPTY)
  const [error, setError] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("tong")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)

  const canView = canViewStatsNational(role)
  const all = ordersInScope(role) // toàn quốc với vai trò cấp Bộ

  const filtered = useMemo(() => {
    let r = all
    if (applied.loaiHinh !== "all") r = r.filter((o) => o.loaiHinh === applied.loaiHinh)
    if (applied.trangThai !== "all") r = r.filter((o) => o.trangThai === applied.trangThai)
    if (applied.tuNgay) r = r.filter((o) => o.ngayCapNhat.slice(0, 10) >= applied.tuNgay)
    if (applied.denNgay) r = r.filter((o) => o.ngayCapNhat.slice(0, 10) <= applied.denNgay)
    return r
  }, [all, applied])

  const totalCount = filtered.length
  const nationalCounts = useMemo(() => {
    const c: Record<OrgStatus, number> = Object.fromEntries(ORG_STATUSES.map((s) => [s, 0])) as Record<OrgStatus, number>
    filtered.forEach((o) => { c[o.trangThai]++ })
    return c
  }, [filtered])

  const provinceRows = useMemo(() => {
    const byProvince = new Map<string, TchnccOrg[]>()
    filtered.forEach((o) => { const list = byProvince.get(o.tinhThanh) ?? []; list.push(o); byProvince.set(o.tinhThanh, list) })
    const rows: ProvinceRow[] = Array.from(byProvince.entries()).map(([tinh, list]) => {
      const counts: Record<OrgStatus, number> = Object.fromEntries(ORG_STATUSES.map((s) => [s, 0])) as Record<OrgStatus, number>
      list.forEach((o) => { counts[o.trangThai]++ })
      const tong = list.length
      return { tinh, tong, counts, tyLe: totalCount ? (tong / totalCount) * 100 : 0 }
    })
    const sorted = rows.sort((a, b) => {
      let cmp = 0
      if (sortKey === "tinh") cmp = a.tinh.localeCompare(b.tinh)
      else if (sortKey === "tong") cmp = a.tong - b.tong
      else if (sortKey === "tyLe") cmp = a.tyLe - b.tyLe
      else cmp = a.counts[sortKey] - b.counts[sortKey]
      if (cmp === 0) cmp = a.tinh.localeCompare(b.tinh)
      return sortDir === "asc" ? cmp : -cmp
    })
    return sorted
  }, [filtered, totalCount, sortKey, sortDir])

  const doSearch = () => {
    if (draft.tuNgay && draft.denNgay && draft.tuNgay > draft.denNgay) return setError("Khoảng thời gian không hợp lệ.")
    setError(""); setApplied(draft); setPage(1)
  }
  const doReset = () => { setDraft(EMPTY); setApplied(EMPTY); setError(""); setSortKey("tong"); setSortDir("desc"); setPage(1) }
  const toggleSort = (key: SortKey) => { if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc")); else { setSortKey(key); setSortDir("desc") }; setPage(1) }
  const sortIcon = (key: SortKey) => sortKey !== key ? <ArrowUpDown className="size-3 text-foreground-subtle" /> : sortDir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />

  const pageSize = 10
  const paged = provinceRows.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="space-y-4">
      <PageHeader title="Thống kê TCHNCC toàn quốc" desc="Tổng hợp số lượng và trạng thái tổ chức hành nghề công chứng trên phạm vi cả nước."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] text-foreground-muted">Vai trò:</span>
            <NativeSelect value={role} onChange={(e) => setCurrentRole(e.target.value as OrgRole)} className="h-8 w-[220px] text-[12.5px]">
              {NOTI_ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </NativeSelect>
          </div>
        } />

      {!canView ? (
        <EmptyState icon={<Globe className="size-6" />} title="Không có quyền truy cập" desc="Chỉ Lãnh đạo Bộ Tư pháp, Lãnh đạo BTP và Chuyên viên BTP được xem thống kê toàn quốc." />
      ) : (
        <>
          <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Loại hình</label>
                <NativeSelect value={draft.loaiHinh} onChange={(e) => setDraft((d) => ({ ...d, loaiHinh: e.target.value as Filters["loaiHinh"] }))}><option value="all">Tất cả</option>{ORG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</NativeSelect>
              </div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Trạng thái</label>
                <NativeSelect value={draft.trangThai} onChange={(e) => setDraft((d) => ({ ...d, trangThai: e.target.value as Filters["trangThai"] }))}><option value="all">Tất cả</option>{ORG_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</NativeSelect>
              </div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Từ ngày</label><input type="date" value={draft.tuNgay} onChange={(e) => { setDraft((d) => ({ ...d, tuNgay: e.target.value })); setError("") }} className={inputCls} /></div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Đến ngày</label><input type="date" value={draft.denNgay} onChange={(e) => { setDraft((d) => ({ ...d, denNgay: e.target.value })); setError("") }} className={inputCls} /></div>
            </div>
            {error && <div className="mt-3 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]">{error}</div>}
            <div className="mt-4 flex gap-2.5"><Button onClick={doSearch}><Search className="size-4" />Xem thống kê</Button><Button variant="outline" onClick={doReset}>Reset</Button></div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard label="Tổng số" value={totalCount} strong />
            {ORG_STATUSES.map((s) => <StatCard key={s} label={s} value={nationalCounts[s]} />)}
          </div>

          <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
            {paged.length ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead><tr className="border-b border-border bg-neutral-50">
                      <Th className="whitespace-nowrap"><button className="flex items-center gap-1" onClick={() => toggleSort("tinh")}>Tỉnh/TP {sortIcon("tinh")}</button></Th>
                      <Th className="whitespace-nowrap text-right"><button className="ml-auto flex items-center gap-1" onClick={() => toggleSort("tong")}>Tổng số {sortIcon("tong")}</button></Th>
                      {ORG_STATUSES.map((s) => (
                        <Th key={s} className="whitespace-nowrap text-right"><button className="ml-auto flex items-center gap-1" onClick={() => toggleSort(s)}>{s} {sortIcon(s)}</button></Th>
                      ))}
                      <Th className="whitespace-nowrap text-right"><button className="ml-auto flex items-center gap-1" onClick={() => toggleSort("tyLe")}>Tỷ lệ {sortIcon("tyLe")}</button></Th>
                    </tr></thead>
                    <tbody>{paged.map((p) => (
                      <tr key={p.tinh} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-foreground">{p.tinh}</td>
                        <td className="px-4 py-3 text-right tabular-nums font-medium text-foreground">{p.tong}</td>
                        {ORG_STATUSES.map((s) => <td key={s} className="px-4 py-3 text-right tabular-nums text-foreground-muted">{p.counts[s]}</td>)}
                        <td className="px-4 py-3 text-right tabular-nums text-foreground-muted">{p.tyLe.toFixed(2)}%</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
                {provinceRows.length > 10 && <SimplePagination page={page} pageSize={pageSize} total={provinceRows.length} onPage={setPage} />}
              </>
            ) : (
              <EmptyState icon={<Globe className="size-6" />} title="Không có dữ liệu" desc="Không có dữ liệu thống kê TCHNCC phù hợp với điều kiện lọc." />
            )}
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className={`rounded-[12px] border border-border p-3.5 shadow-sm ${strong ? "bg-neutral-900" : "bg-surface"}`}>
      <div className={`text-[20px] font-semibold tabular-nums ${strong ? "text-white" : "text-foreground-strong"}`}>{value.toLocaleString("vi-VN")}</div>
      <div className={`mt-0.5 text-[11.5px] leading-tight ${strong ? "text-neutral-300" : "text-foreground-muted"}`}>{label}</div>
    </div>
  )
}
