import { useMemo, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, FileText, Plus, Trash2, Upload, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { Th, inputCls } from "../ingestion/shared"
import { OBJECT_LABEL } from "../prevent/config"
import { ROLE_LABEL, isCreatorRole, linkedBlocks, releaseById, type ReleaseBlock, type ReleaseRole } from "./config"
import { BlockPickerDialog, ConfirmDialog, RoleSelect, SubmitReviewDialog } from "./shared"

const todayISO = () => new Date().toISOString().slice(0, 10)

interface FormState {
  soVanBan: string; ngayBanHanh: string; donViGuiYeuCau: string; soVanBanDen: string
  ngayNhan: string; ngayNhap: string; trichYeu: string; ghiChu: string; fileName: string
  blocks: ReleaseBlock[]
}

export function ReleaseFormPage({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const showToast = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const existing = mode === "edit" ? releaseById(id) : undefined

  const [role, setRole] = useState<ReleaseRole>(existing?.creatorRole ?? "external")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [cancel, setCancel] = useState(false)
  const [review, setReview] = useState(false)
  const [picker, setPicker] = useState(false)

  const [form, setForm] = useState<FormState>(() => ({
    soVanBan: existing?.soVanBan ?? "", ngayBanHanh: "", donViGuiYeuCau: existing?.donViGuiYeuCau ?? (isCreatorRole(role) ? "Công an TP. Hà Nội" : ""),
    soVanBanDen: existing?.soVanBanDen ?? "", ngayNhan: "", ngayNhap: "", trichYeu: existing?.trichYeu ?? "", ghiChu: existing?.ghiChu ?? "",
    fileName: existing?.fileName ?? "", blocks: existing ? linkedBlocks(existing) : [],
  }))
  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }))

  const creator = isCreatorRole(role)
  const donViReadonly = role !== "stp_specialist"
  const excludeIds = useMemo(() => form.blocks.map((b) => b.id), [form.blocks])

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith(".pdf")) return showToast("File đính kèm có định dạng không hợp lệ. Chỉ chấp nhận file .PDF", "error")
    if (file.size > 100 * 1024 * 1024) return showToast("Dung lượng file không được vượt quá 100MB", "error")
    set({ fileName: file.name })
  }

  const validateDraft = () => {
    if (!form.donViGuiYeuCau.trim()) { setErrors({ donViGuiYeuCau: "Thông tin Đơn vị gửi yêu cầu là bắt buộc" }); return false }
    setErrors({}); return true
  }
  const validateFull = () => {
    const e: Record<string, string> = {}
    if (!form.donViGuiYeuCau.trim()) e.donViGuiYeuCau = "Thông tin Đơn vị gửi yêu cầu là bắt buộc"
    if (!form.soVanBan.trim()) e.soVanBan = "Thông tin Số văn bản là bắt buộc"
    if (!form.ngayBanHanh) e.ngayBanHanh = "Thông tin Ngày ban hành là bắt buộc"
    if (form.ngayBanHanh && form.ngayBanHanh > todayISO()) e.ngayBanHanh = "Ngày nhập không được vượt quá ngày hiện tại"
    if (form.ngayNhan && form.ngayNhan > todayISO()) e.ngayNhan = "Ngày nhập không được vượt quá ngày hiện tại"
    setErrors(e)
    if (Object.keys(e).length) return false
    if (!form.blocks.length) { showToast("Vui lòng chọn ít nhất một đối tượng để giải tỏa.", "error"); return false }
    return true
  }

  const back = () => setTimeout(() => navigate("/giai-toa-info/search"), 400)
  const doDraft = () => { if (!validateDraft()) return; showToast(mode === "edit" ? "Cập nhật thông tin thành công." : "Lưu nháp thành công."); back() }
  const doSend = () => { if (!validateFull()) return; showToast("Chuyển Sở tư pháp tiếp nhận thành công."); back() }
  const doPublish = () => { if (!validateFull()) return; showToast("Đăng tải thông tin giải tỏa thành công."); back() }
  const openReview = () => { if (!validateFull()) return; setReview(true) }

  return (
    <div className="pb-24">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => setCancel(true)} className="flex size-9 items-center justify-center rounded-md border border-border bg-surface text-foreground-muted shadow-xs hover:bg-surface-muted">
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h3 className="text-[22px] font-semibold leading-tight tracking-[-0.02em] text-foreground-strong">{mode === "edit" ? "Chỉnh sửa thông tin giải tỏa" : "Thêm mới thông tin giải tỏa"}</h3>
            <p className="mt-1 text-[13px] text-foreground-muted">Nhập thông tin văn bản giải tỏa và chọn đối tượng ngăn chặn cần giải tỏa.</p>
          </div>
        </div>
        <RoleSelect role={role} onChange={setRole} />
      </div>

      <Section title="Thông tin văn bản giải tỏa">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <FField label="Số văn bản" required error={errors.soVanBan}><input value={form.soVanBan} maxLength={250} onChange={(e) => set({ soVanBan: e.target.value })} className={inputCls} /></FField>
          <FField label="File đính kèm">
            <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={onPickFile} />
            {form.fileName ? (
              <div className="flex items-center gap-2.5 rounded-md border border-border bg-neutral-50 px-3 py-2">
                <FileText className="size-4 shrink-0 text-red-600" />
                <span className="flex-1 truncate font-mono text-[12.5px]">{form.fileName}</span>
                <button onClick={() => set({ fileName: "" })} className="rounded p-1 text-foreground-muted hover:text-red-600"><X className="size-4" /></button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-border py-2.5 text-[13px] text-foreground-muted hover:bg-surface-muted"><Upload className="size-4" />Tải lên tệp .pdf</button>
            )}
          </FField>
          <FField label="Ngày ban hành văn bản" required error={errors.ngayBanHanh}><input type="date" max={todayISO()} value={form.ngayBanHanh} onChange={(e) => set({ ngayBanHanh: e.target.value })} className={cn(inputCls, "text-[13.5px]")} /></FField>
          <FField label="Số văn bản đến"><input value={form.soVanBanDen} maxLength={250} onChange={(e) => set({ soVanBanDen: e.target.value })} className={inputCls} /></FField>
          <FField label="Đơn vị gửi yêu cầu" required error={errors.donViGuiYeuCau}>
            {donViReadonly ? (
              <input value={form.donViGuiYeuCau} readOnly className={cn(inputCls, "cursor-not-allowed bg-neutral-100 text-foreground-muted")} />
            ) : (
              <div className="flex gap-2">
                <input value={form.donViGuiYeuCau} onChange={(e) => set({ donViGuiYeuCau: e.target.value })} placeholder="Chọn / nhập đơn vị" className={inputCls} />
                <Button variant="outline" size="sm" onClick={() => showToast("Mở popup thêm nhanh đơn vị gửi yêu cầu")}>Thêm mới</Button>
              </div>
            )}
          </FField>
          <FField label="Ngày nhận" error={errors.ngayNhan}><input type="date" max={todayISO()} value={form.ngayNhan} onChange={(e) => set({ ngayNhan: e.target.value })} className={cn(inputCls, "text-[13.5px]")} /></FField>
          <FField label="Ngày nhập"><input type="date" max={todayISO()} value={form.ngayNhap} onChange={(e) => set({ ngayNhap: e.target.value })} className={cn(inputCls, "text-[13.5px]")} /></FField>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <FField label="Trích yếu"><textarea value={form.trichYeu} maxLength={2000} rows={2} onChange={(e) => set({ trichYeu: e.target.value })} placeholder="Nhập trích yếu…" className={cn(inputCls, "h-auto resize-none py-2 leading-relaxed")} /></FField>
          <FField label="Ghi chú"><textarea value={form.ghiChu} maxLength={2000} rows={2} onChange={(e) => set({ ghiChu: e.target.value })} placeholder="Nhập ghi chú…" className={cn(inputCls, "h-auto resize-none py-2 leading-relaxed")} /></FField>
        </div>
      </Section>

      <Section title="Danh sách giải tỏa" action={<Button variant="outline" size="sm" onClick={() => setPicker(true)}><Plus className="size-3.5" />Thêm đối tượng giải tỏa</Button>}>
        {form.blocks.length ? (
          <div className="overflow-x-auto rounded-[10px] border border-border">
            <table className="w-full min-w-[820px] border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-border bg-neutral-50">
                  <Th className="w-11 px-3.5 py-2.5 text-center">STT</Th>
                  <Th className="px-3.5 py-2.5">Phân loại</Th>
                  <Th className="px-3.5 py-2.5">Thông tin ngăn chặn</Th>
                  <Th className="px-3.5 py-2.5">Đơn vị gửi yêu cầu</Th>
                  <Th className="px-3.5 py-2.5">Ngày ban hành</Th>
                  <Th className="w-20 px-3.5 py-2.5 text-center">Thao tác</Th>
                </tr>
              </thead>
              <tbody>
                {form.blocks.map((b, i) => (
                  <tr key={b.id} className="border-b border-neutral-100">
                    <td className="px-3.5 py-2.5 text-center text-foreground-muted">{i + 1}</td>
                    <td className="px-3.5 py-2.5"><span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] font-semibold text-foreground-strong">{OBJECT_LABEL[b.loai]}</span></td>
                    <td className="px-3.5 py-2.5 font-medium text-foreground">{b.info}</td>
                    <td className="px-3.5 py-2.5 text-foreground-muted">{b.donViGuiYeuCau}</td>
                    <td className="whitespace-nowrap px-3.5 py-2.5 tabular-nums text-foreground-muted">{b.ngayBanHanh}</td>
                    <td className="px-3.5 py-2.5 text-center">
                      <button onClick={() => set({ blocks: form.blocks.filter((_, x) => x !== i) })} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium text-red-600 hover:bg-[#fef2f2]"><Trash2 className="size-3.5" />Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-[10px] border border-dashed border-border py-8 text-center text-[13px] text-foreground-muted">Chưa có đối tượng. Nhấn “Thêm đối tượng giải tỏa” để chọn từ danh sách ngăn chặn đang hoạt động.</div>
        )}
      </Section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur lg:left-[264px]">
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-6 py-3.5">
          <span className="text-[12.5px] text-foreground-muted">Vai trò: {ROLE_LABEL[role]} — Đối tượng đã chọn: {form.blocks.length}</span>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button variant="ghost" onClick={() => setCancel(true)}>Hủy</Button>
            <Button variant="outline" onClick={doDraft}>Lưu nháp</Button>
            {creator ? (
              <Button onClick={doSend}>Chuyển Sở Tư pháp</Button>
            ) : (
              <>
                <Button variant="outline" onClick={openReview}>Trình lãnh đạo</Button>
                <Button onClick={doPublish}>Đăng tải</Button>
              </>
            )}
          </div>
        </div>
      </div>

      {cancel && (
        <ConfirmDialog title="Xác nhận hủy thao tác" danger confirmLabel="Đồng ý"
          message={`Bạn có chắc chắn muốn hủy thao tác ${mode === "edit" ? "chỉnh sửa" : "thêm mới"}? Mọi thông tin đã nhập sẽ không được lưu lại.`}
          onClose={() => setCancel(false)} onConfirm={() => navigate("/giai-toa-info/search")} />
      )}
      {review && <SubmitReviewDialog leaderRole={role} onClose={() => setReview(false)} onSubmit={() => { setReview(false); showToast("Trình lãnh đạo thành công."); back() }} />}
      {picker && <BlockPickerDialog excludeIds={excludeIds} onClose={() => setPicker(false)} onAdd={(bs) => { set({ blocks: [...form.blocks, ...bs] }); setPicker(false) }} />}
    </div>
  )
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-[14px] border border-border bg-surface p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-[13px] font-semibold text-foreground-strong">{title}</div>
        {action}
      </div>
      {children}
    </div>
  )
}
function FField({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-foreground-strong">{label}{required && <span className="ml-1 text-red-600">*</span>}</label>
      {children}
      {error && <span className="text-[12px] text-red-600">{error}</span>}
    </div>
  )
}
