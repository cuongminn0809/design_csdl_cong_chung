import { useMemo, useState } from "react"
import { Eye, HelpCircle, Search } from "lucide-react"

import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { Button } from "@/components/ui/button"
import { EmptyState, PageHeader, Pagination, Th, inputCls } from "../ingestion/shared"
import { FaqDetailModal } from "./dialogs"
import { FAQ_AUDIENCES, FAQ_TOPICS, popularityOf, summarize, useFaqs, type Faq, type FaqAudience } from "./config"

type Filters = { keyword: string; topic: string; audience: FaqAudience | "all"; popularity: "all" | "Cao" | "Trung bình" | "Thấp" }
const EMPTY: Filters = { keyword: "", topic: "all", audience: "all", popularity: "all" }

interface RecentEntry { type: "keyword" | "faq"; value: string; faqId?: string }

export function FaqListPage() {
  const all = useFaqs()
  const [draft, setDraft] = useState(EMPTY)
  const [applied, setApplied] = useState(EMPTY)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [detail, setDetail] = useState<Faq | null>(null)
  const [recent, setRecent] = useState<RecentEntry[]>([{ type: "keyword", value: "tra cứu" }, { type: "keyword", value: "công chứng" }])

  const pushRecent = (entry: RecentEntry) => setRecent((prev) => [entry, ...prev.filter((r) => !(r.type === entry.type && r.value === entry.value))].slice(0, 10))

  const rows = useMemo(() => {
    let r = all
    const k = applied.keyword.trim().toLowerCase()
    if (k) r = r.filter((f) => f.question.toLowerCase().includes(k) || f.answer.toLowerCase().includes(k))
    if (applied.topic !== "all") r = r.filter((f) => f.topic === applied.topic)
    if (applied.audience !== "all") r = r.filter((f) => f.audience === applied.audience || f.audience === "Tất cả")
    if (applied.popularity !== "all") r = r.filter((f) => popularityOf(f.views) === applied.popularity)
    return [...r].sort((a, b) => b.views - a.views)
  }, [all, applied])

  const doSearch = () => { setApplied(draft); setPage(1); if (draft.keyword.trim()) pushRecent({ type: "keyword", value: draft.keyword.trim() }) }
  const openDetail = (f: Faq) => { setDetail(f); pushRecent({ type: "faq", value: f.question, faqId: f.id }) }
  const openFromHistory = (entry: RecentEntry) => {
    if (entry.type === "keyword") { setDraft((d) => ({ ...d, keyword: entry.value })); setApplied((a) => ({ ...a, keyword: entry.value })); setPage(1) }
    else { const f = all.find((x) => x.id === entry.faqId); if (f) openDetail(f) }
  }

  const total = rows.length
  const paged = rows.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="space-y-4">
      <PageHeader title="Câu hỏi thường gặp" desc="Tìm kiếm câu hỏi thường gặp và xem chi tiết câu trả lời." />

      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1.5 lg:col-span-2">
            <label className="text-xs font-semibold text-foreground-strong">Tìm kiếm</label>
            <input value={draft.keyword} onChange={(e) => setDraft((d) => ({ ...d, keyword: e.target.value }))} placeholder="Nhập từ khóa tìm kiếm…" className={inputCls} onKeyDown={(e) => e.key === "Enter" && doSearch()} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground-strong">Chủ đề/Lĩnh vực</label>
            <NativeSelect value={draft.topic} onChange={(e) => setDraft((d) => ({ ...d, topic: e.target.value }))}>
              <option value="all">Tất cả</option>{FAQ_TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
            </NativeSelect>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground-strong">Đối tượng áp dụng</label>
            <NativeSelect value={draft.audience} onChange={(e) => setDraft((d) => ({ ...d, audience: e.target.value as Filters["audience"] }))}>
              <option value="all">Tất cả</option>{FAQ_AUDIENCES.map((a) => <option key={a} value={a}>{a}</option>)}
            </NativeSelect>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground-strong">Mức độ phổ biến</label>
            <NativeSelect value={draft.popularity} onChange={(e) => setDraft((d) => ({ ...d, popularity: e.target.value as Filters["popularity"] }))}>
              <option value="all">Tất cả</option><option value="Cao">Cao</option><option value="Trung bình">Trung bình</option><option value="Thấp">Thấp</option>
            </NativeSelect>
          </div>
        </div>
        <div className="mt-4 flex gap-2.5"><Button onClick={doSearch}><Search className="size-4" />Tìm kiếm</Button><Button variant="outline" onClick={() => { setDraft(EMPTY); setApplied(EMPTY); setPage(1) }}>Đặt lại</Button></div>

        {recent.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1.5 border-t border-neutral-100 pt-3 text-[12.5px]">
            <span className="text-foreground-muted">Lịch sử:</span>
            {recent.map((r, i) => (
              <button key={i} onClick={() => openFromHistory(r)} className="rounded-full border border-border bg-neutral-50 px-2.5 py-0.5 text-foreground-muted hover:bg-neutral-100">
                {r.type === "keyword" ? `"${r.value}"` : r.value.length > 30 ? r.value.slice(0, 30) + "…" : r.value}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        {paged.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead><tr className="border-b border-border bg-neutral-50"><Th>Câu hỏi</Th><Th>Tóm tắt trả lời</Th><Th className="text-right">Lượt xem</Th><Th className="text-right">Thao tác</Th></tr></thead>
                <tbody>{paged.map((f) => (
                  <tr key={f.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="max-w-[280px] px-4 py-3 font-medium text-foreground">{f.question}</td>
                    <td className="max-w-[320px] px-4 py-3 text-foreground-muted">{summarize(f.answer)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground-muted">{f.views.toLocaleString("vi-VN")}</td>
                    <td className="px-4 py-3 text-right"><Button variant="outline" size="sm" onClick={() => openDetail(f)}><Eye className="size-3.5" />Xem chi tiết</Button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={pageSize} total={total} unit="câu hỏi" onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
          </>
        ) : (
          <EmptyState icon={<HelpCircle className="size-6" />} title="Không có dữ liệu" desc="Không có câu hỏi thường gặp phù hợp với điều kiện tìm kiếm." />
        )}
      </div>

      {detail && <FaqDetailModal faq={detail} onClose={() => setDetail(null)} />}
    </div>
  )
}
