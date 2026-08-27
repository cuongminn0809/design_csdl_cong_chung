import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Eye, FileSearch, RotateCcw, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { EmptyState, IconBtn, Pagination, Th, inputCls } from "../ingestion/shared"
import { HistoryDetailModal } from "./dialogs"
import { SEARCH_LOGS, TCHNCC_BY_STP, type CcvSearchLog } from "./config"

// Vai trò xem lịch sử + phạm vi dữ liệu (BR-01/02/03).
const HISTORY_ROLES = [
  { key: "btp", label: "Chuyên viên BTP" },
  { key: "stp", label: "Chuyên viên STP (TP Hà Nội)" },
  { key: "tchncc", label: "Lãnh đạo TCHNCC (VPCC Minh Anh)" },
] as const
type HistoryRole = (typeof HISTORY_ROLES)[number]["key"]

function inScope(role: HistoryRole, log: CcvSearchLog): boolean {
  if (role === "btp") return true // BR-02: toàn quốc
  if (role === "stp") return log.scopeKey === "TP Hà Nội" || (log.scopeLevel === "tchncc" && (TCHNCC_BY_STP["TP Hà Nội"] ?? []).includes(log.scopeKey))
  return log.scopeKey === "VPCC Minh Anh" // BR-03: TCHNCC của mình
}

const parseVn = (s: string) => {
  const [d, m, rest] = s.split("/")
  const y = rest.slice(0, 4)
  return `${y}-${m}-${d}`
}

interface HFilter { nguoi: string; donVi: string; thongTin: string; ket: string; daXem: string; ip: string; tu: string; den: string }
const EMPTY: HFilter = { nguoi: "", donVi: "all", thongTin: "", ket: "", daXem: "", ip: "", tu: "", den: "" }

export function CcvHistoryPage() {
  const navigate = useNavigate()
  const [role, setRole] = useState<HistoryRole>("btp")
  const [draft, setDraft] = useState<HFilter>(EMPTY)
  const [applied, setApplied] = useState<HFilter>(EMPTY)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [detail, setDetail] = useState<CcvSearchLog | null>(null)
  const [, force] = useState(0)

  const donViOptions = useMemo(() => [...new Set(SEARCH_LOGS.map((l) => l.donVi))], [])

  const filtered = useMemo(() => {
    return SEARCH_LOGS.filter((l) => inScope(role, l)).filter((l) => {
      if (applied.nguoi && !l.nguoiTraCuu.toLowerCase().includes(applied.nguoi.trim().toLowerCase())) return false
      if (applied.donVi !== "all" && l.donVi !== applied.donVi) return false
      if (applied.thongTin && !l.thongTinTraCuu.toLowerCase().includes(applied.thongTin.trim().toLowerCase())) return false
      if (applied.ket && l.ketQua < Number(applied.ket)) return false
      if (applied.daXem && l.soKetQuaDaXem < Number(applied.daXem)) return false
      if (applied.ip && !l.ip.includes(applied.ip.trim())) return false
      const iso = parseVn(l.thoiGian)
      if (applied.tu && iso < applied.tu) return false
      if (applied.den && iso > applied.den) return false
      return true
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, applied, detail])

  const start = (Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize))) - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)

  const doSearch = () => {
    if (draft.tu && draft.den && draft.tu > draft.den) return setError("Khoảng thời gian tra cứu không hợp lệ.")
    if ([draft.ket, draft.daXem].some((v) => v !== "" && Number(v) < 0)) return setError("Số lượng kết quả không được nhỏ hơn 0.")
    setError(""); setApplied(draft); setPage(1)
  }
  const doReset = () => { setDraft(EMPTY); setApplied(EMPTY); setError(""); setPage(1) }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/tra-cuu/cong-chung-vien-tchncc")} className="flex size-9 items-center justify-center rounded-md border border-border bg-surface text-foreground-muted shadow-xs hover:bg-surface-muted"><ArrowLeft className="size-4" /></button>
          <div>
            <h3 className="text-[22px] font-semibold leading-tight tracking-[-0.02em] text-foreground-strong">Xem lịch sử tra cứu thông tin Công chứng viên</h3>
            <p className="mt-1 text-[13px] text-foreground-muted">Nhật ký các lần tra cứu thông tin công chứng viên theo phạm vi dữ liệu được phép xem.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12.5px] text-foreground-muted">Vai trò:</span>
          <NativeSelect value={role} onChange={(e) => { setRole(e.target.value as HistoryRole); setPage(1); force((v) => v + 1) }} className="h-8 w-[250px] text-[12.5px]">
            {HISTORY_ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
          </NativeSelect>
        </div>
      </div>

      {/* BỘ LỌC */}
      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Thời gian tra cứu — Từ"><input type="date" value={draft.tu} onChange={(e) => setDraft({ ...draft, tu: e.target.value })} className={cn(inputCls, "text-[13.5px]")} /></Field>
          <Field label="Thời gian tra cứu — Đến"><input type="date" value={draft.den} onChange={(e) => setDraft({ ...draft, den: e.target.value })} className={cn(inputCls, "text-[13.5px]")} /></Field>
          <Field label="Người thực hiện"><input value={draft.nguoi} onChange={(e) => setDraft({ ...draft, nguoi: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} className={inputCls} placeholder="Nhập tên người dùng…" /></Field>
          <Field label="Đơn vị">
            <NativeSelect value={draft.donVi} onChange={(e) => setDraft({ ...draft, donVi: e.target.value })}>
              <option value="all">Tất cả đơn vị</option>
              {donViOptions.map((d) => <option key={d} value={d}>{d}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Thông tin tra cứu"><input value={draft.thongTin} onChange={(e) => setDraft({ ...draft, thongTin: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} className={inputCls} placeholder="Từ khóa / bộ lọc…" /></Field>
          <Field label="Kết quả tra cứu ≥"><input inputMode="numeric" value={draft.ket} onChange={(e) => setDraft({ ...draft, ket: e.target.value.replace(/[^\d]/g, "") })} className={inputCls} placeholder="0" /></Field>
          <Field label="Số kết quả đã xem ≥"><input inputMode="numeric" value={draft.daXem} onChange={(e) => setDraft({ ...draft, daXem: e.target.value.replace(/[^\d]/g, "") })} className={inputCls} placeholder="0" /></Field>
          <Field label="Địa chỉ IP"><input value={draft.ip} onChange={(e) => setDraft({ ...draft, ip: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} className={inputCls} placeholder="Nhập địa chỉ IP…" /></Field>
        </div>
        {error && <div className="mt-3 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]">{error}</div>}
        <div className="mt-4 flex gap-2.5">
          <Button onClick={doSearch}><Search className="size-4" />Tra cứu</Button>
          <Button variant="outline" onClick={doReset}><RotateCcw className="size-4" />Reset</Button>
        </div>
      </div>

      {/* DANH SÁCH */}
      <div className="mt-4 overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        {filtered.length ? (
          <>
            <div className="border-b border-border px-5 py-3 text-[13px] text-foreground-muted">Hiển thị <span className="font-semibold text-foreground-strong">{start + 1}-{Math.min(start + pageSize, filtered.length)}</span> trong tổng số {filtered.length} bản ghi</div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1180px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-neutral-50">
                    <Th className="min-w-[150px]">Thời gian tra cứu</Th>
                    <Th className="min-w-[150px]">Người thực hiện</Th>
                    <Th className="min-w-[170px]">Đơn vị</Th>
                    <Th className="min-w-[260px]">Thông tin tra cứu</Th>
                    <Th className="text-center">Kết quả</Th>
                    <Th className="text-center">Số KQ đã xem</Th>
                    <Th className="min-w-[120px]">Địa chỉ IP</Th>
                    <Th className="w-[92px] text-center">Chức năng</Th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((l) => (
                    <tr key={l.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="whitespace-nowrap px-4 py-3 text-[12.5px] tabular-nums text-foreground-muted">{l.thoiGian}</td>
                      <td className="px-4 py-3 text-[13px] text-foreground">{l.nguoiTraCuu}</td>
                      <td className="px-4 py-3 text-[13px] text-foreground-muted">{l.donVi}</td>
                      <td className="max-w-[320px] px-4 py-3 text-[13px] leading-snug text-foreground-muted">{l.thongTinTraCuu}</td>
                      <td className="px-4 py-3 text-center tabular-nums text-foreground">{l.ketQua}</td>
                      <td className="px-4 py-3 text-center tabular-nums font-semibold text-foreground-strong">{l.soKetQuaDaXem}</td>
                      <td className="px-4 py-3 font-mono text-[12px] text-foreground-muted">{l.ip}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center"><IconBtn title="Xem chi tiết" onClick={() => setDetail(l)}><Eye className="size-4" /></IconBtn></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={pageSize} total={filtered.length} unit="bản ghi" onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
          </>
        ) : (
          <EmptyState icon={<FileSearch className="size-6" />} title="Không có dữ liệu lịch sử tra cứu công chứng viên" desc="Không có nhật ký nào khớp với bộ lọc và phạm vi dữ liệu hiện tại." actionLabel="Đặt lại bộ lọc" onAction={doReset} />
        )}
      </div>

      {detail && <HistoryDetailModal log={detail} onClose={() => setDetail(null)} />}
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
