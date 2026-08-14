import { useMemo, useState } from "react"
import { Search, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { Th, inputCls } from "../ingestion/shared"
import { OBJECT_LABEL } from "../prevent/config"
import {
  ROLE_LABEL, STAFF_BTP, STAFF_STP, isCentral, selectableBlocks,
  type ReleaseBlock, type ReleaseRole,
} from "./config"

// Reuse generic dialogs từ module ngăn chặn.
export { ConfirmDialog, ReasonDialog, HistoryDialog } from "../prevent/shared"

export function RoleSelect({ role, onChange }: { role: ReleaseRole; onChange: (r: ReleaseRole) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[12.5px] text-foreground-muted">Vai trò:</span>
      <NativeSelect value={role} onChange={(e) => onChange(e.target.value as ReleaseRole)} className="h-8 w-[210px] text-[12.5px]">
        {(Object.keys(ROLE_LABEL) as ReleaseRole[]).map((r) => (
          <option key={r} value={r}>{ROLE_LABEL[r]}</option>
        ))}
      </NativeSelect>
    </div>
  )
}

function Overlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={onClose}>{children}</div>
  )
}

export function AssignDialog({ leaderRole, onSubmit, onClose }: { leaderRole: ReleaseRole; onSubmit: (staff: string) => void; onClose: () => void }) {
  const [staff, setStaff] = useState("")
  const [opinion, setOpinion] = useState("")
  const [error, setError] = useState("")
  const options = isCentral(leaderRole) ? STAFF_BTP : STAFF_STP
  const submit = () => { if (!staff) return setError("Vui lòng chọn cán bộ xử lý"); onSubmit(staff) }
  return (
    <Overlay onClose={onClose}>
      <div className="w-[500px] max-w-full overflow-hidden rounded-xl bg-surface shadow-popover" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
          <span className="text-[15px] font-semibold text-foreground-strong">Phân công cán bộ xử lý</span>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="size-[18px]" /></Button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="text-xs font-semibold text-foreground-strong">Cán bộ xử lý <span className="text-red-600">*</span></label>
            <NativeSelect value={staff} onChange={(e) => { setStaff(e.target.value); if (error) setError("") }} className="mt-1.5">
              <option value="">— Chọn cán bộ xử lý —</option>
              {options.map((o) => <option key={o} value={o}>{o}</option>)}
            </NativeSelect>
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground-strong">Ý kiến phân công</label>
            <textarea value={opinion} onChange={(e) => setOpinion(e.target.value)} rows={2} maxLength={1000} placeholder="Nhập ý kiến phân công (không bắt buộc)…" className={cn(inputCls, "mt-1.5 h-auto resize-none py-2 leading-relaxed")} />
          </div>
          {error && <div className="text-[12px] text-red-600">{error}</div>}
        </div>
        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={submit}>Xác nhận</Button>
        </div>
      </div>
    </Overlay>
  )
}

export function SubmitReviewDialog({ leaderRole, onSubmit, onClose }: { leaderRole: ReleaseRole; onSubmit: () => void; onClose: () => void }) {
  const [leader, setLeader] = useState("")
  const [opinion, setOpinion] = useState("")
  const [error, setError] = useState("")
  const leaders = isCentral(leaderRole) ? ["ld_btp — Lãnh đạo BTP"] : ["ld_stp — Lãnh đạo phòng STP"]
  const submit = () => {
    if (!leader) return setError("Vui lòng chọn lãnh đạo phê duyệt")
    if (opinion.length > 500) return setError("Ý kiến trình duyệt không được vượt quá 500 ký tự")
    onSubmit()
  }
  return (
    <Overlay onClose={onClose}>
      <div className="w-[520px] max-w-full overflow-hidden rounded-xl bg-surface shadow-popover" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
          <span className="text-[15px] font-semibold text-foreground-strong">Trình lãnh đạo duyệt giải tỏa</span>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="size-[18px]" /></Button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="text-xs font-semibold text-foreground-strong">Lãnh đạo phê duyệt <span className="text-red-600">*</span></label>
            <NativeSelect value={leader} onChange={(e) => { setLeader(e.target.value); if (error) setError("") }} className="mt-1.5">
              <option value="">— Chọn lãnh đạo duyệt —</option>
              {leaders.map((o) => <option key={o} value={o}>{o}</option>)}
            </NativeSelect>
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground-strong">Ý kiến chuyên viên</label>
            <textarea value={opinion} onChange={(e) => setOpinion(e.target.value)} rows={3} maxLength={600} placeholder="Nhập ý kiến trình lãnh đạo (tối đa 500 ký tự)…" className={cn(inputCls, "mt-1.5 h-auto resize-none py-2 leading-relaxed")} />
            <div className="mt-1 text-right text-[11.5px] text-foreground-subtle">{opinion.length}/500</div>
          </div>
          {error && <div className="text-[12px] text-red-600">{error}</div>}
        </div>
        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={submit}>Xác nhận</Button>
        </div>
      </div>
    </Overlay>
  )
}

/** SCR-A.1.2.1-11 — Popup chọn đối tượng ngăn chặn cần giải tỏa. */
export function BlockPickerDialog({ excludeIds, onAdd, onClose }: { excludeIds: string[]; onAdd: (blocks: ReleaseBlock[]) => void; onClose: () => void }) {
  const [kw, setKw] = useState("")
  const [applied, setApplied] = useState("")
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [error, setError] = useState("")

  const pool = useMemo(() => selectableBlocks().filter((b) => !excludeIds.includes(b.id)), [excludeIds])
  const rows = useMemo(() => {
    const q = applied.trim().toLowerCase()
    return q ? pool.filter((b) => `${b.info} ${b.soVanBan} ${b.donViGuiYeuCau}`.toLowerCase().includes(q)) : pool
  }, [pool, applied])

  const toggle = (id: string) => setPicked((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })
  const submit = () => {
    if (!picked.size) return setError("Vui lòng chọn ít nhất một đối tượng cần giải tỏa.")
    onAdd(pool.filter((b) => picked.has(b.id)))
  }

  return (
    <Overlay onClose={onClose}>
      <div className="flex max-h-[85vh] w-[900px] max-w-full flex-col overflow-hidden rounded-xl bg-surface shadow-popover" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
          <span className="text-[15px] font-semibold text-foreground-strong">Chọn đối tượng ngăn chặn cần giải tỏa</span>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="size-[18px]" /></Button>
        </div>
        <div className="border-b border-border px-6 py-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
              <input value={kw} onChange={(e) => setKw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && setApplied(kw)} placeholder="Tìm theo tên/tài sản, số giấy tờ, số văn bản ngăn chặn…" className={cn(inputCls, "h-[38px] pl-9")} />
            </div>
            <Button onClick={() => setApplied(kw)}><Search className="size-4" />Tìm kiếm</Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {rows.length ? (
            <div className="overflow-x-auto rounded-[10px] border border-border">
              <table className="w-full min-w-[720px] border-collapse text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-neutral-50">
                    <Th className="w-11 px-3.5 py-2.5 text-center">Chọn</Th>
                    <Th className="px-3.5 py-2.5">Phân loại</Th>
                    <Th className="px-3.5 py-2.5">Thông tin ngăn chặn</Th>
                    <Th className="px-3.5 py-2.5">Đơn vị gửi yêu cầu</Th>
                    <Th className="px-3.5 py-2.5">Ngày ban hành</Th>
                    <Th className="px-3.5 py-2.5">Số văn bản</Th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((b) => (
                    <tr key={b.id} onClick={() => toggle(b.id)} className="cursor-pointer border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="px-3.5 py-2.5 text-center"><input type="checkbox" checked={picked.has(b.id)} onChange={() => toggle(b.id)} onClick={(e) => e.stopPropagation()} className="size-4 accent-neutral-900" /></td>
                      <td className="px-3.5 py-2.5"><span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] font-semibold text-foreground-strong">{OBJECT_LABEL[b.loai]}</span></td>
                      <td className="px-3.5 py-2.5 text-foreground">{b.info}</td>
                      <td className="px-3.5 py-2.5 text-foreground-muted">{b.donViGuiYeuCau}</td>
                      <td className="whitespace-nowrap px-3.5 py-2.5 tabular-nums text-foreground-muted">{b.ngayBanHanh}</td>
                      <td className="px-3.5 py-2.5 font-mono text-[12px] text-foreground-muted">{b.soVanBan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-[10px] border border-dashed border-border py-10 text-center text-[13.5px] text-foreground-muted">Không tìm thấy thông tin ngăn chặn phù hợp.</div>
          )}
          {error && <div className="mt-2.5 text-[12.5px] text-red-600">{error}</div>}
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-border px-6 py-4">
          <span className="text-[12.5px] text-foreground-muted">Đã chọn: <span className="font-semibold text-foreground-strong">{picked.size}</span></span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Đóng</Button>
            <Button onClick={submit}>Thêm vào danh sách</Button>
          </div>
        </div>
      </div>
    </Overlay>
  )
}
