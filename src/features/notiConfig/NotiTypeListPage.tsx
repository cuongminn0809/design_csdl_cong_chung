import { useMemo, useState } from "react"
import { Bell, Eye, Pencil, Plus, Search, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { CURRENT_ORG_USER, NOTI_ROLES, setCurrentRole, useCurrentRole } from "@/features/notifications/config"
import { EmptyState, PageHeader, Pagination, Th, inputCls } from "../ingestion/shared"
import { DeleteNotiTypeDialog, NotiTypeDetailDialog, NotiTypeFormDialog } from "./dialogs"
import { NOTI_TYPE_SCOPES, useNotiTypes, type NotiTypeRecord, type NotiTypeScope } from "./config"

type PopupState = { type: "form"; record?: NotiTypeRecord } | { type: "detail"; id: string } | { type: "delete"; record: NotiTypeRecord } | null
type Filters = { keyword: string; phamVi: "all" | NotiTypeScope; trangThai: "all" | "Đang sử dụng" | "Ngừng sử dụng" }
const EMPTY: Filters = { keyword: "", phamVi: "all", trangThai: "all" }

export function NotiTypeListPage() {
  const role = useCurrentRole()
  const all = useNotiTypes()
  const [draft, setDraft] = useState(EMPTY)
  const [applied, setApplied] = useState(EMPTY)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [popup, setPopup] = useState<PopupState>(null)

  const rows = useMemo(() => {
    let r = all
    const k = applied.keyword.trim().toLowerCase()
    if (k) r = r.filter((t) => t.maLoai.toLowerCase().includes(k) || t.tenLoai.toLowerCase().includes(k))
    if (applied.phamVi !== "all") r = r.filter((t) => t.phamVi === applied.phamVi)
    if (applied.trangThai !== "all") r = r.filter((t) => t.trangThai === applied.trangThai)
    return [...r].sort((a, b) => b.ngayTao.localeCompare(a.ngayTao))
  }, [all, applied])

  const doSearch = () => { setApplied(draft); setPage(1) }
  const doReset = () => { setDraft(EMPTY); setApplied(EMPTY); setPage(1) }

  const total = rows.length
  const paged = rows.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="space-y-4">
      <PageHeader title="Loại thông báo" desc="Quản lý danh mục loại thông báo được sử dụng trong hệ thống."
        actions={
          <div className="flex items-center gap-2.5">
            <span className="text-[12.5px] text-foreground-muted">Vai trò:</span>
            <NativeSelect value={role} onChange={(e) => setCurrentRole(e.target.value as typeof role)} className="h-8 w-[220px] text-[12.5px]">
              {NOTI_ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </NativeSelect>
            <Button size="sm" className="ml-1.5" onClick={() => setPopup({ type: "form" })}><Plus className="size-4" />Thêm mới</Button>
          </div>
        } />

      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Từ khóa</label><input value={draft.keyword} onChange={(e) => setDraft((d) => ({ ...d, keyword: e.target.value.slice(0, 100) }))} placeholder="Nhập mã loại hoặc tên loại…" className={inputCls} onKeyDown={(e) => e.key === "Enter" && doSearch()} /></div>
          <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Phạm vi áp dụng</label>
            <NativeSelect value={draft.phamVi} onChange={(e) => setDraft((d) => ({ ...d, phamVi: e.target.value as Filters["phamVi"] }))}><option value="all">Tất cả</option>{NOTI_TYPE_SCOPES.map((s) => <option key={s} value={s}>{s}</option>)}</NativeSelect>
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
                  <Th className="w-[100px]">Mã loại</Th>
                  <Th className="w-[22%]">Tên loại thông báo</Th>
                  <Th className="w-[26%]">Mô tả</Th>
                  <Th className="w-[130px]">Phạm vi áp dụng</Th>
                  <Th className="w-[120px]">Trạng thái</Th>
                  <Th className="w-[110px] text-right">Thao tác</Th>
                </tr></thead>
                <tbody>{paged.map((t, i) => (
                  <tr key={t.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{(page - 1) * pageSize + i + 1}</td>
                    <td className="px-4 py-3"><button onClick={() => setPopup({ type: "detail", id: t.id })} className="font-medium text-link hover:underline">{t.maLoai}</button></td>
                    <td className="truncate px-4 py-3 text-foreground" title={t.tenLoai}>{t.tenLoai}</td>
                    <td className="truncate px-4 py-3 text-foreground-muted" title={t.moTa}>{t.moTa}</td>
                    <td className="px-4 py-3 text-foreground-muted">{t.phamVi}</td>
                    <td className="px-4 py-3">{t.trangThai === "Đang sử dụng" ? <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11.5px] font-medium text-emerald-700">Đang sử dụng</span> : <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11.5px] text-foreground-muted">Ngừng sử dụng</span>}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="outline" size="sm" onClick={() => setPopup({ type: "detail", id: t.id })}><Eye className="size-3.5" /></Button>
                        <Button variant="outline" size="sm" onClick={() => setPopup({ type: "form", record: t })}><Pencil className="size-3.5" /></Button>
                        <Button variant="outline" size="sm" onClick={() => setPopup({ type: "delete", record: t })}><Trash2 className="size-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={pageSize} total={total} unit="loại thông báo" onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
          </>
        ) : (
          <EmptyState icon={<Bell className="size-6" />} title="Không có dữ liệu" desc="Không có loại thông báo nào phù hợp với điều kiện tìm kiếm." />
        )}
      </div>

      {popup?.type === "form" && <NotiTypeFormDialog record={popup.record} currentUser={CURRENT_ORG_USER[role]} onClose={() => setPopup(null)} />}
      {popup?.type === "detail" && (() => {
        const live = all.find((t) => t.id === popup.id)
        return live ? <NotiTypeDetailDialog record={live} onEdit={() => setPopup({ type: "form", record: live })} onClose={() => setPopup(null)} /> : null
      })()}
      {popup?.type === "delete" && <DeleteNotiTypeDialog record={popup.record} onClose={() => setPopup(null)} />}
    </div>
  )
}
