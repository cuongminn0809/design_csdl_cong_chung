import { useEffect } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { ArrowLeft, Building2, Users } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { StatusPill, Th } from "../ingestion/shared"
import { findOrg, markViewed, orgStatusMeta } from "./config"

export function OrgDetailPage() {
  const { id } = useParams()
  const [sp] = useSearchParams()
  const navigate = useNavigate()
  const org = findOrg(id)

  // BR-07: ghi nhận đã xem sau khi tải chi tiết thành công, dedup theo (lookupHistoryId, orgId).
  useEffect(() => {
    const lh = sp.get("lh")
    if (org && lh) markViewed(lh, org.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const back = () => navigate("/tra-cuu/cong-chung-vien-tchncc/to-chuc-hncc")

  if (!org) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <Building2 className="size-10 text-foreground-subtle" />
        <div className="text-[15px] font-semibold text-foreground-strong">Không tải được thông tin chi tiết tổ chức HNCC hoặc bạn không có quyền xem.</div>
        <Button variant="outline" onClick={back}>Quay lại</Button>
      </div>
    )
  }

  return (
    <div className="pb-6">
      <div className="mb-5 flex items-center gap-3">
        <button onClick={back} className="flex size-9 items-center justify-center rounded-md border border-border bg-surface text-foreground-muted shadow-xs hover:bg-surface-muted"><ArrowLeft className="size-4" /></button>
        <div>
          <h3 className="text-[22px] font-semibold leading-tight tracking-[-0.02em] text-foreground-strong">Chi tiết tổ chức hành nghề công chứng</h3>
          <p className="mt-1 text-[13px] text-foreground-muted">Thông tin readonly — {org.tenToChuc}.</p>
        </div>
      </div>

      <Section title="Thông tin tổ chức">
        <div className="mb-4 flex items-center gap-4">
          <div className="flex size-[64px] items-center justify-center rounded-xl bg-neutral-100 text-foreground-subtle"><Building2 className="size-8" /></div>
          <div>
            <div className="text-[16px] font-semibold text-foreground-strong">{org.tenToChuc}</div>
            <div className="mt-1"><StatusPill meta={orgStatusMeta(org.trangThai)} /></div>
          </div>
        </div>
        <Grid>
          <Row label="Tên tổ chức công chứng" value={org.tenToChuc} />
          <Row label="Loại tổ chức" value={org.loaiToChuc} />
          <Row label="Sở Tư pháp" value={org.soTuPhap} />
          <Row label="Trạng thái" value={org.trangThai} />
          <Row label="Trưởng văn phòng" value={org.truongVP} />
          <Row label="Số điện thoại" value={org.dienThoai} />
          <Row label="Email" value={org.email} />
          <Row label="Mã số thuế" value={org.maSoThue} />
          <Row label="Địa chỉ" value={org.diaChiChiTiet} />
          <Row label="Tỉnh/Thành phố" value={org.tinhThanh} />
          <Row label="Phường/Xã" value={org.phuongXa} />
        </Grid>
      </Section>

      <div className="mt-4">
        <Section title={`Công chứng viên thuộc tổ chức (${org.members.length})`}>
          <div className="overflow-hidden rounded-[10px] border border-border">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-border bg-neutral-50">
                  <Th className="w-11 px-3.5 py-2.5 text-center">STT</Th>
                  <Th className="px-3.5 py-2.5">Họ và tên</Th>
                  <Th className="px-3.5 py-2.5">Số thẻ CCV</Th>
                  <Th className="px-3.5 py-2.5">Số CCHN</Th>
                </tr>
              </thead>
              <tbody>
                {org.members.map((m, i) => (
                  <tr key={i} className="border-b border-neutral-100 last:border-0">
                    <td className="px-3.5 py-2.5 text-center text-foreground-muted">{i + 1}</td>
                    <td className="px-3.5 py-2.5 font-medium text-foreground">{m.hoTen}{m.hoTen === org.truongVP && <span className="ml-1.5 rounded-full border border-border bg-surface-muted px-1.5 py-px text-[10px] font-semibold text-foreground-muted">Trưởng VP</span>}</td>
                    <td className="px-3.5 py-2.5 font-mono text-[12px] text-foreground-muted">{m.soThe}</td>
                    <td className="px-3.5 py-2.5 font-mono text-[12px] text-foreground-muted">{m.soChungChi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </div>

      <div className="mt-4">
        <Button variant="ghost" onClick={back}><ArrowLeft className="size-4" />Quay lại màn tra cứu</Button>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-foreground-strong">{title.includes("Công chứng viên") && <Users className="size-4 text-foreground-muted" />}{title}</div>
      {children}
    </div>
  )
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-x-6 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
}
function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-neutral-100 py-2">
      <div className="text-xs text-foreground-muted">{label}</div>
      <div className="text-[13.5px] leading-snug text-foreground">{value === "" || value === undefined ? "—" : value}</div>
    </div>
  )
}
