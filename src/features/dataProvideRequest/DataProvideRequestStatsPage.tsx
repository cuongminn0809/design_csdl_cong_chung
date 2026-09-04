import { useMemo, useState } from "react"
import { AlertTriangle, Building2, CheckCircle2, FileStack, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { EmptyState, PageHeader, Pagination, Th, inputCls } from "../ingestion/shared"
import {
  D_MINUS_2, ROLES, TCHNCC_LIST, TODAY_ISO,
  fmtVN, isDangXuLy, isHoanThanh, isTchncc, isTuChoi, scopeByRole, useRequests,
  type DprRole,
} from "./config"

const CURRENT_YEAR = 2026
const YEARS = [2026, 2025, 2024, 2023, 2022]
type PeriodKind = "ca-nam" | "theo-quy" | "theo-thang"
const pad = (n: number) => String(n).padStart(2, "0")
const lastDay = (y: number, m: number) => new Date(y, m, 0).getDate()

function resolveRange(year: number | "custom", kind: PeriodKind, month: number, quarter: number, tuNgay: string, denNgay: string) {
  if (year === "custom") return { from: tuNgay, to: denNgay }
  let from = `${year}-01-01`, to = `${year}-12-31`
  if (kind === "theo-quy") { const qm = (quarter - 1) * 3 + 1; from = `${year}-${pad(qm)}-01`; to = `${year}-${pad(qm + 2)}-${pad(lastDay(year, qm + 2))}` }
  else if (kind === "theo-thang") { from = `${year}-${pad(month)}-01`; to = `${year}-${pad(month)}-${pad(lastDay(year, month))}` }
  if (year === CURRENT_YEAR && to > D_MINUS_2) to = D_MINUS_2
  return { from, to }
}

export function DataProvideRequestStatsPage() {
  const all = useRequests()
  const [role, setRole] = useState<DprRole>("cv_stp")
  const [year, setYear] = useState<number | "custom">(CURRENT_YEAR)
  const [kind, setKind] = useState<PeriodKind>("ca-nam")
  const [month, setMonth] = useState(8)
  const [quarter, setQuarter] = useState(3)
  const [tuNgay, setTuNgay] = useState("")
  const [denNgay, setDenNgay] = useState("")
  const [org, setOrg] = useState("all")
  const [applied, setApplied] = useState({ year: CURRENT_YEAR as number | "custom", kind: "ca-nam" as PeriodKind, month: 8, quarter: 3, tuNgay: "", denNgay: "", org: "all" })
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const range = useMemo(() => resolveRange(applied.year, applied.kind, applied.month, applied.quarter, applied.tuNgay, applied.denNgay), [applied])

  const doStat = () => {
    if (year === "custom") {
      if (!tuNgay || !denNgay) return setError("Thời gian từ ngày không được lớn hơn đến ngày.")
      if (tuNgay > denNgay) return setError("Thời gian từ ngày không được lớn hơn đến ngày.")
      if (denNgay > D_MINUS_2) return setError("Đến ngày không được vượt quá ngày hiện tại - 2 ngày (do độ trễ chuẩn hóa dữ liệu).")
    }
    setError(""); setApplied({ year, kind, month, quarter, tuNgay, denNgay, org }); setPage(1)
  }

  const scoped = useMemo(() => scopeByRole(all, role), [all, role])
  const filtered = useMemo(() => {
    let r = scoped.filter((x) => !x.ngayGui || (x.ngayGui.slice(0, 10) >= range.from && x.ngayGui.slice(0, 10) <= range.to))
    if (applied.org !== "all") r = r.filter((x) => x.toChuc === applied.org)
    return r
  }, [scoped, range, applied.org])

  const c01 = new Set(filtered.map((r) => r.toChuc)).size
  const c02 = filtered.filter((r) => isHoanThanh(r.trangThai)).length
  const c03 = filtered.filter((r) => isDangXuLy(r.trangThai)).length
  const c04 = filtered.filter((r) => isHoanThanh(r.trangThai)).reduce((s, r) => s + Object.values(r.shareStatuses ?? {}).filter((v) => v === "Đã chia sẻ").length, 0)

  const tableRows = useMemo(() => {
    const orgs = isTchncc(role) ? TCHNCC_LIST.filter((o) => filtered.some((r) => r.toChuc === o)) : TCHNCC_LIST
    return orgs.map((o) => {
      const rs = filtered.filter((r) => r.toChuc === o)
      return {
        org: o, total: rs.length,
        dangXuLy: rs.filter((r) => isDangXuLy(r.trangThai)).length,
        hoanThanh: rs.filter((r) => isHoanThanh(r.trangThai)).length,
        tuChoi: rs.filter((r) => isTuChoi(r.trangThai)).length,
        gdcc: rs.filter((r) => isHoanThanh(r.trangThai)).reduce((s, r) => s + Object.values(r.shareStatuses ?? {}).filter((v) => v === "Đã chia sẻ").length, 0),
      }
    }).filter((r) => r.total > 0).sort((a, b) => b.total - a.total)
  }, [filtered, role])

  const paged = tableRows.slice((page - 1) * pageSize, page * pageSize)
  const showC01 = !isTchncc(role)

  return (
    <div className="space-y-4">
      <PageHeader title="Thống kê yêu cầu cung cấp dữ liệu" desc="Số liệu tổng hợp về số lượng yêu cầu và tình hình cung cấp dữ liệu cho các tổ chức hành nghề công chứng."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] text-foreground-muted">Vai trò:</span>
            <NativeSelect value={role} onChange={(e) => setRole(e.target.value as DprRole)} className="h-8 w-[230px] text-[12.5px]">
              {ROLES.filter((r) => r.key !== "ld_stp").map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </NativeSelect>
          </div>
        } />

      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="mb-1 text-[13px] font-semibold text-foreground-strong">Bộ lọc thống kê</div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Năm</label>
            <NativeSelect value={String(year)} onChange={(e) => setYear(e.target.value === "custom" ? "custom" : Number(e.target.value))}>
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}<option value="custom">Tùy chọn</option>
            </NativeSelect>
          </div>
          {year !== "custom" && (
            <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Loại kỳ</label>
              <NativeSelect value={kind} onChange={(e) => setKind(e.target.value as PeriodKind)}>
                <option value="ca-nam">Cả năm</option><option value="theo-quy">Theo quý</option><option value="theo-thang">Theo tháng</option>
              </NativeSelect>
            </div>
          )}
          {year !== "custom" && kind === "theo-thang" && (
            <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Chọn tháng</label>
              <NativeSelect value={month} onChange={(e) => setMonth(Number(e.target.value))}>{Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>Tháng {i + 1}</option>)}</NativeSelect>
            </div>
          )}
          {year !== "custom" && kind === "theo-quy" && (
            <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Chọn quý</label>
              <NativeSelect value={quarter} onChange={(e) => setQuarter(Number(e.target.value))}>{[1, 2, 3, 4].map((q) => <option key={q} value={q}>Quý {q}</option>)}</NativeSelect>
            </div>
          )}
          {year === "custom" && (
            <>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Từ ngày</label><input type="date" value={tuNgay} onChange={(e) => { setTuNgay(e.target.value); setError("") }} className={inputCls} /></div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Đến ngày</label><input type="date" value={denNgay} onChange={(e) => { setDenNgay(e.target.value); setError("") }} className={inputCls} /></div>
            </>
          )}
          <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">TCHNCC</label>
            <NativeSelect value={org} onChange={(e) => setOrg(e.target.value)}><option value="all">Tất cả</option>{TCHNCC_LIST.map((o) => <option key={o} value={o}>{o}</option>)}</NativeSelect>
          </div>
        </div>
        {error && <div className="mt-3 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]">{error}</div>}
        <div className="mt-3 text-[11.5px] text-foreground-subtle">Khoảng thời gian thống kê hiện tại: Từ {fmtVN(range.from || TODAY_ISO)} đến {fmtVN(range.to || TODAY_ISO)}</div>
        <div className="mt-4"><Button onClick={doStat}><Search className="size-4" />Thống kê</Button></div>
      </div>

      <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${showC01 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
        {showC01 && (
          <div className="flex items-center gap-3 rounded-[14px] border border-border bg-surface p-4 shadow-sm">
            <div className="flex size-11 items-center justify-center rounded-xl bg-[#eff6ff] text-[#2563eb]"><Building2 className="size-5" /></div>
            <div><div className="text-[22px] font-semibold tabular-nums text-[#2563eb]">{c01}</div><div className="text-[12px] text-foreground-muted">Số TCHNCC yêu cầu cung cấp dữ liệu</div></div>
          </div>
        )}
        <div className="flex items-center gap-3 rounded-[14px] border border-border bg-surface p-4 shadow-sm">
          <div className="flex size-11 items-center justify-center rounded-xl bg-[#ecfdf5] text-[#047857]"><CheckCircle2 className="size-5" /></div>
          <div><div className="text-[22px] font-semibold tabular-nums text-[#047857]">{c02}</div><div className="text-[12px] text-foreground-muted">Số yêu cầu đã hoàn thành</div></div>
        </div>
        <div className="flex items-center gap-3 rounded-[14px] border border-border bg-surface p-4 shadow-sm">
          <div className="flex size-11 items-center justify-center rounded-xl bg-[#fffbeb] text-[#b45309]"><AlertTriangle className="size-5" /></div>
          <div><div className="text-[22px] font-semibold tabular-nums text-[#b45309]">{c03}</div><div className="text-[12px] text-foreground-muted">Số yêu cầu đang xử lý</div></div>
        </div>
        <div className="flex items-center gap-3 rounded-[14px] border border-border bg-surface p-4 shadow-sm">
          <div className="flex size-11 items-center justify-center rounded-xl bg-[#ecfdf5] text-[#047857]"><FileStack className="size-5" /></div>
          <div><div className="text-[22px] font-semibold tabular-nums text-[#047857]">{c04}</div><div className="text-[12px] text-foreground-muted">Số GDCC đã hoàn thành cung cấp DL</div></div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        <div className="border-b border-border px-5 py-3 text-[13px] font-semibold text-foreground-strong">Bảng chi tiết theo TCHNCC</div>
        {paged.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead><tr className="border-b border-border bg-neutral-50">
                  <Th className="w-11 text-center">STT</Th><Th>Tên TCHNCC</Th><Th className="text-right">Tổng số yêu cầu</Th><Th className="text-right">Đang xử lý</Th><Th className="text-right">Hoàn thành</Th><Th className="text-right">Từ chối</Th><Th className="text-right">Tổng GDCC đã khôi phục</Th>
                </tr></thead>
                <tbody>{paged.map((r, i) => (
                  <tr key={r.org} className="border-b border-neutral-100">
                    <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{(page - 1) * pageSize + i + 1}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{r.org}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground">{r.total}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-[#b45309]">{r.dangXuLy}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-[#047857]">{r.hoanThanh}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-[#b91c1c]">{r.tuChoi}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-foreground-strong">{r.gdcc}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={pageSize} total={tableRows.length} unit="TCHNCC" onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
          </>
        ) : (
          <EmptyState icon={<FileStack className="size-6" />} title="Không có dữ liệu" desc="Chưa có dữ liệu thống kê theo bộ lọc đã chọn." />
        )}
      </div>
    </div>
  )
}
