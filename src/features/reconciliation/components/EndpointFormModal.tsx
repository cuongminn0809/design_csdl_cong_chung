import { useEffect, useState } from "react"
import { Check, CircleCheck, Copy, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NativeSelect } from "./NativeSelect"
import type { ReconDataset, ReconEndpoint } from "../types"
import { useToast } from "./Toast"

export type FormMode = "create" | "edit" | "view"

const FORM_TABS: [string, string][] = [
  ["general", "Thông tin chung"],
  ["scope", "Phạm vi đối soát"],
  ["api", "Thông tin kỹ thuật API"],
]

const inputCls =
  "h-[38px] rounded-md border border-input bg-surface px-3 text-sm shadow-xs outline-none focus-visible:border-border-focus focus-visible:ring-[3px] focus-visible:ring-ring/50"
const roInputCls = "h-[38px] rounded-md border border-border bg-surface-muted px-3 font-mono text-[13px] text-foreground-muted"
const labelCls = "text-[12.5px] font-semibold text-foreground-strong"

export function EndpointFormModal({
  mode,
  endpoint,
  data,
  onClose,
}: {
  mode: FormMode
  endpoint?: ReconEndpoint
  data: ReconDataset
  onClose: () => void
}) {
  const showToast = useToast()
  const [tab, setTab] = useState("general")

  const firstSrc = Object.keys(data.sources)[0]
  const [name, setName] = useState(mode === "create" ? "" : `Đối soát ${data.groupLabel} — ${endpoint ? data.sources[endpoint.src].name : ""}`)
  const [source, setSource] = useState(endpoint?.src ?? firstSrc)
  const [type, setType] = useState(endpoint?.type ?? data.types[0][0])
  const [desc, setDesc] = useState("")
  const [status, setStatus] = useState<"active" | "paused">(endpoint?.status ?? "active")
  const [packetType, setPacketType] = useState("detail")
  const [syncThreshold, setSyncThreshold] = useState("1000")
  const [maxRecords, setMaxRecords] = useState("10000")
  const [maxSize, setMaxSize] = useState("50")
  const [baseUrl, setBaseUrl] = useState("https://kho-csdlcc.gov.vn")
  const [path, setPath] = useState(`/api/v1/reconciliation/${data.apiBase}/{${data.codeName}}`)
  const [auth, setAuth] = useState(endpoint?.auth ?? "API Key")
  const [headerName, setHeaderName] = useState("X-API-Key")
  const [apiKey, setApiKey] = useState("sk_live_9f2a****7c31")
  const [timeout, setTimeoutMs] = useState("30000")
  const [ssl, setSsl] = useState(true)
  const [callback, setCallback] = useState(false)

  useEffect(() => {
    setTab("general")
  }, [mode, endpoint])

  const readOnly = mode === "view"
  const urlError = ssl && baseUrl.trim() !== "" && !/^https:\/\//i.test(baseUrl.trim())
  const saveDisabled = !name.trim() || !type || readOnly

  const title = mode === "create" ? `Cấu hình endpoint tiếp nhận đối soát ${data.groupLabel}` : mode === "edit" ? "Chỉnh sửa cấu hình endpoint" : "Xem cấu hình endpoint"

  const reqSample = `{
  "packet_id": "PKT-NTPM-9f2a13",
  "source_system_id": "${source}",
  "${data.codeName}": "${type}",
  "sent_at": "2024-11-21T08:32:10Z",
  "checksum": "sha256:9a1f…",
  "records": [
    { "SoCongChung": "2024/001.203",
      "NgayCongChung": "2024-03-14", … }
  ]
}`
  const resSample = `{
  "reconciliation_id": "RC-GDCC-2411-0087",
  "status": "Hoàn thành có sai lệch",
  "summary": {
    "total": 1203, "matched": 1200,
    "mismatched": 3, "only_in_warehouse": 0,
    "only_in_source": 0, "validation_skipped": 0
  },
  "mismatches": [ … ]
}`

  const save = () => {
    if (urlError) {
      setTab("api")
      return
    }
    onClose()
    showToast("Lưu cấu hình endpoint thành công.")
  }

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6">
      <div className="flex max-h-[92vh] w-[960px] max-w-full flex-col overflow-hidden rounded-xl bg-surface shadow-popover">
        {/* Header */}
        <div className="flex flex-none items-start justify-between gap-4 border-b border-border px-6 py-[18px]">
          <div>
            <div className="text-[17px] font-semibold tracking-[-0.01em] text-foreground-strong">{title}</div>
            <div className="mt-[3px] text-[12.5px] text-foreground-muted">
              Thông tin kho cung cấp cho hệ thống nguồn [A]/[B] — không tạo gói tin thay nguồn.
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-[18px]" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex flex-none gap-1 overflow-x-auto border-b border-border px-6 pt-2.5">
          {FORM_TABS.map(([k, l]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={cn(
                "mr-4 whitespace-nowrap border-b-2 px-1.5 py-[11px] text-[13.5px]",
                tab === k ? "border-neutral-900 font-semibold text-foreground-strong" : "border-transparent font-medium text-foreground-muted"
              )}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Body */}
        <fieldset disabled={readOnly} className="flex-1 overflow-auto px-6 py-[22px]">
          {tab === "general" && (
            <div className="grid grid-cols-2 gap-4">
              <Field className="col-span-2" label="Tên cấu hình" required>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Đối soát GDCC — NTPM toàn quốc" className={inputCls} />
              </Field>
              <Field label="Hệ thống nguồn" required>
                <NativeSelect className="h-[38px]" value={source} onChange={(e) => setSource(e.target.value)}>
                  {Object.entries(data.sources).map(([id, s]) => (
                    <option key={id} value={id}>
                      [{s.sys}] {s.name}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              <Field label="source_system_id">
                <input value={source} readOnly className={roInputCls} />
              </Field>
              <Field label={data.typeLabel} required>
                <NativeSelect className="h-[38px]" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="GENERIC">Generic (route param — tất cả loại)</option>
                  {data.types.map((g) => (
                    <option key={g[0]} value={g[0]}>
                      {g[1]} ({g[0]})
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              <Field label={data.codeName}>
                <input value={type} readOnly className={roInputCls} />
              </Field>
              <Field className="col-span-2" label="Mô tả">
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={2}
                  placeholder="Ghi chú nội bộ về cấu hình endpoint này…"
                  className="resize-y rounded-md border border-input bg-surface px-3 py-2.5 text-sm shadow-xs outline-none focus-visible:border-border-focus focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
              </Field>
              <Field className="col-span-2" label="Trạng thái">
                <div className="flex gap-2">
                  <SegBtn on={status === "active"} onClick={() => setStatus("active")}>
                    Hoạt động
                  </SegBtn>
                  <SegBtn on={status === "paused"} onClick={() => setStatus("paused")}>
                    Tạm dừng
                  </SegBtn>
                </div>
                <div className="text-[11.5px] text-foreground-subtle">Tạm dừng → kho từ chối gói tin đối soát từ nguồn này (EF-02).</div>
              </Field>
            </div>
          )}

          {tab === "scope" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Loại dữ liệu gói tin" required>
                  <NativeSelect className="h-[38px]" value={packetType} onChange={(e) => setPacketType(e.target.value)}>
                    <option value="detail">Chi tiết bản ghi</option>
                    <option value="checksum">Checksum only</option>
                  </NativeSelect>
                </Field>
                <Field label="Ngưỡng xử lý đồng bộ (bản ghi)" required>
                  <input value={syncThreshold} onChange={(e) => setSyncThreshold(e.target.value)} className={inputCls} />
                </Field>
                <Field label="Số bản ghi tối đa/gói" required>
                  <input value={maxRecords} onChange={(e) => setMaxRecords(e.target.value)} className={inputCls} />
                </Field>
                <Field label="Dung lượng tối đa (MB)" required>
                  <input value={maxSize} onChange={(e) => setMaxSize(e.target.value)} className={inputCls} />
                </Field>
              </div>
              <div className="mt-4 rounded-[10px] border border-border bg-surface-muted p-[14px_16px]">
                <div className="mb-1.5 text-[11.5px] font-semibold text-foreground-muted">Khóa đối soát (chỉ đọc)</div>
                <code className="font-mono text-[13px] text-foreground">{data.reconKey}</code>
              </div>
              <div className="mt-[18px]">
                <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">
                  Trường so khớp — Schema Registry (chỉ đọc)
                </div>
                <div className="overflow-hidden rounded-[10px] border border-border">
                  <table className="w-full border-collapse text-[13px]">
                    <thead>
                      <tr className="border-b border-border bg-neutral-50">
                        <ThSm>Trường nguồn</ThSm>
                        <ThSm>Kiểu DL</ThSm>
                        <ThSm>Trường đích (CSDLCC)</ThSm>
                        <ThSm className="text-center">Bắt buộc</ThSm>
                      </tr>
                    </thead>
                    <tbody>
                      {data.schemaFields.map((s) => (
                        <tr key={s.src} className="border-b border-neutral-100">
                          <td className="px-3.5 py-2.5 font-mono text-xs text-foreground">{s.src}</td>
                          <td className="px-3.5 py-2.5 text-foreground-muted">{s.type}</td>
                          <td className="px-3.5 py-2.5 font-mono text-xs text-foreground">{s.dest}</td>
                          <td className="px-3.5 py-2.5 text-center">
                            {s.req ? <Check className="mx-auto size-3.5 text-[#16a34a]" strokeWidth={3} /> : <span className="text-foreground-subtle">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {tab === "api" && (
            <div className="grid grid-cols-2 gap-4">
              <Field className="col-span-2" label="Base URL (kho)" required>
                <input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} className={cn(inputCls, "font-mono text-[13px]")} />
                {urlError && <span className="text-xs text-red-600">Base URL phải là HTTPS khi bật SSL Required.</span>}
              </Field>
              <Field className="col-span-2" label="Endpoint Path" required>
                <input value={path} onChange={(e) => setPath(e.target.value)} className={cn(inputCls, "font-mono text-[13px]")} />
              </Field>
              <Field label="Method">
                <div className="flex h-[38px] items-center rounded-md border border-border bg-surface-muted px-3">
                  <span className="rounded-[4px] bg-[#16a34a] px-[7px] py-0.5 font-mono text-[11px] font-semibold text-white">POST</span>
                </div>
              </Field>
              <Field label="Content-Type">
                <input value="application/json" readOnly className={roInputCls} />
              </Field>
              <Field label="Loại xác thực" required>
                <NativeSelect className="h-[38px]" value={auth} onChange={(e) => setAuth(e.target.value as ReconEndpoint["auth"])}>
                  <option value="API Key">API Key</option>
                  <option value="OAuth2">OAuth2</option>
                  <option value="mTLS">mTLS</option>
                </NativeSelect>
              </Field>
              <Field label="Header Name">
                <input value={headerName} onChange={(e) => setHeaderName(e.target.value)} className={cn(inputCls, "font-mono text-[13px]")} />
              </Field>
              <Field label="API Key / Credential" required>
                <div className="flex gap-1.5">
                  <input value={apiKey} readOnly type="password" className={cn(roInputCls, "flex-1")} />
                  <Button
                    variant="outline"
                    onClick={() => {
                      setApiKey(`sk_live_${Math.random().toString(36).slice(2, 6)}****${Math.random().toString(36).slice(2, 6)}`)
                      showToast("Đã sinh API Key mới.")
                    }}
                  >
                    Sinh mới
                  </Button>
                </div>
              </Field>
              <Field label="Timeout khuyến nghị (ms)">
                <input value={timeout} onChange={(e) => setTimeoutMs(e.target.value)} className={inputCls} />
              </Field>
              <div className="col-span-2 flex flex-wrap gap-5 rounded-[10px] border border-border bg-surface-muted p-[12px_14px]">
                <CheckboxRow checked={ssl} onToggle={() => setSsl((v) => !v)} label="SSL Required" />
                <CheckboxRow checked={callback} onToggle={() => setCallback((v) => !v)} label="Cho phép nguồn gửi callback_url (AF-02)" />
              </div>
              <Field label="Request Sample (JSON)">
                <textarea value={reqSample} readOnly rows={7} className="resize-y rounded-md border border-border bg-neutral-950 p-[10px_12px] font-mono text-[11.5px] leading-normal text-[#e5e5e5]" />
              </Field>
              <Field label="Response Sample (JSON)">
                <textarea value={resSample} readOnly rows={7} className="resize-y rounded-md border border-border bg-neutral-950 p-[10px_12px] font-mono text-[11.5px] leading-normal text-[#e5e5e5]" />
              </Field>
            </div>
          )}
        </fieldset>

        {/* Footer */}
        <div className="flex flex-none flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-3.5">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => showToast("Kết nối endpoint thành công (HTTP 200).")}>
              <CircleCheck className="size-4" />
              Kiểm tra kết nối
            </Button>
            <Button variant="outline" onClick={() => showToast("Đã sao chép Integration Pack vào clipboard.")}>
              <Copy className="size-4" />
              Sao chép Integration Pack
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Hủy
            </Button>
            <Button onClick={save} disabled={saveDisabled}>
              Lưu cấu hình
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, required, className, children }: { label: string; required?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className={labelCls}>
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      {children}
    </div>
  )
}

function SegBtn({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "max-w-[180px] flex-1 rounded-md border px-3.5 py-[9px] text-[13.5px]",
        on ? "border-neutral-900 bg-neutral-900 font-semibold text-white" : "border-input bg-surface font-medium text-foreground"
      )}
    >
      {children}
    </button>
  )
}

function CheckboxRow({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) {
  return (
    <div onClick={onToggle} className="flex cursor-pointer items-center gap-2.5">
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-[4px] border",
          checked ? "border-neutral-900 bg-neutral-900 text-white" : "border-border-strong bg-surface"
        )}
      >
        {checked && <Check className="size-3" strokeWidth={3} />}
      </span>
      <span className="text-[13px] text-foreground">{label}</span>
    </div>
  )
}

function ThSm({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <th className={cn("px-3.5 py-2.5 text-left text-[11.5px] font-semibold text-foreground-muted", className)}>{children}</th>
}
