import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Ban, Check, CheckCircle2, Clock, Eye, FileSearch, History, Pencil, Plus, RotateCcw, Search, Send, Trash2, Upload, UserPlus, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { useToast } from "@/features/reconciliation/components/Toast"
import { EmptyState, IconBtn, Pagination, PageHeader, StatusPill, Th, inputCls } from "../ingestion/shared"
import {
  PREVENT_RECORDS, PREVENT_STATUS, PROVINCES, ROLE_LABEL, STATUS_TABS, isCentral, objectSummary,
  type PreventRecord, type PreventRole, type PreventStatus,
} from "./config"
import { AssignDialog, ConfirmDialog, HistoryDialog, ReasonDialog, RoleSelect, SubmitReviewDialog } from "./shared"

const parseVn = (s: string) => {
  const [d] = s.split(" ")
  const [dd, mm, yy] = d.split("/")
  return new Date(+yy, +mm - 1, +dd).getTime()
}

interface Filter {
  keyword: string; soVanBan: string; donVi: string; ngayBanHanh: string
  soVanBanDen: string; ngayVanBanDen: string; ngayTao: string; trangThai: string; tinhThanh: string
}
const EMPTY: Filter = { keyword: "", soVanBan: "", donVi: "", ngayBanHanh: "", soVanBanDen: "", ngayVanBanDen: "", ngayTao: "", trangThai: "all", tinhThanh: "all" }

const docNumbers = (r: PreventRecord) =>
  [...r.persons.map((p) => p.soGiayTo), ...r.orgs.map((o) => o.soGiayTo), ...r.assets.map((a) => a.soGiayChungNhan)].join(" ")

export function PreventListPage() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [role, setRole] = useState<PreventRole>("stp_specialist")
  const [tab, setTab] = useState<PreventStatus | "all">("all")
  const [draft, setDraft] = useState<Filter>(EMPTY)
  const [applied, setApplied] = useState<Filter>(EMPTY)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [error, setError] = useState("")
  const [version, setVersion] = useState(0) // ép render lại sau khi đổi trạng thái bản ghi

  // Dialog state
  const [confirm, setConfirm] = useState<{ rec: PreventRecord; kind: "receive" | "publish" | "submit" | "approve" | "send" } | null>(null)
  const [reason, setReason] = useState<{ rec: PreventRecord; kind: "reject_receipt" | "reject_approval" } | null>(null)
  const [assign, setAssign] = useState<PreventRecord | null>(null)
  const [review, setReview] = useState<PreventRecord | null>(null)
  const [history, setHistory] = useState<PreventRecord | null>(null)
  const [del, setDel] = useState<PreventRecord | null>(null)

  const external = role === "external"
  const central = isCentral(role)

  // BR002 — phạm vi dữ liệu theo vai trò.
  const scoped = useMemo(() => {
    void version
    return PREVENT_RECORDS.filter((r) => {
      if (external) return r.creatorRole === "external"
      if (!central) return !r.central // cấp Sở: dữ liệu địa bàn tỉnh
      return true // cấp Bộ: toàn quốc
    })
  }, [external, central, version])

  const filtered = useMemo(() => {
    const kw = applied.keyword.trim().toLowerCase()
    return scoped
      .filter((r) => {
        // Lọc theo tab (cán bộ Sở/Bộ) hoặc combo trạng thái (đơn vị ngoài)
        if (external) {
          if (applied.trangThai !== "all" && r.trangThai !== applied.trangThai) return false
        } else if (tab !== "all" && r.trangThai !== tab) return false

        if (kw) {
          const hay = `${r.soVanBan} ${r.trichYeu} ${docNumbers(r)}`.toLowerCase()
          if (!hay.includes(kw)) return false
        }
        if (applied.soVanBan && !r.soVanBan.toLowerCase().includes(applied.soVanBan.trim().toLowerCase())) return false
        if (applied.donVi && !r.donViGuiYeuCau.toLowerCase().includes(applied.donVi.trim().toLowerCase())) return false
        if (applied.soVanBanDen && !r.soVanBanDen.toLowerCase().includes(applied.soVanBanDen.trim().toLowerCase())) return false
        if (applied.ngayBanHanh && parseVn(r.ngayBanHanh) !== new Date(applied.ngayBanHanh).getTime()) return false
        if (applied.ngayVanBanDen && parseVn(r.ngayVanBanDen) !== new Date(applied.ngayVanBanDen).getTime()) return false
        if (applied.ngayTao && parseVn(r.createdAt) !== new Date(applied.ngayTao).getTime()) return false
        if (central && applied.tinhThanh !== "all" && r.tinhThanhPho !== applied.tinhThanh) return false
        return true
      })
      // BR003 — mới nhất (ngày ban hành) lên đầu.
      .sort((a, b) => parseVn(b.ngayBanHanh) - parseVn(a.ngayBanHanh))
  }, [scoped, applied, tab, external, central])

  const start = (Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize))) - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)

  const tabCount = (t: PreventStatus | "all") => scoped.filter((r) => t === "all" || r.trangThai === t).length

  const doSearch = () => {
    if (draft.keyword.length > 250) return setError("Từ khóa tìm kiếm không hợp lệ (vượt quá 250 ký tự)")
    setApplied(draft); setError(""); setPage(1)
  }
  const doReset = () => { setDraft(EMPTY); setApplied(EMPTY); setError(""); setPage(1) }

  // Thay đổi trạng thái bản ghi (mô phỏng) + toast
  const mutate = (rec: PreventRecord, status: PreventStatus, msg: string) => {
    rec.trangThai = status
    setVersion((v) => v + 1)
    showToast(msg)
  }

  return (
    <div>
      <PageHeader
        title="Danh sách thông tin ngăn chặn"
        desc="Tra cứu, tìm kiếm và xử lý các thông tin ngăn chặn, cảnh báo rủi ro trong phạm vi được phân quyền."
        actions={
          <div className="flex items-center gap-3">
            <RoleSelect role={role} onChange={(r) => { setRole(r); setTab("all"); setPage(1) }} />
            <Button onClick={() => navigate("/prevent-info/create")}><Plus className="size-4" />Thêm mới</Button>
          </div>
        }
      />

      {/* Bộ lọc */}
      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[280px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
            <input value={draft.keyword} onChange={(e) => setDraft({ ...draft, keyword: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} placeholder="Nhập số văn bản, số giấy tờ, nội dung ngăn chặn…" className={cn(inputCls, "h-[38px] pl-9")} />
          </div>
          <Button onClick={doSearch}><Search className="size-4" />Tìm kiếm</Button>
          <Button variant="outline" onClick={doReset}><RotateCcw className="size-4" />Reset</Button>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Số văn bản ban hành"><input value={draft.soVanBan} onChange={(e) => setDraft({ ...draft, soVanBan: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} className={inputCls} /></Field>
          <Field label="Đơn vị gửi yêu cầu"><input value={draft.donVi} onChange={(e) => setDraft({ ...draft, donVi: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} className={inputCls} /></Field>
          <Field label="Số văn bản đến"><input value={draft.soVanBanDen} onChange={(e) => setDraft({ ...draft, soVanBanDen: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} className={inputCls} /></Field>
          <Field label="Ngày ban hành"><input type="date" value={draft.ngayBanHanh} onChange={(e) => setDraft({ ...draft, ngayBanHanh: e.target.value })} className={cn(inputCls, "text-[13.5px]")} /></Field>
          <Field label="Ngày văn bản đến"><input type="date" value={draft.ngayVanBanDen} onChange={(e) => setDraft({ ...draft, ngayVanBanDen: e.target.value })} className={cn(inputCls, "text-[13.5px]")} /></Field>
          <Field label="Ngày tạo"><input type="date" value={draft.ngayTao} onChange={(e) => setDraft({ ...draft, ngayTao: e.target.value })} className={cn(inputCls, "text-[13.5px]")} /></Field>
          {external && (
            <Field label="Trạng thái">
              <NativeSelect value={draft.trangThai} onChange={(e) => setDraft({ ...draft, trangThai: e.target.value })}>
                <option value="all">Tất cả</option>
                {(Object.keys(PREVENT_STATUS) as PreventStatus[]).map((s) => <option key={s} value={s}>{PREVENT_STATUS[s].label}</option>)}
              </NativeSelect>
            </Field>
          )}
          {central && (
            <Field label="Tỉnh/Thành phố">
              <NativeSelect value={draft.tinhThanh} onChange={(e) => setDraft({ ...draft, tinhThanh: e.target.value })}>
                <option value="all">Tất cả</option>
                {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </NativeSelect>
            </Field>
          )}
        </div>
        {error && <div className="mt-2.5 text-[12.5px] text-red-600">{error}</div>}
      </div>

      {/* Tab trạng thái (cán bộ Sở/Bộ) */}
      {!external && (
        <div className="mb-4 mt-[18px] flex flex-wrap gap-1 rounded-md border border-border bg-surface-muted p-[3px]">
          {STATUS_TABS.map(([k, l]) => (
            <button key={k} onClick={() => { setTab(k); setPage(1) }} className={cn("flex items-center gap-1.5 rounded-md px-3 py-[6px] text-[13px] font-medium", tab === k ? "bg-surface text-foreground-strong shadow-xs" : "text-foreground-muted hover:text-foreground")}>
              {l}
              <span className={cn("rounded-full px-1.5 text-[11px] font-semibold", tab === k ? "bg-neutral-900 text-white" : "bg-neutral-200 text-foreground-muted")}>{tabCount(k)}</span>
            </button>
          ))}
        </div>
      )}

      <div className={cn("mx-0.5 mb-2.5 flex items-center gap-2", external && "mt-[18px]")}>
        <span className="text-[13px] text-foreground-muted">Kết quả:</span>
        <span className="text-[13px] font-semibold text-foreground-strong">Tìm thấy {filtered.length} kết quả</span>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        {filtered.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1080px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-neutral-50">
                    <Th className="w-11 text-center">STT</Th>
                    <Th className="min-w-[110px]">Số văn bản</Th>
                    <Th className="min-w-[260px]">Thông tin ngăn chặn</Th>
                    <Th className="min-w-[160px]">Đơn vị gửi yêu cầu</Th>
                    <Th>Ngày ban hành</Th>
                    <Th>Số VB đến</Th>
                    <Th>Ngày VB đến</Th>
                    <Th className="min-w-[150px]">Ngày tạo</Th>
                    {external && <Th className="min-w-[130px]">Trạng thái</Th>}
                    {central && <Th className="min-w-[140px]">Tỉnh/Thành phố</Th>}
                    <Th className="min-w-[176px] text-center">Thao tác</Th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((r, i) => (
                    <tr key={r.id} onClick={() => navigate(`/prevent-info/detail/${r.id}`)} className="cursor-pointer border-b border-neutral-100 align-top hover:bg-neutral-50">
                      <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{start + i + 1}</td>
                      <td className="px-4 py-3 font-mono text-[12.5px] font-semibold text-link">{r.soVanBan}</td>
                      <td className="px-4 py-3 text-[13px] leading-snug text-foreground">
                        <span className="mr-1.5 rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] font-semibold text-foreground-strong">{objectSummary(r)}</span>
                        <span className="text-foreground-muted">{r.trichYeu}</span>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-foreground-muted">{r.donViGuiYeuCau}</td>
                      <td className="whitespace-nowrap px-4 py-3 tabular-nums text-foreground-muted">{r.ngayBanHanh}</td>
                      <td className="px-4 py-3 font-mono text-[12px] text-foreground-muted">{r.soVanBanDen}</td>
                      <td className="whitespace-nowrap px-4 py-3 tabular-nums text-foreground-muted">{r.ngayVanBanDen}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-[12.5px] tabular-nums text-foreground-muted">{r.createdAt}</td>
                      {external && <td className="px-4 py-3"><StatusPill meta={PREVENT_STATUS[r.trangThai]} /></td>}
                      {central && <td className="px-4 py-3 text-[13px] text-foreground-muted">{r.tinhThanhPho}</td>}
                      <td className="whitespace-nowrap px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-nowrap items-center justify-center gap-0.5">
                          <IconBtn title="Xem chi tiết" onClick={() => navigate(`/prevent-info/detail/${r.id}`)}><Eye className="size-4" /></IconBtn>
                          <IconBtn title="Xem lịch sử" onClick={() => setHistory(r)}><History className="size-4" /></IconBtn>
                          <RowActions
                            rec={r} role={role}
                            onEdit={() => navigate(`/prevent-info/update/${r.id}`)}
                            onDelete={() => setDel(r)}
                            onSend={() => setConfirm({ rec: r, kind: "send" })}
                            onReceive={() => setConfirm({ rec: r, kind: "receive" })}
                            onRejectReceipt={() => setReason({ rec: r, kind: "reject_receipt" })}
                            onPublish={() => setConfirm({ rec: r, kind: "publish" })}
                            onSubmit={() => setReview(r)}
                            onApprove={() => setConfirm({ rec: r, kind: "approve" })}
                            onRejectApproval={() => setReason({ rec: r, kind: "reject_approval" })}
                            onAssign={() => setAssign(r)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={pageSize} total={filtered.length} unit="bản ghi" onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
          </>
        ) : (
          <EmptyState icon={<FileSearch className="size-6" />} title="Không tìm thấy dữ liệu thông tin ngăn chặn" desc="Không có bản ghi nào khớp với bộ lọc và trạng thái hiện tại." actionLabel="Reset bộ lọc" onAction={doReset} />
        )}
      </div>

      {/* ===== Dialogs ===== */}
      {confirm && (
        <ConfirmDialog
          title={CONFIRM_META[confirm.kind].title}
          message={CONFIRM_META[confirm.kind].message}
          confirmLabel={CONFIRM_META[confirm.kind].confirmLabel}
          onClose={() => setConfirm(null)}
          onConfirm={() => {
            const { rec, kind } = confirm
            setConfirm(null)
            if (kind === "receive") { rec.nguoiXuLy = ROLE_LABEL[role]; mutate(rec, "processing", "Tiếp nhận thông tin ngăn chặn thành công.") }
            else if (kind === "send") mutate(rec, "pending_receipt", "Chuyển Sở tư pháp tiếp nhận thành công.")
            else if (kind === "publish") mutate(rec, "approved", "Đăng tải thành công.")
            else if (kind === "approve") mutate(rec, "approved", "Phê duyệt và đăng tải thành công.")
            else if (kind === "submit") mutate(rec, "pending_approval", "Trình lãnh đạo thành công.")
          }}
        />
      )}
      {reason && (
        <ReasonDialog
          title={reason.kind === "reject_receipt" ? "Lý do từ chối tiếp nhận" : "Lý do từ chối phê duyệt"}
          label={reason.kind === "reject_receipt" ? "Lý do từ chối tiếp nhận" : "Lý do từ chối duyệt"}
          onClose={() => setReason(null)}
          onSubmit={(v) => {
            const { rec, kind } = reason
            rec.lyDoTuChoi = v
            setReason(null)
            mutate(rec, "rejected", kind === "reject_receipt" ? "Từ chối tiếp nhận thành công." : "Từ chối duyệt thành công.")
          }}
        />
      )}
      {assign && (
        <AssignDialog leaderRole={role} onClose={() => setAssign(null)} onSubmit={(staff) => { assign.nguoiXuLy = staff; setAssign(null); mutate(assign, "processing", "Phân công thành công.") }} />
      )}
      {review && (
        <SubmitReviewDialog leaderRole={role} onClose={() => setReview(null)} onSubmit={() => { const r = review; setReview(null); mutate(r, "pending_approval", "Trình lãnh đạo thành công.") }} />
      )}
      {history && <HistoryDialog history={history.history} onClose={() => setHistory(null)} />}
      {del && (
        <ConfirmDialog
          title="Xác nhận xóa" danger confirmLabel="Xác nhận"
          message="Bạn có chắc chắn muốn xóa thông tin ngăn chặn/cảnh báo rủi ro này không?"
          onClose={() => setDel(null)}
          onConfirm={() => {
            const idx = PREVENT_RECORDS.indexOf(del)
            if (idx >= 0) PREVENT_RECORDS.splice(idx, 1)
            setDel(null); setVersion((v) => v + 1)
            showToast("Xóa thành công thông tin ngăn chặn/cảnh báo rủi ro.")
          }}
        />
      )}
    </div>
  )
}

const CONFIRM_META: Record<string, { title: string; message: string; confirmLabel: string }> = {
  receive: { title: "Xác nhận tiếp nhận", message: "Bạn có chắc chắn muốn tiếp nhận xử lý thông tin ngăn chặn này không?", confirmLabel: "Tiếp nhận" },
  send: { title: "Chuyển Sở Tư pháp", message: "Bạn có chắc chắn muốn gửi thông tin ngăn chặn này lên Sở Tư pháp tiếp nhận không?", confirmLabel: "Xác nhận" },
  publish: { title: "Xác nhận đăng tải", message: "Bạn có chắc chắn muốn đăng tải trực tiếp thông tin ngăn chặn này không?", confirmLabel: "Đăng tải" },
  approve: { title: "Xác nhận phê duyệt", message: "Bạn có chắc chắn muốn phê duyệt và đăng tải thông tin ngăn chặn này không?", confirmLabel: "Phê duyệt" },
  submit: { title: "Trình lãnh đạo", message: "Bạn có chắc chắn muốn trình lãnh đạo duyệt thông tin ngăn chặn này không?", confirmLabel: "Xác nhận" },
}

/** Nút hành động theo trạng thái + vai trò (Visibility Rules mục 4.11). */
function RowActions({ rec, role, onEdit, onDelete, onSend, onReceive, onRejectReceipt, onPublish, onSubmit, onApprove, onRejectApproval, onAssign }: {
  rec: PreventRecord; role: PreventRole
  onEdit: () => void; onDelete: () => void; onSend: () => void; onReceive: () => void; onRejectReceipt: () => void
  onPublish: () => void; onSubmit: () => void; onApprove: () => void; onRejectApproval: () => void; onAssign: () => void
}) {
  const s = rec.trangThai
  const owner = rec.creatorRole === role
  const external = role === "external"
  const stpSpec = role === "stp_specialist"
  const specialist = role === "stp_specialist" || role === "btp_specialist"
  const leader = role === "stp_leader" || role === "btp_leader"

  const btns: React.ReactNode[] = []
  // Lưu nháp
  if (s === "draft" && owner) {
    btns.push(<IconBtn key="edit" title="Chỉnh sửa" onClick={onEdit}><Pencil className="size-4" /></IconBtn>)
    if (external) btns.push(<IconBtn key="send" title="Chuyển Sở Tư pháp" onClick={onSend}><Send className="size-4" /></IconBtn>)
    btns.push(<IconBtn key="del" title="Xóa" danger onClick={onDelete}><Trash2 className="size-4" /></IconBtn>)
  }
  // Chờ tiếp nhận — Chuyên viên STP
  if (s === "pending_receipt" && stpSpec) {
    btns.push(<IconBtn key="edit" title="Chỉnh sửa" onClick={onEdit}><Pencil className="size-4" /></IconBtn>)
    btns.push(<IconBtn key="recv" title="Tiếp nhận" onClick={onReceive}><Check className="size-4" /></IconBtn>)
    btns.push(<IconBtn key="rej" title="Từ chối tiếp nhận" danger onClick={onRejectReceipt}><X className="size-4" /></IconBtn>)
  }
  // Đang xử lý — Chuyên viên STP/BTP
  if (s === "processing" && specialist) {
    btns.push(<IconBtn key="edit" title="Chỉnh sửa" onClick={onEdit}><Pencil className="size-4" /></IconBtn>)
    btns.push(<IconBtn key="pub" title="Đăng tải" onClick={onPublish}><Upload className="size-4" /></IconBtn>)
    btns.push(<IconBtn key="sub" title="Trình lãnh đạo" onClick={onSubmit}><Send className="size-4" /></IconBtn>)
    if (owner) btns.push(<IconBtn key="del" title="Xóa" danger onClick={onDelete}><Trash2 className="size-4" /></IconBtn>)
  }
  // Chờ duyệt — Lãnh đạo
  if (s === "pending_approval" && leader) {
    btns.push(<IconBtn key="app" title="Phê duyệt" onClick={onApprove}><CheckCircle2 className="size-4" /></IconBtn>)
    btns.push(<IconBtn key="rejd" title="Từ chối duyệt" danger onClick={onRejectApproval}><Ban className="size-4" /></IconBtn>)
    btns.push(<IconBtn key="asg" title="Phân công xử lý" onClick={onAssign}><UserPlus className="size-4" /></IconBtn>)
  }
  // Chờ duyệt — chuyên viên chỉ xem (biểu tượng chờ)
  if (s === "pending_approval" && specialist) {
    btns.push(<IconBtn key="wait" title="Đang chờ lãnh đạo phê duyệt" disabled><Clock className="size-4" /></IconBtn>)
  }
  return <>{btns}</>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-foreground-strong">{label}</label>
      {children}
    </div>
  )
}
