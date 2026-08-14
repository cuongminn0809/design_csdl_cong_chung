import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { StatusPill } from "../../ingestion/shared"
import { revokeById, REVOKE_STATUS } from "./config"
import { RevokeDetailView } from "./RevokeDetailView"

export function RevokeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const r = revokeById(id)

  if (!r) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <FileText className="size-10 text-foreground-subtle" />
        <div className="text-[15px] font-semibold text-foreground-strong">Không tìm thấy văn bản hủy</div>
        <Button variant="outline" onClick={() => navigate("/notary-transaction/revoke/list")}>Quay lại danh sách</Button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex size-9 items-center justify-center rounded-md border border-border bg-surface text-foreground-muted shadow-xs hover:bg-surface-muted">
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h3 className="text-[22px] font-semibold leading-tight tracking-[-0.02em] text-foreground-strong">Chi tiết văn bản hủy công chứng</h3>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-mono text-[13px] text-foreground-muted">Số CC hủy {r.soCC}</span>
              <StatusPill meta={REVOKE_STATUS[r.status]} />
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>Quay lại</Button>
      </div>

      <RevokeDetailView r={r} />
    </div>
  )
}
