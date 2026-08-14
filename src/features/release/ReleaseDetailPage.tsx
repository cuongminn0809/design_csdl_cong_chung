import { useNavigate, useParams } from "react-router-dom"
import { AlertTriangle, ArrowLeft, CheckCircle2, Download, FileText, ShieldAlert } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { StatusPill, Th } from "../ingestion/shared"
import { OBJECT_LABEL } from "../prevent/config"
import { BLOCK_STATUS_LABEL, RELEASE_STATUS, linkedBlocks, releaseById } from "./config"

export function ReleaseDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const showToast = useToast()
  const r = releaseById(id)

  if (!r) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <FileText className="size-10 text-foreground-subtle" />
        <div className="text-[15px] font-semibold text-foreground-strong">Không tìm thấy thông tin giải tỏa</div>
        <Button variant="outline" onClick={() => navigate("/giai-toa-info/search")}>Quay lại danh sách</Button>
      </div>
    )
  }

  const blocks = linkedBlocks(r)
  const general: [string, string][] = [
    ["Số văn bản", r.soVanBan],
    ["Ngày ban hành văn bản", r.ngayBanHanh],
    ["Đơn vị gửi yêu cầu", r.donViGuiYeuCau],
    ["Số văn bản đến", r.soVanBanDen || "—"],
    ["Ngày nhận", r.ngayNhan || "—"],
    ["Ngày nhập", r.ngayNhap || "—"],
    ["Tỉnh/Thành phố", r.tinhThanhPho],
  ]

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/giai-toa-info/search")} className="flex size-9 items-center justify-center rounded-md border border-border bg-surface text-foreground-muted shadow-xs hover:bg-surface-muted">
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h3 className="text-[22px] font-semibold leading-tight tracking-[-0.02em] text-foreground-strong">Chi tiết thông tin giải tỏa</h3>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-mono text-[13px] text-foreground-muted">Số VB {r.soVanBan}</span>
              <StatusPill meta={RELEASE_STATUS[r.trangThai]} />
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate("/giai-toa-info/search")}>Đóng</Button>
      </div>

      <Section title="Thông tin văn bản giải tỏa">
        <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
          {general.map(([k, v]) => <InfoRow key={k} label={k} value={v} />)}
        </div>
        <InfoRow label="Trích yếu" value={r.trichYeu} full />
        {r.ghiChu && <InfoRow label="Ghi chú" value={r.ghiChu} full />}
        <div className="mt-3 flex items-center gap-3 border-t border-neutral-100 pt-3">
          <span className="text-xs text-foreground-muted">File đính kèm:</span>
          {r.fileName ? (
            <button onClick={() => showToast("Đang tải file đính kèm…")} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-[12.5px] font-medium text-link shadow-xs hover:bg-surface-muted">
              <FileText className="size-3.5 text-red-600" />{r.fileName}<Download className="size-3.5" />
            </button>
          ) : <span className="text-[12.5px] text-foreground-subtle">Chưa có tệp đính kèm</span>}
        </div>
      </Section>

      {r.lyDoTuChoi && (
        <div className="mb-4 flex items-start gap-2.5 rounded-[14px] border border-[#fecaca] bg-[#fef2f2] px-5 py-4 shadow-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600" />
          <div>
            <div className="text-[12.5px] font-semibold text-[#b91c1c]">Lý do từ chối</div>
            <div className="mt-0.5 text-[13px] text-[#7f1d1d]">{r.lyDoTuChoi}</div>
          </div>
        </div>
      )}

      <Section title="Danh sách thông tin giải tỏa">
        {blocks.length ? (
          <div className="overflow-x-auto rounded-[10px] border border-border">
            <table className="w-full min-w-[880px] border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-border bg-neutral-50">
                  <Th className="w-11 px-3.5 py-2.5 text-center">STT</Th>
                  <Th className="px-3.5 py-2.5">Phân loại</Th>
                  <Th className="px-3.5 py-2.5">Thông tin ngăn chặn</Th>
                  <Th className="px-3.5 py-2.5">Đơn vị gửi yêu cầu</Th>
                  <Th className="px-3.5 py-2.5">Ngày ban hành</Th>
                  <Th className="px-3.5 py-2.5">Số văn bản</Th>
                  <Th className="px-3.5 py-2.5">Trạng thái</Th>
                </tr>
              </thead>
              <tbody>
                {blocks.map((b, i) => (
                  <tr key={b.id} className="border-b border-neutral-100">
                    <td className="px-3.5 py-2.5 text-center text-foreground-muted">{i + 1}</td>
                    <td className="px-3.5 py-2.5"><span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] font-semibold text-foreground-strong">{OBJECT_LABEL[b.loai]}</span></td>
                    <td className="px-3.5 py-2.5 font-medium text-foreground">{b.info}</td>
                    <td className="px-3.5 py-2.5 text-foreground-muted">{b.donViGuiYeuCau}</td>
                    <td className="whitespace-nowrap px-3.5 py-2.5 tabular-nums text-foreground-muted">{b.ngayBanHanh}</td>
                    <td className="px-3.5 py-2.5 font-mono text-[12px] text-foreground-muted">{b.soVanBan}</td>
                    <td className="px-3.5 py-2.5"><BlockStatusPill status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-[10px] border border-dashed border-border py-6 text-center text-[13px] text-foreground-muted">Chưa có đối tượng giải tỏa.</div>
        )}
      </Section>
    </div>
  )
}

function BlockStatusPill({ status }: { status: "blocked" | "released" }) {
  return status === "released" ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#bbf7d0] bg-[#f0fdf4] px-2 py-0.5 text-[11px] font-semibold text-[#15803d]"><CheckCircle2 className="size-3" />{BLOCK_STATUS_LABEL.released}</span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#fecaca] bg-[#fef2f2] px-2 py-0.5 text-[11px] font-semibold text-[#b91c1c]"><ShieldAlert className="size-3" />{BLOCK_STATUS_LABEL.blocked}</span>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-[14px] border border-border bg-surface p-5 shadow-sm">
      <div className="mb-3 text-[13px] font-semibold text-foreground-strong">{title}</div>
      {children}
    </div>
  )
}
function InfoRow({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={cn("flex flex-col gap-0.5 border-b border-neutral-100 py-2.5", full && "col-span-full")}>
      <div className="text-xs text-foreground-muted">{label}</div>
      <div className="text-[13.5px] leading-snug text-foreground">{value}</div>
    </div>
  )
}
