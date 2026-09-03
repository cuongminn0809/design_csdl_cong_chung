import { useState } from "react"

import { useToast } from "@/features/reconciliation/components/Toast"
import { ConfirmDialog } from "./components"
import { ExportViolationDialog } from "./ExportViolationDialog"
import type { Violation } from "./config"

/**
 * Luồng xuất báo cáo dùng chung cho SCR-A.6.5.1/2/3-01:
 * BR-13 (chưa chốt kỳ) → xác nhận → BR-07..09 (vi phạm) → Dialog SCR-A.6.5.5-01 → xuất.
 */
export function useExportFlow(opts: { periodLabel: string; isClosed: boolean; getViolations: () => Violation[]; doExport: () => void }) {
  const showToast = useToast()
  const [stage, setStage] = useState<"none" | "confirm-open" | "violation">("none")

  const trigger = () => {
    if (!opts.isClosed) { setStage("confirm-open"); return }
    proceedAfterOpenCheck()
  }
  const proceedAfterOpenCheck = () => {
    const v = opts.getViolations()
    if (v.length) { setStage("violation"); return }
    finish()
  }
  const finish = () => {
    setStage("none")
    opts.doExport()
    showToast("Đã tạo file Excel thành công.")
  }

  const dialog = (
    <>
      {stage === "confirm-open" && (
        <ConfirmDialog
          title="Chưa đến ngày chốt báo cáo"
          message="Chưa đến ngày chốt báo cáo theo quy định, dữ liệu có thể thay đổi. Bạn có xác nhận xuất báo cáo không?"
          onCancel={() => setStage("none")}
          onConfirm={proceedAfterOpenCheck}
        />
      )}
      {stage === "violation" && (
        <ExportViolationDialog periodLabel={opts.periodLabel} violations={opts.getViolations()} onCancel={() => setStage("none")} onConfirm={finish} />
      )}
    </>
  )

  return { trigger, dialog }
}
