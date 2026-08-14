import type { StatusMeta } from "../statusMeta"
import { SOURCE_BADGE_COLOR, pillStyle, dotStyle } from "../statusMeta"
import type { SourceInfo } from "../types"

export function SourceBadge({ sys }: { sys: SourceInfo["sys"] }) {
  return (
    <span
      className="shrink-0 rounded-[4px] px-[5px] py-0.5 font-mono text-[10px] font-bold text-white"
      style={{ background: SOURCE_BADGE_COLOR[sys] ?? "#525252" }}
    >
      [{sys}]
    </span>
  )
}

export function StatusPill({ meta }: { meta: StatusMeta }) {
  return (
    <span style={pillStyle(meta)}>
      <span style={dotStyle(meta.dot)} />
      {meta.label}
    </span>
  )
}

/** Nút icon nhỏ trong cột Thao tác */
export function IconButton({
  title,
  onClick,
  danger,
  children,
}: {
  title: string
  onClick?: () => void
  danger?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={
        "inline-flex size-[30px] items-center justify-center rounded-[7px] border border-transparent bg-transparent text-foreground-muted transition-colors " +
        (danger
          ? "hover:bg-[#fef2f2] hover:text-red-600"
          : "hover:bg-surface-muted hover:text-foreground-strong")
      }
    >
      {children}
    </button>
  )
}
