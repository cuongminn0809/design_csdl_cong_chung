import { useEffect, useState } from "react"
import { ArrowLeft, Bell } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { EmptyState } from "../ingestion/shared"
import { NOTI_GROUPS, NOTI_ROLES, saveSubscriptions, setCurrentRole, useCurrentRole, useSubscriptions } from "./config"

export function SubscribePage() {
  const navigate = useNavigate()
  const showToast = useToast()
  const role = useCurrentRole()
  const saved = useSubscriptions()
  const groups = NOTI_GROUPS.filter((g) => g.applicableRoles.includes(role))
  const [draft, setDraft] = useState<Record<string, boolean>>(saved)

  useEffect(() => { setDraft(saved) }, [saved, role])

  const toggle = (id: string) => setDraft((d) => ({ ...d, [id]: !(d[id] ?? true) }))
  const dirty = groups.some((g) => (draft[g.id] ?? true) !== (saved[g.id] ?? true))

  const doSave = () => {
    saveSubscriptions(draft)
    showToast("Lưu đăng ký nhận thông báo thành công.")
  }
  const doCancel = () => setDraft(saved)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <button onClick={() => navigate("/tien-ich/thong-bao")} className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-foreground-muted shadow-xs hover:bg-surface-muted"><ArrowLeft className="size-4" /></button>
          <div className="max-w-xl">
            <h3 className="text-[24px] font-semibold leading-tight tracking-[-0.02em] text-foreground-strong">Đăng ký nhận thông báo</h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground-muted">Chọn các nhóm thông tin bạn muốn nhận thông báo. Áp dụng ngay sau khi lưu, không ảnh hưởng thông báo đã gửi trước đó.</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 pt-1.5">
          <span className="text-[12.5px] text-foreground-muted">Vai trò:</span>
          <select value={role} onChange={(e) => setCurrentRole(e.target.value as typeof role)} className="h-8 w-[220px] cursor-pointer rounded-md border border-input bg-surface px-2 text-[12.5px] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
            {NOTI_ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        {groups.length ? (
          <ul className="divide-y divide-neutral-100">
            {groups.map((g) => {
              const on = draft[g.id] ?? true
              return (
                <li key={g.id} className="flex items-center justify-between gap-6 px-6 py-5">
                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold text-foreground-strong">{g.name}</div>
                    <div className="mt-1 text-[12.5px] leading-relaxed text-foreground-muted">{g.events}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggle(g.id)}
                    aria-pressed={on}
                    className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", on ? "bg-neutral-900" : "bg-neutral-200")}
                  >
                    <span
                      className="absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform"
                      style={{ transform: on ? "translateX(22px)" : "translateX(0)" }}
                    />
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <EmptyState icon={<Bell className="size-6" />} title="Chưa có nhóm thông tin nào áp dụng" desc="Hiện chưa có nhóm thông tin nào áp dụng cho vai trò của bạn." />
        )}
      </div>

      {groups.length > 0 && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={!dirty} onClick={doCancel}>Hủy thay đổi</Button>
          <Button disabled={!dirty} onClick={doSave}>Lưu đăng ký</Button>
        </div>
      )}
    </div>
  )
}
