import { useMemo, useState } from "react"
import { CheckCircle2, Download, Eye, FileSearch, Inbox, Pencil, Plus, Search, Send, ShieldCheck } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { EmptyState, PageHeader, Pagination, StatusPill, Th, inputCls } from "../ingestion/shared"
import { AcceptDialog, DecideDialog, DetailDialog, ProvideDialog, RequestFormDialog, SubmitDialog } from "./dialogs"
import {
  CURRENT_CV_NAME, CURRENT_ORG, CURRENT_REQUESTER, ROLES, STATUS_LIST, STATUS_META, TCHNCC_LIST,
  createRequest, exportMsg, fmtVN, isCvStp, isLanhDao, isTchncc, respondAccept, scopeByRole, useRequests,
  type DataProvideRequest, type DprRole,
} from "./config"

type PopupState = { type: "form"; mode: "create" | "edit"; record?: DataProvideRequest } | { type: "detail"; record: DataProvideRequest } | { type: "accept"; record: DataProvideRequest } | { type: "submit"; record: DataProvideRequest } | { type: "decide"; record: DataProvideRequest } | { type: "provide"; record: DataProvideRequest } | null

export function DataProvideRequestListPage() {
  const showToast = useToast()
  const all = useRequests()
  const [role, setRole] = useState<DprRole>("t_tchncc")
  const [keyword, setKeyword] = useState("")
  const [org, setOrg] = useState("all")
  const [status, setStatus] = useState("all")
  const [tuNgay, setTuNgay] = useState("")
  const [denNgay, setDenNgay] = useState("")
  const [applied, setApplied] = useState({ keyword: "", org: "all", status: "all", tuNgay: "", denNgay: "" })
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [popup, setPopup] = useState<PopupState>(null)

  const scoped = useMemo(() => scopeByRole(all, role), [all, role])
  const rows = useMemo(() => {
    let r = scoped
    if (applied.keyword.trim()) { const k = applied.keyword.trim().toLowerCase(); r = r.filter((x) => x.maYeuCau.toLowerCase().includes(k) || x.lyDo.toLowerCase().includes(k)) }
    if (applied.org !== "all") r = r.filter((x) => x.toChuc === applied.org)
    if (applied.status !== "all") r = r.filter((x) => x.trangThai === applied.status)
    if (applied.tuNgay) r = r.filter((x) => !x.ngayGui || x.ngayGui.slice(0, 10) >= applied.tuNgay)
    if (applied.denNgay) r = r.filter((x) => !x.ngayGui || x.ngayGui.slice(0, 10) <= applied.denNgay)
    return [...r].sort((a, b) => (b.ngayGui ?? "").localeCompare(a.ngayGui ?? ""))
  }, [scoped, applied])

  const doSearch = () => {
    if (tuNgay && denNgay && tuNgay > denNgay) return setError("Thời gian từ ngày không được lớn hơn đến ngày.")
    setError(""); setApplied({ keyword, org, status, tuNgay, denNgay }); setPage(1)
  }
  const doReset = () => { setKeyword(""); setOrg("all"); setStatus("all"); setTuNgay(""); setDenNgay(""); setError(""); setApplied({ keyword: "", org: "all", status: "all", tuNgay: "", denNgay: "" }); setPage(1) }
  const doExport = () => { const r = exportMsg(rows.length); showToast(r.msg, r.kind) }

  const canCreate = isTchncc(role) || isCvStp(role)
  const canEdit = (r: DataProvideRequest) => r.trangThai === "Lưu nháp" && ((isTchncc(role) && r.vaiTroNguoiTao === "t_tchncc" && r.toChuc === CURRENT_ORG) || (isCvStp(role) && r.vaiTroNguoiTao === "cv_stp"))
  const canSend = (r: DataProvideRequest) => r.trangThai === "Lưu nháp" && isTchncc(role) && r.vaiTroNguoiTao === "t_tchncc"
  const canAcceptDraft = (r: DataProvideRequest) => r.trangThai === "Lưu nháp" && isCvStp(role) && r.vaiTroNguoiTao === "cv_stp"
  const canAccept = (r: DataProvideRequest) => r.trangThai === "Chờ tiếp nhận" && isCvStp(role)
  const canSubmit = (r: DataProvideRequest) => r.trangThai === "Đã tiếp nhận" && isCvStp(role)
  const canDecide = (r: DataProvideRequest) => r.trangThai === "Chờ duyệt" && isLanhDao(role)
  const canProvide = (r: DataProvideRequest) => r.trangThai === "Đã phê duyệt" && isCvStp(role)

  const quickSend = (r: DataProvideRequest) => {
    createRequest({ toChuc: r.toChuc, nguoiYeuCau: r.nguoiYeuCau, nenTang: r.nenTang, tuNgay: r.tuNgay, denNgay: r.denNgay, lyDo: r.lyDo, fileName: r.fileName, fileSize: r.fileSize }, "Chờ tiếp nhận", { name: CURRENT_REQUESTER, role })
    showToast(`Gửi yêu cầu cung cấp dữ liệu thành công.`)
  }
  const quickAccept = (r: DataProvideRequest) => { respondAccept(r.id, CURRENT_CV_NAME); showToast("Tiếp nhận yêu cầu cung cấp dữ liệu thành công.") }

  const total = rows.length
  const paged = rows.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="space-y-4">
      <PageHeader title="Danh sách yêu cầu cung cấp dữ liệu" desc="Quản lý yêu cầu khôi phục dữ liệu giao dịch công chứng của tổ chức hành nghề công chứng về nền tảng công chứng."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] text-foreground-muted">Vai trò:</span>
            <NativeSelect value={role} onChange={(e) => { setRole(e.target.value as DprRole); setPage(1) }} className="h-8 w-[230px] text-[12.5px]">
              {ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </NativeSelect>
          </div>
        } />

      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="mb-1 text-[13px] font-semibold text-foreground-strong">Bộ lọc tìm kiếm</div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Từ khóa (Mã/Tên yêu cầu)</label><input value={keyword} onChange={(e) => setKeyword(e.target.value)} maxLength={250} placeholder="Nhập mã hoặc lý do yêu cầu…" className={inputCls} /></div>
          <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">TCHNCC</label>
            <NativeSelect value={org} onChange={(e) => setOrg(e.target.value)}><option value="all">Tất cả</option>{TCHNCC_LIST.map((o) => <option key={o} value={o}>{o}</option>)}</NativeSelect>
          </div>
          <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Trạng thái</label>
            <NativeSelect value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">Tất cả</option>{STATUS_LIST.map((s) => <option key={s} value={s}>{s}</option>)}</NativeSelect>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Từ ngày</label><input type="date" value={tuNgay} onChange={(e) => { setTuNgay(e.target.value); setError("") }} className={cn(inputCls, "text-[13.5px]")} /></div>
            <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Đến ngày</label><input type="date" value={denNgay} onChange={(e) => { setDenNgay(e.target.value); setError("") }} className={cn(inputCls, "text-[13.5px]")} /></div>
          </div>
        </div>
        {error && <div className="mt-3 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]">{error}</div>}
        <div className="mt-4 flex gap-2.5"><Button onClick={doSearch}><Search className="size-4" />Tìm kiếm</Button><Button variant="outline" onClick={doReset}>Đặt lại</Button></div>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
          <div className="text-[13px] font-semibold text-foreground-strong">Kết quả tìm kiếm <span className="ml-1 font-normal text-foreground-muted">({total} yêu cầu)</span></div>
          <div className="flex gap-2">
            {canCreate && <Button size="sm" onClick={() => setPopup({ type: "form", mode: "create" })}><Plus className="size-4" />Thêm mới yêu cầu</Button>}
            <Button variant="outline" size="sm" onClick={doExport}><Download className="size-4" />Xuất danh sách</Button>
          </div>
        </div>
        {paged.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm" style={{ minWidth: 1100 }}>
                <thead><tr className="border-b border-border bg-neutral-50">
                  <Th className="w-11 text-center">STT</Th><Th>Mã yêu cầu</Th><Th>Tên yêu cầu</Th><Th>Ngày gửi</Th><Th>TCHNCC</Th><Th>Nội dung</Th><Th>Trạng thái</Th><Th className="min-w-[200px]">Thao tác</Th>
                </tr></thead>
                <tbody>{paged.map((r, i) => (
                  <tr key={r.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{(page - 1) * pageSize + i + 1}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{r.maYeuCau}</td>
                    <td className="px-4 py-3 text-foreground-muted">Khôi phục dữ liệu {fmtVN(r.tuNgay)}-{fmtVN(r.denNgay)}{r.vaiTroNguoiTao === "cv_stp" && r.trangThai === "Lưu nháp" && <span className="ml-1.5 rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10.5px] text-foreground-subtle">tạo thay</span>}</td>
                    <td className="px-4 py-3 tabular-nums text-foreground-muted">{r.ngayGui ? fmtVN(r.ngayGui.slice(0, 10)) : "—"}</td>
                    <td className="px-4 py-3 text-foreground-muted">{r.toChuc}</td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-foreground-muted" title={r.lyDo}>{r.lyDo}</td>
                    <td className="px-4 py-3"><StatusPill meta={STATUS_META[r.trangThai]} /></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Button variant="outline" size="sm" onClick={() => setPopup({ type: "detail", record: r })}><Eye className="size-3.5" /></Button>
                        {canEdit(r) && <Button variant="outline" size="sm" onClick={() => setPopup({ type: "form", mode: "edit", record: r })}><Pencil className="size-3.5" /></Button>}
                        {canSend(r) && <Button size="sm" onClick={() => quickSend(r)}><Send className="size-3.5" />Gửi yêu cầu</Button>}
                        {canAcceptDraft(r) && <Button size="sm" onClick={() => quickAccept(r)}><Inbox className="size-3.5" />Tiếp nhận yêu cầu</Button>}
                        {canAccept(r) && <Button size="sm" onClick={() => setPopup({ type: "accept", record: r })}><Inbox className="size-3.5" />Tiếp nhận yêu cầu</Button>}
                        {canSubmit(r) && <Button size="sm" onClick={() => setPopup({ type: "submit", record: r })}><Send className="size-3.5" />Trình duyệt</Button>}
                        {canDecide(r) && <Button size="sm" onClick={() => setPopup({ type: "decide", record: r })}><ShieldCheck className="size-3.5" />Xử lý</Button>}
                        {canProvide(r) && <Button size="sm" onClick={() => setPopup({ type: "provide", record: r })}><CheckCircle2 className="size-3.5" />Xác nhận cung cấp dữ liệu</Button>}
                      </div>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={pageSize} total={total} unit="yêu cầu" onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
          </>
        ) : (
          <EmptyState icon={<FileSearch className="size-6" />} title="Không có yêu cầu" desc="Chưa có yêu cầu cung cấp dữ liệu nào phù hợp với điều kiện lọc." />
        )}
      </div>

      {popup?.type === "form" && <RequestFormDialog mode={popup.mode} role={role} record={popup.record} onClose={() => setPopup(null)} />}
      {popup?.type === "detail" && <DetailDialog record={popup.record} role={role} onClose={() => setPopup(null)} />}
      {popup?.type === "accept" && <AcceptDialog record={popup.record} onClose={() => setPopup(null)} />}
      {popup?.type === "submit" && <SubmitDialog record={popup.record} onClose={() => setPopup(null)} />}
      {popup?.type === "decide" && <DecideDialog record={popup.record} role={role} onClose={() => setPopup(null)} />}
      {popup?.type === "provide" && <ProvideDialog record={popup.record} onClose={() => setPopup(null)} />}
    </div>
  )
}
