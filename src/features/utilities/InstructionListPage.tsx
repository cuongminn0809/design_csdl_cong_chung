import { useMemo, useState } from "react"
import { Download, Eye, FileText, Search } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { EmptyState, PageHeader, Pagination, Th, inputCls } from "../ingestion/shared"
import { fmtVNDateTime, useInstructions } from "./config"

export function InstructionListPage() {
  const navigate = useNavigate()
  const showToast = useToast()
  const all = useInstructions()
  const [keyword, setKeyword] = useState("")
  const [applied, setApplied] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const rows = useMemo(() => {
    const k = applied.trim().toLowerCase()
    let r = all
    if (k) r = r.filter((i) => i.title.toLowerCase().includes(k) || i.content.toLowerCase().includes(k))
    return [...r].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [all, applied])

  const doSearch = () => { setApplied(keyword); setPage(1) }
  const doReset = () => { setKeyword(""); setApplied(""); setPage(1) }
  const doDownload = (fileName?: string) => showToast(fileName ? `Đã tải xuống ${fileName}.` : "Tài liệu không có file đính kèm để tải xuống.", fileName ? "ok" : "info")

  const total = rows.length
  const paged = rows.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="space-y-4">
      <PageHeader title="Hướng dẫn sử dụng" desc="Tìm kiếm và xem tài liệu hướng dẫn sử dụng hệ thống." />

      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground-strong">Từ khóa</label>
          <div className="flex gap-2.5">
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)} maxLength={255} placeholder="Nhập từ khóa tìm kiếm trong tiêu đề và nội dung…" className={inputCls} onKeyDown={(e) => e.key === "Enter" && doSearch()} />
            <Button onClick={doSearch}><Search className="size-4" />Tìm kiếm</Button>
            <Button variant="outline" onClick={doReset}>Xóa bộ lọc</Button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        {paged.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead><tr className="border-b border-border bg-neutral-50"><Th className="w-11 text-center">STT</Th><Th>Tiêu đề + Tên file</Th><Th>Ngày tạo</Th><Th className="text-right">Lượt xem</Th><Th className="text-right">Thao tác</Th></tr></thead>
                <tbody>{paged.map((i, idx) => (
                  <tr key={i.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{(page - 1) * pageSize + idx + 1}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => navigate(`/tra-cuu/huong-dan-su-dung/${i.id}`)} className="text-left font-medium text-foreground hover:underline">{i.title}</button>
                      {i.fileName && <div className="mt-0.5 text-[12px] text-foreground-muted">{i.fileName}</div>}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-foreground-muted">{fmtVNDateTime(i.createdAt)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground-muted">{i.views.toLocaleString("vi-VN")}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/tra-cuu/huong-dan-su-dung/${i.id}`)}><Eye className="size-3.5" />Xem</Button>
                        <Button variant="outline" size="sm" onClick={() => doDownload(i.fileName)}><Download className="size-3.5" />Tải</Button>
                      </div>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={pageSize} total={total} unit="tài liệu" onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
          </>
        ) : (
          <EmptyState icon={<FileText className="size-6" />} title="Không có dữ liệu" desc="Không có dữ liệu hướng dẫn sử dụng phù hợp với điều kiện tìm kiếm." />
        )}
      </div>
    </div>
  )
}
