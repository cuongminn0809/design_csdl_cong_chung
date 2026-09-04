import { useEffect, useState } from "react"
import { ArrowLeft, Bell } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { EmptyState, PageHeader } from "../ingestion/shared"
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
    <div className="space-y-4">
      <PageHeader title="Đăng ký nhận thông báo" desc="Chọn các nhóm thông tin bạn muốn nhận thông báo. Áp dụng ngay sau khi lưu, không ảnh hưởng thông báo đã gửi trước đó."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/tien-ich/thong-bao")}><ArrowLeft className="size-4" />Quay lại</Button>
            <span className="text-[12.5px] text-foreground-muted">Vai trò:</span>
            <select value={role} onChange={(e) => setCurrentRole(e.target.value as typeof role)} className="h-8 w-[220px] cursor-pointer rounded-md border border-input bg-surface px-2 text-[12.5px]">
              {NOTI_ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </select>
          </div>
        } />

      <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        {groups.length ? (
          <ul className="divide-y divide-neutral-100">
            {groups.map((g) => {
              const on = draft[g.id] ?? true
              return (
                <li key={g.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-semibold text-foreground-strong">{g.name}</div>
                    <div className="mt-0.5 text-[12.5px] text-foreground-muted">{g.events}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggle(g.id)}
                    aria-pressed={on}
                    className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", on ? "bg-neutral-900" : "bg-neutral-200")}
                  >
                    <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform", on ? "translate-x-[22px]" : "translate-x-0.5")} />
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
