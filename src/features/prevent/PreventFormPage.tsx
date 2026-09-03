import { useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, ChevronLeft, ChevronRight, FileText, Plus, Trash2, Upload, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { useToast } from "@/features/reconciliation/components/Toast"
import { inputCls } from "../ingestion/shared"
import {
  ASSET_TYPES, ORG_DOC_TYPES, PERSON_DOC_TYPES, PROVINCES, ROLE_LABEL, preventById,
  type PreventAsset, type PreventOrg, type PreventPerson, type PreventRole,
} from "./config"
import { ConfirmDialog, RoleSelect, SubmitReviewDialog } from "./shared"

const todayISO = () => new Date().toISOString().slice(0, 10)

interface FormState {
  donViGuiYeuCau: string; soVanBan: string; ngayBanHanh: string; soVanBanDen: string; ngayVanBanDen: string; trichYeu: string; fileName: string
  assets: PreventAsset[]; persons: PreventPerson[]; orgs: PreventOrg[]
}

const STEPS = ["Thông tin chung", "Thông tin tài sản", "Thông tin cá nhân", "Thông tin tổ chức"]

export function PreventFormPage({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const showToast = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const existing = mode === "edit" ? preventById(id) : undefined

  const [role, setRole] = useState<PreventRole>(existing?.creatorRole ?? "external")
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [cancel, setCancel] = useState(false)
  const [review, setReview] = useState(false)

  const [form, setForm] = useState<FormState>(() => ({
    donViGuiYeuCau: existing?.donViGuiYeuCau ?? (role === "external" ? "Công an TP. Hà Nội" : ""),
    soVanBan: existing?.soVanBan ?? "", ngayBanHanh: existing ? "" : "", soVanBanDen: existing?.soVanBanDen ?? "",
    ngayVanBanDen: "", trichYeu: existing?.trichYeu ?? "", fileName: existing?.fileName ?? "",
    assets: existing ? [...existing.assets] : [], persons: existing ? [...existing.persons] : [], orgs: existing ? [...existing.orgs] : [],
  }))
  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }))

  const external = role === "external"
  const donViReadonly = role !== "stp_specialist" // BR/visibility: chỉ CV STP được chọn/thêm đơn vị

  const hasObject = form.assets.length > 0 || form.persons.length > 0 || form.orgs.length > 0

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith(".pdf")) return showToast("File đính kèm có định dạng không hợp lệ. Chỉ chấp nhận file .PDF", "error")
    if (file.size > 100 * 1024 * 1024) return showToast("Dung lượng file không được vượt quá 100MB", "error")
    set({ fileName: file.name })
  }

  const validateDraft = () => {
    // BR001 — Lưu nháp chỉ bắt buộc Đơn vị gửi yêu cầu.
    if (!form.donViGuiYeuCau.trim()) { setErrors({ donViGuiYeuCau: "Thông tin Đơn vị gửi yêu cầu là bắt buộc" }); setStep(0); return false }
    setErrors({}); return true
  }
  const validateFull = () => {
    const e: Record<string, string> = {}
    if (!form.donViGuiYeuCau.trim()) e.donViGuiYeuCau = "Thông tin Đơn vị gửi yêu cầu là bắt buộc"
    if (!form.soVanBan.trim()) e.soVanBan = "Thông tin Số văn bản là bắt buộc"
    if (!form.trichYeu.trim()) e.trichYeu = "Thông tin Trích yếu là bắt buộc"
    if (form.ngayBanHanh && form.ngayBanHanh > todayISO()) e.ngayBanHanh = "Ngày nhập không được vượt quá ngày hiện tại"
    if (form.ngayVanBanDen && form.ngayVanBanDen > todayISO()) e.ngayVanBanDen = "Ngày nhập không được vượt quá ngày hiện tại"
    setErrors(e)
    if (Object.keys(e).length) { setStep(0); return false }
    // VR001 — ít nhất 1 đối tượng
    if (!hasObject) { showToast("Vui lòng chọn một trong ba loại ngăn chặn (Tài sản, Cá nhân, Tổ chức)", "error"); return false }
    return true
  }

  const doDraft = () => { if (!validateDraft()) return; showToast("Lưu nháp thành công."); back() }
  const doSend = () => { if (!validateFull()) return; showToast("Chuyển Sở tư pháp tiếp nhận thành công."); back() }
  const doPublish = () => { if (!validateFull()) return; showToast("Đăng tải thông tin ngăn chặn thành công."); back() }
  const openReview = () => { if (!validateFull()) return; setReview(true) }
  const back = () => setTimeout(() => navigate("/prevent-info/search"), 400)

  return (
    <div className="pb-24">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => setCancel(true)} className="flex size-9 items-center justify-center rounded-md border border-border bg-surface text-foreground-muted shadow-xs hover:bg-surface-muted">
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h3 className="text-[22px] font-semibold leading-tight tracking-[-0.02em] text-foreground-strong">{mode === "edit" ? "Chỉnh sửa thông tin ngăn chặn" : "Thêm mới thông tin ngăn chặn"}</h3>
            <p className="mt-1 text-[13px] text-foreground-muted">Nhập thông tin văn bản và đối tượng ngăn chặn (Cá nhân, Tổ chức, Tài sản).</p>
          </div>
        </div>
        <RoleSelect role={role} onChange={setRole} />
      </div>

      {/* Step indicator */}
      <div className="mb-4 flex items-center gap-2 overflow-x-auto rounded-[14px] border border-border bg-surface p-3 shadow-sm">
        {STEPS.map((s, i) => (
          <button key={s} onClick={() => setStep(i)} className={cn("flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-[13px] font-medium", i === step ? "bg-neutral-900 text-white" : "text-foreground-muted hover:bg-surface-muted")}>
            <span className={cn("flex size-5 items-center justify-center rounded-full text-[11px] font-semibold", i === step ? "bg-white text-neutral-900" : "bg-neutral-200 text-foreground-muted")}>{i + 1}</span>
            {s}
          </button>
        ))}
      </div>

      {step === 0 && (
        <Section title="Thông tin chung">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
            <FField label="Số văn bản ban hành" required error={errors.soVanBan}><input value={form.soVanBan} maxLength={250} onChange={(e) => set({ soVanBan: e.target.value })} className={inputCls} /></FField>
            <FField label="Ngày ban hành văn bản" error={errors.ngayBanHanh}><input type="date" max={todayISO()} value={form.ngayBanHanh} onChange={(e) => set({ ngayBanHanh: e.target.value })} className={cn(inputCls, "text-[13.5px]")} /></FField>
            <FField label="Số văn bản đến"><input value={form.soVanBanDen} maxLength={250} onChange={(e) => set({ soVanBanDen: e.target.value })} className={inputCls} /></FField>
            <FField label="Ngày văn bản đến" error={errors.ngayVanBanDen}><input type="date" max={todayISO()} value={form.ngayVanBanDen} onChange={(e) => set({ ngayVanBanDen: e.target.value })} className={cn(inputCls, "text-[13.5px]")} /></FField>
          </div>
          <FField label="Trích yếu" required error={errors.trichYeu} className="mt-4">
            <textarea value={form.trichYeu} maxLength={1000} rows={2} onChange={(e) => set({ trichYeu: e.target.value })} placeholder="Nhập trích yếu nội dung văn bản ngăn chặn…" className={cn(inputCls, "h-auto resize-none py-2 leading-relaxed")} />
          </FField>
          <p className="mt-3 text-[12.5px] text-foreground-muted">Các trường có dấu <span className="text-red-600">*</span> là bắt buộc. Để hoàn thành, vui lòng nhập ít nhất một trong ba mục: Tài sản, Cá nhân hoặc Tổ chức.</p>
        </Section>
      )}

      {step === 1 && (
        <ObjectStep title="Thông tin tài sản" addLabel="Thêm tài sản"
          items={form.assets} onAdd={() => set({ assets: [...form.assets, { loaiTaiSan: ASSET_TYPES[0], soGiayChungNhan: "", chuSoHuu: "" }] })}
          onRemove={(i) => set({ assets: form.assets.filter((_, x) => x !== i) })}
          render={(a, i) => (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FField label="Loại tài sản" required><NativeSelect value={a.loaiTaiSan} onChange={(e) => updateAt(form.assets, i, { loaiTaiSan: e.target.value }, (v) => set({ assets: v }))}>{ASSET_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</NativeSelect></FField>
              <FField label="Số giấy chứng nhận" required><input value={a.soGiayChungNhan} onChange={(e) => updateAt(form.assets, i, { soGiayChungNhan: e.target.value }, (v) => set({ assets: v }))} className={inputCls} /></FField>
              <FField label="Chủ sở hữu" required><input value={a.chuSoHuu} onChange={(e) => updateAt(form.assets, i, { chuSoHuu: e.target.value }, (v) => set({ assets: v }))} className={inputCls} /></FField>
              <FField label="Nơi cấp"><input value={a.noiCap ?? ""} onChange={(e) => updateAt(form.assets, i, { noiCap: e.target.value }, (v) => set({ assets: v }))} className={inputCls} /></FField>
              <FField label="Thông tin khác" className="sm:col-span-2 lg:col-span-2"><input value={a.thongTinKhac ?? ""} onChange={(e) => updateAt(form.assets, i, { thongTinKhac: e.target.value }, (v) => set({ assets: v }))} className={inputCls} /></FField>
            </div>
          )}
        />
      )}

      {step === 2 && (
        <ObjectStep title="Thông tin cá nhân" addLabel="Thêm cá nhân"
          items={form.persons} onAdd={() => set({ persons: [...form.persons, { hoTen: "", loaiGiayTo: PERSON_DOC_TYPES[0], soGiayTo: "", gioiTinh: "Nam", quocTich: "Việt Nam" }] })}
          onRemove={(i) => set({ persons: form.persons.filter((_, x) => x !== i) })}
          render={(p, i) => (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FField label="Họ và tên" required><input value={p.hoTen} onChange={(e) => updateAt(form.persons, i, { hoTen: e.target.value }, (v) => set({ persons: v }))} className={inputCls} /></FField>
              <FField label="Loại giấy tờ" required><NativeSelect value={p.loaiGiayTo} onChange={(e) => updateAt(form.persons, i, { loaiGiayTo: e.target.value }, (v) => set({ persons: v }))}>{PERSON_DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</NativeSelect></FField>
              <FField label="Số giấy tờ nhân thân" required><input value={p.soGiayTo} maxLength={12} onChange={(e) => updateAt(form.persons, i, { soGiayTo: e.target.value }, (v) => set({ persons: v }))} className={inputCls} /></FField>
              <FField label="Ngày sinh"><input type="date" max={todayISO()} value={toISO(p.ngaySinh)} onChange={(e) => updateAt(form.persons, i, { ngaySinh: fromISO(e.target.value) }, (v) => set({ persons: v }))} className={cn(inputCls, "text-[13.5px]")} /></FField>
              <FField label="Địa chỉ"><input value={p.diaChi ?? ""} onChange={(e) => updateAt(form.persons, i, { diaChi: e.target.value }, (v) => set({ persons: v }))} className={inputCls} /></FField>
              <FField label="Tỉnh/Thành phố"><NativeSelect value={p.tinhThanh ?? ""} onChange={(e) => updateAt(form.persons, i, { tinhThanh: e.target.value }, (v) => set({ persons: v }))}><option value="">— Chọn —</option>{PROVINCES.map((t) => <option key={t} value={t}>{t}</option>)}</NativeSelect></FField>
              <FField label="Giới tính" required><NativeSelect value={p.gioiTinh ?? "Nam"} onChange={(e) => updateAt(form.persons, i, { gioiTinh: e.target.value }, (v) => set({ persons: v }))}><option>Nam</option><option>Nữ</option></NativeSelect></FField>
              <FField label="Quốc tịch" required><input value={p.quocTich ?? ""} onChange={(e) => updateAt(form.persons, i, { quocTich: e.target.value }, (v) => set({ persons: v }))} className={inputCls} /></FField>
            </div>
          )}
        />
      )}

      {step === 3 && (
        <ObjectStep title="Thông tin tổ chức" addLabel="Thêm tổ chức"
          items={form.orgs} onAdd={() => set({ orgs: [...form.orgs, { tenToChuc: "", loaiGiayTo: ORG_DOC_TYPES[0], soGiayTo: "", nguoiDaiDien: "" }] })}
          onRemove={(i) => set({ orgs: form.orgs.filter((_, x) => x !== i) })}
          render={(o, i) => (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FField label="Tên tổ chức" required><input value={o.tenToChuc} onChange={(e) => updateAt(form.orgs, i, { tenToChuc: e.target.value }, (v) => set({ orgs: v }))} className={inputCls} /></FField>
              <FField label="Loại giấy tờ pháp nhân" required><NativeSelect value={o.loaiGiayTo} onChange={(e) => updateAt(form.orgs, i, { loaiGiayTo: e.target.value }, (v) => set({ orgs: v }))}>{ORG_DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</NativeSelect></FField>
              <FField label="Số giấy tờ pháp nhân" required><input value={o.soGiayTo} onChange={(e) => updateAt(form.orgs, i, { soGiayTo: e.target.value }, (v) => set({ orgs: v }))} className={inputCls} /></FField>
              <FField label="Địa chỉ"><input value={o.diaChi ?? ""} onChange={(e) => updateAt(form.orgs, i, { diaChi: e.target.value }, (v) => set({ orgs: v }))} className={inputCls} /></FField>
              <FField label="Người đại diện" required><input value={o.nguoiDaiDien ?? ""} onChange={(e) => updateAt(form.orgs, i, { nguoiDaiDien: e.target.value }, (v) => set({ orgs: v }))} className={inputCls} /></FField>
              <FField label="Chức vụ"><input value={o.chucVu ?? ""} onChange={(e) => updateAt(form.orgs, i, { chucVu: e.target.value }, (v) => set({ orgs: v }))} className={inputCls} /></FField>
            </div>
          )}
        />
      )}

      {/* Action bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur lg:left-[264px]">
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-6 py-3.5">
          <span className="text-[12.5px] text-foreground-muted">Bước {step + 1}/4 • {STEPS[step]} — Vai trò: {ROLE_LABEL[role]}</span>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button variant="ghost" onClick={() => setCancel(true)}>Hủy</Button>
            <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}><ChevronLeft className="size-4" />Quay lại</Button>
            <Button variant="outline" onClick={doDraft}>Lưu nháp</Button>
            {external ? (
              <Button variant="outline" onClick={doSend}>Chuyển STP</Button>
            ) : (
              <>
                <Button variant="outline" onClick={openReview}>Trình lãnh đạo</Button>
                <Button variant="outline" onClick={doPublish}>Đăng tải</Button>
              </>
            )}
            {step < 3 && <Button onClick={() => setStep((s) => Math.min(3, s + 1))}>Tiếp tục<ChevronRight className="size-4" /></Button>}
          </div>
        </div>
      </div>

      {cancel && (
        <ConfirmDialog title="Xác nhận hủy thao tác" danger confirmLabel="Đồng ý"
          message="Bạn có chắc chắn muốn hủy thao tác? Mọi thông tin đã nhập sẽ không được lưu lại."
          onClose={() => setCancel(false)} onConfirm={() => navigate("/prevent-info/search")} />
      )}
      {review && <SubmitReviewDialog leaderRole={role} onClose={() => setReview(false)} onSubmit={() => { setReview(false); showToast("Trình lãnh đạo thành công."); back() }} />}
    </div>
  )
}

function updateAt<T>(list: T[], i: number, patch: Partial<T>, commit: (v: T[]) => void) {
  commit(list.map((x, idx) => (idx === i ? { ...x, ...patch } : x)))
}
const toISO = (vn?: string) => {
  if (!vn) return ""
  const [dd, mm, yy] = vn.split("/")
  return yy ? `${yy}-${mm}-${dd}` : ""
}
const fromISO = (iso: string) => {
  if (!iso) return undefined
  const [yy, mm, dd] = iso.split("-")
  return `${dd}/${mm}/${yy}`
}

function ObjectStep<T>({ title, addLabel, items, onAdd, onRemove, render }: {
  title: string; addLabel: string; items: T[]; onAdd: () => void; onRemove: (i: number) => void; render: (item: T, i: number) => React.ReactNode
}) {
  return (
    <Section title={title} action={<Button variant="outline" size="sm" onClick={onAdd}><Plus className="size-3.5" />{addLabel}</Button>}>
      {items.length ? (
        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={i} className="rounded-[10px] border border-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[12.5px] font-semibold text-foreground-strong">#{i + 1}</span>
                <button onClick={() => onRemove(i)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium text-red-600 hover:bg-[#fef2f2]"><Trash2 className="size-3.5" />Xóa</button>
              </div>
              {render(item, i)}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[10px] border border-dashed border-border py-8 text-center text-[13px] text-foreground-muted">Chưa có bản ghi. Nhấn “{addLabel}” để thêm.</div>
      )}
    </Section>
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
function FField({ label, required, error, className, children }: { label: string; required?: boolean; error?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-xs font-semibold text-foreground-strong">{label}{required && <span className="ml-1 text-red-600">*</span>}</label>
      {children}
      {error && <span className="text-[12px] text-red-600">{error}</span>}
    </div>
  )
}
