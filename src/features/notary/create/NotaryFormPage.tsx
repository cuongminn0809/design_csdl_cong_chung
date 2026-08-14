import { useMemo, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AlertTriangle, ArrowLeft, ChevronLeft, ChevronRight, FileText, Pencil, Plus, Trash2, Upload, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { useToast } from "@/features/reconciliation/components/Toast"
import { Th, inputCls } from "../../ingestion/shared"
import { ConfirmDialog } from "../../prevent/shared"
import { TRANSACTIONS, type Asset, type Method, type Party } from "../config"
import {
  LOAI_GD, LOAI_GD_OPTIONS, PHUONG_THUC, TEN_TO_LOAI, benOptionsFor, docSoThanhChu, isTheChap, isUyQuyen, toISODate,
} from "./config"
import { AssetDialog, PersonOrgDialog } from "./dialogs"
import { ConfirmActionDialog } from "../approval/dialogs"

const todayISO = () => new Date().toISOString().slice(0, 10)
const STEPS = ["Thông tin chung", "Thông tin khác", "Bên liên quan", "Danh sách tài sản", "Tệp đính kèm"]

interface BenLienQuan { vaiTro: string; parties: Party[] }

function groupParties(parties: Party[]): BenLienQuan[] {
  const map = new Map<string, Party[]>()
  parties.forEach((p) => { const k = p.vaiTro || ""; if (!map.has(k)) map.set(k, []); map.get(k)!.push(p) })
  const list = [...map.entries()].map(([vaiTro, ps]) => ({ vaiTro, parties: ps }))
  return list.length ? list : [{ vaiTro: "", parties: [] }]
}

export function NotaryFormPage({ method, mode }: { method: Method; mode: "create" | "edit" | "revise" }) {
  const navigate = useNavigate()
  const showToast = useToast()
  const { id } = useParams()
  const src = useMemo(() => (mode !== "create" ? TRANSACTIONS.find((t) => t.id === id && t.method === method) : undefined), [mode, id, method])
  const isRevise = mode === "revise"

  const label = method === "paper" ? "giấy" : "điện tử"
  const listPath = method === "paper" ? "/notary-transaction/paper/list" : "/notary-transaction/electronic/list"
  const detailPath = `${method === "paper" ? "/notary-transaction/paper" : "/notary-transaction/electronic"}/detail/${id ?? ""}`

  const [step, setStep] = useState(0)
  const [cancel, setCancel] = useState(false)
  const [submitConfirm, setSubmitConfirm] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Step 1
  const [ngayCC, setNgayCC] = useState(src ? toISODate(src.ngayCC) : todayISO())
  const [soCC, setSoCC] = useState(src?.soCC ?? "")
  const [phuongThuc, setPhuongThuc] = useState(method === "paper" ? PHUONG_THUC[0] : PHUONG_THUC[1])
  const [loaiGD, setLoaiGD] = useState(src ? TEN_TO_LOAI[src.tenGD] ?? "" : "")
  const [tenGD, setTenGD] = useState(src?.tenGD ?? "")
  const [giaTri, setGiaTri] = useState(src && src.giaTri > 0 ? String(src.giaTri) : "")
  const [diaDiem, setDiaDiem] = useState(src?.diaDiem ?? "Văn phòng công chứng Rạch Giá")
  const [maThamChieu, setMaThamChieu] = useState(src?.maThamChieu ?? "")
  const toChuc = src?.toChuc ?? "Sở TP An Giang - Văn phòng công chứng Rạch Giá"
  const [ccv, setCcv] = useState(src?.ccv ?? "Dương Minh Diển")
  const [noiDung, setNoiDung] = useState(src?.noiDung ?? "")
  const [thoiHanUyQuyen, setThoiHanUyQuyen] = useState("")

  // Step 2
  const [phi, setPhi] = useState(src && src.phi > 0 ? String(src.phi) : "")
  const [thuLao, setThuLao] = useState(src && src.thuLao > 0 ? String(src.thuLao) : "")
  const [ghiChu, setGhiChu] = useState(src?.ghiChu ?? "")
  const [giaiChap, setGiaiChap] = useState(src?.giaiChap === "da" ? "Đã giải chấp" : "Chưa giải chấp")
  const [thoiHanGiaiChap, setThoiHanGiaiChap] = useState(src?.thoiHanGiaiChap && src.thoiHanGiaiChap !== "--" ? src.thoiHanGiaiChap : "")
  const [ngayGiaiChap, setNgayGiaiChap] = useState(src?.ngayGiaiChap && src.ngayGiaiChap !== "--" ? toISODate(src.ngayGiaiChap) : "")
  const [ghiChuGiaiChap, setGhiChuGiaiChap] = useState(src?.ghiChuGiaiChap && src.ghiChuGiaiChap !== "--" ? src.ghiChuGiaiChap : "")

  // Step 3
  const [benList, setBenList] = useState<BenLienQuan[]>(src ? groupParties(src.parties) : [{ vaiTro: "", parties: [] }])
  const [partyDialog, setPartyDialog] = useState<{ benIdx: number; partyIdx?: number } | null>(null)

  // Step 4
  const [assets, setAssets] = useState<Asset[]>(src ? [...src.assets] : [])
  const [assetDialog, setAssetDialog] = useState<{ idx?: number } | null>(null)

  // Step 5
  const vbFileRef = useRef<HTMLInputElement>(null)
  const [vbFile, setVbFile] = useState(src?.scanFile || src?.signedFile || "")
  const [hoSoKhac, setHoSoKhac] = useState<string[]>(src ? [...(src.hoSoLuuTru ?? src.thanhPhan?.map((d) => d.name) ?? [])] : [])

  const giaTriNum = Number(giaTri.replace(/[^\d]/g, "")) || 0
  const giaTriChu = useMemo(() => docSoThanhChu(giaTriNum), [giaTriNum])
  const tenGDOptions = loaiGD ? LOAI_GD[loaiGD] : []
  const theChap = isTheChap(tenGD)
  const uyQuyen = isUyQuyen(tenGD)
  const dienTu = phuongThuc !== "Công chứng giấy"

  if (mode !== "create" && !src) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <FileText className="size-10 text-foreground-subtle" />
        <div className="text-[15px] font-semibold text-foreground-strong">Không tìm thấy giao dịch cần chỉnh sửa</div>
        <Button variant="outline" onClick={() => navigate(listPath)}>Quay lại danh sách</Button>
      </div>
    )
  }
  // BR-08: form này chỉ phục vụ bản ghi đang ở trạng thái "Yêu cầu sửa".
  if (isRevise && src && src.trangThaiHoSo !== "revise") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <AlertTriangle className="size-10 text-amber-500" />
        <div className="text-[15px] font-semibold text-foreground-strong">Không thể chỉnh sửa theo yêu cầu sửa</div>
        <p className="max-w-md text-[13px] text-foreground-muted">Màn hình này chỉ áp dụng cho giao dịch đang ở trạng thái <span className="font-semibold">Yêu cầu sửa</span>. Bản ghi hiện tại không ở trạng thái này (BR-08).</p>
        <Button variant="outline" onClick={() => navigate(detailPath)}>Về trang chi tiết</Button>
      </div>
    )
  }

  const validateStep = (s: number, full = false): boolean => {
    const e: Record<string, string> = {}
    if (s === 0 || full) {
      if (!ngayCC) e.ngayCC = "Thông tin Ngày công chứng là bắt buộc"
      else if (ngayCC > todayISO()) e.ngayCC = "Ngày công chứng không được vượt quá ngày hiện tại"
      if (!soCC.trim()) e.soCC = "Thông tin Số công chứng là bắt buộc"
      if (!loaiGD) e.loaiGD = "Thông tin Loại giao dịch là bắt buộc"
      if (!tenGD) e.tenGD = "Thông tin Tên giao dịch là bắt buộc"
      if (!diaDiem.trim()) e.diaDiem = "Thông tin Địa điểm công chứng là bắt buộc"
      if (!ccv.trim()) e.ccv = "Thông tin Công chứng viên là bắt buộc"
      if (uyQuyen && !thoiHanUyQuyen.trim()) e.thoiHanUyQuyen = "Thông tin Thời hạn ủy quyền là bắt buộc"
    }
    if (s === 1 || full) {
      if (theChap && giaiChap === "Đã giải chấp" && !ngayGiaiChap) e.ngayGiaiChap = "Vui lòng nhập đầy đủ thông tin giải chấp chi tiết"
    }
    if (full) {
      const totalParties = benList.reduce((n, b) => n + b.parties.length, 0)
      if (benList.some((b) => !b.vaiTro) || totalParties === 0) e.ben = "Vui lòng khai báo đầy đủ bên liên quan và người tham gia"
      if (dienTu && !vbFile) e.file = "Chưa có file văn bản công chứng điện tử, vui lòng kiểm tra lại"
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => { if (validateStep(step)) { setErrors({}); setStep((s) => Math.min(4, s + 1)) } }
  const goto = (i: number) => { if (i <= step || validateStep(step)) setStep(i) }
  const afterSave = () => setTimeout(() => navigate(mode !== "create" ? detailPath : listPath), 400)

  // "Lưu lại"/"Lưu nháp": chỉ kiểm định dạng, giữ nguyên trạng thái. Với revise (BR-07/BR-09) giữ "Yêu cầu sửa" + giữ ghiChuPhanHoi.
  const doDraft = () => {
    const msg = isRevise
      ? "Đã lưu lại cập nhật giao dịch công chứng theo yêu cầu sửa đổi."
      : mode === "edit" ? "Đã lưu cập nhật giao dịch công chứng." : "Đã lưu nháp giao dịch công chứng."
    showToast(msg); afterSave()
  }
  // Bấm "Trình duyệt"/"Trình duyệt lại": validate toàn bộ → mở hộp thoại xác nhận.
  const doSubmit = () => {
    if (!validateStep(0, true)) { setStep(0); return }
    const eBen = benList.some((b) => !b.vaiTro) || benList.reduce((n, b) => n + b.parties.length, 0) === 0
    if (eBen) { setStep(2); return }
    if (dienTu && !vbFile) { setStep(4); return }
    setSubmitConfirm(true)
  }
  const confirmSubmit = () => {
    setSubmitConfirm(false)
    if (isRevise && src) {
      // BR-09: chuyển "Chờ duyệt" và reset ý kiến phản hồi để chuẩn bị lượt duyệt mới.
      src.trangThaiHoSo = "pending"
      src.ghiChuPhanHoi = ""
      showToast("Trình duyệt lại giao dịch công chứng thành công.")
    } else {
      showToast("Trình duyệt giao dịch công chứng thành công.")
    }
    afterSave()
  }

  const onVbFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    if (!f.name.toLowerCase().endsWith(".pdf")) return showToast("Định dạng file đính kèm không hợp lệ", "error")
    if (f.size > 50 * 1024 * 1024) return showToast("Dung lượng file không được vượt quá 50MB", "error")
    setVbFile(f.name); if (errors.file) setErrors((p) => ({ ...p, file: "" }))
  }

  return (
    <div className="pb-24">
      <div className="mb-5 flex items-center gap-3">
        <button onClick={() => setCancel(true)} className="flex size-9 items-center justify-center rounded-md border border-border bg-surface text-foreground-muted shadow-xs hover:bg-surface-muted"><ArrowLeft className="size-4" /></button>
        <div>
          <h3 className="text-[22px] font-semibold leading-tight tracking-[-0.02em] text-foreground-strong">
            {isRevise ? `Cập nhật giao dịch bị yêu cầu chỉnh sửa ${label}` : `${mode === "edit" ? "Chỉnh sửa" : "Thêm mới"} giao dịch công chứng ${label}`}
          </h3>
          <p className="mt-1 text-[13px] text-foreground-muted">
            {isRevise
              ? "Cập nhật thông tin theo ý kiến phản hồi của Trưởng TCHNCC rồi trình duyệt lại."
              : mode === "edit" ? "Cập nhật thông tin giao dịch công chứng đang ở trạng thái Lưu nháp." : "Khai báo giao dịch công chứng mới bằng phương thức thủ công (nhập liệu trực tiếp)."}
          </p>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 overflow-x-auto rounded-[14px] border border-border bg-surface p-3 shadow-sm">
        {STEPS.map((s, i) => (
          <button key={s} onClick={() => goto(i)} className={cn("flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-[13px] font-medium", i === step ? "bg-neutral-900 text-white" : i < step ? "text-foreground hover:bg-surface-muted" : "text-foreground-muted hover:bg-surface-muted")}>
            <span className={cn("flex size-5 items-center justify-center rounded-full text-[11px] font-semibold", i === step ? "bg-white text-neutral-900" : "bg-neutral-200 text-foreground-muted")}>{i + 1}</span>
            {s}
          </button>
        ))}
      </div>

      {isRevise && step === 0 && (
        <div className="mb-4 flex gap-3 rounded-[12px] border border-[#fcd34d] bg-[#fffbeb] px-4 py-3.5 shadow-sm">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[#d97706]" />
          <div>
            <div className="text-[12.5px] font-semibold text-[#b45309]">Ý kiến phản hồi từ Trưởng TCHNCC — Yêu cầu chỉnh sửa</div>
            <p className="mt-1 text-[13px] leading-relaxed text-[#92400e]">{src?.ghiChuPhanHoi?.trim() || "Không có nội dung phản hồi chi tiết từ Trưởng TCHNCC."}</p>
          </div>
        </div>
      )}

      {step === 0 && (
        <Section title="Thông tin chung">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <FF label="Ngày công chứng" required error={errors.ngayCC}><input type="date" max={todayISO()} value={ngayCC} onChange={(e) => setNgayCC(e.target.value)} className={cn(inputCls, "text-[13.5px]")} /></FF>
            <FF label="Số công chứng" required error={errors.soCC}><input value={soCC} maxLength={50} onChange={(e) => setSoCC(e.target.value)} placeholder="Nhập số công chứng" className={inputCls} /></FF>
            <FF label="Phương thức công chứng" required><NativeSelect value={phuongThuc} onChange={(e) => setPhuongThuc(e.target.value)}>{PHUONG_THUC.map((p) => <option key={p}>{p}</option>)}</NativeSelect></FF>
            <FF label="Loại giao dịch" required error={errors.loaiGD}>
              <NativeSelect value={loaiGD} onChange={(e) => { setLoaiGD(e.target.value); setTenGD("") }}>
                <option value="">— Chọn loại giao dịch —</option>
                {LOAI_GD_OPTIONS.map((l) => <option key={l}>{l}</option>)}
              </NativeSelect>
            </FF>
            <FF label="Tên giao dịch" required error={errors.tenGD}>
              <NativeSelect value={tenGD} onChange={(e) => setTenGD(e.target.value)} disabled={!loaiGD}>
                <option value="">{loaiGD ? "— Chọn tên giao dịch —" : "Chọn loại giao dịch trước"}</option>
                {tenGDOptions.map((t) => <option key={t}>{t}</option>)}
              </NativeSelect>
            </FF>
            {uyQuyen && <FF label="Thời hạn ủy quyền" required error={errors.thoiHanUyQuyen}><input value={thoiHanUyQuyen} onChange={(e) => setThoiHanUyQuyen(e.target.value)} placeholder="VD: 12 tháng" className={inputCls} /></FF>}
            <FF label="Giá trị giao dịch (VND)"><input inputMode="numeric" value={giaTri} onChange={(e) => setGiaTri(e.target.value.replace(/[^\d]/g, ""))} placeholder="Nhập giá trị" className={inputCls} /></FF>
            <FF label="Bằng chữ"><input value={giaTriChu} readOnly className={cn(inputCls, "cursor-default bg-neutral-100 text-foreground-muted")} placeholder="Tự động hiển thị khi nhập giá trị" /></FF>
            <FF label="Địa điểm công chứng" required error={errors.diaDiem}><input value={diaDiem} onChange={(e) => setDiaDiem(e.target.value)} className={inputCls} /></FF>
            <FF label="Mã tham chiếu"><input value={maThamChieu} onChange={(e) => setMaThamChieu(e.target.value)} placeholder="Nhập mã tham chiếu" className={inputCls} /></FF>
            <FF label="Tổ chức công chứng" required><input value={toChuc} readOnly disabled className={cn(inputCls, "cursor-not-allowed bg-neutral-100 text-foreground-muted")} /></FF>
            <FF label="Công chứng viên" required error={errors.ccv}><input value={ccv} onChange={(e) => setCcv(e.target.value)} className={inputCls} /></FF>
          </div>
          <FF label="Nội dung giao dịch" className="mt-4"><textarea value={noiDung} maxLength={2000} rows={2} onChange={(e) => setNoiDung(e.target.value)} className={cn(inputCls, "h-auto resize-none py-2 leading-relaxed")} /></FF>
        </Section>
      )}

      {step === 1 && (
        <Section title="Thông tin khác">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <FF label="Phí công chứng"><input inputMode="numeric" value={phi} onChange={(e) => setPhi(e.target.value.replace(/[^\d]/g, ""))} placeholder="0" className={inputCls} /></FF>
            <FF label="Thù lao công chứng"><input inputMode="numeric" value={thuLao} onChange={(e) => setThuLao(e.target.value.replace(/[^\d]/g, ""))} placeholder="0" className={inputCls} /></FF>
            <FF label="Ghi chú"><input value={ghiChu} maxLength={1000} onChange={(e) => setGhiChu(e.target.value)} className={inputCls} /></FF>
          </div>
          {theChap && (
            <>
              <div className="mb-2.5 mt-4 border-t border-neutral-100 pt-4 text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">Thông tin giao dịch thế chấp</div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <FF label="Trạng thái giải chấp" required><NativeSelect value={giaiChap} onChange={(e) => setGiaiChap(e.target.value)}><option>Chưa giải chấp</option><option>Đã giải chấp</option></NativeSelect></FF>
                <FF label="Thời hạn giải chấp"><input value={thoiHanGiaiChap} maxLength={50} onChange={(e) => setThoiHanGiaiChap(e.target.value)} className={inputCls} /></FF>
                {giaiChap === "Đã giải chấp" && <FF label="Ngày giải chấp" required error={errors.ngayGiaiChap}><input type="date" max={todayISO()} value={ngayGiaiChap} onChange={(e) => setNgayGiaiChap(e.target.value)} className={cn(inputCls, "text-[13.5px]")} /></FF>}
                <FF label="Ghi chú giải chấp"><input value={ghiChuGiaiChap} maxLength={500} onChange={(e) => setGhiChuGiaiChap(e.target.value)} className={inputCls} /></FF>
              </div>
            </>
          )}
          {!theChap && <p className="text-[13px] text-foreground-muted">Không có thông tin bổ sung. Nhấn “Tiếp tục” để sang bước tiếp theo.</p>}
        </Section>
      )}

      {step === 2 && (
        <Section title="Thông tin bên liên quan" action={<Button variant="outline" size="sm" onClick={() => setBenList([...benList, { vaiTro: "", parties: [] }])}><Plus className="size-3.5" />Thêm bên liên quan</Button>}>
          {errors.ben && <div className="mb-3 rounded-md border border-[#fde68a] bg-[#fffbeb] px-3 py-2 text-[12.5px] text-[#b45309]">{errors.ben}</div>}
          <div className="space-y-4">
            {benList.map((ben, bi) => {
              const usedRoles = benList.filter((_, x) => x !== bi).map((b) => b.vaiTro)
              const base = benOptionsFor(tenGD)
              const withCurrent = ben.vaiTro && !base.includes(ben.vaiTro) ? [ben.vaiTro, ...base] : base
              const options = withCurrent.filter((o) => o === ben.vaiTro || !usedRoles.includes(o))
              return (
                <div key={bi} className="rounded-[10px] border border-border p-4">
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <span className="text-[12.5px] font-semibold text-foreground-strong">Bên liên quan {bi + 1}</span>
                    <NativeSelect value={ben.vaiTro} onChange={(e) => setBenList(benList.map((b, x) => x === bi ? { ...b, vaiTro: e.target.value } : b))} className="h-9 w-[260px]">
                      <option value="">— Chọn loại bên liên quan —</option>
                      {options.map((o) => <option key={o}>{o}</option>)}
                    </NativeSelect>
                    {benList.length > 1 && <button onClick={() => setBenList(benList.filter((_, x) => x !== bi))} className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium text-red-600 hover:bg-[#fef2f2]"><Trash2 className="size-3.5" />Xóa bên liên quan</button>}
                  </div>
                  <div className="overflow-hidden rounded-[8px] border border-border">
                    <table className="w-full border-collapse text-[13px]">
                      <thead>
                        <tr className="border-b border-border bg-neutral-50">
                          <Th className="w-11 px-3 py-2 text-center">STT</Th>
                          <Th className="px-3 py-2">Họ tên / Tên tổ chức</Th>
                          <Th className="px-3 py-2">Giấy tờ tùy thân / pháp nhân</Th>
                          <Th className="px-3 py-2">Địa chỉ</Th>
                          <Th className="w-24 px-3 py-2 text-center">Hành động</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {ben.parties.length ? ben.parties.map((p, pi) => (
                          <tr key={pi} className="border-b border-neutral-100">
                            <td className="px-3 py-2 text-center text-foreground-muted">{pi + 1}</td>
                            <td className="px-3 py-2 font-medium text-foreground">{p.name}{p.isOrg && <span className="ml-1.5 rounded-full border border-border bg-surface-muted px-1.5 py-px text-[10px] font-semibold text-foreground-muted">Tổ chức</span>}</td>
                            <td className="px-3 py-2 font-mono text-[12px] text-foreground-muted">{p.giayTo}</td>
                            <td className="px-3 py-2 text-foreground-muted">{p.diaChi}</td>
                            <td className="px-3 py-2">
                              <div className="flex items-center justify-center gap-1">
                                <button onClick={() => setPartyDialog({ benIdx: bi, partyIdx: pi })} className="rounded p-1 text-foreground-muted hover:text-foreground-strong"><Pencil className="size-3.5" /></button>
                                <button onClick={() => setBenList(benList.map((b, x) => x === bi ? { ...b, parties: b.parties.filter((_, y) => y !== pi) } : b))} className="rounded p-1 text-foreground-muted hover:text-red-600"><Trash2 className="size-3.5" /></button>
                              </div>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan={5} className="px-3 py-4 text-center text-[12.5px] text-foreground-muted">Chưa có người tham gia.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <button onClick={() => setPartyDialog({ benIdx: bi })} className="mt-2.5 inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-[12.5px] font-medium text-foreground-strong shadow-xs hover:bg-surface-muted"><Plus className="size-3.5" />Thêm người tham gia</button>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {step === 3 && (
        <Section title="Danh sách tài sản" action={<Button variant="outline" size="sm" onClick={() => setAssetDialog({})}><Plus className="size-3.5" />Thêm tài sản giao dịch</Button>}>
          {assets.length ? (
            <div className="overflow-x-auto rounded-[10px] border border-border">
              <table className="w-full min-w-[720px] border-collapse text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-neutral-50">
                    <Th className="w-11 px-3.5 py-2.5 text-center">STT</Th>
                    <Th className="px-3.5 py-2.5">Loại tài sản</Th>
                    <Th className="px-3.5 py-2.5">Giấy chứng nhận</Th>
                    <Th className="px-3.5 py-2.5">Chủ sở hữu</Th>
                    <Th className="px-3.5 py-2.5">Địa chỉ / Đặc điểm</Th>
                    <Th className="w-24 px-3.5 py-2.5 text-center">Hành động</Th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((a, i) => (
                    <tr key={i} className="border-b border-neutral-100">
                      <td className="px-3.5 py-2.5 text-center text-foreground-muted">{i + 1}</td>
                      <td className="px-3.5 py-2.5 font-medium text-foreground">{a.loai}</td>
                      <td className="px-3.5 py-2.5 font-mono text-[12px] text-foreground-muted">{a.gcn}</td>
                      <td className="px-3.5 py-2.5 text-foreground">{a.chuSoHuu}</td>
                      <td className="px-3.5 py-2.5 text-foreground-muted">{a.dacDiem}</td>
                      <td className="px-3.5 py-2.5">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => setAssetDialog({ idx: i })} className="rounded p-1 text-foreground-muted hover:text-foreground-strong"><Pencil className="size-3.5" /></button>
                          <button onClick={() => setAssets(assets.filter((_, x) => x !== i))} className="rounded p-1 text-foreground-muted hover:text-red-600"><Trash2 className="size-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-[10px] border border-dashed border-border py-8 text-center text-[13px] text-foreground-muted">Chưa có tài sản. Có thể bỏ qua nếu giao dịch không gắn tài sản.</div>
          )}
        </Section>
      )}

      {step === 4 && (
        <Section title="Tệp đính kèm">
          <input ref={vbFileRef} type="file" accept="application/pdf" className="hidden" onChange={onVbFile} />
          <div className="space-y-4">
            <div>
              <div className="mb-2 text-[12.5px] font-semibold text-foreground-strong">
                {dienTu ? "Văn bản công chứng điện tử" : "Văn bản công chứng điện tử chuyển đổi từ văn bản giấy"}
                {dienTu && <span className="ml-1 text-red-600">*</span>}
                <span className="ml-1 font-normal text-foreground-subtle">(PDF, tối đa 50MB)</span>
              </div>
              {vbFile ? (
                <div className="flex items-center gap-2.5 rounded-md border border-border bg-neutral-50 px-3 py-2 lg:w-[520px]">
                  <FileText className="size-4 shrink-0 text-red-600" /><span className="flex-1 truncate font-mono text-[12.5px]">{vbFile}</span>
                  <button onClick={() => setVbFile("")} className="rounded p-1 text-foreground-muted hover:text-red-600"><X className="size-4" /></button>
                </div>
              ) : (
                <button onClick={() => vbFileRef.current?.click()} className="flex items-center justify-center gap-2 rounded-md border border-dashed border-border px-4 py-2.5 text-[13px] text-foreground-muted hover:bg-surface-muted lg:w-[520px]"><Upload className="size-4" />Tải lên tệp .pdf</button>
              )}
              {errors.file && <div className="mt-1.5 text-[12px] text-red-600">{errors.file}</div>}
            </div>
            {!dienTu && (
              <div>
                <div className="mb-2 text-[12.5px] font-semibold text-foreground-strong">Hồ sơ lưu trữ điện tử <span className="font-normal text-foreground-subtle">(PDF, tối đa 50MB)</span></div>
                <button onClick={() => showToast("Chọn tệp hồ sơ lưu trữ (.pdf)")} className="flex items-center justify-center gap-2 rounded-md border border-dashed border-border px-4 py-2.5 text-[13px] text-foreground-muted hover:bg-surface-muted lg:w-[520px]"><Upload className="size-4" />Tải lên tệp .pdf</button>
              </div>
            )}
            <div>
              <div className="mb-2 text-[12.5px] font-semibold text-foreground-strong">Thành phần hồ sơ khác {dienTu && <span className="text-red-600">*</span>}<span className="ml-1 font-normal text-foreground-subtle">(PDF, Word, Excel, Ảnh — tối đa 50MB/file)</span></div>
              {hoSoKhac.map((f, i) => (
                <div key={i} className="mb-2 flex items-center gap-2.5 rounded-md border border-border bg-neutral-50 px-3 py-2 lg:w-[520px]">
                  <FileText className="size-4 shrink-0 text-red-600" /><span className="flex-1 truncate font-mono text-[12.5px]">{f}</span>
                  <button onClick={() => setHoSoKhac(hoSoKhac.filter((_, x) => x !== i))} className="rounded p-1 text-foreground-muted hover:text-red-600"><X className="size-4" /></button>
                </div>
              ))}
              <button onClick={() => setHoSoKhac([...hoSoKhac, `HoSoKhac_${hoSoKhac.length + 1}.pdf`])} className="flex items-center justify-center gap-2 rounded-md border border-dashed border-border px-4 py-2.5 text-[13px] text-foreground-muted hover:bg-surface-muted lg:w-[520px]"><Upload className="size-4" />Tải lên tệp đính kèm (nhiều tệp)</button>
            </div>
          </div>
        </Section>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur lg:left-[264px]">
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-6 py-3.5">
          <span className="text-[12.5px] text-foreground-muted">Bước {step + 1}/5 • {STEPS[step]}</span>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button variant="ghost" onClick={() => setCancel(true)}>Hủy</Button>
            <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}><ChevronLeft className="size-4" />Quay lại</Button>
            <Button variant="outline" onClick={doDraft}>{isRevise ? "Lưu lại" : "Lưu nháp"}</Button>
            {step < 4 ? (
              <Button onClick={next}>Tiếp tục<ChevronRight className="size-4" /></Button>
            ) : (
              <Button onClick={doSubmit}>{isRevise ? "Trình duyệt lại" : "Trình duyệt"}</Button>
            )}
          </div>
        </div>
      </div>

      {cancel && <ConfirmDialog title="Xác nhận hủy thao tác" danger confirmLabel="Đồng ý" message={mode === "create" ? "Bạn có chắc chắn muốn hủy thao tác thêm mới? Mọi thông tin đã nhập sẽ không được lưu lại." : "Bạn có chắc chắn muốn hủy thao tác chỉnh sửa? Mọi thông tin thay đổi sẽ không được lưu lại."} onClose={() => setCancel(false)} onConfirm={() => navigate(listPath)} />}
      {submitConfirm && (
        isRevise
          ? <ConfirmActionDialog title="Xác nhận trình duyệt lại hồ sơ" confirmLabel="Xác nhận" message="Bạn có chắc chắn muốn trình duyệt lại giao dịch công chứng này lên Trưởng TCHNCC không? Sau khi trình duyệt lại, thông tin giao dịch sẽ bị khóa và không thể chỉnh sửa trực tiếp." onClose={() => setSubmitConfirm(false)} onConfirm={confirmSubmit} />
          : <ConfirmActionDialog title="Xác nhận trình duyệt hồ sơ" confirmLabel="Xác nhận" message="Bạn có chắc chắn muốn trình duyệt giao dịch công chứng này lên Trưởng TCHNCC không? Sau khi trình duyệt, bạn sẽ không thể chỉnh sửa trực tiếp thông tin cho đến khi có phản hồi." onClose={() => setSubmitConfirm(false)} onConfirm={confirmSubmit} />
      )}
      {partyDialog && (
        <PersonOrgDialog
          vaiTro={benList[partyDialog.benIdx].vaiTro || "Bên liên quan"}
          initial={partyDialog.partyIdx !== undefined ? benList[partyDialog.benIdx].parties[partyDialog.partyIdx] : undefined}
          onClose={() => setPartyDialog(null)}
          onSave={(p) => {
            setBenList(benList.map((b, x) => {
              if (x !== partyDialog.benIdx) return b
              const parties = partyDialog.partyIdx !== undefined ? b.parties.map((old, y) => y === partyDialog.partyIdx ? p : old) : [...b.parties, p]
              return { ...b, parties }
            }))
            setPartyDialog(null)
            showToast(partyDialog.partyIdx !== undefined ? "Cập nhật bên liên quan thành công." : "Thêm mới bên liên quan thành công.")
          }}
        />
      )}
      {assetDialog && (
        <AssetDialog
          initial={assetDialog.idx !== undefined ? assets[assetDialog.idx] : undefined}
          onClose={() => setAssetDialog(null)}
          onSave={(a) => {
            setAssets(assetDialog.idx !== undefined ? assets.map((old, y) => y === assetDialog.idx ? a : old) : [...assets, a])
            setAssetDialog(null)
            showToast(assetDialog.idx !== undefined ? "Cập nhật tài sản giao dịch thành công." : "Thêm mới tài sản giao dịch thành công.")
          }}
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
function FF({ label, required, error, className, children }: { label: string; required?: boolean; error?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-xs font-semibold text-foreground-strong">{label}{required && <span className="ml-1 text-red-600">*</span>}</label>
      {children}
      {error && <span className="text-[12px] text-red-600">{error}</span>}
    </div>
  )
}
