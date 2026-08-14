import { useState } from "react"
import { Activity, CircleCheck, Copy, Eye, Pencil, Plus, Search, Settings2, Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { ReconDataset, ReconEndpoint } from "../types"
import { nf } from "../format"
import { useToast } from "./Toast"
import { SourceBadge, IconButton } from "./bits"

const ENDPOINT_STATUS = {
  active: { label: "Hoạt động", bg: "#f0fdf4", fg: "#15803d", dot: "#22c55e", bd: "#bbf7d0" },
  paused: { label: "Tạm dừng", bg: "#f5f5f5", fg: "#525252", dot: "#a3a3a3", bd: "#e5e5e5" },
}

export function ServicesTab({
  data,
  onAddEndpoint,
  onEditEndpoint,
  onViewEndpoint,
}: {
  data: ReconDataset
  onAddEndpoint: () => void
  onEditEndpoint: (e: ReconEndpoint) => void
  onViewEndpoint: (e: ReconEndpoint) => void
}) {
  const showToast = useToast()
  const [keyword, setKeyword] = useState("")
  const typeName = (code: string) => data.types.find((t) => t[0] === code)?.[1] ?? code

  const rows = data.endpoints.filter((e) => {
    const kw = keyword.trim().toLowerCase()
    if (!kw) return true
    return `${e.src} ${e.type} ${data.sources[e.src].name}`.toLowerCase().includes(kw)
  })

  const cards = [
    { label: "Tổng cấu hình", count: nf(data.endpoints.length), hint: "Endpoint đã cấu hình", color: "#2563eb", bg: "#eff6ff", icon: <Settings2 className="size-4" /> },
    { label: "Đang hoạt động", count: nf(data.endpoints.filter((e) => e.status === "active").length), hint: "status = Hoạt động", color: "#16a34a", bg: "#f0fdf4", icon: <CircleCheck className="size-4" /> },
    { label: "Tổng lần gọi", count: nf(data.endpoints.reduce((a, e) => a + e.calls, 0)), hint: "Gói tin đã tiếp nhận (audit)", color: "#7c3aed", bg: "#f5f3ff", icon: <Activity className="size-4" /> },
  ]

  return (
    <div>
      <div className="mb-[18px] grid grid-cols-1 gap-3.5 md:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-[14px] border border-border bg-surface p-[18px_20px] shadow-sm">
            <div className="flex items-center justify-between gap-2.5">
              <span className="text-[12.5px] font-semibold text-foreground-muted">{c.label}</span>
              <span className="flex size-[30px] shrink-0 items-center justify-center rounded-lg" style={{ background: c.bg, color: c.color }}>
                {c.icon}
              </span>
            </div>
            <div className="mt-2.5 text-[28px] font-bold tabular-nums tracking-[-0.02em] text-foreground-strong">{c.count}</div>
            <div className="mt-0.5 text-[11.5px] text-foreground-subtle">{c.hint}</div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-[16px_18px]">
          <div className="relative min-w-[260px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo tên nguồn, source_system_id, endpoint path…"
              className="h-9 w-full rounded-md border border-input bg-surface pl-[38px] pr-3 text-sm shadow-xs outline-none focus-visible:border-border-focus focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>
          <Button onClick={onAddEndpoint}>
            <Plus className="size-4" />
            Thêm cấu hình API
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-neutral-50">
                <Th className="min-w-[210px]">Hệ thống nguồn</Th>
                <Th className="min-w-[160px]">{data.typeLabel}</Th>
                <Th className="min-w-[280px]">API Endpoint (kho)</Th>
                <Th>Xác thực</Th>
                <Th>Trạng thái</Th>
                <Th className="text-right">Tổng lần gọi</Th>
                <Th className="min-w-[150px]">Lần gọi gần nhất</Th>
                <Th className="w-[150px] text-center">Thao tác</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e, i) => {
                const src = data.sources[e.src]
                const es = ENDPOINT_STATUS[e.status]
                const path =
                  e.type === "GENERIC"
                    ? `/api/v1/reconciliation/${data.apiBase}/{code}`
                    : `/api/v1/reconciliation/${data.apiBase}/${e.type.toLowerCase()}`
                return (
                  <tr key={i} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <SourceBadge sys={src.sys} />
                        <div>
                          <div className="text-[13px] font-medium text-foreground">{src.name}</div>
                          <div className="font-mono text-[10.5px] text-foreground-subtle">{e.src}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-foreground">
                      {e.type === "GENERIC" ? "Tất cả (generic route)" : typeName(e.type)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded-[4px] bg-[#16a34a] px-1.5 py-px font-mono text-[10px] font-semibold text-white">POST</span>
                        <span className="font-mono text-[11.5px] text-foreground-muted">{path}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-[4px] border border-border bg-surface-muted px-1.5 py-px font-mono text-[11px] font-semibold text-foreground-muted">
                        {e.auth}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] pl-2 text-xs font-semibold"
                        style={{ background: es.bg, color: es.fg, borderColor: es.bd }}
                      >
                        <span className="size-1.5 shrink-0 rounded-full" style={{ background: es.dot }} />
                        {es.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground">{nf(e.calls)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-[13px] tabular-nums text-foreground-muted">{e.last}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex gap-px">
                        <IconButton title="Chỉnh sửa" onClick={() => onEditEndpoint(e)}>
                          <Pencil className="size-[14px]" />
                        </IconButton>
                        <IconButton title="Xem" onClick={() => onViewEndpoint(e)}>
                          <Eye className="size-[15px]" />
                        </IconButton>
                        <IconButton title="Sao chép Integration Pack" onClick={() => showToast("Đã sao chép thông tin tích hợp vào clipboard.")}>
                          <Copy className="size-[14px]" />
                        </IconButton>
                        <IconButton title="Xóa" danger onClick={() => showToast("Đã xóa cấu hình endpoint thành công.")}>
                          <Trash2 className="size-[14px]" />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Th({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <th className={cn("px-4 py-[11px] text-left text-xs font-semibold text-foreground-muted", className)}>{children}</th>
}
