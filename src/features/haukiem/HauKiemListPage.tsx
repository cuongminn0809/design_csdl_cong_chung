import { useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { ArrowLeft, Eye, FileSearch, RotateCcw, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { MultiSelect } from "@/features/reconciliation/components/MultiSelect"
import { useToast } from "@/features/reconciliation/components/Toast"
import { EmptyState, Pagination, StatusPill, Th, inputCls } from "../ingestion/shared"
import {
  ALL_CRITERIA, CCV_OPTIONS, CRITERION_LABEL, GD_STATUSES, GD_STATUS_META, HK_TXNS,
  expandCriteria, filterByPeriod, groupByCode, searchTxns,
  type ListFilter,
} from "./config"

const MAXLEN = 255

export function HauKiemListPage() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [params] = useSearchParams()

  const criteriaParam = params.get("criteria") ?? ""
  const year = Number(params.get("year")) || new Date().getFullYear()
  const months = (params.get("months") ?? "").split(",").filter(Boolean).map(Number)
  // Tiêu chí ban đầu (F06 mặc định) — mở rộng mã nhóm G* thành các mã con.
  const initialCriteria = useMemo(() => expandCriteria([criteriaParam]), [criteriaParam])
  const criteriaTitle = groupByCode(criteriaParam)?.label ?? CRITERION_LABEL[criteriaParam] ?? "Tất cả tiêu chí"

  const period = useMemo(() => filterByPeriod(HK_TXNS, { year, months }), [year, months])

  const emptyFilter = (): ListFilter => ({ soCC: "", tenGD: "", ccvText: "", trangThai: "all", ccvChon: [], tieuChi: initialCriteria })
  const [filter, setFilter] = useState<ListFilter>(emptyFilter)
  const [applied, setApplied] = useState<ListFilter>(emptyFilter)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const rows = useMemo(() => searchTxns(period, applied), [period, applied])
  const start = (Math.min(page, Math.max(1, Math.ceil(rows.length / pageSize))) - 1) * pageSize
  const paged = rows.slice(start, start + pageSize)

  const set = (patch: Partial<ListFilter>) => { setFilter((f) => ({ ...f, ...patch })); if (error) setError("") }

  const doSearch = () => {
    // VR-02
    if ([filter.soCC, filter.tenGD, filter.ccvText].some((v) => v.trim().length > MAXLEN)) return setError("Nội dung tìm kiếm không được vượt quá 255 ký tự.")
    setError(""); setApplied(filter); setPage(1)
  }
  const doReset = () => { const e = emptyFilter(); setFilter(e); setApplied(e); setError(""); setPage(1) }

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="flex size-9 items-center justify-center rounded-md border border-border bg-surface text-foreground-muted shadow-xs hover:bg-surface-muted"><ArrowLeft className="size-4" /></button>
        <div>
          <h3 className="text-[22px] font-semibold leading-tight tracking-[-0.02em] text-foreground-strong">Danh sách giao dịch công chứng theo tiêu chí hậu kiểm</h3>
          <p className="mt-1 text-[13px] text-foreground-muted">Tiêu chí: <span className="font-medium text-foreground">{criteriaTitle}</span> — Năm {year}{months.length ? ` · Tháng ${months.join(", ")}` : " · Tất cả tháng"}</p>
        </div>
      </div>

      {/* BỘ LỌC */}
      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <F label="Số công chứng"><input value={filter.soCC} onChange={(e) => set({ soCC: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} className={inputCls} placeholder="VD: CC-2026-001" /></F>
          <F label="Tên giao dịch"><input value={filter.tenGD} onChange={(e) => set({ tenGD: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} className={inputCls} /></F>
          <F label="Công chứng viên"><input value={filter.ccvText} onChange={(e) => set({ ccvText: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} className={inputCls} /></F>
          <F label="Trạng thái giao dịch"><NativeSelect value={filter.trangThai} onChange={(e) => set({ trangThai: e.target.value })}><option value="all">Tất cả</option>{GD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</NativeSelect></F>
          <MultiSelect label="Công chứng viên thực hiện" options={CCV_OPTIONS.map((c) => ({ value: c, label: c }))} selected={filter.ccvChon} onChange={(v) => set({ ccvChon: v })} emptyLabel="Tất cả CCV" itemLabel={(n) => `${n} CCV đã chọn`} />
          <MultiSelect label="Tiêu chí vi phạm" options={ALL_CRITERIA.map((c) => ({ value: c.code, label: c.label }))} selected={filter.tieuChi} onChange={(v) => set({ tieuChi: v })} emptyLabel="Tất cả tiêu chí" itemLabel={(n) => `${n} tiêu chí đã chọn`} />
        </div>
        {error && <div className="mt-3 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]">{error}</div>}
        <div className="mt-4 flex flex-wrap gap-2.5">
          <Button onClick={doSearch}><Search className="size-4" />Tìm kiếm</Button>
          <Button variant="outline" onClick={doReset}><RotateCcw className="size-4" />Đặt lại</Button>
          <Button variant="outline" onClick={() => navigate("/khai-thac-thong-tin/hau-kiem-du-lieu")}><ArrowLeft className="size-4" />Quay lại</Button>
        </div>
      </div>

      {/* KẾT QUẢ */}
      <div className="mt-4 overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        {rows.length ? (
          <>
            <div className="border-b border-border px-5 py-3 text-[13px] text-foreground-muted">Tổng cộng: Tìm thấy <span className="font-semibold text-foreground-strong">{rows.length}</span> kết quả</div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1180px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-neutral-50">
                    <Th className="w-11 text-center">STT</Th>
                    <Th className="min-w-[130px]">Số công chứng</Th>
                    <Th className="min-w-[150px]">Tên giao dịch</Th>
                    <Th className="min-w-[130px]">Bên liên quan</Th>
                    <Th className="min-w-[170px]">Tài sản giao dịch</Th>
                    <Th className="min-w-[150px]">Tổ chức HNCC thực hiện</Th>
                    <Th className="min-w-[120px]">Công chứng viên</Th>
                    <Th className="min-w-[110px]">Trạng thái</Th>
                    <Th className="w-[110px] text-center">Thao tác</Th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((r, i) => (
                    <tr key={r.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{start + i + 1}</td>
                      <td className="px-4 py-3 font-mono text-[12.5px] font-semibold text-link">{r.soCC}</td>
                      <td className="px-4 py-3 text-[13px] text-foreground">{r.tenGD}</td>
                      <td className="px-4 py-3 text-[13px] text-foreground-muted">{r.benLienQuan}</td>
                      <td className="px-4 py-3 text-[13px] text-foreground-muted">{r.taiSan}</td>
                      <td className="px-4 py-3 text-[13px] text-foreground-muted">{r.tchncc}</td>
                      <td className="px-4 py-3 text-[13px] text-foreground-muted">{r.ccv}</td>
                      <td className="px-4 py-3"><StatusPill meta={GD_STATUS_META[r.trangThai]} /></td>
                      <td className="px-4 py-3 text-center">
                        <Button variant="outline" size="sm" onClick={() => showToast(`Đang mở chi tiết giao dịch công chứng ${r.soCC}…`)} className="h-7 gap-1 text-[12px]"><Eye className="size-3.5" />Xem chi tiết</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={pageSize} total={rows.length} unit="giao dịch" onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
          </>
        ) : (
          <EmptyState icon={<FileSearch className="size-6" />} title="Không có dữ liệu" desc="Không tìm thấy giao dịch nào khớp điều kiện lọc và tiêu chí hậu kiểm đã chọn." actionLabel="Đặt lại bộ lọc" onAction={doReset} />
        )}
      </div>
    </div>
  )
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">{label}</label>{children}</div>
}
