import { useEffect, useRef } from "react"
import { ArrowLeft, Download, FileText } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { PageHeader } from "../ingestion/shared"
import { fmtVNDateTime, incrementInstructionViews, useInstructions } from "./config"

export function InstructionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const showToast = useToast()
  const all = useInstructions()
  const instruction = id ? all.find((i) => i.id === id) : undefined
  const counted = useRef(false)

  useEffect(() => {
    if (instruction && !counted.current) { incrementInstructionViews(instruction.id); counted.current = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instruction?.id])

  if (!instruction) {
    return (
      <div className="rounded-[14px] border border-border bg-surface p-10 text-center shadow-sm">
        <div className="text-[15px] font-semibold text-foreground-strong">Không tải được chi tiết hướng dẫn sử dụng, vui lòng thử lại.</div>
        <Button className="mt-4" variant="outline" onClick={() => navigate("/tra-cuu/huong-dan-su-dung")}><ArrowLeft className="size-4" />Quay lại</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Chi tiết hướng dẫn sử dụng" desc={instruction.title}
        actions={<Button variant="outline" onClick={() => navigate("/tra-cuu/huong-dan-su-dung")}><ArrowLeft className="size-4" />Quay lại</Button>} />

      <div className="rounded-[14px] border border-border bg-surface p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center gap-x-8 gap-y-1 text-[13px] text-foreground-muted">
          <span>Ngày tạo: <span className="font-medium text-foreground">{fmtVNDateTime(instruction.createdAt)}</span></span>
          <span>Lượt xem: <span className="font-medium text-foreground">{instruction.views.toLocaleString("vi-VN")}</span></span>
        </div>
        <div className="mb-2 text-xs font-semibold text-foreground-muted">Nội dung</div>
        <div className="mb-5 rounded-md border border-border bg-neutral-50 px-4 py-3.5 text-[13.5px] leading-relaxed text-foreground">
          {instruction.content || "Không có nội dung."}
        </div>
        <div className="flex items-center justify-between rounded-md border border-border px-4 py-3">
          <div className="flex items-center gap-2 text-[13.5px] text-foreground">
            <FileText className="size-4 text-foreground-muted" />
            {instruction.fileName ? <span>{instruction.fileName} · {instruction.fileSize}</span> : <span className="text-foreground-muted">Không có file đính kèm</span>}
          </div>
          {instruction.fileName && (
            <Button size="sm" onClick={() => showToast(`Đã tải xuống ${instruction.fileName}.`)}><Download className="size-3.5" />Tải xuống</Button>
          )}
        </div>
      </div>
    </div>
  )
}
