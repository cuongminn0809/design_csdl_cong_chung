import { useMemo, useState } from "react"
import { Check, Download, Eye, Pencil, Plus, Search, ShieldCheck, Trash2, TriangleAlert, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { useToast } from "@/features/reconciliation/components/Toast"
import { EmptyState, IconBtn, Pagination, PageHeader, StatusPill, Th, inputCls, type StatusMeta } from "../ingestion/shared"

type Perms = Record<string, string[]>

interface Role {
  id: string
  code: string
  name: string
  desc: string
  status: "active" | "inactive"
  system: boolean
  assigned: boolean
  perms: Perms
}

const ST: Record<string, StatusMeta> = {
  active: { label: "Đang hoạt động", dot: "#16a34a", bg: "#f0fdf4", fg: "#15803d", bd: "#bbf7d0" },
  inactive: { label: "Ngừng hoạt động", dot: "#737373", bg: "#f5f5f5", fg: "#525252", bd: "#e5e5e5" },
}

const ACTIONS = ["Xem", "Thêm", "Sửa", "Xóa", "Phê duyệt"]
const FUNCS: { key: string; label: string; acts: string[] }[] = [
  { key: "thunhan", label: "Thu nhận dữ liệu", acts: ["Xem", "Thêm", "Sửa", "Xóa", "Phê duyệt"] },
  { key: "chuanhoa", label: "Chuẩn hóa & làm sạch", acts: ["Xem", "Thêm", "Sửa", "Xóa"] },
  { key: "kho", label: "Kho dữ liệu", acts: ["Xem", "Sửa"] },
  { key: "khaithac", label: "Khai thác & báo cáo", acts: ["Xem"] },
  { key: "nguoidung", label: "Quản trị người dùng", acts: ["Xem", "Thêm", "Sửa", "Xóa"] },
  { key: "phanquyen", label: "Vai trò & phân quyền", acts: ["Xem", "Thêm", "Sửa", "Xóa"] },
  { key: "danhmuc", label: "Quản lý danh mục", acts: ["Xem", "Thêm", "Sửa", "Xóa"] },
]

const fullPerms = (): Perms => Object.fromEntries(FUNCS.map((f) => [f.key, [...f.acts]]))
const countPerms = (p: Perms) => Object.values(p).reduce((a, arr) => a + arr.length, 0)

const SEED: Role[] = [
  { id: "R1", code: "SYS_ADMIN", name: "Quản trị hệ thống", desc: "Toàn quyền quản trị và vận hành hệ thống.", status: "active", system: true, assigned: true, perms: fullPerms() },
  { id: "R2", code: "MOJ_STAFF", name: "Chuyên viên Bộ Tư pháp", desc: "Chuyên viên nghiệp vụ cấp Bộ, giám sát toàn quốc.", status: "active", system: false, assigned: true, perms: { thunhan: ["Xem", "Phê duyệt"], chuanhoa: ["Xem"], kho: ["Xem"], khaithac: ["Xem"], nguoidung: ["Xem"], danhmuc: ["Xem", "Sửa"] } },
  { id: "R3", code: "STP_LEAD", name: "Lãnh đạo Sở Tư pháp", desc: "Lãnh đạo Sở, phê duyệt nghiệp vụ tại địa phương.", status: "active", system: false, assigned: true, perms: { thunhan: ["Xem", "Phê duyệt"], chuanhoa: ["Xem"], kho: ["Xem"], khaithac: ["Xem"], nguoidung: ["Xem"] } },
  { id: "R4", code: "STP_STAFF", name: "Chuyên viên Sở Tư pháp", desc: "Chuyên viên nghiệp vụ tại Sở Tư pháp.", status: "active", system: false, assigned: true, perms: { thunhan: ["Xem", "Thêm", "Sửa"], chuanhoa: ["Xem", "Sửa"], kho: ["Xem"], khaithac: ["Xem"] } },
  { id: "R5", code: "ONEGATE", name: "Cán bộ một cửa", desc: "Cán bộ tiếp nhận, xử lý hồ sơ tại bộ phận một cửa.", status: "active", system: false, assigned: true, perms: { thunhan: ["Xem", "Thêm"], khaithac: ["Xem"] } },
  { id: "R6", code: "AUDITOR", name: "Kiểm toán & giám sát", desc: "Truy cập nhật ký phục vụ kiểm tra, giám sát nội bộ.", status: "active", system: false, assigned: false, perms: { thunhan: ["Xem"], chuanhoa: ["Xem"], kho: ["Xem"], khaithac: ["Xem"], nguoidung: ["Xem"], phanquyen: ["Xem"], danhmuc: ["Xem"] } },
  { id: "R7", code: "DATA_INTEG", name: "Đầu mối tích hợp dữ liệu", desc: "Phụ trách kết nối, giám sát tích hợp dữ liệu.", status: "inactive", system: false, assigned: false, perms: { thunhan: ["Xem", "Thêm", "Sửa"], danhmuc: ["Xem"] } },
]

interface FormState {
  mode: "create" | "edit"
  id: string | null
  name: string
  code: string
  desc: string
  status: "active" | "inactive"
  perms: Perms
  errors: { name?: string; code?: string }
}

export function VaiTroPhanQuyenPage() {
  const showToast = useToast()
  const [data, setData] = useState<Role[]>(SEED)
  const [draft, setDraft] = useState({ kw: "", status: "all" })
  const [applied, setApplied] = useState({ kw: "", status: "all" })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selected, setSelected] = useState<string | null>(null)
  const [form, setForm] = useState<FormState | null>(null)
  const [confirm, setConfirm] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const kw = applied.kw.trim().toLowerCase()
    return data.filter((r) => {
      if (kw && !r.name.toLowerCase().includes(kw) && !r.code.toLowerCase().includes(kw) && !r.desc.toLowerCase().includes(kw)) return false
      if (applied.status !== "all" && r.status !== applied.status) return false
      return true
    })
  }, [data, applied])

  const start = (Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize))) - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)
  const detail = selected ? data.find((r) => r.id === selected) ?? null : null
  const confirmRole = confirm ? data.find((r) => r.id === confirm) ?? null : null

  const doSearch = () => { setApplied(draft); setPage(1) }
  const doReset = () => { setDraft({ kw: "", status: "all" }); setApplied({ kw: "", status: "all" }); setPage(1) }

  const save = () => {
    if (!form) return
    const errors: FormState["errors"] = {}
    if (!form.name.trim()) errors.name = "Vui lòng nhập tên vai trò"
    if (!form.code.trim()) errors.code = "Vui lòng nhập mã vai trò"
    else if (form.mode === "create" && data.some((r) => r.code.toLowerCase() === form.code.trim().toLowerCase())) errors.code = "Mã vai trò đã tồn tại"
    if (Object.keys(errors).length) {
      setForm({ ...form, errors })
      return
    }
    if (form.mode === "create") {
      setData((d) => [{ id: `R${Date.now()}`, code: form.code.trim().toUpperCase(), name: form.name.trim(), desc: form.desc.trim(), status: form.status, system: false, assigned: false, perms: form.perms }, ...d])
      showToast("Thêm vai trò thành công")
    } else {
      setData((d) => d.map((r) => (r.id === form.id ? { ...r, name: form.name.trim(), desc: form.desc.trim(), status: form.status, perms: form.perms } : r)))
      showToast("Đã lưu phân quyền vai trò")
    }
    setForm(null)
  }

  const doDelete = () => {
    if (!confirm) return
    setData((d) => d.filter((r) => r.id !== confirm))
    setConfirm(null)
    showToast("Đã xóa vai trò")
  }

  return (
    <div>
      <PageHeader
        title="Vai trò & phân quyền"
        desc="Quản lý vai trò và ma trận phân quyền theo chức năng nghiệp vụ."
        actions={
          <>
            <Button variant="outline" onClick={() => showToast("Đã xuất danh sách vai trò")}>
              <Download className="size-4" />
              Xuất danh sách
            </Button>
            <Button onClick={() => setForm({ mode: "create", id: null, name: "", code: "", desc: "", status: "active", perms: {}, errors: {} })}>
              <Plus className="size-4" />
              Thêm vai trò
            </Button>
          </>
        }
      />

      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[240px] flex-1">
            <label className="mb-1.5 block text-xs font-semibold text-foreground-strong">Tìm kiếm</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
              <input value={draft.kw} onChange={(e) => setDraft({ ...draft, kw: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} placeholder="Tên vai trò, mã, mô tả…" className={cn(inputCls, "pl-9")} />
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
            <Button onClick={doSearch}>
              <Search className="size-4" />
              Tìm kiếm
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-0.5 mb-2.5 mt-[18px] flex items-center gap-2">
        <span className="text-[13px] text-foreground-muted">Kết quả:</span>
        <span className="text-[13px] font-semibold text-foreground-strong">{filtered.length} vai trò</span>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        {filtered.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-neutral-50">
                    <Th className="w-[52px] text-center">STT</Th>
                    <Th className="min-w-[220px]">Vai trò</Th>
                    <Th className="min-w-[280px]">Mô tả</Th>
                    <Th className="text-right">Số quyền</Th>
                    <Th>Trạng thái</Th>
                    <Th className="w-[120px] text-center">Thao tác</Th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((r, i) => {
                    const canDelete = !r.system && !r.assigned
                    return (
                      <tr key={r.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{start + i + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div onClick={() => setSelected(r.id)} className="cursor-pointer font-medium leading-tight text-link hover:underline">{r.name}</div>
                            {r.system && <span className="rounded-full border border-border bg-surface-muted px-2 py-px text-[10.5px] font-semibold text-foreground-muted">Hệ thống</span>}
                          </div>
                          <div className="mt-0.5 font-mono text-[11.5px] text-foreground-subtle">{r.code}</div>
                        </td>
                        <td className="px-4 py-3 text-[13px] leading-snug text-foreground-muted">{r.desc}</td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums text-foreground-strong">{countPerms(r.perms)}</td>
                        <td className="px-4 py-3"><StatusPill meta={ST[r.status]} /></td>
                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex gap-0.5">
                            <IconBtn title="Xem chi tiết" onClick={() => setSelected(r.id)}><Eye className="size-4" /></IconBtn>
                            <IconBtn title="Phân quyền" onClick={() => setForm({ mode: "edit", id: r.id, name: r.name, code: r.code, desc: r.desc, status: r.status, perms: JSON.parse(JSON.stringify(r.perms)), errors: {} })}><Pencil className="size-[15px]" /></IconBtn>
                            <IconBtn
                              title={r.system ? "Vai trò hệ thống, không thể xóa" : r.assigned ? "Đang được gán cho tài khoản" : "Xóa"}
                              disabled={!canDelete}
                              danger
                              onClick={() => setConfirm(r.id)}
                            >
                              <Trash2 className="size-[14px]" />
                            </IconBtn>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={pageSize} total={filtered.length} unit="vai trò" onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
          </>
        ) : (
          <EmptyState icon={<ShieldCheck className="size-6" />} title="Không tìm thấy vai trò" desc="Không có vai trò nào khớp với bộ lọc hiện tại." actionLabel="Xóa bộ lọc" onAction={doReset} />
        )}
      </div>

      {detail && <RoleDetail role={detail} onClose={() => setSelected(null)} />}
      {form && <RoleForm form={form} setForm={setForm} onClose={() => setForm(null)} onSave={save} />}
      {confirmRole && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={() => setConfirm(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-[460px] max-w-full overflow-hidden rounded-xl bg-surface shadow-popover">
            <div className="px-6 pb-[18px] pt-[22px]">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex size-[38px] shrink-0 items-center justify-center rounded-full bg-[#fef2f2] text-[#dc2626]"><TriangleAlert className="size-[19px]" /></div>
                <div className="text-[17px] font-semibold text-foreground-strong">Xác nhận xóa vai trò</div>
              </div>
              <p className="text-[13.5px] leading-relaxed text-foreground-muted">
                Vai trò "<span className="font-semibold text-foreground-strong">{confirmRole.name}</span>" sẽ bị xóa khỏi hệ thống. Thao tác này không thể hoàn tác.
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t border-border bg-neutral-50 px-6 py-3.5">
              <Button variant="outline" onClick={() => setConfirm(null)}>Hủy bỏ</Button>
              <button onClick={doDelete} className="h-9 rounded-md border border-red-600 bg-red-600 px-4 text-sm font-medium text-white shadow-xs hover:bg-[#b91c1c]">Xóa vai trò</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function RoleDetail({ role, onClose }: { role: Role; onClose: () => void }) {
  const perms = FUNCS.filter((fn) => (role.perms[fn.key] ?? []).length).map((fn) => ({ label: fn.label, actions: role.perms[fn.key] }))
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex max-h-[88vh] w-[720px] max-w-full flex-col overflow-hidden rounded-xl bg-surface shadow-popover">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="min-w-0">
            <div className="mb-1 text-xs font-semibold text-foreground-muted">Chi tiết vai trò</div>
            <div className="text-lg font-semibold leading-tight text-foreground-strong">{role.name}</div>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span className="rounded-[4px] border border-border bg-surface-muted px-1.5 py-px font-mono text-xs text-foreground-muted">{role.code}</span>
              <StatusPill meta={ST[role.status]} />
              <span className="text-xs text-foreground-muted">{countPerms(role.perms)} quyền</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="size-[18px]" /></Button>
        </div>
        <div className="flex-1 overflow-auto px-6 pb-6 pt-[18px]">
          <div className="mb-4 border-b border-neutral-100 pb-3">
            <div className="mb-1 text-xs text-foreground-muted">Mô tả</div>
            <div className="text-[13.5px] text-foreground">{role.desc || "—"}</div>
          </div>
          <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">Quyền theo chức năng</div>
          {perms.length ? (
            <div className="flex flex-col gap-2.5">
              {perms.map((p) => (
                <div key={p.label} className="flex items-start gap-3 rounded-[10px] border border-border bg-surface p-[11px_14px]">
                  <div className="w-[190px] flex-none text-[13px] font-medium text-foreground">{p.label}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {p.actions.map((a) => (
                      <span key={a} className="rounded-full border border-[#bfdbfe] bg-[#eff6ff] px-2.5 py-0.5 text-[11.5px] font-semibold text-[#1d4ed8]">{a}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-[13.5px] text-foreground-muted">Vai trò chưa được gán quyền nào.</div>
          )}
        </div>
        <div className="flex justify-end border-t border-border px-6 py-4">
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </div>
      </div>
    </div>
  )
}

function RoleForm({ form, setForm, onClose, onSave }: { form: FormState; setForm: (f: FormState) => void; onClose: () => void; onSave: () => void }) {
  const toggleCell = (fnKey: string, act: string) => {
    const perms = { ...form.perms }
    const arr = [...(perms[fnKey] ?? [])]
    const i = arr.indexOf(act)
    if (i >= 0) arr.splice(i, 1)
    else arr.push(act)
    if (arr.length) perms[fnKey] = arr
    else delete perms[fnKey]
    setForm({ ...form, perms })
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex max-h-[92vh] w-[900px] max-w-full flex-col overflow-hidden rounded-xl bg-surface shadow-popover">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="text-[17px] font-semibold tracking-[-0.01em] text-foreground-strong">{form.mode === "create" ? "Thêm vai trò mới" : "Phân quyền vai trò"}</div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="size-[18px]" /></Button>
        </div>

        <div className="flex-1 overflow-auto px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-semibold text-foreground-strong">Tên vai trò <span className="text-red-600">*</span></label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, errors: { ...form.errors, name: undefined } })} className={cn(inputCls, "h-[38px]", form.errors.name && "border-red-600")} />
              {form.errors.name && <span className="text-[11.5px] text-red-600">{form.errors.name}</span>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-semibold text-foreground-strong">Mã vai trò <span className="text-red-600">*</span></label>
              <input value={form.code} disabled={form.mode === "edit"} onChange={(e) => setForm({ ...form, code: e.target.value, errors: { ...form.errors, code: undefined } })} className={cn(inputCls, "h-[38px] font-mono text-[13px]", form.mode === "edit" && "bg-surface-muted text-foreground-muted", form.errors.code && "border-red-600")} />
              {form.errors.code && <span className="text-[11.5px] text-red-600">{form.errors.code}</span>}
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <label className="text-[12.5px] font-semibold text-foreground-strong">Mô tả</label>
              <textarea value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} rows={2} className="resize-y rounded-md border border-input bg-surface px-3 py-2.5 text-sm shadow-xs outline-none" />
            </div>
            <div className="col-span-2 flex flex-col gap-2">
              <label className="text-[12.5px] font-semibold text-foreground-strong">Trạng thái</label>
              <div className="flex gap-2">
                <SegBtn on={form.status === "active"} onClick={() => setForm({ ...form, status: "active" })}>Đang hoạt động</SegBtn>
                <SegBtn on={form.status === "inactive"} onClick={() => setForm({ ...form, status: "inactive" })}>Ngừng hoạt động</SegBtn>
              </div>
            </div>
          </div>

          <div className="mb-2.5 mt-6 flex items-center justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">Ma trận phân quyền · {countPerms(form.perms)} quyền</div>
            <div className="flex gap-1.5 text-[11.5px]">
              <button onClick={() => setForm({ ...form, perms: fullPerms() })} className="text-link">Chọn tất cả</button>
              <span className="text-border">|</span>
              <button onClick={() => setForm({ ...form, perms: {} })} className="text-foreground-muted">Bỏ chọn</button>
            </div>
          </div>
          <div className="overflow-hidden rounded-[10px] border border-border">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-border bg-neutral-50">
                  <Th className="min-w-[200px] px-3.5 py-2.5">Chức năng</Th>
                  {ACTIONS.map((a) => (
                    <Th key={a} className="px-3.5 py-2.5 text-center">{a}</Th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FUNCS.map((fn) => (
                  <tr key={fn.key} className="border-b border-neutral-100">
                    <td className="px-3.5 py-2.5 font-medium text-foreground">{fn.label}</td>
                    {ACTIONS.map((act) => {
                      const applicable = fn.acts.includes(act)
                      const checked = (form.perms[fn.key] ?? []).includes(act)
                      return (
                        <td key={act} className="px-3.5 py-2.5 text-center">
                          {applicable ? (
                            <button onClick={() => toggleCell(fn.key, act)} className={cn("inline-flex size-[18px] items-center justify-center rounded-[4px] border", checked ? "border-neutral-900 bg-neutral-900 text-white" : "border-border-strong bg-surface")}>
                              {checked && <Check className="size-3" strokeWidth={3} />}
                            </button>
                          ) : (
                            <span className="text-foreground-subtle">—</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
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
