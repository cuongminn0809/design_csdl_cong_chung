import { useState } from "react"
import { CircleCheck, TrendingUp, UserPlus, Users } from "lucide-react"

import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { Th } from "../ingestion/shared"

const RANGE_LABEL: Record<string, string> = { year: "năm nay", quarter: "quý này", month: "tháng này", week: "tuần này", today: "hôm nay" }

const SERIES: Record<string, { labels: string[]; data: number[] }> = {
  year: { labels: ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"], data: [820, 845, 910, 905, 960, 1010, 1040, 1095, 1120, 1180, 1210, 1247] },
  quarter: { labels: ["T10", "T11", "T12"], data: [1180, 1210, 1247] },
  month: { labels: ["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4"], data: [1210, 1222, 1235, 1247] },
  week: { labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"], data: [1240, 1241, 1243, 1244, 1245, 1246, 1247] },
  today: { labels: ["0h", "6h", "12h", "18h", "24h"], data: [1245, 1245, 1246, 1247, 1247] },
}

const ROLES = [
  { name: "Công chứng viên", count: 642, color: "#2563eb" },
  { name: "Chuyên viên Sở Tư pháp", count: 318, color: "#16a34a" },
  { name: "Chuyên viên Bộ Tư pháp", count: 146, color: "#f59e0b" },
  { name: "Quản trị hệ thống", count: 41, color: "#dc2626" },
  { name: "Lãnh đạo TCHNCC", count: 89, color: "#8b5cf6" },
]

const UNITS: [string, number][] = [
  ["Sở Tư pháp TP. Hà Nội", 214], ["Sở Tư pháp TP. HCM", 198], ["Bộ Tư pháp", 146],
  ["Sở Tư pháp Đà Nẵng", 97], ["Sở Tư pháp Hải Phòng", 85], ["Sở Tư pháp Cần Thơ", 72],
  ["Sở Tư pháp Quảng Ninh", 64], ["Sở Tư pháp Nghệ An", 58], ["Sở Tư pháp Bình Dương", 51],
]

const TOP: [string, string, string, string, number, string][] = [
  ["thanhnv", "Nguyễn Văn Thành", "Công chứng viên", "VPCC Nguyễn Huệ", 1284, "15/07/2026 09:41"],
  ["huongtt", "Trần Thị Hương", "Chuyên viên Sở Tư pháp", "Sở Tư pháp TP. Hà Nội", 1156, "15/07/2026 09:15"],
  ["namlh", "Lê Hoàng Nam", "Công chứng viên", "VPCC Trần Phú", 1098, "15/07/2026 08:52"],
  ["anhpq", "Phạm Quốc Anh", "Quản trị hệ thống", "Bộ Tư pháp", 1042, "15/07/2026 08:30"],
  ["maild", "Đỗ Thị Lan", "Chuyên viên Sở Tư pháp", "Sở Tư pháp TP. HCM", 987, "14/07/2026 22:04"],
  ["sonbt", "Bùi Thanh Sơn", "Công chứng viên", "VPCC Minh Đức", 921, "14/07/2026 18:40"],
]

const nf = (n: number) => n.toLocaleString("vi")

export function DashboardPage() {
  const [range, setRange] = useState("year")
  const ser = SERIES[range]
  const total = 1247
  const active = 1189

  return (
    <div>
      <div className="mb-5 flex items-end justify-between gap-5">
        <div>
          <h3 className="text-[24px] font-semibold leading-tight tracking-[-0.02em] text-foreground-strong">Dashboard tổng quan người dùng</h3>
          <p className="mt-1.5 text-sm text-foreground-muted">Thống kê tài khoản, phân bố theo vai trò &amp; đơn vị, và hoạt động đăng nhập.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-[18px] flex flex-wrap gap-4">
        <div className="w-[200px]">
          <label className="mb-1.5 block text-xs font-semibold text-foreground-strong">Khoảng thời gian</label>
          <NativeSelect value={range} onChange={(e) => setRange(e.target.value)}>
            <option value="year">Năm nay</option>
            <option value="quarter">Quý này</option>
            <option value="month">Tháng này</option>
            <option value="week">Tuần này</option>
            <option value="today">Hôm nay</option>
          </NativeSelect>
        </div>
        <div className="w-[200px]">
          <label className="mb-1.5 block text-xs font-semibold text-foreground-strong">Vai trò</label>
          <NativeSelect defaultValue="all">
            <option value="all">Tất cả vai trò</option>
            {ROLES.map((r) => (
              <option key={r.name}>{r.name}</option>
            ))}
          </NativeSelect>
        </div>
        <div className="w-[180px]">
          <label className="mb-1.5 block text-xs font-semibold text-foreground-strong">Trạng thái</label>
          <NativeSelect defaultValue="all">
            <option value="all">Tất cả</option>
            <option>Đang hoạt động</option>
            <option>Khóa</option>
          </NativeSelect>
        </div>
      </div>

      {/* KPI cards */}
      <div className="mb-[18px] grid grid-cols-1 gap-3.5 md:grid-cols-3">
        <KpiCard label="Tổng người dùng" value={nf(total)} icon={<Users className="size-[18px]" />}>
          <span className="flex items-center gap-1 text-xs text-[#16a34a]">
            <TrendingUp className="size-3" strokeWidth={2.5} />
            +4,2% so với kỳ trước
          </span>
        </KpiCard>
        <KpiCard label="Đang hoạt động" value={nf(active)} iconBg="#f0fdf4" iconFg="#16a34a" icon={<CircleCheck className="size-[18px]" />}>
          <span className="text-xs text-foreground-muted">{Math.round((active / total) * 100)}% tổng số tài khoản</span>
        </KpiCard>
        <KpiCard label="Người dùng mới" value="38" iconBg="#eff6ff" iconFg="#2563eb" icon={<UserPlus className="size-[18px]" />}>
          <span className="text-xs text-foreground-muted">Đăng nhập lần đầu trong kỳ</span>
        </KpiCard>
      </div>

      {/* Line + donut */}
      <div className="mb-3.5 grid grid-cols-1 gap-3.5 lg:grid-cols-[1.5fr_1fr]">
        <Panel title="Số lượng người dùng theo thời gian" desc={`Xu hướng tăng trưởng tài khoản trong ${RANGE_LABEL[range]}`}>
          <LineChart labels={ser.labels} data={ser.data} />
        </Panel>
        <Panel title="Phân bố theo vai trò" desc="Tỷ lệ tài khoản đang hoạt động">
          <div className="flex items-center gap-[18px]">
            <DonutChart />
            <div className="flex flex-1 flex-col gap-2">
              {ROLES.map((r) => {
                const totalRole = ROLES.reduce((a, x) => a + x.count, 0)
                return (
                  <div key={r.name} className="flex items-center gap-2">
                    <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: r.color }} />
                    <span className="min-w-0 flex-1 truncate text-[12.5px] text-foreground">{r.name}</span>
                    <span className="text-[12.5px] font-semibold tabular-nums text-foreground-strong">{Math.round((r.count / totalRole) * 100)}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </Panel>
      </div>

      {/* Unit bars */}
      <Panel className="mb-[18px]" title="Phân bố người dùng theo đơn vị" desc="Số tài khoản đang hoạt động theo từng đơn vị">
        <div className="flex h-[200px] items-end gap-[18px] overflow-x-auto pb-1">
          {UNITS.map(([name, count]) => {
            const maxU = Math.max(...UNITS.map((u) => u[1]))
            return (
              <div key={name} className="flex h-full w-[88px] flex-none flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <div title={`${name}: ${count}`} className="w-full rounded-t-md bg-neutral-900" style={{ height: `${Math.round((count / maxU) * 100)}%` }} />
                </div>
                <div className="text-[13px] font-semibold tabular-nums text-foreground-strong">{count}</div>
                <div className="h-7 overflow-hidden text-center text-[11px] leading-tight text-foreground-muted">{name}</div>
              </div>
            )
          })}
        </div>
      </Panel>

      {/* Top users */}
      <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        <div className="border-b border-border px-5 pb-3 pt-4">
          <div className="text-sm font-semibold text-foreground-strong">Người dùng hoạt động nhiều nhất</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-neutral-50">
                <Th className="w-[52px] text-center">STT</Th>
                <Th>Tài khoản</Th>
                <Th>Họ tên</Th>
                <Th>Vai trò</Th>
                <Th>Đơn vị</Th>
                <Th className="text-right">Số lượt HĐ</Th>
                <Th>Đăng nhập gần nhất</Th>
              </tr>
            </thead>
            <tbody>
              {TOP.map((u, i) => (
                <tr key={u[0]} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{i + 1}</td>
                  <td className="px-4 py-3"><span className="font-mono text-[12.5px] text-link">{u[0]}</span></td>
                  <td className="px-4 py-3 font-medium text-foreground">{u[1]}</td>
                  <td className="px-4 py-3 text-foreground-muted">{u[2]}</td>
                  <td className="px-4 py-3 text-foreground-muted">{u[3]}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums text-foreground-strong">{nf(u[4])}</td>
                  <td className="px-4 py-3 tabular-nums text-foreground-muted">{u[5]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ label, value, icon, iconBg, iconFg, children }: { label: string; value: string; icon: React.ReactNode; iconBg?: string; iconFg?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[14px] border border-border bg-surface p-[18px_20px] shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-foreground-muted">{label}</span>
        <div className="flex size-[34px] items-center justify-center rounded-[9px]" style={{ background: iconBg ?? "var(--surface-muted)", color: iconFg ?? "var(--foreground-strong)" }}>
          {icon}
        </div>
      </div>
      <div className="mt-2.5 text-[30px] font-bold tabular-nums tracking-[-0.02em] text-foreground-strong">{value}</div>
      <div className="mt-1">{children}</div>
    </div>
  )
}

function Panel({ title, desc, className, children }: { title: string; desc: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-[14px] border border-border bg-surface p-[18px_20px] shadow-sm ${className ?? ""}`}>
      <div className="mb-0.5 text-sm font-semibold text-foreground-strong">{title}</div>
      <div className="mb-3.5 text-[12.5px] text-foreground-muted">{desc}</div>
      {children}
    </div>
  )
}

function LineChart({ labels, data }: { labels: string[]; data: number[] }) {
  const W = 520, H = 180, pad = 28
  const max = Math.max(...data) * 1.05
  const min = Math.min(...data) * 0.92
  const n = data.length
  const x = (i: number) => pad + (i * (W - pad * 2)) / (n - 1 || 1)
  const y = (v: number) => H - pad - ((v - min) / (max - min)) * (H - pad * 2)
  const pts = data.map((v, i) => `${x(i)},${y(v)}`).join(" ")
  const area = `${pad},${H - pad} ${pts} ${x(n - 1)},${H - pad}`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full">
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
        <line key={i} x1={pad} x2={W - pad} y1={pad + f * (H - pad * 2)} y2={pad + f * (H - pad * 2)} stroke="#e5e5e5" strokeWidth={1} />
      ))}
      <polygon points={area} fill="rgba(37,99,235,0.08)" />
      <polyline points={pts} fill="none" stroke="#2563eb" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r={3.5} fill="#fff" stroke="#2563eb" strokeWidth={2}>
          <title>{`${labels[i]}: ${nf(v)}`}</title>
        </circle>
      ))}
      {labels.map((l, i) => (
        <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize={9} fill="#737373">
          {l}
        </text>
      ))}
    </svg>
  )
}

function DonutChart() {
  const totalRole = ROLES.reduce((a, r) => a + r.count, 0)
  const rad = 54, cx = 64, cy = 64, sw = 20
  const C = 2 * Math.PI * rad
  let acc = 0
  return (
    <svg viewBox="0 0 128 128" className="size-32 flex-none">
      {ROLES.map((r) => {
        const frac = r.count / totalRole
        const el = (
          <circle key={r.name} cx={cx} cy={cy} r={rad} fill="none" stroke={r.color} strokeWidth={sw} strokeDasharray={`${frac * C} ${C}`} strokeDashoffset={-acc * C} transform={`rotate(-90 ${cx} ${cy})`}>
            <title>{`${r.name}: ${r.count}`}</title>
          </circle>
        )
        acc += frac
        return el
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize={18} fontWeight={700} fill="#0a0a0a">{nf(totalRole)}</text>
      <text x={cx} y={cy + 13} textAnchor="middle" fontSize={9} fill="#737373">tài khoản</text>
    </svg>
  )
}
