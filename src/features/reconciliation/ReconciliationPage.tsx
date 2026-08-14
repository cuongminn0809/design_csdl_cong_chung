import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCheck, Download, FileText, History, Settings2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { ReconDataset, ReconEndpoint } from "./types"
import { GDCC_DATASET } from "./data/gdcc"
import { B2_GENERATED } from "./data/generator"
import { useToast } from "./components/Toast"
import { JobsTab } from "./components/JobsTab"
import { ServicesTab } from "./components/ServicesTab"
import { HistoryTab } from "./components/HistoryTab"
import { LogsTab } from "./components/LogsTab"
import { JobDetailDrawer } from "./components/JobDetailDrawer"
import { EndpointFormModal, type FormMode } from "./components/EndpointFormModal"

type TabKey = "list" | "services" | "history" | "logs"

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "list", label: "Danh sách đối soát", icon: <CheckCheck className="size-4" /> },
  { key: "services", label: "Thiết lập dịch vụ", icon: <Settings2 className="size-4" /> },
  { key: "history", label: "Lịch sử đối soát", icon: <History className="size-4" /> },
  { key: "logs", label: "Nhật ký đối soát", icon: <FileText className="size-4" /> },
]

// Bản đồ nhóm dữ liệu → dataset (B2 — 8 nhóm). GDCC dùng dataset chi tiết riêng; 7 nhóm còn lại sinh từ generator.
const DATASETS: Record<string, ReconDataset> = {
  gdcc: GDCC_DATASET,
  ...B2_GENERATED,
}

export function ReconciliationPage({ dataGroup = "gdcc" }: { dataGroup?: string }) {
  const data = DATASETS[dataGroup] ?? GDCC_DATASET
  const showToast = useToast()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<TabKey>("list")
  const [detailJobId, setDetailJobId] = useState<string | null>(null)
  const [form, setForm] = useState<{ mode: FormMode; endpoint?: ReconEndpoint } | null>(null)

  const detailJob = data.jobs.find((j) => j.id === detailJobId) ?? null

  return (
    <div>
      {/* Header */}
      <div className="mb-[18px] flex items-end justify-between gap-5">
        <div>
          <h3 className="text-[24px] font-semibold leading-tight tracking-[-0.02em] text-foreground-strong">
            Đối soát — {data.groupLabel}
          </h3>
          <p className="mt-1.5 max-w-[760px] text-sm text-foreground-muted">
            Giám sát job đối soát do hệ thống nguồn gửi lên, tra cứu lịch sử &amp; nhật ký, và cấu hình endpoint tiếp nhận.
            Job đối soát tạo tự động khi nguồn gọi API — màn hình <strong className="text-foreground">chỉ đọc</strong> trên job.
          </p>
        </div>
        <Button variant="outline" className="shrink-0" onClick={() => showToast("Đang kết xuất Excel theo bộ lọc hiện tại…")}>
          <Download className="size-4" />
          Xuất Excel
        </Button>
      </div>

      {/* Tab bar */}
      <div className="mb-[22px] flex gap-0.5 overflow-x-auto border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={cn(
              "-mb-px inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-[11px] pr-3 text-sm",
              activeTab === t.key ? "border-neutral-900 font-semibold text-foreground-strong" : "border-transparent font-medium text-foreground-muted"
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "list" && <JobsTab data={data} onOpenJob={setDetailJobId} />}
      {activeTab === "services" && (
        <ServicesTab
          data={data}
          onAddEndpoint={() => setForm({ mode: "create" })}
          onEditEndpoint={(e) => setForm({ mode: "edit", endpoint: e })}
          onViewEndpoint={(e) => setForm({ mode: "view", endpoint: e })}
        />
      )}
      {activeTab === "history" && <HistoryTab data={data} onOpenJob={setDetailJobId} />}
      {activeTab === "logs" && <LogsTab data={data} />}

      {detailJob && (
        <JobDetailDrawer
          job={detailJob}
          data={data}
          onClose={() => setDetailJobId(null)}
          onExport={() => showToast("Đang kết xuất Excel theo bộ lọc hiện tại…")}
          onLinkB13={() => navigate("/thu-nhan/tich-hop-tu-dong")}
          onLoadMore={() => showToast("Đã tải thêm 500 dòng tiếp theo.")}
        />
      )}

      {form && <EndpointFormModal mode={form.mode} endpoint={form.endpoint} data={data} onClose={() => setForm(null)} />}
    </div>
  )
}
