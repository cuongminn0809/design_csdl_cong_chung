import { useMemo, useState } from "react"
import { Download, Eye, FileSearch, RotateCcw, Search, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { useToast } from "@/features/reconciliation/components/Toast"
import { EmptyState, IconBtn, Pagination, PageHeader, Th, inputCls } from "../../ingestion/shared"
import type { Method } from "../config"
import {
  EXCHANGE_LOGS, OP_FILTER_OPTIONS, OP_LOGS, SYNC_STATUS_META, UPDATE_ACTION_META, UPDATE_LOGS,
  daysAgoISO, parseVnDate, todayISO, type ExchangeLog, type UpdateLog,
} from "./config"

type TabKey = "update" | "op" | "exchange"
const TABS: [TabKey, string][] = [
  ["update", "Lịch sử cập nhật thông tin"],
  ["op", "Lịch sử thao tác"],
  ["exchange", "Lịch sử trao đổi"],
]

interface Filter { from: string; to: string; soCC: string; actor: string; action: string }
const makeEmpty = (): Filter => ({ from: daysAgoISO(7), to: todayISO(), soCC: "", actor: "", action: "Tất cả" })

export function HistoryPage({ method }: { method: Method }) {
  const showToast = useToast()
  const label = method === "paper" ? "giấy" : "điện tử"

  const [tab, setTab] = useState<TabKey>("update")
  const [draft, setDraft] = useState<Filter>(makeEmpty)
  const [applied, setApplied] = useState<Filter>(makeEmpty)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [error, setError] = useState("")
  const [detail, setDetail] = useState<UpdateLog | null>(null)
  const [logView, setLogView] = useState<ExchangeLog | null>(null)

  const matchCommon = (row: { time: string; soCC: string; actor?: string; action: string }) => {
    if (applied.from && parseVnDate(row.time) < new Date(applied.from).getTime()) return false
    if (applied.to && parseVnDate(row.time) > new Date(applied.to).getTime()) return false
    if (applied.soCC && !row.soCC.toLowerCase().includes(applied.soCC.trim().toLowerCase())) return false
    if (applied.actor && row.actor && !row.actor.toLowerCase().includes(applied.actor.trim().toLowerCase())) return false
    if (applied.action !== "Tất cả" && row.action !== applied.action) return false
    return true
  }

  const updates = useMemo(() => UPDATE_LOGS.filter((r) => r.method === method && matchCommon(r)).sort((a, b) => parseVnDate(b.time) - parseVnDate(a.time)), [method, applied])
  const ops = useMemo(() => OP_LOGS.filter((r) => r.method === method && matchCommon(r)).sort((a, b) => parseVnDate(b.time) - parseVnDate(a.time)), [method, applied])
  const exchanges = useMemo(() => EXCHANGE_LOGS.filter((r) => r.method === method && matchCommon({ ...r, actor: "" })).sort((a, b) => parseVnDate(b.time) - parseVnDate(a.time)), [method, applied])

  const rows = tab === "update" ? updates : tab === "op" ? ops : exchanges
  const start = (Math.min(page, Math.max(1, Math.ceil(rows.length / pageSize))) - 1) * pageSize
  const paged = rows.slice(start, start + pageSize)

  const doSearch = () => {
    if (draft.from && draft.to && draft.to < draft.from) return setError("Từ ngày không được lớn hơn Đến ngày!")
    if (draft.from && draft.to && (new Date(draft.to).getTime() - new Date(draft.from).getTime()) / 86400000 > 365) return setError("Khoảng thời gian tra cứu không quá 1 năm!")
    setApplied(draft); setError(""); setPage(1)
  }
  const doReset = () => { setDraft(makeEmpty()); setApplied(makeEmpty()); setError(""); setPage(1) }
  const switchTab = (k: TabKey) => { setTab(k); setPage(1) }

  return (
    <div>
      <PageHeader title={`Lịch sử giao dịch công chứng ${label}`} desc={`Tra cứu nhật ký cập nhật thông tin, thao tác của người dùng và đồng bộ dữ liệu giao dịch công chứng ${label}.`} />

      {/* Bộ lọc */}
      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Từ ngày"><input type="date" value={draft.from} onChange={(e) => setDraft({ ...draft, from: e.target.value })} className={cn(inputCls, "text-[13.5px]")} /></Field>
          <Field label="Đến ngày"><input type="date" value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.target.value })} className={cn(inputCls, "text-[13.5px]")} /></Field>
          <Field label="Số công chứng"><input value={draft.soCC} onChange={(e) => setDraft({ ...draft, soCC: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} placeholder="Nhập số công chứng" className={inputCls} /></Field>
          <Field label="Người thực hiện"><input value={draft.actor} onChange={(e) => setDraft({ ...draft, actor: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} placeholder="Nhập tên/tài khoản" className={inputCls} /></Field>
          <Field label="Thao tác">
            <NativeSelect value={draft.action} onChange={(e) => setDraft({ ...draft, action: e.target.value })}>
              {OP_FILTER_OPTIONS(method).map((o) => <option key={o} value={o}>{o}</option>)}
            </NativeSelect>
          </Field>
        </div>
        {error && <div className="mt-2.5 text-[12.5px] text-red-600">{error}</div>}
        <div className="mt-[18px] flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" onClick={doReset}><RotateCcw className="size-4" />Reset</Button>
          <Button onClick={doSearch}><Search className="size-4" />Tìm kiếm</Button>
          <Button variant="outline" onClick={() => showToast(`Đang xuất Excel lịch sử giao dịch ${label}…`)}><Download className="size-4" />Xuất Excel</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 mt-[18px] flex gap-1 overflow-x-auto rounded-md border border-border bg-surface-muted p-[3px]">
        {TABS.map(([k, l]) => (
          <button key={k} onClick={() => switchTab(k)} className={cn("whitespace-nowrap rounded-md px-3.5 py-[7px] text-[13px] font-medium", tab === k ? "bg-surface text-foreground-strong shadow-xs" : "text-foreground-muted hover:text-foreground")}>
            {l}
          </button>
        ))}
      </div>

      <div className="mx-0.5 mb-2.5 flex items-center gap-2">
        <span className="text-[13px] text-foreground-muted">Kết quả:</span>
        <span className="text-[13px] font-semibold text-foreground-strong">{rows.length} bản ghi</span>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        {rows.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              {tab === "update" && <UpdateTable rows={paged as UpdateLog[]} start={start} onView={setDetail} />}
              {tab === "op" && <OpTable rows={paged as typeof ops} start={start} />}
              {tab === "exchange" && <ExchangeTable rows={paged as ExchangeLog[]} start={start} onView={setLogView} />}
            </div>
            <Pagination page={page} pageSize={pageSize} total={rows.length} unit="bản ghi" onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
          </>
        ) : (
          <EmptyState icon={<FileSearch className="size-6" />} title="Không tìm thấy dữ liệu lịch sử" desc="Không có bản ghi nhật ký nào khớp với bộ lọc và tab hiện tại." actionLabel="Reset bộ lọc" onAction={doReset} />
        )}
      </div>

      {detail && <DetailPopup log={detail} onClose={() => setDetail(null)} />}
      {logView && <LogPopup log={logView} onClose={() => setLogView(null)} />}
    </div>
  )
}

/* ============================ Bảng theo tab ============================ */

function UpdateTable({ rows, start, onView }: { rows: UpdateLog[]; start: number; onView: (l: UpdateLog) => void }) {
  return (
    <table className="w-full min-w-[1000px] border-collapse text-sm">
      <thead>
        <tr className="border-b border-border bg-neutral-50">
          <Th className="w-11 text-center">STT</Th>
          <Th className="min-w-[160px]">Thời gian</Th>
          <Th>Số CC</Th>
          <Th className="min-w-[150px]">Tổ chức CC</Th>
          <Th>Thao tác</Th>
          <Th className="min-w-[120px]">Người thực hiện</Th>
          <Th className="min-w-[240px]">Nội dung</Th>
          <Th className="min-w-[120px]">IP</Th>
          <Th className="w-16 text-center">Hành động</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.id} className="border-b border-neutral-100 hover:bg-neutral-50">
            <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{start + i + 1}</td>
            <td className="whitespace-nowrap px-4 py-3 tabular-nums text-[12.5px] text-foreground-muted">{r.time}</td>
            <td className="px-4 py-3 font-mono text-[12.5px] font-semibold text-link">{r.soCC}</td>
            <td className="px-4 py-3 text-[13px] text-foreground-muted">{r.org}</td>
            <td className="px-4 py-3"><ActionPill label={r.action} meta={UPDATE_ACTION_META[r.action]} /></td>
            <td className="px-4 py-3 font-mono text-[12px] text-foreground">{r.actor}</td>
            <td className="px-4 py-3 text-[13px] leading-snug text-foreground-muted">{r.content}</td>
            <td className="px-4 py-3 font-mono text-[12px] text-foreground-muted">{r.ip}</td>
            <td className="px-4 py-3 text-center">
              <IconBtn title="Xem chi tiết" onClick={() => onView(r)}><Eye className="size-4" /></IconBtn>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function OpTable({ rows, start }: { rows: { id: string; time: string; soCC: string; action: string; actor: string; content: string; ip: string }[]; start: number }) {
  return (
    <table className="w-full min-w-[900px] border-collapse text-sm">
      <thead>
        <tr className="border-b border-border bg-neutral-50">
          <Th className="w-11 text-center">STT</Th>
          <Th className="min-w-[160px]">Thời gian</Th>
          <Th>Số CC</Th>
          <Th>Thao tác</Th>
          <Th className="min-w-[120px]">Người thực hiện</Th>
          <Th className="min-w-[260px]">Nội dung chi tiết</Th>
          <Th className="min-w-[120px]">IP</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.id} className="border-b border-neutral-100 hover:bg-neutral-50">
            <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{start + i + 1}</td>
            <td className="whitespace-nowrap px-4 py-3 tabular-nums text-[12.5px] text-foreground-muted">{r.time}</td>
            <td className="px-4 py-3 font-mono text-[12.5px] font-semibold text-link">{r.soCC}</td>
            <td className="px-4 py-3 text-[13px] text-foreground">{r.action}</td>
            <td className="px-4 py-3 font-mono text-[12px] text-foreground">{r.actor}</td>
            <td className="px-4 py-3 text-[13px] leading-snug text-foreground-muted">{r.content}</td>
            <td className="px-4 py-3 font-mono text-[12px] text-foreground-muted">{r.ip}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function ExchangeTable({ rows, start, onView }: { rows: ExchangeLog[]; start: number; onView: (l: ExchangeLog) => void }) {
  return (
    <table className="w-full min-w-[900px] border-collapse text-sm">
      <thead>
        <tr className="border-b border-border bg-neutral-50">
          <Th className="w-11 text-center">STT</Th>
          <Th className="min-w-[160px]">Thời gian</Th>
          <Th>Số CC</Th>
          <Th className="min-w-[170px]">Tên hệ thống</Th>
          <Th>Thao tác</Th>
          <Th className="min-w-[150px]">Trạng thái đồng bộ</Th>
          <Th className="w-16 text-center">Hành động</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.id} className="border-b border-neutral-100 hover:bg-neutral-50">
            <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{start + i + 1}</td>
            <td className="whitespace-nowrap px-4 py-3 tabular-nums text-[12.5px] text-foreground-muted">{r.time}</td>
            <td className="px-4 py-3 font-mono text-[12.5px] font-semibold text-link">{r.soCC}</td>
            <td className="px-4 py-3 text-[13px] text-foreground">{r.sys}</td>
            <td className="px-4 py-3 text-[13px] text-foreground-muted">{r.action}</td>
            <td className="px-4 py-3"><ActionPill label={r.status} meta={SYNC_STATUS_META[r.status]} /></td>
            <td className="px-4 py-3 text-center">
              <IconBtn title="Xem log chi tiết" onClick={() => onView(r)}><Eye className="size-4" /></IconBtn>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function ActionPill({ label, meta }: { label: string; meta: { bg: string; fg: string; bd: string } }) {
  return (
    <span className="inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold" style={{ background: meta.bg, color: meta.fg, border: `1px solid ${meta.bd}` }}>
      {label}
    </span>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-foreground-strong">{label}</label>
      {children}
    </div>
  )
}

/* ============================ Popups ============================ */

function DetailPopup({ log, onClose }: { log: UpdateLog; onClose: () => void }) {
  const info: [string, string][] = [
    ["Số công chứng", log.soCC],
    ["Thao tác", log.action],
    ["Người thực hiện", log.actor],
    ["Thời gian", log.time],
    ["Tổ chức", log.org],
    ["IP", log.ip],
  ]
  return (
    <Modal title="Chi tiết thay đổi lịch sử" onClose={onClose}>
      <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
        {info.map(([k, v]) => (
          <div key={k} className="flex flex-col gap-0.5 border-b border-neutral-100 py-2">
            <div className="text-xs text-foreground-muted">{k}</div>
            <div className="text-[13px] text-foreground">{v}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 overflow-hidden rounded-[10px] border border-border">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-border bg-neutral-50">
              <Th className="w-11 px-3.5 py-2.5 text-center">STT</Th>
              <Th className="px-3.5 py-2.5">Trường thông tin</Th>
              <Th className="px-3.5 py-2.5">Giá trị cũ</Th>
              <Th className="px-3.5 py-2.5">Giá trị mới</Th>
            </tr>
          </thead>
          <tbody>
            {log.changes.map((c, i) => (
              <tr key={i} className="border-b border-neutral-100">
                <td className="px-3.5 py-2.5 text-center text-foreground-muted">{i + 1}</td>
                <td className="px-3.5 py-2.5 font-medium text-foreground">{c.field}</td>
                <td className="px-3.5 py-2.5 text-foreground-muted">{c.old || <span className="text-foreground-subtle">—</span>}</td>
                <td className="px-3.5 py-2.5 text-[#15803d]">{c.new || <span className="text-foreground-subtle">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  )
}

function LogPopup({ log, onClose }: { log: ExchangeLog; onClose: () => void }) {
  const info: [string, string][] = [
    ["Số công chứng", log.soCC],
    ["Tên hệ thống", log.sys],
    ["Thời gian", log.time],
    ["Thao tác", log.action],
    ["Trạng thái", log.status],
  ]
  return (
    <Modal title="Log chi tiết API trao đổi" onClose={onClose}>
      <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
        {info.map(([k, v]) => (
          <div key={k} className="flex flex-col gap-0.5 border-b border-neutral-100 py-2">
            <div className="text-xs text-foreground-muted">{k}</div>
            <div className="text-[13px] text-foreground">{v}</div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">Chi tiết JSON payload</div>
        <pre className="max-h-[320px] overflow-auto rounded-[10px] border border-border bg-neutral-950 p-4 font-mono text-[12.5px] leading-relaxed text-neutral-100">{log.payload}</pre>
      </div>
    </Modal>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex max-h-[85vh] w-[820px] max-w-full flex-col overflow-hidden rounded-xl bg-surface shadow-popover">
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
          <span className="text-[15px] font-semibold text-foreground-strong">{title}</span>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="size-[18px]" /></Button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        <div className="flex justify-end border-t border-border px-6 py-3.5">
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </div>
      </div>
    </div>
  )
}
