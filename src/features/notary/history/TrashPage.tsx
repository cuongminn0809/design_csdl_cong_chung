import { useMemo, useState } from "react"
import { RotateCcw, Search, Trash2, Undo2, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { EmptyState, Pagination, PageHeader, Th, inputCls } from "../../ingestion/shared"
import type { Method } from "../config"
import { TRASH_ITEMS, daysRemaining, parseVnDate, type TrashItem } from "./config"

interface Filter { keyword: string; deleter: string; from: string; to: string }
const EMPTY: Filter = { keyword: "", deleter: "", from: "", to: "" }

export function TrashPage({ method }: { method: Method }) {
  const showToast = useToast()
  const label = method === "paper" ? "giấy" : "điện tử"

  const [removed, setRemoved] = useState<Set<string>>(new Set())
  const [draft, setDraft] = useState<Filter>(EMPTY)
  const [applied, setApplied] = useState<Filter>(EMPTY)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [error, setError] = useState("")
  const [confirm, setConfirm] = useState<TrashItem | null>(null)

  const pool = useMemo(() => TRASH_ITEMS.filter((t) => t.method === method), [method])

  const filtered = useMemo(() => {
    return pool
      .filter((t) => !removed.has(t.id))
      .filter((t) => {
        const kw = applied.keyword.trim().toLowerCase()
        if (kw && !`${t.soCC} ${t.asset}`.toLowerCase().includes(kw)) return false
        if (applied.deleter && !t.deleter.toLowerCase().includes(applied.deleter.trim().toLowerCase())) return false
        if (applied.from && parseVnDate(t.deletedDate) < new Date(applied.from).getTime()) return false
        if (applied.to && parseVnDate(t.deletedDate) > new Date(applied.to).getTime()) return false
        return true
      })
      .sort((a, b) => parseVnDate(b.deletedDate) - parseVnDate(a.deletedDate))
  }, [pool, removed, applied])

  const start = (Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize))) - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)

  const doSearch = () => {
    if (applied.from && applied.to && applied.to < applied.from) return setError("Từ ngày xóa không được lớn hơn Đến ngày xóa!")
    if (draft.from && draft.to && draft.to < draft.from) return setError("Từ ngày xóa không được lớn hơn Đến ngày xóa!")
    if (draft.from && draft.to && (new Date(draft.to).getTime() - new Date(draft.from).getTime()) / 86400000 > 365) return setError("Khoảng thời gian tra cứu không quá 1 năm!")
    setApplied(draft); setError(""); setPage(1)
  }
  const doReset = () => { setDraft(EMPTY); setApplied(EMPTY); setError(""); setPage(1) }

  const doRestore = () => {
    if (!confirm) return
    setRemoved((prev) => new Set(prev).add(confirm.id))
    setConfirm(null)
    showToast("Khôi phục dữ liệu giao dịch công chứng thành công!")
  }

  return (
    <div>
      <PageHeader title={`Thùng rác giao dịch công chứng ${label}`} desc={`Tra cứu và khôi phục các hồ sơ giao dịch ${label} đã bị xóa tạm thời trong vòng 30 ngày của tổ chức.`} />

      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[280px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
            <input value={draft.keyword} onChange={(e) => setDraft({ ...draft, keyword: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} placeholder="Nhập số CC, tài sản, bên liên quan…" className={cn(inputCls, "h-[38px] pl-9")} />
          </div>
          <Button onClick={doSearch}><Search className="size-4" />Tìm kiếm</Button>
          <Button variant="outline" onClick={doReset}><RotateCcw className="size-4" />Reset</Button>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-3">
          <Field label="Người xóa"><input value={draft.deleter} onChange={(e) => setDraft({ ...draft, deleter: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} placeholder="Nhập tài khoản người xóa" className={inputCls} /></Field>
          <Field label="Từ ngày xóa"><input type="date" value={draft.from} onChange={(e) => setDraft({ ...draft, from: e.target.value })} className={cn(inputCls, "text-[13.5px]")} /></Field>
          <Field label="Đến ngày xóa"><input type="date" value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.target.value })} className={cn(inputCls, "text-[13.5px]")} /></Field>
        </div>
        {error && <div className="mt-2.5 text-[12.5px] text-red-600">{error}</div>}
      </div>

      <div className="mx-0.5 mb-2.5 mt-[18px] flex items-center gap-2">
        <span className="text-[13px] text-foreground-muted">Kết quả:</span>
        <span className="text-[13px] font-semibold text-foreground-strong">{filtered.length} giao dịch đã xóa tạm thời</span>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        {filtered.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-neutral-50">
                    <Th className="w-11 text-center">STT</Th>
                    <Th>Số công chứng</Th>
                    <Th>Ngày công chứng</Th>
                    <Th className="min-w-[220px]">Tên tài sản</Th>
                    <Th className="min-w-[130px]">Người xóa</Th>
                    <Th>Ngày xóa</Th>
                    <Th className="min-w-[120px]">Số ngày còn lại</Th>
                    <Th className="w-[120px] text-center">Hành động</Th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((t, i) => {
                    const remain = daysRemaining(t.deletedDate)
                    return (
                      <tr key={t.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{start + i + 1}</td>
                        <td className="px-4 py-3 font-mono text-[12.5px] font-semibold text-foreground">{t.soCC}</td>
                        <td className="whitespace-nowrap px-4 py-3 tabular-nums text-foreground-muted">{t.ngayCC}</td>
                        <td className="px-4 py-3 text-[13px] leading-snug text-foreground">{t.asset}</td>
                        <td className="px-4 py-3 font-mono text-[12px] text-foreground-muted">{t.deleter}</td>
                        <td className="whitespace-nowrap px-4 py-3 tabular-nums text-foreground-muted">{t.deletedDate}</td>
                        <td className="px-4 py-3"><RemainBadge remain={remain} /></td>
                        <td className="px-4 py-3 text-center">
                          {remain > 0 ? (
                            <Button variant="outline" size="sm" onClick={() => setConfirm(t)}><Undo2 className="size-3.5" />Khôi phục</Button>
                          ) : (
                            <span className="text-[12px] text-foreground-subtle">Đã hết hạn</span>
                          )}
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
          <EmptyState icon={<Trash2 className="size-6" />} title="Thùng rác trống" desc={`Không có giao dịch công chứng ${label} nào đang ở trạng thái đã xóa tạm thời.`} actionLabel="Reset bộ lọc" onAction={doReset} />
        )}
      </div>

      {confirm && <RestoreDialog item={confirm} onConfirm={doRestore} onClose={() => setConfirm(null)} />}
    </div>
  )
}

function RemainBadge({ remain }: { remain: number }) {
  const meta = remain <= 0
    ? { bg: "#fef2f2", fg: "#b91c1c", bd: "#fecaca" }
    : remain <= 7
      ? { bg: "#fffbeb", fg: "#b45309", bd: "#fde68a" }
      : { bg: "#f0fdf4", fg: "#15803d", bd: "#bbf7d0" }
  return (
    <span className="inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold" style={{ background: meta.bg, color: meta.fg, border: `1px solid ${meta.bd}` }}>
      {remain > 0 ? `Còn ${remain} ngày` : "Hết hạn"}
    </span>
  )
}

function RestoreDialog({ item, onConfirm, onClose }: { item: TrashItem; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-[480px] max-w-full overflow-hidden rounded-xl bg-surface shadow-popover">
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
          <span className="text-[15px] font-semibold text-foreground-strong">Xác nhận khôi phục giao dịch</span>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="size-[18px]" /></Button>
        </div>
        <div className="px-6 py-5">
          <p className="text-[13.5px] leading-relaxed text-foreground-muted">Bạn có chắc chắn muốn khôi phục giao dịch công chứng này về trạng thái hoạt động bình thường không?</p>
          <div className="mt-3 rounded-[10px] border border-border bg-neutral-50 px-4 py-3 text-[13px]">
            <Row label="Số công chứng" value={item.soCC} />
            <Row label="Ngày công chứng" value={item.ngayCC} />
            <Row label="Tên tài sản" value={item.asset} />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={onConfirm}><Undo2 className="size-4" />Xác nhận</Button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 py-0.5">
      <span className="min-w-[110px] text-foreground-muted">{label}:</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
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
