import { useMemo, useState } from "react"
import { BarChart3, ChevronLeft, ChevronRight, CircleCheck, Clock, ListFilter, Loader, Play, RotateCcw, Search, TriangleAlert, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { MultiSelect } from "@/features/reconciliation/components/MultiSelect"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { SourceBadge } from "@/features/reconciliation/components/bits"
import { useToast } from "@/features/reconciliation/components/Toast"
import { StatusPill, Th } from "../ingestion/shared"
import {
  ALL_SOURCES, CLEANING_RULES, GROUPS, NORMALIZATION_RULES, PROC_STATUS, buildProcesses, jobPrefix, nf,
  type Process, type ProcStatus, type Variant,
} from "./config"
import { Wizard } from "./Wizard"

const STATUS_FILTER: [ProcStatus, string][] = [
  ["pending", "Chờ xử lý"],
  ["processing", "Đang xử lý"],
  ["done", "Hoàn thành"],
  ["warn", "Hoàn thành có cảnh báo"],
  ["error", "Lỗi"],
  ["cancelled", "Đã hủy"],
]

interface Filter {
  keyword: string
  types: string[]
  statuses: string[]
  source: string
}
const EMPTY: Filter = { keyword: "", types: [], statuses: [], source: "all" }

export function ProcessingPage({ variant, dataGroup = "gdcc" }: { variant: Variant; dataGroup?: string }) {
  const showToast = useToast()
  const isClean = variant === "cleaning"
  const cfg = GROUPS[dataGroup] ?? GROUPS.gdcc
  const rules = isClean ? CLEANING_RULES : NORMALIZATION_RULES
  const processes = useMemo(() => buildProcesses(variant, cfg), [variant, cfg])

  const [draft, setDraft] = useState<Filter>(EMPTY)
  const [applied, setApplied] = useState<Filter>(EMPTY)
  const [quickStatus, setQuickStatus] = useState<string[] | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 10

  const [wizOpen, setWizOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [errFor, setErrFor] = useState<string | null>(null)
  const [histFor, setHistFor] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<{ variant: "launch" | "cancel"; name: string } | null>(null)

  const typeName = (code: string) => cfg.subtypes.find((g) => g[0] === code)?.[1] ?? code

  const scope = useMemo(() => {
    let rows = processes.slice()
    const kw = applied.keyword.trim().toLowerCase()
    if (kw) rows = rows.filter((p) => `${p.id} ${p.name} ${typeName(p.type)}`.toLowerCase().includes(kw))
    if (applied.types.length) rows = rows.filter((p) => applied.types.includes(p.type))
    if (applied.source !== "all") rows = rows.filter((p) => p.src === applied.source)
    return rows
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processes, applied])

  const filtered = useMemo(() => {
    const sts = quickStatus ?? applied.statuses
    return sts.length ? scope.filter((p) => sts.includes(p.status)) : scope
  }, [scope, applied.statuses, quickStatus])

  const cnt = (fn: (p: Process) => boolean) => scope.filter(fn).length
  const cards = [
    { label: "Tổng số", count: scope.length, color: "#2563eb", bg: "#eff6ff", quick: null as string[] | null, icon: <BarChart3 className="size-4" /> },
    { label: "Đang xử lý", count: cnt((p) => p.status === "processing"), color: "#2563eb", bg: "#eff6ff", quick: ["processing"], icon: <Loader className="size-4" /> },
    { label: "Hoàn thành", count: cnt((p) => p.status === "done" || p.status === "warn"), color: "#16a34a", bg: "#f0fdf4", quick: ["done", "warn"], icon: <CircleCheck className="size-4" /> },
    { label: "Chờ xử lý", count: cnt((p) => p.status === "pending"), color: "#737373", bg: "#f5f5f5", quick: ["pending"], icon: <Clock className="size-4" /> },
    { label: "Lỗi", count: cnt((p) => p.status === "error"), color: "#dc2626", bg: "#fef2f2", quick: ["error"], icon: <TriangleAlert className="size-4" /> },
  ]

  const total = filtered.length
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const curPage = Math.min(page, pages)
  const start = (curPage - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)
  const pageNumbers = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - curPage) <= 1)

  const detail = detailId ? processes.find((p) => p.id === detailId) ?? null : null
  const errProc = errFor ? processes.find((p) => p.id === errFor) ?? null : null
  const histProc = histFor ? processes.find((p) => p.id === histFor) ?? null : null

  const applyQuick = (quick: string[] | null) => {
    setQuickStatus(quick)
    setDraft((d) => ({ ...d, statuses: quick ?? [] }))
    setApplied((a) => ({ ...a, statuses: quick ?? [] }))
    setPage(1)
  }
  const doSearch = () => { setApplied(draft); setQuickStatus(null); setPage(1) }
  const doReset = () => { setDraft(EMPTY); setApplied(EMPTY); setQuickStatus(null); setPage(1) }

  const doConfirm = () => {
    const launch = confirm?.variant === "launch"
    setConfirm(null)
    showToast(launch ? "Tiến trình đã được khởi chạy. Hệ thống đang xử lý…" : "Đã hủy tiến trình thành công.")
  }

  return (
    <div>
      <div className="mb-[18px] flex items-end justify-between gap-5">
        <div>
          <h3 className="text-[24px] font-semibold leading-tight tracking-[-0.02em] text-foreground-strong">
            {isClean ? "Làm sạch" : "Chuẩn hóa"} dữ liệu — {cfg.groupLabel}
          </h3>
          <p className="mt-1.5 max-w-[780px] text-sm text-foreground-muted">
            {isClean
              ? "Cấu hình tham số, khởi chạy và theo dõi các tiến trình làm sạch trên dữ liệu đã thu nhận trong kho (sau B1). Mỗi lần khởi chạy tạo một tiến trình — mới nhất lên đầu."
              : "Cấu hình quy tắc, khởi chạy và theo dõi các tiến trình chuẩn hóa trên dữ liệu đã làm sạch trong kho (sau B3.1). Đơn vị cung cấp & phiên bản dữ liệu kế thừa từ batch làm sạch."}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" onClick={() => showToast("Đã làm mới danh sách tiến trình.")}>
            <RotateCcw className="size-4" />
            Làm mới
          </Button>
          <Button onClick={() => setWizOpen(true)}>
            <Play className="size-4" />
            Khởi chạy {isClean ? "làm sạch" : "chuẩn hóa"} mới
          </Button>
        </div>
      </div>

      {/* Cards */}
      <div className="mb-[18px] grid grid-cols-2 gap-3.5 md:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => {
          const active = quickStatus !== null && JSON.stringify(quickStatus) === JSON.stringify(c.quick) && c.quick !== null
          return (
            <button key={c.label} onClick={() => applyQuick(c.quick)} className="rounded-[14px] border bg-surface p-[14px_16px] text-left shadow-sm" style={{ borderColor: active ? c.color : "var(--border-color)", outline: active ? `2px solid ${c.color}22` : "none" }}>
              <div className="flex items-center justify-between gap-2.5">
                <span className="text-[12.5px] font-semibold text-foreground-muted">{c.label}</span>
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg" style={{ background: c.bg, color: c.color }}>{c.icon}</span>
              </div>
              <div className="mt-2 text-[26px] font-bold tabular-nums tracking-[-0.02em] text-foreground-strong">{nf(c.count)}</div>
            </button>
          )
        })}
      </div>

      {/* Filter */}
      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
          <input value={draft.keyword} onChange={(e) => setDraft({ ...draft, keyword: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} placeholder="Tìm theo ID tiến trình, tên loại dữ liệu…" className="h-[38px] w-full rounded-md border border-input bg-surface pl-[38px] pr-3 text-sm shadow-xs outline-none" />
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[230px] flex-1">
            <MultiSelect label="Loại dữ liệu" options={cfg.subtypes.map((g) => ({ value: g[0], label: `${g[1]} (${g[0]})` }))} selected={draft.types} onChange={(v) => setDraft({ ...draft, types: v })} emptyLabel="Tất cả loại" itemLabel={(n) => `${n} loại đã chọn`} />
          </div>
          <MultiSelect label="Trạng thái" width={230} options={STATUS_FILTER.map(([k, l]) => ({ value: k, label: l }))} selected={draft.statuses} onChange={(v) => setDraft({ ...draft, statuses: v })} emptyLabel="Tất cả trạng thái" itemLabel={(n) => `${n} trạng thái`} />
          <div className="w-[230px]">
            <label className="mb-1.5 block text-xs font-semibold text-foreground-strong">Nguồn dữ liệu</label>
            <NativeSelect value={draft.source} onChange={(e) => setDraft({ ...draft, source: e.target.value })}>
              <option value="all">Tất cả nguồn</option>
              {cfg.srcKeys.map((id) => (
                <option key={id} value={id}>[{ALL_SOURCES[id].sys}] {ALL_SOURCES[id].name}</option>
              ))}
            </NativeSelect>
          </div>
          <div className="w-40">
            <label className="mb-1.5 block text-xs font-semibold text-foreground-strong">Từ ngày</label>
            <input type="date" className="h-9 w-full rounded-md border border-input bg-surface px-3 text-[13.5px] shadow-xs" />
          </div>
          <div className="w-40">
            <label className="mb-1.5 block text-xs font-semibold text-foreground-strong">Đến ngày</label>
            <input type="date" className="h-9 w-full rounded-md border border-input bg-surface px-3 text-[13.5px] shadow-xs" />
          </div>
        </div>
        <div className="mt-[18px] flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" onClick={doReset}>Đặt lại</Button>
          <Button onClick={doSearch}>
            <Search className="size-4" />
            Tìm kiếm
          </Button>
        </div>
      </div>

      <div className="mx-0.5 mb-2.5 mt-[18px] flex items-center gap-2">
        <span className="text-[13px] text-foreground-muted">Kết quả:</span>
        <span className="text-[13px] font-semibold text-foreground-strong">{total} tiến trình</span>
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
                    <Th className="min-w-[180px]">ID tiến trình</Th>
                    <Th className="min-w-[190px]">Loại dữ liệu</Th>
                    <Th className="min-w-[150px]">Nguồn dữ liệu</Th>
                    <Th className="min-w-[200px]">Trạng thái</Th>
                    <Th className="min-w-[140px]">Thời gian tạo</Th>
                    <Th className="min-w-[180px]">Kết quả tóm tắt</Th>
                    <Th className="min-w-[200px] text-right">Thao tác</Th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((p, i) => {
                    const pct = p.total ? Math.round((p.proc / p.total) * 100) : 0
                    const src = ALL_SOURCES[p.src]
                    return (
                      <tr key={p.id} onClick={() => setDetailId(p.id)} className="cursor-pointer border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{start + i + 1}</td>
                        <td className="px-4 py-3"><span className="font-mono text-[12.5px] font-semibold text-link">{p.id}</span></td>
                        <td className="px-4 py-3 text-[13px] text-foreground">{typeName(p.type)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <SourceBadge sys={src.sys} />
                            <span className="text-[12.5px] text-foreground">{p.src}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3"><StatusPill meta={PROC_STATUS[p.status]} /></td>
                        <td className="whitespace-nowrap px-4 py-3 text-[13px] tabular-nums text-foreground-muted">{p.createdAt}</td>
                        <td className="px-4 py-3 text-[12.5px]">
                          <Summary p={p} pct={pct} />
                        </td>
                        <td className="px-4 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="inline-flex items-center gap-1">
                            <ActBtn onClick={() => setDetailId(p.id)}>Chi tiết</ActBtn>
                            {p.status === "processing" ? (
                              <ActBtn danger onClick={() => setConfirm({ variant: "cancel", name: p.name })}>Hủy</ActBtn>
                            ) : (
                              <ActBtn onClick={() => setConfirm({ variant: "launch", name: p.name })}>Chạy lại</ActBtn>
                            )}
                            {(p.status === "warn" || p.status === "error") && p.err > 0 && (
                              <ActBtn onClick={() => { setDetailId(p.id); setErrFor(p.id) }}>Xem lỗi</ActBtn>
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
                Hiển thị <span className="font-medium text-foreground-strong">{start + 1}–{Math.min(start + pageSize, total)}</span> trên {total} tiến trình
              </div>
              <div className="flex items-center gap-1">
                <PageBtn disabled={curPage <= 1} onClick={() => setPage(Math.max(1, curPage - 1))}><ChevronLeft className="size-[15px]" /></PageBtn>
                {pageNumbers.map((n) => (
                  <button key={n} onClick={() => setPage(n)} className={cn("h-8 min-w-8 rounded-[7px] border px-2 text-[13px]", n === curPage ? "border-neutral-900 bg-neutral-900 font-semibold text-white" : "border-border bg-surface font-medium text-foreground")}>{n}</button>
                ))}
                <PageBtn disabled={curPage >= pages} onClick={() => setPage(Math.min(pages, curPage + 1))}><ChevronRight className="size-[15px]" /></PageBtn>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5 px-6 py-[72px] text-center">
            <div className="mb-2 flex size-[52px] items-center justify-center rounded-full bg-surface-muted text-foreground-subtle"><Search className="size-6" /></div>
            <div className="text-[15px] font-semibold text-foreground-strong">Chưa có tiến trình {isClean ? "làm sạch" : "chuẩn hóa"} nào</div>
            <div className="max-w-[420px] text-[13.5px] text-foreground-muted">
              Nhấn <strong className="text-foreground">Khởi chạy {isClean ? "làm sạch" : "chuẩn hóa"} mới</strong> để cấu hình tham số và bắt đầu.
            </div>
            <div className="mt-3"><Button onClick={() => setWizOpen(true)}>Khởi chạy {isClean ? "làm sạch" : "chuẩn hóa"} mới</Button></div>
          </div>
        )}
      </div>

      {wizOpen && (
        <Wizard
          variant={variant}
          cfg={cfg}
          rules={rules}
          onClose={() => setWizOpen(false)}
          onLaunch={(name) => { setWizOpen(false); setConfirm({ variant: "launch", name }) }}
        />
      )}
      {detail && (
        <DetailHub
          variant={variant}
          proc={detail}
          onClose={() => setDetailId(null)}
          onErrors={() => setErrFor(detail.id)}
          onHistory={() => setHistFor(detail.id)}
          onRerun={() => setConfirm({ variant: "launch", name: detail.name })}
          onCancel={() => setConfirm({ variant: "cancel", name: detail.name })}
          onExport={() => showToast("Đang kết xuất báo cáo…")}
        />
      )}
      {errProc && <ErrorModal variant={variant} proc={errProc} onClose={() => setErrFor(null)} onExport={() => showToast("Đang kết xuất danh sách lỗi…")} />}
      {histProc && <HistoryModal variant={variant} proc={histProc} onClose={() => setHistFor(null)} />}
      {confirm && <ConfirmDialog data={confirm} onCancel={() => setConfirm(null)} onOk={doConfirm} />}
    </div>
  )
}

function Summary({ p, pct }: { p: Process; pct: number }) {
  if (p.status === "processing")
    return (
      <div className="flex items-center gap-2">
        <div className="h-1.5 max-w-[120px] flex-1 overflow-hidden rounded-full bg-neutral-100">
          <div className="h-full bg-[#3b82f6]" style={{ width: `${pct}%` }} />
        </div>
        <span className="tabular-nums text-foreground-muted">{pct}%</span>
      </div>
    )
  if (p.status === "done") return <span className="text-foreground-muted">{nf(p.proc)}/{nf(p.total)}</span>
  if (p.status === "warn") return <span className="font-medium text-[#a16207]">{nf(p.proc)}/{nf(p.total)} · {p.err} lỗi</span>
  if (p.status === "error") return <span className="font-medium text-red-600">{p.batch ? "Lỗi batch" : `${p.err} lỗi`}</span>
  if (p.status === "cancelled") return <span className="text-foreground-muted">Đã hủy</span>
  return <span className="text-foreground-muted">–</span>
}

function ActBtn({ danger, onClick, children }: { danger?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn("rounded-md border bg-surface px-[9px] py-[5px] text-xs font-medium hover:bg-surface-muted", danger ? "border-[#fecaca] text-red-600" : "border-border text-foreground")}>
      {children}
    </button>
  )
}
function PageBtn({ disabled, onClick, children }: { disabled: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled} className="flex size-8 items-center justify-center rounded-[7px] border border-border bg-surface text-foreground disabled:cursor-not-allowed disabled:text-foreground-subtle disabled:opacity-50">{children}</button>
  )
}

function DetailHub({ variant, proc, onClose, onErrors, onHistory, onRerun, onCancel, onExport }: {
  variant: Variant; proc: Process; onClose: () => void; onErrors: () => void; onHistory: () => void; onRerun: () => void; onCancel: () => void; onExport: () => void
}) {
  const showToast = useToast()
  const cfg = GROUPS[Object.keys(GROUPS).find((k) => proc.id.startsWith(jobPrefix(variant, k))) ?? "gdcc"]
  const pct = proc.total ? Math.round((proc.proc / proc.total) * 100) : 0
  const meta = PROC_STATUS[proc.status]
  const typeName = cfg.subtypes.find((g) => g[0] === proc.type)?.[1] ?? proc.type
  const src = ALL_SOURCES[proc.src]
  const info = [
    { label: "Thời gian bắt đầu", value: proc.createdAt },
    { label: "Người thực hiện", value: "admin@congchung.gov.vn" },
    { label: "Nguồn dữ liệu", value: `[${src.sys}] ${src.name}` },
    { label: "Quy tắc áp dụng", value: `${proc.rules} quy tắc` },
  ]
  const canRerun = ["pending", "done", "warn", "error", "cancelled"].includes(proc.status)
  const barColor = proc.status === "error" ? "#ef4444" : proc.status === "warn" ? "#eab308" : "#3b82f6"

  return (
    <>
      <div className="fixed inset-0 z-[110] bg-[rgba(10,10,10,0.5)]" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-[115] flex w-[900px] max-w-[96vw] flex-col bg-surface shadow-popover">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-[18px]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">Chi tiết cấu hình {variant === "cleaning" ? "làm sạch" : "chuẩn hóa"}</span>
              <StatusPill meta={meta} />
            </div>
            <div className="mt-1.5 text-[16px] font-semibold text-foreground-strong">{proc.name}</div>
            <div className="mt-0.5 font-mono text-xs text-foreground-muted">{proc.id} · {typeName}</div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="size-[18px]" /></Button>
        </div>

        <div className="flex-1 overflow-auto px-6 pb-8 pt-[22px]">
          <div className="mb-5 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-surface p-[14px_16px]">
              <div className="text-xs font-semibold text-foreground-muted">Trạng thái</div>
              <div className="mt-2.5"><StatusPill meta={meta} big /></div>
            </div>
            <div className="rounded-xl border border-border bg-surface p-[14px_16px]">
              <div className="text-xs font-semibold text-foreground-muted">Tổng bản ghi</div>
              <div className="mt-1.5 text-[24px] font-bold tabular-nums tracking-[-0.02em] text-foreground-strong">{nf(proc.total)}</div>
            </div>
            <div className="rounded-xl border border-border bg-surface p-[14px_16px]">
              <div className="text-xs font-semibold text-foreground-muted">Đã xử lý</div>
              <div className="mt-1.5 text-[24px] font-bold tabular-nums tracking-[-0.02em] text-foreground-strong">{nf(proc.proc)} <span className="text-[13px] font-medium text-foreground-muted">({pct}%)</span></div>
            </div>
          </div>

          <SectionLabel>Thông tin cơ bản</SectionLabel>
          <div className="mb-5 grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-border bg-border">
            {info.map((r) => (
              <div key={r.label} className="bg-surface px-3.5 py-[11px]">
                <div className="mb-[3px] text-[11.5px] text-foreground-muted">{r.label}</div>
                <div className="text-[13.5px] font-medium text-foreground">{r.value}</div>
              </div>
            ))}
          </div>

          <SectionLabel>Tiến độ {variant === "cleaning" ? "làm sạch" : "chuẩn hóa"}</SectionLabel>
          <div className="mb-5 rounded-[10px] border border-border bg-surface p-4">
            <div className="mb-2 flex justify-between text-[12.5px] text-foreground-muted">
              <span>{variant === "cleaning" ? "Làm sạch" : "Chuẩn hóa"} dữ liệu</span>
              <span className="font-semibold tabular-nums text-foreground-strong">{pct}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-neutral-100">
              <div className="h-full" style={{ width: `${pct}%`, background: barColor }} />
            </div>
          </div>

          {proc.err > 0 && (
            <div className="mb-5 flex items-center gap-3 rounded-[10px] border border-[#fecaca] bg-[#fef2f2] p-[13px_16px]">
              <TriangleAlert className="size-5 shrink-0 text-[#dc2626]" />
              <div className="flex-1 text-[13px] text-[#991b1b]">Có <strong>{proc.err}</strong> bản ghi lỗi cần xem xét.</div>
              <Button variant="outline" size="sm" onClick={onErrors}>Xem danh sách lỗi</Button>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => showToast("Mở Quản lý quy tắc (demo).")}>
              <ListFilter className="size-4" />
              Quản lý quy tắc
            </Button>
            <Button variant="outline" onClick={onHistory}>
              <RotateCcw className="size-4" />
              Lịch sử xử lý
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-3.5">
          <div className="flex gap-2">
            {canRerun && <Button variant="outline" onClick={onRerun}>Chạy lại quy tắc</Button>}
            {proc.status === "processing" && <Button variant="outline" onClick={onCancel}>Hủy tiến trình</Button>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onExport}>Xuất báo cáo</Button>
            <Button onClick={onClose}>Đóng</Button>
          </div>
        </div>
      </div>
    </>
  )
}

function ErrorModal({ variant, proc, onClose, onExport }: { variant: Variant; proc: Process; onClose: () => void; onExport: () => void }) {
  const cfg = GROUPS[Object.keys(GROUPS).find((k) => proc.id.startsWith(jobPrefix(variant, k))) ?? "gdcc"]
  const typeName = cfg.subtypes.find((g) => g[0] === proc.type)?.[1] ?? proc.type
  const prefix = jobPrefix(variant, cfg.key)
  const kinds: [string, string][] = [["Sai định dạng", "#dc2626"], ["Thiếu dữ liệu", "#a16207"], ["Ngoài khoảng", "#7c3aed"]]
  const rows = Array.from({ length: Math.min(proc.err || 6, 6) }, (_, i) => {
    const f = cfg.fields[i % cfg.fields.length]
    const kd = kinds[i % 3]
    return { record: `${prefix}-R${1000 + i}`, field: f[0], orig: i % 3 === 1 ? "(trống)" : `giá trị #${i + 1}`, errType: kd[0], color: kd[1], desc: `Vi phạm quy tắc ${kd[0].toLowerCase()} trên trường ${f[0]}`, suggest: i % 3 === 1 ? "Đánh dấu lỗi" : `chuẩn hóa "${f[0]}"` }
  })

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex max-h-[92vh] w-[1040px] max-w-full flex-col overflow-hidden rounded-xl bg-surface shadow-popover">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-[18px]">
          <div>
            <div className="text-[17px] font-semibold text-foreground-strong">Danh sách bản ghi lỗi</div>
            <div className="mt-0.5 text-[12.5px] text-foreground-muted">{typeName} · {proc.id}</div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="size-[18px]" /></Button>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="sticky top-0 border-b border-border bg-neutral-50">
                <Th className="px-4 py-[11px]">Mã bản ghi</Th>
                <Th className="px-4 py-[11px]">Trường dữ liệu</Th>
                <Th className="px-4 py-[11px]">Giá trị gốc</Th>
                <Th className="px-4 py-[11px]">Loại lỗi</Th>
                <Th className="min-w-[220px] px-4 py-[11px]">Mô tả lỗi</Th>
                <Th className="px-4 py-[11px]">Đề xuất</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.record} className="border-b border-neutral-100">
                  <td className="px-4 py-[11px] font-mono text-xs text-foreground">{e.record}</td>
                  <td className="px-4 py-[11px] font-mono text-xs text-foreground">{e.field}</td>
                  <td className="px-4 py-[11px] text-red-600 line-through">{e.orig}</td>
                  <td className="px-4 py-[11px]">
                    <span className="inline-block rounded-[5px] px-[7px] py-0.5 text-[10.5px] font-semibold" style={{ color: e.color, background: `${e.color}14`, border: `1px solid ${e.color}44` }}>{e.errType}</span>
                  </td>
                  <td className="px-4 py-[11px] text-[12.5px] text-foreground-muted">{e.desc}</td>
                  <td className="px-4 py-[11px] text-[12.5px] text-[#16a34a]">{e.suggest}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-3.5">
          <span className="text-[12.5px] text-foreground-muted">Hiển thị {rows.length} bản ghi lỗi</span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onExport}>Xuất danh sách lỗi</Button>
            <Button onClick={onClose}>Đóng</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function HistoryModal({ variant, proc, onClose }: { variant: Variant; proc: Process; onClose: () => void }) {
  const cfg = GROUPS[Object.keys(GROUPS).find((k) => proc.id.startsWith(jobPrefix(variant, k))) ?? "gdcc"]
  const typeName = cfg.subtypes.find((g) => g[0] === proc.type)?.[1] ?? proc.type
  const isClean = variant === "cleaning"
  const rows: { time: string; type: string; sub: string; status: ProcStatus }[] = [
    { time: proc.createdAt, type: `Khởi chạy ${isClean ? "làm sạch" : "chuẩn hóa"}`, sub: `Batch ${nf(proc.total)} bản ghi`, status: proc.status },
    { time: proc.createdAt, type: isClean ? "Áp dụng quy tắc R1–R2" : "Áp dụng quy tắc N1 (đối sánh tồn tại)", sub: isClean ? "Chuẩn định dạng, hợp lệ" : "So khớp master / parent", status: "done" },
    { time: proc.createdAt, type: isClean ? "Áp dụng quy tắc R3–R4" : "Áp dụng quy tắc N2–N3 (trùng lặp, FK)", sub: proc.err > 0 ? `${proc.err} bản ghi bị đánh dấu lỗi` : "Không có lỗi", status: proc.err > 0 ? "warn" : "done" },
    { time: proc.createdAt, type: "Tổng hợp kết quả", sub: `${nf(proc.proc)}/${nf(proc.total)} thành công`, status: proc.status },
  ]
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex max-h-[92vh] w-[720px] max-w-full flex-col overflow-hidden rounded-xl bg-surface shadow-popover">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-[18px]">
          <div>
            <div className="text-[17px] font-semibold text-foreground-strong">Lịch sử xử lý</div>
            <div className="mt-0.5 text-[12.5px] text-foreground-muted">Nguồn: {proc.src} · {typeName}</div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="size-[18px]" /></Button>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-border bg-neutral-50">
                <Th className="w-11 px-4 py-[11px] text-center">STT</Th>
                <Th className="min-w-[140px] px-4 py-[11px]">Thời gian</Th>
                <Th className="px-4 py-[11px]">Loại xử lý</Th>
                <Th className="px-4 py-[11px]">Trạng thái</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((h, i) => (
                <tr key={i} className="border-b border-neutral-100">
                  <td className="px-4 py-[11px] text-center text-foreground-muted">{i + 1}</td>
                  <td className="whitespace-nowrap px-4 py-[11px] text-[12.5px] tabular-nums text-foreground-muted">{h.time}</td>
                  <td className="px-4 py-[11px]">
                    <div className="text-[13px] text-foreground">{h.type}</div>
                    <div className="mt-0.5 text-[11.5px] text-foreground-subtle">{h.sub}</div>
                  </td>
                  <td className="px-4 py-[11px]"><StatusPill meta={PROC_STATUS[h.status]} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end border-t border-border px-6 py-3.5">
          <Button onClick={onClose}>Đóng</Button>
        </div>
      </div>
    </div>
  )
}

function ConfirmDialog({ data, onCancel, onOk }: { data: { variant: "launch" | "cancel"; name: string }; onCancel: () => void; onOk: () => void }) {
  const launch = data.variant === "launch"
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()} className="w-[460px] max-w-full rounded-xl bg-surface p-6 shadow-popover">
        <div className="flex items-start gap-3.5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full" style={{ background: launch ? "#eff6ff" : "#fef2f2", color: launch ? "#2563eb" : "#dc2626" }}>
            {launch ? <Play className="size-5" /> : <X className="size-5" />}
          </div>
          <div className="flex-1">
            <div className="text-[16px] font-semibold text-foreground-strong">{launch ? "Xác nhận khởi chạy" : "Xác nhận hủy tiến trình"}</div>
            <div className="mt-1.5 text-[13.5px] leading-normal text-foreground-muted">
              {launch
                ? `Bạn có chắc muốn khởi chạy tiến trình "${data.name}"? Hệ thống sẽ bắt đầu xử lý batch.`
                : "Hệ thống sẽ dừng tiến trình tại điểm an toàn. Dữ liệu batch đang xử lý chưa commit sẽ được rollback."}
            </div>
          </div>
        </div>
        <div className="mt-[22px] flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>Hủy bỏ</Button>
          {launch ? (
            <Button onClick={onOk}>Đồng ý</Button>
          ) : (
            <Button variant="outline" onClick={onOk}>Đồng ý, hủy tiến trình</Button>
          )}
        </div>
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">{children}</div>
}
