import { Fragment, useState } from "react"
import { ChevronRight, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import type { LogEntry, ReconDataset } from "../types"

const LEVEL_STYLE: Record<LogEntry["level"], { c: string; bg: string; bd: string }> = {
  INFO: { c: "#2563eb", bg: "#eff6ff", bd: "#bfdbfe" },
  WARN: { c: "#c2410c", bg: "#fff7ed", bd: "#fed7aa" },
  ERROR: { c: "#b91c1c", bg: "#fef2f2", bd: "#fecaca" },
}

const LEVELS: [string, string][] = [
  ["all", "Tất cả"],
  ["INFO", "INFO"],
  ["WARN", "WARN"],
  ["ERROR", "ERROR"],
]

export function LogsTab({ data }: { data: ReconDataset }) {
  const [keyword, setKeyword] = useState("")
  const [level, setLevel] = useState("all")
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const rows = data.logs.filter((l) => {
    if (level !== "all" && l.level !== level) return false
    const kw = keyword.trim().toLowerCase()
    if (kw && !`${l.job} ${l.packet} ${l.code} ${l.ip} ${l.event}`.toLowerCase().includes(kw)) return false
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
            placeholder="Tìm theo reconciliation_id, packet_id, error_code, IP nguồn…"
            className="h-9 w-full rounded-md border border-input bg-surface pl-[38px] pr-3 text-sm shadow-xs outline-none focus-visible:border-border-focus focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>
        <div className="flex gap-1 rounded-md border border-border bg-surface-muted p-[3px]">
          {LEVELS.map(([k, l]) => (
            <button
              key={k}
              onClick={() => setLevel(k)}
              className={cn(
                "rounded-md px-3 py-[5px] text-[12.5px] font-medium",
                level === k ? "bg-surface text-foreground-strong shadow-xs" : "text-foreground-muted"
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-neutral-50">
              <th className="w-[34px] py-[11px] pl-4 pr-2" />
              <Th className="min-w-[150px] px-2">Thời gian</Th>
              <Th>Mức</Th>
              <Th className="min-w-[200px]">Sự kiện</Th>
              <Th className="min-w-[200px]">Job / Gói tin</Th>
              <Th className="min-w-[130px]">Nguồn</Th>
              <Th className="min-w-[160px]">Mã lỗi / Cảnh báo</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => {
              const ls = LEVEL_STYLE[l.level]
              const key = l.time + l.event
              const exp = !!expanded[key]
              return (
                <Fragment key={key}>
                  <tr
                    onClick={() => setExpanded((m) => ({ ...m, [key]: !m[key] }))}
                    className="cursor-pointer border-b border-neutral-100 hover:bg-neutral-50"
                  >
                    <td className="py-3 pl-4 pr-2 text-foreground-subtle">
                      <ChevronRight className={cn("size-3.5 transition-transform", exp && "rotate-90")} />
                    </td>
                    <td className="whitespace-nowrap px-2 py-3 text-[12.5px] tabular-nums text-foreground-muted">{l.time}</td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-block rounded-[5px] border px-[7px] py-0.5 font-mono text-[10.5px] font-bold"
                        style={{ color: ls.c, background: ls.bg, borderColor: ls.bd }}
                      >
                        {l.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground">{l.event}</td>
                    <td className="px-4 py-3">
                      <div className="font-mono text-[11.5px] text-foreground">{l.job}</div>
                      <div className="font-mono text-[10.5px] text-foreground-subtle">{l.packet}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11.5px] text-foreground-muted">{l.srcId}</td>
                    <td className="px-4 py-3">
                      {l.code ? (
                        <span className="rounded-[4px] border border-border bg-surface-muted px-1.5 py-px font-mono text-[11px] text-foreground-muted">
                          {l.code}
                        </span>
                      ) : (
                        <span className="text-foreground-subtle">—</span>
                      )}
                    </td>
                  </tr>
                  {exp && (
                    <tr className="border-b border-neutral-100 bg-neutral-50">
                      <td />
                      <td colSpan={6} className="px-4 pb-3.5 pt-0">
                        <div className="whitespace-pre-wrap rounded-lg border border-border bg-surface p-[12px_14px] font-mono text-xs leading-relaxed text-foreground">
                          {l.msg}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
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
