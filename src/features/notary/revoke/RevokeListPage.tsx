import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle2, Eye, FileSearch, Pencil, RotateCcw, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { EmptyState, IconBtn, Pagination, PageHeader, StatusPill, Th, inputCls } from "../../ingestion/shared"
import { getSource, REVOKE_REQUESTS, REVOKE_STATUS, type RevokeStatus, type Role } from "./config"
import { partiesLine, RoleSelect } from "./shared"

const parseVn = (s: string) => {
  const [dd, mm, yy] = s.split("/")
  return new Date(+yy, +mm - 1, +dd).getTime()
}

const STATUS_OPTIONS: [string, string][] = [
  ["all", "Tất cả"],
  ["draft", "Lưu nháp"],
  ["pending", "Chờ duyệt"],
  ["revise", "Yêu cầu sửa"],
  ["approved", "Phê duyệt"],
]

interface Filter { keyword: string; from: string; to: string; status: string }
const EMPTY: Filter = { keyword: "", from: "", to: "", status: "all" }

export function RevokeListPage() {
  const navigate = useNavigate()
  const [role, setRole] = useState<Role>("truong")
  const [draft, setDraft] = useState<Filter>(EMPTY)
  const [applied, setApplied] = useState<Filter>(EMPTY)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [error, setError] = useState("")

  const filtered = useMemo(() => {
    const kw = applied.keyword.trim().toLowerCase()
    return REVOKE_REQUESTS
      .filter((r) => {
        const s = getSource(r)
        if (kw) {
          const hay = `${r.soCC} ${s?.soCC ?? ""} ${partiesLine(s)} ${r.ccv}`.toLowerCase()
          if (!hay.includes(kw)) return false
        }
        if (applied.status !== "all" && r.status !== applied.status) return false
        if (applied.from && parseVn(r.ngayCC) < new Date(applied.from).getTime()) return false
        if (applied.to && parseVn(r.ngayCC) > new Date(applied.to).getTime()) return false
        return true
      })
      // Mặc định: Ngày công chứng hủy giảm dần.
      .sort((a, b) => parseVn(b.ngayCC) - parseVn(a.ngayCC))
  }, [applied])

  const start = (Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize))) - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)

  const doSearch = () => {
    if (draft.keyword.length > 250) return setError("Từ khóa tìm kiếm không hợp lệ (vượt quá 250 ký tự)")
    if (draft.from && draft.to && draft.to < draft.from) return setError("Khoảng ngày tìm kiếm không hợp lệ")
    setApplied(draft); setError(""); setPage(1)
  }
  const doReset = () => { setDraft(EMPTY); setApplied(EMPTY); setError(""); setPage(1) }

  return (
    <div>
      <PageHeader
        title="Danh sách tuyên hủy hợp đồng, giao dịch"
        desc="Tìm kiếm và xử lý các yêu cầu tuyên hủy hợp đồng, giao dịch đã công chứng trong tổ chức hành nghề công chứng."
        actions={<RoleSelect role={role} onChange={setRole} />}
      />

      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[280px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
            <input value={draft.keyword} onChange={(e) => setDraft({ ...draft, keyword: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} placeholder="Nhập số công chứng hủy / số công chứng gốc / tên bên liên quan…" className={cn(inputCls, "h-[38px] pl-9")} />
          </div>
          <Button onClick={doSearch}><Search className="size-4" />Tìm kiếm</Button>
          <Button variant="outline" onClick={doReset}><RotateCcw className="size-4" />Reset</Button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Ngày công chứng hủy — Từ"><input type="date" value={draft.from} onChange={(e) => setDraft({ ...draft, from: e.target.value })} className={cn(inputCls, "text-[13.5px]")} /></Field>
          <Field label="Ngày công chứng hủy — Đến"><input type="date" value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.target.value })} className={cn(inputCls, "text-[13.5px]")} /></Field>
          <Field label="Trạng thái yêu cầu">
            <NativeSelect value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
              {STATUS_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </NativeSelect>
          </Field>
        </div>
        {error && <div className="mt-2.5 text-[12.5px] text-red-600">{error}</div>}
      </div>

      <div className="mx-0.5 mb-2.5 mt-[18px] flex items-center gap-2">
        <span className="text-[13px] text-foreground-muted">Kết quả:</span>
        <span className="text-[13px] font-semibold text-foreground-strong">{filtered.length} yêu cầu tuyên hủy</span>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        {filtered.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-neutral-50">
                    <Th className="w-11 text-center">STT</Th>
                    <Th>Số CC hủy</Th>
                    <Th>Ngày CC hủy</Th>
                    <Th>Số CC gốc</Th>
                    <Th>Ngày CC gốc</Th>
                    <Th className="min-w-[220px]">Bên liên quan</Th>
                    <Th className="min-w-[150px]">Công chứng viên</Th>
                    <Th className="min-w-[130px]">Trạng thái</Th>
                    <Th className="w-[104px] text-center">Hành động</Th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((r, i) => {
                    const s = getSource(r)
                    const canEdit = role === "ccv" && (r.status === "draft" || r.status === "revise")
                    const canApprove = role === "truong" && r.status === "pending"
                    return (
                      <tr key={r.id} onClick={() => navigate(`/notary-transaction/revoke/view/${r.id}`)} className="cursor-pointer border-b border-neutral-100 align-top hover:bg-neutral-50">
                        <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{start + i + 1}</td>
                        <td className="px-4 py-3 font-mono text-[12.5px] font-semibold text-link">{r.soCC}</td>
                        <td className="whitespace-nowrap px-4 py-3 tabular-nums text-foreground-muted">{r.ngayCC}</td>
                        <td className="px-4 py-3 font-mono text-[12.5px] text-foreground">{s?.soCC ?? "—"}</td>
                        <td className="whitespace-nowrap px-4 py-3 tabular-nums text-foreground-muted">{s?.ngayCC ?? "—"}</td>
                        <td className="px-4 py-3 text-[13px] leading-snug text-foreground-muted">{partiesLine(s)}</td>
                        <td className="px-4 py-3 text-[13px] text-foreground">{r.ccv}</td>
                        <td className="px-4 py-3"><StatusPill meta={REVOKE_STATUS[r.status as RevokeStatus]} /></td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-0.5">
                            <IconBtn title="Xem chi tiết" onClick={() => navigate(`/notary-transaction/revoke/view/${r.id}`)}><Eye className="size-4" /></IconBtn>
                            {canEdit && <IconBtn title="Chỉnh sửa" onClick={() => navigate(`/notary-transaction/revoke/${r.sourceId}`)}><Pencil className="size-4" /></IconBtn>}
                            {canApprove && <IconBtn title="Phê duyệt" onClick={() => navigate(`/notary-transaction/revoke/detail/${r.id}`)}><CheckCircle2 className="size-4" /></IconBtn>}
                          </div>
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
          <EmptyState icon={<FileSearch className="size-6" />} title="Không tìm thấy yêu cầu tuyên hủy" desc="Không có yêu cầu tuyên hủy nào khớp với bộ lọc hiện tại." actionLabel="Reset bộ lọc" onAction={doReset} />
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
