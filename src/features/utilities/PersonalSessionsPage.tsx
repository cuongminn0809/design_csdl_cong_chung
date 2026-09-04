import { useMemo, useState } from "react"
import { Download, Eye, KeyRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { EmptyState, PageHeader, Th, inputCls } from "../ingestion/shared"
import { SessionDetailPopup } from "./dialogs"
import { ADMIN_SESSIONS, UTIL_ROLES, hasCard, myOwnSessions, type OnlineSession, type UtilRole } from "./config"

export function PersonalSessionsPage() {
  const [role, setRole] = useState<UtilRole>("admin")
  const [filters, setFilters] = useState({ username: "", name: "", phone: "", email: "" })
  const [applied, setApplied] = useState(filters)
  const [detail, setDetail] = useState<OnlineSession | null>(null)
  const showToast = useToast()

  const canView = hasCard(role, "sessions")
  const isAdmin = role === "admin"

  const rows = useMemo(() => {
    if (!isAdmin) return myOwnSessions(role)
    let r = ADMIN_SESSIONS
    if (applied.username.trim()) r = r.filter((s) => s.username.toLowerCase().includes(applied.username.trim().toLowerCase()))
    if (applied.name.trim()) r = r.filter((s) => s.hoTen.toLowerCase().includes(applied.name.trim().toLowerCase()))
    if (applied.phone.trim()) r = r.filter((s) => (s.sdt ?? "").includes(applied.phone.trim()))
    if (applied.email.trim()) r = r.filter((s) => (s.email ?? "").toLowerCase().includes(applied.email.trim().toLowerCase()))
    return r
  }, [isAdmin, role, applied])

  return (
    <div className="space-y-4">
      <PageHeader title="Phiên đăng nhập" desc={isAdmin ? "Danh sách toàn bộ phiên đăng nhập trong hệ thống." : "Danh sách phiên đăng nhập của tài khoản đang đăng nhập."}
        actions={
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] text-foreground-muted">Vai trò:</span>
            <select value={role} onChange={(e) => setRole(e.target.value as UtilRole)} className="h-8 w-[240px] cursor-pointer rounded-md border border-input bg-surface px-2 text-[12.5px]">
              {UTIL_ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </select>
          </div>
        } />

      {!canView ? (
        <EmptyState icon={<KeyRound className="size-6" />} title="Không có quyền truy cập" desc="Vai trò hiện tại không được gán quyền chức năng xem phiên đăng nhập." />
      ) : (
        <>
          {isAdmin && (
            <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Tên tài khoản</label><input value={filters.username} onChange={(e) => setFilters((f) => ({ ...f, username: e.target.value }))} className={inputCls} /></div>
                <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Họ và tên</label><input value={filters.name} onChange={(e) => setFilters((f) => ({ ...f, name: e.target.value }))} className={inputCls} /></div>
                <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Số điện thoại</label><input value={filters.phone} onChange={(e) => setFilters((f) => ({ ...f, phone: e.target.value }))} className={inputCls} /></div>
                <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Email</label><input value={filters.email} onChange={(e) => setFilters((f) => ({ ...f, email: e.target.value }))} className={inputCls} /></div>
              </div>
              <div className="mt-4 flex gap-2.5">
                <Button onClick={() => setApplied(filters)}>Tìm kiếm</Button>
                <Button variant="outline" onClick={() => { const empty = { username: "", name: "", phone: "", email: "" }; setFilters(empty); setApplied(empty) }}>Xóa điều kiện</Button>
                <Button variant="outline" onClick={() => showToast(rows.length ? "Xuất danh sách phiên đăng nhập thành công." : "Không có dữ liệu để xuất.", rows.length ? "ok" : "error")}><Download className="size-4" />Xuất</Button>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
            {rows.length ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead><tr className="border-b border-border bg-neutral-50"><Th className="w-11 text-center">STT</Th><Th>Tên tài khoản</Th><Th>Họ và tên</Th><Th>Số điện thoại</Th><Th>Email</Th><Th className="text-right">Thao tác</Th></tr></thead>
                  <tbody>{rows.map((s, i) => (
                    <tr key={s.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{s.username}</td>
                      <td className="px-4 py-3 text-foreground-muted">{s.hoTen}</td>
                      <td className="px-4 py-3 text-foreground-muted">{s.sdt || "-"}</td>
                      <td className="px-4 py-3 text-foreground-muted">{s.email || "-"}</td>
                      <td className="px-4 py-3 text-right"><Button variant="outline" size="sm" onClick={() => setDetail(s)}><Eye className="size-3.5" />Xem chi tiết</Button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            ) : (
              <EmptyState icon={<KeyRound className="size-6" />} title="Không có người dùng online" desc="Không có phiên đăng nhập nào phù hợp." />
            )}
          </div>
        </>
      )}

      {detail && <SessionDetailPopup session={detail} onClose={() => setDetail(null)} />}
    </div>
  )
}
