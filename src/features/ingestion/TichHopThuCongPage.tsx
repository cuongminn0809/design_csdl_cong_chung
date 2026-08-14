import { useMemo, useState } from "react"
import { Ban, Download, Eye, Inbox, RotateCcw, Search, TriangleAlert, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MultiSelect } from "@/features/reconciliation/components/MultiSelect"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { useToast } from "@/features/reconciliation/components/Toast"
import {
  ERR_TYPE, FIELD_MAP, LEGAL, PROC_SEED, PROC_STATUS, TYPES,
  fmtN, genErrors, genHistory, isErr, type Process,
} from "./data/thucong"
import { EmptyState, IconBtn, Pagination, PageHeader, SourcePill, StatusPill, Th, inputCls } from "./shared"

interface Filter {
  keyword: string
  types: number[]
  statuses: string[]
  from: string
  to: string
  source: string
}
const EMPTY: Filter = { keyword: "", types: [], statuses: [], from: "", to: "", source: "all" }
const SRC_NAMES = [...new Set(PROC_SEED.map((p) => p.srcName))]

export function TichHopThuCongPage() {
  const showToast = useToast()
  const [data, setData] = useState<Process[]>(PROC_SEED)
  const [draft, setDraft] = useState<Filter>(EMPTY)
  const [applied, setApplied] = useState<Filter>(EMPTY)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [cancelId, setCancelId] = useState<string | null>(null)

  const baseRows = useMemo(() => {
    const kw = applied.keyword.trim().toLowerCase()
    return data.filter((p) => {
      if (applied.types.length && !applied.types.includes(p.t)) return false
      if (applied.source !== "all" && p.srcName !== applied.source) return false
      if (kw && !p.id.toLowerCase().includes(kw) && !(p.soCC ?? "").toLowerCase().includes(kw)) return false
      return true
    })
  }, [data, applied])

  const filtered = baseRows.filter((p) => !applied.statuses.length || applied.statuses.includes(p.status))
  const counts = { ChoXuLy: 0, HoanThanh: 0, err: 0 }
  baseRows.forEach((p) => {
    if (p.status === "ChoXuLy") counts.ChoXuLy++
    else if (p.status === "HoanThanh") counts.HoanThanh++
    if (isErr(p.status)) counts.err++
  })

  const start = (Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize))) - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)
  const detail = detailId ? data.find((p) => p.id === detailId) ?? null : null

  const applyCard = (statuses: string[]) => { setApplied((a) => ({ ...a, statuses })); setDraft((d) => ({ ...d, statuses })); setPage(1) }
  const doSearch = () => { setApplied(draft); setPage(1) }
  const doReset = () => { setDraft(EMPTY); setApplied(EMPTY); setPage(1) }
  const doCancel = (reason: string) => {
    setData((d) => d.map((p) => (p.id === cancelId ? { ...p, status: "DaHuy", ended: "Vừa xong", cancelReason: reason } : p)))
    setCancelId(null)
    showToast("Đã hủy tiến trình.")
  }

  const cards = [
    { label: "Tổng", hint: "Tất cả tiến trình", count: baseRows.length, statuses: [] as string[], color: "#525252" },
    { label: "Chờ xử lý", hint: "Chờ kích hoạt", count: counts.ChoXuLy, statuses: ["ChoXuLy"], color: "#8C8C8C" },
    { label: "Hoàn thành", hint: "Đã vào kho", count: counts.HoanThanh, statuses: ["HoanThanh"], color: "#16a34a" },
    { label: "Lỗi", hint: "Lỗi + Lỗi kết nối", count: counts.err, statuses: ["Loi", "LoiKetNoi"], color: "#dc2626" },
  ]
  const cardActive = (s: string[]) => {
    const a = applied.statuses
    return s.length === 0 ? a.length === 0 : s.length === a.length && s.every((x) => a.includes(x))
  }

  return (
    <div>
      <PageHeader
        title="Tích hợp thủ công GDCC"
        desc="Duyệt tiến trình do nguồn PUSH vào staging, kiểm tra tham số và kích hoạt tích hợp vào kho CSDLCC chính thức."
        actions={
          <>
            <Button variant="outline" onClick={() => showToast("Đã làm mới danh sách tiến trình.")}>
              <RotateCcw className="size-4" />
              Làm mới
            </Button>
            <Button onClick={() => showToast("Đang kết xuất danh sách tiến trình…")}>
              <Download className="size-4" />
              Xuất danh sách
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
          <input value={draft.keyword} onChange={(e) => setDraft({ ...draft, keyword: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} placeholder="Tìm theo ID tiến trình, số công chứng…" className={cn(inputCls, "h-[38px] pl-9")} />
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="min-w-[240px] flex-1">
            <MultiSelect label="Loại GDCC" options={TYPES.map((n, i) => ({ value: String(i), label: n }))} selected={draft.types.map(String)} onChange={(v) => setDraft({ ...draft, types: v.map(Number) })} emptyLabel="Tất cả loại GDCC" itemLabel={(n) => `${n} loại`} />
          </div>
          <MultiSelect label="Trạng thái" width={220} options={Object.entries(PROC_STATUS).map(([k, v]) => ({ value: k, label: v.label }))} selected={draft.statuses} onChange={(v) => setDraft({ ...draft, statuses: v })} emptyLabel="Tất cả trạng thái" itemLabel={(n) => `${n} trạng thái`} />
          <div className="w-[170px]">
            <label className="mb-1.5 block text-xs font-semibold text-foreground-strong">Thời gian — Từ</label>
            <input type="date" value={draft.from} onChange={(e) => setDraft({ ...draft, from: e.target.value })} className={cn(inputCls, "text-[13.5px]")} />
          </div>
          <div className="w-[170px]">
            <label className="mb-1.5 block text-xs font-semibold text-foreground-strong">Thời gian — Đến</label>
            <input type="date" value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.target.value })} className={cn(inputCls, "text-[13.5px]")} />
          </div>
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
          <Button variant="outline" onClick={doReset}>Đặt lại</Button>
          <Button onClick={doSearch}>
            <Search className="size-4" />
            Tìm kiếm
          </Button>
        </div>
      </div>

      <div className="mx-0.5 mb-2.5 mt-[18px] flex items-center gap-2">
        <span className="text-[13px] text-foreground-muted">Kết quả:</span>
        <span className="text-[13px] font-semibold text-foreground-strong">{filtered.length} tiến trình</span>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        {filtered.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-neutral-50">
                    <Th className="w-12 text-center">STT</Th>
                    <Th className="min-w-[260px]">ID tiến trình</Th>
                    <Th className="min-w-[180px]">Nguồn dữ liệu</Th>
                    <Th>Trạng thái</Th>
                    <Th className="min-w-[140px]">Thời gian khởi tạo</Th>
                    <Th className="text-right">Tổng BG</Th>
                    <Th className="text-right">Đã ghi</Th>
                    <Th className="text-right">Bỏ qua</Th>
                    <Th className="w-[90px] text-center">Thao tác</Th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((p, i) => {
                    const canCancel = ["ChoXuLy", "TamDung", "Loi", "LoiKetNoi"].includes(p.status)
                    return (
                      <tr key={p.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{start + i + 1}</td>
                        <td className="px-4 py-3">
                          <div onClick={() => setDetailId(p.id)} className="cursor-pointer font-mono text-[13px] font-semibold text-link hover:underline">{p.id}</div>
                          <div className="mt-0.5 text-xs leading-snug text-foreground-subtle">{TYPES[p.t]}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-[7px]">
                            <SourcePill code={p.srcType} />
                            <span className="text-[13px] text-foreground">{p.srcName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3"><StatusPill meta={PROC_STATUS[p.status]} /></td>
                        <td className="whitespace-nowrap px-4 py-3 text-[13px] tabular-nums text-foreground-muted">{p.created}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-foreground">{fmtN(p.total)}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-foreground-muted">{fmtN(p.written)}</td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          <span style={{ color: p.skipped ? "#c2410c" : "var(--foreground-subtle)", fontWeight: p.skipped ? 600 : 400 }}>{fmtN(p.skipped)}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex gap-0.5">
                            <IconBtn title="Xem tham số" onClick={() => setDetailId(p.id)}>
                              <Eye className="size-4" />
                            </IconBtn>
                            {canCancel && (
                              <IconBtn title="Hủy tiến trình" danger onClick={() => setCancelId(p.id)}>
                                <Ban className="size-[15px]" />
                              </IconBtn>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={pageSize} total={filtered.length} unit="tiến trình" onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
          </>
        ) : (
          <EmptyState
            icon={<Inbox className="size-6" />}
            title="Chưa có tiến trình tích hợp nào"
            desc="Nguồn dữ liệu chưa gửi tiến trình đến hệ thống, hoặc không có tiến trình khớp bộ lọc."
            actionLabel="Xóa bộ lọc"
            onAction={doReset}
          />
        )}
      </div>

      {detail && (
        <ProcessDetail
          proc={detail}
          onClose={() => setDetailId(null)}
          onInit={() => { setDetailId(null); showToast("Đã khởi tạo tiến trình tích hợp.") }}
          onRetry={() => { setDetailId(null); showToast("Đã khởi tạo lại tiến trình.") }}
          onCancel={() => { setCancelId(detail.id); setDetailId(null) }}
        />
      )}
      {cancelId && <CancelDialog onClose={() => setCancelId(null)} onConfirm={doCancel} />}
    </div>
  )
}

const TAB_LABELS = { info: "Thông tin chung", unit: "Đơn vị cung cấp", tech: "Tham số kỹ thuật", errors: "Lỗi bản ghi", history: "Lịch sử" } as const
type TabKey = keyof typeof TAB_LABELS

function ProcessDetail({ proc, onClose, onInit, onRetry, onCancel }: { proc: Process; onClose: () => void; onInit: () => void; onRetry: () => void; onCancel: () => void }) {
  const skip = proc.skipped ?? 0
  const tabs: TabKey[] = ["info", "unit", "tech", ...(skip > 0 ? (["errors"] as TabKey[]) : []), "history"]
  const [tab, setTab] = useState<TabKey>("info")
  const errors = genErrors(proc)
  const history = genHistory(proc)

  const identity = [
    { label: "ID tiến trình", value: proc.id, mono: true },
    { label: "Loại GDCC", value: TYPES[proc.t] },
    ...(LEGAL[proc.t] ? [{ label: "Căn cứ pháp lý", value: LEGAL[proc.t] }] : []),
    { label: "Dịch vụ tích hợp", value: proc.service },
    { label: "Mô tả", value: proc.desc },
  ]
  const timing = [
    { label: "Thời gian tạo", value: proc.created },
    { label: "Bắt đầu xử lý", value: proc.started ?? "—" },
    { label: "Kết thúc", value: proc.ended ?? "—" },
  ]
  const audit = [
    { label: "Người tạo", value: proc.creator },
    { label: "Người thao tác", value: proc.actor ?? "—" },
  ]
  const unitFields = [
    { label: "Tên nguồn", value: proc.srcName },
    { label: "Loại nguồn", value: proc.srcType === "A" ? "A — Nền tảng công chứng" : "B — PM chuyển đổi CSDL địa phương" },
    { label: "Phương thức thu thập", value: proc.method },
    { label: "Cấp độ bảo mật", value: proc.sec },
    { label: "Người đầu mối", value: proc.creator },
  ]
  const techFields = [
    { label: "Kết nối", value: proc.method, mono: false },
    { label: "Endpoint nguồn", value: "/api/v1/integration/gdcc/packages", mono: true },
    { label: "Định dạng", value: "JSON", mono: false },
    { label: "Schema Registry", value: "gdcc_v2.1", mono: true },
    { label: "Xác thực", value: "Bearer Token", mono: false },
    { label: "Cấp độ bảo mật", value: proc.sec, mono: false },
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex max-h-[90vh] w-[900px] max-w-full flex-col overflow-hidden rounded-xl bg-surface shadow-popover">
        <div className="flex items-start justify-between gap-4 px-6 pt-5">
          <div className="min-w-0">
            <div className="mb-1 text-xs font-semibold text-foreground-muted">Chi tiết tiến trình</div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-[17px] font-semibold text-foreground-strong">{proc.id}</span>
              <StatusPill meta={PROC_STATUS[proc.status]} big />
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-[18px]" />
          </Button>
        </div>

        {proc.status === "DangXuLy" && (
          <div className="mx-6 mt-3.5">
            <div className="h-1 overflow-hidden rounded-full bg-[#dbeafe]">
              <div className="h-full w-2/5 rounded-full bg-[#2563eb]" />
            </div>
            <div className="mt-1.5 text-xs text-[#1d4ed8]">Đang xử lý… Tự động cập nhật sau 10 giây</div>
          </div>
        )}

        <div className="mt-3.5 flex gap-1 overflow-x-auto border-b border-border px-6">
          {tabs.map((k) => (
            <button key={k} onClick={() => setTab(k)} className={cn("whitespace-nowrap border-b-2 px-3 py-2.5 text-sm", tab === k ? "border-neutral-900 font-semibold text-foreground-strong" : "border-transparent font-medium text-foreground-muted")}>
              {TAB_LABELS[k]}
              {k === "errors" && ` (${skip})`}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto px-6 py-5">
          {tab === "info" && (
            <>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <SectionTitle>Thông tin định danh</SectionTitle>
                  {identity.map((f) => <StackRow key={f.label} {...f} />)}
                  <SectionTitle className="mt-[18px]">Nguồn dữ liệu</SectionTitle>
                  <div className="flex items-center gap-2 py-2.5">
                    <SourcePill code={proc.srcType} />
                    <span className="text-[13.5px] text-foreground">{proc.srcName}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 border-t border-neutral-100 py-2.5">
                    <div className="text-xs text-foreground-muted">Phương thức thu thập</div>
                    <div><Badge variant="secondary">{proc.method}</Badge></div>
                  </div>
                </div>
                <div>
                  <SectionTitle>Thời gian</SectionTitle>
                  {timing.map((f) => <StackRow key={f.label} {...f} />)}
                  <SectionTitle className="mt-[18px]">Thống kê dữ liệu</SectionTitle>
                  <div className="flex gap-2.5">
                    <StatBox label="Tổng bản ghi" value={fmtN(proc.total)} />
                    <StatBox label="Đã ghi" value={fmtN(proc.written)} tone="green" />
                    <StatBox label="Bỏ qua" value={fmtN(proc.skipped)} tone={proc.skipped ? "amber" : undefined} />
                  </div>
                  <SectionTitle className="mt-[18px]">Audit</SectionTitle>
                  {audit.map((f) => <StackRow key={f.label} {...f} />)}
                </div>
              </div>
              {(proc.status === "Loi" || proc.status === "LoiKetNoi") && proc.errMsg && (
                <div className="mt-[18px] flex gap-3 rounded-[10px] border border-[#fecaca] bg-[#fef2f2] p-[14px_16px]">
                  <TriangleAlert className="mt-px size-[18px] shrink-0 text-[#dc2626]" />
                  <div>
                    <div className="mb-0.5 text-[13px] font-bold text-[#b91c1c]">Lỗi hệ thống · {proc.errCode}</div>
                    <div className="text-[13px] leading-normal text-foreground">{proc.errMsg}</div>
                  </div>
                </div>
              )}
            </>
          )}

          {tab === "unit" && (
            <div className="max-w-[640px]">
              {unitFields.map((f) => (
                <div key={f.label} className="flex gap-4 border-b border-neutral-100 py-2.5">
                  <div className="w-[200px] flex-none text-[13px] text-foreground-muted">{f.label}</div>
                  <div className="flex-1 text-[13.5px] leading-normal text-foreground">{f.value}</div>
                </div>
              ))}
            </div>
          )}

          {tab === "tech" && (
            <div>
              <SectionTitle>Cấu hình kết nối</SectionTitle>
              <div className="grid grid-cols-2 gap-x-7">
                {techFields.map((f) => <StackRow key={f.label} {...f} />)}
              </div>
              <SectionTitle className="mt-5">Ánh xạ trường dữ liệu</SectionTitle>
              <div className="overflow-hidden rounded-[10px] border border-border">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr className="border-b border-border bg-neutral-50">
                      <Th className="px-3.5 py-2.5">Trường nguồn</Th>
                      <Th className="px-3.5 py-2.5">Kiểu dữ liệu</Th>
                      <Th className="px-3.5 py-2.5">Trường đích (CSDLCC)</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {FIELD_MAP.map((m) => (
                      <tr key={m.src} className="border-b border-neutral-100">
                        <td className="px-3.5 py-2.5 font-mono text-foreground">{m.src}</td>
                        <td className="px-3.5 py-2.5"><span className="rounded-[4px] bg-surface-muted px-1.5 py-px font-mono text-[11.5px] text-foreground-muted">{m.type}</span></td>
                        <td className="px-3.5 py-2.5 font-mono text-foreground">{m.dst}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "errors" && (
            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-[13px] text-foreground-muted">{skip} bản ghi bị bỏ qua</span>
                <Button variant="outline" size="sm">Xuất danh sách lỗi</Button>
              </div>
              <div className="overflow-hidden rounded-[10px] border border-border">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr className="border-b border-border bg-neutral-50">
                      <Th className="w-12 px-3.5 py-2.5 text-center">STT</Th>
                      <Th className="px-3.5 py-2.5">ID bản ghi</Th>
                      <Th className="px-3.5 py-2.5">Loại lỗi</Th>
                      <Th className="px-3.5 py-2.5">Trường bị lỗi</Th>
                      <Th className="px-3.5 py-2.5">Mô tả chi tiết</Th>
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
                          <td className="px-3.5 py-2.5 leading-snug text-foreground">{e.desc}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "history" && (
            <div className="flex flex-col">
              {history.map((h, i) => {
                const meta = PROC_STATUS[h.status]
                return (
                  <div key={i} className="flex gap-3.5">
                    <div className="flex flex-none flex-col items-center">
                      <span className="size-2.5 rounded-full" style={{ background: meta.dot }} />
                      {i < history.length - 1 && <span className="w-px flex-1 bg-border" />}
                    </div>
                    <div className="min-w-0 flex-1 pb-5">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-[12.5px] tabular-nums text-foreground-muted">{h.time}</span>
                        <StatusPill meta={meta} />
                      </div>
                      <div className="mt-1 text-[13.5px] font-medium text-foreground">{h.action}</div>
                      <div className="mt-0.5 text-[12.5px] text-foreground-muted">{h.actor} · {h.detail}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
          {proc.status === "ChoXuLy" && <Button onClick={onInit}>Khởi tạo tiến trình</Button>}
          {isErr(proc.status) && (
            <button onClick={onRetry} className="h-9 rounded-md border border-[#ea580c] bg-[#f97316] px-4 text-sm font-medium text-white shadow-xs hover:bg-[#ea580c]">Khởi tạo lại</button>
          )}
          {["ChoXuLy", "TamDung", "Loi", "LoiKetNoi"].includes(proc.status) && (
            <button onClick={onCancel} className="h-9 rounded-md border border-red-600 bg-surface px-4 text-sm font-medium text-red-600 shadow-xs hover:bg-[#fef2f2]">Hủy tiến trình</button>
          )}
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </div>
      </div>
    </div>
  )
}

function CancelDialog({ onClose, onConfirm }: { onClose: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState("")
  const [error, setError] = useState(false)
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-[480px] max-w-full overflow-hidden rounded-xl bg-surface shadow-popover">
        <div className="px-6 pb-2 pt-[22px]">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex size-[38px] items-center justify-center rounded-full bg-[#fef2f2] text-[#dc2626]">
              <TriangleAlert className="size-[19px]" />
            </div>
            <div className="text-[17px] font-semibold text-foreground-strong">Xác nhận hủy tiến trình</div>
          </div>
          <p className="text-[13.5px] leading-relaxed text-foreground-muted">Tiến trình sẽ bị hủy và không thể khôi phục. Dữ liệu đã ghi (nếu có) sẽ được rollback về trạng thái an toàn.</p>
          <div className="mt-3.5">
            <label className="mb-1.5 block text-[12.5px] font-semibold text-foreground-strong">
              Lý do hủy <span className="text-red-600">*</span>
            </label>
            <textarea value={reason} onChange={(e) => { setReason(e.target.value); setError(false) }} rows={3} maxLength={500} placeholder="Nhập lý do hủy tiến trình…" className={cn("w-full resize-y rounded-md border bg-surface px-3 py-2.5 text-sm shadow-xs outline-none", error ? "border-red-600" : "border-input")} />
            {error && <span className="text-[11.5px] text-red-600">Vui lòng nhập lý do hủy tiến trình</span>}
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-border bg-neutral-50 px-6 py-3.5">
          <Button variant="outline" onClick={onClose}>Hủy bỏ</Button>
          <button
            onClick={() => (reason.trim() ? onConfirm(reason.trim()) : setError(true))}
            className="h-9 rounded-md border border-red-600 bg-red-600 px-4 text-sm font-medium text-white shadow-xs hover:bg-[#b91c1c]"
          >
            Xác nhận hủy
          </button>
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mb-2 text-[11.5px] font-bold uppercase tracking-wider text-foreground-subtle", className)}>{children}</div>
}
function StackRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-neutral-100 py-2.5">
      <div className="text-xs text-foreground-muted">{label}</div>
      <div className={cn("text-[13.5px] leading-snug text-foreground", mono && "font-mono")}>{value}</div>
    </div>
  )
}
function StatBox({ label, value, tone }: { label: string; value: string; tone?: "green" | "amber" }) {
  const styles = tone === "green" ? "bg-[#f0fdf4] border-[#bbf7d0] text-[#15803d]" : tone === "amber" ? "bg-[#fffbeb] border-[#fde68a] text-[#b45309]" : "bg-neutral-50 border-border text-foreground-strong"
  return (
    <div className={cn("flex-1 rounded-[10px] border p-3", styles)}>
      <div className="text-[11.5px] opacity-90">{label}</div>
      <div className="mt-0.5 text-[20px] font-bold tabular-nums">{value}</div>
    </div>
  )
}
