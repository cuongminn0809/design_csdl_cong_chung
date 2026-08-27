import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Clock, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PdfFrame } from "./dialogs"
import { findRequest } from "./config"

export function ViewFilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const req = findRequest(id)
  const back = () => navigate("/reference-vbccdt")

  if (!req || req.trangThai !== "Đã xác nhận") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <FileText className="size-10 text-foreground-subtle" />
        <div className="text-[15px] font-semibold text-foreground-strong">Quyền truy cập xem file VBCCĐT đã hết thời gian.</div>
        <Button variant="outline" onClick={back}>Quay lại danh sách</Button>
      </div>
    )
  }

  return (
    <div className="pb-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={back} className="flex size-9 items-center justify-center rounded-md border border-border bg-surface text-foreground-muted shadow-xs hover:bg-surface-muted"><ArrowLeft className="size-4" /></button>
          <div>
            <h3 className="text-[22px] font-semibold leading-tight tracking-[-0.02em] text-foreground-strong">Xem file văn bản công chứng điện tử</h3>
            <p className="mt-1 text-[13px] text-foreground-muted">Số công chứng {req.soCC} — Mã yêu cầu {req.id}.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[#fde68a] bg-[#fffbeb] px-3.5 py-1.5 text-[12.5px] font-medium text-[#b45309]">
          <Clock className="size-4" />Thời gian hiệu lực còn lại: {Math.max(1, Math.round((req.thoiGianHieuLuc ?? 60) * 0.42))} phút
        </div>
      </div>

      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <PdfFrame fileName={req.fileName} />
      </div>

      <div className="mt-4"><Button variant="outline" onClick={back}>Đóng</Button></div>
    </div>
  )
}
