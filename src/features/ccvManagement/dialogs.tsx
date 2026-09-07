import { createPortal } from "react-dom"
import { AlertTriangle, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { Th } from "../ingestion/shared"
import {
  changeCcvStatus, fmtVN, fmtVNDateTime, getPracticeHistory, orgAddressOf, TARGET_STATUS,
  type Ccv, type CcvHistoryEntry,
} from "./config"

function Modal({ title, wide, onClose, footer, children }: { title: string; wide?: boolean; onClose: () => void; footer?: React.ReactNode; children: React.ReactNode }) {
  return createPortal(
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className={`flex max-h-[85vh] w-full ${wide ? "max-w-[720px]" : "max-w-[480px]"} flex-col rounded-[14px] bg-surface shadow-xl`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h4 className="text-[15px] font-semibold text-foreground-strong">{title}</h4>
          <button onClick={onClose} className="flex size-7 items-center justify-center rounded-md text-foreground-muted hover:bg-surface-muted"><X className="size-4" /></button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-border px-5 py-3.5">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return <div className="flex flex-col gap-0.5 border-b border-neutral-100 py-2.5"><div className="text-xs text-foreground-muted">{label}</div><div className="text-[13.5px] leading-snug text-foreground">{value || "—"}</div></div>
}

export function CcvHistoryDetailDialog({ entry, onClose }: { entry: CcvHistoryEntry; onClose: () => void }) {
  return (
    <Modal title="Chi tiết lần thay đổi" wide onClose={onClose} footer={<Button variant="outline" onClick={onClose}>Đóng</Button>}>
      <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
        <Field label="Thời gian" value={fmtVNDateTime(entry.thoiGian)} />
        <Field label="Người thực hiện" value={entry.nguoiThucHien} />
        <Field label="Thao tác" value={entry.thaoTac} />
        <Field label="Công chứng viên" value={entry.ccvTen} />
      </div>
      {entry.thaoTac === "Thêm mới" ? (
        <div className="mt-3 rounded-md border border-border bg-neutral-50 px-3 py-2.5 text-[13px] text-foreground">{entry.noiDung}</div>
      ) : (
        <div className="mt-3 overflow-hidden rounded-md border border-border">
          <table className="w-full border-collapse text-sm">
            <thead><tr className="border-b border-border bg-neutral-50"><Th>Thông tin thay đổi</Th><Th>Giá trị cũ</Th><Th>Giá trị mới</Th></tr></thead>
            <tbody>{entry.changes.map((c, i) => (
              <tr key={i} className="border-b border-neutral-100 last:border-0">
                <td className="px-4 py-2.5 font-medium text-foreground">{c.truong}</td>
                <td className="px-4 py-2.5 text-foreground-muted">{c.cu || "-"}</td>
                <td className="px-4 py-2.5 text-foreground-muted">{c.moi || "-"}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </Modal>
  )
}

export function CcvStatusChangeDialog({ ccv, actor, onClose, onDone }: { ccv: Ccv; actor: string; onClose: () => void; onDone: () => void }) {
  const showToast = useToast()
  const doConfirm = () => {
    const r = changeCcvStatus(ccv.id, ccv.version, actor)
    if (!r.ok) { showToast(r.reason, "error"); return }
    showToast(`Đã chuyển Công chứng viên sang ${TARGET_STATUS}.`)
    onDone()
  }
  return (
    <Modal title="Chuyển trạng thái công chứng viên" onClose={onClose} footer={<><Button variant="outline" onClick={onClose}>Hủy</Button><Button onClick={doConfirm}>Xác nhận</Button></>}>
      <div className="mb-3 flex items-start gap-2.5 rounded-md border border-[#fde68a] bg-[#fffbeb] px-3 py-2.5 text-[12.5px] text-[#92400e]">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <span>Thao tác chỉ cập nhật trạng thái công chứng viên, không ảnh hưởng đến số thẻ, tổ chức hành nghề hay lịch sử hành nghề.</span>
      </div>
      <Field label="Công chứng viên" value={ccv.hoTen} />
      <Field label="Trạng thái hiện tại" value={ccv.trangThai} />
      <Field label="Trạng thái được đưa đến" value={<span className="font-semibold text-[#b91c1c]">{TARGET_STATUS}</span>} />
    </Modal>
  )
}

export function CcvPracticeHistoryDialog({ ccv, onClose }: { ccv: Ccv; onClose: () => void }) {
  const rows = getPracticeHistory(ccv.id)
  return (
    <Modal title={`Lịch sử hành nghề — ${ccv.hoTen}`} wide onClose={onClose} footer={<Button variant="outline" onClick={onClose}>Quay lại</Button>}>
      {rows.length === 0 ? (
        <div className="px-2 py-8 text-center text-[13.5px] text-foreground-muted">Không tìm thấy lịch sử hành nghề của Công chứng viên.</div>
      ) : (
        <div className="space-y-3">
          {rows.map((p) => (
            <div key={p.id} className="rounded-[10px] border border-border p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="text-[13.5px] font-semibold text-foreground-strong">{p.toChucTen}</div>
                <span className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[11.5px] font-medium ${p.trangThai === "Đang hành nghề" ? "bg-[#ecfdf5] text-[#047857]" : "bg-neutral-100 text-neutral-600"}`}>{p.trangThai}</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-[12.5px] text-foreground-muted sm:grid-cols-3">
                <div>Từ ngày: <span className="text-foreground">{fmtVN(p.tuNgay)}</span></div>
                <div>Đến ngày: <span className="text-foreground">{p.denNgay ? fmtVN(p.denNgay) : "Hiện tại"}</span></div>
                <div>Số thẻ: <span className="text-foreground">{p.soThe || "—"}</span></div>
                {p.soQuyetDinh && <div>Số quyết định: <span className="text-foreground">{p.soQuyetDinh}</span></div>}
                {p.ngayQuyetDinh && <div>Ngày quyết định: <span className="text-foreground">{fmtVN(p.ngayQuyetDinh)}</span></div>}
                {p.ngayHieuLuc && <div>Ngày hiệu lực: <span className="text-foreground">{fmtVN(p.ngayHieuLuc)}</span></div>}
                {orgAddressOf(p.toChucId) && <div className="col-span-full">Địa chỉ: <span className="text-foreground">{orgAddressOf(p.toChucId)}</span></div>}
                {p.ghiChu && <div className="col-span-full">Ghi chú: <span className="text-foreground">{p.ghiChu}</span></div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}
