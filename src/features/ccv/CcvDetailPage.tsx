import { useEffect, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { ArrowLeft, Check, FileText, User } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { StatusPill } from "../ingestion/shared"
import { ccvStatusMeta, certStatusMeta, findCcv, markViewed } from "./config"

const STEPS = ["Thông tin chung", "Thông tin tổ chức hành nghề", "Chứng chỉ hành nghề"]

export function CcvDetailPage() {
  const { id } = useParams()
  const [sp] = useSearchParams()
  const navigate = useNavigate()
  const showToast = useToast()
  const ccv = findCcv(id)
  const [step, setStep] = useState(0)

  // BR-07: chỉ ghi nhận đã xem sau khi tải chi tiết thành công, dedup theo (lookupHistoryId, ccvId).
  useEffect(() => {
    const lh = sp.get("lh")
    if (ccv && lh) markViewed(lh, ccv.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const back = () => navigate("/tra-cuu/cong-chung-vien-tchncc")

  if (!ccv) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <User className="size-10 text-foreground-subtle" />
        <div className="text-[15px] font-semibold text-foreground-strong">Không tải được thông tin chi tiết Công chứng viên hoặc bạn không có quyền xem.</div>
        <Button variant="outline" onClick={back}>Quay lại</Button>
      </div>
    )
  }

  return (
    <div className="pb-6">
      <div className="mb-5 flex items-center gap-3">
        <button onClick={back} className="flex size-9 items-center justify-center rounded-md border border-border bg-surface text-foreground-muted shadow-xs hover:bg-surface-muted"><ArrowLeft className="size-4" /></button>
        <div>
          <h3 className="text-[22px] font-semibold leading-tight tracking-[-0.02em] text-foreground-strong">Chi tiết công chứng viên</h3>
          <p className="mt-1 text-[13px] text-foreground-muted">Thông tin readonly ba lớp — {ccv.hoTen} ({ccv.soThe}).</p>
        </div>
      </div>

      {/* STEPPER */}
      <div className="mb-4 flex items-center gap-2 overflow-x-auto rounded-[14px] border border-border bg-surface p-3 shadow-sm">
        {STEPS.map((s, i) => (
          <button key={s} onClick={() => setStep(i)} className={cn("flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-[13px] font-medium", i === step ? "bg-neutral-900 text-white" : i < step ? "text-foreground hover:bg-surface-muted" : "text-foreground-muted hover:bg-surface-muted")}>
            <span className={cn("flex size-5 items-center justify-center rounded-full text-[11px] font-semibold", i === step ? "bg-white text-neutral-900" : i < step ? "bg-emerald-100 text-emerald-700" : "bg-neutral-200 text-foreground-muted")}>{i < step ? <Check className="size-3" /> : i + 1}</span>
            {s}
          </button>
        ))}
      </div>

      {step === 0 && (
        <Section title="Thông tin chung">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex size-[84px] items-center justify-center rounded-full bg-neutral-100 text-foreground-subtle"><User className="size-9" /></div>
            <div>
              <div className="text-[16px] font-semibold text-foreground-strong">{ccv.hoTen}</div>
              <div className="mt-1"><StatusPill meta={ccvStatusMeta(ccv.trangThai)} /></div>
            </div>
          </div>
          <Grid>
            <Row label="Họ và tên" value={ccv.hoTen} />
            <Row label="Ngày sinh" value={ccv.ngaySinh} />
            <Row label="Giới tính" value={ccv.gioiTinh} />
            <Row label="Quốc tịch" value={ccv.quocTich} />
            <Row label="Dân tộc" value={ccv.danToc} />
            <Row label="Số điện thoại" value={ccv.sdt} />
            <Row label="Email" value={ccv.email} />
            <Row label="Số giấy tờ (CCCD/CMND/Hộ chiếu)" value={ccv.soGiayTo} />
            <Row label="Ngày cấp giấy tờ" value={ccv.ngayCapGT} />
            <Row label="Nơi cấp giấy tờ" value={ccv.noiCapGT} />
            <Row label="Địa chỉ thường trú" value={ccv.diaChiThuongTru} full />
            <Row label="Tỉnh/Thành phố" value={ccv.tinhThanh} />
            <Row label="Phường/Xã" value={ccv.phuongXa} />
          </Grid>
        </Section>
      )}

      {step === 1 && (
        <Section title="Thông tin tổ chức hành nghề">
          <Grid>
            <Row label="Tên tổ chức công chứng" value={ccv.tchncc} />
            <Row label="Số thẻ công chứng viên" value={ccv.soThe} />
            <Row label="Trưởng văn phòng" value={ccv.laTruongVanPhong ? "Có" : "Không"} />
            <Row label="Địa chỉ tổ chức công chứng" value={ccv.diaChi} full />
          </Grid>
        </Section>
      )}

      {step === 2 && (
        <Section title="Thông tin chứng chỉ hành nghề">
          <Grid>
            <Row label="Số chứng chỉ" value={ccv.certificate.soChungChi} />
            <Row label="Ngày cấp" value={ccv.certificate.ngayCap} />
            <Row label="Ngày hiệu lực" value={ccv.certificate.ngayHieuLuc} />
            <Row label="Ngày hết hạn" value={ccv.certificate.ngayHetHan} />
            <Row label="Đơn vị cấp" value={ccv.certificate.donViCap} />
            <Row label="Trạng thái" node={<StatusPill meta={certStatusMeta(ccv.certificate.trangThai)} />} />
          </Grid>
          <div className="mt-3 flex flex-col gap-1 border-t border-neutral-100 pt-3">
            <span className="text-xs text-foreground-muted">File đính kèm</span>
            <button onClick={() => showToast(`Đang mở tệp: ${ccv.fileDinhKem}`)} className="inline-flex w-fit items-center gap-2 rounded-md border border-border bg-neutral-50 px-3 py-2 text-[12.5px] font-medium text-foreground-strong hover:bg-surface-muted">
              <FileText className="size-4 text-red-600" /><span className="font-mono">{ccv.fileDinhKem}</span>
            </button>
          </div>
        </Section>
      )}

      {/* ĐIỀU HƯỚNG */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5">
        <Button variant="ghost" onClick={back}><ArrowLeft className="size-4" />Quay lại màn tra cứu</Button>
        <div className="flex gap-2.5">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>← Bước trước</Button>
          <Button disabled={step === 2} onClick={() => setStep((s) => Math.min(2, s + 1))}>Tiếp tục →</Button>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
      <div className="mb-3 text-[13px] font-semibold text-foreground-strong">{title}</div>
      {children}
    </div>
  )
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-x-6 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
}
function Row({ label, value, node, full }: { label: string; value?: string; node?: React.ReactNode; full?: boolean }) {
  return (
    <div className={cn("flex flex-col gap-0.5 border-b border-neutral-100 py-2", full && "col-span-full")}>
      <div className="text-xs text-foreground-muted">{label}</div>
      {node ?? <div className="text-[13.5px] leading-snug text-foreground">{value === "" || value === undefined ? "—" : value}</div>}
    </div>
  )
}
