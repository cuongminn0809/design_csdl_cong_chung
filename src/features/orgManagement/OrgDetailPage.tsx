import { ArrowLeft, Pencil } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { useCurrentRole } from "@/features/notifications/config"
import { Th } from "../ingestion/shared"
import { canManageOrg, canViewOrg, ccvOf, getOrg, scopeProvinceFor, STATUS_BADGE } from "./config"

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return <div className="flex flex-col gap-0.5 border-b border-neutral-100 py-2.5"><div className="text-xs text-foreground-muted">{label}</div><div className="text-[13.5px] leading-snug text-foreground">{value || "—"}</div></div>
}

export function OrgDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const role = useCurrentRole()
  const found = id ? getOrg(id) : undefined
  const inScope = found && (canViewOrg(role) ? (!scopeProvinceFor(role) || found.tinhThanh === scopeProvinceFor(role)) : false)
  const org = inScope ? found : undefined

  if (!org) {
    return (
      <div className="rounded-[14px] border border-border bg-surface p-10 text-center shadow-sm">
        <div className="text-[15px] font-semibold text-foreground-strong">Không tìm thấy tổ chức công chứng hoặc bạn không có quyền xem.</div>
        <Button className="mt-4" variant="outline" onClick={() => navigate("/quan-ly-thong-tin/to-chuc-hncc")}><ArrowLeft className="size-4" />Quay lại</Button>
      </div>
    )
  }

  const badge = STATUS_BADGE[org.trangThai]
  const ccvs = ccvOf(org.id)
  const canEdit = canManageOrg(role)

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <button onClick={() => navigate("/quan-ly-thong-tin/to-chuc-hncc")} className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-foreground-muted shadow-xs hover:bg-surface-muted"><ArrowLeft className="size-4" /></button>
          <div>
            <h3 className="text-[24px] font-semibold leading-tight tracking-[-0.02em] text-foreground-strong">{org.ten}</h3>
            <p className="mt-1.5 text-sm text-foreground-muted">Mã tổ chức: {org.maToChuc} · {org.loaiHinh}</p>
          </div>
        </div>
        {canEdit && <Button onClick={() => navigate(`/quan-ly-thong-tin/to-chuc-hncc/${org.id}/chinh-sua`)}><Pencil className="size-4" />Chỉnh sửa</Button>}
      </div>

      <div className="rounded-[14px] border border-border bg-surface p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
          <Field label="Tên tổ chức công chứng" value={org.ten} />
          <Field label="Sở Tư pháp" value={org.soTuPhap} />
          <Field label="Trạng thái" value={<span className="inline-flex rounded-full px-2 py-0.5 text-[11.5px] font-medium" style={{ background: badge.bg, color: badge.fg }}>{org.trangThai}</span>} />
          <Field label="Địa chỉ" value={org.diaChi} />
          <Field label="Tỉnh/Thành phố" value={org.tinhThanh} />
          <Field label="Phường/Xã" value={org.phuongXa} />
          <Field label="Số điện thoại" value={org.sdt} />
          <Field label="Email" value={org.email} />
          <Field label="Mã số thuế" value={org.mst} />
          <Field label="Trưởng văn phòng" value={ccvs.find((c) => c.id === org.truongVanPhongId)?.hoTen} />
        </div>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        <div className="border-b border-border px-5 py-3 text-[13px] font-semibold text-foreground-strong">Công chứng viên thuộc tổ chức ({ccvs.length})</div>
        {ccvs.length ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead><tr className="border-b border-border bg-neutral-50"><Th className="w-11 text-center">STT</Th><Th>Họ và tên</Th><Th>Số giấy tờ</Th><Th>Số thẻ</Th><Th>Chức vụ</Th><Th>Trạng thái</Th></tr></thead>
              <tbody>{ccvs.map((c, i) => (
                <tr key={c.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                  <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{c.hoTen}</td>
                  <td className="px-4 py-3 text-foreground-muted">{c.soGiayTo}</td>
                  <td className="px-4 py-3 text-foreground-muted">{c.soThe}</td>
                  <td className="px-4 py-3 text-foreground-muted">{c.chucVu}</td>
                  <td className="px-4 py-3 text-foreground-muted">{c.trangThai}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-8 text-center text-[13.5px] text-foreground-muted">Chưa có công chứng viên nào thuộc tổ chức này.</div>
        )}
      </div>
    </div>
  )
}
