import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { getSource, ROLE_LABEL, type RevokeRequest, type Role } from "./config"
import type { Transaction } from "../config"

/** Danh sách bên liên quan giao dịch gốc dạng "Bên A: … / Bên B: …" cho cột grid. */
export function partiesLine(t?: Transaction): string {
  if (!t || !t.parties.length) return "—"
  const labels = ["Bên A", "Bên B", "Bên C", "Bên D"]
  return t.parties.map((p, i) => `${labels[i] ?? `Bên ${i + 1}`}: ${p.name}`).join("; ")
}

export const sourceParties = (r: RevokeRequest) => getSource(r)?.parties ?? []
export const sourceAssets = (r: RevokeRequest) => getSource(r)?.assets ?? []

/** Bộ chọn vai trò mô phỏng — điều khiển Visibility Rules (nút Sửa / Duyệt / Hủy VB). */
export function RoleSelect({ role, onChange }: { role: Role; onChange: (r: Role) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[12.5px] text-foreground-muted">Vai trò:</span>
      <NativeSelect value={role} onChange={(e) => onChange(e.target.value as Role)} className="h-8 w-[168px] text-[12.5px]">
        {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
          <option key={r} value={r}>{ROLE_LABEL[r]}</option>
        ))}
      </NativeSelect>
    </div>
  )
}

export function ConfirmDialog({
  title, message, confirmLabel = "Xác nhận", danger, onConfirm, onClose,
}: {
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-[440px] max-w-full overflow-hidden rounded-xl bg-surface shadow-popover">
        <div className="px-6 pb-2 pt-5">
          <div className="text-[15px] font-semibold text-foreground-strong">{title}</div>
          <p className="mt-2 text-[13.5px] leading-relaxed text-foreground-muted">{message}</p>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4">
          <Button variant="outline" onClick={onClose}>Hủy bỏ</Button>
          <Button
            onClick={onConfirm}
            className={cn(danger && "bg-red-600 text-white hover:bg-red-700")}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
