import { useState } from "react"
import { Activity } from "lucide-react"

import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { EmptyState, PageHeader } from "../ingestion/shared"
import { activitiesForRole, hasCard, relativeTime, UTIL_ROLES, type UtilRole } from "./config"

export function RecentActivitiesPage() {
  const [role, setRole] = useState<UtilRole>("admin")
  const canView = hasCard(role, "activities")
  const rows = canView ? activitiesForRole(role) : []

  return (
    <div className="space-y-4">
      <PageHeader title="Hoạt động gần đây" desc="Hiển thị tối đa 5 hoạt động mới nhất trong phạm vi quyền của tài khoản."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] text-foreground-muted">Vai trò:</span>
            <NativeSelect value={role} onChange={(e) => setRole(e.target.value as UtilRole)} className="h-8 w-[240px] text-[12.5px]">
              {UTIL_ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </NativeSelect>
          </div>
        } />

      <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        {!canView ? (
          <EmptyState icon={<Activity className="size-6" />} title="Không có quyền xem hoạt động gần đây" desc="Vai trò hiện tại không được gán quyền chức năng này." />
        ) : rows.length ? (
          <ul className="divide-y divide-neutral-100">
            {rows.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div className="min-w-0 text-[13.5px] text-foreground">
                  <span className="font-medium">{a.unit}</span> {a.action} <span className="text-foreground-muted">{a.object}</span>
                </div>
                <div className="shrink-0 text-[12.5px] text-foreground-subtle">{relativeTime(a.time)}</div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={<Activity className="size-6" />} title="Không có hoạt động gần đây" desc="Không có hoạt động nào trong phạm vi quyền của tài khoản." />
        )}
      </div>
    </div>
  )
}
