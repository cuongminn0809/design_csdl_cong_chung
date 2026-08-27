import { useState } from "react"
import { ScrollText, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Pagination, StatusPill, Th } from "../ingestion/shared"
import { findOrg, orgStatusMeta, type OrgSearchLog } from "./config"

function Modal({ title, icon, wide, onClose, children }: { title: string; icon?: React.ReactNode; wide?: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={onClose}>
      <div className={cn("flex max-h-[88vh] w-full flex-col overflow-hidden rounded-xl bg-surface shadow-popover", wide ? "max-w-[880px]" : "max-w-[560px]")} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
          <span className="flex items-center gap-2 text-[15px] font-semibold text-foreground-strong">{icon}{title}</span>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="size-[18px]" /></Button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        <div className="flex justify-end border-t border-border px-6 py-4">
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-neutral-100 py-2">
      <div className="text-xs text-foreground-muted">{label}</div>
      <div className="text-[13.5px] leading-snug text-foreground">{value === "" || value === undefined ? "—" : value}</div>
    </div>
  )
}

/* ============================ SCR-A.5.7-03 — CHI TIẾT LỊCH SỬ TRA CỨU ============================ */
export function OrgHistoryDetailModal({ log, onClose }: { log: OrgSearchLog; onClose: () => void }) {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const viewed = log.viewedOrgIds.map((id) => findOrg(id)).filter(Boolean) as NonNullable<ReturnType<typeof findOrg>>[]
  const start = (Math.min(page, Math.max(1, Math.ceil(viewed.length / size))) - 1) * size
  const paged = viewed.slice(start, start + size)

  return (
    <Modal title="Chi tiết lịch sử tra cứu" icon={<ScrollText className="size-[18px] text-foreground-muted" />} wide onClose={onClose}>
      <div className="mb-4 grid grid-cols-1 gap-x-6 rounded-[10px] border border-border bg-neutral-50 px-4 py-2 sm:grid-cols-2">
        <Row label="Thời gian tra cứu" value={log.thoiGian} />
        <Row label="Người thực hiện" value={log.nguoiTraCuu} />
        <Row label="Đơn vị" value={log.donVi} />
        <Row label="Địa chỉ IP" value={log.ip} />
        <div className="sm:col-span-2"><Row label="Thông tin tra cứu" value={log.thongTinTraCuu} /></div>
        <Row label="Kết quả tra cứu" value={String(log.ketQua)} />
        <Row label="Số kết quả đã xem" value={String(log.soKetQuaDaXem)} />
      </div>

      <div className="mb-2 text-[13px] font-semibold text-foreground-strong">Danh sách kết quả tra cứu đã xem</div>
      {viewed.length ? (
        <div className="overflow-hidden rounded-[10px] border border-border">
          <table className="w-full min-w-[720px] border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-border bg-neutral-50">
                <Th className="w-11 px-3.5 py-2.5 text-center">STT</Th>
                <Th className="px-3.5 py-2.5">Tên tổ chức CC</Th>
                <Th className="px-3.5 py-2.5">Sở Tư pháp</Th>
                <Th className="px-3.5 py-2.5">Trưởng VP</Th>
                <Th className="px-3.5 py-2.5">Địa chỉ trụ sở</Th>
                <Th className="px-3.5 py-2.5">Trạng thái HĐ</Th>
              </tr>
            </thead>
            <tbody>
              {paged.map((o, i) => (
                <tr key={o.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-3.5 py-2.5 text-center text-foreground-muted">{start + i + 1}</td>
                  <td className="px-3.5 py-2.5 font-medium text-foreground">{o.tenToChuc}</td>
                  <td className="px-3.5 py-2.5 text-foreground-muted">{o.soTuPhap}</td>
                  <td className="px-3.5 py-2.5 text-foreground-muted">{o.truongVP}</td>
                  <td className="px-3.5 py-2.5 text-foreground-muted">{o.diaChi}</td>
                  <td className="px-3.5 py-2.5"><StatusPill meta={orgStatusMeta(o.trangThai)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} pageSize={size} total={viewed.length} unit="bản ghi" onPage={setPage} onPageSize={(n) => { setSize(n); setPage(1) }} />
        </div>
      ) : (
        <div className="rounded-[10px] border border-dashed border-border py-8 text-center text-[13px] text-foreground-muted">Không có kết quả tra cứu đã xem cho lịch sử này.</div>
      )}
    </Modal>
  )
}
