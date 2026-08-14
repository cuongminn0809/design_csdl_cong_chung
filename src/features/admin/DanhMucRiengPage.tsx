import { useMemo, useState } from "react"
import { Download, FileText, Pencil, Plus, Search, Trash2, TriangleAlert, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { useToast } from "@/features/reconciliation/components/Toast"
import { EmptyState, IconBtn, Pagination, PageHeader, Th, inputCls } from "../ingestion/shared"

type Special = "gdcc_ts" | "ten_gdcc" | "chuc_vu"
interface Cat { code: string; name: string; special?: Special }

const CATS: Cat[] = [
  { code: "THIET_LAP_TEN_GDCC_LOAI_TS", name: "Tên GDCC và loại tài sản", special: "gdcc_ts" },
  { code: "LOAI_GDCC", name: "Loại giao dịch công chứng" },
  { code: "TEN_GDCC", name: "Tên giao dịch công chứng", special: "ten_gdcc" },
  { code: "LOAI_TAI_SAN", name: "Loại tài sản" },
  { code: "PHUONG_THUC_CC", name: "Phương thức công chứng" },
  { code: "VAI_TRO_BEN_LQ", name: "Vai trò bên liên quan" },
  { code: "TRANG_THAI_GIAI_CHAP", name: "Trạng thái giải chấp" },
  { code: "CHUC_VU", name: "Chức vụ", special: "chuc_vu" },
  { code: "LINH_VUC_CC", name: "Lĩnh vực công chứng" },
  { code: "LOAI_TIEP_NHAN_GD", name: "Loại tiếp nhận giao dịch" },
  { code: "LOAI_TIEP_NHAN_NGAN_CHAN", name: "Loại tiếp nhận thông tin ngăn chặn/cảnh báo" },
]

const DON_VI = ["Tổ chức hành nghề công chứng", "Sở Tư pháp", "Bộ Tư pháp"]

export interface CatItem {
  code: string
  name?: string
  active: boolean
  tenGdcc?: string
  loaiTs?: string
  loaiGdcc?: string
  loaiDonVi?: string
}

const SEED: Record<string, CatItem[]> = {
  THIET_LAP_TEN_GDCC_LOAI_TS: [
    { code: "GDCC_TS_001", name: "Chuyển nhượng QSDĐ - Bất động sản", tenGdcc: "Hợp đồng chuyển nhượng quyền sử dụng đất", loaiTs: "Bất động sản", active: true },
    { code: "GDCC_TS_002", name: "Thế chấp nhà ở - Bất động sản", tenGdcc: "Hợp đồng thế chấp nhà ở", loaiTs: "Bất động sản", active: true },
    { code: "GDCC_TS_003", name: "Mua bán xe ô tô - Động sản", tenGdcc: "Hợp đồng mua bán xe", loaiTs: "Động sản", active: false },
  ],
  LOAI_GDCC: [
    { code: "HOP_DONG", name: "Hợp đồng", active: true }, { code: "GIAO_DICH", name: "Giao dịch", active: true }, { code: "DI_CHUC", name: "Di chúc", active: true },
    { code: "VAN_BAN_THOA_THUAN", name: "Văn bản thỏa thuận", active: true }, { code: "UY_QUYEN", name: "Ủy quyền", active: true }, { code: "VAN_BAN_TU_CHOI", name: "Văn bản từ chối", active: false },
  ],
  TEN_GDCC: [
    { code: "HD_CHUYEN_NHUONG_QSDD", tenGdcc: "Hợp đồng chuyển nhượng quyền sử dụng đất", loaiGdcc: "Hợp đồng", active: true },
    { code: "HD_THE_CHAP_NHA_O", tenGdcc: "Hợp đồng thế chấp nhà ở", loaiGdcc: "Hợp đồng", active: true },
    { code: "DI_CHUC_THUA_KE", tenGdcc: "Di chúc thừa kế tài sản", loaiGdcc: "Di chúc", active: true },
    { code: "UQ_DAI_DIEN", tenGdcc: "Văn bản ủy quyền đại diện", loaiGdcc: "Ủy quyền", active: true },
  ],
  LOAI_TAI_SAN: [{ code: "BAT_DONG_SAN", name: "Bất động sản", active: true }, { code: "DONG_SAN", name: "Động sản", active: true }, { code: "QUYEN_TAI_SAN", name: "Quyền tài sản", active: true }],
  PHUONG_THUC_CC: [{ code: "TRUC_TIEP", name: "Công chứng trực tiếp", active: true }, { code: "TRUC_TUYEN", name: "Công chứng trực tuyến", active: true }, { code: "NGOAI_TRU_SO", name: "Công chứng ngoài trụ sở", active: true }],
  VAI_TRO_BEN_LQ: [{ code: "BEN_CHUYEN_NHUONG", name: "Bên chuyển nhượng", active: true }, { code: "BEN_NHAN", name: "Bên nhận chuyển nhượng", active: true }, { code: "NGUOI_LAM_CHUNG", name: "Người làm chứng", active: true }, { code: "NGUOI_PHIEN_DICH", name: "Người phiên dịch", active: true }],
  TRANG_THAI_GIAI_CHAP: [{ code: "CHUA_GIAI_CHAP", name: "Chưa giải chấp", active: true }, { code: "DA_GIAI_CHAP", name: "Đã giải chấp", active: true }, { code: "GIAI_CHAP_MOT_PHAN", name: "Giải chấp một phần", active: true }],
  CHUC_VU: [
    { code: "TRUONG_VP", name: "Trưởng Văn phòng công chứng", loaiDonVi: "Tổ chức hành nghề công chứng", active: true },
    { code: "CONG_CHUNG_VIEN", name: "Công chứng viên", loaiDonVi: "Tổ chức hành nghề công chứng", active: true },
    { code: "GIAM_DOC_SO", name: "Giám đốc Sở", loaiDonVi: "Sở Tư pháp", active: true },
    { code: "CHUYEN_VIEN", name: "Chuyên viên", loaiDonVi: "Bộ Tư pháp", active: false },
  ],
  LINH_VUC_CC: [{ code: "DAT_DAI", name: "Đất đai", active: true }, { code: "NHA_O", name: "Nhà ở", active: true }, { code: "THUA_KE", name: "Thừa kế", active: true }, { code: "HON_NHAN_GD", name: "Hôn nhân gia đình", active: true }, { code: "DOANH_NGHIEP", name: "Doanh nghiệp", active: true }],
  LOAI_TIEP_NHAN_GD: [{ code: "TN_TRUC_TIEP", name: "Tiếp nhận trực tiếp", active: true }, { code: "TN_TRUC_TUYEN", name: "Tiếp nhận trực tuyến", active: true }, { code: "TN_BUU_DIEN", name: "Tiếp nhận qua bưu điện", active: false }],
  LOAI_TIEP_NHAN_NGAN_CHAN: [{ code: "TN_NGAN_CHAN", name: "Tiếp nhận thông tin ngăn chặn", active: true }, { code: "TN_GIAI_TOA", name: "Tiếp nhận giải tỏa ngăn chặn", active: true }, { code: "TN_CANH_BAO", name: "Tiếp nhận cảnh báo rủi ro", active: true }],
}

interface Filter { code: string; name: string; status: string }
const EMPTY: Filter = { code: "", name: "", status: "all" }

interface FormState { mode: "create" | "edit"; orig: string | null; item: CatItem; error?: string }

const StatusBadge = ({ active }: { active: boolean }) => (
  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold" style={active ? { background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" } : { background: "#f5f5f5", color: "#525252", border: "1px solid #e5e5e5" }}>
    {active ? "Sử dụng" : "Không sử dụng"}
  </span>
)

export function DanhMucRiengPage() {
  const showToast = useToast()
  const [store, setStore] = useState<Record<string, CatItem[]>>(SEED)
  const [catCode, setCatCode] = useState("LOAI_GDCC")
  const [draft, setDraft] = useState<Filter>(EMPTY)
  const [applied, setApplied] = useState<Filter>(EMPTY)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [form, setForm] = useState<FormState | null>(null)
  const [confirm, setConfirm] = useState<string | null>(null)

  const cat = CATS.find((c) => c.code === catCode)!
  const rows = store[catCode] ?? []
  const nameOf = (r: CatItem) => r.name ?? r.tenGdcc ?? ""

  const filtered = useMemo(() => {
    const c = applied.code.trim().toLowerCase()
    const n = applied.name.trim().toLowerCase()
    return rows.filter((r) => {
      if (c && !r.code.toLowerCase().includes(c)) return false
      if (n && !nameOf(r).toLowerCase().includes(n)) return false
      if (applied.status !== "all" && (applied.status === "used") !== r.active) return false
      return true
    })
  }, [rows, applied])

  const start = (Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize))) - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)
  const confirmItem = confirm ? rows.find((r) => r.code === confirm) ?? null : null

  const switchCat = (code: string) => { setCatCode(code); setDraft(EMPTY); setApplied(EMPTY); setPage(1) }
  const doSearch = () => { setApplied(draft); setPage(1) }
  const doReset = () => { setDraft(EMPTY); setApplied(EMPTY); setPage(1) }

  const save = () => {
    if (!form) return
    const it = form.item
    if (!it.code.trim()) { setForm({ ...form, error: "Vui lòng nhập mã" }); return }
    if (!nameOf(it).trim()) { setForm({ ...form, error: "Vui lòng nhập tên" }); return }
    if (form.mode === "create" && rows.some((r) => r.code.toLowerCase() === it.code.trim().toLowerCase())) {
      setForm({ ...form, error: "Mã đã tồn tại trong danh mục" })
      return
    }
    setStore((s) => {
      const list = [...(s[catCode] ?? [])]
      if (form.mode === "create") list.unshift({ ...it, code: it.code.trim().toUpperCase() })
      else {
        const i = list.findIndex((r) => r.code === form.orig)
        if (i >= 0) list[i] = { ...it }
      }
      return { ...s, [catCode]: list }
    })
    showToast(form.mode === "create" ? "Thêm mục danh mục thành công" : "Đã lưu mục danh mục")
    setForm(null)
  }

  const doDelete = () => {
    if (!confirm) return
    setStore((s) => ({ ...s, [catCode]: (s[catCode] ?? []).filter((r) => r.code !== confirm) }))
    setConfirm(null)
    showToast("Đã xóa mục danh mục")
  }

  const newItem = (): CatItem => {
    if (cat.special === "gdcc_ts") return { code: "", name: "", tenGdcc: "", loaiTs: "Bất động sản", active: true }
    if (cat.special === "ten_gdcc") return { code: "", tenGdcc: "", loaiGdcc: "Hợp đồng", active: true }
    if (cat.special === "chuc_vu") return { code: "", name: "", loaiDonVi: DON_VI[0], active: true }
    return { code: "", name: "", active: true }
  }

  return (
    <div>
      <PageHeader
        title={cat.name}
        desc="Danh mục riêng của hệ thống công chứng — quản trị viên có thể thêm, sửa, xóa."
        actions={
          <>
            <Button variant="outline" onClick={() => showToast("Đang kết xuất danh mục…")}>
              <Download className="size-4" />
              Xuất danh sách
            </Button>
            <Button onClick={() => setForm({ mode: "create", orig: null, item: newItem() })}>
              <Plus className="size-4" />
              Thêm mục
            </Button>
          </>
        }
      />

      <div className="flex gap-4">
        <div className="w-[280px] flex-none overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
          <div className="border-b border-border px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">Danh mục ({CATS.length})</div>
          <div className="max-h-[560px] overflow-auto p-2">
            {CATS.map((c) => (
              <button key={c.code} onClick={() => switchCat(c.code)} className={cn("mb-0.5 block w-full rounded-md px-3 py-2 text-left text-[13px] leading-snug", c.code === catCode ? "bg-neutral-900 font-semibold text-white" : "text-foreground hover:bg-surface-muted")}>
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
            <div className="flex flex-wrap items-end gap-4">
              <div className="w-[200px]">
                <label className="mb-1.5 block text-xs font-semibold text-foreground-strong">Mã</label>
                <input value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} placeholder="Nhập mã…" className={cn(inputCls, "font-mono text-[13px]")} />
              </div>
              <div className="min-w-[220px] flex-1">
                <label className="mb-1.5 block text-xs font-semibold text-foreground-strong">Tên</label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
                  <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} placeholder="Nhập tên…" className={cn(inputCls, "pl-9")} />
                </div>
              </div>
              <div className="w-[190px]">
                <label className="mb-1.5 block text-xs font-semibold text-foreground-strong">Tình trạng</label>
                <NativeSelect value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
                  <option value="all">Tất cả</option>
                  <option value="used">Sử dụng</option>
                  <option value="unused">Không sử dụng</option>
                </NativeSelect>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={doReset}>Đặt lại</Button>
                <Button onClick={doSearch}><Search className="size-4" />Tìm kiếm</Button>
              </div>
            </div>
          </div>

          <div className="mx-0.5 mb-2.5 mt-[18px] flex items-center gap-2">
            <span className="text-[13px] text-foreground-muted">Kết quả:</span>
            <span className="text-[13px] font-semibold text-foreground-strong">{filtered.length} mục</span>
          </div>

          <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
            {filtered.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-border bg-neutral-50">
                        <Th className="w-[52px] text-center">STT</Th>
                        <Th className="min-w-[180px]">Mã</Th>
                        <Th className="min-w-[240px]">{cat.special === "ten_gdcc" ? "Tên giao dịch công chứng" : "Tên"}</Th>
                        {cat.special === "gdcc_ts" && <Th className="min-w-[220px]">Tên GDCC</Th>}
                        {cat.special === "gdcc_ts" && <Th>Loại tài sản</Th>}
                        {cat.special === "ten_gdcc" && <Th>Loại GDCC</Th>}
                        {cat.special === "chuc_vu" && <Th className="min-w-[200px]">Loại đơn vị</Th>}
                        <Th>Tình trạng</Th>
                        <Th className="w-[100px] text-center">Thao tác</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {paged.map((r, i) => (
                        <tr key={r.code} className="border-b border-neutral-100 hover:bg-neutral-50">
                          <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{start + i + 1}</td>
                          <td className="px-4 py-3 font-mono text-[12.5px] text-foreground">{r.code}</td>
                          <td className="px-4 py-3 font-medium text-foreground">{nameOf(r)}</td>
                          {cat.special === "gdcc_ts" && <td className="px-4 py-3 text-[13px] text-foreground-muted">{r.tenGdcc}</td>}
                          {cat.special === "gdcc_ts" && <td className="px-4 py-3 text-foreground-muted">{r.loaiTs}</td>}
                          {cat.special === "ten_gdcc" && <td className="px-4 py-3 text-foreground-muted">{r.loaiGdcc}</td>}
                          {cat.special === "chuc_vu" && <td className="px-4 py-3 text-[13px] text-foreground-muted">{r.loaiDonVi}</td>}
                          <td className="px-4 py-3"><StatusBadge active={r.active} /></td>
                          <td className="px-4 py-3 text-center">
                            <div className="inline-flex gap-0.5">
                              <IconBtn title="Sửa" onClick={() => setForm({ mode: "edit", orig: r.code, item: { ...r } })}><Pencil className="size-[15px]" /></IconBtn>
                              <IconBtn title="Xóa" danger onClick={() => setConfirm(r.code)}><Trash2 className="size-[14px]" /></IconBtn>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination page={page} pageSize={pageSize} total={filtered.length} unit="mục" onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
              </>
            ) : (
              <EmptyState icon={<FileText className="size-6" />} title="Không tìm thấy dữ liệu" desc="Không có mục nào khớp với bộ lọc hiện tại." actionLabel="Đặt lại bộ lọc" onAction={doReset} />
            )}
          </div>
        </div>
      </div>

      {form && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={() => setForm(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-[600px] max-w-full overflow-hidden rounded-xl bg-surface shadow-popover">
            <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
              <div>
                <div className="text-[17px] font-semibold text-foreground-strong">{form.mode === "create" ? "Thêm mục danh mục" : "Chỉnh sửa mục danh mục"}</div>
                <div className="mt-0.5 text-[12.5px] text-foreground-muted">{cat.name}</div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setForm(null)}><X className="size-[18px]" /></Button>
            </div>
            <div className="flex flex-col gap-4 px-6 py-5">
              <Field label="Mã" req>
                <input value={form.item.code} disabled={form.mode === "edit"} onChange={(e) => setForm({ ...form, item: { ...form.item, code: e.target.value }, error: undefined })} className={cn(inputCls, "h-[38px] font-mono text-[13px]", form.mode === "edit" && "bg-surface-muted text-foreground-muted")} />
              </Field>
              {cat.special === "ten_gdcc" ? (
                <>
                  <Field label="Tên giao dịch công chứng" req>
                    <input value={form.item.tenGdcc ?? ""} onChange={(e) => setForm({ ...form, item: { ...form.item, tenGdcc: e.target.value }, error: undefined })} className={cn(inputCls, "h-[38px]")} />
                  </Field>
                  <Field label="Loại GDCC">
                    <NativeSelect className="h-[38px]" value={form.item.loaiGdcc} onChange={(e) => setForm({ ...form, item: { ...form.item, loaiGdcc: e.target.value } })}>
                      {(SEED.LOAI_GDCC ?? []).map((o) => (
                        <option key={o.code} value={o.name}>{o.name}</option>
                      ))}
                    </NativeSelect>
                  </Field>
                </>
              ) : (
                <Field label="Tên" req>
                  <input value={form.item.name ?? ""} onChange={(e) => setForm({ ...form, item: { ...form.item, name: e.target.value }, error: undefined })} className={cn(inputCls, "h-[38px]")} />
                </Field>
              )}
              {cat.special === "gdcc_ts" && (
                <>
                  <Field label="Tên GDCC">
                    <NativeSelect className="h-[38px]" value={form.item.tenGdcc} onChange={(e) => setForm({ ...form, item: { ...form.item, tenGdcc: e.target.value } })}>
                      {(SEED.TEN_GDCC ?? []).map((o) => (
                        <option key={o.code} value={o.tenGdcc}>{o.tenGdcc}</option>
                      ))}
                    </NativeSelect>
                  </Field>
                  <Field label="Loại tài sản">
                    <NativeSelect className="h-[38px]" value={form.item.loaiTs} onChange={(e) => setForm({ ...form, item: { ...form.item, loaiTs: e.target.value } })}>
                      {(SEED.LOAI_TAI_SAN ?? []).map((o) => (
                        <option key={o.code} value={o.name}>{o.name}</option>
                      ))}
                    </NativeSelect>
                  </Field>
                </>
              )}
              {cat.special === "chuc_vu" && (
                <Field label="Loại đơn vị">
                  <NativeSelect className="h-[38px]" value={form.item.loaiDonVi} onChange={(e) => setForm({ ...form, item: { ...form.item, loaiDonVi: e.target.value } })}>
                    {DON_VI.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </NativeSelect>
                </Field>
              )}
              <Field label="Tình trạng sử dụng">
                <NativeSelect className="h-[38px]" value={form.item.active ? "used" : "unused"} onChange={(e) => setForm({ ...form, item: { ...form.item, active: e.target.value === "used" } })}>
                  <option value="used">Sử dụng</option>
                  <option value="unused">Không sử dụng</option>
                </NativeSelect>
              </Field>
              {form.error && <span className="text-[12px] text-red-600">{form.error}</span>}
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
                <div className="text-[17px] font-semibold text-foreground-strong">Xác nhận xóa mục</div>
              </div>
              <p className="text-[13.5px] leading-relaxed text-foreground-muted">
                Mục "<span className="font-semibold text-foreground-strong">{confirmItem.name ?? confirmItem.tenGdcc}</span>" sẽ bị xóa khỏi danh mục. Thao tác này không thể hoàn tác.
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t border-border bg-neutral-50 px-6 py-3.5">
              <Button variant="outline" onClick={() => setConfirm(null)}>Hủy bỏ</Button>
              <button onClick={doDelete} className="h-9 rounded-md border border-red-600 bg-red-600 px-4 text-sm font-medium text-white shadow-xs hover:bg-[#b91c1c]">Xóa mục</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, req, children }: { label: string; req?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12.5px] font-semibold text-foreground-strong">
        {label} {req && <span className="text-red-600">*</span>}
      </label>
      {children}
    </div>
  )
}
