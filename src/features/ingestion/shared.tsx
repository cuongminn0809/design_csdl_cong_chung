import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

export interface StatusMeta {
  label: string
  bg: string
  fg: string
  dot: string
  bd: string
}

/** Badge nguồn kiểu pill nền nhạt (A/B/C1/C2) — B1 dùng bảng màu này */
const SRC_PILL: Record<string, { bg: string; fg: string; bd: string }> = {
  A: { bg: "#eff6ff", fg: "#2563eb", bd: "#bfdbfe" },
  B: { bg: "#f0fdfa", fg: "#0d9488", bd: "#99f6e4" },
  C1: { bg: "#fffbeb", fg: "#b45309", bd: "#fde68a" },
  C2: { bg: "#faf5ff", fg: "#9333ea", bd: "#e9d5ff" },
}

export function SourcePill({ code, title }: { code: string; title?: string }) {
  const c = SRC_PILL[code] ?? SRC_PILL.A
  return (
    <span
      title={title}
      className="inline-flex items-center rounded-full px-[9px] py-0.5 text-[11.5px] font-semibold"
      style={{ background: c.bg, color: c.fg, border: `1px solid ${c.bd}` }}
    >
      {code}
    </span>
  )
}

export function StatusPill({ meta, big }: { meta: StatusMeta; big?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-semibold"
      style={{
        background: meta.bg,
        color: meta.fg,
        border: `1px solid ${meta.bd}`,
        padding: big ? "5px 12px" : "2px 10px",
        fontSize: big ? 13 : 12,
      }}
    >
      <span className="shrink-0 rounded-full" style={{ width: big ? 7 : 6, height: big ? 7 : 6, background: meta.dot }} />
      {meta.label}
    </span>
  )
}

export function IconBtn({
  title,
  onClick,
  disabled,
  danger,
  children,
}: {
  title: string
  onClick?: () => void
  disabled?: boolean
  danger?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex size-[30px] items-center justify-center rounded-[7px] border border-transparent bg-transparent transition-colors",
        disabled
          ? "cursor-not-allowed text-border-strong opacity-40"
          : danger
            ? "text-red-600 hover:bg-[#fef2f2]"
            : "text-foreground-muted hover:bg-surface-muted hover:text-foreground-strong"
      )}
    >
      {children}
    </button>
  )
}

export function Th({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <th className={cn("px-4 py-[11px] text-left text-xs font-semibold text-foreground-muted", className)}>{children}</th>
}

export function EmptyState({
  icon,
  title,
  desc,
  actionLabel,
  onAction,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 px-6 py-[72px] text-center">
      <div className="mb-2 flex size-[52px] items-center justify-center rounded-full bg-surface-muted text-foreground-subtle">{icon}</div>
      <div className="text-[15px] font-semibold text-foreground-strong">{title}</div>
      <div className="max-w-[380px] text-[13.5px] text-foreground-muted">{desc}</div>
      {actionLabel && (
        <button
          onClick={onAction}
          className="mt-3 h-9 rounded-md border border-border bg-surface px-4 text-sm font-medium text-foreground-strong shadow-xs hover:bg-surface-muted"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export function Pagination({
  page,
  pageSize,
  total,
  unit,
  onPage,
  onPageSize,
}: {
  page: number
  pageSize: number
  total: number
  unit: string
  onPage: (p: number) => void
  onPageSize: (n: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const cur = Math.min(page, totalPages)
  const start = (cur - 1) * pageSize
  const nums = Array.from({ length: totalPages }, (_, i) => i + 1).filter((n) => n === 1 || n === totalPages || Math.abs(n - cur) <= 1)

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-4 py-3">
      <div className="text-[13px] text-foreground-muted">
        Hiển thị{" "}
        <span className="font-medium text-foreground-strong">
          {total ? start + 1 : 0}–{Math.min(start + pageSize, total)}
        </span>{" "}
        trên {total.toLocaleString("vi-VN")} {unit}
      </div>
      <div className="flex items-center gap-3.5">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-foreground-muted">Số dòng/trang</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSize(+e.target.value)}
            className="h-8 cursor-pointer appearance-none rounded-[7px] border border-input bg-surface px-2.5 text-[13px]"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div className="flex items-center gap-1">
          <PageBtn disabled={cur <= 1} onClick={() => onPage(Math.max(1, cur - 1))}>
            <ChevronLeft className="size-[15px]" />
          </PageBtn>
          {nums.map((n) => (
            <button
              key={n}
              onClick={() => onPage(n)}
              className={cn(
                "h-8 min-w-8 rounded-[7px] border px-2 text-[13px]",
                n === cur ? "border-neutral-900 bg-neutral-900 font-semibold text-white" : "border-border bg-surface font-medium text-foreground"
              )}
            >
              {n}
            </button>
          ))}
          <PageBtn disabled={cur >= totalPages} onClick={() => onPage(Math.min(totalPages, cur + 1))}>
            <ChevronRight className="size-[15px]" />
          </PageBtn>
        </div>
      </div>
    </div>
  )
}

function PageBtn({ disabled, onClick, children }: { disabled: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex size-8 items-center justify-center rounded-[7px] border border-border bg-surface text-foreground disabled:cursor-not-allowed disabled:text-foreground-subtle disabled:opacity-50"
    >
      {children}
    </button>
  )
}

/** Header trang B1: tiêu đề + mô tả + actions bên phải */
export function PageHeader({ title, desc, actions }: { title: string; desc: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-5">
      <div>
        <h3 className="text-[24px] font-semibold leading-tight tracking-[-0.02em] text-foreground-strong">{title}</h3>
        <p className="mt-1.5 text-sm text-foreground-muted">{desc}</p>
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  )
}

export const inputCls =
  "h-9 w-full rounded-md border border-input bg-surface px-3 text-sm shadow-xs outline-none focus-visible:border-border-focus focus-visible:ring-[3px] focus-visible:ring-ring/50"
