import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, CheckCircle2, FileText, PenLine, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { StatusPill, inputCls } from "../../ingestion/shared"
import { getSource, revokeById, REVOKE_STATUS } from "./config"
import { RevokeDetailView } from "./RevokeDetailView"
import { ConfirmDialog } from "./shared"

export function RevokeApprovalPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const showToast = useToast()
  const r = revokeById(id)
  const [confirmApprove, setConfirmApprove] = useState(false)
  const [showReject, setShowReject] = useState(false)

  if (!r) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <FileText className="size-10 text-foreground-subtle" />
        <div className="text-[15px] font-semibold text-foreground-strong">Không tìm thấy yêu cầu hủy</div>
        <Button variant="outline" onClick={() => navigate("/notary-transaction/revoke/list")}>Quay lại danh sách</Button>
      </div>
    )
  }

  const source = getSource(r)
  const backToSource = () => {
    if (!source) return navigate("/notary-transaction/revoke/list")
    const base = source.method === "paper" ? "/notary-transaction/paper" : "/notary-transaction/electronic"
    navigate(`${base}/detail/${source.id}`)
  }

  const canAct = r.status === "pending"

  const doApprove = () => {
    setConfirmApprove(false)
    // BR001/BR003: cập nhật yêu cầu = Phê duyệt, giao dịch gốc = Đã hủy, tạo liên kết Hủy, ghi log.
    showToast("Phê duyệt yêu cầu hủy văn bản công chứng thành công")
    setTimeout(backToSource, 400)
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex size-9 items-center justify-center rounded-md border border-border bg-surface text-foreground-muted shadow-xs hover:bg-surface-muted">
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h3 className="text-[22px] font-semibold leading-tight tracking-[-0.02em] text-foreground-strong">Phê duyệt yêu cầu hủy văn bản công chứng</h3>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-mono text-[13px] text-foreground-muted">Số CC hủy {r.soCC}</span>
              <StatusPill meta={REVOKE_STATUS[r.status]} />
            </div>
          </div>
        </div>
      </div>

      <RevokeDetailView r={r} showTables={false} />

      {/* Action bar */}
      {canAct ? (
        <div className="sticky bottom-0 -mx-1 mt-1 flex justify-end gap-2.5 rounded-t-xl border-t border-border bg-surface/95 px-4 py-3.5 backdrop-blur">
          <Button variant="outline" onClick={() => setShowReject(true)}><PenLine className="size-4" />Yêu cầu sửa</Button>
          <Button onClick={() => setConfirmApprove(true)}><CheckCircle2 className="size-4" />Phê duyệt</Button>
        </div>
      ) : (
        <div className="rounded-[12px] border border-dashed border-border bg-neutral-50 px-4 py-3 text-center text-[13px] text-foreground-muted">
          Chỉ có thể phê duyệt / yêu cầu sửa khi yêu cầu hủy đang ở trạng thái “Chờ duyệt”.
        </div>
      )}

      {confirmApprove && (
        <ConfirmDialog
          title="Xác nhận phê duyệt"
          message="Bạn có chắc chắn muốn phê duyệt hồ sơ yêu cầu hủy văn bản công chứng này không? Giao dịch gốc sẽ được chuyển sang trạng thái “Đã hủy”."
          confirmLabel="Phê duyệt"
          onConfirm={doApprove}
          onClose={() => setConfirmApprove(false)}
        />
      )}

      {showReject && (
        <RejectReasonDialog
          onClose={() => setShowReject(false)}
          onSubmit={() => {
            setShowReject(false)
            showToast("Đã gửi yêu cầu chỉnh sửa thành công")
            setTimeout(backToSource, 400)
          }}
        />
      )}
    </div>
  )
}

/** SCR-A.3.4-06 — Popup nhập lý do yêu cầu chỉnh sửa. */
function RejectReasonDialog({ onClose, onSubmit }: { onClose: () => void; onSubmit: () => void }) {
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")

  const submit = () => {
    const v = reason.trim()
    if (!v) return setError("Vui lòng nhập lý do yêu cầu chỉnh sửa")
    if (v.length > 500) return setError("Lý do yêu cầu chỉnh sửa không được vượt quá 500 ký tự")
    onSubmit()
  }

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-[520px] max-w-full overflow-hidden rounded-xl bg-surface shadow-popover">
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
          <div className="text-[15px] font-semibold text-foreground-strong">Yêu cầu chỉnh sửa thông tin hủy văn bản</div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="size-[18px]" /></Button>
        </div>
        <div className="px-6 py-5">
          <label className="text-xs font-semibold text-foreground-strong">Ý kiến phản hồi / Lý do yêu cầu chỉnh sửa <span className="text-red-600">*</span></label>
          <textarea
            autoFocus
            value={reason}
            onChange={(e) => { setReason(e.target.value); if (error) setError("") }}
            rows={4}
            maxLength={600}
            placeholder="Nhập chi tiết lý do yêu cầu Công chứng viên chỉnh sửa…"
            className={cn(inputCls, "mt-1.5 h-auto resize-none py-2 leading-relaxed")}
          />
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[12px] text-red-600">{error}</span>
            <span className={cn("text-[11.5px]", reason.length > 500 ? "text-red-600" : "text-foreground-subtle")}>{reason.length}/500 ký tự</span>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={submit}>Xác nhận</Button>
        </div>
      </div>
    </div>
  )
}
