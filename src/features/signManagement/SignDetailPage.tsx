import { useState } from "react"
import { ArrowLeft, Download, History, Pencil } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { useCurrentRole } from "@/features/notifications/config"
import { SignHistoryDialog } from "./dialogs"
import {
  REQUEST_TYPE_LABEL, STATUS_BADGE, STATUS_LABEL, canEditOrSubmit, fmtVN, fmtVNDateTime, getSign, inScope, orgNameOf,
  ownerNameOf, useOrgs, useCcvs, useSigns,
} from "./config"

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return <div className="flex flex-col gap-0.5 border-b border-neutral-100 py-2.5"><div className="text-xs text-foreground-muted">{label}</div><div className="text-[13.5px] leading-snug text-foreground">{value || "—"}</div></div>
}

export function SignDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const showToast = useToast()
  const role = useCurrentRole()
  useSigns(); useOrgs(); useCcvs()
  const [showHistory, setShowHistory] = useState(false)

  const found = id ? getSign(id) : undefined
  const sign = found && inScope(found, role) && !found.deleted ? found : undefined

  if (!sign) {
    return (
      <div className="rounded-[14px] border border-border bg-surface p-10 text-center shadow-sm">
        <div className="text-[15px] font-semibold text-foreground-strong">Không tìm thấy thông tin chữ ký số hoặc bạn không có quyền xem.</div>
        <Button className="mt-4" variant="outline" onClick={() => navigate("/ccv-tchncc/thong-tin-chu-ky-so")}><ArrowLeft className="size-4" />Quay lại</Button>
      </div>
    )
  }

  const badge = STATUS_BADGE[sign.trangThai]
  const isOrg = sign.loaiChuThe === "TCHNCC"
  const canEdit = canEditOrSubmit(sign, role)

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <button onClick={() => navigate("/ccv-tchncc/thong-tin-chu-ky-so")} className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-foreground-muted shadow-xs hover:bg-surface-muted"><ArrowLeft className="size-4" /></button>
          <div>
            <h3 className="text-[24px] font-semibold leading-tight tracking-[-0.02em] text-foreground-strong">Thông tin đăng ký chữ ký số</h3>
            <p className="mt-1.5 text-sm text-foreground-muted">Mã: {sign.maCks} · {ownerNameOf(sign)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {canEdit && <Button onClick={() => navigate(`/ccv-tchncc/thong-tin-chu-ky-so/${sign.id}/cap-nhat`)}><Pencil className="size-4" />Cập nhật</Button>}
          <Button variant="outline" onClick={() => setShowHistory(true)}><History className="size-4" />Xem lịch sử cập nhật</Button>
        </div>
      </div>

      <div className="rounded-[14px] border border-border bg-surface p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
          <Field label="Loại chủ sở hữu" value={isOrg ? "CKS TCHNCC" : "CKS CCV"} />
          <Field label={isOrg ? "Tên TCHNCC" : "Tên CCV"} value={ownerNameOf(sign)} />
          {!isOrg && <Field label="Tổ chức hành nghề công chứng" value={orgNameOf(sign)} />}
          <Field label="Nhà cung cấp" value={sign.nhaCungCap} />
          <Field label="Số Serial" value={sign.soSerial} />
          <Field label="Ngày hiệu lực" value={fmtVN(sign.ngayHieuLuc)} />
          <Field label="Ngày hết hạn" value={fmtVN(sign.ngayHetHan)} />
          <Field label="Trạng thái" value={<span className="inline-flex rounded-full px-2 py-0.5 text-[11.5px] font-medium" style={{ background: badge.bg, color: badge.fg }}>{STATUS_LABEL[sign.trangThai]}</span>} />
          <Field label="Loại yêu cầu" value={REQUEST_TYPE_LABEL[sign.loaiYeuCau]} />
          <Field label="Ghi chú" value={sign.ghiChu} />
          <Field label="File đính kèm" value={sign.fileDinhKem ? <button onClick={() => showToast(`Đang mở file ${sign.fileDinhKem}...`)} className="text-link hover:underline"><Download className="mr-1 inline size-3.5" />{sign.fileDinhKem}</button> : undefined} />
        </div>

        <div className="mt-5 border-t border-border pt-4">
          <div className="mb-1 text-[13px] font-semibold text-foreground-strong">Thông tin xử lý</div>
          <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
            <Field label="Người gửi duyệt" value={sign.nguoiGuiDuyet} />
            <Field label="Thời gian gửi duyệt" value={sign.ngayGuiDuyet ? fmtVNDateTime(sign.ngayGuiDuyet) : undefined} />
            <Field label="Người phê duyệt/từ chối" value={sign.nguoiPheDuyet} />
            <Field label="Thời gian phê duyệt/từ chối" value={sign.ngayPheDuyet ? fmtVNDateTime(sign.ngayPheDuyet) : undefined} />
            {sign.ghiChuThamDinh && <Field label="Ghi chú thẩm định" value={sign.ghiChuThamDinh} />}
            {sign.trangThai === "DA_TU_CHOI" && <Field label="Lý do từ chối" value={sign.lyDoTuChoi} />}
            {sign.trangThai === "DA_HUY" && <Field label="Lý do hủy" value={sign.lyDoHuy} />}
            {sign.trangThai === "DA_KHOA" && <Field label="Lý do khóa" value={sign.lyDoKhoa} />}
          </div>
        </div>
      </div>

      {showHistory && <SignHistoryDialog sign={sign} onClose={() => setShowHistory(false)} />}
    </div>
  )
}
