import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Download, FileSearch, History, Printer, RotateCcw, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { useToast } from "@/features/reconciliation/components/Toast"
import { EmptyState, Pagination, PageHeader, StatusPill, Th, inputCls } from "../ingestion/shared"
import {
  EMPTY_ORG_FILTER, ORG_RECORDS, ORG_STATUS_OPTIONS, SO_TU_PHAP_OPTIONS,
  createLookup, describeCriteria, hasCriteria, orgStatusMeta, searchOrg,
  type LookupTab, type OrgFilter, type OrgRecord,
} from "./config"

export function OrgLookupPage() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [filter, setFilter] = useState<OrgFilter>(EMPTY_ORG_FILTER)
  const [error, setError] = useState("")
  const [searched, setSearched] = useState(false)
  const [results, setResults] = useState<OrgRecord[]>([])
  const [logId, setLogId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const set = (patch: Partial<OrgFilter>) => setFilter((f) => ({ ...f, ...patch }))
  const setTab = (tab: LookupTab) => { setFilter((f) => ({ ...f, tab })); setError("") }

  const doSearch = () => {
    if ([filter.tenToChuc, filter.hoTenCCV].some((v) => v.length > 250)) return setError("Thông tin tra cứu không được vượt quá 250 ký tự.")
    if (!hasCriteria(filter)) return setError("Vui lòng nhập ít nhất một tiêu chí tra cứu.")
    setError("")
    const res = searchOrg(ORG_RECORDS, filter)
    setResults(res); setSearched(true); setPage(1)
    const log = createLookup(describeCriteria(filter), res.length) // BR-06
    setLogId(log.id)
    if (!res.length) showToast("Không có dữ liệu tổ chức công chứng.", "error")
  }

  const doReset = () => { setFilter(EMPTY_ORG_FILTER); setError(""); setSearched(false); setResults([]); setLogId(null); setPage(1) }

  const doExport = () => {
    if (!searched || !results.length) return showToast("Không có dữ liệu tổ chức công chứng.", "error")
    showToast(`Kết xuất danh sách tổ chức HNCC thành công (TCHNCC_${new Date().toISOString().slice(0, 10).replace(/-/g, "")}.xlsx).`)
  }
  const doPrint = () => {
    if (!searched || !results.length) return showToast("Không có dữ liệu tổ chức công chứng.", "error")
    showToast("Đã tạo bản xem trước để in danh sách tổ chức HNCC.")
  }

  const openDetail = (o: OrgRecord) => navigate(`/tra-cuu/cong-chung-vien-tchncc/to-chuc-hncc/chi-tiet/${o.id}${logId ? `?lh=${logId}` : ""}`)

  const start = (Math.min(page, Math.max(1, Math.ceil(results.length / pageSize))) - 1) * pageSize
  const paged = results.slice(start, start + pageSize)

  return (
    <div>
      <PageHeader
        title="Tra cứu thông tin tổ chức HNCC"
        desc="Tra cứu tổ chức hành nghề công chứng theo tên tổ chức hoặc theo thông tin công chứng viên."
        actions={<Button variant="outline" onClick={() => navigate("/tra-cuu/cong-chung-vien-tchncc/to-chuc-hncc/lich-su")}><History className="size-4" />Lịch sử tra cứu</Button>}
      />

      {/* BỘ LỌC */}
      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-1 rounded-md border border-border bg-surface-muted p-[3px]">
          {([["org", "Theo tên tổ chức / thông tin liên quan"], ["ccv", "Theo thông tin Công chứng viên"]] as [LookupTab, string][]).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={cn("rounded-md px-4 py-[6px] text-[13px] font-medium", filter.tab === k ? "bg-surface text-foreground-strong shadow-xs" : "text-foreground-muted hover:text-foreground")}>{l}</button>
          ))}
        </div>

        {filter.tab === "org" ? (
          <>
            <Field label="Tên tổ chức công chứng"><input value={filter.tenToChuc} maxLength={251} onChange={(e) => { set({ tenToChuc: e.target.value }); if (error) setError("") }} onKeyDown={(e) => e.key === "Enter" && doSearch()} placeholder="Nhập tên tổ chức công chứng…" className={cn(inputCls, "h-[40px]")} /></Field>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Trạng thái tổ chức">
                <NativeSelect value={filter.trangThai} onChange={(e) => set({ trangThai: e.target.value })}>
                  <option value="all">Chọn trạng thái tổ chức</option>
                  {ORG_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </NativeSelect>
              </Field>
              <Field label="Sở Tư pháp">
                <NativeSelect value={filter.soTuPhap} onChange={(e) => set({ soTuPhap: e.target.value })}>
                  <option value="all">Chọn Sở Tư pháp</option>
                  {SO_TU_PHAP_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </NativeSelect>
              </Field>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Họ tên CCV"><input value={filter.hoTenCCV} maxLength={251} onChange={(e) => { set({ hoTenCCV: e.target.value }); if (error) setError("") }} onKeyDown={(e) => e.key === "Enter" && doSearch()} placeholder="Nhập họ tên CCV…" className={inputCls} /></Field>
            <Field label="Số thẻ CCV"><input value={filter.soThe} onChange={(e) => set({ soThe: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} placeholder="Nhập số thẻ…" className={inputCls} /></Field>
            <Field label="Số chứng chỉ hành nghề"><input value={filter.soChungChi} onChange={(e) => set({ soChungChi: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} placeholder="Nhập số CCHN…" className={inputCls} /></Field>
          </div>
        )}

        {error && <div className="mt-3 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]">{error}</div>}

        <div className="mt-4 flex flex-wrap justify-end gap-2.5">
          <Button variant="outline" onClick={doExport}><Download className="size-4" />Kết xuất</Button>
          <Button variant="outline" onClick={doPrint}><Printer className="size-4" />In</Button>
          <Button variant="outline" onClick={doReset}><RotateCcw className="size-4" />Reset</Button>
          <Button onClick={doSearch}><Search className="size-4" />Tra cứu</Button>
        </div>
      </div>

      {/* KẾT QUẢ */}
      <div className="mt-4 overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        {!searched ? (
          <EmptyState icon={<Search className="size-6" />} title="Chưa có kết quả tra cứu" desc="Nhập tiêu chí và nhấn “Tra cứu” để hiển thị danh sách tổ chức hành nghề công chứng phù hợp." />
        ) : results.length ? (
          <>
            <div className="border-b border-border px-5 py-3 text-[13px] text-foreground-muted">Danh sách tổ chức HNCC — Tổng cộng: Tìm thấy <span className="font-semibold text-foreground-strong">{results.length}</span> kết quả</div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-neutral-50">
                    <Th className="w-11 text-center">STT</Th>
                    <Th className="min-w-[170px]">Tên tổ chức CC</Th>
                    <Th className="min-w-[130px]">Sở Tư pháp</Th>
                    <Th className="min-w-[150px]">Trưởng VP</Th>
                    <Th className="min-w-[240px]">Địa chỉ trụ sở</Th>
                    <Th className="min-w-[150px]">Trạng thái HĐ</Th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((o, i) => (
                    <tr key={o.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{start + i + 1}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => openDetail(o)} className="text-left text-[13px] font-semibold text-link hover:underline">{o.tenToChuc}</button>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-foreground-muted">{o.soTuPhap}</td>
                      <td className="px-4 py-3 text-[13px] text-foreground">{o.truongVP}</td>
                      <td className="px-4 py-3 text-[13px] leading-snug text-foreground-muted">{o.diaChi}</td>
                      <td className="px-4 py-3"><StatusPill meta={orgStatusMeta(o.trangThai)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={pageSize} total={results.length} unit="tổ chức" onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
          </>
        ) : (
          <EmptyState icon={<FileSearch className="size-6" />} title="Không có dữ liệu tổ chức công chứng" desc="Không tìm thấy tổ chức HNCC nào khớp với tiêu chí tra cứu." actionLabel="Đặt lại" onAction={doReset} />
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-foreground-strong">{label}</label>
      {children}
    </div>
  )
}
