import { useMemo, useState } from "react"
import { Download, Eye, History, Pencil, Play, Plus, Search, Square, Trash2, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { MultiSelect } from "@/features/reconciliation/components/MultiSelect"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { useToast } from "@/features/reconciliation/components/Toast"
import {
  CFG_SEED, CFG_STATUS, ERR_TYPE, LEGAL, RUN_STATUS, TYPES,
  fmtN2, genRunErrors, genRuns, type Config, type Run,
} from "./data/tudong"
import { EmptyState, IconBtn, Pagination, PageHeader, SourcePill, StatusPill, Th, inputCls } from "./shared"

interface Filter {
  keyword: string
  types: number[]
  statuses: string[]
  source: string
}
const EMPTY: Filter = { keyword: "", types: [], statuses: [], source: "all" }
const SRC_NAMES = [...new Set(CFG_SEED.map((c) => c.src))]

export function TichHopTuDongPage() {
  const showToast = useToast()
  const [data, setData] = useState<Config[]>(CFG_SEED)
  const [draft, setDraft] = useState<Filter>(EMPTY)
  const [applied, setApplied] = useState<Filter>(EMPTY)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [viewCode, setViewCode] = useState<string | null>(null)
  const [historyCode, setHistoryCode] = useState<string | null>(null)
  const [form, setForm] = useState<{ mode: "create" | "edit"; cfg?: Config } | null>(null)

  const baseRows = useMemo(() => {
    const kw = applied.keyword.trim().toLowerCase()
    return data.filter((c) => {
      if (applied.types.length && !applied.types.includes(c.t)) return false
      if (applied.source !== "all" && c.src !== applied.source) return false
      if (kw && !c.name.toLowerCase().includes(kw) && !c.code.toLowerCase().includes(kw) && !c.unitName.toLowerCase().includes(kw)) return false
      return true
    })
  }, [data, applied])

  const filtered = baseRows.filter((c) => !applied.statuses.length || applied.statuses.includes(c.status))
  const counts = { DangHD: 0, ChuaKH: 0, errStop: 0 }
  baseRows.forEach((c) => {
    if (c.status === "DangHD") counts.DangHD++
    else if (c.status === "ChuaKH") counts.ChuaKH++
    else if (c.status === "Loi" || c.status === "DaDung") counts.errStop++
  })

  const start = (Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize))) - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)
  const view = viewCode ? data.find((c) => c.code === viewCode) ?? null : null
  const history = historyCode ? data.find((c) => c.code === historyCode) ?? null : null

  const applyCard = (statuses: string[]) => { setApplied((a) => ({ ...a, statuses })); setDraft((d) => ({ ...d, statuses })); setPage(1) }
  const doSearch = () => { setApplied(draft); setPage(1) }
  const doReset = () => { setDraft(EMPTY); setApplied(EMPTY); setPage(1) }
  const toggleActive = (c: Config) => {
    const next = c.status === "DangHD" ? "DaDung" : "DangHD"
    setData((d) => d.map((x) => (x.code === c.code ? { ...x, status: next } : x)))
    showToast(next === "DangHD" ? "Đã kích hoạt cấu hình — lịch chạy tự động." : "Đã dừng cấu hình.")
  }
  const remove = (c: Config) => {
    setData((d) => d.filter((x) => x.code !== c.code))
    showToast("Đã xóa cấu hình tích hợp.")
  }

  const cards = [
    { label: "Tổng", hint: "Tất cả cấu hình", count: baseRows.length, statuses: [] as string[], color: "#525252" },
    { label: "Đang hoạt động", hint: "Lịch đang chạy", count: counts.DangHD, statuses: ["DangHD"], color: "#16a34a" },
    { label: "Chưa kích hoạt", hint: "Đã lưu, chờ bật", count: counts.ChuaKH, statuses: ["ChuaKH"], color: "#d97706" },
    { label: "Lỗi / Đã dừng", hint: "Cần xử lý", count: counts.errStop, statuses: ["Loi", "DaDung"], color: "#dc2626" },
  ]
  const cardActive = (s: string[]) => {
    const a = applied.statuses
    return s.length === 0 ? a.length === 0 : s.length === a.length && s.every((x) => a.includes(x))
  }

  return (
    <div>
      <PageHeader
        title="Tích hợp tự động GDCC"
        desc="Tạo và quản lý cấu hình để kho chủ động PULL dữ liệu GDCC từ nguồn theo lịch. Lịch chạy tự động sau khi kích hoạt."
        actions={
          <>
            <Button variant="outline" onClick={() => showToast("Đang kết xuất danh sách cấu hình…")}>
              <Download className="size-4" />
              Kết xuất
            </Button>
            <Button onClick={() => setForm({ mode: "create" })}>
              <Plus className="size-4" />
              Tạo mới cấu hình
            </Button>
          </>
        }
      />

      <div className="mb-[18px] grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {cards.map((c) => {
          const active = cardActive(c.statuses)
          return (
            <button key={c.label} onClick={() => applyCard(c.statuses)} className="rounded-[14px] border bg-surface p-[16px_18px] text-left shadow-sm" style={{ borderColor: active ? c.color : "var(--border-color)", outline: active ? `2px solid ${c.color}22` : "none" }}>
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
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
          <input value={draft.keyword} onChange={(e) => setDraft({ ...draft, keyword: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} placeholder="Tìm theo tên cấu hình, mã cấu hình, đơn vị…" className={cn(inputCls, "h-[38px] pl-9")} />
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="min-w-[240px] flex-1">
            <MultiSelect label="Loại GDCC" options={TYPES.map((n, i) => ({ value: String(i), label: n }))} selected={draft.types.map(String)} onChange={(v) => setDraft({ ...draft, types: v.map(Number) })} emptyLabel="Tất cả loại GDCC" itemLabel={(n) => `${n} loại`} />
          </div>
          <MultiSelect label="Trạng thái" width={220} options={Object.entries(CFG_STATUS).map(([k, v]) => ({ value: k, label: v.label }))} selected={draft.statuses} onChange={(v) => setDraft({ ...draft, statuses: v })} emptyLabel="Tất cả trạng thái" itemLabel={(n) => `${n} trạng thái`} />
          <div className="w-[230px]">
            <label className="mb-1.5 block text-xs font-semibold text-foreground-strong">Nguồn dữ liệu</label>
            <NativeSelect value={draft.source} onChange={(e) => setDraft({ ...draft, source: e.target.value })}>
              <option value="all">Tất cả nguồn</option>
              {SRC_NAMES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </NativeSelect>
          </div>
        </div>
        <div className="mt-[18px] flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" onClick={doReset}>Bỏ lọc</Button>
          <Button onClick={doSearch}>
            <Search className="size-4" />
            Tìm kiếm
          </Button>
        </div>
      </div>

      <div className="mx-0.5 mb-2.5 mt-[18px] flex items-center gap-2">
        <span className="text-[13px] text-foreground-muted">Kết quả:</span>
        <span className="text-[13px] font-semibold text-foreground-strong">{filtered.length} cấu hình</span>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        {filtered.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-neutral-50">
                    <Th className="w-12 text-center">STT</Th>
                    <Th>Mã CF</Th>
                    <Th className="min-w-[250px]">Tên cấu hình</Th>
                    <Th className="min-w-[170px]">Nguồn</Th>
                    <Th>Kết nối</Th>
                    <Th>Đồng bộ</Th>
                    <Th>Trạng thái</Th>
                    <Th className="min-w-[140px]">Lần chạy gần nhất</Th>
                    <Th className="w-[180px] text-center">Thao tác</Th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((c, i) => (
                    <tr key={c.code} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{start + i + 1}</td>
                      <td className="px-4 py-3 font-mono text-xs text-foreground">{c.code}</td>
                      <td className="px-4 py-3">
                        <div onClick={() => setViewCode(c.code)} className="cursor-pointer font-medium leading-tight text-link hover:underline">{c.name}</div>
                        <div className="mt-0.5 text-[11.5px] text-foreground-subtle">{TYPES[c.t]}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-[7px]">
                          <SourcePill code={c.srcType} />
                          <span className="text-[13px] text-foreground">{c.src}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className="rounded-[4px] border border-border bg-surface-muted px-1.5 py-px font-mono text-[11px] font-semibold text-foreground-muted">{c.conn}</span></td>
                      <td className="px-4 py-3 text-[13px] text-foreground">{c.sync}{c.freq ? ` · ${c.freq}` : ""}</td>
                      <td className="px-4 py-3"><StatusPill meta={CFG_STATUS[c.status]} /></td>
                      <td className="whitespace-nowrap px-4 py-3 text-[13px] tabular-nums text-foreground-muted">{c.lastRun ?? "—"}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex gap-px">
                          <IconBtn title="Xem" onClick={() => setViewCode(c.code)}><Eye className="size-4" /></IconBtn>
                          <IconBtn title="Chỉnh sửa" onClick={() => setForm({ mode: "edit", cfg: c })}><Pencil className="size-[14px]" /></IconBtn>
                          <IconBtn title={c.status === "DangHD" ? "Dừng" : "Kích hoạt"} onClick={() => toggleActive(c)}>
                            {c.status === "DangHD" ? <Square className="size-[14px]" /> : <Play className="size-[14px]" />}
                          </IconBtn>
                          <IconBtn title="Lịch sử chạy" onClick={() => setHistoryCode(c.code)}><History className="size-[15px]" /></IconBtn>
                          <IconBtn title={c.status === "DangHD" ? "Đang chạy — không thể xóa" : "Xóa"} disabled={c.status === "DangHD"} danger onClick={() => remove(c)}>
                            <Trash2 className="size-[14px]" />
                          </IconBtn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={pageSize} total={filtered.length} unit="cấu hình" onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
          </>
        ) : (
          <EmptyState
            icon={<Play className="size-6" />}
            title="Chưa có cấu hình nào"
            desc="Chưa có cấu hình PULL tự động, hoặc không có cấu hình khớp bộ lọc. Tạo mới để kho chủ động lấy dữ liệu theo lịch."
            actionLabel="Bỏ lọc"
            onAction={doReset}
          />
        )}
      </div>

      {view && <ConfigView cfg={view} onClose={() => setViewCode(null)} onEdit={() => { setForm({ mode: "edit", cfg: view }); setViewCode(null) }} />}
      {history && <HistoryModal cfg={history} onClose={() => setHistoryCode(null)} />}
      {form && (
        <ConfigForm
          mode={form.mode}
          cfg={form.cfg}
          onClose={() => setForm(null)}
          onSave={() => { setForm(null); showToast(form.mode === "create" ? "Đã tạo cấu hình tích hợp mới." : "Đã lưu thay đổi cấu hình.") }}
        />
      )}
    </div>
  )
}

function ModalShell({ width, children, onClose }: { width: number; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex max-h-[90vh] flex-col overflow-hidden rounded-xl bg-surface shadow-popover" style={{ width, maxWidth: "100%" }}>
        {children}
      </div>
    </div>
  )
}

function ConfigView({ cfg, onClose, onEdit }: { cfg: Config; onClose: () => void; onEdit: () => void }) {
  const rows: { label: string; value: string; mono?: boolean }[] = [
    { label: "Mã cấu hình", value: cfg.code, mono: true },
    { label: "Tên cấu hình", value: cfg.name },
    { label: "Loại GDCC", value: TYPES[cfg.t] },
    ...(LEGAL[cfg.t] ? [{ label: "Căn cứ pháp lý", value: LEGAL[cfg.t] }] : []),
    { label: "Đơn vị", value: cfg.unitName },
    { label: "Hệ thống nguồn", value: cfg.system },
    { label: "Nguồn dữ liệu", value: cfg.src },
    { label: "Cấp độ bảo mật", value: cfg.sec },
    { label: "Kết nối", value: cfg.conn },
    { label: "Base URL", value: cfg.baseUrl, mono: true },
    { label: "Đồng bộ", value: `${cfg.sync}${cfg.freq ? ` · ${cfg.freq}` : ""}` },
    { label: "Lần chạy gần nhất", value: cfg.lastRun ?? "—" },
    { label: "Lần chạy kế tiếp", value: cfg.nextRun ?? "—" },
    { label: "Đầu mối", value: cfg.supName },
    { label: "Email đầu mối", value: cfg.supEmail },
    { label: "Liên hệ", value: cfg.supContact },
  ]
  return (
    <ModalShell width={760} onClose={onClose}>
      <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
        <div className="min-w-0">
          <div className="mb-1 text-xs font-semibold text-foreground-muted">Chi tiết cấu hình tích hợp tự động</div>
          <div className="text-lg font-semibold leading-tight tracking-[-0.01em] text-foreground-strong">{cfg.name}</div>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span className="rounded-[4px] border border-border bg-surface-muted px-1.5 py-px font-mono text-xs text-foreground-muted">{cfg.code}</span>
            <SourcePill code={cfg.srcType} />
            <StatusPill meta={CFG_STATUS[cfg.status]} />
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}><X className="size-[18px]" /></Button>
      </div>
      <div className="flex-1 overflow-auto px-6 py-[18px]">
        <div className="grid grid-cols-2 gap-x-7">
          {rows.map((f) => (
            <div key={f.label} className="flex flex-col gap-0.5 border-b border-neutral-100 py-2.5">
              <div className="text-xs text-foreground-muted">{f.label}</div>
              <div className={cn("text-[13.5px] leading-snug text-foreground", f.mono && "font-mono")}>{f.value}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
        <Button variant="outline" onClick={onClose}>Đóng</Button>
        <Button onClick={onEdit}><Pencil className="size-4" />Chỉnh sửa</Button>
      </div>
    </ModalShell>
  )
}

function HistoryModal({ cfg, onClose }: { cfg: Config; onClose: () => void }) {
  const runs = genRuns(cfg)
  const [runId, setRunId] = useState<string | null>(null)
  const run = runId ? runs.find((r) => r.id === runId) ?? null : null

  return (
    <ModalShell width={860} onClose={onClose}>
      <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
        <div className="min-w-0">
          <div className="mb-1 text-xs font-semibold text-foreground-muted">Lịch sử chạy · {cfg.code}</div>
          <div className="text-lg font-semibold leading-tight tracking-[-0.01em] text-foreground-strong">{cfg.name}</div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}><X className="size-[18px]" /></Button>
      </div>
      <div className="flex-1 overflow-auto px-6 py-5">
        {run ? (
          <RunDetail run={run} onBack={() => setRunId(null)} />
        ) : runs.length ? (
          <div className="overflow-hidden rounded-[10px] border border-border">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-border bg-neutral-50">
                  <Th className="px-3.5 py-2.5">Mã lần chạy</Th>
                  <Th className="px-3.5 py-2.5">Bắt đầu</Th>
                  <Th className="px-3.5 py-2.5">Kết thúc</Th>
                  <Th className="px-3.5 py-2.5">Trạng thái</Th>
                  <Th className="px-3.5 py-2.5 text-right">Tổng</Th>
                  <Th className="px-3.5 py-2.5 text-right">Đã ghi</Th>
                  <Th className="px-3.5 py-2.5 text-right">Bỏ qua</Th>
                  <Th className="w-16 px-3.5 py-2.5 text-center">Xem</Th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => {
                  const rs = RUN_STATUS[r.status]
                  return (
                    <tr key={r.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="px-3.5 py-2.5 font-mono text-foreground">{r.id}</td>
                      <td className="px-3.5 py-2.5 tabular-nums text-foreground-muted">{r.start}</td>
                      <td className="px-3.5 py-2.5 tabular-nums text-foreground-muted">{r.end ?? "—"}</td>
                      <td className="px-3.5 py-2.5">
                        <span className="inline-flex items-center rounded-full px-[9px] py-0.5 text-[11.5px] font-semibold" style={{ background: rs.bg, color: rs.fg, border: `1px solid ${rs.bd}` }}>{rs.label}</span>
                      </td>
                      <td className="px-3.5 py-2.5 text-right tabular-nums text-foreground">{fmtN2(r.total)}</td>
                      <td className="px-3.5 py-2.5 text-right tabular-nums text-foreground-muted">{fmtN2(r.written)}</td>
                      <td className="px-3.5 py-2.5 text-right tabular-nums" style={{ color: r.skipped ? "#c2410c" : "var(--foreground-subtle)" }}>{fmtN2(r.skipped)}</td>
                      <td className="px-3.5 py-2.5 text-center">
                        <IconBtn title="Xem lần chạy" onClick={() => setRunId(r.id)}><Eye className="size-4" /></IconBtn>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center text-[13.5px] text-foreground-muted">Cấu hình chưa có lần chạy nào.</div>
        )}
      </div>
      <div className="flex justify-end border-t border-border px-6 py-4">
        <Button variant="outline" onClick={onClose}>Đóng</Button>
      </div>
    </ModalShell>
  )
}

function RunDetail({ run, onBack }: { run: Run; onBack: () => void }) {
  const rs = RUN_STATUS[run.status]
  const errors = genRunErrors(run)
  return (
    <div>
      <button onClick={onBack} className="mb-3 text-[13px] font-medium text-link hover:underline">← Quay lại danh sách lần chạy</button>
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <span className="font-mono text-[15px] font-semibold text-foreground-strong">{run.id}</span>
        <span className="inline-flex items-center rounded-full px-[9px] py-0.5 text-[11.5px] font-semibold" style={{ background: rs.bg, color: rs.fg, border: `1px solid ${rs.bd}` }}>{rs.label}</span>
      </div>
      <div className="mb-4 grid grid-cols-3 gap-2.5">
        <div className="rounded-[10px] border border-border bg-neutral-50 p-3"><div className="text-[11.5px] text-foreground-muted">Tổng bản ghi</div><div className="mt-0.5 text-[20px] font-bold tabular-nums text-foreground-strong">{fmtN2(run.total)}</div></div>
        <div className="rounded-[10px] border border-[#bbf7d0] bg-[#f0fdf4] p-3"><div className="text-[11.5px] text-[#15803d]">Đã ghi</div><div className="mt-0.5 text-[20px] font-bold tabular-nums text-[#15803d]">{fmtN2(run.written)}</div></div>
        <div className={cn("rounded-[10px] border p-3", run.skipped ? "border-[#fde68a] bg-[#fffbeb]" : "border-border bg-neutral-50")}><div className={cn("text-[11.5px]", run.skipped ? "text-[#b45309]" : "text-foreground-muted")}>Bỏ qua</div><div className={cn("mt-0.5 text-[20px] font-bold tabular-nums", run.skipped ? "text-[#b45309]" : "text-foreground-strong")}>{fmtN2(run.skipped)}</div></div>
      </div>
      {errors.length > 0 && (
        <div className="overflow-hidden rounded-[10px] border border-border">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-border bg-neutral-50">
                <Th className="w-12 px-3.5 py-2.5 text-center">STT</Th>
                <Th className="px-3.5 py-2.5">ID bản ghi</Th>
                <Th className="px-3.5 py-2.5">Loại lỗi</Th>
                <Th className="px-3.5 py-2.5">Trường bị lỗi</Th>
              </tr>
            </thead>
            <tbody>
              {errors.map((e) => {
                const et = ERR_TYPE[e.type]
                return (
                  <tr key={e.stt} className="border-b border-neutral-100">
                    <td className="px-3.5 py-2.5 text-center text-foreground-muted">{e.stt}</td>
                    <td className="px-3.5 py-2.5 font-mono text-foreground">{e.id}</td>
                    <td className="px-3.5 py-2.5"><span className="inline-block rounded-full px-2 py-0.5 text-[11.5px] font-semibold" style={{ background: et.bg, color: et.fg }}>{e.type}</span></td>
                    <td className="px-3.5 py-2.5 font-mono text-foreground">{e.field}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      {run.errCode && (
        <div className="mt-3 rounded-[10px] border border-[#fecaca] bg-[#fef2f2] p-[12px_14px] text-[13px]">
          <span className="font-semibold text-[#b91c1c]">Mã lỗi: </span>
          <span className="font-mono text-[#991b1b]">{run.errCode}</span>
        </div>
      )}
    </div>
  )
}

const FieldLabel = ({ children, req }: { children: React.ReactNode; req?: boolean }) => (
  <label className="mb-1.5 block text-[12.5px] font-semibold text-foreground-strong">
    {children} {req && <span className="text-red-600">*</span>}
  </label>
)

function ConfigForm({ mode, cfg, onClose, onSave }: { mode: "create" | "edit"; cfg?: Config; onClose: () => void; onSave: () => void }) {
  const [name, setName] = useState(cfg?.name ?? "")
  const [gdccType, setGdccType] = useState(cfg ? String(cfg.t) : "")
  const [source, setSource] = useState(cfg?.src ?? SRC_NAMES[0])
  const [sec, setSec] = useState(cfg?.sec ?? "Nội bộ")
  const [baseUrl, setBaseUrl] = useState(cfg?.baseUrl ?? "https://api.congchung.gov.vn")
  const [conn, setConn] = useState(cfg?.conn ?? "REST")
  const [sync, setSync] = useState(cfg?.sync ?? "Scheduled")
  const [freq, setFreq] = useState(cfg?.freq ?? "Hàng ngày")
  const [supEmail, setSupEmail] = useState(cfg?.supEmail ?? "")
  const legal = gdccType !== "" ? LEGAL[+gdccType] ?? "" : ""
  const canSave = name.trim() !== "" && gdccType !== ""

  return (
    <ModalShell width={820} onClose={onClose}>
      <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
        <div>
          <div className="text-[17px] font-semibold tracking-[-0.01em] text-foreground-strong">{mode === "create" ? "Tạo mới cấu hình tích hợp tự động" : "Chỉnh sửa cấu hình"}</div>
          <div className="mt-0.5 text-[12.5px] text-foreground-muted">Cấu hình để kho chủ động PULL dữ liệu GDCC từ nguồn theo lịch.</div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}><X className="size-[18px]" /></Button>
      </div>
      <div className="flex-1 overflow-auto px-6 py-5">
        <SectionTitle>Thông tin chung</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <FieldLabel req>Tên cấu hình</FieldLabel>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Tích hợp GDCC - Nền tảng CC Hà Nội" className={cn(inputCls, "h-[38px]")} />
          </div>
          <div>
            <FieldLabel req>Loại GDCC</FieldLabel>
            <NativeSelect className="h-[38px]" value={gdccType} onChange={(e) => setGdccType(e.target.value)}>
              <option value="">— Chọn loại —</option>
              {TYPES.map((n, i) => (
                <option key={i} value={i}>{n}</option>
              ))}
            </NativeSelect>
          </div>
          <div>
            <FieldLabel>Căn cứ pháp lý</FieldLabel>
            <input value={legal} readOnly className={cn(inputCls, "h-[38px] bg-surface-muted text-foreground-muted")} />
          </div>
          <div>
            <FieldLabel req>Nguồn dữ liệu</FieldLabel>
            <NativeSelect className="h-[38px]" value={source} onChange={(e) => setSource(e.target.value)}>
              {SRC_NAMES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </NativeSelect>
          </div>
          <div>
            <FieldLabel>Cấp độ bảo mật</FieldLabel>
            <NativeSelect className="h-[38px]" value={sec} onChange={(e) => setSec(e.target.value)}>
              <option value="Công khai">Công khai</option>
              <option value="Nội bộ">Nội bộ</option>
              <option value="Bí mật">Bí mật</option>
              <option value="Tối mật">Tối mật</option>
            </NativeSelect>
          </div>
        </div>

        <SectionTitle className="mt-5">Kết nối &amp; đồng bộ</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <FieldLabel req>Base URL / chuỗi kết nối</FieldLabel>
            <input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} className={cn(inputCls, "h-[38px] font-mono text-[13px]")} />
          </div>
          <div>
            <FieldLabel>Loại kết nối</FieldLabel>
            <NativeSelect className="h-[38px]" value={conn} onChange={(e) => setConn(e.target.value)}>
              <option value="REST">REST</option>
              <option value="SOAP">SOAP</option>
              <option value="DB">DB</option>
              <option value="File">File</option>
            </NativeSelect>
          </div>
          <div>
            <FieldLabel req>Cơ chế đồng bộ</FieldLabel>
            <NativeSelect className="h-[38px]" value={sync} onChange={(e) => setSync(e.target.value)}>
              <option value="Scheduled">Scheduled</option>
              <option value="Batch">Batch</option>
              <option value="Real-time">Real-time</option>
            </NativeSelect>
          </div>
          {sync !== "Real-time" && (
            <div>
              <FieldLabel>Tần suất</FieldLabel>
              <NativeSelect className="h-[38px]" value={freq} onChange={(e) => setFreq(e.target.value)}>
                <option value="Mỗi 30 phút">Mỗi 30 phút</option>
                <option value="Mỗi 1 giờ">Mỗi 1 giờ</option>
                <option value="Hàng ngày">Hàng ngày</option>
                <option value="Hàng tuần">Hàng tuần</option>
                <option value="Hàng tháng">Hàng tháng</option>
              </NativeSelect>
            </div>
          )}
        </div>

        <SectionTitle className="mt-5">Đầu mối kỹ thuật</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel req>Email đầu mối</FieldLabel>
            <input value={supEmail} onChange={(e) => setSupEmail(e.target.value)} placeholder="contact@donvi.gov.vn" className={cn(inputCls, "h-[38px]")} />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
        <Button variant="ghost" onClick={onClose}>Hủy</Button>
        <Button onClick={onSave} disabled={!canSave}>Lưu cấu hình</Button>
      </div>
    </ModalShell>
  )
}

function SectionTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mb-3 text-[11.5px] font-bold uppercase tracking-wider text-foreground-subtle", className)}>{children}</div>
}
