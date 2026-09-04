import { useEffect } from "react"
import { Download, Eye, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { Th } from "../ingestion/shared"
import {
  fmtVNDateTime, incrementFaqViews,
  type Faq, type OnlineSession, type PersonalHistoryEntry,
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

/* ============================ SCR-A.9.1-06 — Modal chi tiết FAQ ============================ */
export function FaqDetailModal({ faq, onClose }: { faq: Faq; onClose: () => void }) {
  const showToast = useToast()
  useEffect(() => { incrementFaqViews(faq.id) }, [faq.id])

  return (
    <Modal title="Chi tiết câu hỏi thường gặp" wide onClose={onClose} footer={
      <>
        {faq.attachments.length > 0 && <Button variant="outline" onClick={() => showToast("Đã tải tất cả file đính kèm.")}><Download className="size-4" />Tải tất cả</Button>}
        <Button onClick={onClose}>Đóng</Button>
      </>
    }>
      <div className="mb-3 text-[14.5px] font-semibold text-foreground-strong">{faq.question}</div>
      <div className="mb-2 text-xs font-semibold text-foreground-muted">Nội dung trả lời</div>
      <div className="mb-4 rounded-md border border-border bg-neutral-50 px-4 py-3 text-[13.5px] leading-relaxed text-foreground">{faq.answer}</div>
      {faq.attachments.length > 0 && (
        <>
          <div className="mb-2 text-xs font-semibold text-foreground-muted">File đính kèm</div>
          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full border-collapse text-sm">
              <thead><tr className="border-b border-border bg-neutral-50"><Th>Tên file</Th><Th>Loại</Th><Th>Dung lượng</Th><Th className="text-right">Thao tác</Th></tr></thead>
              <tbody>{faq.attachments.map((a) => (
                <tr key={a.name} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-2.5 text-foreground">{a.name}</td>
                  <td className="px-4 py-2.5 text-foreground-muted">{a.type}</td>
                  <td className="px-4 py-2.5 text-foreground-muted">{a.size}</td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button variant="outline" size="sm" onClick={() => showToast("Đang xem trước file…")}><Eye className="size-3.5" /></Button>
                      <Button variant="outline" size="sm" onClick={() => showToast(`Đã tải xuống ${a.name}.`)}><Download className="size-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </>
      )}
    </Modal>
  )
}

/* ============================ SCR-A.9.1-09 — Popup chi tiết lịch sử thao tác cá nhân ============================ */
export function HistoryDetailPopup({ entry, actorName, onClose }: { entry: PersonalHistoryEntry; actorName: string; onClose: () => void }) {
  return (
    <Modal title="Chi tiết lịch sử thao tác" wide onClose={onClose} footer={<Button onClick={onClose}>Đóng</Button>}>
      <div className="mb-4 grid grid-cols-2 gap-x-6">
        <Field label="Người thực hiện" value={actorName} />
        <Field label="Hành động" value={entry.hanhDong} />
        <Field label="Đối tượng" value={entry.doiTuong} />
        <Field label="Thời gian" value={fmtVNDateTime(entry.thoiGian)} />
        <Field label="Địa chỉ IP" value={entry.diaChiIP} />
      </div>
      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full border-collapse text-sm">
          <thead><tr className="border-b border-border bg-neutral-50"><Th>Trường thông tin</Th><Th>Giá trị cũ</Th><Th>Giá trị mới</Th></tr></thead>
          <tbody>{entry.changes.map((c, i) => (
            <tr key={i} className="border-b border-neutral-100 last:border-0">
              <td className="px-4 py-2.5 text-foreground">{c.truong}</td>
              <td className="px-4 py-2.5 text-foreground-muted">{c.cu || "—"}</td>
              <td className="px-4 py-2.5 text-foreground-muted">{c.moi || "—"}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </Modal>
  )
}

/* ============================ SCR-A.9.1-11 — Popup chi tiết phiên đăng nhập ============================ */
export function SessionDetailPopup({ session, onClose }: { session: OnlineSession; onClose: () => void }) {
  return (
    <Modal title="Chi tiết phiên đăng nhập" onClose={onClose} footer={<Button onClick={onClose}>Đóng</Button>}>
      <Field label="Tên tài khoản" value={session.username} />
      <Field label="Thời gian đăng nhập" value={fmtVNDateTime(session.loginTime)} />
      <Field label="Thời gian hết hạn" value={fmtVNDateTime(session.expireTime)} />
      <Field label="Địa chỉ IP" value={session.ip} />
      <Field label="Trình duyệt" value={session.browser} />
    </Modal>
  )
}
