import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronDown, Eye, FileSearch, History, Printer, RotateCcw, Search, SlidersHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { useToast } from "@/features/reconciliation/components/Toast"
import { EmptyState, IconBtn, Pagination, PageHeader, Th, inputCls } from "../ingestion/shared"
import { AccessLogModal, ParticipantDetailModal } from "./dialogs"
import {
  BEN_LIEN_QUAN, CCV_OPTIONS, EMPTY_FILTER, PARTICIPANTS, PART_ROLES, PROVINCES, TCHNCC_OPTIONS,
  hasCriteria, isBoLevel, isValidCccd, isValidMst, nearestLabel, scopePool, searchParticipants,
  type PartFilter, type Participant, type PartRole,
} from "./config"

export function ParticipantSearchPage() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [role, setRole] = useState<PartRole>("cv_stp")
  const isBo = isBoLevel(role)
  const [filter, setFilter] = useState<PartFilter>(EMPTY_FILTER)
  const [advanced, setAdvanced] = useState(false)
  const [error, setError] = useState("")
  const [searched, setSearched] = useState(false)
  const [results, setResults] = useState<Participant[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [detail, setDetail] = useState<Participant | null>(null)
  const [access, setAccess] = useState<Participant | null>(null)

  const pool = useMemo(() => scopePool(PARTICIPANTS, role), [role])

  const set = (patch: Partial<PartFilter>) => { setFilter((f) => ({ ...f, ...patch })); if (error) setError("") }
  const changeRole = (r: PartRole) => { setRole(r); setFilter(EMPTY_FILTER); setSearched(false); setResults([]); setError("") }

  const doSearch = () => {
    // VR-01
    if (!hasCriteria(filter)) return setError("Vui lòng nhập ít nhất một điều kiện tra cứu (Số CCCD/CMND/Hộ chiếu, MST, Họ tên người tham gia/Tên tổ chức hoặc Số công chứng).")
    // VR-04
    if (filter.cccd.trim() && !isValidCccd(filter.cccd.trim())) return setError("Số CCCD/CMND/Hộ chiếu không đúng định dạng (CCCD: 12 chữ số; CMND: 9 chữ số; Hộ chiếu: 6-9 ký tự chữ và số).")
    // VR-05
    if (filter.mst.trim() && !isValidMst(filter.mst.trim())) return setError("Mã số thuế không đúng định dạng (10 chữ số hoặc 10 chữ số-3 chữ số).")
    // VR-02
    if (filter.tuNgay && filter.denNgay && filter.tuNgay > filter.denNgay) return setError("Ngày công chứng từ ngày không được lớn hơn đến ngày.")
    setError("")
    const res = searchParticipants(pool, filter, isBo)
    setResults(res); setSearched(true); setPage(1)
    if (!res.length) showToast("Không tìm thấy kết quả phù hợp với điều kiện tra cứu.", "error")
  }
  const doReset = () => { setFilter(EMPTY_FILTER); setAdvanced(false); setError(""); setSearched(false); setResults([]); setPage(1) }
  const doPrint = () => {
    if (!searched || !results.length) return showToast("Không có dữ liệu để in. Vui lòng thực hiện tra cứu trước khi in kết quả.", "error")
    showToast("Đang chuẩn bị bản in danh sách kết quả tra cứu…")
  }

  const start = (Math.min(page, Math.max(1, Math.ceil(results.length / pageSize))) - 1) * pageSize
  const paged = results.slice(start, start + pageSize)

  return (
    <div>
      <PageHeader
        title="Tra cứu thông tin bên tham gia giao dịch công chứng"
        desc="Tra cứu, xem danh sách và chi tiết bên tham gia giao dịch công chứng theo phạm vi phân quyền dữ liệu."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] text-foreground-muted">Vai trò:</span>
            <NativeSelect value={role} onChange={(e) => changeRole(e.target.value as PartRole)} className="h-8 w-[230px] text-[12.5px]">
              {PART_ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </NativeSelect>
          </div>
        }
      />

      {/* ĐIỀU KIỆN TRA CỨU */}
      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="mb-3 text-[13px] font-semibold text-foreground-strong">Điều kiện tra cứu</div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isBo && (
            <>
              <F label="Phạm vi tra cứu"><NativeSelect value={filter.phamVi} onChange={(e) => set({ phamVi: e.target.value as PartFilter["phamVi"], tinh: "all" })}><option value="national">Toàn quốc</option><option value="province">Tỉnh/Thành phố</option></NativeSelect></F>
              {filter.phamVi === "province" && <F label="Tỉnh/Thành phố"><NativeSelect value={filter.tinh} onChange={(e) => set({ tinh: e.target.value })}><option value="all">Tất cả</option>{PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}</NativeSelect></F>}
            </>
          )}
          <F label="Loại bên tham gia"><NativeSelect value={filter.loai} onChange={(e) => set({ loai: e.target.value as PartFilter["loai"] })}><option value="all">Tất cả</option><option value="Cá nhân">Cá nhân</option><option value="Tổ chức">Tổ chức</option></NativeSelect></F>
          {filter.loai !== "Tổ chức" && <F label="Số CCCD/CMND/Hộ chiếu"><input value={filter.cccd} onChange={(e) => set({ cccd: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} className={inputCls} placeholder="VD: 001234567890" /></F>}
          {filter.loai !== "Cá nhân" && <F label="MST tổ chức"><input value={filter.mst} onChange={(e) => set({ mst: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} className={inputCls} placeholder="VD: 0101234567" /></F>}
          <F label="Họ tên người tham gia/Tên tổ chức"><input value={filter.hoTen} onChange={(e) => set({ hoTen: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} className={inputCls} /></F>
          <F label="Số công chứng"><input value={filter.soCC} onChange={(e) => set({ soCC: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} className={inputCls} /></F>
          <F label="Bên liên quan"><NativeSelect value={filter.benLienQuan} onChange={(e) => set({ benLienQuan: e.target.value })}><option value="all">Tất cả</option>{BEN_LIEN_QUAN.map((b) => <option key={b} value={b}>{b}</option>)}</NativeSelect></F>
        </div>

        <button onClick={() => setAdvanced((a) => !a)} className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-link hover:underline"><SlidersHorizontal className="size-3.5" />Bộ lọc nâng cao<ChevronDown className={cn("size-3.5 transition-transform", advanced && "rotate-180")} /></button>
        {advanced && (
          <div className="mt-3 grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-4">
            <F label="Công chứng viên"><NativeSelect value={filter.ccv} onChange={(e) => set({ ccv: e.target.value })}><option value="all">Tất cả</option>{CCV_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}</NativeSelect></F>
            <F label="Tổ chức hành nghề công chứng"><NativeSelect value={filter.tchncc} onChange={(e) => set({ tchncc: e.target.value })}><option value="all">Tất cả</option>{TCHNCC_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}</NativeSelect></F>
            <F label="Ngày công chứng — Từ"><input type="date" value={filter.tuNgay} onChange={(e) => set({ tuNgay: e.target.value })} className={cn(inputCls, "text-[13.5px]")} /></F>
            <F label="Ngày công chứng — Đến"><input type="date" value={filter.denNgay} onChange={(e) => set({ denNgay: e.target.value })} className={cn(inputCls, "text-[13.5px]")} /></F>
          </div>
        )}

        {error && <div className="mt-3 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]">{error}</div>}
        <div className="mt-4 flex flex-wrap gap-2.5">
          <Button onClick={doSearch}><Search className="size-4" />Tìm kiếm</Button>
          <Button variant="outline" onClick={doReset}><RotateCcw className="size-4" />Đặt lại</Button>
          <Button variant="outline" onClick={() => navigate("/exploit/participant-lookup/history")}><History className="size-4" />Xem lịch sử</Button>
          <Button variant="outline" onClick={doPrint}><Printer className="size-4" />In kết quả</Button>
        </div>
      </div>

      {/* KẾT QUẢ */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-[13px] font-semibold text-foreground-strong">Danh sách kết quả tra cứu{searched && <span className="ml-2 font-normal text-foreground-muted">— Tìm thấy {results.length} kết quả</span>}</div>
      </div>

      <div className="mt-2 overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        {!searched ? (
          <EmptyState icon={<Search className="size-6" />} title="Chưa có kết quả tra cứu" desc="Nhập ít nhất một điều kiện và nhấn “Tìm kiếm” để hiển thị danh sách bên tham gia giao dịch công chứng." />
        ) : results.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1040px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-neutral-50">
                    <Th className="w-11 text-center">STT</Th>
                    <Th className="min-w-[100px]">Cá nhân/Tổ chức</Th>
                    <Th className="min-w-[190px]">Họ tên/Tên tổ chức</Th>
                    <Th className="min-w-[140px]">CCCD/CMND · MST</Th>
                    <Th className="min-w-[240px]">Địa chỉ</Th>
                    <Th className="min-w-[240px]">Giao dịch CC liên quan</Th>
                    <Th className="w-[100px] text-center">Thao tác</Th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((r, i) => (
                    <tr key={r.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{start + i + 1}</td>
                      <td className="px-4 py-3 text-[13px] text-foreground-muted">{r.loai}</td>
                      <td className="px-4 py-3 text-[13px] font-medium text-foreground">{r.hoTen}</td>
                      <td className="px-4 py-3 font-mono text-[12.5px] text-foreground">{r.soGiayTo}</td>
                      <td className="px-4 py-3 text-[13px] leading-snug text-foreground-muted">{r.diaChi}</td>
                      <td className="px-4 py-3 text-[12.5px] leading-snug text-foreground-muted">{nearestLabel(r)}</td>
                      <td className="px-4 py-3"><div className="flex justify-center"><IconBtn title="Xem chi tiết" onClick={() => setDetail(r)}><Eye className="size-4" /></IconBtn></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={pageSize} total={results.length} unit="bản ghi" onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
          </>
        ) : (
          <EmptyState icon={<FileSearch className="size-6" />} title="Không tìm thấy kết quả phù hợp" desc="Không có bên tham gia nào khớp với điều kiện tra cứu. Vui lòng điều chỉnh điều kiện." actionLabel="Đặt lại" onAction={doReset} />
        )}
      </div>

      {detail && <ParticipantDetailModal rec={detail} role={role} onAccessLog={() => setAccess(detail)} onClose={() => setDetail(null)} />}
      {access && <AccessLogModal rec={access} onClose={() => setAccess(null)} />}
    </div>
  )
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">{label}</label>{children}</div>
}
