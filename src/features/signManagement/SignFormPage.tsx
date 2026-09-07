import { useState } from "react"
import { ArrowLeft, Download, Save, Send } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { useCurrentRole } from "@/features/notifications/config"
import { SubmitConfirmDialog } from "./dialogs"
import {
  CURRENT_CCV_ID, CURRENT_ORG_USER, CURRENT_TCHNCC_ORG_ID, PROVIDERS, canEditOrSubmit, createSign, getCcv, getOrg, getSign,
  isCcvRole, isTchnccLead, ownerNameOf, updateSignDraft, useCcvs, useOrgs, type ChuKySo,
} from "./config"

const inputCls = "h-9 w-full rounded-md border border-input bg-surface px-3 text-sm shadow-xs outline-none focus-visible:border-border-focus focus-visible:ring-[3px] focus-visible:ring-ring/50"
const lbl = "text-xs font-semibold text-foreground-strong"

export function SignFormPage({ mode }: { mode: "create-org" | "create-notary" | "edit" }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const showToast = useToast()
  const role = useCurrentRole()
  const allCcv = useCcvs()
  useOrgs()

  const editing = mode === "edit" && id ? getSign(id) : undefined
  const canEdit = editing ? canEditOrSubmit(editing, role) : true
  const isOrg = mode === "create-org" || editing?.loaiChuThe === "TCHNCC"

  const subordinateCcvs = allCcv.filter((c) => c.toChucCongChungId === CURRENT_TCHNCC_ORG_ID)
  const [congChungVienId, setCongChungVienId] = useState(editing?.congChungVienId ?? (isCcvRole(role) ? CURRENT_CCV_ID : subordinateCcvs[0]?.id ?? ""))
  const [nhaCungCap, setNhaCungCap] = useState(editing?.nhaCungCap ?? "")
  const [soSerial, setSoSerial] = useState(editing?.soSerial ?? "")
  const [ngayHieuLuc, setNgayHieuLuc] = useState(editing?.ngayHieuLuc ?? "")
  const [ngayHetHan, setNgayHetHan] = useState(editing?.ngayHetHan ?? "")
  const [ghiChu, setGhiChu] = useState(editing?.ghiChu ?? "")
  const [fileDinhKem, setFileDinhKem] = useState(editing?.fileDinhKem ?? "")
  const [error, setError] = useState("")
  const [confirming, setConfirming] = useState<ChuKySo | null>(null)

  const ownerName = isOrg ? (getOrg(CURRENT_TCHNCC_ORG_ID)?.ten ?? "") : (getCcv(congChungVienId)?.hoTen ?? "")

  const doCancel = () => navigate(editing ? `/ccv-tchncc/thong-tin-chu-ky-so/${editing.id}` : "/ccv-tchncc/thong-tin-chu-ky-so")

  const validate = (forSubmit: boolean): string | null => {
    if (mode === "create-notary" && !congChungVienId) return "Vui lòng chọn công chứng viên."
    if (!forSubmit) return null
    if (!nhaCungCap || !soSerial.trim() || !ngayHieuLuc || !ngayHetHan) return "Thông tin đăng ký chưa hợp lệ."
    if (ngayHetHan < ngayHieuLuc) return "Ngày hết hạn không được nhỏ hơn ngày hiệu lực."
    return null
  }

  const doSaveDraft = () => {
    const err = validate(false)
    if (err) return setError(err)
    setError("")
    const actor = CURRENT_ORG_USER[role]
    if (mode === "edit" && editing) {
      const r = updateSignDraft(editing.id, { nhaCungCap, soSerial: soSerial.trim(), ngayHieuLuc, ngayHetHan, ghiChu: ghiChu.trim() || undefined, fileDinhKem: fileDinhKem || undefined }, editing.version, actor)
      if (!r.ok) return setError(r.reason)
      showToast("Cập nhật thông tin chữ ký số thành công.")
      navigate(`/ccv-tchncc/thong-tin-chu-ky-so/${editing.id}`)
    } else {
      const r = createSign({
        loaiChuThe: isOrg ? "TCHNCC" : "CCV",
        toChucCongChungId: isOrg ? CURRENT_TCHNCC_ORG_ID : undefined,
        congChungVienId: isOrg ? undefined : congChungVienId,
        nhaCungCap, soSerial: soSerial.trim(), ngayHieuLuc, ngayHetHan, ghiChu: ghiChu.trim() || undefined, fileDinhKem: fileDinhKem || undefined,
      }, actor)
      if (!r.ok) return setError(r.reason)
      showToast("Lưu nháp thông tin chữ ký số thành công.")
      navigate(`/ccv-tchncc/thong-tin-chu-ky-so/${r.sign.id}`)
    }
  }

  const doSubmit = () => {
    const err = validate(true)
    if (err) return setError(err)
    setError("")
    const actor = CURRENT_ORG_USER[role]
    if (mode === "edit" && editing) {
      const r = updateSignDraft(editing.id, { nhaCungCap, soSerial: soSerial.trim(), ngayHieuLuc, ngayHetHan, ghiChu: ghiChu.trim() || undefined, fileDinhKem: fileDinhKem || undefined }, editing.version, actor)
      if (!r.ok) return setError(r.reason)
      setConfirming(r.sign)
    } else {
      const r = createSign({
        loaiChuThe: isOrg ? "TCHNCC" : "CCV",
        toChucCongChungId: isOrg ? CURRENT_TCHNCC_ORG_ID : undefined,
        congChungVienId: isOrg ? undefined : congChungVienId,
        nhaCungCap, soSerial: soSerial.trim(), ngayHieuLuc, ngayHetHan, ghiChu: ghiChu.trim() || undefined, fileDinhKem: fileDinhKem || undefined,
      }, actor)
      if (!r.ok) return setError(r.reason)
      setConfirming(r.sign)
    }
  }

  const doPickFile = () => setFileDinhKem(`mau-dang-ky-cks-${Date.now()}.pdf`)

  if (mode === "edit" && !editing) {
    return (
      <div className="rounded-[14px] border border-border bg-surface p-10 text-center shadow-sm">
        <div className="text-[15px] font-semibold text-foreground-strong">Không tìm thấy bản ghi hoặc bạn không có quyền chỉnh sửa.</div>
        <Button className="mt-4" variant="outline" onClick={() => navigate("/ccv-tchncc/thong-tin-chu-ky-so")}><ArrowLeft className="size-4" />Quay lại</Button>
      </div>
    )
  }
  if (mode === "edit" && editing && !canEdit) {
    return (
      <div className="rounded-[14px] border border-border bg-surface p-10 text-center shadow-sm">
        <div className="text-[15px] font-semibold text-foreground-strong">Không thể cập nhật bản ghi ở trạng thái hiện tại.</div>
        <Button className="mt-4" variant="outline" onClick={() => navigate(`/ccv-tchncc/thong-tin-chu-ky-so/${editing.id}`)}><ArrowLeft className="size-4" />Quay lại</Button>
      </div>
    )
  }
  if (mode === "create-org" && !isTchnccLead(role)) {
    return (
      <div className="rounded-[14px] border border-border bg-surface p-10 text-center shadow-sm">
        <div className="text-[15px] font-semibold text-foreground-strong">Bạn không có quyền truy cập chức năng này.</div>
        <Button className="mt-4" variant="outline" onClick={() => navigate("/ccv-tchncc/thong-tin-chu-ky-so")}><ArrowLeft className="size-4" />Quay lại</Button>
      </div>
    )
  }
  if (mode === "create-notary" && !isTchnccLead(role) && !isCcvRole(role)) {
    return (
      <div className="rounded-[14px] border border-border bg-surface p-10 text-center shadow-sm">
        <div className="text-[15px] font-semibold text-foreground-strong">Bạn không có quyền truy cập chức năng này.</div>
        <Button className="mt-4" variant="outline" onClick={() => navigate("/ccv-tchncc/thong-tin-chu-ky-so")}><ArrowLeft className="size-4" />Quay lại</Button>
      </div>
    )
  }

  const title = mode === "edit" ? `Cập nhật thông tin chữ ký số — ${ownerNameOf(editing!)}` : isOrg ? "Đăng ký chữ ký số của TCHNCC" : "Đăng ký chữ ký số của CCV"

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <button onClick={doCancel} className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-foreground-muted shadow-xs hover:bg-surface-muted"><ArrowLeft className="size-4" /></button>
        <div>
          <h3 className="text-[24px] font-semibold leading-tight tracking-[-0.02em] text-foreground-strong">{title}</h3>
          <p className="mt-1.5 text-sm text-foreground-muted">Có thể lưu nháp để hoàn thiện sau, hoặc trình duyệt ngay khi đã đủ thông tin.</p>
        </div>
      </div>

      <div className="rounded-[14px] border border-border bg-surface p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {isOrg ? (
            <div className="flex flex-col gap-1.5 sm:col-span-2"><label className={lbl}>Tên TCHNCC</label><input disabled value={ownerName} className={cn(inputCls, "bg-neutral-50 text-foreground-muted")} /></div>
          ) : mode === "create-notary" && isTchnccLead(role) ? (
            <div className="flex flex-col gap-1.5 sm:col-span-2"><label className={lbl}>Công chứng viên <span className="text-red-600">*</span></label>
              <NativeSelect value={congChungVienId} onChange={(e) => setCongChungVienId(e.target.value)}>
                <option value="">— Chọn —</option>{subordinateCcvs.map((c) => <option key={c.id} value={c.id}>{c.hoTen}</option>)}
              </NativeSelect>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 sm:col-span-2"><label className={lbl}>Tên CCV</label><input disabled value={ownerName} className={cn(inputCls, "bg-neutral-50 text-foreground-muted")} /></div>
          )}
          <div className="flex flex-col gap-1.5"><label className={lbl}>Nhà cung cấp <span className="text-red-600">*</span></label>
            <NativeSelect value={nhaCungCap} onChange={(e) => setNhaCungCap(e.target.value)}><option value="">— Chọn —</option>{PROVIDERS.map((p) => <option key={p} value={p}>{p}</option>)}</NativeSelect>
          </div>
          <div className="flex flex-col gap-1.5"><label className={lbl}>Số Serial <span className="text-red-600">*</span></label><input value={soSerial} onChange={(e) => setSoSerial(e.target.value)} maxLength={100} className={inputCls} /></div>
          <div className="flex flex-col gap-1.5"><label className={lbl}>Ngày hiệu lực <span className="text-red-600">*</span></label><input type="date" value={ngayHieuLuc} onChange={(e) => setNgayHieuLuc(e.target.value)} className={inputCls} /></div>
          <div className="flex flex-col gap-1.5"><label className={lbl}>Ngày hết hạn <span className="text-red-600">*</span></label><input type="date" value={ngayHetHan} onChange={(e) => setNgayHetHan(e.target.value)} className={inputCls} /></div>
          <div className="flex flex-col gap-1.5 sm:col-span-2"><label className={lbl}>Ghi chú</label><textarea value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} maxLength={1000} rows={2} className={inputCls + " h-auto py-2"} /></div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className={lbl}>File đính kèm</label>
            <div className="flex items-center gap-2.5">
              <Button variant="outline" size="sm" onClick={doPickFile}>Tải lên</Button>
              {fileDinhKem && <span className="text-[12.5px] text-foreground-muted">{fileDinhKem}</span>}
              <button type="button" className="ml-auto flex items-center gap-1 text-[12.5px] text-link hover:underline" onClick={() => showToast("Đang tải mẫu đăng ký...")}><Download className="size-3.5" />Tải mẫu đăng ký</button>
            </div>
          </div>
        </div>

        {error && <div className="mt-4 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]">{error}</div>}

        <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" onClick={doCancel}>Hủy</Button>
          <Button variant="outline" onClick={doSaveDraft}><Save className="size-4" />Lưu nháp</Button>
          <Button onClick={doSubmit}><Send className="size-4" />Trình duyệt</Button>
        </div>
      </div>

      {confirming && (
        <SubmitConfirmDialog
          sign={confirming}
          actor={CURRENT_ORG_USER[role]}
          onClose={() => setConfirming(null)}
          onDone={() => { setConfirming(null); navigate(`/ccv-tchncc/thong-tin-chu-ky-so/${confirming.id}`) }}
        />
      )}
    </div>
  )
}
