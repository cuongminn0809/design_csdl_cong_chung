import { useMemo, useState } from "react"
import { ChevronRight, Download, Eye, ExternalLink, FileText, RotateCcw, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MultiSelect } from "@/features/reconciliation/components/MultiSelect"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { useToast } from "@/features/reconciliation/components/Toast"
import { COLLECT, LOG_SEED, LOG_STATUS, fmtBytes, fmtDur, type LogEntry } from "./data/nhatky"
import { EmptyState, IconBtn, Pagination, PageHeader, StatusPill, Th, inputCls } from "./shared"

interface Filter {
  units: string[]
  methods: string[]
  collect: string
  event: string
  statuses: string[]
}
const EMPTY: Filter = { units: [], methods: [], collect: "all", event: "", statuses: [] }

const UNITS = [...new Set(LOG_SEED.map((r) => r.unit))]
const METHODS = [...new Map(LOG_SEED.map((r) => [r.methodCode, r.method])).entries()]

export function NhatKyPage() {
  const showToast = useToast()
  const [draft, setDraft] = useState<Filter>(EMPTY)
  const [applied, setApplied] = useState<Filter>(EMPTY)
  const [from, setFrom] = useState("2026-07-08T00:00")
  const [to, setTo] = useState("2026-07-15T23:59")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [detailId, setDetailId] = useState<string | null>(null)

  // baseRows = tất cả filter trừ status (để đếm card)
  const baseRows = useMemo(() => {
    const ev = applied.event.trim().toLowerCase()
    return LOG_SEED.filter((r) => {
      if (applied.units.length && !applied.units.includes(r.unit)) return false
      if (applied.methods.length && !applied.methods.includes(r.methodCode)) return false
      if (applied.collect !== "all" && r.collect !== applied.collect) return false
      if (ev && !(r.event.toLowerCase().includes(ev) || r.req.toLowerCase().includes(ev))) return false
      return true
    })
  }, [applied])

  const filtered = baseRows.filter((r) => !applied.statuses.length || applied.statuses.includes(r.status))

  const counts = { ThanhCong: 0, ThatBai: 0, DangXuLy: 0 }
  baseRows.forEach((r) => { if (r.status in counts) counts[r.status as keyof typeof counts]++ })

  const start = (Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize))) - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)
  const detail = detailId ? LOG_SEED.find((r) => r.event === detailId) ?? null : null

  const applyCard = (statuses: string[]) => {
    setApplied((a) => ({ ...a, statuses }))
    setDraft((d) => ({ ...d, statuses }))
    setPage(1)
  }
  const doSearch = () => { setApplied(draft); setPage(1) }
  const doReset = () => { setDraft(EMPTY); setApplied(EMPTY); setPage(1) }

  const cards = [
    { label: "Tổng lượt", hint: "Trong phạm vi bộ lọc", count: baseRows.length, statuses: [] as string[], color: "#525252" },
    { label: "Thành công", hint: "status = Thành công", count: counts.ThanhCong, statuses: ["ThanhCong"], color: "#16a34a" },
    { label: "Thất bại", hint: "status = Thất bại", count: counts.ThatBai, statuses: ["ThatBai"], color: "#dc2626" },
    { label: "Đang xử lý", hint: "status = Đang xử lý", count: counts.DangXuLy, statuses: ["DangXuLy"], color: "#2563eb" },
  ]
  const cardActive = (s: string[]) => (s.length === 0 ? applied.statuses.length === 0 : applied.statuses.length === 1 && applied.statuses[0] === s[0])

  return (
    <div>
      <PageHeader
        title="Nhật ký thu thập dữ liệu"
        desc="Tra cứu log kỹ thuật mỗi lần hệ thống thu nhận dữ liệu. Mỗi dòng tương ứng một lần nhận gói tin (all-or-nothing)."
        actions={
          <>
            <Button variant="outline" onClick={() => showToast("Đã làm mới nhật ký.")}>
              <RotateCcw className="size-4" />
              Làm mới
            </Button>
            <Button onClick={() => showToast("Đang kết xuất nhật ký ra Excel…")}>
              <Download className="size-4" />
              Xuất Excel
            </Button>
          </>
        }
      />

      <div className="mb-[18px] grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {cards.map((c) => {
          const active = cardActive(c.statuses)
          return (
            <button
              key={c.label}
              onClick={() => applyCard(c.statuses)}
              className="rounded-[14px] border bg-surface p-[16px_18px] text-left shadow-sm"
              style={{ borderColor: active ? c.color : "var(--border-color)", outline: active ? `2px solid ${c.color}22` : "none" }}
            >
              <div className="flex items-center justify-between gap-2.5">
                <span className="text-[12.5px] font-semibold text-foreground-muted">{c.label}</span>
                <span className="flex size-[22px] items-center justify-center rounded-full" style={{ background: `${c.color}1a` }}>
                  <span className="size-2 rounded-full" style={{ background: c.color }} />
                </span>
              </div>
              <div className="mt-2 text-[28px] font-bold tabular-nums tracking-[-0.02em] text-foreground-strong">{c.count}</div>
              <div className="mt-0.5 text-[11.5px] text-foreground-subtle">{c.hint}</div>
            </button>
          )
        })}
      </div>

      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="w-[210px]">
            <label className="mb-1.5 block text-xs font-semibold text-foreground-strong">Thời gian — Từ</label>
            <input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} className={cn(inputCls, "text-[13.5px]")} />
          </div>
          <div className="w-[210px]">
            <label className="mb-1.5 block text-xs font-semibold text-foreground-strong">Thời gian — Đến</label>
            <input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} className={cn(inputCls, "text-[13.5px]")} />
          </div>
          <MultiSelect label="Đơn vị cung cấp" width={230} options={UNITS.map((u) => ({ value: u, label: u }))} selected={draft.units} onChange={(v) => setDraft({ ...draft, units: v })} emptyLabel="Tất cả đơn vị" itemLabel={(n) => `${n} đơn vị`} />
          <div className="w-[150px]">
            <label className="mb-1.5 block text-xs font-semibold text-foreground-strong">Hình thức</label>
            <NativeSelect value="API" disabled>
              <option value="API">API</option>
            </NativeSelect>
          </div>
          <MultiSelect label="Phương thức" width={230} options={METHODS.map(([code, name]) => ({ value: code, label: name }))} selected={draft.methods} onChange={(v) => setDraft({ ...draft, methods: v })} emptyLabel="Tất cả phương thức" itemLabel={(n) => `${n} phương thức`} />
          <MultiSelect label="Trạng thái nhận gói" width={210} options={Object.entries(LOG_STATUS).map(([k, v]) => ({ value: k, label: v.label }))} selected={draft.statuses} onChange={(v) => setDraft({ ...draft, statuses: v })} emptyLabel="Tất cả trạng thái" itemLabel={(n) => `${n} trạng thái`} />
          <div className="w-[170px]">
            <label className="mb-1.5 block text-xs font-semibold text-foreground-strong">Loại thu thập</label>
            <NativeSelect value={draft.collect} onChange={(e) => setDraft({ ...draft, collect: e.target.value })}>
              <option value="all">Tất cả</option>
              <option value="PUSH">PUSH</option>
              <option value="PULL">PULL</option>
              <option value="Manual">Manual</option>
            </NativeSelect>
          </div>
          <div className="w-[230px]">
            <label className="mb-1.5 block text-xs font-semibold text-foreground-strong">Mã sự kiện</label>
            <input value={draft.event} onChange={(e) => setDraft({ ...draft, event: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} placeholder="UUID / mã log…" className={inputCls} />
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
        <span className="text-[13px] font-semibold text-foreground-strong">{filtered.length} lần thu thập</span>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        {filtered.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-neutral-50">
                    <Th className="min-w-[150px]">Thời gian thu thập</Th>
                    <Th>Mã sự kiện</Th>
                    <Th className="min-w-[180px]">Đơn vị cung cấp</Th>
                    <Th>Hình thức</Th>
                    <Th className="min-w-[210px]">Phương thức</Th>
                    <Th>Ver</Th>
                    <Th>Loại</Th>
                    <Th>Trạng thái nhận gói</Th>
                    <Th className="text-right">Thời lượng</Th>
                    <Th className="w-16 text-center">Thao tác</Th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((r) => {
                    const col = COLLECT[r.collect]
                    return (
                      <tr key={r.event} onClick={() => setDetailId(r.event)} className="cursor-pointer border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="whitespace-nowrap px-4 py-3 tabular-nums text-foreground">{r.ts}</td>
                        <td className="px-4 py-3 font-mono text-xs text-foreground-muted">{r.event}</td>
                        <td className="max-w-[200px] px-4 py-3 text-foreground">{r.unit}</td>
                        <td className="px-4 py-3"><Badge variant="secondary">API</Badge></td>
                        <td className="px-4 py-3">
                          <div className="leading-tight text-foreground">{r.method}</div>
                          <div className="mt-0.5 font-mono text-[11px] text-foreground-subtle">{r.methodCode}</div>
                        </td>
                        <td className="px-4 py-3 font-mono text-[12.5px] text-foreground">{r.ver}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-full px-[9px] py-0.5 font-mono text-[11.5px] font-semibold" style={{ background: col.bg, color: col.fg, border: `1px solid ${col.bd}` }}>{col.label}</span>
                        </td>
                        <td className="px-4 py-3"><StatusPill meta={LOG_STATUS[r.status]} /></td>
                        <td className="px-4 py-3 text-right tabular-nums text-foreground-muted">{fmtDur(r.dur)}</td>
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <IconBtn title="Xem chi tiết" onClick={() => setDetailId(r.event)}>
                            <Eye className="size-4" />
                          </IconBtn>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={pageSize} total={filtered.length} unit="bản ghi" onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
          </>
        ) : (
          <EmptyState
            icon={<FileText className="size-6" />}
            title="Không có nhật ký"
            desc="Không tìm thấy lần thu thập nào khớp với bộ lọc hiện tại. Hãy thử điều chỉnh khoảng thời gian hoặc đặt lại bộ lọc."
            actionLabel="Đặt lại bộ lọc"
            onAction={doReset}
          />
        )}
      </div>

      {detail && <LogDetail entry={detail} onClose={() => setDetailId(null)} />}
    </div>
  )
}

function LogDetail({ entry, onClose }: { entry: LogEntry; onClose: () => void }) {
  const [showTech, setShowTech] = useState(false)
  const col = COLLECT[entry.collect]
  const fields: { label: string; value: string; link?: boolean; mono?: boolean }[] = [
    { label: "Thời gian thu thập", value: entry.ts },
    { label: "Request ID", value: entry.req, mono: true },
    { label: "Đơn vị cung cấp", value: entry.unit, link: true },
    { label: "Phương thức", value: `${entry.method} (${entry.methodCode})` },
    { label: "Phiên bản", value: entry.ver },
    { label: "Loại thu thập", value: col.label },
    { label: "HTTP status", value: entry.http == null ? "—" : String(entry.http), mono: true },
    { label: "Dung lượng gói", value: fmtBytes(entry.size) },
    { label: "Thời lượng xử lý", value: fmtDur(entry.dur) },
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex max-h-[88vh] w-[720px] max-w-full flex-col overflow-hidden rounded-xl bg-surface shadow-popover">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="min-w-0">
            <div className="mb-2 text-xs font-semibold text-foreground-muted">Chi tiết lần thu thập</div>
            <div className="flex flex-wrap items-center gap-2.5">
              <StatusPill meta={LOG_STATUS[entry.status]} big />
              <span className="rounded-[4px] border border-border bg-surface-muted px-1.5 py-0.5 font-mono text-xs text-foreground-muted">{entry.event}</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>✕</Button>
        </div>

        <div className="flex-1 overflow-auto px-6 py-[18px]">
          <div className="grid grid-cols-2 gap-x-7">
            {fields.map((f) => (
              <div key={f.label} className="flex flex-col gap-0.5 border-b border-neutral-100 py-2.5">
                <div className="text-xs text-foreground-muted">{f.label}</div>
                <div className={cn("text-[13.5px] leading-snug text-foreground", f.mono && "font-mono")}>
                  {f.link ? (
                    <a href="#" onClick={(e) => e.preventDefault()} className="inline-flex items-center gap-1.5 text-link">
                      {f.value}
                      <ExternalLink className="size-3" />
                    </a>
                  ) : (
                    f.value
                  )}
                </div>
              </div>
            ))}
          </div>

          {entry.err && (
            <div className="mt-5 overflow-hidden rounded-xl border border-[#fecaca] bg-[#fef2f2]">
              <div className="flex items-center gap-2.5 border-b border-[#fecaca] px-4 py-3.5 text-[13px] font-bold tracking-wide text-[#b91c1c]">LỖI NHẬN GÓI TIN</div>
              <div className="flex flex-col gap-3 px-4 py-3.5">
                <div className="flex gap-3.5">
                  <div className="w-[130px] flex-none text-[12.5px] text-[#b91c1c]">Mã lỗi</div>
                  <div className="font-mono text-[13px] font-semibold text-[#991b1b]">{entry.err.code}</div>
                </div>
                <div className="flex gap-3.5">
                  <div className="w-[130px] flex-none text-[12.5px] text-[#b91c1c]">Mô tả lỗi</div>
                  <div className="text-[13.5px] leading-normal text-foreground">{entry.err.msg}</div>
                </div>
                <div>
                  <button onClick={() => setShowTech((v) => !v)} className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[#b91c1c]">
                    <ChevronRight className={cn("size-3.5 transition-transform", showTech && "rotate-90")} />
                    Chi tiết kỹ thuật
                  </button>
                  {showTech && (
                    <pre className="mt-2.5 max-h-[220px] overflow-auto whitespace-pre-wrap break-words rounded-lg bg-[#450a0a] p-[12px_14px] font-mono text-xs leading-normal text-[#fecaca]">{entry.err.tech}</pre>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-border px-6 py-4">
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </div>
      </div>
    </div>
  )
}
