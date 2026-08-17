import { useEffect, useRef, useState } from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { Th, inputCls } from "../ingestion/shared"
import { ROLE_LABEL, STAFF_BTP, STAFF_STP, isCentral, type HistoryEntry, type PreventRole } from "./config"

export function RoleSelect({ role, onChange }: { role: PreventRole; onChange: (r: PreventRole) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[12.5px] text-foreground-muted">Vai trò:</span>
      <NativeSelect value={role} onChange={(e) => onChange(e.target.value as PreventRole)} className="h-8 w-[200px] text-[12.5px]">
        {(Object.keys(ROLE_LABEL) as PreventRole[]).map((r) => (
          <option key={r} value={r}>{ROLE_LABEL[r]}</option>
        ))}
      </NativeSelect>
    </div>
  )
}

export function ConfirmDialog({ title, message, confirmLabel = "Xác nhận", danger, onConfirm, onClose }: {
  title: string; message: string; confirmLabel?: string; danger?: boolean; onConfirm: () => void; onClose: () => void
}) {
  return (
    <Overlay onClose={onClose}>
      <div className="w-[440px] max-w-full overflow-hidden rounded-xl bg-surface shadow-popover" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
          <span className="text-[15px] font-semibold text-foreground-strong">{title}</span>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="size-[18px]" /></Button>
        </div>
        <p className="px-6 py-5 text-[13.5px] leading-relaxed text-foreground-muted">{message}</p>
        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={onConfirm} className={cn(danger && "bg-red-600 text-white hover:bg-red-700")}>{confirmLabel}</Button>
        </div>
      </div>
    </Overlay>
  )
}

/** Popup nhập lý do từ chối (tiếp nhận / duyệt) — VR001 bắt buộc, VR002 ≤1000. */
export function ReasonDialog({ title, label, onSubmit, onClose }: { title: string; label: string; onSubmit: (reason: string) => void; onClose: () => void }) {
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")
  const submit = () => {
    const v = reason.trim()
    if (!v) return setError(`${label} là bắt buộc`)
    if (v.length > 1000) return setError(`${label} không được vượt quá 1000 ký tự`)
    onSubmit(v)
  }
  return (
    <Overlay onClose={onClose}>
      <div className="w-[520px] max-w-full overflow-hidden rounded-xl bg-surface shadow-popover" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
          <span className="text-[15px] font-semibold text-foreground-strong">{title}</span>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="size-[18px]" /></Button>
        </div>
        <div className="px-6 py-5">
          <label className="text-xs font-semibold text-foreground-strong">{label} <span className="text-red-600">*</span></label>
          <textarea autoFocus value={reason} onChange={(e) => { setReason(e.target.value); if (error) setError("") }} rows={4} maxLength={1100}
            placeholder="Nhập nội dung…" className={cn(inputCls, "mt-1.5 h-auto resize-none py-2 leading-relaxed")} />
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[12px] text-red-600">{error}</span>
            <span className={cn("text-[11.5px]", reason.length > 1000 ? "text-red-600" : "text-foreground-subtle")}>{reason.length}/1000</span>
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

/** Popup phân công cán bộ xử lý (SCR-A.1.1-05) — VR001 bắt buộc chọn cán bộ. */
export function AssignDialog({ leaderRole, onSubmit, onClose }: { leaderRole: PreventRole; onSubmit: (staff: string) => void; onClose: () => void }) {
  const [staff, setStaff] = useState("")
  const [error, setError] = useState("")
  const options = isCentral(leaderRole) ? STAFF_BTP : STAFF_STP // BR001: phân công theo cấp
  const submit = () => {
    if (!staff) return setError("Vui lòng chọn cán bộ xử lý")
    onSubmit(staff)
  }
  return (
    <Overlay onClose={onClose}>
      <div className="w-[480px] max-w-full overflow-hidden rounded-xl bg-surface shadow-popover" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
          <span className="text-[15px] font-semibold text-foreground-strong">Phân công cán bộ xử lý</span>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="size-[18px]" /></Button>
        </div>
        <div className="px-6 py-5">
          <label className="text-xs font-semibold text-foreground-strong">Cán bộ xử lý <span className="text-red-600">*</span></label>
          <NativeSelect value={staff} onChange={(e) => { setStaff(e.target.value); if (error) setError("") }} className="mt-1.5">
            <option value="">— Chọn chuyên viên —</option>
            {options.map((o) => <option key={o} value={o}>{o}</option>)}
          </NativeSelect>
          {error && <div className="mt-1.5 text-[12px] text-red-600">{error}</div>}
        </div>
        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
          <Button variant="outline" onClick={onClose}>Hủy / Đóng</Button>
          <Button onClick={submit}>Xác nhận</Button>
        </div>
      </div>
    </Overlay>
  )
}

/** Popup trình lãnh đạo (SCR-A.1.1-02-SubmitReview) — chọn lãnh đạo + ý kiến. */
export function SubmitReviewDialog({ leaderRole, onSubmit, onClose }: { leaderRole: PreventRole; onSubmit: () => void; onClose: () => void }) {
  const [leader, setLeader] = useState("")
  const [opinion, setOpinion] = useState("")
  const [error, setError] = useState("")
  const leaders = isCentral(leaderRole) ? ["ld_btp — Lãnh đạo BTP"] : ["ld_stp — Lãnh đạo phòng STP"]
  const submit = () => {
    if (!leader) return setError("Vui lòng chọn lãnh đạo phê duyệt")
    if (opinion.length > 500) return setError("Ý kiến trình duyệt không được vượt quá 500 ký tự")
    onSubmit()
  }
  return (
    <Overlay onClose={onClose}>
      <div className="w-[520px] max-w-full overflow-hidden rounded-xl bg-surface shadow-popover" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
          <span className="text-[15px] font-semibold text-foreground-strong">Trình lãnh đạo phê duyệt</span>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="size-[18px]" /></Button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="text-xs font-semibold text-foreground-strong">Lãnh đạo phê duyệt <span className="text-red-600">*</span></label>
            <NativeSelect value={leader} onChange={(e) => { setLeader(e.target.value); if (error) setError("") }} className="mt-1.5">
              <option value="">— Chọn lãnh đạo —</option>
              {leaders.map((o) => <option key={o} value={o}>{o}</option>)}
            </NativeSelect>
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground-strong">Ý kiến trình duyệt</label>
            <textarea value={opinion} onChange={(e) => setOpinion(e.target.value)} rows={3} maxLength={600} placeholder="Nhập ý kiến giải trình (không bắt buộc)…" className={cn(inputCls, "mt-1.5 h-auto resize-none py-2 leading-relaxed")} />
            <div className="mt-1 text-right text-[11.5px] text-foreground-subtle">{opinion.length}/500</div>
          </div>
          {error && <div className="text-[12px] text-red-600">{error}</div>}
        </div>
        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={submit}>Xác nhận</Button>
        </div>
      </div>
    </Overlay>
  )
}

/** Popup lịch sử cập nhật (SCR-A.1.1-08). */
export function HistoryDialog({ history, onClose }: { history: HistoryEntry[]; onClose: () => void }) {
  return (
    <Overlay onClose={onClose}>
      <div className="flex max-h-[80vh] w-[780px] max-w-full flex-col overflow-hidden rounded-xl bg-surface shadow-popover" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
          <span className="text-[15px] font-semibold text-foreground-strong">Lịch sử cập nhật thông tin ngăn chặn</span>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="size-[18px]" /></Button>
        </div>
        <div className="overflow-y-auto px-6 py-5">
          {history.length ? (
            <div className="overflow-hidden rounded-[10px] border border-border">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-neutral-50">
                    <Th className="px-3.5 py-2.5">Thời gian</Th>
                    <Th className="px-3.5 py-2.5">Người thực hiện</Th>
                    <Th className="px-3.5 py-2.5">Thao tác</Th>
                    <Th className="px-3.5 py-2.5">Thông tin thay đổi</Th>
                    <Th className="px-3.5 py-2.5">Giá trị cũ</Th>
                    <Th className="px-3.5 py-2.5">Giá trị mới</Th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={i} className="border-b border-neutral-100">
                      <td className="whitespace-nowrap px-3.5 py-2.5 tabular-nums text-foreground-muted">{h.time}</td>
                      <td className="px-3.5 py-2.5 text-foreground">{h.actor}</td>
                      <td className="px-3.5 py-2.5"><span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11.5px] font-medium text-foreground-muted">{h.thaoTac}</span></td>
                      <td className="px-3.5 py-2.5 text-foreground-muted">{h.truong ?? "—"}</td>
                      <td className="px-3.5 py-2.5 text-foreground-muted">{h.cu ?? "—"}</td>
                      <td className="px-3.5 py-2.5 text-[#15803d]">{h.moi ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-[10px] border border-dashed border-border py-10 text-center text-[13.5px] text-foreground-muted">Không tìm thấy lịch sử cập nhật thông tin ngăn chặn.</div>
          )}
        </div>
        <div className="flex justify-end border-t border-border px-6 py-3.5">
          <Button variant="outline" onClick={onClose}>Quay lại / Đóng</Button>
        </div>
      </div>
    </Overlay>
  )
}

const FOCUSABLE = "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex=\"-1\"])"

function Overlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const prev = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const focusable = () => [...root.querySelectorAll<HTMLElement>(FOCUSABLE)]
    focusable()[0]?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        onCloseRef.current()
        return
      }
      if (e.key !== "Tab") return
      const items = focusable()
      if (!items.length) { e.preventDefault(); return }
      const first = items[0]
      const last = items[items.length - 1]
      const outside = !root.contains(document.activeElement)
      if (e.shiftKey && (document.activeElement === first || outside)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (document.activeElement === last || outside)) {
        e.preventDefault()
        first.focus()
      }
    }
    const onFocusIn = (e: FocusEvent) => {
      if (!root.contains(e.target as Node)) focusable()[0]?.focus()
    }

    document.addEventListener("keydown", onKeyDown, true)
    document.addEventListener("focusin", onFocusIn)
    return () => {
      document.removeEventListener("keydown", onKeyDown, true)
      document.removeEventListener("focusin", onFocusIn)
      prev?.focus()
    }
  }, [])

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[140] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6"
      onClick={onClose}
    >
      {children}
    </div>
  )
}
