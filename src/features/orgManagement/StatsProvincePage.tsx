import { useMemo, useState } from "react"
import { ArrowDown, ArrowUp, ArrowUpDown, BarChart3, Search } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { setCurrentRole, useCurrentRole } from "@/features/notifications/config"
import { EmptyState, PageHeader, Th, inputCls } from "../ingestion/shared"
import { SimplePagination } from "./shared"
import {
  NOTI_ROLES, ORG_HOME_PROVINCE, ORG_STATUSES, ORG_TYPES, STATUS_BADGE, canViewStatsProvince, fmtVNDateTime,
  ordersInScope, wardsOf, type OrgRole, type OrgStatus, type OrgType,
} from "./config"

type SortKey = "ten" | "ngayCapNhat"
type Filters = { loaiHinh: "all" | OrgType; trangThai: "all" | OrgStatus; phuongXa: "all" | string; tuNgay: string; denNgay: string }
const EMPTY: Filters = { loaiHinh: "all", trangThai: "all", phuongXa: "all", tuNgay: "", denNgay: "" }

export function StatsProvincePage() {
  const navigate = useNavigate()
  const role = useCurrentRole()
  const [draft, setDraft] = useState(EMPTY)
  const [applied, setApplied] = useState(EMPTY)
  const [error, setError] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("ngayCapNhat")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)

  const canView = canViewStatsProvince(role)
  const scoped = ordersInScope(role)

  const filtered = useMemo(() => {
    let r = scoped
    if (applied.loaiHinh !== "all") r = r.filter((o) => o.loaiHinh === applied.loaiHinh)
    if (applied.trangThai !== "all") r = r.filter((o) => o.trangThai === applied.trangThai)
    if (applied.phuongXa !== "all") r = r.filter((o) => o.phuongXa === applied.phuongXa)
    if (applied.tuNgay) r = r.filter((o) => o.ngayCapNhat.slice(0, 10) >= applied.tuNgay)
    if (applied.denNgay) r = r.filter((o) => o.ngayCapNhat.slice(0, 10) <= applied.denNgay)
    return r
  }, [scoped, applied])

  const counts = useMemo(() => {
    const c: Record<OrgStatus, number> = Object.fromEntries(ORG_STATUSES.map((s) => [s, 0])) as Record<OrgStatus, number>
    filtered.forEach((o) => { c[o.trangThai]++ })
    return c
  }, [filtered])
  const totalCount = filtered.length

  const rows = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => {
      const cmp = sortKey === "ten" ? a.ten.localeCompare(b.ten) : a.ngayCapNhat.localeCompare(b.ngayCapNhat)
      return sortDir === "asc" ? cmp : -cmp
    })
    return sorted
  }, [filtered, sortKey, sortDir])

  const doSearch = () => {
    if (draft.tuNgay && draft.denNgay && draft.tuNgay > draft.denNgay) return setError("Khoảng thời gian không hợp lệ.")
    setError(""); setApplied(draft); setPage(1)
  }
  const doReset = () => { setDraft(EMPTY); setApplied(EMPTY); setError(""); setSortKey("ngayCapNhat"); setSortDir("desc"); setPage(1) }
  const toggleSort = (key: SortKey) => { if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc")); else { setSortKey(key); setSortDir(key === "ten" ? "asc" : "desc") }; setPage(1) }
  const sortIcon = (key: SortKey) => sortKey !== key ? <ArrowUpDown className="size-3 text-foreground-subtle" /> : sortDir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />

  const pageSize = 10
  const paged = rows.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="space-y-4">
      <PageHeader title="Thống kê TCHNCC trên địa bàn" desc={`Thống kê tổ chức hành nghề công chứng thuộc địa bàn ${ORG_HOME_PROVINCE}.`}
        actions={
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] text-foreground-muted">Vai trò:</span>
            <NativeSelect value={role} onChange={(e) => setCurrentRole(e.target.value as OrgRole)} className="h-8 w-[220px] text-[12.5px]">
              {NOTI_ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </NativeSelect>
          </div>
        } />

      {!canView ? (
        <EmptyState icon={<BarChart3 className="size-6" />} title="Không có quyền truy cập" desc="Chỉ Chuyên viên Sở Tư pháp và Lãnh đạo phòng chuyên môn của STP được xem thống kê địa bàn." />
      ) : (
        <>
          <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Loại hình</label>
                <NativeSelect value={draft.loaiHinh} onChange={(e) => setDraft((d) => ({ ...d, loaiHinh: e.target.value as Filters["loaiHinh"] }))}><option value="all">Tất cả</option>{ORG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</NativeSelect>
              </div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Trạng thái</label>
                <NativeSelect value={draft.trangThai} onChange={(e) => setDraft((d) => ({ ...d, trangThai: e.target.value as Filters["trangThai"] }))}><option value="all">Tất cả</option>{ORG_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</NativeSelect>
              </div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Phường/Xã</label>
                <NativeSelect value={draft.phuongXa} onChange={(e) => setDraft((d) => ({ ...d, phuongXa: e.target.value }))}><option value="all">Tất cả</option>{wardsOf(ORG_HOME_PROVINCE).map((w) => <option key={w} value={w}>{w}</option>)}</NativeSelect>
              </div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Từ ngày</label><input type="date" value={draft.tuNgay} onChange={(e) => { setDraft((d) => ({ ...d, tuNgay: e.target.value })); setError("") }} className={inputCls} /></div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Đến ngày</label><input type="date" value={draft.denNgay} onChange={(e) => { setDraft((d) => ({ ...d, denNgay: e.target.value })); setError("") }} className={inputCls} /></div>
            </div>
            {error && <div className="mt-3 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]">{error}</div>}
            <div className="mt-4 flex gap-2.5"><Button onClick={doSearch}><Search className="size-4" />Xem thống kê</Button><Button variant="outline" onClick={doReset}>Reset</Button></div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard label="Tổng số" value={totalCount} strong />
            {ORG_STATUSES.map((s) => <StatCard key={s} label={s} value={counts[s]} />)}
          </div>

          <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
            {paged.length ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed border-collapse text-sm">
                    <thead><tr className="border-b border-border bg-neutral-50">
                      <Th className="w-[26%]"><button className="flex items-center gap-1" onClick={() => toggleSort("ten")}>Tên TCHNCC {sortIcon("ten")}</button></Th>
                      <Th className="w-[18%]">Loại hình</Th>
                      <Th className="w-[18%]">Phường/Xã</Th>
                      <Th className="w-[18%]">Trạng thái</Th>
                      <Th className="w-[20%]"><button className="flex items-center gap-1" onClick={() => toggleSort("ngayCapNhat")}>Ngày cập nhật {sortIcon("ngayCapNhat")}</button></Th>
                    </tr></thead>
                    <tbody>{paged.map((o) => {
                      const badge = STATUS_BADGE[o.trangThai]
                      return (
                        <tr key={o.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                          <td className="truncate px-4 py-3"><button onClick={() => navigate(`/quan-ly-thong-tin/to-chuc-hncc/${o.id}`)} className="font-medium text-link hover:underline" title={o.ten}>{o.ten}</button></td>
                          <td className="truncate px-4 py-3 text-foreground-muted">{o.loaiHinh}</td>
                          <td className="truncate px-4 py-3 text-foreground-muted">{o.phuongXa}</td>
                          <td className="px-4 py-3"><span className="inline-flex rounded-full px-2 py-0.5 text-[11.5px] font-medium" style={{ background: badge.bg, color: badge.fg }}>{o.trangThai}</span></td>
                          <td className="px-4 py-3 tabular-nums text-foreground-muted">{fmtVNDateTime(o.ngayCapNhat)}</td>
                        </tr>
                      )
                    })}</tbody>
                  </table>
                </div>
                {rows.length > 10 && <SimplePagination page={page} pageSize={pageSize} total={rows.length} onPage={setPage} />}
              </>
            ) : (
              <EmptyState icon={<BarChart3 className="size-6" />} title="Không có dữ liệu" desc="Không có tổ chức hành nghề công chứng nào phù hợp với điều kiện lọc." />
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
