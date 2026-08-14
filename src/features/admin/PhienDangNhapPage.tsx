import { useMemo, useState } from "react"
import { Download, Eye, Globe, LogOut, Monitor, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { useToast } from "@/features/reconciliation/components/Toast"
import { EmptyState, IconBtn, Pagination, PageHeader, StatusPill, Th, inputCls, type StatusMeta } from "../ingestion/shared"

interface Session {
  sid: string
  acc: string
  name: string
  unit: string
  loginAt: string
  ip: string
  browser: string
  os: string
  device: string
  status: "active" | "ended"
  lastActive: string
}

const ST: Record<string, StatusMeta> = {
  active: { label: "Đang hoạt động", dot: "#16a34a", bg: "#f0fdf4", fg: "#15803d", bd: "#bbf7d0" },
  ended: { label: "Đã đăng xuất", dot: "#737373", bg: "#f5f5f5", fg: "#525252", bd: "#e5e5e5" },
}

const SEED: Session[] = [
  { sid: "sess-9f3a2c", acc: "anhpq", name: "Phạm Quốc Anh", unit: "Bộ Tư pháp", loginAt: "15/07/2026 09:41:18", ip: "10.24.1.15", browser: "Chrome 126", os: "Windows 11", device: "Máy trạm", status: "active", lastActive: "15/07/2026 10:12:04" },
  { sid: "sess-1a7b8e", acc: "huongtt", name: "Trần Thị Hương", unit: "Sở Tư pháp TP. Hà Nội", loginAt: "15/07/2026 09:15:47", ip: "118.70.12.88", browser: "Cốc Cốc 118", os: "Windows 10", device: "Máy trạm", status: "active", lastActive: "15/07/2026 10:09:31" },
  { sid: "sess-6c2d94", acc: "namlh", name: "Lê Hoàng Nam", unit: "Sở Tư pháp TP. Hồ Chí Minh", loginAt: "15/07/2026 08:52:09", ip: "203.113.45.7", browser: "Safari 17", os: "macOS 14", device: "Máy trạm", status: "active", lastActive: "15/07/2026 09:58:22" },
  { sid: "sess-b83f01", acc: "chaunb", name: "Ngô Bảo Châu", unit: "Bộ Tư pháp", loginAt: "15/07/2026 08:30:41", ip: "10.24.1.42", browser: "Chrome 126", os: "Windows 11", device: "Máy trạm", status: "active", lastActive: "15/07/2026 10:01:55" },
  { sid: "sess-4e5a6d", acc: "thanhnv", name: "Nguyễn Văn Thành", unit: "VPCC Nguyễn Huệ", loginAt: "15/07/2026 08:04:12", ip: "171.244.9.201", browser: "Chrome Mobile 126", os: "Android 14", device: "Điện thoại", status: "active", lastActive: "15/07/2026 09:47:10" },
  { sid: "sess-7d1c3b", acc: "khoavd", name: "Vũ Đình Khoa", unit: "Sở Tư pháp Hải Phòng", loginAt: "15/07/2026 07:33:11", ip: "123.16.55.90", browser: "Edge 126", os: "Windows 10", device: "Máy trạm", status: "ended", lastActive: "15/07/2026 08:20:44" },
  { sid: "sess-2f8e5a", acc: "lanhtt", name: "Đặng Thu Hà", unit: "Sở Tư pháp TP. Hà Nội", loginAt: "14/07/2026 22:04:56", ip: "118.70.12.91", browser: "Chrome 126", os: "Windows 11", device: "Máy trạm", status: "ended", lastActive: "14/07/2026 23:15:02" },
  { sid: "sess-9b4d7f", acc: "mailtt", name: "Lý Thị Mai", unit: "VPCC Trần Phú", loginAt: "14/07/2026 21:47:33", ip: "42.116.7.14", browser: "Cốc Cốc 118", os: "Windows 10", device: "Máy trạm", status: "ended", lastActive: "14/07/2026 22:30:19" },
  { sid: "sess-3a6c8e", acc: "sonbt", name: "Bùi Thanh Sơn", unit: "Sở Tư pháp Đà Nẵng", loginAt: "14/07/2026 20:12:08", ip: "203.162.88.5", browser: "Firefox 128", os: "Ubuntu 24", device: "Máy trạm", status: "ended", lastActive: "14/07/2026 21:02:47" },
  { sid: "sess-8e2f5b", acc: "tuanhm", name: "Hoàng Minh Tuấn", unit: "Cục C06 - Bộ Công an", loginAt: "14/07/2026 18:55:41", ip: "10.50.3.9", browser: "Chrome 125", os: "Windows 11", device: "Máy trạm", status: "ended", lastActive: "14/07/2026 19:40:33" },
  { sid: "sess-1d9a4c", acc: "longvq", name: "Vũ Quang Long", unit: "VPCC Bảo Tín", loginAt: "14/07/2026 17:30:22", ip: "171.255.10.66", browser: "Safari Mobile 17", os: "iOS 18", device: "Điện thoại", status: "ended", lastActive: "14/07/2026 18:12:09" },
  { sid: "sess-5c3e8a", acc: "hoapt", name: "Phan Thị Hoa", unit: "PCC số 1 TP. Hà Nội", loginAt: "14/07/2026 15:02:19", ip: "118.70.12.77", browser: "Chrome 126", os: "Windows 10", device: "Máy trạm", status: "ended", lastActive: "14/07/2026 16:20:41" },
]

interface Filter { kw: string; unit: string; status: string; from: string }
const EMPTY: Filter = { kw: "", unit: "", status: "all", from: "" }

const dParse = (s: string) => {
  const [dp, tp] = s.split(" ")
  const [dd, mm, yy] = dp.split("/")
  const [h, mi] = tp.split(":")
  return new Date(+yy, +mm - 1, +dd, +h, +mi).getTime()
}

export function PhienDangNhapPage() {
  const showToast = useToast()
  const [data, setData] = useState<Session[]>(SEED)
  const [draft, setDraft] = useState<Filter>(EMPTY)
  const [applied, setApplied] = useState<Filter>(EMPTY)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selected, setSelected] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<string | null>(null)

  const unitOptions = useMemo(() => [...new Set(data.map((r) => r.unit))].sort((a, b) => a.localeCompare(b, "vi")), [data])

  const filtered = useMemo(() => {
    const kw = applied.kw.trim().toLowerCase()
    const fromT = applied.from ? new Date(applied.from).getTime() : null
    return data
      .filter((r) => {
        if (kw && !r.acc.toLowerCase().includes(kw) && !r.name.toLowerCase().includes(kw) && !r.ip.toLowerCase().includes(kw) && !r.sid.toLowerCase().includes(kw)) return false
        if (applied.unit && r.unit !== applied.unit) return false
        if (applied.status !== "all" && r.status !== applied.status) return false
        if (fromT && dParse(r.loginAt) < fromT) return false
        return true
      })
      .sort((x, y) => dParse(y.loginAt) - dParse(x.loginAt))
  }, [data, applied])

  const start = (Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize))) - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)
  const detail = selected ? data.find((r) => r.sid === selected) ?? null : null
  const confirmSess = confirm ? data.find((r) => r.sid === confirm) ?? null : null

  const activeCount = data.filter((x) => x.status === "active").length
  const endedCount = data.filter((x) => x.status === "ended").length
  const onlineUsers = new Set(data.filter((x) => x.status === "active").map((x) => x.acc)).size

  const doSearch = () => { setApplied(draft); setPage(1) }
  const doReset = () => { setDraft(EMPTY); setApplied(EMPTY); setPage(1) }
  const doLogout = () => {
    if (!confirm) return
    setData((d) => d.map((x) => (x.sid === confirm ? { ...x, status: "ended" as const } : x)))
    setConfirm(null)
    showToast("Đã buộc đăng xuất phiên")
  }

  return (
    <div>
      <PageHeader
        title="Quản lý phiên đăng nhập"
        desc="Theo dõi phiên đăng nhập đang hoạt động và buộc đăng xuất khi cần."
        actions={
          <Button variant="outline" onClick={() => showToast("Đã xuất danh sách phiên đăng nhập")}>
            <Download className="size-4" />
            Xuất danh sách
          </Button>
        }
      />

      <div className="mb-[18px] grid grid-cols-1 gap-3.5 md:grid-cols-3">
        <Kpi label="Phiên đang hoạt động" value={activeCount} color="#16a34a" bg="#f0fdf4" icon={<Monitor className="size-[18px]" />} />
        <Kpi label="Người dùng online" value={onlineUsers} color="#2563eb" bg="#eff6ff" icon={<Globe className="size-[18px]" />} />
        <Kpi label="Phiên đã đăng xuất" value={endedCount} color="#525252" bg="#f5f5f5" icon={<LogOut className="size-[18px]" />} />
      </div>

      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[240px] flex-1">
            <label className="mb-1.5 block text-xs font-semibold text-foreground-strong">Tìm kiếm</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
              <input value={draft.kw} onChange={(e) => setDraft({ ...draft, kw: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} placeholder="Tài khoản, họ tên, IP, mã phiên…" className={cn(inputCls, "pl-9")} />
            </div>
          </div>
          <div className="w-[230px]">
            <label className="mb-1.5 block text-xs font-semibold text-foreground-strong">Đơn vị</label>
            <NativeSelect value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value })}>
              <option value="">Tất cả đơn vị</option>
              {unitOptions.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </NativeSelect>
          </div>
          <div className="w-[180px]">
            <label className="mb-1.5 block text-xs font-semibold text-foreground-strong">Trạng thái</label>
            <NativeSelect value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
              <option value="all">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="ended">Đã đăng xuất</option>
            </NativeSelect>
          </div>
          <div className="w-[170px]">
            <label className="mb-1.5 block text-xs font-semibold text-foreground-strong">Đăng nhập từ</label>
            <input type="date" value={draft.from} onChange={(e) => setDraft({ ...draft, from: e.target.value })} className={cn(inputCls, "text-[13.5px]")} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={doReset}>Xóa bộ lọc</Button>
            <Button onClick={doSearch}>
              <Search className="size-4" />
              Tìm kiếm
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-0.5 mb-2.5 mt-[18px] flex items-center gap-2">
        <span className="text-[13px] text-foreground-muted">Kết quả:</span>
        <span className="text-[13px] font-semibold text-foreground-strong">{filtered.length} phiên</span>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        {filtered.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-neutral-50">
                    <Th className="w-[52px] text-center">STT</Th>
                    <Th>Tài khoản</Th>
                    <Th className="min-w-[160px]">Họ tên</Th>
                    <Th className="min-w-[190px]">Đơn vị</Th>
                    <Th className="min-w-[150px]">Đăng nhập lúc</Th>
                    <Th>Địa chỉ IP</Th>
                    <Th className="min-w-[150px]">Trình duyệt</Th>
                    <Th>Trạng thái</Th>
                    <Th className="w-[90px] text-center">Thao tác</Th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((r, i) => (
                    <tr key={r.sid} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{start + i + 1}</td>
                      <td className="px-4 py-3"><span className="font-mono text-[12.5px] text-link">{r.acc}</span></td>
                      <td className="px-4 py-3 font-medium text-foreground">{r.name}</td>
                      <td className="px-4 py-3 text-foreground-muted">{r.unit}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-[13px] tabular-nums text-foreground-muted">{r.loginAt}</td>
                      <td className="px-4 py-3 font-mono text-xs text-foreground-muted">{r.ip}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-[13px] text-foreground">
                          <Globe className="size-3.5 shrink-0 opacity-70" />
                          {r.browser}
                        </div>
                      </td>
                      <td className="px-4 py-3"><StatusPill meta={ST[r.status]} /></td>
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex gap-0.5">
                          <IconBtn title="Xem chi tiết" onClick={() => setSelected(r.sid)}><Eye className="size-4" /></IconBtn>
                          {r.status === "active" && (
                            <IconBtn title="Buộc đăng xuất" danger onClick={() => setConfirm(r.sid)}><LogOut className="size-[15px]" /></IconBtn>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={pageSize} total={filtered.length} unit="phiên" onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
          </>
        ) : (
          <EmptyState
            icon={<Monitor className="size-6" />}
            title="Không tìm thấy dữ liệu phù hợp"
            desc="Không có phiên đăng nhập nào khớp với bộ lọc hiện tại."
            actionLabel="Xóa bộ lọc"
            onAction={doReset}
          />
        )}
      </div>

      {detail && (
        <SessionDetail
          s={detail}
          onClose={() => setSelected(null)}
          onLogout={() => { setSelected(null); setConfirm(detail.sid) }}
        />
      )}
      {confirmSess && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={() => setConfirm(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-[460px] max-w-full overflow-hidden rounded-xl bg-surface shadow-popover">
            <div className="px-6 pb-[18px] pt-[22px]">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex size-[38px] shrink-0 items-center justify-center rounded-full bg-[#fffbeb] text-[#b45309]"><LogOut className="size-[19px]" /></div>
                <div className="text-[17px] font-semibold text-foreground-strong">Buộc đăng xuất phiên</div>
              </div>
              <p className="text-[13.5px] leading-relaxed text-foreground-muted">
                Phiên của tài khoản "<span className="font-semibold text-foreground-strong">{confirmSess.name}</span>" sẽ bị chấm dứt ngay. Người dùng cần đăng nhập lại để tiếp tục sử dụng hệ thống.
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t border-border bg-neutral-50 px-6 py-3.5">
              <Button variant="outline" onClick={() => setConfirm(null)}>Hủy bỏ</Button>
              <button onClick={doLogout} className="h-9 rounded-md border border-red-600 bg-red-600 px-4 text-sm font-medium text-white shadow-xs hover:bg-[#b91c1c]">Buộc đăng xuất</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Kpi({ label, value, color, bg, icon }: { label: string; value: number; color: string; bg: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-[14px] border border-border bg-surface p-[18px_20px] shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-foreground-muted">{label}</span>
        <div className="flex size-[34px] items-center justify-center rounded-[9px]" style={{ background: bg, color }}>{icon}</div>
      </div>
      <div className="mt-2.5 text-[30px] font-bold tabular-nums tracking-[-0.02em] text-foreground-strong">{value}</div>
    </div>
  )
}

function SessionDetail({ s, onClose, onLogout }: { s: Session; onClose: () => void; onLogout: () => void }) {
  const fields: { label: string; value: string; span?: boolean }[] = [
    { label: "Tài khoản", value: s.acc },
    { label: "Họ tên người dùng", value: s.name },
    { label: "Đơn vị", value: s.unit, span: true },
    { label: "Thời điểm đăng nhập", value: s.loginAt },
    { label: "Hoạt động gần nhất", value: s.lastActive },
    { label: "Địa chỉ IP", value: s.ip },
    { label: "Thiết bị", value: s.device },
    { label: "Trình duyệt", value: s.browser },
    { label: "Hệ điều hành", value: s.os },
    { label: "Trạng thái", value: ST[s.status].label },
  ]
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex max-h-[90vh] w-[720px] max-w-full flex-col overflow-hidden rounded-xl bg-surface shadow-popover">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="min-w-0">
            <div className="mb-1.5 text-xs font-semibold text-foreground-muted">Chi tiết phiên đăng nhập</div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-[4px] border border-border bg-surface-muted px-1.5 py-0.5 font-mono text-xs text-foreground-muted">{s.sid}</span>
              <StatusPill meta={ST[s.status]} />
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>✕</Button>
        </div>
        <div className="flex-1 overflow-auto px-6 pb-6 pt-[18px]">
          <div className="grid grid-cols-2 gap-x-7">
            {fields.map((f) => (
              <div key={f.label} className={cn("flex flex-col gap-0.5 border-b border-neutral-100 py-2.5", f.span && "col-span-2")}>
                <div className="text-xs text-foreground-muted">{f.label}</div>
                <div className="text-[13.5px] leading-snug text-foreground">{f.value}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          {s.status === "active" ? (
            <button onClick={onLogout} className="inline-flex h-9 items-center gap-[7px] rounded-md border border-red-600 bg-surface px-4 text-sm font-medium text-red-600 shadow-xs hover:bg-[#fef2f2]">
              <LogOut className="size-[15px]" />
              Buộc đăng xuất
            </button>
          ) : (
            <span />
          )}
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </div>
      </div>
    </div>
  )
}
