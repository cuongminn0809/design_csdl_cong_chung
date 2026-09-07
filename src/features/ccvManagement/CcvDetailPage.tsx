import { useState } from "react"
import { ArrowLeft, History, Pencil } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { useCurrentRole } from "@/features/notifications/config"
import { CcvPracticeHistoryDialog } from "./dialogs"
import {
  canManageCcv, canViewCcv, canViewCert, canViewPracticeHistory, ccvStatusMeta, certStatusMeta,
  fmtVN, getCcv, orgAddressOf, orgNameOf, scopeProvinceFor, useCcvs, useOrgs,
} from "./config"

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return <div className="flex flex-col gap-0.5 border-b border-neutral-100 py-2.5"><div className="text-xs text-foreground-muted">{label}</div><div className="text-[13.5px] leading-snug text-foreground">{value || "—"}</div></div>
}

type Layer = 1 | 2 | 3

export function CcvDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const role = useCurrentRole()
  useCcvs(); useOrgs()
  const [layer, setLayer] = useState<Layer>(1)
  const [showPractice, setShowPractice] = useState(false)

  const found = id ? getCcv(id) : undefined
  const inScope = found && (canViewCcv(role) ? (!scopeProvinceFor(role) || found.soTuPhap === scopeProvinceFor(role)) : false)
  const ccv = inScope ? found : undefined

  if (!ccv) {
    return (
      <div className="rounded-[14px] border border-border bg-surface p-10 text-center shadow-sm">
        <div className="text-[15px] font-semibold text-foreground-strong">Không tìm thấy công chứng viên hoặc bạn không có quyền xem.</div>
        <Button className="mt-4" variant="outline" onClick={() => navigate("/quan-ly-thong-tin/cong-chung-vien")}><ArrowLeft className="size-4" />Quay lại</Button>
      </div>
    )
  }

  const badge = ccvStatusMeta(ccv.trangThai)
  const canEdit = canManageCcv(role)
  const showCert = canViewCert(role)
  const orgTen = orgNameOf(ccv.toChucCongChungId)

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <button onClick={() => navigate("/quan-ly-thong-tin/cong-chung-vien")} className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-foreground-muted shadow-xs hover:bg-surface-muted"><ArrowLeft className="size-4" /></button>
          <div>
            <h3 className="text-[24px] font-semibold leading-tight tracking-[-0.02em] text-foreground-strong">{ccv.hoTen}</h3>
            <p className="mt-1.5 text-sm text-foreground-muted">Mã CCV: {ccv.maCcv} {ccv.soThe ? `· Số thẻ: ${ccv.soThe}` : ""}</p>
          </div>
        </div>
        {canEdit && <Button onClick={() => navigate(`/quan-ly-thong-tin/cong-chung-vien/${ccv.id}/chinh-sua`)}><Pencil className="size-4" />Chỉnh sửa</Button>}
      </div>

      <div className="flex gap-2">
        <button onClick={() => setLayer(1)} className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-medium ${layer === 1 ? "bg-neutral-900 text-white" : "bg-neutral-100 text-foreground-muted hover:bg-neutral-200"}`}>Thông tin chung</button>
        <button onClick={() => setLayer(2)} className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-medium ${layer === 2 ? "bg-neutral-900 text-white" : "bg-neutral-100 text-foreground-muted hover:bg-neutral-200"}`}>Thông tin tổ chức hành nghề</button>
        {showCert && <button onClick={() => setLayer(3)} className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-medium ${layer === 3 ? "bg-neutral-900 text-white" : "bg-neutral-100 text-foreground-muted hover:bg-neutral-200"}`}>Thông tin chứng chỉ hành nghề</button>}
      </div>

      <div className="rounded-[14px] border border-border bg-surface p-6 shadow-sm">
        {layer === 1 && (
          <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
            <Field label="Họ và tên" value={ccv.hoTen} />
            <Field label="Trạng thái" value={<span className="inline-flex rounded-full px-2 py-0.5 text-[11.5px] font-medium" style={{ background: badge.bg, color: badge.fg }}>{ccv.trangThai}</span>} />
            <Field label="Ngày sinh" value={ccv.ngaySinh ? fmtVN(ccv.ngaySinh) : undefined} />
            <Field label="Giới tính" value={ccv.gioiTinh} />
            <Field label="Quốc tịch" value={ccv.quocTich} />
            <Field label="Dân tộc" value={ccv.danToc} />
            <Field label="Số điện thoại" value={ccv.sdt} />
            <Field label="Email" value={ccv.email} />
            <Field label="Số giấy tờ" value={ccv.soGiayTo} />
            <Field label="Ngày cấp" value={ccv.ngayCapGiayTo ? fmtVN(ccv.ngayCapGiayTo) : undefined} />
            <Field label="Nơi cấp" value={ccv.noiCapGiayTo} />
            <Field label="Địa chỉ thường trú" value={`${ccv.diaChiThuongTru}, ${ccv.phuongXa}, ${ccv.tinhThanh}`} />
            <Field label="Sở Tư pháp quản lý" value={ccv.soTuPhap} />
          </div>
        )}
        {layer === 2 && (
          <div>
            <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
              <Field label="Tên tổ chức công chứng" value={orgTen ?? "Chưa gắn TCHNCC"} />
              <Field label="Địa chỉ tổ chức công chứng" value={orgAddressOf(ccv.toChucCongChungId)} />
              <Field label="Số thẻ công chứng viên" value={ccv.soThe} />
              <Field label="Trưởng văn phòng" value={ccv.laTruongVanPhong ? "Có" : "Không"} />
            </div>
            {canViewPracticeHistory(role) && (
              <Button variant="outline" className="mt-3" onClick={() => setShowPractice(true)}><History className="size-4" />Lịch sử hành nghề</Button>
            )}
          </div>
        )}
        {layer === 3 && showCert && (
          <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
            <Field label="Số chứng chỉ" value={ccv.certificate.soChungChi} />
            <Field label="Ngày cấp CCHN" value={ccv.certificate.ngayCap ? fmtVN(ccv.certificate.ngayCap) : undefined} />
            <Field label="Nơi cấp chứng chỉ" value={ccv.certificate.noiCap} />
            <Field label="Ngày hiệu lực" value={ccv.certificate.ngayHieuLuc ? fmtVN(ccv.certificate.ngayHieuLuc) : undefined} />
            <Field label="Ngày hết hạn" value={ccv.certificate.ngayHetHan ? fmtVN(ccv.certificate.ngayHetHan) : undefined} />
            <Field label="Đơn vị cấp" value={ccv.certificate.donViCap} />
            <Field label="Trạng thái CCHN" value={ccv.certificate.trangThai ? <span className="inline-flex rounded-full px-2 py-0.5 text-[11.5px] font-medium" style={{ background: certStatusMeta(ccv.certificate.trangThai).bg, color: certStatusMeta(ccv.certificate.trangThai).fg }}>{ccv.certificate.trangThai}</span> : undefined} />
            <Field label="File đính kèm" value={ccv.certificate.fileDinhKem} />
          </div>
        )}
      </div>

      {showPractice && <CcvPracticeHistoryDialog ccv={ccv} onClose={() => setShowPractice(false)} />}
    </div>
  )
}
