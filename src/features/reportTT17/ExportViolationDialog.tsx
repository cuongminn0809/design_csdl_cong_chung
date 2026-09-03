import { AlertTriangle, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Th } from "../ingestion/shared"
import type { Violation } from "./config"

export function ExportViolationDialog({ periodLabel, violations, onCancel, onConfirm }: {
  periodLabel: string; violations: Violation[]; onCancel: () => void; onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={onCancel}>
      <div className="flex max-h-[85vh] w-full max-w-[680px] flex-col overflow-hidden rounded-xl bg-surface shadow-popover" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <span className="flex items-center gap-2 text-[15px] font-semibold text-[#b45309]"><AlertTriangle className="size-[18px]" />Cảnh báo vi phạm khi xuất báo cáo</span>
          <Button variant="ghost" size="icon" onClick={onCancel}><X className="size-[18px]" /></Button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <p className="text-[13.5px] text-foreground">Phát hiện <span className="font-semibold">{String(violations.length).padStart(2, "0")}</span> vi phạm trong dữ liệu báo cáo kỳ <span className="font-semibold">{periodLabel}</span>.</p>
          <p className="text-[13.5px] text-foreground-muted">Vui lòng kiểm tra trước khi xuất báo cáo.</p>
          <div className="mt-4 overflow-hidden rounded-[10px] border border-border">
            <table className="w-full border-collapse text-[13px]">
              <thead><tr className="border-b border-border bg-neutral-50"><Th className="w-11 px-3.5 py-2.5 text-center">STT</Th><Th className="px-3.5 py-2.5">Mã rule</Th><Th className="px-3.5 py-2.5">Mô tả vi phạm</Th><Th className="px-3.5 py-2.5">Chỉ tiêu / Giá trị</Th></tr></thead>
              <tbody>{violations.map((v, i) => (
                <tr key={i} className="border-b border-neutral-100 last:border-0">
                  <td className="px-3.5 py-2.5 text-center text-foreground-muted">{i + 1}</td>
                  <td className="px-3.5 py-2.5 font-mono text-[12px] font-semibold text-[#b45309]">{v.rule}</td>
                  <td className="px-3.5 py-2.5 text-foreground">{v.desc}</td>
                  <td className="px-3.5 py-2.5 font-mono text-[12px] text-foreground-muted">{v.detail}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <div className="mt-2 text-right text-[12px] text-foreground-subtle">Tổng cộng: {violations.length} vi phạm</div>
        </div>
        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
          <Button variant="outline" onClick={onCancel}>Hủy</Button>
          <Button className="bg-[#b45309] hover:bg-[#92400e]" onClick={onConfirm}>Xác nhận xuất báo cáo</Button>
        </div>
      </div>
    </div>
  )
}
