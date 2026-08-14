import { useMemo, useState } from "react"
import { Download, Eye, Lock, LockOpen, Pencil, Plus, Search, UserRound, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { MultiSelect } from "@/features/reconciliation/components/MultiSelect"
import { useToast } from "@/features/reconciliation/components/Toast"
import { EmptyState, IconBtn, Pagination, PageHeader, StatusPill, Th, inputCls, type StatusMeta } from "../ingestion/shared"

interface Person {
  acc: string
  name: string
  email: string
  roles?: string[]
  unit: string
  title: string
  status: "active" | "locked" | "inactive"
  dob: string
  gender: string
  nation: string
  tel: string
  mobile: string
  addr: string
  created: string
  cardNo?: string
  org?: string
}

const ST: Record<string, StatusMeta> = {
  active: { label: "Đang hoạt động", dot: "#16a34a", bg: "#f0fdf4", fg: "#15803d", bd: "#bbf7d0" },
  locked: { label: "Tạm khóa", dot: "#d97706", bg: "#fffbeb", fg: "#b45309", bd: "#fde68a" },
  inactive: { label: "Ngừng hoạt động", dot: "#737373", bg: "#f5f5f5", fg: "#525252", bd: "#e5e5e5" },
}

const ROLES = ["Quản trị hệ thống", "Chuyên viên Bộ Tư pháp", "Chuyên viên Sở Tư pháp", "Lãnh đạo Sở Tư pháp", "Cán bộ một cửa"]

const STAFF: Person[] = [
  { acc: "anhpq", name: "Phạm Quốc Anh", email: "anhpq@moj.gov.vn", roles: ["Quản trị hệ thống"], unit: "Bộ Tư pháp", title: "Chuyên viên chính", status: "active", dob: "1985-04-12", gender: "Nam", nation: "Việt Nam", tel: "024 6273 9718", mobile: "0912 345 678", addr: "60 Trần Phú, Ba Đình, Hà Nội", created: "02/01/2022" },
  { acc: "huongtt", name: "Trần Thị Hương", email: "huongtt@stp.hanoi.gov.vn", roles: ["Chuyên viên Sở Tư pháp", "Cán bộ một cửa"], unit: "Sở Tư pháp TP. Hà Nội", title: "Chuyên viên", status: "active", dob: "1990-09-03", gender: "Nữ", nation: "Việt Nam", tel: "024 3825 1234", mobile: "0987 654 321", addr: "221 Trần Phú, Hà Đông, Hà Nội", created: "12/03/2024" },
  { acc: "namlh", name: "Lê Hoàng Nam", email: "namlh@stp.hochiminhcity.gov.vn", roles: ["Lãnh đạo Sở Tư pháp"], unit: "Sở Tư pháp TP. Hồ Chí Minh", title: "Phó giám đốc", status: "active", dob: "1978-11-20", gender: "Nam", nation: "Việt Nam", tel: "028 3829 7178", mobile: "0903 111 222", addr: "143 Pasteur, Quận 3, TP.HCM", created: "28/02/2024" },
  { acc: "sonbt", name: "Bùi Thanh Sơn", email: "sonbt@tnmt.hanoi.gov.vn", roles: ["Chuyên viên Sở Tư pháp"], unit: "Sở Tư pháp Đà Nẵng", title: "Chuyên viên", status: "locked", dob: "1988-02-15", gender: "Nam", nation: "Việt Nam", tel: "0236 3821 021", mobile: "0905 333 444", addr: "10 Trần Phú, Hải Châu, Đà Nẵng", created: "18/08/2023" },
  { acc: "chaunb", name: "Ngô Bảo Châu", email: "chaunb@moj.gov.vn", roles: ["Chuyên viên Bộ Tư pháp"], unit: "Bộ Tư pháp", title: "Chuyên viên", status: "active", dob: "1992-07-08", gender: "Nữ", nation: "Việt Nam", tel: "024 3767 8888", mobile: "0918 222 333", addr: "6B Hoàng Diệu, Ba Đình, Hà Nội", created: "09/01/2024" },
  { acc: "khoavd", name: "Vũ Đình Khoa", email: "khoavd@stp.haiphong.gov.vn", roles: ["Cán bộ một cửa"], unit: "Sở Tư pháp Hải Phòng", title: "Chuyên viên", status: "active", dob: "1995-12-01", gender: "Nam", nation: "Việt Nam", tel: "0225 3842 118", mobile: "0936 555 666", addr: "88 Trần Phú, Ngô Quyền, Hải Phòng", created: "14/05/2024" },
  { acc: "tuanhm", name: "Hoàng Minh Tuấn", email: "tuanhm@c06.bca.gov.vn", roles: ["Chuyên viên Bộ Tư pháp"], unit: "Cục C06 - Bộ Công an", title: "Chuyên viên chính", status: "inactive", dob: "1983-06-25", gender: "Nam", nation: "Việt Nam", tel: "069 234 1099", mobile: "0961 777 888", addr: "47 Phạm Văn Đồng, Cầu Giấy, Hà Nội", created: "22/07/2024" },
  { acc: "lanhtt", name: "Đặng Thu Hà", email: "lanhtt@stp.hanoi.gov.vn", roles: ["Chuyên viên Sở Tư pháp"], unit: "Sở Tư pháp TP. Hà Nội", title: "Chuyên viên", status: "active", dob: "1991-03-30", gender: "Nữ", nation: "Việt Nam", tel: "024 3736 2555", mobile: "0977 999 000", addr: "58 Trần Phú, Ba Đình, Hà Nội", created: "10/11/2023" },
]

const CCV: Person[] = [
  { acc: "thanhnv", name: "Nguyễn Văn Thành", email: "thanhnv@vpccnguyenhue.vn", unit: "VPCC Nguyễn Huệ", title: "Công chứng viên", status: "active", dob: "1980-05-16", gender: "Nam", nation: "Việt Nam", tel: "028 3822 4567", mobile: "0909 123 456", addr: "12 Nguyễn Huệ, Quận 1, TP.HCM", created: "02/04/2024", cardNo: "CCV-0451", org: "VPCC Nguyễn Huệ" },
  { acc: "mailtt", name: "Lý Thị Mai", email: "mailtt@vpcctranphu.vn", unit: "VPCC Trần Phú", title: "Công chứng viên", status: "active", dob: "1984-08-22", gender: "Nữ", nation: "Việt Nam", tel: "0225 3842 118", mobile: "0912 888 777", addr: "88 Trần Phú, Ngô Quyền, Hải Phòng", created: "14/05/2024", cardNo: "CCV-0782", org: "VPCC Trần Phú" },
  { acc: "ducnv", name: "Nguyễn Văn Đức", email: "ducnv@vpccminhduc.vn", unit: "VPCC Minh Đức", title: "Công chứng viên", status: "locked", dob: "1976-01-09", gender: "Nam", nation: "Việt Nam", tel: "024 3555 1212", mobile: "0988 444 555", addr: "25 Lý Thường Kiệt, Hoàn Kiếm, Hà Nội", created: "20/06/2023", cardNo: "CCV-0113", org: "VPCC Minh Đức" },
  { acc: "hoapt", name: "Phan Thị Hoa", email: "hoapt@pcc1hanoi.vn", unit: "PCC số 1 TP. Hà Nội", title: "Công chứng viên", status: "active", dob: "1987-10-11", gender: "Nữ", nation: "Việt Nam", tel: "024 3826 7788", mobile: "0902 666 111", addr: "310 Bà Triệu, Hai Bà Trưng, Hà Nội", created: "11/09/2023", cardNo: "CCV-0298", org: "Phòng Công chứng số 1" },
  { acc: "longvq", name: "Vũ Quang Long", email: "longvq@vpccbaotin.vn", unit: "VPCC Bảo Tín", title: "Công chứng viên", status: "active", dob: "1982-12-05", gender: "Nam", nation: "Việt Nam", tel: "028 3910 2020", mobile: "0917 333 222", addr: "55 Nguyễn Thị Minh Khai, Quận 1, TP.HCM", created: "03/07/2024", cardNo: "CCV-0640", org: "VPCC Bảo Tín" },
]

interface Filter { kw: string; roles: string[]; units: string[]; statuses: string[] }
const EMPTY: Filter = { kw: "", roles: [], units: [], statuses: [] }

export function NguoiDungPage() {
  const showToast = useToast()
  const [tab, setTab] = useState<"staff" | "ccv">("staff")
  const [data, setData] = useState({ staff: STAFF, ccv: CCV })
  const [draft, setDraft] = useState<Filter>(EMPTY)
  const [applied, setApplied] = useState<Filter>(EMPTY)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selected, setSelected] = useState<string | null>(null)

  const isStaff = tab === "staff"
  const rows = isStaff ? data.staff : data.ccv
  const units = useMemo(() => [...new Set(rows.map((r) => r.unit))].sort((a, b) => a.localeCompare(b, "vi")), [rows])

  const filtered = useMemo(() => {
    const kw = applied.kw.trim().toLowerCase()
    return rows.filter((r) => {
      if (kw && !r.acc.toLowerCase().includes(kw) && !r.name.toLowerCase().includes(kw) && !r.email.toLowerCase().includes(kw)) return false
      if (applied.roles.length && !(r.roles ?? []).some((x) => applied.roles.includes(x))) return false
      if (applied.units.length && !applied.units.includes(r.unit)) return false
      if (applied.statuses.length && !applied.statuses.includes(r.status)) return false
      return true
    })
  }, [rows, applied])

  const start = (Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize))) - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)
  const detail = selected ? rows.find((r) => r.acc === selected) ?? null : null

  const doSearch = () => { setApplied(draft); setPage(1) }
  const doReset = () => { setDraft(EMPTY); setApplied(EMPTY); setPage(1) }
  const switchTab = (t: "staff" | "ccv") => { setTab(t); doReset(); setSelected(null) }

  const toggleLock = (p: Person) => {
    const next = p.status === "locked" ? "active" : "locked"
    setData((d) => ({
      ...d,
      [tab]: (isStaff ? d.staff : d.ccv).map((x) => (x.acc === p.acc ? { ...x, status: next as Person["status"] } : x)),
    }))
    showToast(next === "locked" ? "Đã tạm khóa tài khoản" : "Đã mở khóa tài khoản")
  }

  return (
    <div>
      <PageHeader
        title="Quản lý người dùng"
        desc="Quản lý tài khoản cán bộ và công chứng viên, gán vai trò và trạng thái hoạt động."
        actions={
          <>
            <Button variant="outline" onClick={() => showToast("Đã xuất danh sách người dùng")}>
              <Download className="size-4" />
              Xuất danh sách
            </Button>
            <Button onClick={() => showToast("Mở form thêm người dùng (demo).")}>
              <Plus className="size-4" />
              Thêm người dùng
            </Button>
          </>
        }
      />

      {/* Tabs */}
      <div className="mb-[18px] flex gap-0.5 border-b border-border">
        {([["staff", "Cán bộ / chuyên viên"], ["ccv", "Công chứng viên"]] as const).map(([k, l]) => (
          <button
            key={k}
            onClick={() => switchTab(k)}
            className={cn("-mb-px border-b-2 px-1 py-[11px] pr-4 text-sm", tab === k ? "border-neutral-900 font-semibold text-foreground-strong" : "border-transparent font-medium text-foreground-muted")}
          >
            {l}
            <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-foreground-muted">{k === "staff" ? data.staff.length : data.ccv.length}</span>
          </button>
        ))}
      </div>

      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[240px] flex-1">
            <label className="mb-1.5 block text-xs font-semibold text-foreground-strong">Tìm kiếm</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
              <input value={draft.kw} onChange={(e) => setDraft({ ...draft, kw: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} placeholder="Tài khoản, họ tên, email…" className={cn(inputCls, "pl-9")} />
            </div>
          </div>
          {isStaff && (
            <MultiSelect label="Vai trò" width={220} options={ROLES.map((r) => ({ value: r, label: r }))} selected={draft.roles} onChange={(v) => setDraft({ ...draft, roles: v })} emptyLabel="Tất cả vai trò" itemLabel={(n) => `${n} vai trò`} />
          )}
          <MultiSelect label="Đơn vị" width={230} options={units.map((u) => ({ value: u, label: u }))} selected={draft.units} onChange={(v) => setDraft({ ...draft, units: v })} emptyLabel="Tất cả đơn vị" itemLabel={(n) => `${n} đơn vị`} />
          <MultiSelect label="Trạng thái" width={200} options={Object.entries(ST).map(([k, v]) => ({ value: k, label: v.label }))} selected={draft.statuses} onChange={(v) => setDraft({ ...draft, statuses: v })} emptyLabel="Tất cả trạng thái" itemLabel={(n) => `${n} trạng thái`} />
          <div className="flex gap-2">
            <Button variant="outline" onClick={doReset}>Xóa bộ lọc</Button>
            <Button onClick={doSearch}><Search className="size-4" />Tìm kiếm</Button>
          </div>
        </div>
      </div>

      <div className="mx-0.5 mb-2.5 mt-[18px] flex items-center gap-2">
        <span className="text-[13px] text-foreground-muted">Kết quả:</span>
        <span className="text-[13px] font-semibold text-foreground-strong">{filtered.length} người dùng</span>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        {filtered.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-neutral-50">
                    <Th className="w-[52px] text-center">STT</Th>
                    <Th>Tài khoản</Th>
                    <Th className="min-w-[170px]">Họ tên</Th>
                    <Th className="min-w-[210px]">Email</Th>
                    {isStaff ? <Th className="min-w-[200px]">Vai trò</Th> : <Th>Số thẻ CCV</Th>}
                    <Th className="min-w-[190px]">Đơn vị</Th>
                    <Th>Trạng thái</Th>
                    <Th className="w-[120px] text-center">Thao tác</Th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((p, i) => (
                    <tr key={p.acc} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{start + i + 1}</td>
                      <td className="px-4 py-3">
                        <span onClick={() => setSelected(p.acc)} className="cursor-pointer font-mono text-[12.5px] font-semibold text-link hover:underline">{p.acc}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{p.name}</div>
                        <div className="mt-0.5 text-[11.5px] text-foreground-subtle">{p.title}</div>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-foreground-muted">{p.email}</td>
                      {isStaff ? (
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {(p.roles ?? []).map((r) => (
                              <span key={r} className="rounded-full border border-border bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-foreground-muted">{r}</span>
                            ))}
                          </div>
                        </td>
                      ) : (
                        <td className="px-4 py-3 font-mono text-[12.5px] text-foreground">{p.cardNo}</td>
                      )}
                      <td className="px-4 py-3 text-[13px] text-foreground-muted">{p.unit}</td>
                      <td className="px-4 py-3"><StatusPill meta={ST[p.status]} /></td>
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex gap-0.5">
                          <IconBtn title="Xem chi tiết" onClick={() => setSelected(p.acc)}><Eye className="size-4" /></IconBtn>
                          <IconBtn title="Sửa" onClick={() => showToast("Mở form chỉnh sửa (demo).")}><Pencil className="size-[15px]" /></IconBtn>
                          <IconBtn title={p.status === "locked" ? "Mở khóa" : "Tạm khóa"} onClick={() => toggleLock(p)}>
                            {p.status === "locked" ? <LockOpen className="size-[15px]" /> : <Lock className="size-[15px]" />}
                          </IconBtn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={pageSize} total={filtered.length} unit="người dùng" onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
          </>
        ) : (
          <EmptyState icon={<UserRound className="size-6" />} title="Không tìm thấy người dùng" desc="Không có tài khoản nào khớp với bộ lọc hiện tại." actionLabel="Xóa bộ lọc" onAction={doReset} />
        )}
      </div>

      {detail && <UserDetail p={detail} isStaff={isStaff} onClose={() => setSelected(null)} />}
    </div>
  )
}

function UserDetail({ p, isStaff, onClose }: { p: Person; isStaff: boolean; onClose: () => void }) {
  const sections: { title: string; fields: { label: string; value: string; span?: boolean }[] }[] = [
    {
      title: "Thông tin tài khoản",
      fields: [
        { label: "Tài khoản", value: p.acc },
        { label: "Email", value: p.email },
        ...(isStaff ? [{ label: "Vai trò", value: (p.roles ?? []).join(", ") || "—", span: true }] : [{ label: "Số thẻ công chứng viên", value: p.cardNo ?? "—" }, { label: "Tổ chức hành nghề", value: p.org ?? "—" }]),
        { label: "Đơn vị", value: p.unit },
        { label: "Chức danh", value: p.title },
        { label: "Trạng thái", value: ST[p.status].label },
        { label: "Ngày tạo", value: p.created },
      ],
    },
    {
      title: "Thông tin cá nhân",
      fields: [
        { label: "Ngày sinh", value: p.dob.split("-").reverse().join("/") },
        { label: "Giới tính", value: p.gender },
        { label: "Quốc tịch", value: p.nation },
        { label: "Điện thoại cơ quan", value: p.tel },
        { label: "Di động", value: p.mobile },
        { label: "Địa chỉ", value: p.addr, span: true },
      ],
    },
  ]
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex max-h-[88vh] w-[720px] max-w-full flex-col overflow-hidden rounded-xl bg-surface shadow-popover">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
              {p.name.split(" ").slice(-2).map((w) => w[0]).join("")}
            </div>
            <div className="min-w-0">
              <div className="text-lg font-semibold leading-tight text-foreground-strong">{p.name}</div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="rounded-[4px] border border-border bg-surface-muted px-1.5 py-px font-mono text-xs text-foreground-muted">{p.acc}</span>
                <StatusPill meta={ST[p.status]} />
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="size-[18px]" /></Button>
        </div>
        <div className="flex-1 overflow-auto px-6 pb-6 pt-4">
          {sections.map((s) => (
            <div key={s.title}>
              <div className="mb-1 mt-2 text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">{s.title}</div>
              <div className="mb-3 grid grid-cols-2 gap-x-7">
                {s.fields.map((f) => (
                  <div key={f.label} className={cn("flex flex-col gap-0.5 border-b border-neutral-100 py-2.5", f.span && "col-span-2")}>
                    <div className="text-xs text-foreground-muted">{f.label}</div>
                    <div className="text-[13.5px] leading-snug text-foreground">{f.value}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end border-t border-border px-6 py-4">
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </div>
      </div>
    </div>
  )
}
