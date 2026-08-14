import { useMemo, useState } from "react"
import { Check, Eye, Pencil, Plus, Search, Trash2, TriangleAlert, Users, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { useToast } from "@/features/reconciliation/components/Toast"
import { EmptyState, IconBtn, Pagination, PageHeader, StatusPill, Th, inputCls, type StatusMeta } from "../ingestion/shared"

interface User { id: string; name: string; email: string; status: "active" | "inactive" | "locked" }
interface Group { id: string; name: string; desc: string; status: "active" | "inactive"; members: string[] }

const ST: Record<string, StatusMeta> = {
  active: { label: "Đang hoạt động", dot: "#16a34a", bg: "#f0fdf4", fg: "#15803d", bd: "#bbf7d0" },
  inactive: { label: "Ngừng hoạt động", dot: "#737373", bg: "#f5f5f5", fg: "#525252", bd: "#e5e5e5" },
  locked: { label: "Tạm khóa", dot: "#d97706", bg: "#fffbeb", fg: "#b45309", bd: "#fde68a" },
}

export const USERS: User[] = [
  { id: "anhpq", name: "Phạm Quốc Anh", email: "anhpq@moj.gov.vn", status: "active" },
  { id: "huongtt", name: "Trần Thị Hương", email: "huongtt@stp.hanoi.gov.vn", status: "active" },
  { id: "namlh", name: "Lê Hoàng Nam", email: "namlh@stp.hochiminhcity.gov.vn", status: "active" },
  { id: "sonbt", name: "Bùi Thanh Sơn", email: "sonbt@tnmt.hanoi.gov.vn", status: "locked" },
  { id: "chaunb", name: "Ngô Bảo Châu", email: "chaunb@moj.gov.vn", status: "active" },
  { id: "khoavd", name: "Vũ Đình Khoa", email: "khoavd@stp.haiphong.gov.vn", status: "active" },
  { id: "tuanhm", name: "Hoàng Minh Tuấn", email: "tuanhm@c06.bca.gov.vn", status: "inactive" },
  { id: "lanhtt", name: "Đặng Thu Hà", email: "lanhtt@stp.hanoi.gov.vn", status: "active" },
  { id: "thanhnv", name: "Nguyễn Văn Thành", email: "thanhnv@vpccnguyenhue.vn", status: "active" },
  { id: "mailtt", name: "Lý Thị Mai", email: "mailtt@vpcctranphu.vn", status: "active" },
]

const SEED: Group[] = [
  { id: "G1", name: "Quản trị viên hệ thống", desc: "Nhóm quản trị cấp cao, toàn quyền cấu hình và vận hành hệ thống.", status: "active", members: ["anhpq", "chaunb"] },
  { id: "G2", name: "Chuyên viên Sở Tư pháp", desc: "Nhóm chuyên viên nghiệp vụ tại các Sở Tư pháp địa phương.", status: "active", members: ["huongtt", "lanhtt", "khoavd"] },
  { id: "G3", name: "Lãnh đạo Sở Tư pháp", desc: "Nhóm lãnh đạo, phê duyệt và giám sát nghiệp vụ tại Sở.", status: "active", members: ["namlh"] },
  { id: "G4", name: "Cán bộ một cửa", desc: "Nhóm cán bộ tiếp nhận và xử lý hồ sơ tại bộ phận một cửa.", status: "active", members: ["huongtt", "khoavd"] },
  { id: "G5", name: "Đầu mối tích hợp dữ liệu", desc: "Nhóm phụ trách kết nối, giám sát tích hợp dữ liệu với đơn vị ngoài.", status: "inactive", members: ["tuanhm"] },
  { id: "G6", name: "Kiểm toán & giám sát", desc: "Nhóm truy cập nhật ký, phục vụ kiểm tra và giám sát nội bộ.", status: "active", members: [] },
]

interface FormState {
  mode: "create" | "edit"
  id: string | null
  name: string
  desc: string
  status: "active" | "inactive"
  members: string[]
  error?: string
}

export function NhomNguoiDungPage() {
  const showToast = useToast()
  const [data, setData] = useState<Group[]>(SEED)
  const [draft, setDraft] = useState({ kw: "", status: "all" })
  const [applied, setApplied] = useState({ kw: "", status: "all" })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selected, setSelected] = useState<string | null>(null)
  const [form, setForm] = useState<FormState | null>(null)
  const [confirm, setConfirm] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const kw = applied.kw.trim().toLowerCase()
    return data.filter((g) => {
      if (kw && !g.name.toLowerCase().includes(kw) && !g.desc.toLowerCase().includes(kw)) return false
      if (applied.status !== "all" && g.status !== applied.status) return false
      return true
    })
  }, [data, applied])

  const start = (Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize))) - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)
  const detail = selected ? data.find((g) => g.id === selected) ?? null : null
  const confirmGroup = confirm ? data.find((g) => g.id === confirm) ?? null : null

  const doSearch = () => { setApplied(draft); setPage(1) }
  const doReset = () => { setDraft({ kw: "", status: "all" }); setApplied({ kw: "", status: "all" }); setPage(1) }

  const save = () => {
    if (!form) return
    if (!form.name.trim()) {
      setForm({ ...form, error: "Vui lòng nhập tên nhóm" })
      return
    }
    if (form.mode === "create") {
      setData((d) => [{ id: `G${Date.now()}`, name: form.name.trim(), desc: form.desc.trim(), status: form.status, members: form.members }, ...d])
      showToast("Thêm nhóm người dùng thành công")
    } else {
      setData((d) => d.map((g) => (g.id === form.id ? { ...g, name: form.name.trim(), desc: form.desc.trim(), status: form.status, members: form.members } : g)))
      showToast("Đã lưu thông tin nhóm")
    }
    setForm(null)
  }

  const doDelete = () => {
    if (!confirm) return
    setData((d) => d.filter((g) => g.id !== confirm))
    setConfirm(null)
    showToast("Đã xóa nhóm người dùng")
  }

  return (
    <div>
      <PageHeader
        title="Quản lý thông tin nhóm người dùng"
        desc="Tạo nhóm và gán thành viên để cấp quyền theo nhóm."
        actions={
          <Button onClick={() => setForm({ mode: "create", id: null, name: "", desc: "", status: "active", members: [] })}>
            <Plus className="size-4" />
            Thêm nhóm
          </Button>
        }
      />

      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[240px] flex-1">
            <label className="mb-1.5 block text-xs font-semibold text-foreground-strong">Tìm kiếm</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
              <input value={draft.kw} onChange={(e) => setDraft({ ...draft, kw: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} placeholder="Tên nhóm, mô tả…" className={cn(inputCls, "pl-9")} />
            </div>
          </div>
          <div className="w-[200px]">
            <label className="mb-1.5 block text-xs font-semibold text-foreground-strong">Trạng thái</label>
            <NativeSelect value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
              <option value="all">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Ngừng hoạt động</option>
            </NativeSelect>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={doReset}>Xóa bộ lọc</Button>
            <Button onClick={doSearch}><Search className="size-4" />Tìm kiếm</Button>
          </div>
        </div>
      </div>

      <div className="mx-0.5 mb-2.5 mt-[18px] flex items-center gap-2">
        <span className="text-[13px] text-foreground-muted">Kết quả:</span>
        <span className="text-[13px] font-semibold text-foreground-strong">{filtered.length} nhóm</span>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        {filtered.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-neutral-50">
                    <Th className="w-[52px] text-center">STT</Th>
                    <Th className="min-w-[220px]">Tên nhóm</Th>
                    <Th className="min-w-[300px]">Mô tả</Th>
                    <Th className="text-right">Thành viên</Th>
                    <Th>Trạng thái</Th>
                    <Th className="w-[120px] text-center">Thao tác</Th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((g, i) => (
                    <tr key={g.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{start + i + 1}</td>
                      <td className="px-4 py-3">
                        <div onClick={() => setSelected(g.id)} className="cursor-pointer font-medium leading-tight text-link hover:underline">{g.name}</div>
                      </td>
                      <td className="px-4 py-3 text-[13px] leading-snug text-foreground-muted">{g.desc}</td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-foreground-strong">{g.members.length}</td>
                      <td className="px-4 py-3"><StatusPill meta={ST[g.status]} /></td>
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex gap-0.5">
                          <IconBtn title="Xem chi tiết" onClick={() => setSelected(g.id)}><Eye className="size-4" /></IconBtn>
                          <IconBtn title="Sửa" onClick={() => setForm({ mode: "edit", id: g.id, name: g.name, desc: g.desc, status: g.status, members: [...g.members] })}><Pencil className="size-[15px]" /></IconBtn>
                          <IconBtn title={g.members.length ? "Nhóm còn thành viên" : "Xóa"} disabled={g.members.length > 0} danger onClick={() => setConfirm(g.id)}><Trash2 className="size-[14px]" /></IconBtn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={pageSize} total={filtered.length} unit="nhóm" onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
          </>
        ) : (
          <EmptyState icon={<Users className="size-6" />} title="Không tìm thấy nhóm" desc="Không có nhóm người dùng nào khớp với bộ lọc hiện tại." actionLabel="Xóa bộ lọc" onAction={doReset} />
        )}
      </div>

      {detail && <GroupDetail group={detail} onClose={() => setSelected(null)} />}
      {form && <GroupForm form={form} setForm={setForm} onClose={() => setForm(null)} onSave={save} />}
      {confirmGroup && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={() => setConfirm(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-[460px] max-w-full overflow-hidden rounded-xl bg-surface shadow-popover">
            <div className="px-6 pb-[18px] pt-[22px]">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex size-[38px] shrink-0 items-center justify-center rounded-full bg-[#fef2f2] text-[#dc2626]"><TriangleAlert className="size-[19px]" /></div>
                <div className="text-[17px] font-semibold text-foreground-strong">Xác nhận xóa nhóm</div>
              </div>
              <p className="text-[13.5px] leading-relaxed text-foreground-muted">
                Nhóm "<span className="font-semibold text-foreground-strong">{confirmGroup.name}</span>" sẽ bị xóa khỏi hệ thống. Thao tác này không thể hoàn tác.
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t border-border bg-neutral-50 px-6 py-3.5">
              <Button variant="outline" onClick={() => setConfirm(null)}>Hủy bỏ</Button>
              <button onClick={doDelete} className="h-9 rounded-md border border-red-600 bg-red-600 px-4 text-sm font-medium text-white shadow-xs hover:bg-[#b91c1c]">Xóa nhóm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function GroupDetail({ group, onClose }: { group: Group; onClose: () => void }) {
  const members = group.members.map((id) => USERS.find((u) => u.id === id)).filter(Boolean) as User[]
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex max-h-[88vh] w-[680px] max-w-full flex-col overflow-hidden rounded-xl bg-surface shadow-popover">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="min-w-0">
            <div className="mb-1 text-xs font-semibold text-foreground-muted">Chi tiết nhóm người dùng</div>
            <div className="text-lg font-semibold leading-tight text-foreground-strong">{group.name}</div>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <StatusPill meta={ST[group.status]} />
              <span className="text-xs text-foreground-muted">{group.members.length} thành viên</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="size-[18px]" /></Button>
        </div>
        <div className="flex-1 overflow-auto px-6 pb-6 pt-[18px]">
          <div className="mb-4 border-b border-neutral-100 pb-3">
            <div className="mb-1 text-xs text-foreground-muted">Mô tả</div>
            <div className="text-[13.5px] text-foreground">{group.desc || "—"}</div>
          </div>
          <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">Thành viên</div>
          {members.length ? (
            <div className="overflow-hidden rounded-[10px] border border-border">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-neutral-50">
                    <Th className="px-3.5 py-2.5">Tài khoản</Th>
                    <Th className="px-3.5 py-2.5">Họ tên</Th>
                    <Th className="px-3.5 py-2.5">Email</Th>
                    <Th className="px-3.5 py-2.5">Trạng thái</Th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.id} className="border-b border-neutral-100">
                      <td className="px-3.5 py-2.5 font-mono text-xs text-link">{m.id}</td>
                      <td className="px-3.5 py-2.5 font-medium text-foreground">{m.name}</td>
                      <td className="px-3.5 py-2.5 text-foreground-muted">{m.email}</td>
                      <td className="px-3.5 py-2.5"><StatusPill meta={ST[m.status]} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-[13.5px] text-foreground-muted">Nhóm chưa có thành viên nào.</div>
          )}
        </div>
        <div className="flex justify-end border-t border-border px-6 py-4">
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </div>
      </div>
    </div>
  )
}

function GroupForm({ form, setForm, onClose, onSave }: { form: FormState; setForm: (f: FormState) => void; onClose: () => void; onSave: () => void }) {
  const [search, setSearch] = useState("")
  const list = USERS.filter((u) => !search.trim() || u.name.toLowerCase().includes(search.toLowerCase()) || u.id.includes(search.toLowerCase()))
  const toggle = (id: string) => {
    const set = new Set(form.members)
    set.has(id) ? set.delete(id) : set.add(id)
    setForm({ ...form, members: [...set] })
  }
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex max-h-[92vh] w-[760px] max-w-full flex-col overflow-hidden rounded-xl bg-surface shadow-popover">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="text-[17px] font-semibold tracking-[-0.01em] text-foreground-strong">{form.mode === "create" ? "Thêm nhóm người dùng" : "Chỉnh sửa nhóm người dùng"}</div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="size-[18px]" /></Button>
        </div>
        <div className="flex-1 overflow-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-semibold text-foreground-strong">Tên nhóm <span className="text-red-600">*</span></label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, error: undefined })} className={cn(inputCls, "h-[38px]", form.error && "border-red-600")} />
              {form.error && <span className="text-[11.5px] text-red-600">{form.error}</span>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-semibold text-foreground-strong">Mô tả</label>
              <textarea value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} rows={2} className="resize-y rounded-md border border-input bg-surface px-3 py-2.5 text-sm shadow-xs outline-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[12.5px] font-semibold text-foreground-strong">Trạng thái</label>
              <div className="flex gap-2">
                <SegBtn on={form.status === "active"} onClick={() => setForm({ ...form, status: "active" })}>Đang hoạt động</SegBtn>
                <SegBtn on={form.status === "inactive"} onClick={() => setForm({ ...form, status: "inactive" })}>Ngừng hoạt động</SegBtn>
              </div>
            </div>
          </div>

          <div className="mb-2.5 mt-6 flex items-center justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">Thành viên · đã chọn {form.members.length}</div>
            <div className="relative w-[240px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-foreground-muted" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm người dùng…" className="h-8 w-full rounded-md border border-input bg-surface pl-8 pr-3 text-[13px]" />
            </div>
          </div>
          <div className="grid max-h-[240px] grid-cols-2 gap-1.5 overflow-auto rounded-[10px] border border-border p-2">
            {list.map((u) => {
              const on = form.members.includes(u.id)
              return (
                <div key={u.id} onClick={() => toggle(u.id)} className={cn("flex cursor-pointer items-center gap-2.5 rounded-[7px] border border-border p-[8px_10px]", on ? "bg-[#eff6ff]" : "bg-surface")}>
                  <span className={cn("flex size-4 shrink-0 items-center justify-center rounded-[4px] border", on ? "border-neutral-900 bg-neutral-900 text-white" : "border-border-strong bg-surface")}>
                    {on && <Check className="size-3" strokeWidth={3} />}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-[12.5px] font-medium leading-tight text-foreground">{u.name}</div>
                    <div className="truncate font-mono text-[10.5px] text-foreground-subtle">{u.id}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={onSave}>Lưu</Button>
        </div>
      </div>
    </div>
  )
}

function SegBtn({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={cn("max-w-[180px] flex-1 rounded-md border px-3.5 py-[9px] text-[13.5px]", on ? "border-neutral-900 bg-neutral-900 font-semibold text-white" : "border-input bg-surface font-medium text-foreground")}>
      {children}
    </button>
  )
}
