import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

export interface MultiOption {
  value: string
  label: string
}

export function MultiSelect({
  label,
  options,
  selected,
  onChange,
  emptyLabel,
  itemLabel,
  width,
}: {
  label: string
  options: MultiOption[]
  selected: string[]
  onChange: (next: string[]) => void
  /** Nhãn khi chưa chọn gì */
  emptyLabel: string
  /** (n) => nhãn khi chọn nhiều, ví dụ n + " loại đã chọn" */
  itemLabel: (n: number) => string
  width?: number
}) {
  const [open, setOpen] = useState(false)

  const display =
    selected.length === 0
      ? emptyLabel
      : selected.length === 1
        ? options.find((o) => o.value === selected[0])?.label ?? itemLabel(1)
        : itemLabel(selected.length)

  const toggle = (v: string) => {
    const set = new Set(selected)
    set.has(v) ? set.delete(v) : set.add(v)
    onChange([...set])
  }

  return (
    <div className="flex flex-col gap-1.5" style={{ width }}>
      <label className="text-xs font-semibold text-foreground-strong">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-full items-center justify-between gap-2 overflow-hidden rounded-md border border-input bg-surface px-3 text-left text-sm shadow-xs"
        >
          <span className="truncate">{display}</span>
          <ChevronDown className="size-3.5 shrink-0 text-foreground-muted" />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 max-h-80 overflow-auto rounded-[10px] border border-border bg-surface p-1.5 shadow-popover">
              {options.map((opt) => {
                const checked = selected.includes(opt.value)
                return (
                  <div
                    key={opt.value}
                    onClick={() => toggle(opt.value)}
                    className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-1.5 hover:bg-surface-muted"
                  >
                    <span
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded-[4px] border",
                        checked
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-border-strong bg-surface"
                      )}
                    >
                      {checked && <Check className="size-3" strokeWidth={3} />}
                    </span>
                    <span className="text-[13px] leading-tight">{opt.label}</span>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
