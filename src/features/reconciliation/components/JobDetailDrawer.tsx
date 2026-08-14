import { useState } from "react"
import { ArrowRight, ArrowUpRight, Check, TriangleAlert, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { ReconDataset, ReconJob } from "../types"
import { JOB_STATUS } from "../statusMeta"
import { nf } from "../format"
import { StatusPill } from "./bits"

type SubTab = "info" | "summary" | "mismatch" | "warn"

const KIND_BADGE: Record<string, { c: string; bg: string; bd: string }> = {
  MATCHED: { c: "#16a34a", bg: "#f0fdf4", bd: "#bbf7d0" },
  MISMATCHED: { c: "#ea580c", bg: "#fff7ed", bd: "#fed7aa" },
  ONLY_WAREHOUSE: { c: "#0891b2", bg: "#ecfeff", bd: "#a5f3fc" },
  ONLY_SOURCE: { c: "#7c3aed", bg: "#f5f3ff", bd: "#ddd6fe" },
}

export function JobDetailDrawer({
  job,
  data,
  onClose,
  onExport,
  onLinkB13,
  onLoadMore,
}: {
  job: ReconJob
  data: ReconDataset
  onClose: () => void
  onExport: () => void
  onLinkB13: () => void
  onLoadMore: () => void
}) {
  const [tab, setTab] = useState<SubTab>("info")
  const src = data.sources[job.src]
  const meta = JOB_STATUS[job.status]
  const typeName = data.types.find((t) => t[0] === job.type)?.[1] ?? job.type
  const mm = data.mismatch[job.id] ?? []

  const dur = job.done ? (job.status === "receiving" || job.status === "matching" ? "—" : "~52 giây") : "—"

  const infoGroups: { title: string; rows: { label: string; value: string; mono?: boolean; span?: boolean; warn?: boolean }[] }[] = [
    {
      title: "Định danh",
      rows: [
        { label: "Mã job đối soát", value: job.id, mono: true },
        { label: "Mã gói tin (idempotency)", value: job.packet, mono: true },
        { label: `${data.typeLabel}`, value: typeName },
        { label: data.codeName, value: job.type, mono: true },
      ],
    },
    {
      title: "Nguồn dữ liệu",
      rows: [
        { label: "Hệ thống nguồn", value: `[${src.sys}] ${src.name}` },
        { label: "source_system_id", value: job.src, mono: true },
      ],
    },
    {
      title: "Trạng thái & thời gian",
      rows: [
        { label: "Thời điểm nguồn gửi (sent_at)", value: job.sent },
        { label: "Thời điểm tiếp nhận", value: job.recv },
        { label: "Thời điểm hoàn thành", value: job.done || "— (đang xử lý)" },
        { label: "Thời gian xử lý", value: dur },
      ],
    },
    {
      title: "Kỹ thuật",
      rows: [
        { label: "Phản hồi", value: job.resp === "sync" ? "Đồng bộ (AF-01)" : "Bất đồng bộ (AF-02)" },
        { label: "Checksum (VR-11)", value: job.checksum === "match" ? "Khớp" : "Mismatch → xem Cảnh báo", warn: job.checksum !== "match" },
        { label: "callback_url", value: job.callback || "— (không dùng callback)", mono: true, span: true },
      ],
    },
  ]

  const summaryCards = [
    { label: "Tổng khóa", value: job.total, code: "total", color: undefined as string | undefined },
    { label: "Khớp", value: job.matched, code: "matched", color: "#16a34a" },
    { label: "Sai lệch", value: job.mismatched, code: "mismatched", color: job.mismatched > 0 ? "#ea580c" : undefined },
    { label: "Chỉ có trong kho", value: job.onlyWh, code: "only_in_warehouse", color: job.onlyWh > 0 ? "#64748b" : undefined },
    { label: "Chỉ có trong gói tin", value: job.onlySrc, code: "only_in_source", color: job.onlySrc > 0 ? "#64748b" : undefined },
    { label: "Bỏ qua validate", value: job.valSkip, code: "validation_skipped", color: job.valSkip > 0 ? "#c2410c" : undefined },
  ]

  const mismatchTotal = job.mismatched + job.onlyWh + job.onlySrc
  const hasWarn = job.checksum === "mismatch"
  const valErrs = job.valSkip > 0 ? [{ idx: 44, code: "WARN_FIELD_MISSING", field: "DiaDiemCongChung", message: "Thiếu trường không bắt buộc — bỏ qua validate, vẫn so khớp" }] : []
  const hasJobErr = job.status === "error" || job.status === "cberr"
  const allClear = !hasWarn && !valErrs.length && !hasJobErr

  const tabs: { key: SubTab; label: string; badge?: number }[] = [
    { key: "info", label: "Thông tin chung" },
    { key: "summary", label: "Kết quả so khớp" },
    { key: "mismatch", label: "Sai lệch", badge: mismatchTotal || undefined },
    { key: "warn", label: "Cảnh báo & Lỗi" },
  ]

  return (
    <>
      <div className="fixed inset-0 z-[110] bg-[rgba(10,10,10,0.5)]" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-[120] flex w-[960px] max-w-[96vw] flex-col bg-surface shadow-popover">
        {/* Header */}
        <div className="flex flex-none items-start justify-between gap-4 border-b border-border px-6 py-[18px]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">Chi tiết job đối soát</span>
              <StatusPill meta={meta} />
              <span className="rounded-full border border-border bg-surface-muted px-2.5 py-0.5 text-[11px] text-foreground-subtle">Chỉ đọc</span>
            </div>
            <div className="mt-1.5 font-mono text-[17px] font-semibold text-foreground-strong">{job.id}</div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-[18px]" />
          </Button>
        </div>

        {/* Sub-tabs */}
        <div className="flex flex-none gap-1 overflow-x-auto border-b border-border px-6 pt-2.5">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "mr-3.5 whitespace-nowrap border-b-2 px-1.5 py-[11px] text-[13.5px]",
                tab === t.key ? "border-neutral-900 font-semibold text-foreground-strong" : "border-transparent font-medium text-foreground-muted"
              )}
            >
              {t.label}
              {t.badge != null && (
                <span
                  className={cn(
                    "ml-[7px] rounded-full px-[7px] py-px text-[11px] font-bold",
                    tab === t.key ? "bg-neutral-900 text-white" : "bg-neutral-200 text-foreground-muted"
                  )}
                >
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto px-6 pb-8 pt-[22px]">
          {tab === "info" && (
            <>
              {infoGroups.map((g) => (
                <div key={g.title} className="mb-[22px]">
                  <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">{g.title}</div>
                  <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-border bg-border">
                    {g.rows.map((r) => (
                      <div key={r.label} className={cn("bg-surface px-3.5 py-[11px]", r.span && "col-span-2")}>
                        <div className="mb-[3px] text-[11.5px] text-foreground-muted">{r.label}</div>
                        <div
                          className={cn(
                            "text-[13.5px]",
                            r.mono ? "font-mono text-[13px] text-foreground" : "font-medium text-foreground",
                            r.warn && "font-semibold text-[#c2410c]"
                          )}
                        >
                          {r.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          {tab === "summary" && (
            <>
              <div className="mb-[18px] grid grid-cols-3 gap-3">
                {summaryCards.map((c) => (
                  <div key={c.code} className="rounded-xl border border-border bg-surface p-[14px_16px]">
                    <div className="text-xs font-semibold text-foreground-muted">{c.label}</div>
                    <div
                      className="mt-2 text-[26px] font-bold tabular-nums tracking-[-0.02em]"
                      style={{ color: c.color ?? "var(--foreground-strong)" }}
                    >
                      {nf(c.value)}
                    </div>
                    <div className="mt-0.5 font-mono text-[10.5px] text-foreground-subtle">{c.code}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-[10px] border border-border bg-surface-muted p-[14px_16px]">
                <div className="mb-1.5 text-[11.5px] font-semibold text-foreground-muted">Khóa đối soát (chỉ đọc)</div>
                <code className="font-mono text-[13px] text-foreground">{data.reconKey}</code>
              </div>
            </>
          )}

          {tab === "mismatch" &&
            (mm.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full border-collapse text-[13.5px]">
                  <thead>
                    <tr className="border-b border-border bg-neutral-50">
                      <ThSm className="w-11 text-center">STT</ThSm>
                      <ThSm className="min-w-[160px]">Loại kết quả</ThSm>
                      <ThSm>{data.idLabel}</ThSm>
                      {data.showYearColumn && <ThSm>Năm CC</ThSm>}
                      <ThSm>Ngày{data.showYearColumn ? "CongChung" : ""}</ThSm>
                      <ThSm className="min-w-[260px]">Trường khác biệt</ThSm>
                    </tr>
                  </thead>
                  <tbody>
                    {mm.map((m, i) => {
                      const kb = KIND_BADGE[m.kind]
                      const noDiffLabel = m.kind === "ONLY_WAREHOUSE" ? "Chỉ tồn tại trong kho" : "Chỉ tồn tại trong gói tin nguồn"
                      return (
                        <tr key={i} className="border-b border-neutral-100">
                          <td className="px-3.5 py-2.5 text-center tabular-nums text-foreground-muted">{i + 1}</td>
                          <td className="px-3.5 py-2.5">
                            <span
                              className="inline-block rounded-[5px] border px-[7px] py-0.5 font-mono text-[10.5px] font-bold"
                              style={{ color: kb.c, background: kb.bg, borderColor: kb.bd }}
                            >
                              {m.kind}
                            </span>
                          </td>
                          <td className="px-3.5 py-2.5 font-mono text-[12.5px] text-foreground">{m.so}</td>
                          {data.showYearColumn && <td className="px-3.5 py-2.5 tabular-nums text-foreground">{m.year}</td>}
                          <td className="px-3.5 py-2.5 tabular-nums text-foreground-muted">{m.ngay}</td>
                          <td className="px-3.5 py-2.5">
                            {m.diffs.length > 0 ? (
                              m.diffs.map((d, k) => (
                                <div key={k} className="mb-0.5 flex items-center gap-2 text-xs">
                                  <span className="min-w-[120px] font-mono text-foreground">{d.field}</span>
                                  <span className="text-red-600 line-through">{d.wh}</span>
                                  <ArrowRight className="size-3 text-foreground-subtle" />
                                  <span className="text-[#16a34a]">{d.src}</span>
                                </div>
                              ))
                            ) : (
                              <span className="text-xs text-foreground-subtle">{noDiffLabel}</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                <div className="flex items-center justify-between gap-3 border-t border-border bg-neutral-50 px-3.5 py-[11px] text-[12.5px] text-foreground-muted">
                  <span>
                    Hiển thị {mm.length} / {mismatchTotal} bản ghi (tối đa 500 dòng đầu — AF-03)
                  </span>
                  <Button variant="outline" size="sm" onClick={onLoadMore}>
                    Tải thêm
                  </Button>
                </div>
              </div>
            ) : (
              <EmptyOk title="Không có bản ghi sai lệch" desc="Tất cả khóa đối soát khớp hoàn toàn giữa kho và gói tin nguồn." />
            ))}

          {tab === "warn" && (
            <>
              {hasWarn && (
                <div className="mb-5">
                  <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">Cảnh báo (warnings[])</div>
                  <div className="mb-2 flex items-start gap-[11px] rounded-[10px] border border-[#fed7aa] bg-[#fff7ed] p-[12px_14px]">
                    <TriangleAlert className="mt-px size-[18px] shrink-0 text-[#ea580c]" />
                    <div>
                      <div className="font-mono text-[12.5px] font-semibold text-[#9a3412]">CHECKSUM_MISMATCH</div>
                      <div className="mt-0.5 text-[12.5px] text-[#9a3412]">
                        VR-11: checksum gói tin không khớp giá trị tính lại tại kho — cảnh báo, không chặn xử lý.
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {valErrs.length > 0 && (
                <div className="mb-5">
                  <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">Lỗi validate (validation_errors[])</div>
                  <div className="overflow-hidden rounded-xl border border-border">
                    <table className="w-full border-collapse text-[13px]">
                      <thead>
                        <tr className="border-b border-border bg-neutral-50">
                          <ThSm className="w-11 text-center">STT</ThSm>
                          <ThSm>record_index</ThSm>
                          <ThSm>error_code</ThSm>
                          <ThSm>field</ThSm>
                          <ThSm className="min-w-[220px]">message</ThSm>
                        </tr>
                      </thead>
                      <tbody>
                        {valErrs.map((v, i) => (
                          <tr key={i} className="border-b border-neutral-100">
                            <td className="px-3.5 py-2.5 text-center text-foreground-muted">{i + 1}</td>
                            <td className="px-3.5 py-2.5 font-mono text-xs text-foreground">{v.idx}</td>
                            <td className="px-3.5 py-2.5">
                              <span className="rounded-[4px] border border-[#fecaca] bg-[#fef2f2] px-1.5 py-px font-mono text-[11px] text-red-600">{v.code}</span>
                            </td>
                            <td className="px-3.5 py-2.5 font-mono text-xs text-foreground">{v.field}</td>
                            <td className="px-3.5 py-2.5 text-[12.5px] text-foreground-muted">{v.message}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {hasJobErr && (
                <div>
                  <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">Lỗi job (EF-01..06)</div>
                  <div className="flex flex-col gap-2 rounded-[10px] border border-[#fecaca] bg-[#fef2f2] p-[14px_16px]">
                    <ErrRow label="error_code" value={job.errCode ?? ""} valueClass="font-mono font-semibold text-red-600" />
                    <ErrRow label="HTTP status" value={String(job.errStatus ?? "")} valueClass="font-mono text-foreground" />
                    <ErrRow label="Message" value={job.errMsg ?? ""} valueClass="text-foreground" />
                  </div>
                </div>
              )}
              {allClear && <EmptyOk title="Không có cảnh báo hoặc lỗi" desc="Gói tin được tiếp nhận và xử lý sạch — checksum khớp." />}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-none items-center justify-between gap-3 border-t border-border px-6 py-3.5">
          <Button variant="outline" onClick={onLinkB13}>
            <ArrowUpRight className="size-4" />
            Tra cứu tiến trình thu nhận
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onExport}>
              Xuất Excel
            </Button>
            <Button onClick={onClose}>Đóng</Button>
          </div>
        </div>
      </div>
    </>
  )
}

function ThSm({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <th className={cn("px-3.5 py-2.5 text-left text-[11.5px] font-semibold text-foreground-muted", className)}>{children}</th>
}

function ErrRow({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex gap-2.5 text-[13px]">
      <span className="min-w-[110px] text-foreground-muted">{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  )
}

function EmptyOk({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 px-6 py-14 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-[#dcfce7] text-[#16a34a]">
        <Check className="size-[22px]" strokeWidth={2.5} />
      </div>
      <div className="text-[14.5px] font-semibold text-foreground-strong">{title}</div>
      <div className="text-[13px] text-foreground-muted">{desc}</div>
    </div>
  )
}
