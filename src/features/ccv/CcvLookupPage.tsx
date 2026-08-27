import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Download, FileSearch, History, Printer, RotateCcw, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { useToast } from "@/features/reconciliation/components/Toast"
import { EmptyState, Pagination, PageHeader, StatusPill, Th, inputCls } from "../ingestion/shared"
import { CertificateModal } from "./dialogs"
import {
  ALL_TCHNCC, CCV_RECORDS, CCV_STATUS_OPTIONS, EMPTY_CCV_FILTER, SO_TU_PHAP_OPTIONS, TCHNCC_BY_STP,
  ccvStatusMeta, createLookup, describeCriteria, hasCriteria, searchCcv,
  type CcvFilter, type CcvRecord, type Certificate,
} from "./config"

export function CcvLookupPage() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [filter, setFilter] = useState<CcvFilter>(EMPTY_CCV_FILTER)
  const [error, setError] = useState("")
  const [searched, setSearched] = useState(false)
  const [results, setResults] = useState<CcvRecord[]>([])
  const [logId, setLogId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [cert, setCert] = useState<Certificate | null>(null)

  const set = (patch: Partial<CcvFilter>) => setFilter((f) => ({ ...f, ...patch }))
  const tchnccOptions = useMemo(() => (filter.soTuPhap !== "all" ? TCHNCC_BY_STP[filter.soTuPhap] ?? [] : ALL_TCHNCC), [filter.soTuPhap])

  const doSearch = () => {
    if (filter.keyword.length > 250) return setError("Thông tin tra cứu không được vượt quá 250 ký tự.")
    if (!hasCriteria(filter)) return setError("Vui lòng nhập ít nhất một tiêu chí tra cứu.")
    setError("")
    const res = searchCcv(CCV_RECORDS, filter)
    setResults(res); setSearched(true); setPage(1)
    // BR-06: mỗi lần tra cứu thành công (kể cả 0 KQ) tạo lịch sử, soKetQuaDaXem = 0.
    const log = createLookup(describeCriteria(filter), res.length)
    setLogId(log.id)
    if (!res.length) showToast("Không có dữ liệu công chứng viên.", "error")
  }

  const doReset = () => { setFilter(EMPTY_CCV_FILTER); setError(""); setSearched(false); setResults([]); setLogId(null); setPage(1) }

  const doExport = () => {
    if (!searched || !results.length) return showToast("Không có dữ liệu công chứng viên.", "error")
    showToast(`Kết xuất danh sách công chứng viên thành công (CCV_${new Date().toISOString().slice(0, 10).replace(/-/g, "")}.xlsx).`)
  }
  const doPrint = () => {
    if (!searched || !results.length) return showToast("Không có dữ liệu công chứng viên.", "error")
    showToast("Đã tạo bản xem trước để in danh sách công chứng viên.")
  }

  const openDetail = (c: CcvRecord) => navigate(`/tra-cuu/cong-chung-vien-tchncc/chi-tiet/${c.id}${logId ? `?lh=${logId}` : ""}`)

  const start = (Math.min(page, Math.max(1, Math.ceil(results.length / pageSize))) - 1) * pageSize
  const paged = results.slice(start, start + pageSize)

  return (
    <div>
      <PageHeader
        title="Tra cứu công chứng viên"
        desc="Tra cứu thông tin công chứng viên và chứng chỉ hành nghề trên phạm vi toàn quốc."
        actions={<Button variant="outline" onClick={() => navigate("/tra-cuu/cong-chung-vien-tchncc/lich-su")}><History className="size-4" />Lịch sử tra cứu</Button>}
      />

      {/* BỘ LỌC */}
      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="mb-3 text-[13px] font-semibold text-foreground-strong">Thông tin tra cứu</div>
        <input value={filter.keyword} maxLength={251} onChange={(e) => { set({ keyword: e.target.value }); if (error) setError("") }} onKeyDown={(e) => e.key === "Enter" && doSearch()}
          placeholder="Điền tên công chứng viên, số thẻ CCV hoặc số chứng chỉ hành nghề…" className={cn(inputCls, "h-[40px]")} />

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Trạng thái">
            <NativeSelect value={filter.trangThai} onChange={(e) => set({ trangThai: e.target.value })}>
              <option value="all">Chọn trạng thái</option>
              {CCV_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Sở Tư pháp">
            <NativeSelect value={filter.soTuPhap} onChange={(e) => set({ soTuPhap: e.target.value, tchncc: "all" })}>
              <option value="all">Chọn Sở Tư pháp</option>
              {SO_TU_PHAP_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Tổ chức hành nghề công chứng">
            <NativeSelect value={filter.tchncc} onChange={(e) => set({ tchncc: e.target.value })}>
              <option value="all">Chọn tổ chức hành nghề công chứng</option>
              {tchnccOptions.map((t) => <option key={t} value={t}>{t}</option>)}
            </NativeSelect>
          </Field>
        </div>

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
          <EmptyState icon={<Search className="size-6" />} title="Chưa có kết quả tra cứu" desc="Nhập tiêu chí và nhấn “Tra cứu” để hiển thị danh sách công chứng viên phù hợp." />
        ) : results.length ? (
          <>
            <div className="border-b border-border px-5 py-3 text-[13px] text-foreground-muted">Danh sách công chứng viên — Tổng cộng: Tìm thấy <span className="font-semibold text-foreground-strong">{results.length}</span> kết quả</div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1120px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-neutral-50">
                    <Th className="w-11 text-center">STT</Th>
                    <Th className="min-w-[120px]">Sở Tư pháp</Th>
                    <Th className="min-w-[150px]">Họ và tên</Th>
                    <Th className="min-w-[120px]">Số thẻ CCV</Th>
                    <Th className="min-w-[120px]">Số CCHN</Th>
                    <Th className="min-w-[160px]">Tổ chức hành nghề</Th>
                    <Th className="min-w-[200px]">Địa chỉ trụ sở</Th>
                    <Th className="min-w-[150px]">Trạng thái HĐ</Th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((c, i) => (
                    <tr key={c.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{start + i + 1}</td>
                      <td className="px-4 py-3 text-[13px] text-foreground-muted">{c.soTuPhap}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => openDetail(c)} className="text-left text-[13px] font-medium text-link hover:underline">{c.hoTen}</button>
                      </td>
                      <td className="px-4 py-3 font-mono text-[12.5px] text-foreground-muted">{c.soThe}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setCert(c.certificate)} className="font-mono text-[12.5px] font-semibold text-link hover:underline">{c.certificate.soChungChi}</button>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-foreground">{c.tchncc}</td>
                      <td className="px-4 py-3 text-[13px] leading-snug text-foreground-muted">{c.diaChi}</td>
                      <td className="px-4 py-3"><StatusPill meta={ccvStatusMeta(c.trangThai)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={pageSize} total={results.length} unit="công chứng viên" onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
          </>
        ) : (
          <EmptyState icon={<FileSearch className="size-6" />} title="Không có dữ liệu công chứng viên" desc="Không tìm thấy công chứng viên nào khớp với tiêu chí tra cứu." actionLabel="Đặt lại" onAction={doReset} />
        )}
      </div>

      {cert && <CertificateModal cert={cert} onClose={() => setCert(null)} />}
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
