import { useState } from "react"
import { createPortal } from "react-dom"
import { AlertTriangle, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { Th } from "../ingestion/shared"
import { fmtVNDateTime, terminateOrg, type OrgHistoryEntry, type TchnccOrg } from "./config"

function Modal({ title, wide, onClose, footer, children }: { title: string; wide?: boolean; onClose: () => void; footer?: React.ReactNode; children: React.ReactNode }) {
  return createPortal(
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={onClose}>
      <div className={cn("flex max-h-[88vh] w-full flex-col overflow-hidden rounded-xl bg-surface shadow-popover", wide ? "max-w-[680px]" : "max-w-[480px]")} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
          <span className="text-[15px] font-semibold text-foreground-strong">{title}</span>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="size-[18px]" /></Button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-border px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body
  )
}
function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return <div className="flex flex-col gap-0.5 border-b border-neutral-100 py-2"><div className="text-xs text-foreground-muted">{label}</div><div className="text-[13.5px] leading-snug text-foreground">{value || "—"}</div></div>
}

/* ============================ SCR-A.10.1-09 — Chi tiết lần thay đổi TCHNCC ============================ */
export function HistoryDetailDialog({ entry, onClose }: { entry: OrgHistoryEntry; onClose: () => void }) {
  return (
    <Modal title="Chi tiết lần thay đổi" wide onClose={onClose} footer={<Button onClick={onClose}>Đóng</Button>}>
      <div className="mb-4 grid grid-cols-2 gap-x-6">
        <Field label="Thời gian" value={fmtVNDateTime(entry.thoiGian)} />
        <Field label="Thao tác" value={entry.thaoTac} />
        <Field label="Người thực hiện" value={entry.nguoiThucHien} />
        <Field label="Tổ chức công chứng" value={entry.orgTen} />
      </div>
      {entry.thaoTac === "Thêm mới" ? (
        <>
          <div className="mb-2 text-xs font-semibold text-foreground-muted">Nội dung</div>
          <div className="rounded-md border border-border bg-neutral-50 px-4 py-3 text-[13.5px] text-foreground">{entry.noiDung}</div>
        </>
      ) : (
        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full border-collapse text-sm">
            <thead><tr className="border-b border-border bg-neutral-50"><Th className="w-11 text-center">STT</Th><Th>Thông tin thay đổi</Th><Th>Giá trị cũ</Th><Th>Giá trị mới</Th></tr></thead>
            <tbody>{entry.changes.map((c, i) => (
              <tr key={i} className="border-b border-neutral-100 last:border-0">
                <td className="px-4 py-2.5 text-center tabular-nums text-foreground-muted">{i + 1}</td>
                <td className="px-4 py-2.5 text-foreground">{c.truong}</td>
                <td className="px-4 py-2.5 text-foreground-muted">{c.cu || "-"}</td>
                <td className="px-4 py-2.5 text-foreground-muted">{c.moi || "-"}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </Modal>
  )
}

/* ============================ SCR-A.10.1-08 — Xác nhận Chấm dứt hoạt động ============================ */
export function TerminateDialog({ org, actor, onClose, onDone }: { org: TchnccOrg; actor: string; onClose: () => void; onDone: () => void }) {
  const showToast = useToast()
  const [error, setError] = useState("")

  const doConfirm = () => {
    const r = terminateOrg(org.id, org.version, actor)
    if (r.ok) { showToast("Đã chuyển tổ chức công chứng sang Chấm dứt hoạt động."); onDone() }
    else setError(r.reason)
  }

  return (
    <Modal title="Chấm dứt hoạt động tổ chức công chứng" onClose={onClose} footer={<><Button variant="outline" onClick={onClose}>Hủy</Button><Button variant="destructive" onClick={doConfirm}>Xác nhận</Button></>}>
      <div className="mb-4 flex items-start gap-3 rounded-md border border-[#fde68a] bg-[#fffbeb] px-4 py-3">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
        <div className="text-[13px] text-amber-900">Bạn có chắc chắn muốn chuyển tổ chức công chứng sang trạng thái Chấm dứt hoạt động? Thao tác này chỉ cập nhật trạng thái, không xóa hồ sơ hay dữ liệu liên quan.</div>
      </div>
      <Field label="Tổ chức và trạng thái hiện tại" value={`${org.ten} (${org.loaiHinh}) — ${org.trangThai}`} />
      <Field label="Trạng thái được đưa đến" value="Chấm dứt hoạt động" />
      {error && <div className="mt-3 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]">{error}</div>}
    </Modal>
  )
}
