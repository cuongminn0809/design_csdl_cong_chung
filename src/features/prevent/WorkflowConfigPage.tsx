import { useState } from "react"
import { History, RotateCcw, Save } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { PageHeader } from "../ingestion/shared"
import { ConfirmDialog, HistoryDialog } from "./shared"
import type { HistoryEntry } from "./config"

interface Proc { key: string; title: string; desc: string; direct: string[]; approval: string[] }

const PROCESSES: Proc[] = [
  { key: "noibo", title: "Quy trình nội bộ", desc: "Áp dụng cho đơn vị tự quản lý và đăng tải hồ sơ.",
    direct: ["Xử lý hồ sơ", "Đăng tải thông tin", "Kết thúc"], approval: ["Xử lý hồ sơ", "Trình lãnh đạo phê duyệt", "Đăng tải thông tin", "Kết thúc"] },
  { key: "thamquyen", title: "Quy trình dành cho đơn vị có thẩm quyền", desc: "Áp dụng cho các đơn vị gửi hồ sơ giấy/văn bản giấy đến Sở Tư pháp.",
    direct: ["Thêm mới", "Đăng tải thông tin", "Kết thúc"], approval: ["Thêm mới", "Chuyển STP", "Quy trình nội bộ STP", "Kết thúc"] },
  { key: "ccdt", title: "Quy trình nhận dữ liệu từ Nền tảng CCĐT", desc: "Áp dụng đối với dữ liệu ngăn chặn đồng bộ tự động từ Nền tảng công chứng điện tử.",
    direct: ["Nhận từ CCĐT", "Đăng tải thông tin", "Kết thúc"], approval: ["Nhận từ CCĐT", "STP tiếp nhận", "Quy trình nội bộ STP", "Kết thúc"] },
  { key: "tchncc", title: "Quy trình dành cho chuyên viên tại TCHNCC", desc: "Áp dụng đối với yêu cầu gửi thông tin ngăn chặn từ các tổ chức hành nghề công chứng.",
    direct: ["Thêm mới", "Đăng tải thông tin", "Kết thúc"], approval: ["Thêm mới", "Chuyển STP", "Quy trình nội bộ STP", "Kết thúc"] },
]

type Config = Record<string, { direct: boolean; approval: boolean }>
const DEFAULT_CONFIG: Config = Object.fromEntries(PROCESSES.map((p) => [p.key, { direct: true, approval: true }]))

const MOCK_HISTORY: HistoryEntry[] = [
  { time: "25/06/2026 14:00:00", actor: "Nguyễn Văn A — Chuyên viên STP", thaoTac: "Cập nhật cấu hình", truong: "Quy trình nhận dữ liệu từ CCĐT", cu: "Áp dụng cả 2", moi: "Chỉ Trực tiếp" },
  { time: "10/06/2026 09:30:00", actor: "Trần Thị B — Lãnh đạo STP", thaoTac: "Cập nhật cấu hình", truong: "Quy trình nội bộ", cu: "Áp dụng cả 2", moi: "Chỉ Có phê duyệt" },
]

export function WorkflowConfigPage() {
  const showToast = useToast()
  const [config, setConfig] = useState<Config>(() => structuredClone(DEFAULT_CONFIG))
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [history, setHistory] = useState(false)
  const [confirm, setConfirm] = useState(false)

  const toggle = (key: string, which: "direct" | "approval") => {
    if (confirm) return
    setConfig((c) => ({ ...c, [key]: { ...c[key], [which]: !c[key][which] } }))
    setErrors((e) => ({ ...e, [key]: false }))
  }
  // VR-01: mỗi quy trình nghiệp vụ phải giữ tối thiểu 1 quy trình con.
  const applyVr01 = (c: Config) => {
    const bad: Record<string, boolean> = {}
    PROCESSES.forEach((p) => { if (!c[p.key].direct && !c[p.key].approval) bad[p.key] = true })
    setErrors(bad)
    return Object.keys(bad).length === 0
  }
  // Bấm "Lưu cấu hình": chạy VR-01 trước, hợp lệ thì mở dialog xác nhận SCR-A.1.1.1-03.
  const save = () => {
    if (!applyVr01(config)) return
    setConfirm(true)
  }
  const doSave = () => {
    if (!applyVr01(config)) { setConfirm(false); return }
    setConfirm(false)
    showToast("Lưu cấu hình quy trình thành công.")
  }
  const reset = () => { setConfig(structuredClone(DEFAULT_CONFIG)); setErrors({}); showToast("Đã khôi phục cấu hình mặc định.") }

  return (
    <div>
      <div inert={confirm || history || undefined}>
        <PageHeader
          title="Cấu hình quy trình ngăn chặn"
          desc="Chọn quy trình phù hợp cho từng loại đơn vị và phương thức xử lý dữ liệu ngăn chặn, giải tỏa."
          actions={
            <div className="flex gap-2">
              <Button variant="outline" onClick={reset}><RotateCcw className="size-4" />Cài đặt mặc định</Button>
              <Button onClick={save}><Save className="size-4" />Lưu cấu hình</Button>
            </div>
          }
        />

        <div className="space-y-4">
          {PROCESSES.map((p, idx) => (
            <div key={p.key} className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[12.5px] font-semibold text-white">{idx + 1}</span>
                  <div>
                    <div className="text-[14.5px] font-semibold text-foreground-strong">{p.title}</div>
                    <div className="mt-0.5 text-[12.5px] text-foreground-muted">{p.desc}</div>
                  </div>
                </div>
                <button onClick={() => setHistory(true)} className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-[12px] font-medium text-foreground-muted shadow-xs hover:bg-surface-muted">
                  <History className="size-3.5" />Xem lịch sử cập nhật
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <ProcCard title="Quy trình đăng tải (Trực tiếp)" desc="Bộ dữ liệu gửi lên trực tiếp, chuyên viên tự đăng tải." steps={p.direct} checked={config[p.key].direct} onToggle={() => toggle(p.key, "direct")} />
                <ProcCard title="Quy trình đăng tải (Có phê duyệt)" desc="Yêu cầu qua bước duyệt trước khi đăng tải." steps={p.approval} checked={config[p.key].approval} onToggle={() => toggle(p.key, "approval")} />
              </div>
              {errors[p.key] && <div className="mt-3 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]">Mỗi quy trình nghiệp vụ bắt buộc chọn tối thiểu 1 quy trình xử lý.</div>}
            </div>
          ))}
        </div>
      </div>

      {history && <HistoryDialog history={MOCK_HISTORY} onClose={() => setHistory(false)} />}
      {confirm && (
        <ConfirmDialog
          title="Xác nhận thay đổi cấu hình quy trình"
          message="Bạn có chắc chắn muốn thay đổi cấu hình quy trình duyệt thông tin ngăn chặn không?"
          confirmLabel="Xác nhận"
          onClose={() => setConfirm(false)}
          onConfirm={doSave}
        />
      )}
    </div>
  )
}

function ProcCard({ title, desc, steps, checked, onToggle }: { title: string; desc: string; steps: string[]; checked: boolean; onToggle: () => void }) {
  return (
    <div className={cn("rounded-[12px] border p-4 transition-all", checked ? "border-[#c4b5fd] bg-[#faf5ff]" : "border-border bg-surface opacity-60")}>
      <div className="flex items-start justify-between gap-3">
        <label className="flex cursor-pointer items-start gap-2.5">
          <input type="checkbox" checked={checked} onChange={onToggle} className="mt-0.5 size-4 accent-[#7c3aed]" />
          <div>
            <div className="text-[13.5px] font-semibold text-foreground-strong">{title}</div>
            <div className="mt-0.5 text-[12px] text-foreground-muted">{desc}</div>
          </div>
        </label>
        {checked && <span className="shrink-0 rounded-full border border-[#ddd6fe] bg-[#ede9fe] px-2 py-0.5 text-[11px] font-semibold text-[#6d28d9]">Đang chọn</span>}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {steps.map((s, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <span className={cn("rounded-md px-2 py-1 text-[11.5px] font-medium", checked ? "bg-white text-foreground-strong shadow-xs" : "bg-neutral-100 text-foreground-subtle")}>{s}</span>
            {i < steps.length - 1 && <span className={cn("text-[11px]", checked ? "text-[#7c3aed]" : "text-foreground-subtle")}>→</span>}
          </span>
        ))}
      </div>
    </div>
  )
}
