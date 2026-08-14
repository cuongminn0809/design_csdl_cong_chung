import { useMemo, useState } from "react"
import { Building2, Eye, LayoutList, Network, Pencil, Plus, Search, Trash2, TriangleAlert, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { MultiSelect } from "@/features/reconciliation/components/MultiSelect"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { useToast } from "@/features/reconciliation/components/Toast"
import { EmptyState, IconBtn, Pagination, PageHeader, StatusPill, Th, inputCls, type StatusMeta } from "../ingestion/shared"

interface Unit {
  id: string
  name: string
  type: keyof typeof TYPES
  parent: string
  phone: string
  email: string
  fax: string
  website: string
  province: string
  ward: string
  addr: string
  note: string
  status: "active" | "inactive"
  level: number
  protected: boolean
}

const TYPES = {
  BTP: { label: "Bộ Tư pháp", bg: "#eff6ff", fg: "#2563eb", bd: "#bfdbfe" },
  STP: { label: "Sở Tư pháp", bg: "#f0fdfa", fg: "#0d9488", bd: "#99f6e4" },
  TCHNCC: { label: "Tổ chức hành nghề công chứng", bg: "#faf5ff", fg: "#9333ea", bd: "#e9d5ff" },
  DVTQ: { label: "Đơn vị có thẩm quyền", bg: "#fffbeb", fg: "#b45309", bd: "#fde68a" },
}

const ST: Record<string, StatusMeta> = {
  active: { label: "Đang hoạt động", dot: "#16a34a", bg: "#f0fdf4", fg: "#15803d", bd: "#bbf7d0" },
  inactive: { label: "Ngừng hoạt động", dot: "#737373", bg: "#f5f5f5", fg: "#525252", bd: "#e5e5e5" },
}

const SEED: Unit[] = [
  { id: "BTP", name: "Bộ Tư pháp", type: "BTP", parent: "", phone: "024 6273 9718", email: "vanphong@moj.gov.vn", fax: "024 6273 9720", website: "https://moj.gov.vn", province: "TP. Hà Nội", ward: "Phường Ba Đình", addr: "60 Trần Phú, Ba Đình", note: "Cơ quan quản lý nhà nước cấp trung ương", status: "active", level: 0, protected: true },
  { id: "STP-HN", name: "Sở Tư pháp TP. Hà Nội", type: "STP", parent: "Bộ Tư pháp", phone: "024 3825 1234", email: "stp@hanoi.gov.vn", fax: "024 3825 1235", website: "https://sotuphap.hanoi.gov.vn", province: "TP. Hà Nội", ward: "Phường Hà Đông", addr: "221 Trần Phú, Hà Đông", note: "", status: "active", level: 1, protected: false },
  { id: "VPCC-NH", name: "VPCC Nguyễn Huệ", type: "TCHNCC", parent: "Sở Tư pháp TP. Hà Nội", phone: "028 3822 4567", email: "info@vpccnguyenhue.vn", fax: "", website: "https://vpccnguyenhue.vn", province: "TP. Hồ Chí Minh", ward: "Phường Bến Nghé", addr: "12 Nguyễn Huệ, Quận 1", note: "", status: "active", level: 2, protected: false },
  { id: "PCC1-HN", name: "Phòng Công chứng số 1 TP. Hà Nội", type: "TCHNCC", parent: "Sở Tư pháp TP. Hà Nội", phone: "024 3826 7788", email: "pcc1@hanoi.gov.vn", fax: "", website: "", province: "TP. Hà Nội", ward: "Phường Hoàn Kiếm", addr: "310 Bà Triệu, Hai Bà Trưng", note: "", status: "active", level: 2, protected: false },
  { id: "STP-HCM", name: "Sở Tư pháp TP. Hồ Chí Minh", type: "STP", parent: "Bộ Tư pháp", phone: "028 3829 7178", email: "stp@tphcm.gov.vn", fax: "028 3829 7179", website: "https://sotuphap.hochiminhcity.gov.vn", province: "TP. Hồ Chí Minh", ward: "Phường Bến Thành", addr: "143 Pasteur, Quận 3", note: "", status: "active", level: 1, protected: false },
  { id: "VPCC-BT", name: "VPCC Bảo Tín", type: "TCHNCC", parent: "Sở Tư pháp TP. Hồ Chí Minh", phone: "028 3910 2020", email: "info@vpccbaotin.vn", fax: "", website: "", province: "TP. Hồ Chí Minh", ward: "Phường Đa Kao", addr: "55 Nguyễn Thị Minh Khai, Quận 1", note: "", status: "active", level: 2, protected: false },
  { id: "STP-DN", name: "Sở Tư pháp TP. Đà Nẵng", type: "STP", parent: "Bộ Tư pháp", phone: "0236 3821 021", email: "stp@danang.gov.vn", fax: "", website: "", province: "TP. Đà Nẵng", ward: "Phường Hải Châu", addr: "10 Trần Phú, Hải Châu", note: "", status: "inactive", level: 1, protected: false },
  { id: "C06", name: "Cục C06 - Bộ Công an", type: "DVTQ", parent: "", phone: "069 234 1099", email: "dvc@c06.bca.gov.vn", fax: "", website: "", province: "TP. Hà Nội", ward: "Phường Cầu Giấy", addr: "47 Phạm Văn Đồng, Cầu Giấy", note: "Đơn vị phối hợp cung cấp dữ liệu dân cư", status: "active", level: 0, protected: false },
  { id: "STP-HP", name: "Sở Tư pháp TP. Hải Phòng", type: "STP", parent: "Bộ Tư pháp", phone: "0225 3842 118", email: "stp@haiphong.gov.vn", fax: "", website: "", province: "TP. Hải Phòng", ward: "Phường Ngô Quyền", addr: "88 Trần Phú, Ngô Quyền", note: "", status: "active", level: 1, protected: false },
  { id: "VPCC-TP", name: "VPCC Trần Phú", type: "TCHNCC", parent: "Sở Tư pháp TP. Hải Phòng", phone: "0225 3842 118", email: "info@vpcctranphu.vn", fax: "", website: "", province: "TP. Hải Phòng", ward: "Phường Lê Chân", addr: "88 Trần Phú, Ngô Quyền", note: "", status: "active", level: 2, protected: false },
]

interface Filter { kw: string; types: string[]; status: string }
const EMPTY: Filter = { kw: "", types: [], status: "all" }

export function DonViPage() {
  const showToast = useToast()
  const [data, setData] = useState<Unit[]>(SEED)
  const [view, setView] = useState<"table" | "tree">("table")
  const [draft, setDraft] = useState<Filter>(EMPTY)
  const [applied, setApplied] = useState<Filter>(EMPTY)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selected, setSelected] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const kw = applied.kw.trim().toLowerCase()
    return data.filter((u) => {
      if (kw && !u.name.toLowerCase().includes(kw) && !u.id.toLowerCase().includes(kw) && !u.email.toLowerCase().includes(kw)) return false
      if (applied.types.length && !applied.types.includes(u.type)) return false
      if (applied.status !== "all" && u.status !== applied.status) return false
      return true
    })
  }, [data, applied])

  const start = (Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize))) - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)
  const detail = selected ? data.find((u) => u.id === selected) ?? null : null
  const confirmUnit = confirm ? data.find((u) => u.id === confirm) ?? null : null
  const hasChildren = (u: Unit) => data.some((x) => x.parent === u.name)

  const doSearch = () => { setApplied(draft); setPage(1) }
  const doReset = () => { setDraft(EMPTY); setApplied(EMPTY); setPage(1) }
  const doDelete = () => {
    if (!confirm) return
    setData((d) => d.filter((u) => u.id !== confirm))
    setConfirm(null)
    showToast("Đã xóa đơn vị")
  }

  return (
    <div>
      <PageHeader
        title="Quản lý đơn vị"
        desc="Quản lý cây đơn vị: Bộ Tư pháp, Sở Tư pháp, tổ chức hành nghề công chứng và đơn vị có thẩm quyền."
        actions={
          <Button onClick={() => showToast("Mở form thêm đơn vị (demo).")}>
            <Plus className="size-4" />
            Thêm đơn vị
          </Button>
        }
      />

      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[240px] flex-1">
            <label className="mb-1.5 block text-xs font-semibold text-foreground-strong">Tìm kiếm</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
              <input value={draft.kw} onChange={(e) => setDraft({ ...draft, kw: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} placeholder="Tên đơn vị, mã, email…" className={cn(inputCls, "pl-9")} />
            </div>
          </div>
          <MultiSelect label="Loại đơn vị" width={240} options={Object.entries(TYPES).map(([k, v]) => ({ value: k, label: v.label }))} selected={draft.types} onChange={(v) => setDraft({ ...draft, types: v })} emptyLabel="Tất cả loại" itemLabel={(n) => `${n} loại`} />
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

      <div className="mx-0.5 mb-2.5 mt-[18px] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-foreground-muted">Kết quả:</span>
          <span className="text-[13px] font-semibold text-foreground-strong">{filtered.length} đơn vị</span>
        </div>
        <div className="flex gap-1 rounded-md border border-border bg-surface-muted p-[3px]">
          {([["table", "Bảng", <LayoutList key="t" className="size-3.5" />], ["tree", "Cây phân cấp", <Network key="n" className="size-3.5" />]] as const).map(([k, l, icon]) => (
            <button key={k} onClick={() => setView(k)} className={cn("flex items-center gap-1.5 rounded-md px-3 py-[5px] text-[12.5px] font-medium", view === k ? "bg-surface text-foreground-strong shadow-xs" : "text-foreground-muted")}>
              {icon}
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        {filtered.length === 0 ? (
          <EmptyState icon={<Building2 className="size-6" />} title="Không tìm thấy đơn vị" desc="Không có đơn vị nào khớp với bộ lọc hiện tại." actionLabel="Xóa bộ lọc" onAction={doReset} />
        ) : view === "tree" ? (
          <div className="p-4">
            {filtered.map((u) => {
              const t = TYPES[u.type]
              return (
                <div key={u.id} className="flex items-center gap-2.5 border-b border-neutral-100 py-2.5 last:border-0" style={{ paddingLeft: u.level * 28 }}>
                  {u.level > 0 && <span className="text-foreground-subtle">└</span>}
                  <span onClick={() => setSelected(u.id)} className="cursor-pointer text-[13.5px] font-medium text-link hover:underline">{u.name}</span>
                  <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: t.bg, color: t.fg, border: `1px solid ${t.bd}` }}>{t.label}</span>
                  <StatusPill meta={ST[u.status]} />
                </div>
              )
            })}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-neutral-50">
                    <Th className="w-[52px] text-center">STT</Th>
                    <Th>Mã</Th>
                    <Th className="min-w-[240px]">Tên đơn vị</Th>
                    <Th className="min-w-[180px]">Loại</Th>
                    <Th className="min-w-[190px]">Đơn vị cấp trên</Th>
                    <Th className="min-w-[150px]">Tỉnh/Thành phố</Th>
                    <Th>Trạng thái</Th>
                    <Th className="w-[120px] text-center">Thao tác</Th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((u, i) => {
                    const t = TYPES[u.type]
                    const canDelete = !u.protected && !hasChildren(u)
                    return (
                      <tr key={u.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{start + i + 1}</td>
                        <td className="px-4 py-3 font-mono text-[12.5px] text-foreground">{u.id}</td>
                        <td className="px-4 py-3">
                          <div onClick={() => setSelected(u.id)} className="cursor-pointer font-medium leading-tight text-link hover:underline">{u.name}</div>
                          <div className="mt-0.5 text-[11.5px] text-foreground-subtle">{u.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold" style={{ background: t.bg, color: t.fg, border: `1px solid ${t.bd}` }}>{t.label}</span>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-foreground-muted">{u.parent || "—"}</td>
                        <td className="px-4 py-3 text-foreground">{u.province}</td>
                        <td className="px-4 py-3"><StatusPill meta={ST[u.status]} /></td>
                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex gap-0.5">
                            <IconBtn title="Xem chi tiết" onClick={() => setSelected(u.id)}><Eye className="size-4" /></IconBtn>
                            <IconBtn title="Sửa" onClick={() => showToast("Mở form chỉnh sửa (demo).")}><Pencil className="size-[15px]" /></IconBtn>
                            <IconBtn title={u.protected ? "Đơn vị hệ thống, không thể xóa" : hasChildren(u) ? "Đơn vị còn đơn vị con" : "Xóa"} disabled={!canDelete} danger onClick={() => setConfirm(u.id)}>
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
            <Pagination page={page} pageSize={pageSize} total={filtered.length} unit="đơn vị" onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
          </>
        )}
      </div>

      {detail && <UnitDetail u={detail} onClose={() => setSelected(null)} />}
      {confirmUnit && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={() => setConfirm(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-[460px] max-w-full overflow-hidden rounded-xl bg-surface shadow-popover">
            <div className="px-6 pb-[18px] pt-[22px]">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex size-[38px] shrink-0 items-center justify-center rounded-full bg-[#fef2f2] text-[#dc2626]"><TriangleAlert className="size-[19px]" /></div>
                <div className="text-[17px] font-semibold text-foreground-strong">Xác nhận xóa đơn vị</div>
              </div>
              <p className="text-[13.5px] leading-relaxed text-foreground-muted">
                Đơn vị "<span className="font-semibold text-foreground-strong">{confirmUnit.name}</span>" sẽ bị xóa khỏi hệ thống. Thao tác này không thể hoàn tác.
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t border-border bg-neutral-50 px-6 py-3.5">
              <Button variant="outline" onClick={() => setConfirm(null)}>Hủy bỏ</Button>
              <button onClick={doDelete} className="h-9 rounded-md border border-red-600 bg-red-600 px-4 text-sm font-medium text-white shadow-xs hover:bg-[#b91c1c]">Xóa đơn vị</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function UnitDetail({ u, onClose }: { u: Unit; onClose: () => void }) {
  const t = TYPES[u.type]
  const fields: { label: string; value: string; span?: boolean }[] = [
    { label: "Mã đơn vị", value: u.id },
    { label: "Loại đơn vị", value: t.label },
    { label: "Đơn vị cấp trên", value: u.parent || "— (cấp cao nhất)", span: true },
    { label: "Điện thoại", value: u.phone },
    { label: "Email", value: u.email },
    { label: "Fax", value: u.fax || "—" },
    { label: "Website", value: u.website || "—" },
    { label: "Tỉnh/Thành phố", value: u.province },
    { label: "Phường/Xã", value: u.ward },
    { label: "Địa chỉ", value: u.addr, span: true },
    { label: "Ghi chú", value: u.note || "—", span: true },
  ]
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex max-h-[88vh] w-[720px] max-w-full flex-col overflow-hidden rounded-xl bg-surface shadow-popover">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="min-w-0">
            <div className="mb-1 text-xs font-semibold text-foreground-muted">Chi tiết đơn vị</div>
            <div className="text-lg font-semibold leading-tight text-foreground-strong">{u.name}</div>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold" style={{ background: t.bg, color: t.fg, border: `1px solid ${t.bd}` }}>{t.label}</span>
              <StatusPill meta={ST[u.status]} />
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="size-[18px]" /></Button>
        </div>
        <div className="flex-1 overflow-auto px-6 pb-6 pt-[18px]">
          <div className="grid grid-cols-2 gap-x-7">
            {fields.map((f) => (
              <div key={f.label} className={cn("flex flex-col gap-0.5 border-b border-neutral-100 py-2.5", f.span && "col-span-2")}>
                <div className="text-xs text-foreground-muted">{f.label}</div>
                <div className="text-[13.5px] leading-snug text-foreground">{f.value}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end border-t border-border px-6 py-4">
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </div>
      </div>
    </div>
  )
}
