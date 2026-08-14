import { useMemo, useState } from "react"
import { Building2, Eye, Pause, Pencil, Plus, RotateCcw, Search, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { MultiSelect } from "@/features/reconciliation/components/MultiSelect"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { useToast } from "@/features/reconciliation/components/Toast"
import {
  DONVI_SEED, DONVI_STATUS, PROVINCES, SRC_INFO, parseVnDate, type DonVi,
} from "./data/donvi"
import { EmptyState, IconBtn, Pagination, PageHeader, SourcePill, StatusPill, Th, inputCls } from "./shared"

interface Filter {
  name: string
  sources: string[]
  provinces: string[]
  status: "active" | "inactive"
}
const EMPTY: Filter = { name: "", sources: [], provinces: [], status: "active" }

const srcGroup = (u: DonVi) => (u.src === "C1" || u.src === "C2" ? "C" : u.src)

export function DonViCungCapPage() {
  const showToast = useToast()
  const [data] = useState<DonVi[]>(DONVI_SEED)
  const [draft, setDraft] = useState<Filter>(EMPTY)
  const [applied, setApplied] = useState<Filter>(EMPTY)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [detailCode, setDetailCode] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const nm = applied.name.trim().toLowerCase()
    return data
      .filter((u) => {
        if (u.status !== applied.status) return false
        if (nm && !u.name.toLowerCase().includes(nm) && !u.shortName.toLowerCase().includes(nm) && !u.code.toLowerCase().includes(nm)) return false
        if (applied.sources.length && !applied.sources.includes(srcGroup(u))) return false
        if (applied.provinces.length && !applied.provinces.includes(u.province)) return false
        return true
      })
      .sort((a, b) => parseVnDate(b.connected) - parseVnDate(a.connected))
  }, [data, applied])

  const start = (Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize))) - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)
  const detail = detailCode ? data.find((u) => u.code === detailCode) ?? null : null

  const doSearch = () => {
    setApplied(draft)
    setPage(1)
  }
  const doReset = () => {
    setDraft(EMPTY)
    setApplied(EMPTY)
    setPage(1)
  }

  return (
    <div>
      <PageHeader
        title="Đơn vị cung cấp dữ liệu"
        desc="Quản lý danh sách đơn vị / hệ thống nguồn đã kết nối. Đơn vị hoạt động sẽ xuất hiện khi cấu hình thu nhận B1.1 / B1.2."
        actions={
          <>
            <Button variant="outline" onClick={() => showToast("Đã làm mới danh sách đơn vị.")}>
              <RotateCcw className="size-4" />
              Làm mới
            </Button>
            <Button onClick={() => showToast("Tính năng thêm đơn vị (demo).")}>
              <Plus className="size-4" />
              Thêm đơn vị
            </Button>
          </>
        }
      />

      {/* Filter */}
      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[220px] flex-1">
            <label className="mb-1.5 block text-xs font-semibold text-foreground-strong">Tên đơn vị</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && doSearch()}
                placeholder="Nhập tên đơn vị…"
                className={cn(inputCls, "pl-9")}
              />
            </div>
          </div>
          <MultiSelect
            label="Loại nguồn"
            width={210}
            options={[
              { value: "A", label: SRC_INFO.A.label },
              { value: "B", label: SRC_INFO.B.label },
              { value: "C", label: "C — HSCDL / PMCD" },
            ]}
            selected={draft.sources}
            onChange={(v) => setDraft({ ...draft, sources: v })}
            emptyLabel="Tất cả loại nguồn"
            itemLabel={(n) => `${n} loại nguồn`}
          />
          <MultiSelect
            label="Tỉnh/Thành phố"
            width={230}
            options={PROVINCES.map((p) => ({ value: p, label: p }))}
            selected={draft.provinces}
            onChange={(v) => setDraft({ ...draft, provinces: v })}
            emptyLabel="Tất cả tỉnh/thành"
            itemLabel={(n) => `${n} tỉnh/thành`}
          />
          <div className="w-[200px]">
            <label className="mb-1.5 block text-xs font-semibold text-foreground-strong">Trạng thái</label>
            <NativeSelect value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as Filter["status"] })}>
              <option value="active">Hoạt động</option>
              <option value="inactive">Ngừng hoạt động</option>
            </NativeSelect>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={doReset}>
              Đặt lại
            </Button>
            <Button onClick={doSearch}>
              <Search className="size-4" />
              Tìm kiếm
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-0.5 mb-2.5 mt-[18px] flex items-center gap-2">
        <span className="text-[13px] text-foreground-muted">Kết quả:</span>
        <span className="text-[13px] font-semibold text-foreground-strong">{filtered.length} đơn vị</span>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        {filtered.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-neutral-50">
                    <Th className="w-[52px] text-center">STT</Th>
                    <Th>Mã nguồn</Th>
                    <Th className="min-w-[230px]">Tên đơn vị</Th>
                    <Th>Loại</Th>
                    <Th className="min-w-[150px]">Tỉnh/Thành phố</Th>
                    <Th className="min-w-[210px]">Email đầu mối</Th>
                    <Th>Trạng thái</Th>
                    <Th>Ngày kết nối</Th>
                    <Th className="w-[120px] text-center">Thao tác</Th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((u, i) => (
                    <tr key={u.code} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{start + i + 1}</td>
                      <td className="px-4 py-3 font-mono text-[12.5px] text-foreground">{u.code}</td>
                      <td className="px-4 py-3">
                        <div onClick={() => setDetailCode(u.code)} className="cursor-pointer font-medium leading-tight text-link hover:underline">
                          {u.name}
                        </div>
                        {u.shortName && <div className="mt-0.5 text-[11.5px] text-foreground-subtle">{u.shortName}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <SourcePill code={u.src} title={SRC_INFO[u.src].label} />
                      </td>
                      <td className="px-4 py-3 text-foreground">{u.province}</td>
                      <td className="px-4 py-3 text-[13px] text-foreground">{u.email}</td>
                      <td className="px-4 py-3">
                        <StatusPill meta={DONVI_STATUS[u.status]} />
                      </td>
                      <td className="px-4 py-3 tabular-nums text-foreground-muted">{u.connected}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex gap-0.5">
                          <IconBtn title="Xem chi tiết" onClick={() => setDetailCode(u.code)}>
                            <Eye className="size-4" />
                          </IconBtn>
                          <IconBtn title="Sửa" onClick={() => showToast("Mở form chỉnh sửa (demo).")}>
                            <Pencil className="size-[15px]" />
                          </IconBtn>
                          <IconBtn
                            title={u.status === "active" ? "Ngừng hoạt động" : "Đã ngừng hoạt động"}
                            disabled={u.status !== "active"}
                            onClick={() => showToast("Đã ngừng hoạt động đơn vị.")}
                          >
                            <Pause className="size-[15px]" />
                          </IconBtn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={pageSize} total={filtered.length} unit="đơn vị" onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
          </>
        ) : (
          <EmptyState
            icon={<Building2 className="size-6" />}
            title="Chưa có đơn vị"
            desc="Không tìm thấy đơn vị nào khớp với bộ lọc. Hãy đặt lại bộ lọc hoặc thêm đơn vị cung cấp mới."
            actionLabel="Đặt lại bộ lọc"
            onAction={doReset}
          />
        )}
      </div>

      {detail && <DonViDetail unit={detail} onClose={() => setDetailCode(null)} onEdit={() => showToast("Mở form chỉnh sửa (demo).")} />}
    </div>
  )
}

function DonViDetail({ unit, onClose, onEdit }: { unit: DonVi; onClose: () => void; onEdit: () => void }) {
  const rows: { label: string; value: string; span?: boolean; mono?: boolean }[][] = [
    [
      { label: "Mã nguồn kỹ thuật", value: unit.code, mono: true },
      { label: "Loại nguồn", value: SRC_INFO[unit.src].label },
      { label: "Tên đơn vị", value: unit.name, span: true },
      { label: "Tên hiển thị ngắn", value: unit.shortName || "—" },
      { label: "Tỉnh/Thành phố", value: unit.province },
    ],
    [
      { label: "Email đầu mối", value: unit.email },
      { label: "Người đầu mối kỹ thuật", value: unit.contact },
      { label: "Số điện thoại", value: unit.phone || "—" },
      { label: "Địa chỉ", value: unit.address || "—", span: true },
    ],
    [
      { label: "Phạm vi dữ liệu cung cấp", value: unit.scope || "—", span: true },
      { label: "Ghi chú", value: unit.note || "—", span: true },
      { label: "Ngày kết nối", value: unit.connected },
      { label: "Cập nhật gần nhất", value: `${unit.updatedAt} · ${unit.updatedBy}` },
    ],
  ]
  const titles = ["Định danh & nguồn", "Liên hệ", "Bổ sung"]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex max-h-[88vh] w-[760px] max-w-full flex-col overflow-hidden rounded-xl bg-surface shadow-popover">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="min-w-0">
            <div className="mb-1 text-xs font-semibold text-foreground-muted">Chi tiết đơn vị cung cấp</div>
            <div className="text-lg font-semibold leading-tight tracking-[-0.01em] text-foreground-strong">{unit.name}</div>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span className="rounded-[4px] border border-border bg-surface-muted px-1.5 py-px font-mono text-xs text-foreground-muted">{unit.code}</span>
              <SourcePill code={unit.src} title={SRC_INFO[unit.src].label} />
              <StatusPill meta={DONVI_STATUS[unit.status]} />
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-[18px]" />
          </Button>
        </div>
        <div className="flex-1 overflow-auto px-6 py-[18px]">
          {rows.map((sec, si) => (
            <div key={si}>
              <div className="my-1 mt-1.5 text-xs font-bold uppercase tracking-wider text-foreground-subtle">{titles[si]}</div>
              <div className="mb-3.5 grid grid-cols-2 gap-x-7">
                {sec.map((f) => (
                  <div key={f.label} className={cn("flex flex-col gap-0.5 border-b border-neutral-100 py-2.5", f.span && "col-span-2")}>
                    <div className="text-xs text-foreground-muted">{f.label}</div>
                    <div className={cn("text-[13.5px] leading-snug text-foreground", f.mono && "font-mono")}>{f.value}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          <Button onClick={onEdit}>
            <Pencil className="size-4" />
            Sửa
          </Button>
        </div>
      </div>
    </div>
  )
}
