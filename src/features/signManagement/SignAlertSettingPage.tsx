import { useState } from "react"
import { Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { useToast } from "@/features/reconciliation/components/Toast"
import { setCurrentRole, useCurrentRole } from "@/features/notifications/config"
import { EmptyState, PageHeader } from "../ingestion/shared"
import { NOTI_ROLES, canConfigAlert, saveAlertConfig, useAlertConfig, type AlertConfig, type SignRole } from "./config"

const inputCls = "h-9 w-full rounded-md border border-input bg-surface px-3 text-sm shadow-xs outline-none focus-visible:border-border-focus focus-visible:ring-[3px] focus-visible:ring-ring/50"
const lbl = "text-xs font-semibold text-foreground-strong"

export function SignAlertSettingPage() {
  const role = useCurrentRole()
  const showToast = useToast()
  const saved = useAlertConfig()
  const [draft, setDraft] = useState<AlertConfig>(saved)
  const [error, setError] = useState("")

  const doCancel = () => { setDraft(saved); setError("") }
  const doSave = () => {
    const r = saveAlertConfig(draft)
    if (!r.ok) return setError(r.reason)
    setError("")
    showToast("Lưu thiết lập cảnh báo thành công.")
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Thiết lập cảnh báo chữ ký số sắp hết hiệu lực" desc="Cấu hình thời điểm và đối tượng nhận thông báo khi chữ ký số của TCHNCC, CCV sắp hết hiệu lực."
        actions={
          <div className="flex items-center gap-2.5">
            <span className="text-[12.5px] text-foreground-muted">Vai trò:</span>
            <NativeSelect value={role} onChange={(e) => setCurrentRole(e.target.value as SignRole)} className="h-8 w-[220px] text-[12.5px]">
              {NOTI_ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </NativeSelect>
          </div>
        } />

      {!canConfigAlert(role) ? (
        <EmptyState icon={<Save className="size-6" />} title="Không có quyền truy cập" desc="Vai trò hiện tại không được gán quyền thiết lập cảnh báo chữ ký số." />
      ) : (
      <div className="max-w-2xl rounded-[14px] border border-border bg-surface p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5"><label className={lbl}>Thời gian gửi thông báo</label><input type="time" value={draft.gioGui} onChange={(e) => setDraft((d) => ({ ...d, gioGui: e.target.value }))} className={inputCls} /></div>
          <div className="flex flex-col gap-1.5"><label className={lbl}>Thông báo trước khi hết hạn (ngày)</label><input type="number" min={1} max={365} value={draft.soNgayCanhBao} onChange={(e) => setDraft((d) => ({ ...d, soNgayCanhBao: Number(e.target.value) }))} className={inputCls} /></div>
          <div className="flex flex-col gap-1.5"><label className={lbl}>Yêu cầu CCV/TCHNCC gia hạn trước (ngày)</label><input type="number" min={1} max={365} value={draft.soNgayYeuCauGiaHan} onChange={(e) => setDraft((d) => ({ ...d, soNgayYeuCauGiaHan: Number(e.target.value) }))} className={inputCls} /></div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className={lbl}>Thông báo đến</label>
            <div className="flex flex-wrap gap-4 pt-1">
              <label className="flex items-center gap-2 text-[13.5px] text-foreground"><input type="checkbox" checked={draft.baoSoTuPhap} onChange={(e) => setDraft((d) => ({ ...d, baoSoTuPhap: e.target.checked }))} className="size-4" />Sở Tư pháp</label>
              <label className="flex items-center gap-2 text-[13.5px] text-foreground"><input type="checkbox" checked={draft.baoTchncc} onChange={(e) => setDraft((d) => ({ ...d, baoTchncc: e.target.checked }))} className="size-4" />Tổ chức HNCC</label>
              <label className="flex items-center gap-2 text-[13.5px] text-foreground"><input type="checkbox" checked={draft.baoCcv} onChange={(e) => setDraft((d) => ({ ...d, baoCcv: e.target.checked }))} className="size-4" />Công chứng viên</label>
            </div>
          </div>
        </div>

        {error && <div className="mt-4 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]">{error}</div>}

        <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" onClick={doCancel}>Hủy</Button>
          <Button onClick={doSave}><Save className="size-4" />Lưu thiết lập</Button>
        </div>
      </div>
      )}
    </div>
  )
}
