import { useMemo, useState } from "react"
import {
  BarChart3,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  RotateCcw,
  Search,
  TriangleAlert,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { JobStatus, ReconDataset } from "../types"
import { JOB_STATUS } from "../statusMeta"
import { nf } from "../format"
import { MultiSelect } from "./MultiSelect"
import { NativeSelect } from "./NativeSelect"
import { SourceBadge, StatusPill, IconButton } from "./bits"

const STATUS_FILTER: [JobStatus, string][] = [
  ["receiving", "Đang tiếp nhận"],
  ["matching", "Đang so khớp"],
  ["done", "Hoàn thành"],
  ["diff", "Hoàn thành có sai lệch"],
  ["error", "Lỗi"],
  ["cberr", "Lỗi phản hồi"],
]

interface Applied {
  keyword: string
  typeSel: string[]
  source: string
  statusSel: string[]
  from: string
  to: string
}

const EMPTY: Applied = { keyword: "", typeSel: [], source: "all", statusSel: [], from: "", to: "" }

export function JobsTab({
  data,
  onOpenJob,
}: {
  data: ReconDataset
  onOpenJob: (id: string) => void
}) {
  const [applied, setApplied] = useState<Applied>(EMPTY)
  const [draft, setDraft] = useState<Applied>(EMPTY)
  const [quickStatus, setQuickStatus] = useState<string[] | null>(null)
  const [dateError, setDateError] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const typeName = (code: string) => data.types.find((t) => t[0] === code)?.[1] ?? code

  // Phạm vi tính card = keyword/type/source (không tính status) để card phản ánh phân bổ trạng thái
  const inScopeBase = useMemo(() => {
    let rows = data.jobs.slice()
    const kw = applied.keyword.trim().toLowerCase()
    if (kw) rows = rows.filter((j) => `${j.id} ${j.packet} ${j.src} ${j.type}`.toLowerCase().includes(kw))
    if (applied.typeSel.length) rows = rows.filter((j) => applied.typeSel.includes(j.type))
    if (applied.source !== "all") rows = rows.filter((j) => j.src === applied.source)
    return rows
  }, [data.jobs, applied])

  const cnt = (fn: (j: (typeof data.jobs)[number]) => boolean) => inScopeBase.filter(fn).length

  const cards = [
    { label: "Tổng job", count: inScopeBase.length, hint: "Trong phạm vi bộ lọc", color: "#2563eb", bg: "#eff6ff", quick: null as string[] | null, icon: <BarChart3 className="size-4" /> },
    { label: "Khớp hoàn toàn", count: cnt((j) => j.status === "done"), hint: "status = Hoàn thành", color: "#16a34a", bg: "#f0fdf4", quick: ["done"], icon: <Check className="size-4" /> },
    { label: "Có sai lệch", count: cnt((j) => j.status === "diff"), hint: "Hoàn thành có sai lệch", color: "#ea580c", bg: "#fff7ed", quick: ["diff"], icon: <TriangleAlert className="size-4" /> },
    { label: "Lỗi", count: cnt((j) => j.status === "error" || j.status === "cberr"), hint: "Lỗi / Lỗi phản hồi", color: "#dc2626", bg: "#fef2f2", quick: ["error", "cberr"], icon: <X className="size-4" /> },
  ]

  // Danh sách đã lọc đầy đủ (gồm status / quick status)
  const filtered = useMemo(() => {
    let rows = inScopeBase.slice()
    const statuses = quickStatus ?? applied.statusSel
    if (statuses.length) rows = rows.filter((j) => statuses.includes(j.status))
    return rows
  }, [inScopeBase, applied.statusSel, quickStatus])

  const total = filtered.length
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const curPage = Math.min(page, pages)
  const start = (curPage - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)

  const doSearch = () => {
    if (draft.from && draft.to && draft.to < draft.from) {
      setDateError("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu")
      return
    }
    setApplied(draft)
    setQuickStatus(null)
    setDateError("")
    setPage(1)
  }
  const doReset = () => {
    setDraft(EMPTY)
    setApplied(EMPTY)
    setQuickStatus(null)
    setDateError("")
    setPage(1)
  }
  const applyQuick = (quick: string[] | null) => {
    setQuickStatus(quick)
    setDraft((d) => ({ ...d, statusSel: quick ?? [] }))
    setApplied((a) => ({ ...a, statusSel: quick ?? [] }))
    setPage(1)
  }

  const typeOptions = data.types.map((g) => ({ value: g[0], label: `${g[1]} (${g[0]})` }))
  const sourceOptions = [
    { value: "all", label: "Tất cả nguồn" },
    ...Object.entries(data.sources).map(([id, s]) => ({ value: id, label: `[${s.sys}] ${s.name}` })),
  ]

  const pageNumbers = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === pages || Math.abs(n - curPage) <= 1
  )

  return (
    <div>
      {/* Summary cards */}
      <div className="mb-[18px] grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {cards.map((c) => {
          const active = quickStatus !== null && JSON.stringify(quickStatus) === JSON.stringify(c.quick) && c.quick !== null
          return (
            <button
              key={c.label}
              onClick={() => applyQuick(c.quick)}
              className="rounded-[14px] border bg-surface p-[16px_18px] text-left shadow-sm"
              style={{ borderColor: active ? c.color : "var(--border-color)", outline: active ? `2px solid ${c.color}22` : "none" }}
            >
              <div className="flex items-center justify-between gap-2.5">
                <span className="text-[12.5px] font-semibold text-foreground-muted">{c.label}</span>
                <span
                  className="flex size-[30px] shrink-0 items-center justify-center rounded-lg"
                  style={{ background: c.bg, color: c.color }}
                >
                  {c.icon}
                </span>
              </div>
              <div className="mt-2.5 text-[28px] font-bold tabular-nums tracking-[-0.02em] text-foreground-strong">
                {nf(c.count)}
              </div>
              <div className="mt-0.5 text-[11.5px] text-foreground-subtle">{c.hint}</div>
            </button>
          )
        })}
      </div>

      {/* Filter card */}
      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
          <input
            value={draft.keyword}
            onChange={(e) => setDraft({ ...draft, keyword: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && doSearch()}
            placeholder="Tìm theo mã job, packet_id, source_system_id, số công chứng…"
            className="h-[38px] w-full rounded-md border border-input bg-surface pl-[38px] pr-3 text-sm shadow-xs outline-none focus-visible:border-border-focus focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[230px] flex-1">
            <MultiSelect
              label={data.typeLabel}
              options={typeOptions}
              selected={draft.typeSel}
              onChange={(v) => setDraft({ ...draft, typeSel: v })}
              emptyLabel={data.typeAllLabel}
              itemLabel={(n) => `${n} loại đã chọn`}
            />
          </div>
          <div className="flex w-[220px] flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground-strong">Hệ thống nguồn</label>
            <NativeSelect value={draft.source} onChange={(e) => setDraft({ ...draft, source: e.target.value })}>
              {sourceOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </NativeSelect>
          </div>
          <MultiSelect
            label="Trạng thái job"
            width={210}
            options={STATUS_FILTER.map(([k, l]) => ({ value: k, label: l }))}
            selected={draft.statusSel}
            onChange={(v) => setDraft({ ...draft, statusSel: v })}
            emptyLabel="Tất cả trạng thái"
            itemLabel={(n) => `${n} trạng thái`}
          />
          <div className="flex w-40 flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground-strong">Ngày nhận — Từ</label>
            <input
              type="date"
              value={draft.from}
              onChange={(e) => setDraft({ ...draft, from: e.target.value })}
              className="h-9 rounded-md border border-input bg-surface px-3 text-[13.5px] shadow-xs outline-none focus-visible:border-border-focus focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>
          <div className="flex w-40 flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground-strong">Ngày nhận — Đến</label>
            <input
              type="date"
              value={draft.to}
              onChange={(e) => setDraft({ ...draft, to: e.target.value })}
              className="h-9 rounded-md border border-input bg-surface px-3 text-[13.5px] shadow-xs outline-none focus-visible:border-border-focus focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>
        </div>
        {dateError && (
          <div className="mt-2.5 flex items-center gap-1.5 text-[12.5px] text-red-600">
            <TriangleAlert className="size-3.5" />
            {dateError}
          </div>
        )}
        <div className="mt-[18px] flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" onClick={doReset}>
            Đặt lại
          </Button>
          <Button onClick={doSearch}>
            <Search className="size-4" />
            Tìm kiếm
          </Button>
        </div>
      </div>

      <div className="mx-0.5 mb-2.5 mt-[18px] flex items-center gap-2">
        <span className="text-[13px] text-foreground-muted">Kết quả:</span>
        <span className="text-[13px] font-semibold text-foreground-strong">{nf(total)} job đối soát</span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        {total > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-neutral-50">
                    <Th className="w-11 text-center">STT</Th>
                    <Th className="min-w-[210px]">Mã job đối soát</Th>
                    <Th className="min-w-[170px]">{data.typeLabel}</Th>
                    <Th className="min-w-[180px]">Hệ thống nguồn</Th>
                    <Th className="text-right">Số bản ghi</Th>
                    <Th className="min-w-[190px]">Kết quả tóm tắt</Th>
                    <Th className="min-w-[150px]">Ngày nhận</Th>
                    <Th className="min-w-[190px]">Trạng thái</Th>
                    <Th className="w-[100px] text-center">Thao tác</Th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((j, i) => {
                    const src = data.sources[j.src]
                    const onlyTotal = j.onlyWh + j.onlySrc
                    const hasSummary = j.status === "done" || j.status === "diff"
                    const meta = JOB_STATUS[j.status]
                    const bar = [
                      { c: "#22c55e", n: j.matched },
                      { c: "#f97316", n: j.mismatched },
                      { c: "#94a3b8", n: onlyTotal },
                    ].filter((s) => j.total > 0 && s.n > 0)
                    return (
                      <tr key={j.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{start + i + 1}</td>
                        <td className="px-4 py-3">
                          <div
                            onClick={() => onOpenJob(j.id)}
                            className="cursor-pointer font-mono text-[12.5px] font-semibold leading-[1.35] text-link hover:underline"
                          >
                            {j.id}
                          </div>
                          <div className="mt-0.5 font-mono text-[11px] text-foreground-subtle">{j.packet}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-[13px] leading-tight text-foreground">{typeName(j.type)}</div>
                          <div className="mt-0.5 font-mono text-[11px] text-foreground-subtle">{j.type}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-[7px]">
                            <SourceBadge sys={src.sys} />
                            <div className="min-w-0">
                              <div className="truncate text-[13px] leading-tight text-foreground">{src.name}</div>
                              <div className="font-mono text-[10.5px] text-foreground-subtle">{j.src}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium tabular-nums text-foreground">{nf(j.total)}</td>
                        <td className="px-4 py-3">
                          {hasSummary ? (
                            <>
                              <div
                                className="mb-1.5 flex h-1.5 items-stretch overflow-hidden rounded-full bg-neutral-100"
                                title={`Khớp ${j.matched} · Sai lệch ${j.mismatched} · Chỉ kho ${j.onlyWh} · Chỉ nguồn ${j.onlySrc}`}
                              >
                                {bar.map((s, k) => (
                                  <div key={k} style={{ background: s.c, flex: `${s.n} ${s.n} 0` }} />
                                ))}
                              </div>
                              <div className="flex gap-2.5 text-[11.5px] tabular-nums">
                                <span className="font-semibold text-[#16a34a]">✓ {nf(j.matched)}</span>
                                <span style={{ color: j.mismatched > 0 ? "#ea580c" : "var(--foreground-subtle)", fontWeight: j.mismatched > 0 ? 600 : 400 }}>
                                  ≠ {j.mismatched}
                                </span>
                                <span className="text-foreground-subtle">◐ {onlyTotal}</span>
                              </div>
                            </>
                          ) : (
                            <span className="text-[12.5px] text-foreground-subtle">—</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-[13px] tabular-nums text-foreground-muted">{j.recv}</td>
                        <td className="px-4 py-3">
                          <StatusPill meta={meta} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex gap-px">
                            <IconButton title="Xem chi tiết" onClick={() => onOpenJob(j.id)}>
                              <Eye className="size-[15px]" />
                            </IconButton>
                            {j.status === "cberr" && (
                              <IconButton title="Xem phản hồi callback" onClick={() => onOpenJob(j.id)}>
                                <RotateCcw className="size-[15px]" />
                              </IconButton>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-4 py-3">
              <div className="text-[13px] text-foreground-muted">
                Hiển thị{" "}
                <span className="font-medium text-foreground-strong">
                  {start + 1}–{Math.min(start + pageSize, total)}
                </span>{" "}
                trên {nf(total)} job
              </div>
              <div className="flex items-center gap-3.5">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-foreground-muted">Số dòng/trang</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(+e.target.value)
                      setPage(1)
                    }}
                    className="h-8 cursor-pointer appearance-none rounded-[7px] border border-input bg-surface pl-2.5 pr-2.5 text-[13px]"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <PageBtn disabled={curPage <= 1} onClick={() => setPage(Math.max(1, curPage - 1))}>
                    <ChevronLeft className="size-[15px]" />
                  </PageBtn>
                  {pageNumbers.map((n) => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={cn(
                        "h-8 min-w-8 rounded-[7px] border px-2 text-[13px]",
                        n === curPage
                          ? "border-neutral-900 bg-neutral-900 font-semibold text-white"
                          : "border-border bg-surface font-medium text-foreground"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                  <PageBtn disabled={curPage >= pages} onClick={() => setPage(Math.min(pages, curPage + 1))}>
                    <ChevronRight className="size-[15px]" />
                  </PageBtn>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5 px-6 py-[72px] text-center">
            <div className="mb-2 flex size-[52px] items-center justify-center rounded-full bg-surface-muted text-foreground-subtle">
              <Check className="size-6" />
            </div>
            <div className="text-[15px] font-semibold text-foreground-strong">Chưa có job đối soát nào</div>
            <div className="max-w-[420px] text-[13.5px] text-foreground-muted">
              Job được tạo tự động khi hệ thống nguồn gửi gói tin qua API. Kiểm tra tab{" "}
              <strong className="text-foreground">Thiết lập dịch vụ</strong> để xem endpoint tiếp nhận.
            </div>
            <div className="mt-3">
              <Button variant="outline" onClick={doReset}>
                Đặt lại bộ lọc
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Th({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <th className={cn("px-4 py-[11px] text-left text-xs font-semibold text-foreground-muted", className)}>
      {children}
    </th>
  )
}

function PageBtn({ disabled, onClick, children }: { disabled: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex size-8 items-center justify-center rounded-[7px] border border-border bg-surface text-foreground disabled:cursor-not-allowed disabled:text-foreground-subtle disabled:opacity-50"
    >
      {children}
    </button>
  )
}
