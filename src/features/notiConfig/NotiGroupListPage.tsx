import { useMemo, useState } from "react"
import { Eye, Layers, Pencil, Plus, Search, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { CURRENT_ORG_USER, NOTI_ROLES, roleLabel, setCurrentRole, useCurrentRole } from "@/features/notifications/config"
import { EmptyState, PageHeader, Pagination, Th, inputCls } from "../ingestion/shared"
import { DeleteNotiGroupDialog, NotiGroupDetailDialog, NotiGroupFormDialog } from "./dialogs"
import { activeNotiTypes, getNotiType, useNotiGroups, type NotiGroupRecord } from "./config"

type PopupState = { type: "form"; record?: NotiGroupRecord } | { type: "detail"; id: string } | { type: "delete"; record: NotiGroupRecord } | null
type Filters = { keyword: string; loaiThongBaoId: string; trangThai: "all" | "Đang sử dụng" | "Ngừng sử dụng" }
const EMPTY: Filters = { keyword: "", loaiThongBaoId: "all", trangThai: "all" }

export function NotiGroupListPage() {
  const role = useCurrentRole()
  const showToast = useToast()
  const all = useNotiGroups()
  const types = activeNotiTypes()
  const [draft, setDraft] = useState(EMPTY)
  const [applied, setApplied] = useState(EMPTY)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [popup, setPopup] = useState<PopupState>(null)

  const rows = useMemo(() => {
    let r = all
    const k = applied.keyword.trim().toLowerCase()
    if (k) r = r.filter((g) => g.maNhom.toLowerCase().includes(k) || g.tenNhom.toLowerCase().includes(k))
    if (applied.loaiThongBaoId !== "all") r = r.filter((g) => g.loaiThongBaoId === applied.loaiThongBaoId)
    if (applied.trangThai !== "all") r = r.filter((g) => g.trangThai === applied.trangThai)
    return [...r].sort((a, b) => b.ngayTao.localeCompare(a.ngayTao))
  }, [all, applied])

  const doSearch = () => { setApplied(draft); setPage(1) }
  const doReset = () => { setDraft(EMPTY); setApplied(EMPTY); setPage(1) }
  const doAdd = () => { if (types.length === 0) return showToast("Chưa có loại thông báo đang sử dụng. Vui lòng thiết lập loại thông báo trước.", "error"); setPopup({ type: "form" }) }

  const total = rows.length
  const paged = rows.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="space-y-4">
      <PageHeader title="Nhóm thông tin nhận thông báo" desc="Quản lý nhóm sự kiện và đối tượng nhận, dùng làm đầu vào cho thông báo tự động."
        actions={
          <div className="flex items-center gap-2.5">
            <span className="text-[12.5px] text-foreground-muted">Vai trò:</span>
            <NativeSelect value={role} onChange={(e) => setCurrentRole(e.target.value as typeof role)} className="h-8 w-[220px] text-[12.5px]">
              {NOTI_ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </NativeSelect>
            <Button size="sm" className="ml-1.5" onClick={doAdd}><Plus className="size-4" />Thêm mới</Button>
          </div>
        } />

      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Từ khóa</label><input value={draft.keyword} onChange={(e) => setDraft((d) => ({ ...d, keyword: e.target.value.slice(0, 100) }))} placeholder="Nhập mã nhóm hoặc tên nhóm…" className={inputCls} onKeyDown={(e) => e.key === "Enter" && doSearch()} /></div>
          <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Loại thông báo</label>
            <NativeSelect value={draft.loaiThongBaoId} onChange={(e) => setDraft((d) => ({ ...d, loaiThongBaoId: e.target.value }))}><option value="all">Tất cả</option>{types.map((t) => <option key={t.id} value={t.id}>{t.tenLoai}</option>)}</NativeSelect>
          </div>
          <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Trạng thái</label>
            <NativeSelect value={draft.trangThai} onChange={(e) => setDraft((d) => ({ ...d, trangThai: e.target.value as Filters["trangThai"] }))}><option value="all">Tất cả</option><option value="Đang sử dụng">Đang sử dụng</option><option value="Ngừng sử dụng">Ngừng sử dụng</option></NativeSelect>
          </div>
        </div>
        <div className="mt-4 flex gap-2.5"><Button onClick={doSearch}><Search className="size-4" />Tìm kiếm</Button><Button variant="outline" onClick={doReset}>Đặt lại</Button></div>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        {paged.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full table-fixed border-collapse text-sm">
                <thead><tr className="border-b border-border bg-neutral-50">
                  <Th className="w-11 text-center">STT</Th>
                  <Th className="w-[100px]">Mã nhóm</Th>
                  <Th className="w-[20%]">Tên nhóm</Th>
                  <Th className="w-[18%]">Loại thông báo</Th>
                  <Th className="w-[22%]">Đối tượng nhận</Th>
                  <Th className="w-[120px]">Trạng thái</Th>
                  <Th className="w-[110px] text-right">Thao tác</Th>
                </tr></thead>
                <tbody>{paged.map((g, i) => {
                  const type = getNotiType(g.loaiThongBaoId)
                  const roleLabels = g.doiTuongNhan.map((r) => roleLabel(r))
                  const shown = roleLabels.slice(0, 2).join("; ")
                  const rest = roleLabels.length - 2
                  return (
                    <tr key={g.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{(page - 1) * pageSize + i + 1}</td>
                      <td className="px-4 py-3"><button onClick={() => setPopup({ type: "detail", id: g.id })} className="font-medium text-link hover:underline">{g.maNhom}</button></td>
                      <td className="truncate px-4 py-3 text-foreground" title={g.tenNhom}>{g.tenNhom}</td>
                      <td className="truncate px-4 py-3 text-foreground-muted" title={type?.tenLoai}>{type?.tenLoai ?? "—"}</td>
                      <td className="truncate px-4 py-3 text-foreground-muted" title={roleLabels.join("; ")}>{shown}{rest > 0 && ` +${rest}`}</td>
                      <td className="px-4 py-3">{g.trangThai === "Đang sử dụng" ? <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11.5px] font-medium text-emerald-700">Đang sử dụng</span> : <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11.5px] text-foreground-muted">Ngừng sử dụng</span>}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          <Button variant="outline" size="sm" onClick={() => setPopup({ type: "detail", id: g.id })}><Eye className="size-3.5" /></Button>
                          <Button variant="outline" size="sm" onClick={() => setPopup({ type: "form", record: g })}><Pencil className="size-3.5" /></Button>
                          <Button variant="outline" size="sm" onClick={() => setPopup({ type: "delete", record: g })}><Trash2 className="size-3.5" /></Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}</tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={pageSize} total={total} unit="nhóm" onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
          </>
        ) : (
          <EmptyState icon={<Layers className="size-6" />} title="Không có dữ liệu" desc="Không có nhóm thông tin nào phù hợp với điều kiện tìm kiếm." />
        )}
      </div>

      {popup?.type === "form" && <NotiGroupFormDialog record={popup.record} currentUser={CURRENT_ORG_USER[role]} onClose={() => setPopup(null)} />}
      {popup?.type === "detail" && (() => {
        const live = all.find((g) => g.id === popup.id)
        return live ? <NotiGroupDetailDialog record={live} onEdit={() => setPopup({ type: "form", record: live })} onClose={() => setPopup(null)} /> : null
      })()}
      {popup?.type === "delete" && <DeleteNotiGroupDialog record={popup.record} onClose={() => setPopup(null)} />}
    </div>
  )
}
