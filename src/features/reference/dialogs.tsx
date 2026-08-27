import { useState } from "react"
import { Ban, Eye, FileText, QrCode, ScanLine, Send, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { StatusPill } from "../ingestion/shared"
import { REQ_STATUS, type ReferenceRequest } from "./config"

function Overlay({ onClose, children, w = "w-[520px]" }: { onClose: () => void; children: React.ReactNode; w?: string }) {
  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={onClose}>
      <div className={cn("max-h-[88vh] max-w-full overflow-hidden rounded-xl bg-surface shadow-popover", w)} onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  )
}
function Head({ icon, title, onClose }: { icon: React.ReactNode; title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
      <span className="flex items-center gap-2 text-[15px] font-semibold text-foreground-strong">{icon}{title}</span>
      <Button variant="ghost" size="icon" onClick={onClose}><X className="size-[18px]" /></Button>
    </div>
  )
}
function Ro({ label, value, node }: { label: string; value?: string; node?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-neutral-100 py-2">
      <div className="text-xs text-foreground-muted">{label}</div>
      {node ?? <div className="text-[13.5px] leading-snug text-foreground">{value || "—"}</div>}
    </div>
  )
}
const inputCls = "h-10 w-full rounded-md border border-input bg-surface px-3 text-[13.5px] outline-none focus:border-neutral-400"

/* ============================ POP01 — GỬI YÊU CẦU (SCR-A.5.8-01-POP01) ============================ */
export function SendRequestModal({ soCC, tchncc, nguoiNhan, onClose, onSubmit }: {
  soCC: string; tchncc: string; nguoiNhan: string; onClose: () => void; onSubmit: (noiDung: string) => void
}) {
  const [noiDung, setNoiDung] = useState("")
  const [camKet, setCamKet] = useState(false)
  const [err, setErr] = useState("")
  const submit = () => {
    if (!noiDung.trim() || !camKet) return setErr("Vui lòng nhập nội dung đề nghị và tích cam kết.")
    onSubmit(noiDung.trim())
  }
  return (
    <Overlay onClose={onClose} w="w-[560px]">
      <Head icon={<Send className="size-[18px] text-foreground-muted" />} title="Gửi yêu cầu xem chi tiết VBCCĐT" onClose={onClose} />
      <div className="px-6 py-5">
        <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
          <Ro label="Số công chứng" value={soCC} />
          <Ro label="TCHNCC thực hiện" value={tchncc} />
          <div className="sm:col-span-2"><Ro label="Người nhận yêu cầu" value={nguoiNhan} /></div>
        </div>
        <div className="mt-3">
          <label className="text-xs font-semibold text-foreground-strong">Nội dung đề nghị <span className="text-red-600">*</span></label>
          <textarea autoFocus value={noiDung} maxLength={500} onChange={(e) => { setNoiDung(e.target.value); if (err) setErr("") }} rows={4}
            placeholder="Nhập nội dung đề nghị…" className={cn(inputCls, "mt-1.5 h-auto resize-none py-2 leading-relaxed")} />
        </div>
        <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-[13px] text-foreground">
          <input type="checkbox" checked={camKet} onChange={(e) => { setCamKet(e.target.checked); if (err) setErr("") }} className="mt-0.5 size-4 accent-neutral-900" />
          <span>Tôi cam kết khai thác thông tin đúng mục đích, không sao chép hoặc chia sẻ trái phép. <span className="text-red-600">*</span></span>
        </label>
        {err && <div className="mt-2 text-[12px] text-red-600">{err}</div>}
      </div>
      <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
        <Button variant="outline" onClick={onClose}>Hủy bỏ</Button>
        <Button onClick={submit}><Send className="size-4" />Gửi yêu cầu</Button>
      </div>
    </Overlay>
  )
}

/* ============================ TAB2 POP01 — CHI TIẾT YÊU CẦU ĐÃ GỬI ============================ */
export function RequestDetailModal({ req, onClose }: { req: ReferenceRequest; onClose: () => void }) {
  return (
    <Overlay onClose={onClose} w="w-[620px]">
      <Head icon={<Eye className="size-[18px] text-foreground-muted" />} title="Chi tiết yêu cầu" onClose={onClose} />
      <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
        <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
          <Ro label="Mã yêu cầu" value={req.id} />
          <Ro label="Thời gian gửi" value={req.thoiGianGui} />
          <Ro label="Số công chứng" value={req.soCC} />
          <Ro label="Mã QR" value={req.qr} />
          <Ro label="Người nhận yêu cầu" value={req.nguoiNhan} />
          <Ro label="TCHNCC nhận" value={req.tchnccNhan} />
          <div className="sm:col-span-2"><Ro label="Nội dung đề nghị" value={req.noiDung} /></div>
          <Ro label="Trạng thái" node={<StatusPill meta={REQ_STATUS[req.trangThai]} />} />
          {req.trangThai === "Đã xác nhận" && <Ro label="Thời gian hiệu lực" value={`${req.thoiGianHieuLuc} phút`} />}
        </div>
        {req.trangThai === "Từ chối" && (
          <div className="mt-3 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2">
            <div className="text-[12px] font-semibold text-[#b91c1c]">Lý do từ chối</div>
            <div className="mt-1 text-[13px] text-[#7f1d1d]">{req.lyDoTuChoi}</div>
          </div>
        )}
      </div>
      <div className="flex justify-end border-t border-border px-6 py-4"><Button variant="outline" onClick={onClose}>Đóng</Button></div>
    </Overlay>
  )
}

/* ============================ TAB3 POP01 — XÁC NHẬN ĐỒNG Ý ============================ */
export function ApproveModal({ req, onClose, onConfirm }: { req: ReferenceRequest; onClose: () => void; onConfirm: (minutes: number) => void }) {
  const [minutes, setMinutes] = useState("60")
  const [err, setErr] = useState("")
  const confirm = () => {
    const n = Number(minutes)
    if (!Number.isInteger(n) || n <= 0 || n > 60) return setErr("Thời gian hiệu lực phải là số nguyên lớn hơn 0 và không vượt quá 60.")
    onConfirm(n)
  }
  return (
    <Overlay onClose={onClose} w="w-[540px]">
      <Head icon={<Eye className="size-[18px] text-foreground-muted" />} title="Xác nhận cho phép xem file VBCCĐT" onClose={onClose} />
      <div className="px-6 py-5">
        <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
          <Ro label="Số công chứng" value={req.soCC} />
          <Ro label="TCHNCC gửi" value={req.tchnccGui} />
          <Ro label="CCV gửi" value={req.nguoiGui} />
          <div className="sm:col-span-2"><Ro label="Ghi chú yêu cầu" value={req.noiDung} /></div>
        </div>
        <div className="mt-3">
          <label className="text-xs font-semibold text-foreground-strong">Thời gian hiệu lực mở file (phút) <span className="text-red-600">*</span></label>
          <input inputMode="numeric" value={minutes} onChange={(e) => { setMinutes(e.target.value.replace(/[^\d]/g, "")); if (err) setErr("") }} className={cn(inputCls, "mt-1.5 w-[160px]")} />
          <p className="mt-1 text-[12px] text-foreground-muted">Số nguyên &gt; 0 và ≤ 60. Hệ thống tự động thu hồi quyền sau khi hết thời gian.</p>
          {err && <div className="mt-1 text-[12px] text-red-600">{err}</div>}
        </div>
      </div>
      <div className="flex justify-end border-t border-border px-6 py-4"><Button onClick={confirm}><Eye className="size-4" />Xác nhận đồng ý</Button></div>
    </Overlay>
  )
}

/* ============================ TAB3 POP02 — TỪ CHỐI ============================ */
export function RejectModal({ req, onClose, onReject }: { req: ReferenceRequest; onClose: () => void; onReject: (lyDo: string) => void }) {
  const [lyDo, setLyDo] = useState("")
  const [err, setErr] = useState("")
  const reject = () => {
    if (!lyDo.trim()) return setErr("Vui lòng nhập lý do từ chối (tối đa 500 ký tự).")
    onReject(lyDo.trim())
  }
  return (
    <Overlay onClose={onClose} w="w-[540px]">
      <Head icon={<Ban className="size-[18px] text-foreground-muted" />} title="Xác nhận từ chối yêu cầu" onClose={onClose} />
      <div className="px-6 py-5">
        <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
          <Ro label="Số công chứng" value={req.soCC} />
          <Ro label="TCHNCC gửi" value={req.tchnccGui} />
          <Ro label="CCV gửi" value={req.nguoiGui} />
          <div className="sm:col-span-2"><Ro label="Ghi chú yêu cầu" value={req.noiDung} /></div>
        </div>
        <div className="mt-3">
          <label className="text-xs font-semibold text-foreground-strong">Lý do từ chối <span className="text-red-600">*</span></label>
          <textarea autoFocus value={lyDo} maxLength={500} onChange={(e) => { setLyDo(e.target.value); if (err) setErr("") }} rows={3}
            placeholder="Nhập lý do từ chối…" className={cn(inputCls, "mt-1.5 h-auto resize-none py-2 leading-relaxed")} />
          {err && <div className="mt-1 text-[12px] text-red-600">{err}</div>}
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
        <Button variant="outline" onClick={onClose}>Hủy</Button>
        <Button variant="destructive" onClick={reject}><Ban className="size-4" />Xác nhận từ chối</Button>
      </div>
    </Overlay>
  )
}

/* ============================ QUÉT QR ============================ */
export function QrScanModal({ onClose, onScanned }: { onClose: () => void; onScanned: () => void }) {
  return (
    <Overlay onClose={onClose} w="w-[440px]">
      <Head icon={<QrCode className="size-[18px]" />} title="Quét mã QR VBCCĐT" onClose={onClose} />
      <div className="px-6 py-6">
        <div className="relative mx-auto flex h-[220px] w-[220px] items-center justify-center rounded-[12px] border-2 border-dashed border-border bg-neutral-950/[0.03]">
          <QrCode className="size-20 text-foreground-subtle" />
          <div className="absolute inset-x-0 top-1/2 h-0.5 animate-pulse bg-emerald-500/70" />
        </div>
        <p className="mt-4 text-center text-[12.5px] text-foreground-muted">Đưa mã QR trên văn bản vào khung quét. (Bản mô phỏng — bấm nút dưới để mô phỏng quét thành công.)</p>
      </div>
      <div className="flex justify-between gap-2 border-t border-border px-6 py-4">
        <Button variant="outline" onClick={onClose}><X className="size-4" />Tắt</Button>
        <Button onClick={onScanned}><ScanLine className="size-4" />Mô phỏng quét thành công</Button>
      </div>
    </Overlay>
  )
}

/* ============================ KHUNG PREVIEW PDF (dùng lại) ============================ */
export function PdfFrame({ fileName }: { fileName: string }) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 rounded-[10px] border border-dashed border-border bg-neutral-50 py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-red-50 text-red-600"><FileText className="size-7" /></div>
      <div className="font-mono text-[13px] font-semibold text-foreground-strong">{fileName}</div>
      <div className="max-w-[380px] text-[12.5px] text-foreground-muted">Khung xem trước nội dung file VBCCĐT (bản mô phỏng).</div>
    </div>
  )
}
