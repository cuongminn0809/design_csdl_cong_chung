import { useMemo, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AlertTriangle, ArrowLeft, FileText, Lock, Plus, Trash2, Upload, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { useToast } from "@/features/reconciliation/components/Toast"
import { Th, inputCls } from "../../ingestion/shared"
import { TRANSACTIONS, type Method } from "../config"
import { REVOKE_REQUESTS, revokeStateOf } from "./config"
import { ConfirmDialog } from "./shared"

const todayISO = () => new Date().toISOString().slice(0, 10)

interface FormState {
  ngayCC: string
  soCC: string
  method: Method
  diaDiem: string
  toChuc: string
  ccv: string
  noiDung: string
  phi: string
  thuLao: string
  ghiChu: string
}

export function RevokeFormPage() {
  const { id } = useParams() // id = giao dịch gốc
  const navigate = useNavigate()
  const showToast = useToast()
  const fileRef = useRef<HTMLInputElement>(null)

  const source = useMemo(() => TRANSACTIONS.find((t) => t.id === id), [id])
  // Yêu cầu hủy dở dang sẵn có của giao dịch gốc (chế độ chỉnh sửa).
  const existing = useMemo(() => REVOKE_REQUESTS.find((r) => r.sourceId === id && (r.status === "draft" || r.status === "revise")), [id])
  const revState = source ? revokeStateOf(source.id) : "none"

  const [form, setForm] = useState<FormState>(() => ({
    ngayCC: todayISO(),
    soCC: existing?.soCC ?? "",
    method: (existing?.method ?? source?.method ?? "paper") as Method,
    diaDiem: existing?.diaDiem ?? source?.diaDiem ?? "",
    toChuc: existing?.toChuc ?? source?.toChuc ?? "",
    ccv: existing?.ccv ?? source?.ccv ?? "",
    noiDung: existing?.noiDung ?? "",
    phi: existing ? String(existing.phi) : "",
    thuLao: existing ? String(existing.thuLao) : "",
    ghiChu: existing?.ghiChu ?? "",
  }))
  const [huyFileName, setHuyFileName] = useState(existing?.scanFile || existing?.signedFile || "")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [confirmCancel, setConfirmCancel] = useState(false)

  if (!source) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <FileText className="size-10 text-foreground-subtle" />
        <div className="text-[15px] font-semibold text-foreground-strong">Không tìm thấy giao dịch gốc</div>
        <Button variant="outline" onClick={() => navigate("/notary-transaction/paper/list")}>Quay lại danh sách</Button>
      </div>
    )
  }

  // BR010 / BR011 — chặn khi giao dịch gốc đã hủy hoặc đang có yêu cầu hủy khác (không phải bản đang sửa).
  const blocked =
    revState === "revoked"
      ? "MSG-E015: Giao dịch công chứng gốc đã được tuyên hủy trước đó."
      : revState === "pending" && !existing
        ? "MSG-E016: Giao dịch đang có một yêu cầu tuyên hủy khác đang được xử lý."
        : ""

  const listPath = source.method === "paper" ? "/notary-transaction/paper/list" : "/notary-transaction/electronic/list"
  const set = (patch: Partial<FormState>) => setForm({ ...form, ...patch })

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith(".pdf")) { showToast("Định dạng file đính kèm không hợp lệ (chỉ nhận .pdf)", "error"); return }
    if (file.size > 50 * 1024 * 1024) { showToast("Dung lượng file không được vượt quá 50MB", "error"); return }
    setHuyFileName(file.name)
    if (errors.file) setErrors((p) => ({ ...p, file: "" }))
  }

  const validate = (isSubmit: boolean): boolean => {
    const e: Record<string, string> = {}
    // VR001 — trường bắt buộc (áp dụng khi Trình duyệt)
    if (isSubmit) {
      if (!form.ngayCC) e.ngayCC = "Thông tin Ngày công chứng là bắt buộc"
      if (!form.soCC.trim()) e.soCC = "Thông tin Số công chứng là bắt buộc"
      if (!form.diaDiem.trim()) e.diaDiem = "Thông tin Địa điểm công chứng là bắt buộc"
      if (!form.ccv.trim()) e.ccv = "Thông tin Công chứng viên là bắt buộc"
    }
    // VR002 — ngày CC không vượt quá hôm nay
    if (form.ngayCC && form.ngayCC > todayISO()) e.ngayCC = "Ngày công chứng không được vượt quá ngày hiện tại"
    // VR006 — điện tử bắt buộc file khi Trình duyệt
    if (isSubmit && form.method === "electronic" && !huyFileName) e.file = "Chưa có file văn bản công chứng điện tử, vui lòng kiểm tra lại"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const doSaveDraft = () => {
    if (blocked) return
    if (!validate(false)) return
    showToast("Đã lưu nháp yêu cầu hủy văn bản công chứng thành công")
    setTimeout(() => navigate(`${source.method === "paper" ? "/notary-transaction/paper" : "/notary-transaction/electronic"}/detail/${source.id}`), 400)
  }
  const doSubmit = () => {
    if (blocked) return
    if (!validate(true)) return
    showToast("Trình duyệt yêu cầu hủy văn bản công chứng thành công")
    setTimeout(() => navigate(`${source.method === "paper" ? "/notary-transaction/paper" : "/notary-transaction/electronic"}/detail/${source.id}`), 400)
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <button onClick={() => setConfirmCancel(true)} className="flex size-9 items-center justify-center rounded-md border border-border bg-surface text-foreground-muted shadow-xs hover:bg-surface-muted">
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <h3 className="text-[22px] font-semibold leading-tight tracking-[-0.02em] text-foreground-strong">Hủy văn bản công chứng</h3>
          <p className="mt-1 text-[13px] text-foreground-muted">Khai báo và trình duyệt yêu cầu tuyên hủy hợp đồng, giao dịch đã công chứng.</p>
        </div>
      </div>

      {blocked && (
        <div className="mb-4 flex items-start gap-2.5 rounded-[12px] border border-[#fecaca] bg-[#fef2f2] px-4 py-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600" />
          <div className="text-[13px] text-[#b91c1c]">{blocked} Không thể tạo yêu cầu tuyên hủy cho giao dịch này.</div>
        </div>
      )}

      {existing?.status === "revise" && existing.reviseReason && (
        <div className="mb-4 flex items-start gap-2.5 rounded-[12px] border border-[#fde68a] bg-[#fffbeb] px-4 py-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#b45309]" />
          <div className="text-[13px] text-[#92400e]">
            <span className="font-semibold">Bản ghi bị yêu cầu chỉnh sửa.</span> Lý do phản hồi từ Trưởng TCHNCC: “{existing.reviseReason}”
          </div>
        </div>
      )}

      {/* Giao dịch gốc */}
      <Section title="Giao dịch công chứng gốc (chỉ xem)">
        <div className="grid grid-cols-1 gap-x-8 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">
          <RO label="Số công chứng gốc" value={source.soCC} />
          <RO label="Ngày công chứng gốc" value={source.ngayCC} />
          <RO label="Tổ chức công chứng" value={source.toChuc} />
          <RO label="Loại giao dịch" value={source.loaiGD} />
          <RO label="Công chứng viên" value={source.ccv} />
          <RO label="Phương thức" value={source.method === "paper" ? "Công chứng giấy" : "Công chứng điện tử"} />
        </div>
      </Section>

      {/* Thông tin văn bản hủy */}
      <Section title="Thông tin văn bản hủy">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Ngày công chứng" required error={errors.ngayCC}>
            <input type="date" value={form.ngayCC} max={todayISO()} onChange={(e) => set({ ngayCC: e.target.value })} className={cn(inputCls, "text-[13.5px]")} />
          </FormField>
          <FormField label="Số công chứng" required error={errors.soCC}>
            <input value={form.soCC} maxLength={50} onChange={(e) => set({ soCC: e.target.value })} placeholder="Nhập số công chứng văn bản hủy" className={inputCls} />
          </FormField>
          <FormField label="Phương thức công chứng" required>
            <NativeSelect value={form.method} onChange={(e) => set({ method: e.target.value as Method })}>
              <option value="paper">Công chứng giấy</option>
              <option value="electronic">Công chứng điện tử</option>
            </NativeSelect>
          </FormField>
          <FormField label="Loại giao dịch" required locked>
            <LockedInput value={source.loaiGD} />
          </FormField>
          <FormField label="Tên giao dịch" required locked>
            <LockedInput value="Văn bản hủy" />
          </FormField>
          <FormField label="Địa điểm công chứng" required error={errors.diaDiem}>
            <input value={form.diaDiem} maxLength={500} onChange={(e) => set({ diaDiem: e.target.value })} className={inputCls} />
          </FormField>
          <FormField label="Tổ chức công chứng" required locked hint="Chỉ mở khóa khi tổ chức gốc giải thể">
            <LockedInput value={form.toChuc} />
          </FormField>
          <FormField label="Công chứng viên" required error={errors.ccv}>
            <input value={form.ccv} onChange={(e) => set({ ccv: e.target.value })} className={inputCls} />
          </FormField>
        </div>
        <FormField label="Nội dung giao dịch" className="mt-4">
          <textarea value={form.noiDung} maxLength={2000} rows={2} onChange={(e) => set({ noiDung: e.target.value })} placeholder="Nhập nội dung chi tiết hủy văn bản…" className={cn(inputCls, "h-auto resize-none py-2 leading-relaxed")} />
        </FormField>
      </Section>

      {/* Thông tin khác */}
      <Section title="Thông tin khác">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Phí công chứng">
            <input inputMode="numeric" value={form.phi} onChange={(e) => set({ phi: e.target.value.replace(/[^\d]/g, "") })} placeholder="0" className={inputCls} />
          </FormField>
          <FormField label="Thù lao công chứng">
            <input inputMode="numeric" value={form.thuLao} onChange={(e) => set({ thuLao: e.target.value.replace(/[^\d]/g, "") })} placeholder="0" className={inputCls} />
          </FormField>
          <FormField label="Ghi chú">
            <input value={form.ghiChu} maxLength={1000} onChange={(e) => set({ ghiChu: e.target.value })} placeholder="Nhập ghi chú thêm" className={inputCls} />
          </FormField>
        </div>
      </Section>

      {/* Bên liên quan (kế thừa giao dịch gốc) */}
      <Section
        title="Thông tin bên liên quan"
        action={<Button variant="outline" size="sm" onClick={() => showToast("Mở form thêm người tham gia giao dịch")}><Plus className="size-3.5" />Thêm người tham gia</Button>}
      >
        <MiniTable
          cols={["STT", "Họ tên / Tên tổ chức", "Giấy tờ tùy thân / pháp nhân", "Địa chỉ", "Vai trò", ""]}
          rows={source.parties.map((p, i) => [
            String(i + 1), p.name, p.giayTo, p.diaChi, p.vaiTro,
          ])}
          onEdit={() => showToast("Mở form sửa người tham gia")}
          onDelete={() => showToast("Đã xóa người tham gia khỏi yêu cầu hủy")}
        />
      </Section>

      {/* Tài sản (kế thừa giao dịch gốc) */}
      <Section
        title="Thông tin tài sản giao dịch"
        action={<Button variant="outline" size="sm" onClick={() => showToast("Mở form thêm tài sản giao dịch")}><Plus className="size-3.5" />Thêm tài sản</Button>}
      >
        {source.assets.length ? (
          <MiniTable
            cols={["STT", "Loại tài sản", "Giấy chứng nhận", "Chủ sở hữu", "Địa chỉ / Đặc điểm tài sản", ""]}
            rows={source.assets.map((a, i) => [String(i + 1), a.loai, a.gcn, a.chuSoHuu, a.dacDiem])}
            onEdit={() => showToast("Mở form sửa tài sản")}
            onDelete={() => showToast("Đã xóa tài sản khỏi yêu cầu hủy")}
          />
        ) : (
          <div className="rounded-[10px] border border-dashed border-border py-6 text-center text-[13px] text-foreground-muted">Giao dịch gốc không gắn với tài sản cụ thể.</div>
        )}
      </Section>

      {/* Tệp đính kèm */}
      <Section title="Tệp tài liệu đính kèm">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <div className="mb-2 text-[12.5px] font-semibold text-foreground-strong">
              Văn bản công chứng điện tử (Văn bản hủy) {form.method === "electronic" && <span className="text-red-600">*</span>}
            </div>
            <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={onPickFile} />
            {huyFileName ? (
              <div className="flex items-center gap-2.5 rounded-lg border border-border bg-neutral-50 p-3">
                <FileText className="size-5 shrink-0 text-red-600" />
                <span className="flex-1 truncate font-mono text-[12.5px] text-foreground">{huyFileName}</span>
                <button onClick={() => setHuyFileName("")} className="rounded-md p-1 text-foreground-muted hover:bg-surface-muted hover:text-red-600" title="Gỡ tệp"><X className="size-4" /></button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-6 text-[13px] text-foreground-muted hover:bg-surface-muted">
                <Upload className="size-4" />Tải lên tệp .pdf (tối đa 50MB)
              </button>
            )}
            {errors.file && <div className="mt-1.5 text-[12px] text-red-600">{errors.file}</div>}
          </div>
          <div>
            <div className="mb-2 text-[12.5px] font-semibold text-foreground-strong">Thành phần hồ sơ khác</div>
            <button onClick={() => showToast("Chọn tệp hồ sơ đính kèm (.pdf, .docx, .jpeg…)")} className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-6 text-[13px] text-foreground-muted hover:bg-surface-muted">
              <Upload className="size-4" />Tải lên tệp đính kèm (nhiều tệp)
            </button>
          </div>
        </div>
      </Section>

      {/* Action bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur lg:left-[264px]">
        <div className="flex justify-end gap-2.5 px-6 py-3.5">
          <Button variant="outline" onClick={() => setConfirmCancel(true)}>Hủy</Button>
          <Button variant="outline" onClick={doSaveDraft} disabled={!!blocked}>Lưu nháp</Button>
          <Button onClick={doSubmit} disabled={!!blocked}>Trình duyệt</Button>
        </div>
      </div>

      {confirmCancel && (
        <ConfirmDialog
          title="Xác nhận hủy thao tác"
          message="Bạn có chắc chắn muốn hủy thao tác? Mọi thông tin đã nhập sẽ không được lưu lại."
          confirmLabel="Đồng ý"
          danger
          onConfirm={() => navigate(listPath)}
          onClose={() => setConfirmCancel(false)}
        />
      )}
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

function RO({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-neutral-100 py-2.5">
      <div className="text-xs text-foreground-muted">{label}</div>
      <div className="text-[13.5px] leading-snug text-foreground">{value}</div>
    </div>
  )
}

function FormField({ label, required, locked, hint, error, className, children }: { label: string; required?: boolean; locked?: boolean; hint?: string; error?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground-strong">
        {label}
        {required && <span className="text-red-600">*</span>}
        {locked && <Lock className="size-3 text-foreground-subtle" />}
        {hint && <span className="font-normal text-[11px] text-foreground-subtle">— {hint}</span>}
      </label>
      {children}
      {error && <span className="text-[12px] text-red-600">{error}</span>}
    </div>
  )
}

function LockedInput({ value }: { value: string }) {
  return <input value={value} readOnly disabled className={cn(inputCls, "cursor-not-allowed bg-neutral-100 text-foreground-muted")} />
}

function MiniTable({ cols, rows, onEdit, onDelete }: { cols: string[]; rows: string[][]; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-border">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-border bg-neutral-50">
            {cols.map((c, i) => <Th key={i} className={cn("px-3.5 py-2.5", i === 0 && "w-11 text-center", i === cols.length - 1 && "w-20 text-center")}>{c}</Th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-neutral-100">
              {row.map((cell, ci) => (
                <td key={ci} className={cn("px-3.5 py-2.5", ci === 0 ? "text-center text-foreground-muted" : ci === 1 ? "font-medium text-foreground" : "text-foreground-muted")}>{cell}</td>
              ))}
              <td className="px-3.5 py-2.5">
                <div className="flex items-center justify-center gap-1">
                  <button onClick={onEdit} className="rounded-md p-1.5 text-foreground-muted hover:bg-surface-muted hover:text-foreground-strong" title="Sửa"><FileText className="size-3.5" /></button>
                  <button onClick={onDelete} className="rounded-md p-1.5 text-foreground-muted hover:bg-[#fef2f2] hover:text-red-600" title="Xóa"><Trash2 className="size-3.5" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
