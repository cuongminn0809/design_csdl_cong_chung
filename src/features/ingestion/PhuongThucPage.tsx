import { useMemo, useState } from "react"
import { Download, Eye, FileText, RotateCcw, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MultiSelect } from "@/features/reconciliation/components/MultiSelect"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { useToast } from "@/features/reconciliation/components/Toast"
import {
  HTTP_COLOR, METHOD_SEED, METHOD_SRC, METHOD_STATUS, VSTATUS, genVersions, type Method,
} from "./data/phuongthuc"
import { EmptyState, IconBtn, Pagination, PageHeader, SourcePill, StatusPill, Th, inputCls } from "./shared"

interface Filter {
  name: string
  sources: string[]
  units: string[]
  status: "active" | "inactive" | "deprecated"
}
const EMPTY: Filter = { name: "", sources: [], units: [], status: "active" }

export function PhuongThucPage() {
  const showToast = useToast()
  const [draft, setDraft] = useState<Filter>(EMPTY)
  const [applied, setApplied] = useState<Filter>(EMPTY)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [detailCode, setDetailCode] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const nm = applied.name.trim().toLowerCase()
    return METHOD_SEED.filter((m) => {
      if (m.status !== applied.status) return false
      if (nm && !m.name.toLowerCase().includes(nm)) return false
      if (applied.sources.length && !applied.sources.includes(m.src)) return false
      if (applied.units.length && m.unit && !applied.units.includes(m.unit)) return false
      return true
    }).sort((a, b) => a.name.localeCompare(b.name, "vi"))
  }, [applied])

  const start = (Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize))) - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)
  const detail = detailCode ? METHOD_SEED.find((m) => m.code === detailCode) ?? null : null

  // Đơn vị khả dụng theo nguồn đang chọn (cascade)
  const availableUnits = useMemo(() => {
    const set: string[] = []
    METHOD_SEED.forEach((m) => {
      if (!m.unit) return
      if (draft.sources.length && !draft.sources.includes(m.src)) return
      if (!set.includes(m.unit)) set.push(m.unit)
    })
    return set.sort((a, b) => a.localeCompare(b, "vi"))
  }, [draft.sources])

  const doSearch = () => { setApplied(draft); setPage(1) }
  const doReset = () => { setDraft(EMPTY); setApplied(EMPTY); setPage(1) }

  return (
    <div>
      <PageHeader
        title="Danh mục phương thức thu nhận dữ liệu"
        desc="Tra cứu catalog phương thức thu nhận dữ liệu do hệ thống cung cấp. Màn hình chỉ đọc."
        actions={
          <>
            <Button variant="outline" onClick={() => showToast("Đã làm mới danh mục.")}>
              <RotateCcw className="size-4" />
              Làm mới
            </Button>
            <Button onClick={() => showToast("Đang kết xuất danh sách phương thức…")}>
              <Download className="size-4" />
              Xuất danh sách
            </Button>
          </>
        }
      />

      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="min-w-[200px] flex-1">
            <label className="mb-1.5 block text-xs font-semibold text-foreground-strong">Tên phương thức</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
              <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} placeholder="Nhập tên phương thức…" className={cn(inputCls, "pl-9")} />
            </div>
          </div>
          <MultiSelect
            label="Nguồn dữ liệu"
            width={210}
            options={Object.entries(METHOD_SRC).map(([k, v]) => ({ value: k, label: v.label }))}
            selected={draft.sources}
            onChange={(v) => setDraft({ ...draft, sources: v, units: draft.units.filter((u) => availableUnits.includes(u)) })}
            emptyLabel="Tất cả nguồn"
            itemLabel={(n) => `${n} nguồn`}
          />
          <MultiSelect
            label="Đơn vị"
            width={230}
            options={availableUnits.map((u) => ({ value: u, label: u }))}
            selected={draft.units}
            onChange={(v) => setDraft({ ...draft, units: v })}
            emptyLabel="Tất cả đơn vị"
            itemLabel={(n) => `${n} đơn vị`}
          />
          <div className="w-[180px]">
            <label className="mb-1.5 block text-xs font-semibold text-foreground-strong">Trạng thái</label>
            <NativeSelect value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as Filter["status"] })}>
              <option value="active">Hiệu lực</option>
              <option value="inactive">Ngừng hoạt động</option>
              <option value="deprecated">Deprecated</option>
            </NativeSelect>
          </div>
        </div>
        <div className="mt-[18px] flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" onClick={doReset}>Đặt lại</Button>
          <Button onClick={doSearch}>
            <Search className="size-4" />
            Tìm kiếm
          </Button>
        </div>
      </div>

      <div className="mx-0.5 mb-2.5 mt-[18px] flex items-center gap-2">
        <span className="text-[13px] text-foreground-muted">Kết quả:</span>
        <span className="text-[13px] font-semibold text-foreground-strong">{filtered.length} phương thức</span>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        {filtered.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-neutral-50">
                    <Th className="w-[52px] text-center">STT</Th>
                    <Th className="min-w-[230px]">Tên phương thức</Th>
                    <Th>Hình thức</Th>
                    <Th>Nguồn</Th>
                    <Th className="min-w-[180px]">Đơn vị</Th>
                    <Th className="min-w-[230px]">Endpoint</Th>
                    <Th>Version</Th>
                    <Th>Trạng thái</Th>
                    <Th className="w-16 text-center">Thao tác</Th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((m, i) => (
                    <tr key={m.code} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{start + i + 1}</td>
                      <td className="px-4 py-3">
                        <div onClick={() => setDetailCode(m.code)} className="cursor-pointer font-medium leading-tight text-link hover:underline">{m.name}</div>
                        <div className="mt-0.5 font-mono text-[11.5px] text-foreground-subtle">{m.code}</div>
                      </td>
                      <td className="px-4 py-3"><Badge variant="secondary">API</Badge></td>
                      <td className="px-4 py-3"><SourcePill code={m.src} title={METHOD_SRC[m.src].label} /></td>
                      <td className="max-w-[220px] px-4 py-3 text-foreground">{m.unit ?? "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="rounded-[4px] border border-border bg-surface-muted px-1.5 py-px font-mono text-[11px] font-bold" style={{ color: HTTP_COLOR[m.http] }}>{m.http}</span>
                          <span className="whitespace-nowrap font-mono text-xs text-foreground-muted">{m.ep}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[12.5px] text-foreground">{m.ver}</td>
                      <td className="px-4 py-3"><StatusPill meta={METHOD_STATUS[m.status]} /></td>
                      <td className="px-4 py-3 text-center">
                        <IconBtn title="Xem chi tiết" onClick={() => setDetailCode(m.code)}>
                          <Eye className="size-4" />
                        </IconBtn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={pageSize} total={filtered.length} unit="phương thức" onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
          </>
        ) : (
          <EmptyState
            icon={<FileText className="size-6" />}
            title="Chưa có dữ liệu"
            desc="Không tìm thấy phương thức thu nhận nào khớp với bộ lọc hiện tại. Hãy thử điều chỉnh hoặc đặt lại bộ lọc."
            actionLabel="Đặt lại bộ lọc"
            onAction={doReset}
          />
        )}
      </div>

      {detail && <MethodDetail method={detail} onClose={() => setDetailCode(null)} />}
    </div>
  )
}

function MethodDetail({ method, onClose }: { method: Method; onClose: () => void }) {
  const [tab, setTab] = useState<"info" | "version">("info")
  const versions = genVersions(method)

  const general: { label: string; value: string }[] = [
    { label: "Mã phương thức", value: method.code },
    { label: "Nguồn dữ liệu", value: METHOD_SRC[method.src].label },
    { label: "Đơn vị", value: method.unit ?? "— (dùng chung nội bộ)" },
    { label: "Mô tả", value: method.desc },
    ...(method.note ? [{ label: "Ghi chú", value: method.note }] : []),
  ]
  const api: { label: string; value: string }[] = [
    { label: "Hình thức", value: "API" },
    { label: "HTTP Method", value: method.http },
    { label: "Endpoint", value: method.ep },
    { label: "Định dạng payload", value: method.payload },
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex max-h-[88vh] w-[720px] max-w-full flex-col overflow-hidden rounded-xl bg-surface shadow-popover">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="min-w-0">
            <div className="mb-1 text-xs font-semibold text-foreground-muted">Chi tiết phương thức thu nhận</div>
            <div className="text-lg font-semibold leading-tight tracking-[-0.01em] text-foreground-strong">{method.name}</div>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span className="rounded-[4px] border border-border bg-surface-muted px-1.5 py-px font-mono text-xs text-foreground-muted">{method.code}</span>
              <Badge variant="secondary">API</Badge>
              <SourcePill code={method.src} title={METHOD_SRC[method.src].label} />
              <StatusPill meta={METHOD_STATUS[method.status]} />
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>✕</Button>
        </div>

        <div className="flex gap-1 border-b border-border px-6 pt-3.5">
          {(["info", "version"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={cn(
                "border-b-2 px-3 py-2.5 text-sm",
                tab === k ? "border-neutral-900 font-semibold text-foreground-strong" : "border-transparent font-medium text-foreground-muted"
              )}
            >
              {k === "info" ? "Thông tin" : "Phiên bản"}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto px-6 py-[18px]">
          {tab === "info" ? (
            <div>
              {general.map((f) => (
                <Row key={f.label} label={f.label} value={f.value} />
              ))}
              <div className="mb-1 mt-5 text-xs font-bold uppercase tracking-wider text-foreground-subtle">Cấu hình API</div>
              {api.map((f) => (
                <Row key={f.label} label={f.label} value={f.value} mono={f.label === "Endpoint"} />
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-[10px] border border-border">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-neutral-50">
                    <Th className="px-3.5 py-2.5">Version</Th>
                    <Th className="px-3.5 py-2.5">Trạng thái</Th>
                    <Th className="px-3.5 py-2.5">Phát hành</Th>
                    <Th className="px-3.5 py-2.5">Ngừng hỗ trợ</Th>
                    <Th className="min-w-[200px] px-3.5 py-2.5">Mô tả thay đổi</Th>
                  </tr>
                </thead>
                <tbody>
                  {versions.map((v) => {
                    const vs = VSTATUS[v.status]
                    return (
                      <tr key={v.version} className="border-b border-neutral-100">
                        <td className="px-3.5 py-2.5 font-mono font-medium text-foreground">{v.version}</td>
                        <td className="px-3.5 py-2.5">
                          <span className="inline-flex items-center rounded-full px-[9px] py-0.5 text-[11.5px] font-semibold" style={{ background: vs.bg, color: vs.fg }}>{vs.label}</span>
                        </td>
                        <td className="px-3.5 py-2.5 text-foreground-muted">{v.released}</td>
                        <td className="px-3.5 py-2.5 text-foreground-muted">{v.eol ?? "—"}</td>
                        <td className="px-3.5 py-2.5 leading-snug text-foreground">{v.changelog}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-border px-6 py-4">
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex gap-4 border-b border-neutral-100 py-2.5">
      <div className="w-[170px] flex-none text-[13px] text-foreground-muted">{label}</div>
      <div className={cn("flex-1 text-[13.5px] leading-normal text-foreground", mono && "font-mono")}>{value}</div>
    </div>
  )
}
