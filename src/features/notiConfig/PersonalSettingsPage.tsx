import { useEffect, useMemo, useState } from "react"
import { RotateCcw, Settings2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { NOTI_ROLES, setCurrentRole, useCurrentRole } from "@/features/notifications/config"
import { EmptyState, PageHeader } from "../ingestion/shared"
import {
  TAN_SUAT_LIST, TODAY_ISO, accountHasEmail, activeNotiTypes, getNotiType, savePersonalSettings, usePersonalSettings,
  type PauseConfig, type PersonalSettingRow, type TanSuat,
} from "./config"

const TIME_OPTIONS = (() => {
  const out: string[] = []
  for (let h = 0; h < 24; h++) for (const m of [0, 30]) out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`)
  out.push("23:59")
  return out
})()

export function PersonalSettingsPage() {
  const showToast = useToast()
  const role = useCurrentRole()
  const saved = usePersonalSettings(role)
  const types = activeNotiTypes()
  const hasEmail = accountHasEmail(role)

  const [rows, setRows] = useState<PersonalSettingRow[]>(saved.rows)
  const [pause, setPause] = useState<PauseConfig>(saved.pause)
  const [error, setError] = useState("")
  const [rowErrors, setRowErrors] = useState<Set<string>>(new Set())

  useEffect(() => { setRows(saved.rows); setPause(saved.pause); setError(""); setRowErrors(new Set()) }, [role]) // eslint-disable-line react-hooks/exhaustive-deps

  const dirty = useMemo(() => JSON.stringify({ rows, pause }) !== JSON.stringify({ rows: saved.rows, pause: saved.pause }), [rows, pause, saved])

  const updateRow = (id: string, patch: Partial<PersonalSettingRow>) => setRows((prev) => prev.map((r) => (r.loaiThongBaoId === id ? { ...r, ...patch } : r)))

  const doSave = () => {
    const badChannel = new Set<string>()
    const badTime = new Set<string>()
    for (const r of rows) {
      if (!r.phanMem && !r.email) badChannel.add(r.loaiThongBaoId)
      if (r.gioKetThuc <= r.gioBatDau) badTime.add(r.loaiThongBaoId)
    }
    if (badChannel.size > 0) { setRowErrors(badChannel); return setError("Mỗi loại thông báo phải chọn ít nhất một kênh nhận.") }
    if (badTime.size > 0) {
      const name = getNotiType(rows.find((r) => badTime.has(r.loaiThongBaoId))!.loaiThongBaoId)?.tenLoai
      setRowErrors(badTime)
      return setError(`Khung giờ của loại thông báo "${name}" không hợp lệ. Giờ kết thúc phải lớn hơn giờ bắt đầu.`)
    }
    if (pause.enabled) {
      if (pause.scope === "selected" && pause.selectedTypeIds.length === 0) { setRowErrors(new Set()); return setError("Vui lòng chọn ít nhất một loại thông báo tạm dừng.") }
      if (!pause.tuNgay || !pause.denNgay || pause.denNgay < pause.tuNgay || pause.denNgay < TODAY_ISO) { setRowErrors(new Set()); return setError("Khoảng thời gian tạm dừng không hợp lệ. Đến ngày phải từ hôm nay trở đi và không nhỏ hơn Từ ngày.") }
    }
    setError(""); setRowErrors(new Set())
    savePersonalSettings(role, { rows, pause })
    showToast("Lưu cài đặt nhận thông báo thành công.")
  }

  const doCancel = () => { setRows(saved.rows); setPause(saved.pause); setError(""); setRowErrors(new Set()) }
  const doResetDefault = () => {
    if (!window.confirm("Khôi phục toàn bộ cài đặt về giá trị mặc định? Thay đổi chỉ áp dụng sau khi bấm Lưu cài đặt.")) return
    setRows(types.map((t) => ({ loaiThongBaoId: t.id, phanMem: true, email: false, tanSuat: "Ngay lập tức", gioBatDau: "00:00", gioKetThuc: "23:59" })))
    setPause({ enabled: false, scope: "all", selectedTypeIds: [], tuNgay: "", denNgay: "" })
    setError(""); setRowErrors(new Set())
  }

  const toggleSelectedType = (id: string) => setPause((p) => ({ ...p, selectedTypeIds: p.selectedTypeIds.includes(id) ? p.selectedTypeIds.filter((x) => x !== id) : [...p.selectedTypeIds, id] }))

  return (
    <div className="space-y-4">
      <PageHeader title="Cài đặt nhận thông báo" desc="Thiết lập kênh nhận, tần suất, khung giờ và tạm dừng nhận thông báo theo từng loại thông báo."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] text-foreground-muted">Vai trò:</span>
            <NativeSelect value={role} onChange={(e) => setCurrentRole(e.target.value as typeof role)} className="h-8 w-[220px] text-[12.5px]">
              {NOTI_ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </NativeSelect>
          </div>
        } />

      {types.length === 0 ? (
        <EmptyState icon={<Settings2 className="size-6" />} title="Chưa có loại thông báo" desc="Chưa có loại thông báo đang sử dụng để cấu hình." />
      ) : (
        <>
          <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead><tr className="border-b border-border bg-neutral-50">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-foreground-muted">Loại thông báo</th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-foreground-muted">Trong phần mềm</th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-foreground-muted">Email</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-foreground-muted">Tần suất</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-foreground-muted">Từ giờ</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-foreground-muted">Đến giờ</th>
                </tr></thead>
                <tbody>{rows.map((r) => {
                  const type = getNotiType(r.loaiThongBaoId)
                  const errored = rowErrors.has(r.loaiThongBaoId)
                  return (
                    <tr key={r.loaiThongBaoId} className={cn("border-b border-neutral-100", errored && "bg-[#fef2f2]")}>
                      <td className="px-4 py-3 font-medium text-foreground">{type?.tenLoai ?? "—"}</td>
                      <td className="px-4 py-3 text-center"><input type="checkbox" checked={r.phanMem} onChange={(e) => updateRow(r.loaiThongBaoId, { phanMem: e.target.checked })} /></td>
                      <td className="px-4 py-3 text-center">
                        <input type="checkbox" checked={r.email} disabled={!hasEmail} title={!hasEmail ? "Tài khoản chưa có email" : undefined} onChange={(e) => updateRow(r.loaiThongBaoId, { email: e.target.checked })} />
                      </td>
                      <td className="px-4 py-3">
                        <NativeSelect value={r.tanSuat} onChange={(e) => updateRow(r.loaiThongBaoId, { tanSuat: e.target.value as TanSuat })} className="h-8 w-[150px] text-[12.5px]">
                          {TAN_SUAT_LIST.map((t) => <option key={t} value={t}>{t}</option>)}
                        </NativeSelect>
                      </td>
                      <td className="px-4 py-3">
                        <NativeSelect value={r.gioBatDau} onChange={(e) => updateRow(r.loaiThongBaoId, { gioBatDau: e.target.value })} className="h-8 w-[100px] text-[12.5px]">
                          {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                        </NativeSelect>
                      </td>
                      <td className="px-4 py-3">
                        <NativeSelect value={r.gioKetThuc} onChange={(e) => updateRow(r.loaiThongBaoId, { gioKetThuc: e.target.value })} className="h-8 w-[100px] text-[12.5px]">
                          {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                        </NativeSelect>
                      </td>
                    </tr>
                  )
                })}</tbody>
              </table>
            </div>
          </div>

          <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[14px] font-semibold text-foreground-strong">Tạm dừng nhận thông báo</div>
                <div className="mt-0.5 text-[12.5px] text-foreground-muted">Tạm dừng theo khoảng thời gian; hệ thống tự khôi phục sau khi hết hạn.</div>
              </div>
              <button type="button" onClick={() => setPause((p) => ({ ...p, enabled: !p.enabled }))} aria-pressed={pause.enabled} className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", pause.enabled ? "bg-neutral-900" : "bg-neutral-200")}>
                <span className="absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform" style={{ transform: pause.enabled ? "translateX(22px)" : "translateX(0)" }} />
              </button>
            </div>

            {pause.enabled && (
              <div className="mt-4 flex flex-col gap-4 border-t border-neutral-100 pt-4">
                <div className="flex gap-5 text-[13.5px]">
                  <label className="flex items-center gap-1.5"><input type="radio" checked={pause.scope === "all"} onChange={() => setPause((p) => ({ ...p, scope: "all" }))} />Tất cả loại thông báo</label>
                  <label className="flex items-center gap-1.5"><input type="radio" checked={pause.scope === "selected"} onChange={() => setPause((p) => ({ ...p, scope: "selected" }))} />Chọn loại</label>
                </div>
                {pause.scope === "selected" && (
                  <div className="flex flex-wrap gap-1.5">
                    {types.map((t) => (
                      <button key={t.id} type="button" onClick={() => toggleSelectedType(t.id)} className={cn("rounded-full border px-2.5 py-1 text-[12.5px]", pause.selectedTypeIds.includes(t.id) ? "border-neutral-900 bg-neutral-900 text-white" : "border-border bg-surface text-foreground-muted hover:bg-surface-muted")}>
                        {t.tenLoai}
                      </button>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 sm:w-[400px]">
                  <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Từ ngày</label><input type="date" value={pause.tuNgay} onChange={(e) => setPause((p) => ({ ...p, tuNgay: e.target.value }))} className="h-9 rounded-md border border-input bg-surface px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50" /></div>
                  <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-foreground-strong">Đến ngày</label><input type="date" value={pause.denNgay} onChange={(e) => setPause((p) => ({ ...p, denNgay: e.target.value }))} className="h-9 rounded-md border border-input bg-surface px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50" /></div>
                </div>
              </div>
            )}
          </div>

          {error && <div className="rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]">{error}</div>}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={doResetDefault}><RotateCcw className="size-4" />Khôi phục mặc định</Button>
            <Button variant="outline" disabled={!dirty} onClick={doCancel}>Hủy thay đổi</Button>
            <Button onClick={doSave}>Lưu cài đặt</Button>
          </div>
        </>
      )}
    </div>
  )
}
