import { useState } from "react"
import { Search } from "lucide-react"

import { cn } from "@/lib/utils"
import type { ReconDataset } from "../types"
import { nf } from "../format"
import { SourceBadge } from "./bits"

const ACTION_META: Record<string, { label: string; c: string }> = {
  receive: { label: "Tiếp nhận gói tin", c: "#2563eb" },
  validate: { label: "Validate OK", c: "#16a34a" },
  match: { label: "Bắt đầu so khớp", c: "#2563eb" },
  summary: { label: "Tổng hợp kết quả", c: "#7c3aed" },
  response: { label: "Phản hồi đồng bộ", c: "#0891b2" },
  callback: { label: "Gọi callback", c: "#0891b2" },
  replay: { label: "Idempotent replay", c: "#a16207" },
}

const HIST_STATUS = {
  ok: { label: "Thành công", bg: "#f0fdf4", fg: "#15803d", dot: "#22c55e", bd: "#bbf7d0" },
  warn: { label: "Cảnh báo", bg: "#fff7ed", fg: "#c2410c", dot: "#f97316", bd: "#fed7aa" },
  fail: { label: "Thất bại", bg: "#fef2f2", fg: "#b91c1c", dot: "#ef4444", bd: "#fecaca" },
}

export function HistoryTab({ data, onOpenJob }: { data: ReconDataset; onOpenJob: (id: string) => void }) {
  const [keyword, setKeyword] = useState("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")

  const rows = data.history.filter((h) => {
    const kw = keyword.trim().toLowerCase()
    if (kw && !`${h.job} ${h.packet} ${h.action} ${h.src}`.toLowerCase().includes(kw)) return false
    return true
  })

  return (
    <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-border p-[16px_18px]">
        <div className="relative min-w-[280px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo reconciliation_id, packet_id, hành động…"
            className="h-9 w-full rounded-md border border-input bg-surface pl-[38px] pr-3 text-sm shadow-xs outline-none focus-visible:border-border-focus focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9 rounded-md border border-input bg-surface px-3 text-[13.5px] shadow-xs" />
        <span className="text-foreground-subtle">→</span>
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-9 rounded-md border border-input bg-surface px-3 text-[13.5px] shadow-xs" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-neutral-50">
              <Th className="min-w-[150px]">Thời gian</Th>
              <Th className="min-w-[220px]">Gói tin</Th>
              <Th className="min-w-[160px]">Job đối soát</Th>
              <Th className="min-w-[150px]">Hệ thống nguồn</Th>
              <Th>Hành động</Th>
              <Th className="text-right">Số bản ghi</Th>
              <Th>Trạng thái</Th>
              <Th className="min-w-[280px]">Chi tiết</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((h, i) => {
              const src = data.sources[h.src]
              const am = ACTION_META[h.action] ?? { label: h.action, c: "#525252" }
              const hs = HIST_STATUS[h.status]
              return (
                <tr key={i} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="whitespace-nowrap px-4 py-3 text-[13px] tabular-nums text-foreground-muted">{h.time}</td>
                  <td className="px-4 py-3">
                    <div className="text-[13px] leading-tight text-foreground">{h.pName}</div>
                    <div className="mt-0.5 font-mono text-[11px] text-foreground-subtle">{h.packet}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span onClick={() => onOpenJob(h.job)} className="cursor-pointer font-mono text-xs text-link hover:underline">
                      {h.job}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <SourceBadge sys={src.sys} />
                      <span className="text-[12.5px] text-foreground">{h.src}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-block rounded-md px-2.5 py-[3px] text-[11.5px] font-semibold"
                      style={{ color: am.c, background: `${am.c}14` }}
                    >
                      {am.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-foreground">{h.records ? nf(h.records) : "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] pl-2 text-xs font-semibold"
                      style={{ background: hs.bg, color: hs.fg, borderColor: hs.bd }}
                    >
                      <span className="size-1.5 shrink-0 rounded-full" style={{ background: hs.dot }} />
                      {hs.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[12.5px] leading-snug text-foreground-muted">{h.detail}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Th({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <th className={cn("px-4 py-[11px] text-left text-xs font-semibold text-foreground-muted", className)}>{children}</th>
}
