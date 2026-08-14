import { useMemo, useState } from "react"
import { Download, FileText, History, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { useToast } from "@/features/reconciliation/components/Toast"
import { EmptyState, Pagination, PageHeader, Th, inputCls } from "../ingestion/shared"

interface Cat { code: string; name: string; dbhc?: boolean }

const CATS: Cat[] = [
  { code: "TRANG_THAI_TCHNCC", name: "Trạng thái tổ chức hành nghề công chứng" },
  { code: "TRANG_THAI_CCV", name: "Trạng thái công chứng viên" },
  { code: "LOAI_GIAY_TO_TUY_THAN", name: "Loại giấy tờ tùy thân" },
  { code: "GIOI_TINH", name: "Giới tính" },
  { code: "DAN_TOC", name: "Dân tộc" },
  { code: "QUOC_TICH", name: "Quốc tịch" },
  { code: "GIAY_TO_PHAP_NHAN", name: "Giấy tờ pháp nhân" },
  { code: "LOAI_DAT", name: "Loại đất" },
  { code: "DIA_BAN_HANH_CHINH", name: "Địa bàn hành chính", dbhc: true },
  { code: "LOAI_TAI_SAN_GAN_LIEN_DAT", name: "Loại tài sản gắn liền với đất" },
  { code: "HINH_THUC_TCHNCC", name: "Hình thức tổ chức hành nghề công chứng" },
  { code: "TRANG_THAI_THE_CCV", name: "Trạng thái thẻ công chứng viên" },
  { code: "TRANG_THAI_NGAN_CHAN", name: "Trạng thái ngăn chặn" },
]

type Item = [string, string, number]
const DATA: Record<string, Item[]> = {
  TRANG_THAI_TCHNCC: [["TT_HOAT_DONG", "Đang hoạt động", 1], ["TT_TAM_NGUNG", "Tạm ngừng hoạt động", 1], ["TT_GIAI_THE", "Đã giải thể", 1], ["TT_CHUYEN_DOI", "Đang chuyển đổi", 0]],
  TRANG_THAI_CCV: [["CCV_HANH_NGHE", "Đang hành nghề", 1], ["CCV_TAM_DINH_CHI", "Tạm đình chỉ hành nghề", 1], ["CCV_MIEN_NHIEM", "Đã miễn nhiệm", 1], ["CCV_CHO_BO_NHIEM", "Chờ bổ nhiệm", 0]],
  LOAI_GIAY_TO_TUY_THAN: [["CCCD", "Căn cước công dân", 1], ["CMND", "Chứng minh nhân dân", 1], ["HO_CHIEU", "Hộ chiếu", 1], ["GIAY_KHAI_SINH", "Giấy khai sinh", 1], ["GIAY_XN_CU_TRU", "Giấy xác nhận cư trú", 1]],
  GIOI_TINH: [["NAM", "Nam", 1], ["NU", "Nữ", 1], ["KHAC", "Khác", 1]],
  DAN_TOC: [["KINH", "Kinh", 1], ["TAY", "Tày", 1], ["THAI", "Thái", 1], ["MUONG", "Mường", 1], ["KHMER", "Khmer", 1], ["HOA", "Hoa", 1], ["NUNG", "Nùng", 1], ["HMONG", "H'Mông", 1]],
  QUOC_TICH: [["VN", "Việt Nam", 1], ["US", "Hoa Kỳ", 1], ["JP", "Nhật Bản", 1], ["KR", "Hàn Quốc", 1], ["CN", "Trung Quốc", 1], ["FR", "Pháp", 1], ["AU", "Úc", 1]],
  GIAY_TO_PHAP_NHAN: [["GCN_DKDN", "Giấy chứng nhận đăng ký doanh nghiệp", 1], ["QD_THANH_LAP", "Quyết định thành lập", 1], ["GP_HOAT_DONG", "Giấy phép hoạt động", 1], ["GCN_DKHTX", "Giấy chứng nhận đăng ký hợp tác xã", 1]],
  LOAI_DAT: [["ONT", "Đất ở tại nông thôn", 1], ["ODT", "Đất ở tại đô thị", 1], ["LUC", "Đất chuyên trồng lúa nước", 1], ["CLN", "Đất trồng cây lâu năm", 1], ["RSX", "Đất rừng sản xuất", 1], ["TMD", "Đất thương mại, dịch vụ", 1]],
  LOAI_TAI_SAN_GAN_LIEN_DAT: [["NHA_O", "Nhà ở", 1], ["CT_XD", "Công trình xây dựng", 1], ["CAY_LN", "Cây lâu năm", 1], ["RUNG_SX", "Rừng sản xuất là rừng trồng", 1]],
  HINH_THUC_TCHNCC: [["PHONG_CC", "Phòng công chứng", 1], ["VP_CC", "Văn phòng công chứng", 1]],
  TRANG_THAI_THE_CCV: [["THE_HIEU_LUC", "Còn hiệu lực", 1], ["THE_HET_HL", "Hết hiệu lực", 1], ["THE_THU_HOI", "Đã thu hồi", 1], ["THE_CHO_CAP", "Chờ cấp", 0]],
  TRANG_THAI_NGAN_CHAN: [["NC_DANG", "Đang ngăn chặn", 1], ["NC_GIAI_TOA", "Đã giải tỏa ngăn chặn", 1], ["NC_CANH_BAO", "Cảnh báo rủi ro", 1]],
}

// [code, name, level, active, parentCode, parentName]
type DbhcRow = [string, string, string, number, string | null, string | null]
const DBHC_NEW: DbhcRow[] = [
  ["01", "Thành phố Hà Nội", "Tỉnh/TP", 1, null, null], ["0101", "Phường Hoàn Kiếm", "Phường/Xã", 1, "01", "Thành phố Hà Nội"], ["0102", "Phường Cửa Nam", "Phường/Xã", 1, "01", "Thành phố Hà Nội"], ["0103", "Phường Ba Đình", "Phường/Xã", 1, "01", "Thành phố Hà Nội"],
  ["79", "Thành phố Hồ Chí Minh", "Tỉnh/TP", 1, null, null], ["7901", "Phường Bến Thành", "Phường/Xã", 1, "79", "Thành phố Hồ Chí Minh"], ["7902", "Phường Sài Gòn", "Phường/Xã", 1, "79", "Thành phố Hồ Chí Minh"],
  ["48", "Thành phố Đà Nẵng", "Tỉnh/TP", 1, null, null], ["4801", "Phường Hải Châu", "Phường/Xã", 1, "48", "Thành phố Đà Nẵng"],
]
const DBHC_OLD: DbhcRow[] = [
  ["02", "Tỉnh Hà Tây", "Tỉnh/TP", 0, null, null], ["0201", "Huyện Từ Liêm", "Quận/Huyện", 0, "02", "Tỉnh Hà Tây"], ["020101", "Xã Minh Khai", "Phường/Xã", 0, "0201", "Huyện Từ Liêm"],
  ["0202", "Thị xã Hà Đông", "Quận/Huyện", 0, "02", "Tỉnh Hà Tây"], ["020201", "Phường Nguyễn Trãi", "Phường/Xã", 0, "0202", "Thị xã Hà Đông"],
  ["03", "Tỉnh Vĩnh Phú", "Tỉnh/TP", 0, null, null], ["0301", "Huyện Lập Thạch", "Quận/Huyện", 0, "03", "Tỉnh Vĩnh Phú"],
]

interface Filter { code: string; name: string; status: string }
const EMPTY: Filter = { code: "", name: "", status: "all" }

const StatusBadge = ({ active }: { active: boolean }) => (
  <span
    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
    style={active ? { background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" } : { background: "#f5f5f5", color: "#525252", border: "1px solid #e5e5e5" }}
  >
    {active ? "Sử dụng" : "Không sử dụng"}
  </span>
)

export function DanhMucDungChungPage() {
  const showToast = useToast()
  const [catCode, setCatCode] = useState("GIOI_TINH")
  const [draft, setDraft] = useState<Filter>(EMPTY)
  const [applied, setApplied] = useState<Filter>(EMPTY)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [dbhcTab, setDbhcTab] = useState<"new" | "old">("new")

  const cat = CATS.find((c) => c.code === catCode)!
  const isDBHC = !!cat.dbhc

  const rows = useMemo(() => {
    if (isDBHC) {
      const src = dbhcTab === "new" ? DBHC_NEW : DBHC_OLD
      return src.map((r) => ({ code: r[0], name: r[1], level: r[2], active: r[3] === 1, parent: r[5] }))
    }
    return (DATA[catCode] ?? []).map((r) => ({ code: r[0], name: r[1], level: "", active: r[2] === 1, parent: null as string | null }))
  }, [catCode, isDBHC, dbhcTab])

  const filtered = useMemo(() => {
    const c = applied.code.trim().toLowerCase()
    const n = applied.name.trim().toLowerCase()
    return rows.filter((r) => {
      if (c && !r.code.toLowerCase().includes(c)) return false
      if (n && !r.name.toLowerCase().includes(n)) return false
      if (applied.status !== "all" && (applied.status === "used") !== r.active) return false
      return true
    })
  }, [rows, applied])

  const start = (Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize))) - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)

  const switchCat = (code: string) => {
    setCatCode(code)
    setDraft(EMPTY)
    setApplied(EMPTY)
    setPage(1)
    setDbhcTab("new")
  }
  const doSearch = () => { setApplied(draft); setPage(1) }
  const doReset = () => { setDraft(EMPTY); setApplied(EMPTY); setPage(1) }

  return (
    <div>
      <PageHeader
        title={cat.name}
        desc="Danh mục dùng chung toàn hệ thống — đồng bộ từ nguồn quản lý nhà nước, chỉ đọc."
        actions={
          <>
            <Button variant="outline" onClick={() => showToast("Mở lịch sử thay đổi danh mục (demo).")}>
              <History className="size-4" />
              Lịch sử thay đổi
            </Button>
            <Button variant="outline" onClick={() => showToast("Đang kết xuất danh mục…")}>
              <Download className="size-4" />
              Xuất danh sách
            </Button>
          </>
        }
      />

      <div className="flex gap-4">
        {/* Catalog list */}
        <div className="w-[280px] flex-none overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
          <div className="border-b border-border px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">Danh mục ({CATS.length})</div>
          <div className="max-h-[560px] overflow-auto p-2">
            {CATS.map((c) => (
              <button
                key={c.code}
                onClick={() => switchCat(c.code)}
                className={cn("mb-0.5 block w-full rounded-md px-3 py-2 text-left text-[13px] leading-snug", c.code === catCode ? "bg-neutral-900 font-semibold text-white" : "text-foreground hover:bg-surface-muted")}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {isDBHC && (
            <div className="mb-3 flex gap-1 rounded-md border border-border bg-surface-muted p-[3px]">
              {([["new", "Địa bàn hiện hành"], ["old", "Địa bàn cũ (lịch sử)"]] as const).map(([k, l]) => (
                <button key={k} onClick={() => setDbhcTab(k)} className={cn("rounded-md px-3 py-[5px] text-[12.5px] font-medium", dbhcTab === k ? "bg-surface text-foreground-strong shadow-xs" : "text-foreground-muted")}>
                  {l}
                </button>
              ))}
            </div>
          )}

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
                        <Th className="min-w-[160px]">Mã</Th>
                        <Th className="min-w-[240px]">Tên</Th>
                        {isDBHC && <Th>Cấp hành chính</Th>}
                        {isDBHC && <Th className="min-w-[180px]">Thuộc</Th>}
                        <Th>Tình trạng</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {paged.map((r, i) => (
                        <tr key={r.code} className="border-b border-neutral-100 hover:bg-neutral-50">
                          <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{start + i + 1}</td>
                          <td className="px-4 py-3 font-mono text-[12.5px] text-foreground">{r.code}</td>
                          <td className="px-4 py-3 font-medium text-foreground">{r.name}</td>
                          {isDBHC && <td className="px-4 py-3 text-foreground-muted">{r.level}</td>}
                          {isDBHC && <td className="px-4 py-3 text-[13px] text-foreground-muted">{r.parent ?? "—"}</td>}
                          <td className="px-4 py-3"><StatusBadge active={r.active} /></td>
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
    </div>
  )
}
