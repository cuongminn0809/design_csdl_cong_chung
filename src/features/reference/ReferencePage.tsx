import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AlertCircle, Ban, CheckCircle2, Eye, FileText, QrCode, RotateCcw, Search, Send, Upload, XCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { useToast } from "@/features/reconciliation/components/Toast"
import { ConfirmDialog } from "../prevent/shared"
import { EmptyState, IconBtn, Pagination, PageHeader, StatusPill, Th, inputCls } from "../ingestion/shared"
import { ApproveModal, QrScanModal, RejectModal, RequestDetailModal, SendRequestModal } from "./dialogs"
import {
  REQ_STATUS, REQ_STATUS_OPTIONS, REQUESTS, SO_TU_PHAP, TCHNCC_BY_STP, VIEW_LOGS,
  approveRequest, cancelRequest, createRequest, hasActiveRequest, maskDoc, maskEmail, maskPhone, rejectRequest, searchByQr, searchBySoCC, stats,
  type ReferenceRequest, type SendMethod, type VbccdtRecord,
} from "./config"

type Tab = "search" | "sent" | "received" | "history"
const TABS: [Tab, string][] = [["search", "Tham chiếu & Gửi yêu cầu"], ["sent", "Yêu cầu đã gửi"], ["received", "Yêu cầu đã nhận"], ["history", "Lịch sử & Thống kê"]]

export function ReferencePage() {
  const [tab, setTab] = useState<Tab>("search")
  const [version, setVersion] = useState(0)
  const bump = () => setVersion((v) => v + 1)

  return (
    <div>
      <PageHeader title="Quản lý yêu cầu tham chiếu VBCCĐT" desc="Tra cứu văn bản công chứng điện tử bằng mã QR/số công chứng và quản lý yêu cầu xem chi tiết file." />
      <div className="mb-4 flex flex-wrap gap-1 rounded-md border border-border bg-surface-muted p-[3px]">
        {TABS.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={cn("rounded-md px-4 py-[7px] text-[13px] font-medium", tab === k ? "bg-surface text-foreground-strong shadow-xs" : "text-foreground-muted hover:text-foreground")}>{l}</button>
        ))}
      </div>

      {tab === "search" && <SearchTab onCreated={bump} />}
      {tab === "sent" && <SentTab key={version} onChange={bump} />}
      {tab === "received" && <ReceivedTab key={version} onChange={bump} />}
      {tab === "history" && <HistoryTab key={version} />}
    </div>
  )
}

/* ============================ TAB 1 — THAM CHIẾU & GỬI YÊU CẦU ============================ */
function SearchTab({ onCreated }: { onCreated: () => void }) {
  const showToast = useToast()
  const [method, setMethod] = useState<"qr" | "socc">("qr")
  const [qr, setQr] = useState("")
  const [stp, setStp] = useState("all")
  const [tchncc, setTchncc] = useState("all")
  const [soCC, setSoCC] = useState("")
  const [error, setError] = useState("")
  const [results, setResults] = useState<VbccdtRecord[] | null>(null)
  const [selected, setSelected] = useState<VbccdtRecord | null>(null)
  const [partIdx, setPartIdx] = useState<number | null>(null)
  const [sendMethod, setSendMethod] = useState<SendMethod | "">("")
  const [scanning, setScanning] = useState(false)
  const [sendOpen, setSendOpen] = useState(false)

  const tchnccOptions = useMemo(() => (stp !== "all" ? TCHNCC_BY_STP[stp] ?? [] : []), [stp])

  const reset = () => { setQr(""); setStp("all"); setTchncc("all"); setSoCC(""); setError(""); setResults(null); setSelected(null); setPartIdx(null); setSendMethod("") }

  const doSearch = () => {
    if (method === "qr") {
      if (!qr.trim()) return setError("Vui lòng nhập mã QR, quét hoặc tải ảnh mã QR.")
    } else {
      if (stp === "all" || tchncc === "all" || !soCC.trim()) return setError("Vui lòng chọn Sở Tư pháp, Tổ chức HNCC và nhập chính xác số công chứng.")
    }
    setError("")
    const res = method === "qr" ? searchByQr(qr) : searchBySoCC(soCC, stp, tchncc)
    setPartIdx(null); setSendMethod("")
    if (!res.length) { setResults([]); setSelected(null); return showToast("Không tìm thấy văn bản công chứng điện tử theo thông tin tra cứu.", "error") }
    setResults(res); setSelected(res.length === 1 ? res[0] : null)
  }

  const onScanned = () => { setScanning(false); setQr("TC-2026-001"); showToast("Quét mã QR thành công: TC-2026-001") }
  const onUpload = () => { setQr("TC-2026-002"); showToast("Đã đọc mã QR từ ảnh: TC-2026-002") }

  const chooseTx = (v: VbccdtRecord) => { setSelected(v); setPartIdx(null); setSendMethod("") }

  const openSend = () => {
    if (partIdx === null || !sendMethod) return showToast("Vui lòng chọn người tham gia giao dịch và phương thức gửi.", "error")
    setSendOpen(true)
  }
  const doSend = (noiDung: string) => {
    if (!selected || partIdx === null || !sendMethod) return
    if (hasActiveRequest(selected.qr)) { setSendOpen(false); return showToast("VBCCĐT này đã có yêu cầu đang chờ xử lý hoặc còn hiệu lực.", "error") }
    createRequest(selected, selected.participants[partIdx], sendMethod, noiDung)
    setSendOpen(false)
    onCreated()
    showToast("Gửi yêu cầu tham chiếu VBCCĐT thành công.")
    reset()
  }

  const selPart = selected && partIdx !== null ? selected.participants[partIdx] : null
  const emailDisabled = !selPart || !selPart.email

  return (
    <div className="space-y-4">
      {/* PHƯƠNG THỨC TRA CỨU */}
      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="mb-3 text-[13px] font-semibold text-foreground-strong">Phương thức tra cứu</div>
        <div className="mb-4 flex flex-wrap gap-5">
          {([["qr", "Tham chiếu bằng mã QR / Số QR"], ["socc", "Tham chiếu bằng Số công chứng"]] as ["qr" | "socc", string][]).map(([k, l]) => (
            <label key={k} className="flex cursor-pointer items-center gap-2 text-[13px] text-foreground">
              <input type="radio" name="method" checked={method === k} onChange={() => { setMethod(k); setError("") }} className="size-4 accent-neutral-900" />{l}
            </label>
          ))}
        </div>

        {method === "qr" ? (
          <div className="flex flex-wrap items-end gap-2.5">
            <div className="min-w-[280px] flex-1">
              <label className="text-xs font-semibold text-foreground-strong">Mã QR</label>
              <input value={qr} maxLength={50} onChange={(e) => { setQr(e.target.value); if (error) setError("") }} onKeyDown={(e) => e.key === "Enter" && doSearch()} placeholder="Nhập / quét mã QR (VD: TC-2026-001)" className={cn(inputCls, "mt-1.5")} />
            </div>
            <Button variant="outline" onClick={() => setScanning(true)}><QrCode className="size-4" />Quét QR</Button>
            <Button variant="outline" onClick={onUpload}><Upload className="size-4" />Tải ảnh QR</Button>
            <Button onClick={doSearch}><Search className="size-4" />Tra cứu</Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-end gap-2.5">
            <div className="min-w-[180px] flex-1">
              <label className="text-xs font-semibold text-foreground-strong">Sở Tư pháp <span className="text-red-600">*</span></label>
              <NativeSelect value={stp} onChange={(e) => { setStp(e.target.value); setTchncc("all") }} className="mt-1.5"><option value="all">Chọn Sở Tư pháp</option>{SO_TU_PHAP.map((s) => <option key={s} value={s}>{s}</option>)}</NativeSelect>
            </div>
            <div className="min-w-[180px] flex-1">
              <label className="text-xs font-semibold text-foreground-strong">Tổ chức HNCC <span className="text-red-600">*</span></label>
              <NativeSelect value={tchncc} onChange={(e) => setTchncc(e.target.value)} className="mt-1.5"><option value="all">Chọn tổ chức HNCC</option>{tchnccOptions.map((t) => <option key={t} value={t}>{t}</option>)}</NativeSelect>
            </div>
            <div className="min-w-[180px] flex-1">
              <label className="text-xs font-semibold text-foreground-strong">Số công chứng <span className="text-red-600">*</span></label>
              <input value={soCC} maxLength={50} onChange={(e) => { setSoCC(e.target.value); if (error) setError("") }} onKeyDown={(e) => e.key === "Enter" && doSearch()} placeholder="VD: 100/2026/HĐ" className={cn(inputCls, "mt-1.5")} />
            </div>
            <Button onClick={doSearch}><Search className="size-4" />Tra cứu</Button>
          </div>
        )}
        {error && <div className="mt-3 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]">{error}</div>}
      </div>

      {/* ≥2 KẾT QUẢ — CHỌN GIAO DỊCH */}
      {results && results.length >= 2 && (
        <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
          <div className="mb-3 text-[13px] font-semibold text-foreground-strong">Kết quả tra cứu — Chọn 1 giao dịch để xem chi tiết</div>
          <div className="space-y-2">
            {results.map((v) => (
              <label key={v.id} className={cn("flex cursor-pointer items-center gap-3 rounded-[10px] border p-3 text-[13px]", selected?.id === v.id ? "border-neutral-800 bg-neutral-50" : "border-border hover:bg-surface-muted")}>
                <input type="radio" name="tx" checked={selected?.id === v.id} onChange={() => chooseTx(v)} className="size-4 accent-neutral-900" />
                <span className="text-foreground"><span className="font-mono font-semibold text-link">{v.qr}</span> · Số CC {v.soCC} · {v.tenGD} · CCV {v.ccv} · {v.tchncc}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {results && results.length === 0 && (
        <div className="rounded-[14px] border border-border bg-surface shadow-sm"><EmptyState icon={<Search className="size-6" />} title="Không tìm thấy VBCCĐT" desc="Không có văn bản công chứng điện tử khớp với thông tin tra cứu." /></div>
      )}

      {/* THÔNG TIN VBCCĐT (BR-09) */}
      {selected && (
        <>
          <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
            <div className="mb-3 text-[13px] font-semibold text-foreground-strong">Thông tin văn bản công chứng điện tử <span className="font-normal text-foreground-subtle">(chỉ thông tin cơ bản — BR-09)</span></div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">
              <Info label="Mã QR" value={selected.qr} />
              <Info label="Số công chứng" value={selected.soCC} />
              <Info label="Tên giao dịch công chứng" value={selected.tenGD} />
              <Info label="Công chứng viên thực hiện" value={selected.ccv} />
              <Info label="Tổ chức HNCC thực hiện" value={selected.tchncc} />
            </div>
          </div>

          <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
            <div className="border-b border-border px-5 py-3 text-[13px] font-semibold text-foreground-strong">Danh sách người tham gia giao dịch <span className="font-normal text-foreground-subtle">(ẩn thông tin cá nhân)</span></div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead><tr className="border-b border-border bg-neutral-50"><Th className="w-16 text-center">Chọn</Th><Th className="min-w-[160px]">Họ và tên</Th><Th className="min-w-[160px]">Số giấy tờ nhân thân/pháp nhân</Th><Th className="min-w-[170px]">Email</Th><Th className="min-w-[130px]">Điện thoại</Th></tr></thead>
                <tbody>
                  {selected.participants.map((p, i) => (
                    <tr key={i} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="px-4 py-3 text-center"><input type="radio" name="part" checked={partIdx === i} onChange={() => { setPartIdx(i); if (sendMethod === "email" && !p.email) setSendMethod("") }} className="size-4 accent-neutral-900" /></td>
                      <td className="px-4 py-3 font-medium text-foreground">{p.hoTen}</td>
                      <td className="px-4 py-3 font-mono text-[12.5px] text-foreground-muted">{maskDoc(p.soGiayTo)}</td>
                      <td className="px-4 py-3 font-mono text-[12.5px] text-foreground-muted">{p.email ? maskEmail(p.email) : "—"}</td>
                      <td className="px-4 py-3 font-mono text-[12.5px] text-foreground-muted">{maskPhone(p.phone)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
            <div className="mb-3 text-[13px] font-semibold text-foreground-strong">Phương thức gửi yêu cầu <span className="text-red-600">*</span></div>
            <div className="flex flex-wrap gap-5">
              <label className="flex cursor-pointer items-center gap-2 text-[13px] text-foreground"><input type="radio" name="send" checked={sendMethod === "tchncc"} onChange={() => setSendMethod("tchncc")} className="size-4 accent-neutral-900" />Gửi đến TCHNCC đã thực hiện</label>
              <label className={cn("flex items-center gap-2 text-[13px]", emailDisabled ? "cursor-not-allowed text-foreground-subtle" : "cursor-pointer text-foreground")}>
                <input type="radio" name="send" disabled={emailDisabled} checked={sendMethod === "email"} onChange={() => setSendMethod("email")} className="size-4 accent-neutral-900" />Gửi đến người tham gia qua email{emailDisabled && <span className="text-[11.5px]">(người tham gia chưa có email)</span>}
              </label>
            </div>
            <div className="mt-4"><Button onClick={openSend}><Send className="size-4" />Gửi yêu cầu xem chi tiết VBCCĐT</Button></div>
          </div>
        </>
      )}

      {scanning && <QrScanModal onClose={() => setScanning(false)} onScanned={onScanned} />}
      {sendOpen && selected && (
        <SendRequestModal soCC={selected.soCC} tchncc={selected.tchncc}
          nguoiNhan={sendMethod === "email" && selPart ? selPart.hoTen : selected.ccv}
          onClose={() => setSendOpen(false)} onSubmit={doSend} />
      )}
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="flex flex-col gap-0.5 border-b border-neutral-100 py-2"><div className="text-xs text-foreground-muted">{label}</div><div className="text-[13.5px] text-foreground">{value}</div></div>
}

/* ============================ BỘ LỌC DÙNG CHUNG (Tab 2/3) ============================ */
interface ListFilter { soCC: string; maYC: string; qr: string; trangThai: string; tu: string; den: string }
const EMPTY_LF: ListFilter = { soCC: "", maYC: "", qr: "", trangThai: "all", tu: "", den: "" }

function ListFilters({ draft, setDraft, onSearch, onReset, error }: { draft: ListFilter; setDraft: (f: ListFilter) => void; onSearch: () => void; onReset: () => void; error: string }) {
  return (
    <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <F label="Số công chứng"><input value={draft.soCC} onChange={(e) => setDraft({ ...draft, soCC: e.target.value })} onKeyDown={(e) => e.key === "Enter" && onSearch()} className={inputCls} /></F>
        <F label="Mã yêu cầu"><input value={draft.maYC} onChange={(e) => setDraft({ ...draft, maYC: e.target.value })} onKeyDown={(e) => e.key === "Enter" && onSearch()} className={inputCls} /></F>
        <F label="Mã QR"><input value={draft.qr} onChange={(e) => setDraft({ ...draft, qr: e.target.value })} onKeyDown={(e) => e.key === "Enter" && onSearch()} className={inputCls} /></F>
        <F label="Trạng thái"><NativeSelect value={draft.trangThai} onChange={(e) => setDraft({ ...draft, trangThai: e.target.value })}><option value="all">Tất cả</option>{REQ_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}</NativeSelect></F>
        <F label="Thời gian gửi — Từ"><input type="date" value={draft.tu} onChange={(e) => setDraft({ ...draft, tu: e.target.value })} className={cn(inputCls, "text-[13.5px]")} /></F>
        <F label="Thời gian gửi — Đến"><input type="date" value={draft.den} onChange={(e) => setDraft({ ...draft, den: e.target.value })} className={cn(inputCls, "text-[13.5px]")} /></F>
      </div>
      {error && <div className="mt-3 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]">{error}</div>}
      <div className="mt-4 flex gap-2.5"><Button onClick={onSearch}><Search className="size-4" />Tìm kiếm</Button><Button variant="outline" onClick={onReset}><RotateCcw className="size-4" />Đặt lại</Button></div>
    </div>
  )
}
const parseGui = (s: string) => { const [dd, mm, yy] = s.split(" ")[0].split("/"); return `${yy}-${mm}-${dd}` }
function applyFilter(rows: ReferenceRequest[], f: ListFilter) {
  return rows.filter((r) => {
    if (f.soCC && !r.soCC.toLowerCase().includes(f.soCC.trim().toLowerCase())) return false
    if (f.maYC && !r.id.toLowerCase().includes(f.maYC.trim().toLowerCase())) return false
    if (f.qr && !r.qr.toLowerCase().includes(f.qr.trim().toLowerCase())) return false
    if (f.trangThai !== "all" && r.trangThai !== f.trangThai) return false
    const iso = parseGui(r.thoiGianGui)
    if (f.tu && iso < f.tu) return false
    if (f.den && iso > f.den) return false
    return true
  })
}

/* ============================ TAB 2 — YÊU CẦU ĐÃ GỬI ============================ */
function SentTab({ onChange }: { onChange: () => void }) {
  const showToast = useToast()
  const navigate = useNavigate()
  const [draft, setDraft] = useState<ListFilter>(EMPTY_LF)
  const [applied, setApplied] = useState<ListFilter>(EMPTY_LF)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [detail, setDetail] = useState<ReferenceRequest | null>(null)
  const [cancelReq, setCancelReq] = useState<ReferenceRequest | null>(null)

  const rows = useMemo(() => applyFilter(REQUESTS, applied), [applied])
  const start = (Math.min(page, Math.max(1, Math.ceil(rows.length / pageSize))) - 1) * pageSize
  const paged = rows.slice(start, start + pageSize)

  const onSearch = () => { if (draft.tu && draft.den && draft.tu > draft.den) return setError("Thời gian từ ngày không được lớn hơn đến ngày."); setError(""); setApplied(draft); setPage(1) }
  const onReset = () => { setDraft(EMPTY_LF); setApplied(EMPTY_LF); setError(""); setPage(1) }
  const doCancel = () => { if (cancelReq) { cancelRequest(cancelReq.id); setCancelReq(null); onChange(); showToast("Hủy yêu cầu tham chiếu VBCCĐT thành công.") } }
  const viewFile = (r: ReferenceRequest) => { if (r.trangThai !== "Đã xác nhận") return showToast("Quyền truy cập xem file VBCCĐT đã hết thời gian.", "error"); navigate(`/reference-vbccdt/view-file/${r.id}`) }

  return (
    <div className="space-y-4">
      <ListFilters draft={draft} setDraft={setDraft} onSearch={onSearch} onReset={onReset} error={error} />
      <ReqTable rows={paged} start={start} received={false}
        actions={(r) => (
          <>
            <IconBtn title="Xem yêu cầu" onClick={() => setDetail(r)}><Eye className="size-4" /></IconBtn>
            {r.trangThai === "Đã xác nhận" && <IconBtn title="Xem VBCCĐT" onClick={() => viewFile(r)}><FileText className="size-4" /></IconBtn>}
            {r.trangThai === "Chờ xác nhận" && <IconBtn title="Hủy yêu cầu" danger onClick={() => setCancelReq(r)}><XCircle className="size-4" /></IconBtn>}
          </>
        )}
        page={page} pageSize={pageSize} total={rows.length} onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
      {detail && <RequestDetailModal req={detail} onClose={() => setDetail(null)} />}
      {cancelReq && <ConfirmDialog title="Xác nhận hủy yêu cầu" danger confirmLabel="Hủy yêu cầu" message={`Bạn có chắc chắn muốn hủy yêu cầu ${cancelReq.id}? Bản ghi sẽ bị xóa khỏi danh sách và ghi vết lịch sử.`} onClose={() => setCancelReq(null)} onConfirm={doCancel} />}
    </div>
  )
}

/* ============================ TAB 3 — YÊU CẦU ĐÃ NHẬN ============================ */
function ReceivedTab({ onChange }: { onChange: () => void }) {
  const showToast = useToast()
  const [draft, setDraft] = useState<ListFilter>(EMPTY_LF)
  const [applied, setApplied] = useState<ListFilter>(EMPTY_LF)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [detail, setDetail] = useState<ReferenceRequest | null>(null)
  const [approve, setApprove] = useState<ReferenceRequest | null>(null)
  const [reject, setReject] = useState<ReferenceRequest | null>(null)

  const rows = useMemo(() => applyFilter(REQUESTS, applied), [applied])
  const start = (Math.min(page, Math.max(1, Math.ceil(rows.length / pageSize))) - 1) * pageSize
  const paged = rows.slice(start, start + pageSize)

  const onSearch = () => { if (draft.tu && draft.den && draft.tu > draft.den) return setError("Thời gian từ ngày không được lớn hơn đến ngày."); setError(""); setApplied(draft); setPage(1) }
  const onReset = () => { setDraft(EMPTY_LF); setApplied(EMPTY_LF); setError(""); setPage(1) }
  const doApprove = (m: number) => { if (approve) { approveRequest(approve.id, m); setApprove(null); onChange(); showToast("Xác nhận đồng ý yêu cầu tham chiếu thành công.") } }
  const doReject = (l: string) => { if (reject) { rejectRequest(reject.id, l); setReject(null); onChange(); showToast("Từ chối yêu cầu tham chiếu thành công.") } }

  return (
    <div className="space-y-4">
      <ListFilters draft={draft} setDraft={setDraft} onSearch={onSearch} onReset={onReset} error={error} />
      <ReqTable rows={paged} start={start} received
        actions={(r) => (
          <>
            {r.trangThai === "Chờ xác nhận" && (
              <>
                <IconBtn title="Xác nhận" onClick={() => setApprove(r)}><CheckCircle2 className="size-4 text-emerald-600" /></IconBtn>
                <IconBtn title="Từ chối" danger onClick={() => setReject(r)}><Ban className="size-4" /></IconBtn>
              </>
            )}
            <IconBtn title="Xem yêu cầu" onClick={() => setDetail(r)}><Eye className="size-4" /></IconBtn>
          </>
        )}
        page={page} pageSize={pageSize} total={rows.length} onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
      {detail && <RequestDetailModal req={detail} onClose={() => setDetail(null)} />}
      {approve && <ApproveModal req={approve} onClose={() => setApprove(null)} onConfirm={doApprove} />}
      {reject && <RejectModal req={reject} onClose={() => setReject(null)} onReject={doReject} />}
    </div>
  )
}

/* ============================ BẢNG YÊU CẦU DÙNG CHUNG ============================ */
function ReqTable({ rows, start, received, actions, page, pageSize, total, onPage, onPageSize }: {
  rows: ReferenceRequest[]; start: number; received: boolean; actions: (r: ReferenceRequest) => React.ReactNode
  page: number; pageSize: number; total: number; onPage: (p: number) => void; onPageSize: (n: number) => void
}) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
      {rows.length || total ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-neutral-50">
                  <Th className="w-11 text-center">STT</Th>
                  <Th className="min-w-[130px]">Thời gian gửi</Th>
                  <Th className="min-w-[130px]">Mã yêu cầu</Th>
                  <Th className="min-w-[120px]">Số CC</Th>
                  <Th>Ngày CC</Th>
                  <Th className="min-w-[120px]">Mã QR</Th>
                  <Th className="min-w-[150px]">{received ? "Người gửi yêu cầu" : "Người nhận yêu cầu"}</Th>
                  <Th className="min-w-[140px]">{received ? "TCHNCC gửi" : "TCHNCC nhận"}</Th>
                  <Th className="min-w-[130px]">Trạng thái</Th>
                  <Th className="w-[108px] text-center">Thao tác</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{start + i + 1}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-[12.5px] tabular-nums text-foreground-muted">{r.thoiGianGui}</td>
                    <td className="px-4 py-3 font-mono text-[12px] font-semibold text-link">{r.id}</td>
                    <td className="px-4 py-3 font-mono text-[12.5px] text-foreground">{r.soCC}</td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-foreground-muted">{r.ngayCC}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-foreground-muted">{r.qr}</td>
                    <td className="px-4 py-3 text-[13px] text-foreground">{received ? r.nguoiGui : r.nguoiNhan}</td>
                    <td className="px-4 py-3 text-[13px] text-foreground-muted">{received ? r.tchnccGui : r.tchnccNhan}</td>
                    <td className="px-4 py-3"><StatusPill meta={REQ_STATUS[r.trangThai]} /></td>
                    <td className="px-4 py-3"><div className="flex items-center justify-center gap-0.5">{actions(r)}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pageSize={pageSize} total={total} unit="yêu cầu" onPage={onPage} onPageSize={onPageSize} />
        </>
      ) : (
        <EmptyState icon={<Search className="size-6" />} title="Không tìm thấy dữ liệu phù hợp" desc="Không có yêu cầu nào khớp với bộ lọc hiện tại." />
      )}
    </div>
  )
}

/* ============================ TAB 4 — LỊCH SỬ & THỐNG KÊ ============================ */
function HistoryTab() {
  const [sub, setSub] = useState<"file" | "req">("file")
  const s = stats()
  const cards = [
    { label: "Số yêu cầu tham chiếu đến", value: s.den, color: "#2563eb", bg: "#eff6ff", icon: <Send className="size-5" /> },
    { label: "Số YC đã xác nhận", value: s.daXacNhan, color: "#047857", bg: "#ecfdf5", icon: <CheckCircle2 className="size-5" /> },
    { label: "Số YC đã từ chối", value: s.tuChoi, color: "#b91c1c", bg: "#fef2f2", icon: <Ban className="size-5" /> },
    { label: "Số YC đã xem", value: s.daXem, color: "#b45309", bg: "#fffbeb", icon: <Eye className="size-5" /> },
  ]
  const reqRows = REQUESTS

  return (
    <div className="space-y-4">
      {/* THỐNG KÊ */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="flex items-center gap-3 rounded-[14px] border border-border bg-surface p-4 shadow-sm">
            <div className="flex size-11 items-center justify-center rounded-xl" style={{ background: c.bg, color: c.color }}>{c.icon}</div>
            <div>
              <div className="text-[22px] font-semibold tabular-nums" style={{ color: c.color }}>{c.value.toLocaleString("vi-VN")}</div>
              <div className="text-[12px] text-foreground-muted">{c.label}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-start gap-2 rounded-[10px] border border-[#bfdbfe] bg-[#eff6ff] px-3.5 py-2.5 text-[12.5px] text-[#1d4ed8]"><AlertCircle className="mt-0.5 size-4 shrink-0" />Số liệu thống kê theo phạm vi phân quyền của tài khoản (BR-01): Bộ → toàn quốc; Sở → tỉnh/thành quản lý; TCHNCC → trong tổ chức của tài khoản.</div>

      {/* SUB-TABS LỊCH SỬ */}
      <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        <div className="flex gap-1 border-b border-border p-2">
          {([["file", "Lịch sử xem file"], ["req", "Lịch sử yêu cầu"]] as ["file" | "req", string][]).map(([k, l]) => (
            <button key={k} onClick={() => setSub(k)} className={cn("rounded-md px-4 py-[6px] text-[13px] font-medium", sub === k ? "bg-neutral-900 text-white" : "text-foreground-muted hover:bg-surface-muted")}>{l}</button>
          ))}
        </div>
        {sub === "file" ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-sm">
              <thead><tr className="border-b border-border bg-neutral-50"><Th className="w-11 text-center">STT</Th><Th className="min-w-[150px]">Thời gian xem</Th><Th className="min-w-[120px]">Số công chứng</Th><Th className="min-w-[130px]">Địa chỉ IP</Th><Th className="min-w-[130px]">Mã yêu cầu</Th><Th className="min-w-[140px]">Người gửi yêu cầu</Th><Th className="min-w-[150px]">TCHNCC gửi</Th></tr></thead>
              <tbody>
                {VIEW_LOGS.map((l, i) => (
                  <tr key={l.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                    <td className="px-4 py-3 text-center text-foreground-muted">{i + 1}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-[12.5px] tabular-nums text-foreground-muted">{l.thoiGianXem}</td>
                    <td className="px-4 py-3 font-mono text-[12.5px] text-foreground">{l.soCC}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-foreground-muted">{l.ip}</td>
                    <td className="px-4 py-3 font-mono text-[12px] font-semibold text-link">{l.maYeuCau}</td>
                    <td className="px-4 py-3 text-[13px] text-foreground">{l.nguoiGui}</td>
                    <td className="px-4 py-3 text-[13px] text-foreground-muted">{l.tchnccGui}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] border-collapse text-sm">
              <thead><tr className="border-b border-border bg-neutral-50"><Th className="w-11 text-center">STT</Th><Th className="min-w-[150px]">Thời gian gửi</Th><Th className="min-w-[130px]">Mã yêu cầu</Th><Th className="min-w-[140px]">Người gửi yêu cầu</Th><Th className="min-w-[150px]">TCHNCC gửi</Th><Th className="min-w-[120px]">Số công chứng</Th><Th className="min-w-[130px]">Trạng thái</Th></tr></thead>
              <tbody>
                {reqRows.map((r, i) => (
                  <tr key={r.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                    <td className="px-4 py-3 text-center text-foreground-muted">{i + 1}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-[12.5px] tabular-nums text-foreground-muted">{r.thoiGianGui}</td>
                    <td className="px-4 py-3 font-mono text-[12px] font-semibold text-link">{r.id}</td>
                    <td className="px-4 py-3 text-[13px] text-foreground">{r.nguoiGui}</td>
                    <td className="px-4 py-3 text-[13px] text-foreground-muted">{r.tchnccGui}</td>
                    <td className="px-4 py-3 font-mono text-[12.5px] text-foreground">{r.soCC}</td>
                    <td className="px-4 py-3"><StatusPill meta={REQ_STATUS[r.trangThai]} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">{label}</label>{children}</div>
}
