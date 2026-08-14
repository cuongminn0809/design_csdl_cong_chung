import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Download, Eye, FileSearch, RotateCcw, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { useToast } from "@/features/reconciliation/components/Toast"
import { EmptyState, IconBtn, Pagination, PageHeader, Th, inputCls } from "../../ingestion/shared"
import { getSource, REVOKE_REQUESTS } from "./config"
import { partiesLine } from "./shared"

const parseVn = (s: string) => {
  const [dd, mm, yy] = s.split("/")
  return new Date(+yy, +mm - 1, +dd).getTime()
}

interface Filter {
  soHuy: string; ngayHuyFrom: string; ngayHuyTo: string
  soGoc: string; ngayGocFrom: string; ngayGocTo: string
  blq: string; ccv: string; method: string
}
const EMPTY: Filter = { soHuy: "", ngayHuyFrom: "", ngayHuyTo: "", soGoc: "", ngayGocFrom: "", ngayGocTo: "", blq: "", ccv: "", method: "all" }

export function RevokedListPage() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [draft, setDraft] = useState<Filter>(EMPTY)
  const [applied, setApplied] = useState<Filter>(EMPTY)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [error, setError] = useState("")

  const approved = useMemo(() => REVOKE_REQUESTS.filter((r) => r.status === "approved"), [])

  const filtered = useMemo(() => {
    return approved
      .filter((r) => {
        const s = getSource(r)
        if (applied.soHuy && !r.soCC.toLowerCase().includes(applied.soHuy.trim().toLowerCase())) return false
        if (applied.soGoc && !(s?.soCC ?? "").toLowerCase().includes(applied.soGoc.trim().toLowerCase())) return false
        if (applied.blq && !partiesLine(s).toLowerCase().includes(applied.blq.trim().toLowerCase())) return false
        if (applied.ccv && !r.ccv.toLowerCase().includes(applied.ccv.trim().toLowerCase())) return false
        if (applied.method !== "all" && r.method !== applied.method) return false
        if (applied.ngayHuyFrom && parseVn(r.ngayCC) < new Date(applied.ngayHuyFrom).getTime()) return false
        if (applied.ngayHuyTo && parseVn(r.ngayCC) > new Date(applied.ngayHuyTo).getTime()) return false
        if (s && applied.ngayGocFrom && parseVn(s.ngayCC) < new Date(applied.ngayGocFrom).getTime()) return false
        if (s && applied.ngayGocTo && parseVn(s.ngayCC) > new Date(applied.ngayGocTo).getTime()) return false
        return true
      })
      .sort((a, b) => parseVn(b.ngayCC) - parseVn(a.ngayCC))
  }, [approved, applied])

  const stats = useMemo(() => ({
    total: filtered.length,
    paper: filtered.filter((r) => r.method === "paper").length,
    electronic: filtered.filter((r) => r.method === "electronic").length,
  }), [filtered])

  const start = (Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize))) - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)

  const doSearch = () => {
    if ((draft.ngayHuyFrom && draft.ngayHuyTo && draft.ngayHuyTo < draft.ngayHuyFrom) || (draft.ngayGocFrom && draft.ngayGocTo && draft.ngayGocTo < draft.ngayGocFrom))
      return setError("Khoảng ngày tìm kiếm không hợp lệ")
    setApplied(draft); setError(""); setPage(1)
  }
  const doReset = () => { setDraft(EMPTY); setApplied(EMPTY); setError(""); setPage(1) }

  return (
    <div>
      <PageHeader
        title="Danh sách hợp đồng, giao dịch đã hủy"
        desc="Thống kê và tra cứu các hợp đồng, giao dịch đã được phê duyệt hủy chính thức trong phạm vi quản lý."
        actions={<Button variant="outline" onClick={() => showToast("Đang xuất danh sách hợp đồng đã hủy…")}><Download className="size-4" />Xuất dữ liệu</Button>}
      />

      {/* Thống kê */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Tổng số hợp đồng đã hủy" value={stats.total} tone="neutral" />
        <StatCard label="Công chứng giấy" value={stats.paper} tone="blue" />
        <StatCard label="Công chứng điện tử" value={stats.electronic} tone="teal" />
      </div>

      {/* Bộ lọc */}
      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Số công chứng hủy"><input value={draft.soHuy} onChange={(e) => setDraft({ ...draft, soHuy: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} placeholder="Nhập số CC hủy" className={inputCls} /></Field>
          <Field label="Số công chứng gốc"><input value={draft.soGoc} onChange={(e) => setDraft({ ...draft, soGoc: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} placeholder="Nhập số CC gốc" className={inputCls} /></Field>
          <Field label="Phương thức công chứng">
            <NativeSelect value={draft.method} onChange={(e) => setDraft({ ...draft, method: e.target.value })}>
              <option value="all">Tất cả</option>
              <option value="paper">Công chứng giấy</option>
              <option value="electronic">Công chứng điện tử</option>
            </NativeSelect>
          </Field>
          <Field label="Ngày công chứng hủy — Từ"><input type="date" value={draft.ngayHuyFrom} onChange={(e) => setDraft({ ...draft, ngayHuyFrom: e.target.value })} className={cn(inputCls, "text-[13.5px]")} /></Field>
          <Field label="Ngày công chứng hủy — Đến"><input type="date" value={draft.ngayHuyTo} onChange={(e) => setDraft({ ...draft, ngayHuyTo: e.target.value })} className={cn(inputCls, "text-[13.5px]")} /></Field>
          <Field label="Bên liên quan"><input value={draft.blq} onChange={(e) => setDraft({ ...draft, blq: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} placeholder="Nhập tên bên liên quan" className={inputCls} /></Field>
          <Field label="Ngày công chứng gốc — Từ"><input type="date" value={draft.ngayGocFrom} onChange={(e) => setDraft({ ...draft, ngayGocFrom: e.target.value })} className={cn(inputCls, "text-[13.5px]")} /></Field>
          <Field label="Ngày công chứng gốc — Đến"><input type="date" value={draft.ngayGocTo} onChange={(e) => setDraft({ ...draft, ngayGocTo: e.target.value })} className={cn(inputCls, "text-[13.5px]")} /></Field>
          <Field label="Công chứng viên"><input value={draft.ccv} onChange={(e) => setDraft({ ...draft, ccv: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} placeholder="Nhập tên CCV" className={inputCls} /></Field>
        </div>
        {error && <div className="mt-2.5 text-[12.5px] text-red-600">{error}</div>}
        <div className="mt-[18px] flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" onClick={doReset}><RotateCcw className="size-4" />Đặt lại</Button>
          <Button onClick={doSearch}><Search className="size-4" />Tìm kiếm</Button>
        </div>
      </div>

      <div className="mx-0.5 mb-2.5 mt-[18px] flex items-center gap-2">
        <span className="text-[13px] text-foreground-muted">Kết quả:</span>
        <span className="text-[13px] font-semibold text-foreground-strong">{filtered.length} hợp đồng đã hủy</span>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        {approved.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-neutral-50">
                    <Th className="w-11 text-center">STT</Th>
                    <Th>Số CC hủy</Th>
                    <Th>Ngày CC hủy</Th>
                    <Th>Số CC gốc</Th>
                    <Th>Ngày CC gốc</Th>
                    <Th className="min-w-[220px]">Bên liên quan</Th>
                    <Th className="min-w-[150px]">Công chứng viên</Th>
                    <Th>Phương thức</Th>
                    <Th className="w-16 text-center">Hành động</Th>
                  </tr>
                </thead>
                <tbody>
                  {paged.length ? paged.map((r, i) => {
                    const s = getSource(r)
                    return (
                      <tr key={r.id} onClick={() => navigate(`/notary-transaction/revoke/view/${r.id}`)} className="cursor-pointer border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{start + i + 1}</td>
                        <td className="px-4 py-3 font-mono text-[12.5px] font-semibold text-link">{r.soCC}</td>
                        <td className="whitespace-nowrap px-4 py-3 tabular-nums text-foreground-muted">{r.ngayCC}</td>
                        <td className="px-4 py-3 font-mono text-[12.5px] text-foreground">{s?.soCC ?? "—"}</td>
                        <td className="whitespace-nowrap px-4 py-3 tabular-nums text-foreground-muted">{s?.ngayCC ?? "—"}</td>
                        <td className="px-4 py-3 text-[13px] leading-snug text-foreground-muted">{partiesLine(s)}</td>
                        <td className="px-4 py-3 text-[13px] text-foreground">{r.ccv}</td>
                        <td className="px-4 py-3"><MethodBadge method={r.method} /></td>
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <IconBtn title="Xem chi tiết" onClick={() => navigate(`/notary-transaction/revoke/view/${r.id}`)}><Eye className="size-4" /></IconBtn>
                        </td>
                      </tr>
                    )
                  }) : (
                    <tr><td colSpan={9} className="px-4 py-12 text-center text-[13.5px] text-foreground-muted">Không có bản ghi khớp với bộ lọc.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={pageSize} total={filtered.length} unit="bản ghi" onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
          </>
        ) : (
          <EmptyState icon={<FileSearch className="size-6" />} title="Chưa có hợp đồng nào bị hủy" desc="Chưa có giao dịch công chứng nào được phê duyệt hủy chính thức trong phạm vi quản lý." />
        )}
      </div>
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

function StatCard({ label, value, tone }: { label: string; value: number; tone: "neutral" | "blue" | "teal" }) {
  const styles = {
    neutral: "border-border bg-surface",
    blue: "border-[#bfdbfe] bg-[#eff6ff]",
    teal: "border-[#99f6e4] bg-[#f0fdfa]",
  }[tone]
  const valueColor = { neutral: "text-foreground-strong", blue: "text-[#1d4ed8]", teal: "text-[#0d9488]" }[tone]
  return (
    <div className={cn("rounded-[14px] border p-5 shadow-sm", styles)}>
      <div className="text-[12.5px] font-medium text-foreground-muted">{label}</div>
      <div className={cn("mt-1.5 text-[30px] font-semibold leading-none tabular-nums", valueColor)}>{value}</div>
    </div>
  )
}

function MethodBadge({ method }: { method: "paper" | "electronic" }) {
  const c = method === "paper"
    ? { bg: "#eff6ff", fg: "#1d4ed8", bd: "#bfdbfe", label: "Giấy" }
    : { bg: "#f0fdfa", fg: "#0d9488", bd: "#99f6e4", label: "Điện tử" }
  return (
    <span className="inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold" style={{ background: c.bg, color: c.fg, border: `1px solid ${c.bd}` }}>
      {c.label}
    </span>
  )
}
