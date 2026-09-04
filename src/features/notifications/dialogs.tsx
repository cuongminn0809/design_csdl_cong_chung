import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Download, ExternalLink, Trash2, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { Th } from "../ingestion/shared"
import {
  KY_BAO_CAO, RECIPIENT_ORGS, TODAY_ISO, canRemindToday, createReportNoti, deleteReportNoti,
  fmtVN, fmtVNDateTime, getFeedback, getNotification, hasUnsubmitted, markFeedbackRead,
  markRead, publishReportNoti, remindReportNoti, softDeleteNoti, updateReportNotiDraft,
  type MyNotification, type ReportNoti,
} from "./config"

function Modal({ title, wide, onClose, footer, children }: { title: string; wide?: boolean; onClose: () => void; footer?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={onClose}>
      <div className={cn("flex max-h-[88vh] w-full flex-col overflow-hidden rounded-xl bg-surface shadow-popover", wide ? "max-w-[720px]" : "max-w-[520px]")} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
          <span className="text-[15px] font-semibold text-foreground-strong">{title}</span>
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
const inputCls = "h-9 w-full rounded-md border border-input bg-surface px-3 text-sm shadow-xs outline-none focus-visible:border-border-focus focus-visible:ring-[3px] focus-visible:ring-ring/50"

/* ============================ SCR-A.9.2.1-03 — Popup chi tiết thông báo (dùng chung cho -02 và -06) ============================ */
export function NotiDetailModal({ id, feedback, onClose }: { id: string; feedback?: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const showToast = useToast()
  const noti = feedback ? undefined : getNotification(id)
  const fb = feedback ? getFeedback(id) : undefined

  useEffect(() => {
    if (noti && !noti.read) markRead(noti.id)
    if (fb && !fb.read) markFeedbackRead(fb.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (!noti && !fb) {
    return <Modal title="Chi tiết thông báo" onClose={onClose} footer={<Button onClick={onClose}>Đóng</Button>}>
      <div className="text-[13.5px] text-foreground-muted">Thông báo không tồn tại hoặc đã bị xóa.</div>
    </Modal>
  }

  const title = noti?.title ?? fb!.title
  const content = noti?.content ?? fb!.content
  const receivedAt = noti?.receivedAt ?? fb!.receivedAt
  const relatedLabel = noti?.related?.label ?? fb?.relatedLabel
  const relatedPath = noti?.related?.path ?? fb?.relatedPath

  return (
    <Modal title="Chi tiết thông báo" wide onClose={onClose} footer={<Button onClick={onClose}>Đóng</Button>}>
      <div className="mb-3 text-[14.5px] font-semibold text-foreground-strong">{title}</div>
      <div className="mb-4 grid grid-cols-2 gap-x-6">
        {noti && <Field label="Loại thông báo" value={noti.type} />}
        {noti && <Field label="Mức ưu tiên" value={noti.priority} />}
        <Field label="Nguồn gửi" value={noti?.source ?? "Hệ thống"} />
        <Field label="Thời gian gửi" value={fmtVNDateTime(receivedAt)} />
        {fb && <Field label="Trạng thái xử lý" value={fb.status} />}
      </div>
      <div className="mb-2 text-xs font-semibold text-foreground-muted">Nội dung</div>
      <div className="mb-4 rounded-md border border-border bg-neutral-50 px-4 py-3 text-[13.5px] leading-relaxed text-foreground">{content}</div>
      {noti && noti.attachments.length > 0 && (
        <div className="mb-4">
          <div className="mb-2 text-xs font-semibold text-foreground-muted">Tệp đính kèm</div>
          <div className="flex flex-col gap-1.5">
            {noti.attachments.map((a) => (
              <div key={a.name} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-[13px]">
                <span className="text-foreground">{a.name} <span className="text-foreground-muted">· {a.size}</span></span>
                <Button variant="outline" size="sm" onClick={() => showToast(`Đã tải xuống ${a.name}.`)}><Download className="size-3.5" /></Button>
              </div>
            ))}
          </div>
        </div>
      )}
      {relatedLabel && relatedPath && (
        <button onClick={() => { onClose(); navigate(relatedPath) }} className="flex items-center gap-1.5 text-[13.5px] font-medium text-link hover:underline">
          <ExternalLink className="size-3.5" />{relatedLabel}
        </button>
      )}
    </Modal>
  )
}

/* ============================ SCR-A.9.2.1-04 — Dialog xác nhận xóa thông báo cá nhân ============================ */
export function DeleteNotiDialog({ noti, onClose }: { noti: MyNotification; onClose: () => void }) {
  const showToast = useToast()
  return (
    <Modal title="Xóa thông báo" onClose={onClose} footer={
      <>
        <Button variant="outline" onClick={onClose}>Hủy</Button>
        <Button variant="destructive" onClick={() => { softDeleteNoti(noti.id); showToast("Xóa thông báo thành công."); onClose() }}><Trash2 className="size-4" />Xóa</Button>
      </>
    }>
      <div className="text-[13.5px] text-foreground">Bạn có chắc chắn muốn xóa thông báo <span className="font-semibold">"{noti.title}"</span>?</div>
      <div className="mt-2 text-[12.5px] text-foreground-muted">Thao tác này chỉ xóa bản thông báo của riêng bạn, không ảnh hưởng tới người nhận khác.</div>
    </Modal>
  )
}

/* ============================ SCR-A.9.2.1-08 — Popup thêm mới/cập nhật thông báo đợt báo cáo ============================ */
export function ReportNotiFormDialog({ record, currentUser, onClose }: { record?: ReportNoti; currentUser: string; onClose: () => void }) {
  const showToast = useToast()
  const [tieuDe, setTieuDe] = useState(record?.tieuDe ?? "")
  const [kyBaoCao, setKyBaoCao] = useState(record?.kyBaoCao ?? KY_BAO_CAO[0])
  const [hanNop, setHanNop] = useState(record?.hanNop ?? "")
  const [noiDung, setNoiDung] = useState(record?.noiDung ?? "")
  const [donViNhan, setDonViNhan] = useState<string[]>(record?.donViNhan ?? [])
  const [error, setError] = useState("")

  const toggleOrg = (o: string) => setDonViNhan((prev) => (prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o]))

  const doSaveDraft = () => {
    if (!tieuDe.trim()) return setError("Vui lòng nhập tiêu đề thông báo.")
    setError("")
    if (record) { updateReportNotiDraft(record.id, { tieuDe: tieuDe.trim(), kyBaoCao, hanNop, noiDung, donViNhan }); showToast("Lưu nháp thông báo đợt báo cáo thành công.") }
    else { createReportNoti({ tieuDe: tieuDe.trim(), kyBaoCao, hanNop, noiDung, donViNhan }, currentUser); showToast("Lưu nháp thông báo đợt báo cáo thành công.") }
    onClose()
  }
  const doPublish = () => {
    if (!tieuDe.trim()) return setError("Vui lòng nhập tiêu đề thông báo.")
    if (!kyBaoCao) return setError("Vui lòng chọn kỳ báo cáo.")
    if (!hanNop) return setError("Vui lòng chọn hạn nộp.")
    if (hanNop <= TODAY_ISO) return setError("Hạn nộp phải sau ngày hiện tại.")
    if (!noiDung.trim()) return setError("Vui lòng nhập nội dung thông báo.")
    if (donViNhan.length === 0) return setError("Vui lòng chọn ít nhất một đơn vị nhận.")
    setError("")
    const rec = record ? (updateReportNotiDraft(record.id, { tieuDe: tieuDe.trim(), kyBaoCao, hanNop, noiDung, donViNhan }), record) : createReportNoti({ tieuDe: tieuDe.trim(), kyBaoCao, hanNop, noiDung, donViNhan }, currentUser)
    publishReportNoti(rec.id)
    showToast("Phát hành thông báo đợt báo cáo thành công.")
    onClose()
  }

  return (
    <Modal title={record ? `Cập nhật thông báo ${record.maTB}` : "Thêm mới thông báo đợt báo cáo"} wide onClose={onClose} footer={
      <>
        <Button variant="outline" onClick={onClose}>Hủy</Button>
        <Button variant="outline" onClick={doSaveDraft}>Lưu nháp</Button>
        <Button onClick={doPublish}>Phát hành</Button>
      </>
    }>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2"><label className={lbl}>Tiêu đề <span className="text-red-600">*</span></label><input value={tieuDe} onChange={(e) => setTieuDe(e.target.value)} maxLength={250} className={inputCls} /></div>
        <div className="flex flex-col gap-1.5"><label className={lbl}>Kỳ báo cáo</label><NativeSelect value={kyBaoCao} onChange={(e) => setKyBaoCao(e.target.value)}>{KY_BAO_CAO.map((k) => <option key={k} value={k}>{k}</option>)}</NativeSelect></div>
        <div className="flex flex-col gap-1.5"><label className={lbl}>Hạn nộp</label><input type="date" value={hanNop} onChange={(e) => setHanNop(e.target.value)} className={inputCls} /></div>
        <div className="flex flex-col gap-1.5 sm:col-span-2"><label className={lbl}>Nội dung</label><textarea value={noiDung} onChange={(e) => setNoiDung(e.target.value)} maxLength={4000} rows={4} className={cn(inputCls, "h-auto py-2")} /></div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className={lbl}>Đơn vị nhận</label>
          <div className="flex flex-wrap gap-1.5">
            {RECIPIENT_ORGS.map((o) => (
              <button key={o} type="button" onClick={() => toggleOrg(o)} className={cn("rounded-full border px-2.5 py-1 text-[12.5px]", donViNhan.includes(o) ? "border-neutral-900 bg-neutral-900 text-white" : "border-border bg-surface text-foreground-muted hover:bg-surface-muted")}>
                {o}
              </button>
            ))}
          </div>
        </div>
      </div>
      {error && <div className="mt-3 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]">{error}</div>}
    </Modal>
  )
}

/* ============================ SCR-A.9.2.1-09 — Popup chi tiết & theo dõi thông báo đợt báo cáo ============================ */
export function ReportNotiDetailDialog({ record, onEdit, onClose }: { record: ReportNoti; onEdit: () => void; onClose: () => void }) {
  const showToast = useToast()
  const overdue = useMemo(() => !!record.hanNop && record.hanNop < TODAY_ISO, [record.hanNop])
  const published = record.trangThai === "Đã phát hành"

  const doRemind = () => {
    if (!hasUnsubmitted(record)) return
    if (!canRemindToday(record)) return showToast("Hôm nay đã gửi nhắc lại cho thông báo này. Vui lòng thử lại vào ngày mai.", "error")
    remindReportNoti(record.id)
    showToast("Đã gửi nhắc lại tới các đơn vị chưa nộp số liệu.")
  }

  return (
    <Modal title={`Chi tiết thông báo ${record.maTB}`} wide onClose={onClose} footer={
      <>
        {!published && <Button variant="outline" onClick={onEdit}>Sửa</Button>}
        {published && <Button variant="outline" disabled={!hasUnsubmitted(record) || !canRemindToday(record)} onClick={doRemind} title={!hasUnsubmitted(record) ? "Tất cả đơn vị đã nộp số liệu" : !canRemindToday(record) ? "Hôm nay đã gửi nhắc lại" : undefined}>Gửi nhắc lại</Button>}
        <Button onClick={onClose}>Đóng</Button>
      </>
    }>
      <div className="mb-4 grid grid-cols-2 gap-x-6">
        <Field label="Trạng thái" value={<span className={published ? "font-medium text-emerald-600" : "font-medium text-neutral-500"}>{record.trangThai}</span>} />
        <Field label="Kỳ báo cáo" value={record.kyBaoCao} />
        <Field label="Hạn nộp" value={record.hanNop ? <span className={overdue ? "font-medium text-red-600" : undefined}>{fmtVN(record.hanNop)}</span> : "—"} />
        <Field label="Người tạo" value={record.nguoiTao} />
        <Field label="Ngày phát hành" value={record.ngayPhatHanh ? fmtVNDateTime(record.ngayPhatHanh) : "—"} />
      </div>
      <div className="mb-2 text-xs font-semibold text-foreground-muted">Nội dung</div>
      <div className="mb-4 rounded-md border border-border bg-neutral-50 px-4 py-3 text-[13.5px] leading-relaxed text-foreground">{record.noiDung || "—"}</div>

      {published && (
        <>
          <div className="mb-2 text-xs font-semibold text-foreground-muted">Theo dõi đơn vị nhận</div>
          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full border-collapse text-sm">
              <thead><tr className="border-b border-border bg-neutral-50"><Th>Đơn vị</Th><Th>TT nhận</Th><Th>TT nộp</Th><Th>Cập nhật gần nhất</Th></tr></thead>
              <tbody>{record.tracking.map((t) => (
                <tr key={t.donVi} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-2.5 text-foreground">{t.donVi}</td>
                  <td className="px-4 py-2.5"><span className={t.ttNhan === "Đã xem" ? "text-emerald-600" : "text-foreground-muted"}>{t.ttNhan}</span></td>
                  <td className="px-4 py-2.5"><span className={t.ttNop === "Đã nộp" ? "text-emerald-600" : "text-amber-600"}>{t.ttNop}</span></td>
                  <td className="px-4 py-2.5 text-foreground-muted">{t.capNhat ? fmtVNDateTime(t.capNhat) : "—"}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </>
      )}
    </Modal>
  )
}

/* ============================ SCR-A.9.2.1-10 — Dialog xác nhận xóa thông báo đợt báo cáo ============================ */
export function DeleteReportNotiDialog({ record, onClose }: { record: ReportNoti; onClose: () => void }) {
  const showToast = useToast()
  return (
    <Modal title="Xóa thông báo đợt báo cáo" onClose={onClose} footer={
      <>
        <Button variant="outline" onClick={onClose}>Hủy</Button>
        <Button variant="destructive" onClick={() => { deleteReportNoti(record.id); showToast("Xóa thông báo đợt báo cáo thành công."); onClose() }}><Trash2 className="size-4" />Xóa</Button>
      </>
    }>
      <div className="text-[13.5px] text-foreground">Bạn có chắc chắn muốn xóa thông báo <span className="font-semibold">{record.maTB} — {record.tieuDe}</span>?</div>
      <div className="mt-2 text-[12.5px] text-foreground-muted">Chỉ áp dụng cho thông báo đang ở trạng thái Nháp.</div>
    </Modal>
  )
}
