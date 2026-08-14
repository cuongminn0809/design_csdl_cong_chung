import { useState } from "react"
import { Check, ChevronRight, Info, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { useToast } from "@/features/reconciliation/components/Toast"
import { ALL_SOURCES, type GroupCfg, type RuleDef, type Variant } from "./config"
import { inputCls } from "../ingestion/shared"

export function Wizard({
  variant,
  cfg,
  rules,
  onClose,
  onLaunch,
}: {
  variant: Variant
  cfg: GroupCfg
  rules: RuleDef[]
  onClose: () => void
  onLaunch: (name: string) => void
}) {
  const showToast = useToast()
  const isClean = variant === "cleaning"
  const [step, setStep] = useState(1)
  const [name, setName] = useState("")
  const [desc, setDesc] = useState("")
  const [type, setType] = useState(cfg.subtypes[0][0])
  const [source, setSource] = useState("")
  const [expanded, setExpanded] = useState<string | null>(rules[0].id)
  const [sel, setSel] = useState<Record<string, string[]>>(Object.fromEntries(rules.map((r) => [r.id, []])))
  const [applied, setApplied] = useState<Record<string, boolean>>(Object.fromEntries(rules.map((r) => [r.id, false])))

  const typeName = cfg.subtypes.find((g) => g[0] === type)?.[1] ?? type
  const appliedCount = Object.values(applied).filter(Boolean).length
  // B3.3 kế thừa đơn vị + phiên bản từ batch B3.1
  const w_unit = ALL_SOURCES[cfg.srcKeys[0]].name
  const w_version = "v2024.12-CLEANED"
  const recordCount = isClean
    ? source
      ? "12.480 bản ghi"
      : "— (chọn nguồn để tính)"
    : "12.480 bản ghi"

  const step1Valid = name.trim() !== "" && (isClean ? source !== "" : true)

  const next = () => {
    if (!step1Valid) {
      showToast(isClean ? "Vui lòng nhập tên và chọn nguồn dữ liệu." : "Vui lòng nhập tên cấu hình.", "error")
      return
    }
    setStep(2)
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex max-h-[92vh] w-[960px] max-w-full flex-col overflow-hidden rounded-xl bg-surface shadow-popover">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-[18px]">
          <div>
            <div className="text-[17px] font-semibold tracking-[-0.01em] text-foreground-strong">Thêm cấu hình {isClean ? "làm sạch" : "chuẩn hóa"}</div>
            <div className="mt-2 flex items-center gap-2">
              <span className={cn("inline-flex size-[22px] items-center justify-center rounded-full text-xs font-bold", step === 1 ? "bg-neutral-900 text-white" : "bg-neutral-200 text-foreground-muted")}>1</span>
              <span className="text-[12.5px] text-foreground-muted">Thông tin cơ bản</span>
              <span className="h-px w-[22px] bg-border" />
              <span className={cn("inline-flex size-[22px] items-center justify-center rounded-full text-xs font-bold", step === 2 ? "bg-neutral-900 text-white" : "bg-neutral-200 text-foreground-muted")}>2</span>
              <span className="text-[12.5px] text-foreground-muted">Quy tắc {isClean ? "làm sạch" : "chuẩn hóa"}</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-[18px]" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto px-6 py-[22px]">
          {step === 1 ? (
            <div className="grid grid-cols-2 gap-4">
              <Field className="col-span-2" label="Tên cấu hình" req>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder={`VD: ${isClean ? "Làm sạch" : "Chuẩn hóa"} HĐ mua bán nhà ở — đợt 12/2024`} className={cn(inputCls, "h-[38px]")} />
              </Field>
              <Field className="col-span-2" label="Mô tả">
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} placeholder="Mô tả chi tiết tiến trình…" className="resize-y rounded-md border border-input bg-surface px-3 py-2.5 text-sm shadow-xs outline-none" />
              </Field>
              <Field label="Loại dữ liệu" req>
                <NativeSelect className="h-[38px]" value={type} onChange={(e) => setType(e.target.value)}>
                  {cfg.subtypes.map((g) => (
                    <option key={g[0]} value={g[0]}>
                      {g[1]} ({g[0]})
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              <Field label="Người xử lý">
                <input value="admin@congchung.gov.vn" readOnly className={cn(inputCls, "h-[38px] bg-surface-muted text-foreground-muted")} />
              </Field>
              {isClean ? (
                <Field label="Nguồn dữ liệu" req>
                  <NativeSelect className="h-[38px]" value={source} onChange={(e) => setSource(e.target.value)}>
                    <option value="">— Chọn nguồn —</option>
                    {cfg.srcKeys.map((id) => (
                      <option key={id} value={id}>
                        [{ALL_SOURCES[id].sys}] {ALL_SOURCES[id].name}
                      </option>
                    ))}
                  </NativeSelect>
                </Field>
              ) : (
                <Field label="Đơn vị cung cấp dữ liệu">
                  <input value={w_unit} readOnly title="Kế thừa từ batch đã làm sạch (B3.1)" className={cn(inputCls, "h-[38px] bg-surface-muted text-foreground-muted")} />
                </Field>
              )}
              {!isClean && (
                <Field label="Phiên bản dữ liệu">
                  <input value={w_version} readOnly title="Kế thừa từ batch đã làm sạch (B3.1)" className={cn(inputCls, "h-[38px] bg-surface-muted font-mono text-[13px] text-foreground-muted")} />
                </Field>
              )}
              <Field label={isClean ? "Tổng số bản ghi chờ làm sạch" : "Tổng số bản ghi đã làm sạch"}>
                <input value={recordCount} readOnly className={cn(inputCls, "h-[38px] bg-surface-muted font-semibold")} />
              </Field>
              <div className="col-span-2 flex items-start gap-[11px] rounded-[10px] border border-[#bfdbfe] bg-[#eff6ff] p-[12px_14px]">
                <Info className="mt-px size-[18px] shrink-0 text-[#2563eb]" />
                <div className="text-[12.5px] leading-normal text-[#1e40af]">
                  {isClean ? (
                    <>Chỉ các bản ghi <strong>chưa qua làm sạch</strong> thuộc nguồn &amp; loại dữ liệu đã chọn được đưa vào batch. Bản ghi đã làm sạch được bỏ qua (không ghi đè).</>
                  ) : (
                    <>Chỉ các bản ghi <strong>đã làm sạch</strong> (sau B3.1) theo đơn vị + phiên bản + loại dữ liệu kế thừa được đưa vào batch. Bộ quy tắc chuẩn hóa xác định theo bộ ba này.</>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-3.5 flex items-center gap-2">
                <span className="text-[13px] font-semibold text-foreground-strong">{typeName}</span>
                <span className="rounded-[5px] border border-border bg-surface-muted px-[7px] py-px font-mono text-[11px] text-foreground-muted">{type}</span>
              </div>
              {rules.map((rd) => {
                const exp = expanded === rd.id
                const isApplied = applied[rd.id]
                const selected = sel[rd.id] ?? []
                return (
                  <div key={rd.id} className="mb-2.5 overflow-hidden rounded-[10px] border border-border">
                    <div className={cn("flex cursor-pointer items-center gap-2.5 p-[13px_16px]", exp ? "bg-neutral-50" : "bg-surface")} onClick={() => setExpanded(exp ? null : rd.id)}>
                      <ChevronRight className={cn("size-[15px] text-foreground-muted transition-transform", exp && "rotate-90")} />
                      <span className="flex-1 text-[13.5px] font-semibold text-foreground-strong">{rd.title}</span>
                      {isApplied && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#bbf7d0] bg-[#f0fdf4] px-[9px] py-0.5 text-[11px] font-semibold text-[#15803d]">
                          <Check className="size-[11px]" strokeWidth={3} />
                          Đã áp dụng
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (!selected.length) return
                          setApplied((a) => ({ ...a, [rd.id]: true }))
                          showToast(`Đã áp dụng cấu hình nhóm ${rd.title.split(".")[0]}.`)
                        }}
                        disabled={!selected.length}
                        className={cn(
                          "rounded-[7px] border px-3 py-[5px] text-xs font-semibold",
                          selected.length ? "border-neutral-900 bg-neutral-900 text-white" : "cursor-not-allowed border-border bg-surface-muted text-foreground-subtle"
                        )}
                      >
                        Áp dụng
                      </button>
                    </div>
                    {exp && (
                      <div className="border-t border-border p-[14px_16px]">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-semibold text-foreground-strong">Chọn trường áp dụng</span>
                          <div className="flex gap-1.5 text-[11.5px]">
                            <button onClick={() => setSel((s) => ({ ...s, [rd.id]: cfg.fields.map((f) => f[0]) }))} className="text-link">Chọn tất cả</button>
                            <span className="text-border">|</span>
                            <button onClick={() => setSel((s) => ({ ...s, [rd.id]: [] }))} className="text-foreground-muted">Bỏ chọn</button>
                          </div>
                        </div>
                        <div className="grid max-h-[180px] grid-cols-3 gap-1.5 overflow-auto p-0.5">
                          {cfg.fields.map((f) => {
                            const on = selected.includes(f[0])
                            return (
                              <div
                                key={f[0]}
                                onClick={() => setSel((s) => {
                                  const set = new Set(s[rd.id] ?? [])
                                  set.has(f[0]) ? set.delete(f[0]) : set.add(f[0])
                                  return { ...s, [rd.id]: [...set] }
                                })}
                                className={cn("flex cursor-pointer items-center gap-2 rounded-[7px] border border-border p-[7px_9px]", on ? "bg-[#eff6ff]" : "bg-surface")}
                              >
                                <span className={cn("flex size-4 shrink-0 items-center justify-center rounded-[4px] border", on ? "border-neutral-900 bg-neutral-900 text-white" : "border-border-strong bg-surface")}>
                                  {on && <Check className="size-3" strokeWidth={3} />}
                                </span>
                                <div className="min-w-0">
                                  <div className="truncate text-[12.5px] leading-tight text-foreground">{f[0]}</div>
                                  <div className="font-mono text-[10px] text-foreground-subtle">{f[1]}</div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        <div className="mt-3 rounded-lg border border-border bg-surface-muted p-[12px_14px]">
                          <div className="mb-2.5 text-xs font-semibold text-foreground-strong">{rd.configTitle}</div>
                          <div className="flex flex-wrap gap-3">
                            {rd.cfgs.map((c) => (
                              <div key={c.label} className="flex min-w-[200px] flex-1 flex-col gap-1.5">
                                <label className="text-[11.5px] text-foreground-muted">{c.label}</label>
                                <input defaultValue={c.value} placeholder={c.ph} readOnly={c.ro} className="h-[34px] rounded-[7px] border border-input bg-surface px-3 text-[13px]" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-3.5">
          <div className="text-[12.5px] text-foreground-muted">
            {step === 2 && (
              <>
                Đã áp dụng <strong className="text-foreground-strong">{appliedCount}</strong> / {rules.length} nhóm quy tắc
              </>
            )}
          </div>
          <div className="flex gap-2">
            {step === 1 ? (
              <Button variant="ghost" onClick={onClose}>Hủy</Button>
            ) : (
              <Button variant="ghost" onClick={() => setStep(1)}>Quay lại</Button>
            )}
            {step === 1 ? (
              <Button onClick={next} disabled={!step1Valid}>Tiếp tục</Button>
            ) : (
              <Button onClick={() => onLaunch(name || typeName)} disabled={appliedCount === 0}>Lưu và khởi chạy</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, req, className, children }: { label: string; req?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-[12.5px] font-semibold text-foreground-strong">
        {label} {req && <span className="text-red-600">*</span>}
      </label>
      {children}
    </div>
  )
}
