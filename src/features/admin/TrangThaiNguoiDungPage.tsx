import { useMemo, useState } from "react"
import { Eye, ListChecks, Pencil, Plus, Search, Trash2, TriangleAlert, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { useToast } from "@/features/reconciliation/components/Toast"
import { EmptyState, IconBtn, Pagination, PageHeader, Th, inputCls } from "../ingestion/shared"

interface StatusItem {
  code: string
  name: string
  desc: string
  use: "used" | "unused"
  updated: string
  assigned: boolean
  dot: string
}

const USE: Record<string, { label: string; bg: string; fg: string; bd: string }> = {
  used: { label: "Sử dụng", bg: "#f0fdf4", fg: "#15803d", bd: "#bbf7d0" },
  unused: { label: "Không sử dụng", bg: "#f5f5f5", fg: "#525252", bd: "#e5e5e5" },
}

const SEED: StatusItem[] = [
  { code: "ACTIVE", name: "Đang hoạt động", desc: "Tài khoản hoạt động bình thường, được phép đăng nhập và sử dụng đầy đủ chức năng theo quyền.", use: "used", updated: "20/06/2026", assigned: true, dot: "#16a34a" },
  { code: "LOCKED", name: "Tạm khóa", desc: "Tài khoản bị khóa tạm thời, không thể đăng nhập cho đến khi được quản trị mở khóa.", use: "used", updated: "11/05/2026", assigned: true, dot: "#d97706" },
  { code: "INACTIVE", name: "Ngừng hoạt động", desc: "Tài khoản ngừng hoạt động, không đăng nhập được; giữ lại để tra cứu lịch sử.", use: "used", updated: "01/03/2026", assigned: true, dot: "#737373" },
  { code: "PENDING", name: "Chờ kích hoạt", desc: "Tài khoản mới tạo, chờ người dùng kích hoạt lần đầu qua email trước khi đăng nhập.", use: "used", updated: "09/01/2026", assigned: true, dot: "#2563eb" },
  { code: "EXPIRED", name: "Hết hạn", desc: "Tài khoản hết thời hạn hiệu lực; cần gia hạn để tiếp tục sử dụng.", use: "unused", updated: "15/12/2025", assigned: false, dot: "#b45309" },
  { code: "SUSPENDED", name: "Đình chỉ", desc: "Tài khoản bị đình chỉ do vi phạm quy định vận hành, chờ xử lý.", use: "unused", updated: "02/11/2025", assigned: false, dot: "#dc2626" },
]

const parseD = (s: string) => {
  const [dd, mm, yy] = s.split("/")
  return new Date(+yy, +mm - 1, +dd).getTime()
}

interface FormState {
  mode: "create" | "edit"
  code: string
  name: string
  desc: string
  use: "used" | "unused"
  dot: string
  errors: { code?: string; name?: string }
}

const DOTS = ["#16a34a", "#2563eb", "#d97706", "#dc2626", "#737373", "#7c3aed"]

export function TrangThaiNguoiDungPage() {
  const showToast = useToast()
  const [data, setData] = useState<StatusItem[]>(SEED)
  const [draft, setDraft] = useState({ kw: "", use: "all" })
  const [applied, setApplied] = useState({ kw: "", use: "all" })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selected, setSelected] = useState<string | null>(null)
  const [form, setForm] = useState<FormState | null>(null)
  const [confirm, setConfirm] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const kw = applied.kw.trim().toLowerCase()
    return data
      .filter((r) => {
        if (kw && !r.code.toLowerCase().includes(kw) && !r.name.toLowerCase().includes(kw) && !r.desc.toLowerCase().includes(kw)) return false
        if (applied.use !== "all" && r.use !== applied.use) return false
        return true
      })
      .sort((x, y) => parseD(y.updated) - parseD(x.updated))
  }, [data, applied])

  const start = (Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize))) - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)
  const detail = selected ? data.find((r) => r.code === selected) ?? null : null
  const confirmItem = confirm ? data.find((r) => r.code === confirm) ?? null : null

  const doSearch = () => { setApplied(draft); setPage(1) }
  const doReset = () => { setDraft({ kw: "", use: "all" }); setApplied({ kw: "", use: "all" }); setPage(1) }

  const save = () => {
    if (!form) return
    const errors: FormState["errors"] = {}
    if (!form.code.trim()) errors.code = "Vui lòng nhập mã trạng thái"
    else if (form.mode === "create" && data.some((r) => r.code.toLowerCase() === form.code.trim().toLowerCase())) errors.code = "Mã trạng thái đã tồn tại"
    if (!form.name.trim()) errors.name = "Vui lòng nhập tên trạng thái"
    if (Object.keys(errors).length) {
      setForm({ ...form, errors })
      return
    }
    const today = new Date().toLocaleDateString("vi-VN")
    if (form.mode === "create") {
      setData((d) => [{ code: form.code.trim().toUpperCase(), name: form.name.trim(), desc: form.desc.trim(), use: form.use, updated: today, assigned: false, dot: form.dot }, ...d])
      showToast("Thêm trạng thái thành công")
    } else {
      setData((d) => d.map((r) => (r.code === form.code ? { ...r, name: form.name.trim(), desc: form.desc.trim(), use: form.use, dot: form.dot, updated: today } : r)))
      showToast("Đã lưu trạng thái người dùng")
    }
    setForm(null)
  }

  const doDelete = () => {
    if (!confirm) return
    setData((d) => d.filter((r) => r.code !== confirm))
    setConfirm(null)
    showToast("Đã xóa trạng thái")
  }

  return (
    <div>
      <PageHeader
        title="Danh mục trạng thái người dùng"
        desc="Quản lý các trạng thái áp dụng cho tài khoản người dùng trong hệ thống."
        actions={
          <Button onClick={() => setForm({ mode: "create", code: "", name: "", desc: "", use: "used", dot: DOTS[0], errors: {} })}>
            <Plus className="size-4" />
            Thêm trạng thái
          </Button>
        }
      />

      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[240px] flex-1">
            <label className="mb-1.5 block text-xs font-semibold text-foreground-strong">Tìm kiếm</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
              <input value={draft.kw} onChange={(e) => setDraft({ ...draft, kw: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} placeholder="Mã, tên, mô tả…" className={cn(inputCls, "pl-9")} />
            </div>
          </div>
          <div className="w-[200px]">
            <label className="mb-1.5 block text-xs font-semibold text-foreground-strong">Tình trạng sử dụng</label>
            <NativeSelect value={draft.use} onChange={(e) => setDraft({ ...draft, use: e.target.value })}>
              <option value="all">Tất cả</option>
              <option value="used">Sử dụng</option>
              <option value="unused">Không sử dụng</option>
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
        <span className="text-[13px] font-semibold text-foreground-strong">{filtered.length} trạng thái</span>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        {filtered.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-neutral-50">
                    <Th className="w-[52px] text-center">STT</Th>
                    <Th>Mã</Th>
                    <Th className="min-w-[180px]">Tên trạng thái</Th>
                    <Th className="min-w-[320px]">Mô tả</Th>
                    <Th>Tình trạng</Th>
                    <Th>Cập nhật</Th>
                    <Th className="w-[120px] text-center">Thao tác</Th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((r, i) => {
                    const u = USE[r.use]
                    return (
                      <tr key={r.code} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{start + i + 1}</td>
                        <td className="px-4 py-3 font-mono text-[12.5px] text-foreground">{r.code}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="size-2 shrink-0 rounded-full" style={{ background: r.dot }} />
                            <span onClick={() => setSelected(r.code)} className="cursor-pointer font-medium text-link hover:underline">{r.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[13px] leading-snug text-foreground-muted">{r.desc}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: u.bg, color: u.fg, border: `1px solid ${u.bd}` }}>{u.label}</span>
                        </td>
                        <td className="px-4 py-3 tabular-nums text-foreground-muted">{r.updated}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex gap-0.5">
                            <IconBtn title="Xem chi tiết" onClick={() => setSelected(r.code)}><Eye className="size-4" /></IconBtn>
                            <IconBtn title="Sửa" onClick={() => setForm({ mode: "edit", code: r.code, name: r.name, desc: r.desc, use: r.use, dot: r.dot, errors: {} })}><Pencil className="size-[15px]" /></IconBtn>
                            <IconBtn title={r.assigned ? "Đang được gán cho tài khoản" : "Xóa"} disabled={r.assigned} danger onClick={() => setConfirm(r.code)}><Trash2 className="size-[14px]" /></IconBtn>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={pageSize} total={filtered.length} unit="trạng thái" onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
          </>
        ) : (
          <EmptyState icon={<ListChecks className="size-6" />} title="Không tìm thấy trạng thái" desc="Không có trạng thái nào khớp với bộ lọc hiện tại." actionLabel="Xóa bộ lọc" onAction={doReset} />
        )}
      </div>

      {detail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={() => setSelected(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-[560px] max-w-full overflow-hidden rounded-xl bg-surface shadow-popover">
            <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
              <div>
                <div className="mb-1 text-xs font-semibold text-foreground-muted">Chi tiết trạng thái</div>
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full" style={{ background: detail.dot }} />
                  <div className="text-lg font-semibold text-foreground-strong">{detail.name}</div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelected(null)}><X className="size-[18px]" /></Button>
            </div>
            <div className="px-6 py-4">
              {[
                { label: "Mã trạng thái", value: detail.code, mono: true },
                { label: "Mô tả", value: detail.desc },
                { label: "Tình trạng sử dụng", value: USE[detail.use].label },
                { label: "Đang gán cho tài khoản", value: detail.assigned ? "Có" : "Không" },
                { label: "Cập nhật gần nhất", value: detail.updated },
              ].map((f) => (
                <div key={f.label} className="flex flex-col gap-0.5 border-b border-neutral-100 py-2.5 last:border-0">
                  <div className="text-xs text-foreground-muted">{f.label}</div>
                  <div className={cn("text-[13.5px] leading-snug text-foreground", f.mono && "font-mono")}>{f.value}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-end border-t border-border px-6 py-4">
              <Button variant="outline" onClick={() => setSelected(null)}>Đóng</Button>
            </div>
          </div>
        </div>
      )}

      {form && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={() => setForm(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-[600px] max-w-full overflow-hidden rounded-xl bg-surface shadow-popover">
            <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
              <div className="text-[17px] font-semibold text-foreground-strong">{form.mode === "create" ? "Thêm trạng thái" : "Chỉnh sửa trạng thái"}</div>
              <Button variant="ghost" size="icon" onClick={() => setForm(null)}><X className="size-[18px]" /></Button>
            </div>
            <div className="flex flex-col gap-4 px-6 py-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12.5px] font-semibold text-foreground-strong">Mã trạng thái <span className="text-red-600">*</span></label>
                <input value={form.code} disabled={form.mode === "edit"} onChange={(e) => setForm({ ...form, code: e.target.value, errors: { ...form.errors, code: undefined } })} placeholder="VD: ACTIVE" className={cn(inputCls, "h-[38px] font-mono text-[13px]", form.mode === "edit" && "bg-surface-muted text-foreground-muted", form.errors.code && "border-red-600")} />
                {form.errors.code && <span className="text-[11.5px] text-red-600">{form.errors.code}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12.5px] font-semibold text-foreground-strong">Tên trạng thái <span className="text-red-600">*</span></label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, errors: { ...form.errors, name: undefined } })} className={cn(inputCls, "h-[38px]", form.errors.name && "border-red-600")} />
                {form.errors.name && <span className="text-[11.5px] text-red-600">{form.errors.name}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12.5px] font-semibold text-foreground-strong">Mô tả</label>
                <textarea value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} rows={3} className="resize-y rounded-md border border-input bg-surface px-3 py-2.5 text-sm shadow-xs outline-none" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[12.5px] font-semibold text-foreground-strong">Màu hiển thị</label>
                <div className="flex gap-2">
                  {DOTS.map((c) => (
                    <button key={c} onClick={() => setForm({ ...form, dot: c })} className={cn("flex size-8 items-center justify-center rounded-full border-2", form.dot === c ? "border-neutral-900" : "border-transparent")}>
                      <span className="size-4 rounded-full" style={{ background: c }} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12.5px] font-semibold text-foreground-strong">Tình trạng sử dụng</label>
                <NativeSelect className="h-[38px]" value={form.use} onChange={(e) => setForm({ ...form, use: e.target.value as FormState["use"] })}>
                  <option value="used">Sử dụng</option>
                  <option value="unused">Không sử dụng</option>
                </NativeSelect>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
              <Button variant="outline" onClick={() => setForm(null)}>Hủy</Button>
              <Button onClick={save}>Lưu</Button>
            </div>
          </div>
        </div>
      )}

      {confirmItem && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={() => setConfirm(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-[460px] max-w-full overflow-hidden rounded-xl bg-surface shadow-popover">
            <div className="px-6 pb-[18px] pt-[22px]">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex size-[38px] shrink-0 items-center justify-center rounded-full bg-[#fef2f2] text-[#dc2626]"><TriangleAlert className="size-[19px]" /></div>
                <div className="text-[17px] font-semibold text-foreground-strong">Xác nhận xóa trạng thái</div>
              </div>
              <p className="text-[13.5px] leading-relaxed text-foreground-muted">
                Trạng thái "<span className="font-semibold text-foreground-strong">{confirmItem.name}</span>" sẽ bị xóa khỏi danh mục. Thao tác này không thể hoàn tác.
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t border-border bg-neutral-50 px-6 py-3.5">
              <Button variant="outline" onClick={() => setConfirm(null)}>Hủy bỏ</Button>
              <button onClick={doDelete} className="h-9 rounded-md border border-red-600 bg-red-600 px-4 text-sm font-medium text-white shadow-xs hover:bg-[#b91c1c]">Xóa trạng thái</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
