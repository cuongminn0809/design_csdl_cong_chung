import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Ban, Check, CheckCircle2, Clock, Eye, FileSearch, History, Pencil, Plus, RotateCcw, Search, Send, Trash2, Upload, UserPlus, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { useToast } from "@/features/reconciliation/components/Toast"
import { EmptyState, IconBtn, Pagination, PageHeader, StatusPill, Th, inputCls } from "../ingestion/shared"
import { blockById } from "./config"
import {
  PROVINCES, RELEASE_RECORDS, RELEASE_STATUS, ROLE_LABEL, STATUS_TABS, isCentral, isCreatorRole, isLeader,
  releaseSummary, type ReleaseRecord, type ReleaseRole, type ReleaseStatus,
} from "./config"
import { AssignDialog, ConfirmDialog, HistoryDialog, ReasonDialog, RoleSelect, SubmitReviewDialog } from "./shared"

const parseVn = (s: string) => {
  if (!s) return 0
  const [d] = s.split(" ")
  const [dd, mm, yy] = d.split("/")
  return new Date(+yy, +mm - 1, +dd).getTime()
}

interface Filter { keyword: string; trangThai: string; tinhThanh: string }
const EMPTY: Filter = { keyword: "", trangThai: "all", tinhThanh: "all" }

export function ReleaseListPage() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [role, setRole] = useState<ReleaseRole>("stp_specialist")
  const [tab, setTab] = useState<ReleaseStatus | "all">("all")
  const [draft, setDraft] = useState<Filter>(EMPTY)
  const [applied, setApplied] = useState<Filter>(EMPTY)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [error, setError] = useState("")
  const [version, setVersion] = useState(0)

  const [confirm, setConfirm] = useState<{ rec: ReleaseRecord; kind: "receive" | "publish" | "approve" | "send" } | null>(null)
  const [reason, setReason] = useState<{ rec: ReleaseRecord; kind: "reject_receipt" | "reject_approval" } | null>(null)
  const [assign, setAssign] = useState<ReleaseRecord | null>(null)
  const [review, setReview] = useState<ReleaseRecord | null>(null)
  const [history, setHistory] = useState<ReleaseRecord | null>(null)
  const [del, setDel] = useState<ReleaseRecord | null>(null)

  const creator = isCreatorRole(role)
  const central = isCentral(role)

  const scoped = useMemo(() => {
    void version
    return RELEASE_RECORDS.filter((r) => {
      if (creator) return isCreatorRole(r.creatorRole) // đơn vị ngoài / CCV: bản ghi mình tạo
      if (!central) return !r.central
      return true
    })
  }, [creator, central, version])

  const filtered = useMemo(() => {
    const kw = applied.keyword.trim().toLowerCase()
    return scoped
      .filter((r) => {
        if (creator) { if (applied.trangThai !== "all" && r.trangThai !== applied.trangThai) return false }
        else if (tab !== "all" && r.trangThai !== tab) return false
        if (kw && !`${r.soVanBan} ${r.trichYeu}`.toLowerCase().includes(kw)) return false
        if (central && applied.tinhThanh !== "all" && r.tinhThanhPho !== applied.tinhThanh) return false
        return true
      })
      .sort((a, b) => parseVn(b.ngayBanHanh) - parseVn(a.ngayBanHanh))
  }, [scoped, applied, tab, creator, central])

  const start = (Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize))) - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)
  const tabCount = (t: ReleaseStatus | "all") => scoped.filter((r) => t === "all" || r.trangThai === t).length

  const doSearch = () => {
    if (draft.keyword.length > 250) return setError("Từ khóa tìm kiếm không hợp lệ (vượt quá 250 ký tự)")
    setApplied(draft); setError(""); setPage(1)
  }
  const doReset = () => { setDraft(EMPTY); setApplied(EMPTY); setError(""); setPage(1) }

  const mutate = (rec: ReleaseRecord, status: ReleaseStatus, msg: string) => {
    rec.trangThai = status
    // BR004 — đăng tải/duyệt thành công thì đối tượng ngăn chặn liên kết chuyển "Đã giải tỏa".
    if (status === "approved") rec.blockIds.forEach((id) => { const b = blockById(id); if (b) b.status = "released" })
    setVersion((v) => v + 1)
    showToast(msg)
  }

  return (
    <div>
      <PageHeader
        title="Danh sách thông tin giải tỏa"
        desc="Tra cứu, tìm kiếm và xử lý các văn bản giải tỏa ngăn chặn trong phạm vi được phân quyền."
        actions={
          <div className="flex items-center gap-3">
            <RoleSelect role={role} onChange={(r) => { setRole(r); setTab("all"); setPage(1) }} />
            <Button onClick={() => navigate("/giai-toa-info/create")}><Plus className="size-4" />Thêm mới</Button>
          </div>
        }
      />

      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[280px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
            <input value={draft.keyword} onChange={(e) => setDraft({ ...draft, keyword: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} placeholder="Nhập số văn bản giải tỏa hoặc trích yếu…" className={cn(inputCls, "h-[38px] pl-9")} />
          </div>
          {creator && (
            <NativeSelect value={draft.trangThai} onChange={(e) => setDraft({ ...draft, trangThai: e.target.value })} className="h-[38px] w-[180px]">
              <option value="all">Tất cả trạng thái</option>
              {(Object.keys(RELEASE_STATUS) as ReleaseStatus[]).map((s) => <option key={s} value={s}>{RELEASE_STATUS[s].label}</option>)}
            </NativeSelect>
          )}
          {central && (
            <NativeSelect value={draft.tinhThanh} onChange={(e) => setDraft({ ...draft, tinhThanh: e.target.value })} className="h-[38px] w-[170px]">
              <option value="all">Tất cả tỉnh/thành</option>
              {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
            </NativeSelect>
          )}
          <Button onClick={doSearch}><Search className="size-4" />Tìm kiếm</Button>
          <Button variant="outline" onClick={doReset}><RotateCcw className="size-4" />Xóa điều kiện</Button>
        </div>
        {error && <div className="mt-2.5 text-[12.5px] text-red-600">{error}</div>}
      </div>

      {!creator && (
        <div className="mb-4 mt-[18px] flex flex-wrap gap-1 rounded-md border border-border bg-surface-muted p-[3px]">
          {STATUS_TABS.map(([k, l]) => (
            <button key={k} onClick={() => { setTab(k); setPage(1) }} className={cn("flex items-center gap-1.5 rounded-md px-3 py-[6px] text-[13px] font-medium", tab === k ? "bg-surface text-foreground-strong shadow-xs" : "text-foreground-muted hover:text-foreground")}>
              {l}
              <span className={cn("rounded-full px-1.5 text-[11px] font-semibold", tab === k ? "bg-neutral-900 text-white" : "bg-neutral-200 text-foreground-muted")}>{tabCount(k)}</span>
            </button>
          ))}
        </div>
      )}

      <div className={cn("mx-0.5 mb-2.5 flex items-center gap-2", creator && "mt-[18px]")}>
        <span className="text-[13px] text-foreground-muted">Kết quả:</span>
        <span className="text-[13px] font-semibold text-foreground-strong">Tìm thấy {filtered.length} kết quả</span>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        {filtered.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1040px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-neutral-50">
                    <Th className="w-11 text-center">STT</Th>
                    <Th className="min-w-[110px]">Số văn bản</Th>
                    <Th className="min-w-[280px]">Thông tin giải tỏa</Th>
                    <Th className="min-w-[160px]">Đơn vị gửi yêu cầu</Th>
                    <Th>Ngày VB đến</Th>
                    <Th>Ngày ban hành</Th>
                    {creator && <Th className="min-w-[130px]">Trạng thái</Th>}
                    {central && <Th className="min-w-[140px]">Tỉnh/Thành phố</Th>}
                    <Th className="min-w-[176px] text-center">Thao tác</Th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((r, i) => (
                    <tr key={r.id} onClick={() => navigate(`/giai-toa-info/detail/${r.id}`)} className="cursor-pointer border-b border-neutral-100 align-top hover:bg-neutral-50">
                      <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{start + i + 1}</td>
                      <td className="px-4 py-3 font-mono text-[12.5px] font-semibold text-link">{r.soVanBan}</td>
                      <td className="px-4 py-3 text-[13px] leading-snug text-foreground-muted">{releaseSummary(r)}</td>
                      <td className="px-4 py-3 text-[13px] text-foreground-muted">{r.donViGuiYeuCau}</td>
                      <td className="whitespace-nowrap px-4 py-3 tabular-nums text-foreground-muted">{r.ngayNhan || "—"}</td>
                      <td className="whitespace-nowrap px-4 py-3 tabular-nums text-foreground-muted">{r.ngayBanHanh}</td>
                      {creator && <td className="px-4 py-3"><StatusPill meta={RELEASE_STATUS[r.trangThai]} /></td>}
                      {central && <td className="px-4 py-3 text-[13px] text-foreground-muted">{r.tinhThanhPho}</td>}
                      <td className="whitespace-nowrap px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-nowrap items-center justify-center gap-0.5">
                          <IconBtn title="Xem chi tiết" onClick={() => navigate(`/giai-toa-info/detail/${r.id}`)}><Eye className="size-4" /></IconBtn>
                          <IconBtn title="Xem lịch sử" onClick={() => setHistory(r)}><History className="size-4" /></IconBtn>
                          <RowActions rec={r} role={role}
                            onEdit={() => navigate(`/giai-toa-info/update/${r.id}`)}
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
          <EmptyState icon={<FileSearch className="size-6" />} title="Không tìm thấy dữ liệu thông tin giải tỏa" desc="Không có văn bản giải tỏa nào khớp với bộ lọc và trạng thái hiện tại." actionLabel="Xóa điều kiện" onAction={doReset} />
        )}
      </div>

      {confirm && (
        <ConfirmDialog
          title={CONFIRM_META[confirm.kind].title} message={CONFIRM_META[confirm.kind].message} confirmLabel={CONFIRM_META[confirm.kind].confirmLabel}
          onClose={() => setConfirm(null)}
          onConfirm={() => {
            const { rec, kind } = confirm
            setConfirm(null)
            if (kind === "receive") { rec.nguoiXuLy = ROLE_LABEL[role]; mutate(rec, "processing", "Tiếp nhận giải tỏa thành công.") }
            else if (kind === "send") mutate(rec, "pending_receipt", "Gửi Sở Tư pháp phê duyệt thành công.")
            else if (kind === "publish") mutate(rec, "approved", "Đăng tải văn bản giải tỏa thành công.")
            else if (kind === "approve") mutate(rec, "approved", "Phê duyệt thông tin giải tỏa thành công.")
          }}
        />
      )}
      {reason && (
        <ReasonDialog
          title={reason.kind === "reject_receipt" ? "Từ chối tiếp nhận giải tỏa" : "Từ chối duyệt giải tỏa"}
          label={reason.kind === "reject_receipt" ? "Lý do từ chối tiếp nhận" : "Lý do từ chối duyệt"}
          onClose={() => setReason(null)}
          onSubmit={(v) => { const { rec } = reason; rec.lyDoTuChoi = v; setReason(null); mutate(rec, "rejected", "Từ chối tiếp nhận/Từ chối duyệt thành công.") }}
        />
      )}
      {assign && <AssignDialog leaderRole={role} onClose={() => setAssign(null)} onSubmit={(staff) => { assign.nguoiXuLy = staff; setAssign(null); mutate(assign, "processing", "Phân công cán bộ xử lý thành công.") }} />}
      {review && <SubmitReviewDialog leaderRole={role} onClose={() => setReview(null)} onSubmit={() => { const r = review; setReview(null); mutate(r, "pending_approval", "Trình lãnh đạo thành công.") }} />}
      {history && <HistoryDialog history={history.history} onClose={() => setHistory(null)} />}
      {del && (
        <ConfirmDialog title="Xác nhận xóa" danger confirmLabel="Xác nhận"
          message="Bạn có chắc chắn muốn xóa văn bản giải tỏa ngăn chặn này không?"
          onClose={() => setDel(null)}
          onConfirm={() => {
            const idx = RELEASE_RECORDS.indexOf(del)
            if (idx >= 0) RELEASE_RECORDS.splice(idx, 1)
            setDel(null); setVersion((v) => v + 1)
            showToast("Xóa thành công thông tin giải tỏa ngăn chặn.")
          }}
        />
      )}
    </div>
  )
}

const CONFIRM_META: Record<string, { title: string; message: string; confirmLabel: string }> = {
  receive: { title: "Xác nhận tiếp nhận", message: "Bạn có chắc chắn muốn tiếp nhận xử lý văn bản giải tỏa này không?", confirmLabel: "Tiếp nhận" },
  send: { title: "Gửi Sở Tư pháp", message: "Bạn có chắc chắn muốn gửi văn bản giải tỏa này lên Sở Tư pháp phê duyệt không?", confirmLabel: "Gửi STP" },
  publish: { title: "Xác nhận đăng tải", message: "Bạn có chắc chắn muốn đăng tải văn bản giải tỏa này không? Các đối tượng liên kết sẽ được giải tỏa ngăn chặn.", confirmLabel: "Đăng tải" },
  approve: { title: "Xác nhận phê duyệt", message: "Bạn có chắc chắn muốn duyệt và đăng tải văn bản giải tỏa này không?", confirmLabel: "Phê duyệt" },
}

function RowActions({ rec, role, onEdit, onDelete, onSend, onReceive, onRejectReceipt, onPublish, onSubmit, onApprove, onRejectApproval, onAssign }: {
  rec: ReleaseRecord; role: ReleaseRole
  onEdit: () => void; onDelete: () => void; onSend: () => void; onReceive: () => void; onRejectReceipt: () => void
  onPublish: () => void; onSubmit: () => void; onApprove: () => void; onRejectApproval: () => void; onAssign: () => void
}) {
  const s = rec.trangThai
  const owner = rec.creatorRole === role
  const creator = isCreatorRole(role)
  const stpSpec = role === "stp_specialist"
  const specialist = role === "stp_specialist" || role === "btp_specialist"
  const leader = isLeader(role)

  const btns: React.ReactNode[] = []
  if (s === "draft" && owner) {
    btns.push(<IconBtn key="edit" title="Chỉnh sửa" onClick={onEdit}><Pencil className="size-4" /></IconBtn>)
    if (creator) btns.push(<IconBtn key="send" title="Gửi Sở Tư pháp" onClick={onSend}><Send className="size-4" /></IconBtn>)
    btns.push(<IconBtn key="del" title="Xóa" danger onClick={onDelete}><Trash2 className="size-4" /></IconBtn>)
  }
  if (s === "pending_receipt" && stpSpec) {
    btns.push(<IconBtn key="edit" title="Chỉnh sửa" onClick={onEdit}><Pencil className="size-4" /></IconBtn>)
    btns.push(<IconBtn key="recv" title="Tiếp nhận" onClick={onReceive}><Check className="size-4" /></IconBtn>)
    btns.push(<IconBtn key="rej" title="Từ chối tiếp nhận" danger onClick={onRejectReceipt}><X className="size-4" /></IconBtn>)
  }
  if (s === "processing" && specialist) {
    btns.push(<IconBtn key="edit" title="Chỉnh sửa" onClick={onEdit}><Pencil className="size-4" /></IconBtn>)
    btns.push(<IconBtn key="pub" title="Đăng tải" onClick={onPublish}><Upload className="size-4" /></IconBtn>)
    btns.push(<IconBtn key="sub" title="Trình lãnh đạo" onClick={onSubmit}><Send className="size-4" /></IconBtn>)
    if (owner) btns.push(<IconBtn key="del" title="Xóa" danger onClick={onDelete}><Trash2 className="size-4" /></IconBtn>)
  }
  if (s === "processing" && leader) {
    btns.push(<IconBtn key="asg" title="Phân công xử lý" onClick={onAssign}><UserPlus className="size-4" /></IconBtn>)
  }
  if (s === "pending_approval" && leader) {
    btns.push(<IconBtn key="app" title="Duyệt" onClick={onApprove}><CheckCircle2 className="size-4" /></IconBtn>)
    btns.push(<IconBtn key="rejd" title="Từ chối duyệt" danger onClick={onRejectApproval}><Ban className="size-4" /></IconBtn>)
    btns.push(<IconBtn key="asg" title="Phân công xử lý" onClick={onAssign}><UserPlus className="size-4" /></IconBtn>)
  }
  if (s === "pending_approval" && specialist) {
    btns.push(<IconBtn key="wait" title="Đang chờ lãnh đạo phê duyệt" disabled><Clock className="size-4" /></IconBtn>)
  }
  return <>{btns}</>
}
