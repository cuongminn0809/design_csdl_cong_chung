import { useRef, useState } from "react"
import { CheckCircle2, FileText, Inbox, Package, Send, ShieldCheck, Upload, X, XCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { useToast } from "@/features/reconciliation/components/Toast"
import { StatusPill, Th, inputCls } from "../ingestion/shared"
import {
  CURRENT_CV_NAME, CURRENT_ORG, CURRENT_REQUESTER, LANH_DAO_LIST, ORG_PLATFORM, PLATFORMS, STATUS_META, TCHNCC_LIST, TODAY_ISO,
  confirmProvide, createRequest, decideApprove, decideReject, fmtVN, gdccInRange, isTchncc, respondAccept, respondReject, retryShare,
  submitForApproval, updateDraft, validateForm,
  type DataProvideRequest, type DprRole, type ReqStatus,
} from "./config"

function Modal({ title, icon, wide, onClose, footer, children }: { title: string; icon?: React.ReactNode; wide?: boolean; onClose: () => void; footer?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={onClose}>
      <div className={cn("flex max-h-[88vh] w-full flex-col overflow-hidden rounded-xl bg-surface shadow-popover", wide ? "max-w-[760px]" : "max-w-[560px]")} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
          <span className="flex items-center gap-2 text-[15px] font-semibold text-foreground-strong">{icon}{title}</span>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="size-[18px]" /></Button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-border px-6 py-4">{footer}</div>}
      </div>
    </div>
  )
}
function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return <div className="flex flex-col gap-0.5 border-b border-neutral-100 py-2"><div className="text-xs text-foreground-muted">{label}</div><div className="text-[13.5px] leading-snug text-foreground">{value || "—"}</div></div>
}
const lbl = "text-xs font-semibold text-foreground-strong"
const ORG_USERS: Record<string, string[]> = { "VPCC Nguyễn Văn A": ["Nguyễn Văn A"], "VPCC Trần Văn B": ["Trần Văn B"], "Phòng Công chứng số 1": ["Phạm Văn D"], "VPCC Bến Thành": ["Trần Thị E"], "VPCC Sông Hàn": ["Đỗ Văn F"] }

/* ============================ POP01 — THÊM MỚI / SỬA YÊU CẦU ============================ */
export function RequestFormDialog({ mode, role, record, onClose }: { mode: "create" | "edit"; role: DprRole; record?: DataProvideRequest; onClose: () => void }) {
  const showToast = useToast()
  const tchncc = isTchncc(role)
  const [toChuc, setToChuc] = useState(record?.toChuc ?? (tchncc ? CURRENT_ORG : ""))
  const [nguoiYeuCau, setNguoiYeuCau] = useState(record?.nguoiYeuCau ?? (tchncc ? CURRENT_REQUESTER : ""))
  const [nenTang, setNenTang] = useState(record?.nenTang ?? (tchncc ? ORG_PLATFORM[CURRENT_ORG] : ""))
  const [tuNgay, setTuNgay] = useState(record?.tuNgay ?? "")
  const [denNgay, setDenNgay] = useState(record?.denNgay ?? "")
  const [lyDo, setLyDo] = useState(record?.lyDo ?? "")
  const [file, setFile] = useState<{ name: string; size: string } | null>(record?.fileName ? { name: record.fileName, size: record.fileSize ?? "" } : null)
  const [err, setErr] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  const onOrgChange = (org: string) => { setToChuc(org); setNguoiYeuCau(""); setNenTang(ORG_PLATFORM[org] ?? "") }
  const pickFile = (f: File) => {
    const ok = /\.(pdf|docx?|jpe?g|png)$/i.test(f.name)
    if (!ok || f.size > 10 * 1024 * 1024) { showToast("File đính kèm vượt quá 10MB hoặc không đúng định dạng hỗ trợ (.pdf, .doc, .docx, .jpg, .png).", "error"); return }
    setFile({ name: f.name, size: `${(f.size / 1024 / 1024).toFixed(1)} MB` })
  }

  const buildInput = () => ({ toChuc, nguoiYeuCau, nenTang, tuNgay, denNgay, lyDo: lyDo.trim(), fileName: file?.name, fileSize: file?.size })
  const save = (trangThai: ReqStatus) => {
    const input = buildInput()
    const e = validateForm(input)
    if (e) return setErr(e)
    const actor = tchncc ? { name: CURRENT_REQUESTER, role } : { name: CURRENT_CV_NAME, role }
    if (mode === "create") {
      const req = createRequest(input, trangThai, actor)
      const msg = trangThai === "Lưu nháp" ? `Tạo mới yêu cầu cung cấp dữ liệu (lưu nháp) thành công (${req.maYeuCau}).` : trangThai === "Chờ tiếp nhận" ? `Gửi yêu cầu cung cấp dữ liệu thành công (${req.maYeuCau}).` : `Tiếp nhận yêu cầu cung cấp dữ liệu thành công (${req.maYeuCau}).`
      showToast(msg)
    } else if (record) {
      updateDraft(record.id, input, trangThai, actor)
      const msg = trangThai === "Lưu nháp" ? "Cập nhật yêu cầu cung cấp dữ liệu thành công." : trangThai === "Chờ tiếp nhận" ? "Gửi yêu cầu cung cấp dữ liệu thành công." : "Tiếp nhận yêu cầu cung cấp dữ liệu thành công."
      showToast(msg)
    }
    onClose()
  }

  return (
    <Modal title={mode === "create" ? "Thêm mới yêu cầu cung cấp dữ liệu" : "Sửa yêu cầu cung cấp dữ liệu"} icon={<FileText className="size-[18px] text-foreground-muted" />} onClose={onClose}
      footer={<>
        <Button variant="outline" onClick={onClose}>Hủy bỏ</Button>
        <Button variant="outline" onClick={() => save("Lưu nháp")}>Lưu nháp</Button>
        {tchncc
          ? <Button onClick={() => save("Chờ tiếp nhận")}><Send className="size-4" />Gửi yêu cầu</Button>
          : <Button onClick={() => save("Đã tiếp nhận")}><Inbox className="size-4" />Tiếp nhận yêu cầu</Button>}
      </>}>
      <div className="flex flex-col gap-1.5"><label className={lbl}>Mã yêu cầu</label><input disabled value={record?.maYeuCau ?? "(Hệ thống tự sinh)"} className={cn(inputCls, "bg-surface-muted text-foreground-muted")} /></div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className={lbl}>Tổ chức yêu cầu <span className="text-[#dc2626]">*</span></label>
          {tchncc ? <input disabled value={toChuc} className={cn(inputCls, "bg-surface-muted text-foreground-muted")} />
            : <NativeSelect value={toChuc} onChange={(e) => onOrgChange(e.target.value)}><option value="">Chọn đơn vị</option>{TCHNCC_LIST.map((o) => <option key={o} value={o}>{o}</option>)}</NativeSelect>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={lbl}>Người yêu cầu <span className="text-[#dc2626]">*</span></label>
          {tchncc ? <input disabled value={nguoiYeuCau} className={cn(inputCls, "bg-surface-muted text-foreground-muted")} />
            : <NativeSelect value={nguoiYeuCau} onChange={(e) => setNguoiYeuCau(e.target.value)} disabled={!toChuc}><option value="">Chọn người dùng</option>{(ORG_USERS[toChuc] ?? []).map((u) => <option key={u} value={u}>{u}</option>)}</NativeSelect>}
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-1.5">
        <label className={lbl}>Nền tảng công chứng <span className="text-[#dc2626]">*</span></label>
        <NativeSelect value={nenTang} onChange={(e) => setNenTang(e.target.value)}><option value="">Chọn nền tảng công chứng</option>{PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}</NativeSelect>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5"><label className={lbl}>Thời gian khôi phục từ <span className="text-[#dc2626]">*</span></label><input type="date" max={TODAY_ISO} value={tuNgay} onChange={(e) => setTuNgay(e.target.value)} className={inputCls} /></div>
        <div className="flex flex-col gap-1.5"><label className={lbl}>Thời gian khôi phục đến <span className="text-[#dc2626]">*</span></label><input type="date" max={TODAY_ISO} value={denNgay} onChange={(e) => setDenNgay(e.target.value)} className={inputCls} /></div>
      </div>

      <div className="mt-3 flex flex-col gap-1.5">
        <label className={lbl}>Lý do yêu cầu khôi phục <span className="text-[#dc2626]">*</span></label>
        <textarea value={lyDo} onChange={(e) => setLyDo(e.target.value)} rows={3} maxLength={500} className={cn(inputCls, "h-auto py-2")} placeholder="Nhập lý do yêu cầu khôi phục dữ liệu…" />
      </div>

      <div className="mt-3 flex flex-col gap-1.5">
        <label className={lbl}>File đính kèm (nếu có)</label>
        <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="hidden" onChange={(e) => e.target.files?.[0] && pickFile(e.target.files[0])} />
        {file ? (
          <div className="flex items-center gap-2 rounded-md border border-border bg-surface-muted px-3 py-2 text-[13px]">
            <FileText className="size-4 text-foreground-muted" /><span className="flex-1 truncate text-foreground">{file.name}</span><span className="text-foreground-muted">{file.size}</span>
            <button onClick={() => setFile(null)} className="text-[12px] font-medium text-[#b91c1c] hover:underline">Xóa</button>
          </div>
        ) : (
          <button onClick={() => fileRef.current?.click()} className="flex items-center justify-center gap-2 rounded-md border border-dashed border-border-strong bg-surface px-3 py-2.5 text-[13px] font-medium text-foreground-muted hover:bg-surface-muted"><Upload className="size-4" />Chọn tệp</button>
        )}
      </div>

      {err && <div className="mt-3 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]">{err}</div>}
    </Modal>
  )
}

/* ============================ POP02 — XEM CHI TIẾT ============================ */
export function DetailDialog({ record, role, onClose }: { record: DataProvideRequest; role: DprRole; onClose: () => void }) {
  const showToast = useToast()
  const [tab, setTab] = useState<"info" | "gdcc" | "log">("info")
  const rows = record.gdccSnapshot ?? gdccInRange(record.toChuc, record.tuNgay, record.denNgay)
  const shareEntries = record.shareStatuses ? Object.entries(record.shareStatuses) : []
  const daChiaSe = shareEntries.filter(([, s]) => s === "Đã chia sẻ").length
  const loi = shareEntries.filter(([, s]) => s === "Chia sẻ lỗi")

  return (
    <Modal title={`Chi tiết yêu cầu cung cấp dữ liệu — ${record.maYeuCau}`} wide onClose={onClose} footer={<Button variant="outline" onClick={onClose}>Đóng</Button>}>
      <div className="mb-4 flex gap-1 border-b border-border">
        {[{ k: "info", l: "Thông tin yêu cầu" }, { k: "gdcc", l: `Danh sách GDCC (${rows.length})` }, { k: "log", l: "Lịch sử xử lý & chia sẻ" }].map((t) => (
          <button key={t.k} onClick={() => setTab(t.k as typeof tab)} className={cn("border-b-2 px-3 py-2 text-[13px] font-medium", tab === t.k ? "border-[#2563eb] text-[#2563eb]" : "border-transparent text-foreground-muted")}>{t.l}</button>
        ))}
      </div>

      {tab === "info" && (
        <div className="grid grid-cols-2 gap-x-6">
          <Field label="Mã yêu cầu" value={record.maYeuCau} />
          <Field label="Ngày gửi" value={record.ngayGui ? fmtVN(record.ngayGui.slice(0, 10)) + " " + record.ngayGui.slice(11, 16) : "—"} />
          <Field label="Đơn vị yêu cầu" value={record.toChuc} />
          <Field label="Người yêu cầu" value={record.nguoiYeuCau} />
          <Field label="Nền tảng công chứng" value={record.nenTang} />
          <Field label="Thời gian khôi phục" value={`${fmtVN(record.tuNgay)} - ${fmtVN(record.denNgay)}`} />
          <div className="col-span-2"><Field label="Lý do yêu cầu khôi phục" value={record.lyDo} /></div>
          {record.fileName && <div className="col-span-2"><Field label="File đính kèm" value={<span className="flex items-center gap-2">{record.fileName} {record.fileSize && `(${record.fileSize})`}<button onClick={() => showToast("Đang tải tệp đính kèm…")} className="text-[#2563eb] hover:underline">Tải xuống</button></span>} /></div>}
          <div className="col-span-2 flex items-center gap-2 border-b border-neutral-100 py-2"><span className="text-xs text-foreground-muted">Trạng thái</span><StatusPill meta={STATUS_META[record.trangThai]} /></div>
          {record.trangThai === "Từ chối" && <div className="col-span-2"><Field label="Lý do từ chối" value={record.lyDoTuChoi} /></div>}
          {record.ghiChuTrinh && <div className="col-span-2"><Field label="Ý kiến trình duyệt" value={record.ghiChuTrinh} /></div>}
          {record.ghiChuPhaDuyet && <div className="col-span-2"><Field label="Ý kiến phê duyệt" value={record.ghiChuPhaDuyet} /></div>}
        </div>
      )}

      {tab === "gdcc" && (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full border-collapse text-[13px]">
            <thead><tr className="bg-neutral-50">
              <Th className="w-10">STT</Th><Th>Số công chứng</Th><Th>Ngày CC</Th><Th>Tên giao dịch</Th><Th>Bên liên quan</Th><Th>Tài sản</Th><Th>CCV</Th><Th>Trạng thái</Th>
            </tr></thead>
            <tbody>{rows.length ? rows.map((r, i) => (
              <tr key={r.soCC} className="border-t border-neutral-100">
                <td className="px-4 py-2.5 text-center text-foreground-muted">{i + 1}</td>
                <td className="px-4 py-2.5 font-medium text-foreground">{r.soCC}</td>
                <td className="px-4 py-2.5 tabular-nums text-foreground-muted">{fmtVN(r.ngayCC)}</td>
                <td className="px-4 py-2.5 text-foreground-muted">{r.tenGD}</td>
                <td className="px-4 py-2.5 text-foreground-muted">{r.benLienQuan}</td>
                <td className="px-4 py-2.5 text-foreground-muted">{r.taiSan}</td>
                <td className="px-4 py-2.5 text-foreground-muted">{r.ccv}</td>
                <td className="px-4 py-2.5 text-foreground-muted">{r.trangThai}</td>
              </tr>
            )) : <tr><td colSpan={8} className="px-4 py-8 text-center text-foreground-subtle">Không có giao dịch công chứng nào trong khoảng thời gian khôi phục.</td></tr>}</tbody>
          </table>
        </div>
      )}

      {tab === "log" && (
        <div className="space-y-4">
          <div className="space-y-3">
            {record.lichSu.map((h, i) => (
              <div key={i} className="flex gap-3 text-[13px]">
                <div className="mt-1 size-1.5 shrink-0 rounded-full bg-[#2563eb]" />
                <div><span className="font-medium text-foreground">{h.thoiGian}</span> — {h.nguoiThucHien} — {h.hanhDong}{h.ghiChu && <div className="mt-0.5 text-foreground-muted">"{h.ghiChu}"</div>}</div>
              </div>
            ))}
          </div>
          {(record.trangThai === "Đang chia sẻ dữ liệu" || record.trangThai === "Đã cung cấp dữ liệu") && shareEntries.length > 0 && (
            <div className="rounded-lg border border-border p-3">
              <div className="mb-2 text-[13px] font-semibold text-foreground-strong">Trạng thái chia sẻ API: {daChiaSe}/{shareEntries.length}</div>
              <div className="flex flex-wrap gap-1.5">
                {shareEntries.map(([soCC, s]) => <span key={soCC} className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", s === "Đã chia sẻ" ? "bg-[#ecfdf5] text-[#047857]" : s === "Chia sẻ lỗi" ? "bg-[#fef2f2] text-[#b91c1c]" : "bg-[#eff6ff] text-[#1d4ed8]")}>{soCC}: {s}</span>)}
              </div>
              {loi.length > 0 && role === "cv_stp" && (
                <Button size="sm" className="mt-3" onClick={() => { retryShare(record.id, CURRENT_CV_NAME); showToast("Đang gửi lại các bản ghi lỗi…") }}>Thử lại</Button>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

/* ============================ POP03 — TIẾP NHẬN YÊU CẦU ============================ */
export function AcceptDialog({ record, onClose }: { record: DataProvideRequest; onClose: () => void }) {
  const showToast = useToast()
  const [choice, setChoice] = useState<"accept" | "reject">("accept")
  const [lyDo, setLyDo] = useState("")
  const [err, setErr] = useState("")
  const gdcc = gdccInRange(record.toChuc, record.tuNgay, record.denNgay)

  const confirm = () => {
    if (choice === "reject" && !lyDo.trim()) return setErr("Vui lòng nhập lý do từ chối tiếp nhận.")
    if (choice === "accept") { respondAccept(record.id, CURRENT_CV_NAME); showToast("Tiếp nhận yêu cầu cung cấp dữ liệu thành công.") }
    else { respondReject(record.id, CURRENT_CV_NAME, lyDo.trim()); showToast("Từ chối tiếp nhận yêu cầu thành công.") }
    onClose()
  }

  return (
    <Modal title={`Tiếp nhận yêu cầu — ${record.maYeuCau}`} icon={<Inbox className="size-[18px] text-foreground-muted" />} onClose={onClose}
      footer={<><Button variant="outline" onClick={onClose}>Hủy bỏ</Button><Button onClick={confirm}>Xác nhận</Button></>}>
      <div className="grid grid-cols-2 gap-x-6">
        <Field label="Đơn vị yêu cầu" value={record.toChuc} />
        <Field label="Người yêu cầu" value={record.nguoiYeuCau} />
      </div>
      <Field label="Thời gian khôi phục" value={`${fmtVN(record.tuNgay)} - ${fmtVN(record.denNgay)}`} />
      <Field label="Lý do yêu cầu khôi phục" value={record.lyDo} />
      {record.fileName && <Field label="File đính kèm" value={record.fileName} />}
      <Field label="Số GDCC dự kiến trong khoảng thời gian" value={gdcc.length ? `${gdcc.length} giao dịch` : "0 giao dịch — không có giao dịch công chứng nào trong khoảng thời gian khôi phục đã chọn."} />

      <div className="mt-3 flex flex-col gap-2">
        <label className={lbl}>Phản hồi <span className="text-[#dc2626]">*</span></label>
        <label className="flex items-center gap-2 text-[13.5px]"><input type="radio" checked={choice === "accept"} onChange={() => { setChoice("accept"); setErr("") }} /><CheckCircle2 className="size-4 text-[#047857]" />Xác nhận tiếp nhận</label>
        <label className="flex items-center gap-2 text-[13.5px]"><input type="radio" checked={choice === "reject"} onChange={() => setChoice("reject")} /><XCircle className="size-4 text-[#b91c1c]" />Từ chối tiếp nhận</label>
      </div>
      {choice === "reject" && (
        <div className="mt-2 flex flex-col gap-1.5">
          <label className={lbl}>Lý do từ chối <span className="text-[#dc2626]">*</span></label>
          <textarea value={lyDo} onChange={(e) => { setLyDo(e.target.value); setErr("") }} rows={3} maxLength={500} className={cn(inputCls, "h-auto py-2")} placeholder="Nhập lý do từ chối tiếp nhận…" />
        </div>
      )}
      {err && <div className="mt-2 text-[12px] font-medium text-[#b91c1c]">{err}</div>}
    </Modal>
  )
}

/* ============================ POP04 — TRÌNH DUYỆT ============================ */
export function SubmitDialog({ record, onClose }: { record: DataProvideRequest; onClose: () => void }) {
  const showToast = useToast()
  const [lanhDao, setLanhDao] = useState("")
  const [ghiChu, setGhiChu] = useState("")
  const [err, setErr] = useState<{ lanhDao?: string; ghiChu?: string }>({})
  const gdcc = record.gdccSnapshot ?? gdccInRange(record.toChuc, record.tuNgay, record.denNgay)

  const submit = () => {
    const e: typeof err = {}
    if (!lanhDao) e.lanhDao = "Vui lòng chọn lãnh đạo xử lý."
    if (!ghiChu.trim()) e.ghiChu = "Vui lòng nhập ghi chú trình duyệt."
    if (Object.keys(e).length) return setErr(e)
    submitForApproval(record.id, CURRENT_CV_NAME, lanhDao, ghiChu.trim())
    showToast("Trình duyệt yêu cầu thành công.")
    onClose()
  }

  return (
    <Modal title={`Trình duyệt yêu cầu — ${record.maYeuCau}`} icon={<Send className="size-[18px] text-foreground-muted" />} onClose={onClose}
      footer={<><Button variant="outline" onClick={onClose}>Hủy bỏ</Button><Button onClick={submit}>Trình yêu cầu</Button></>}>
      <Field label="Đơn vị yêu cầu" value={record.toChuc} />
      <Field label="Thời gian khôi phục" value={`${fmtVN(record.tuNgay)} - ${fmtVN(record.denNgay)}`} />
      <Field label="Số GDCC đề nghị khôi phục" value={`${gdcc.length} giao dịch`} />

      <div className="mt-3 flex flex-col gap-1.5">
        <label className={lbl}>Lãnh đạo xử lý <span className="text-[#dc2626]">*</span></label>
        <NativeSelect value={lanhDao} onChange={(e) => { setLanhDao(e.target.value); setErr((x) => ({ ...x, lanhDao: undefined })) }}>
          <option value="">Chọn lãnh đạo xử lý</option>
          {LANH_DAO_LIST.map((l) => <option key={l.name} value={l.name}>{l.label}</option>)}
        </NativeSelect>
        {err.lanhDao && <span className="text-[12px] font-medium text-[#b91c1c]">{err.lanhDao}</span>}
      </div>
      <div className="mt-3 flex flex-col gap-1.5">
        <label className={lbl}>Ghi chú trình duyệt <span className="text-[#dc2626]">*</span></label>
        <textarea value={ghiChu} onChange={(e) => { setGhiChu(e.target.value); setErr((x) => ({ ...x, ghiChu: undefined })) }} rows={3} maxLength={500} className={cn(inputCls, "h-auto py-2")} placeholder="Nhập ghi chú, ý kiến đề xuất trình lãnh đạo…" />
        {err.ghiChu && <span className="text-[12px] font-medium text-[#b91c1c]">{err.ghiChu}</span>}
      </div>
    </Modal>
  )
}

/* ============================ POP05 — XỬ LÝ (PHÊ DUYỆT / TỪ CHỐI) ============================ */
export function DecideDialog({ record, role, onClose }: { record: DataProvideRequest; role: DprRole; onClose: () => void }) {
  const showToast = useToast()
  const canDecide = LANH_DAO_LIST.find((l) => l.name === record.lanhDaoXuLy)?.role === role
  const [choice, setChoice] = useState<"approve" | "reject">("approve")
  const [lyDo, setLyDo] = useState("")
  const [err, setErr] = useState("")
  const gdcc = record.gdccSnapshot ?? gdccInRange(record.toChuc, record.tuNgay, record.denNgay)

  const confirm = () => {
    if (choice === "reject" && !lyDo.trim()) return setErr("Vui lòng nhập lý do từ chối.")
    const actor = record.lanhDaoXuLy ?? ""
    if (choice === "approve") { decideApprove(record.id, actor, ""); showToast("Phê duyệt yêu cầu cung cấp dữ liệu thành công.") }
    else { decideReject(record.id, actor, lyDo.trim()); showToast("Từ chối yêu cầu cung cấp dữ liệu thành công.") }
    onClose()
  }

  return (
    <Modal title={`Xử lý yêu cầu cung cấp dữ liệu — ${record.maYeuCau}`} icon={<ShieldCheck className="size-[18px] text-foreground-muted" />} onClose={onClose}
      footer={<><Button variant="outline" onClick={onClose}>Hủy bỏ</Button><Button onClick={confirm} disabled={!canDecide}>Xác nhận</Button></>}>
      <Field label="Đơn vị yêu cầu" value={record.toChuc} />
      <Field label="Thời gian khôi phục" value={`${fmtVN(record.tuNgay)} - ${fmtVN(record.denNgay)}`} />
      <Field label="Lý do yêu cầu khôi phục" value={record.lyDo} />
      <Field label="Ghi chú trình duyệt" value={record.ghiChuTrinh} />
      <Field label="Lãnh đạo xử lý" value={LANH_DAO_LIST.find((l) => l.name === record.lanhDaoXuLy)?.label ?? record.lanhDaoXuLy} />
      <Field label="Số GDCC đề nghị khôi phục" value={`${gdcc.length} giao dịch`} />

      {!canDecide && <div className="mt-3 rounded-md border border-[#fde68a] bg-[#fffbeb] px-3 py-2 text-[12.5px] font-medium text-[#b45309]">Bạn không phải lãnh đạo xử lý được chọn khi trình duyệt — chỉ có thể xem, không thể quyết định.</div>}

      <div className="mt-3 flex flex-col gap-2">
        <label className={lbl}>Quyết định <span className="text-[#dc2626]">*</span></label>
        <label className="flex items-center gap-2 text-[13.5px]"><input type="radio" disabled={!canDecide} checked={choice === "approve"} onChange={() => { setChoice("approve"); setErr("") }} /><CheckCircle2 className="size-4 text-[#047857]" />Phê duyệt</label>
        <label className="flex items-center gap-2 text-[13.5px]"><input type="radio" disabled={!canDecide} checked={choice === "reject"} onChange={() => setChoice("reject")} /><XCircle className="size-4 text-[#b91c1c]" />Từ chối</label>
      </div>
      {choice === "reject" && (
        <div className="mt-2 flex flex-col gap-1.5">
          <label className={lbl}>Lý do từ chối <span className="text-[#dc2626]">*</span></label>
          <textarea disabled={!canDecide} value={lyDo} onChange={(e) => { setLyDo(e.target.value); setErr("") }} rows={3} maxLength={500} className={cn(inputCls, "h-auto py-2")} placeholder="Nhập lý do từ chối…" />
        </div>
      )}
      {err && <div className="mt-2 text-[12px] font-medium text-[#b91c1c]">{err}</div>}
    </Modal>
  )
}

/* ============================ POP06 — XÁC NHẬN CUNG CẤP DỮ LIỆU ============================ */
export function ProvideDialog({ record, onClose }: { record: DataProvideRequest; onClose: () => void }) {
  const showToast = useToast()
  const [checked, setChecked] = useState(false)
  const [err, setErr] = useState("")
  const gdcc = record.gdccSnapshot ?? gdccInRange(record.toChuc, record.tuNgay, record.denNgay)

  const confirm = () => {
    if (!checked) return setErr("Vui lòng tích xác nhận trước khi cung cấp dữ liệu.")
    confirmProvide(record.id, CURRENT_CV_NAME)
    showToast("Xác nhận cung cấp dữ liệu thành công. Hệ thống đang chuẩn bị và chia sẻ dữ liệu.")
    onClose()
  }

  return (
    <Modal title={`Xác nhận cung cấp dữ liệu — ${record.maYeuCau}`} icon={<Package className="size-[18px] text-foreground-muted" />} onClose={onClose}
      footer={<><Button variant="outline" onClick={onClose}>Hủy bỏ</Button><Button onClick={confirm}>Xác nhận cung cấp dữ liệu</Button></>}>
      <Field label="Đơn vị yêu cầu" value={record.toChuc} />
      <Field label="Thời gian khôi phục" value={`${fmtVN(record.tuNgay)} - ${fmtVN(record.denNgay)}`} />
      <Field label="Ghi chú phê duyệt" value={record.ghiChuPhaDuyet} />

      {gdcc.length === 0 && <div className="mt-3 rounded-md border border-[#fde68a] bg-[#fffbeb] px-3 py-2 text-[12.5px] font-medium text-[#b45309]">Không có giao dịch công chứng nào trong khoảng thời gian khôi phục đã chọn.</div>}

      <div className="mt-3">
        <div className={lbl}>Danh sách dữ liệu GDCC sẽ cung cấp: {gdcc.length} giao dịch</div>
        <div className="mt-1.5 space-y-1 rounded-md border border-border bg-surface-muted p-2.5 text-[12.5px] text-foreground-muted">
          {gdcc.slice(0, 5).map((g) => <div key={g.soCC}>{g.soCC} · {fmtVN(g.ngayCC)} · {g.tenGD}</div>)}
          {gdcc.length > 5 && <div className="text-foreground-subtle">… và {gdcc.length - 5} giao dịch khác (xem đầy đủ tại tab Danh sách GDCC).</div>}
        </div>
      </div>

      <label className="mt-3 flex items-start gap-2 text-[13px]">
        <input type="checkbox" checked={checked} onChange={(e) => { setChecked(e.target.checked); setErr("") }} className="mt-0.5" />
        Tôi xác nhận cung cấp dữ liệu theo đúng nội dung đã được lãnh đạo phê duyệt
      </label>
      {err && <div className="mt-2 text-[12px] font-medium text-[#b91c1c]">{err}</div>}
    </Modal>
  )
}
