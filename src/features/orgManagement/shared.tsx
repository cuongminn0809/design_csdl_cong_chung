import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

/** Phân trang cố định 10 bản ghi/trang theo BR-M08/BR-415-09/BR-416-12 — không có control đổi số dòng/trang. */
export function SimplePagination({ page, pageSize, total, onPage }: { page: number; pageSize: number; total: number; onPage: (p: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const cur = Math.min(page, totalPages)
  const start = (cur - 1) * pageSize
  const nums = Array.from({ length: totalPages }, (_, i) => i + 1).filter((n) => n === 1 || n === totalPages || Math.abs(n - cur) <= 1)

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-4 py-3">
      <div className="text-[13px] text-foreground-muted">
        Hiển thị <span className="font-medium text-foreground-strong">{total ? start + 1 : 0}–{Math.min(start + pageSize, total)}</span> trên {total.toLocaleString("vi-VN")} bản ghi (10 bản ghi/trang)
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => onPage(Math.max(1, cur - 1))} disabled={cur <= 1} className="flex size-8 items-center justify-center rounded-[7px] border border-border bg-surface text-foreground disabled:cursor-not-allowed disabled:text-foreground-subtle disabled:opacity-50"><ChevronLeft className="size-[15px]" /></button>
        {nums.map((n) => (
          <button key={n} onClick={() => onPage(n)} className={cn("h-8 min-w-8 rounded-[7px] border px-2 text-[13px]", n === cur ? "border-neutral-900 bg-neutral-900 font-semibold text-white" : "border-border bg-surface font-medium text-foreground")}>{n}</button>
        ))}
        <button onClick={() => onPage(Math.min(totalPages, cur + 1))} disabled={cur >= totalPages} className="flex size-8 items-center justify-center rounded-[7px] border border-border bg-surface text-foreground disabled:cursor-not-allowed disabled:text-foreground-subtle disabled:opacity-50"><ChevronRight className="size-[15px]" /></button>
      </div>
    </div>
  )
}
