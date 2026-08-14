import { useState } from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { inputCls } from "../../ingestion/shared"

// Vai trò mô phỏng trong luồng xử lý phê duyệt GDCC (A.3.1.3).
export type NotaryRole = "ccv" | "truong"
export const NOTARY_ROLE_LABEL: Record<NotaryRole, string> = {
  ccv: "Công chứng viên",
  truong: "Trưởng TCHNCC",
}

export function NotaryRoleSelect({ role, onChange }: { role: NotaryRole; onChange: (r: NotaryRole) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[12.5px] text-foreground-muted">Vai trò:</span>
      <NativeSelect value={role} onChange={(e) => onChange(e.target.value as NotaryRole)} className="h-8 w-[160px] text-[12.5px]">
        {(Object.keys(NOTARY_ROLE_LABEL) as NotaryRole[]).map((r) => <option key={r} value={r}>{NOTARY_ROLE_LABEL[r]}</option>)}
      </NativeSelect>
    </div>
  )
}

function Overlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return <div className="fixed inset-0 z-[140] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={onClose}>{children}</div>
}

/** DLG-A.3.1.3-01 / DLG-A.3.1.3-03 — Hộp thoại xác nhận (trình duyệt / phê duyệt). */
export function ConfirmActionDialog({ title, message, confirmLabel, onConfirm, onClose }: {
  title: string; message: string; confirmLabel: string; onConfirm: () => void; onClose: () => void
}) {
  return (
    <Overlay onClose={onClose}>
      <div className="w-[480px] max-w-full overflow-hidden rounded-xl bg-surface shadow-popover" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
          <span className="text-[15px] font-semibold text-foreground-strong">{title}</span>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="size-[18px]" /></Button>
        </div>
        <p className="px-6 py-5 text-[13.5px] leading-relaxed text-foreground-muted">{message}</p>
        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
          <Button variant="outline" onClick={onClose}>Hủy bỏ</Button>
          <Button onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </Overlay>
  )
}

/** DLG-A.3.1.3-02 — Popup nhập lý do yêu cầu chỉnh sửa (VR-01 bắt buộc, VR-02 ≤500). */
export function RequestEditDialog({ onSubmit, onClose }: { onSubmit: (reason: string) => void; onClose: () => void }) {
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")
  const submit = () => {
    const v = reason.trim()
    if (!v) return setError("Vui lòng nhập lý do yêu cầu chỉnh sửa")
    if (v.length > 500) return setError("Lý do yêu cầu chỉnh sửa không được vượt quá 500 ký tự")
    onSubmit(v)
  }
  return (
    <Overlay onClose={onClose}>
      <div className="w-[520px] max-w-full overflow-hidden rounded-xl bg-surface shadow-popover" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
          <span className="text-[15px] font-semibold text-foreground-strong">Yêu cầu chỉnh sửa giao dịch công chứng</span>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="size-[18px]" /></Button>
        </div>
        <div className="px-6 py-5">
          <label className="text-xs font-semibold text-foreground-strong">Lý do yêu cầu chỉnh sửa <span className="text-red-600">*</span></label>
          <textarea autoFocus value={reason} onChange={(e) => { setReason(e.target.value); if (error) setError("") }} rows={4} maxLength={600}
            placeholder="Nhập nội dung chi tiết cần chỉnh sửa…" className={cn(inputCls, "mt-1.5 h-auto resize-none py-2 leading-relaxed")} />
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[12px] text-red-600">{error}</span>
            <span className={cn("text-[11.5px]", reason.length > 500 ? "text-red-600" : "text-foreground-subtle")}>{reason.length}/500 ký tự</span>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
          <Button variant="outline" onClick={onClose}>Hủy / Đóng</Button>
          <Button onClick={submit}>Xác nhận</Button>
        </div>
      </div>
    </Overlay>
  )
}
