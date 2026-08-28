import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronRight, Database, Eye, FileCheck2, ShieldAlert, ShieldX } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { MultiSelect } from "@/features/reconciliation/components/MultiSelect"
import { PageHeader, Th } from "../ingestion/shared"
import {
  CRITERIA_GROUPS, HK_ROLES, HK_TXNS, MONTHS, VPPC_NAME, YEARS,
  canAccess, countCriterion, countGroup, filterByPeriod, overviewStats,
  type HkRole,
} from "./config"

export function HauKiemDashboardPage() {
  const navigate = useNavigate()
  const [role, setRole] = useState<HkRole>("ld_tchncc")
  const [year, setYear] = useState(2026)
  const [months, setMonths] = useState<string[]>([]) // rỗng = tất cả

  const monthNums = months.map(Number)
  const rows = useMemo(() => filterByPeriod(HK_TXNS, { year, months: monthNums }), [year, months])
  const stats = overviewStats(rows)

  const goList = (code: string) => {
    const p = new URLSearchParams({ criteria: code, year: String(year) })
    if (monthNums.length) p.set("months", monthNums.join(","))
    navigate(`/khai-thac-thong-tin/hau-kiem-du-lieu/danh-sach?${p.toString()}`)
  }

  const cards = [
    { label: "Tổng dữ liệu đã hậu kiểm", value: stats.tong, color: "#2563eb", bg: "#eff6ff", icon: <Database className="size-5" /> },
    { label: "Dữ liệu hợp lệ", value: stats.hopLe, color: "#047857", bg: "#ecfdf5", icon: <FileCheck2 className="size-5" /> },
    { label: "Dữ liệu không hợp lệ (cần rà soát)", value: stats.khongHopLe, color: "#b45309", bg: "#fffbeb", icon: <ShieldAlert className="size-5" /> },
  ]

  return (
    <div>
      <PageHeader
        title="Khai thác thông tin hậu kiểm dữ liệu"
        desc="Thống kê kết quả hậu kiểm dữ liệu giao dịch công chứng theo 6 nhóm tiêu chí trong phạm vi tổ chức."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] text-foreground-muted">Vai trò:</span>
            <NativeSelect value={role} onChange={(e) => setRole(e.target.value as HkRole)} className="h-8 w-[210px] text-[12.5px]">
              {HK_ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </NativeSelect>
          </div>
        }
      />

      {!canAccess(role) ? (
        <div className="flex flex-col items-center gap-3 rounded-[14px] border border-[#fecaca] bg-[#fef2f2] px-6 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-[#fee2e2] text-[#b91c1c]"><ShieldX className="size-6" /></div>
          <div className="text-[15px] font-semibold text-[#b91c1c]">Bạn không có quyền thực hiện chức năng này</div>
          <div className="max-w-md text-[13px] text-[#b91c1c]/80">Chức năng Khai thác thông tin hậu kiểm dữ liệu chỉ dành cho tài khoản Lãnh đạo TCHNCC. Vui lòng đăng nhập bằng vai trò phù hợp.</div>
        </div>
      ) : (
        <>
          {/* BỘ LỌC */}
          <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground-strong">Tên VPPC</label>
                <div className="flex h-9 items-center rounded-md border border-input bg-surface-muted px-3 text-sm text-foreground-muted">{VPPC_NAME}</div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground-strong">Năm <span className="text-[#dc2626]">*</span></label>
                <NativeSelect value={year} onChange={(e) => setYear(Number(e.target.value))}>{YEARS.map((y) => <option key={y} value={y}>{y}</option>)}</NativeSelect>
              </div>
              <MultiSelect
                label="Tháng"
                options={MONTHS.map((m) => ({ value: String(m), label: `Tháng ${m}` }))}
                selected={months}
                onChange={setMonths}
                emptyLabel="Tất cả (12 tháng)"
                itemLabel={(n) => `${n} tháng đã chọn`}
              />
            </div>
          </div>

          {/* CARD TỔNG QUAN */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {cards.map((c) => (
              <div key={c.label} className="flex items-center gap-3 rounded-[14px] border border-border bg-surface p-4 shadow-sm">
                <div className="flex size-11 items-center justify-center rounded-xl" style={{ background: c.bg, color: c.color }}>{c.icon}</div>
                <div><div className="text-[24px] font-semibold tabular-nums" style={{ color: c.color }}>{c.value.toLocaleString("vi-VN")}</div><div className="text-[12px] text-foreground-muted">{c.label}</div></div>
              </div>
            ))}
          </div>

          {/* BẢNG NHÓM TIÊU CHÍ */}
          <div className="mt-4 overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
            <div className="border-b border-border px-5 py-3 text-[13px] font-semibold text-foreground-strong">Thống kê theo nhóm tiêu chí hậu kiểm</div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-neutral-50">
                    <Th className="w-12 text-center">STT</Th>
                    <Th>Nhóm tiêu chí hậu kiểm</Th>
                    <Th className="w-[150px] text-center">Giao dịch vi phạm</Th>
                    <Th className="w-[150px] text-center">Thao tác</Th>
                  </tr>
                </thead>
                <tbody>
                  {CRITERIA_GROUPS.map((g, gi) => (
                    <GroupRows key={g.code} group={g} index={gi + 1} groupCount={countGroup(rows, g)} childCount={(code) => countCriterion(rows, code)} onList={goList} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function GroupRows({ group, index, groupCount, childCount, onList }: {
  group: (typeof CRITERIA_GROUPS)[number]; index: number; groupCount: number
  childCount: (code: string) => number; onList: (code: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <tr className="border-b border-neutral-100 hover:bg-neutral-50">
        <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{index}</td>
        <td className="px-4 py-3">
          <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 text-left text-[13.5px] font-medium text-foreground-strong">
            <ChevronRight className={cn("size-4 shrink-0 text-foreground-muted transition-transform", open && "rotate-90")} />
            {group.label}
          </button>
        </td>
        <td className="px-4 py-3 text-center tabular-nums font-semibold text-foreground">{groupCount}</td>
        <td className="px-4 py-3 text-center">
          <ListBtn onClick={() => onList(group.code)} />
        </td>
      </tr>
      {open && group.children.map((c) => (
        <tr key={c.code} className="border-b border-neutral-100 bg-neutral-50/40">
          <td></td>
          <td className="py-2.5 pl-11 pr-4 text-[13px] text-foreground-muted">{c.label}</td>
          <td className="px-4 py-2.5 text-center tabular-nums text-foreground">{childCount(c.code)}</td>
          <td className="px-4 py-2.5 text-center"><ListBtn onClick={() => onList(c.code)} /></td>
        </tr>
      ))}
    </>
  )
}

function ListBtn({ onClick }: { onClick: () => void }) {
  return <Button variant="outline" size="sm" onClick={onClick} className="h-7 gap-1 text-[12px]"><Eye className="size-3.5" />Xem danh sách</Button>
}
