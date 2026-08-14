import { useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Ban, BookOpen, CheckCircle2, Download, Eye, FileSearch, List, Pencil, Plus, RotateCcw, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { useToast } from "@/features/reconciliation/components/Toast"
import { EmptyState, IconBtn, Pagination, PageHeader, StatusPill, Th, inputCls } from "../ingestion/shared"
import { revokeStateOf } from "./revoke/config"
import { ConfirmActionDialog, NotaryRoleSelect, RequestEditDialog, type NotaryRole } from "./approval/dialogs"
import {
  GIAICHAP_META, HOSO_STATUS, NGUON_COLOR, NGUON_LABEL, TEN_GD_OPTIONS, TRANSACTIONS,
  assetSummary, nfCurrency, partySummary, type HoSoStatus, type Method, type Transaction,
} from "./config"

const STATUS_TABS: [HoSoStatus, string][] = [
  ["draft", "Lưu nháp"],
  ["pending", "Chờ duyệt"],
  ["revise", "Yêu cầu sửa"],
  ["approved", "Đã duyệt"],
]

const parseVn = (s: string) => {
  const [dd, mm, yy] = s.split("/")
  return new Date(+yy, +mm - 1, +dd).getTime()
}
const yearOf = (s: string) => +s.split("/")[2]
const requesterInfo = (t: Transaction) => t.parties.map((p) => `${p.name} - ${p.giayTo}`).join("; ")
const assetBookInfo = (t: Transaction) => (t.assets.length ? t.assets.map((a) => `Loại: ${a.loai}, chủ sở hữu: ${a.chuSoHuu}, Số GCN: ${a.gcn}`).join("; ") : "—")

export function TransactionListPage({ method }: { method: Method }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const viewMode = searchParams.get("viewMode") === "book" ? "book" : "list"
  const isPaper = method === "paper"
  const label = isPaper ? "giấy" : "điện tử"

  const setViewMode = (m: "list" | "book") => {
    const next = new URLSearchParams(searchParams)
    if (m === "book") next.set("viewMode", "book")
    else next.delete("viewMode")
    setSearchParams(next)
  }

  return viewMode === "book" ? (
    <BookView method={method} label={label} onExitBook={() => setViewMode("list")} />
  ) : (
    <ListView method={method} label={label} isPaper={isPaper} onEnterBook={() => setViewMode("book")} />
  )
}

/* ============================ DẠNG DANH SÁCH (A.3.2) ============================ */

interface Filter {
  keyword: string
  soCC: string
  ngayFrom: string
  ngayTo: string
  tenGD: string
  blq: string
  taiSan: string
  toChuc: string
  ccv: string
  nguon: string
  createdFrom: string
  createdTo: string
  giaiChap: string
}
const EMPTY: Filter = { keyword: "", soCC: "", ngayFrom: "", ngayTo: "", tenGD: "all", blq: "", taiSan: "", toChuc: "", ccv: "", nguon: "all", createdFrom: "", createdTo: "", giaiChap: "all" }

function ViewToggle({ mode, canBook, onList, onBook }: { mode: "list" | "book"; canBook: boolean; onList: () => void; onBook: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[12.5px] text-foreground-muted">Chế độ xem:</span>
      <div className="flex gap-1 rounded-md border border-border bg-surface-muted p-[3px]">
        <button onClick={onList} className={cn("flex items-center gap-1.5 rounded-md px-3 py-[5px] text-[12.5px] font-medium", mode === "list" ? "bg-surface text-foreground-strong shadow-xs" : "text-foreground-muted hover:text-foreground")}>
          <List className="size-3.5" />
          Dạng danh sách
        </button>
        <button
          onClick={onBook}
          disabled={!canBook}
          title={!canBook ? "Chỉ khả dụng ở trạng thái Lưu chính thức" : undefined}
          className={cn("flex items-center gap-1.5 rounded-md px-3 py-[5px] text-[12.5px] font-medium", mode === "book" ? "bg-surface text-foreground-strong shadow-xs" : "text-foreground-muted enabled:hover:text-foreground disabled:cursor-not-allowed disabled:opacity-45")}
        >
          <BookOpen className="size-3.5" />
          Dạng sổ
        </button>
      </div>
    </div>
  )
}

function ListView({ method, label, isPaper, onEnterBook }: { method: Method; label: string; isPaper: boolean; onEnterBook: () => void }) {
  const showToast = useToast()
  const navigate = useNavigate()
  const basePath = isPaper ? "/notary-transaction/paper" : "/notary-transaction/electronic"

  const [status, setStatus] = useState<HoSoStatus>("approved")
  const [role, setRole] = useState<NotaryRole>("ccv")
  const [version, setVersion] = useState(0)
  const [actOn, setActOn] = useState<{ t: Transaction; kind: "approve" | "requestEdit" } | null>(null)
  const [draft, setDraft] = useState<Filter>(EMPTY)
  const [applied, setApplied] = useState<Filter>(EMPTY)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [dateError, setDateError] = useState("")

  const pool = useMemo(() => TRANSACTIONS.filter((t) => t.method === method), [method])
  const statusCounts = useMemo(() => {
    const c: Record<string, number> = {}
    pool.forEach((t) => (c[t.trangThaiHoSo] = (c[t.trangThaiHoSo] ?? 0) + 1))
    return c
  }, [pool, version])

  const filtered = useMemo(() => {
    const kw = applied.keyword.trim().toLowerCase()
    return pool
      .filter((t) => {
        if (t.trangThaiHoSo !== status) return false
        if (kw) {
          const hay = `${t.soCC} ${partySummary(t)} ${t.parties.map((p) => p.giayTo).join(" ")} ${assetSummary(t)} ${t.ccv}`.toLowerCase()
          if (!hay.includes(kw)) return false
        }
        if (applied.soCC && !t.soCC.toLowerCase().includes(applied.soCC.trim().toLowerCase())) return false
        if (applied.tenGD !== "all" && t.tenGD !== applied.tenGD) return false
        if (applied.blq && !partySummary(t).toLowerCase().includes(applied.blq.trim().toLowerCase())) return false
        if (applied.taiSan && !assetSummary(t).toLowerCase().includes(applied.taiSan.trim().toLowerCase())) return false
        if (applied.toChuc && !t.toChuc.toLowerCase().includes(applied.toChuc.trim().toLowerCase())) return false
        if (applied.ccv && !t.ccv.toLowerCase().includes(applied.ccv.trim().toLowerCase())) return false
        if (applied.nguon !== "all" && t.nguon !== applied.nguon) return false
        if (applied.giaiChap !== "all" && t.giaiChap !== applied.giaiChap) return false
        if (applied.ngayFrom && parseVn(t.ngayCC) < new Date(applied.ngayFrom).getTime()) return false
        if (applied.ngayTo && parseVn(t.ngayCC) > new Date(applied.ngayTo).getTime()) return false
        return true
      })
      .sort((a, b) => parseVn(b.ngayCC) - parseVn(a.ngayCC) || parseInt(b.soCC) - parseInt(a.soCC))
  }, [pool, status, applied, version])

  const start = (Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize))) - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)

  const doSearch = () => {
    if (draft.keyword.length > 250) return setDateError("Từ khóa tìm kiếm không hợp lệ (vượt quá 250 ký tự)")
    if (draft.ngayFrom && draft.ngayTo && draft.ngayTo < draft.ngayFrom) return setDateError("Khoảng ngày giao dịch không hợp lệ")
    setApplied(draft)
    setDateError("")
    setPage(1)
  }
  const doReset = () => { setDraft(EMPTY); setApplied(EMPTY); setDateError(""); setPage(1) }

  const mutate = (t: Transaction, s: HoSoStatus, msg: string, phanHoi?: string) => {
    t.trangThaiHoSo = s
    if (phanHoi !== undefined) t.ghiChuPhanHoi = phanHoi
    setActOn(null)
    setVersion((v) => v + 1)
    showToast(msg)
  }
  const isTruong = role === "truong"

  return (
    <div>
      <PageHeader
        title={`Danh sách giao dịch công chứng ${label}`}
        desc={`Tra cứu và khai thác các giao dịch công chứng ${label} thuộc quyền quản lý của tổ chức hành nghề công chứng.`}
        actions={
          <div className="flex items-center gap-3">
            <NotaryRoleSelect role={role} onChange={setRole} />
            {!isTruong && <Button onClick={() => navigate(`${basePath}/create`)}><Plus className="size-4" />Thêm mới</Button>}
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-md border border-border bg-surface-muted p-[3px]">
          {STATUS_TABS.map(([k, l]) => (
            <button key={k} onClick={() => { setStatus(k); setPage(1) }} className={cn("flex items-center gap-1.5 rounded-md px-3 py-[6px] text-[13px] font-medium", status === k ? "bg-surface text-foreground-strong shadow-xs" : "text-foreground-muted hover:text-foreground")}>
              {l}
              <span className={cn("rounded-full px-1.5 text-[11px] font-semibold", status === k ? "bg-neutral-900 text-white" : "bg-neutral-200 text-foreground-muted")}>{statusCounts[k] ?? 0}</span>
            </button>
          ))}
        </div>
        <ViewToggle mode="list" canBook={status === "approved"} onList={() => {}} onBook={onEnterBook} />
      </div>

      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[280px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
            <input value={draft.keyword} onChange={(e) => setDraft({ ...draft, keyword: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} placeholder="Nhập thông tin giao dịch cần tìm (số CC, bên liên quan, tài sản, CCV)…" className={cn(inputCls, "h-[38px] pl-9")} />
          </div>
          <Button onClick={doSearch}><Search className="size-4" />Tìm kiếm</Button>
          <Button variant="outline" onClick={doReset}><RotateCcw className="size-4" />Reset</Button>
          <Button variant="outline" onClick={() => showToast(`Đang xuất Excel danh sách GDCC ${label} theo bộ lọc…`)}><Download className="size-4" />Xuất Excel</Button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Số công chứng"><input value={draft.soCC} onChange={(e) => setDraft({ ...draft, soCC: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} className={inputCls} /></Field>
          <Field label="Ngày công chứng — Từ"><input type="date" value={draft.ngayFrom} onChange={(e) => setDraft({ ...draft, ngayFrom: e.target.value })} className={cn(inputCls, "text-[13.5px]")} /></Field>
          <Field label="Ngày công chứng — Đến"><input type="date" value={draft.ngayTo} onChange={(e) => setDraft({ ...draft, ngayTo: e.target.value })} className={cn(inputCls, "text-[13.5px]")} /></Field>
          <Field label="Tên giao dịch">
            <NativeSelect value={draft.tenGD} onChange={(e) => setDraft({ ...draft, tenGD: e.target.value })}>
              <option value="all">Tất cả</option>
              {TEN_GD_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Bên liên quan"><input value={draft.blq} onChange={(e) => setDraft({ ...draft, blq: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} className={inputCls} /></Field>
          <Field label="Tài sản giao dịch"><input value={draft.taiSan} onChange={(e) => setDraft({ ...draft, taiSan: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} className={inputCls} /></Field>
          <Field label="Tổ chức CC thực hiện"><input value={draft.toChuc} onChange={(e) => setDraft({ ...draft, toChuc: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} className={inputCls} /></Field>
          <Field label="Công chứng viên"><input value={draft.ccv} onChange={(e) => setDraft({ ...draft, ccv: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} className={inputCls} /></Field>
          <Field label="Nguồn dữ liệu">
            <NativeSelect value={draft.nguon} onChange={(e) => setDraft({ ...draft, nguon: e.target.value })}>
              <option value="all">Tất cả</option>
              <option value="platform">Tên nền tảng CC</option>
              <option value="converter">PM Chuyển đổi</option>
            </NativeSelect>
          </Field>
          <Field label="Thời gian tạo — Từ"><input type="date" value={draft.createdFrom} onChange={(e) => setDraft({ ...draft, createdFrom: e.target.value })} className={cn(inputCls, "text-[13.5px]")} /></Field>
          <Field label="Thời gian tạo — Đến"><input type="date" value={draft.createdTo} onChange={(e) => setDraft({ ...draft, createdTo: e.target.value })} className={cn(inputCls, "text-[13.5px]")} /></Field>
          <Field label="Trạng thái giải chấp">
            <NativeSelect value={draft.giaiChap} onChange={(e) => setDraft({ ...draft, giaiChap: e.target.value })}>
              <option value="all">Tất cả</option>
              <option value="chua">Chưa giải chấp</option>
              <option value="da">Đã giải chấp</option>
            </NativeSelect>
          </Field>
        </div>
        {dateError && <div className="mt-2.5 text-[12.5px] text-red-600">{dateError}</div>}
      </div>

      <ResultCount total={filtered.length} />

      <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        {filtered.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-neutral-50">
                    <Th className="w-11 text-center">STT</Th>
                    <Th>Số CC</Th>
                    <Th>Ngày CC</Th>
                    <Th className="min-w-[130px]">Tên giao dịch</Th>
                    <Th className="min-w-[200px]">Bên liên quan</Th>
                    <Th className="min-w-[200px]">Tài sản giao dịch</Th>
                    <Th className="min-w-[160px]">Tổ chức CC</Th>
                    <Th className="min-w-[140px]">CCV thực hiện</Th>
                    <Th>Nguồn dữ liệu</Th>
                    <Th className="min-w-[150px]">Thời gian tạo</Th>
                    <Th className="min-w-[130px]">Trạng thái HS</Th>
                    <Th className="min-w-[150px]">Giải chấp</Th>
                    <Th className="w-[92px] text-center">Thao tác</Th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((t, i) => {
                    const revState = revokeStateOf(t.id)
                    return (
                    <tr key={t.id} onClick={() => navigate(`${basePath}/detail/${t.id}`)} className="cursor-pointer border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{start + i + 1}</td>
                      <td className="px-4 py-3 font-mono text-[12.5px] font-semibold text-link">{t.soCC}</td>
                      <td className="whitespace-nowrap px-4 py-3 tabular-nums text-foreground-muted">{t.ngayCC}</td>
                      <td className="px-4 py-3 text-[13px] text-foreground">{t.tenGD}</td>
                      <td className="px-4 py-3 text-[13px] leading-snug text-foreground-muted">{partySummary(t)}</td>
                      <td className="px-4 py-3 text-[13px] leading-snug text-foreground-muted">{assetSummary(t)}</td>
                      <td className="px-4 py-3 text-[13px] text-foreground-muted">{t.toChuc}</td>
                      <td className="px-4 py-3 text-[13px] text-foreground">{t.ccv}</td>
                      <td className="px-4 py-3"><NguonBadge nguon={t.nguon} /></td>
                      <td className="whitespace-nowrap px-4 py-3 text-[12.5px] tabular-nums text-foreground-muted">{t.createdAt}</td>
                      <td className="px-4 py-3"><StatusPill meta={HOSO_STATUS[t.trangThaiHoSo]} /></td>
                      <td className="px-4 py-3"><GiaiChapBadge t={t} /></td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-0.5">
                          <IconBtn title="Xem chi tiết" onClick={() => navigate(`${basePath}/detail/${t.id}`)}><Eye className="size-4" /></IconBtn>
                          {status === "draft" && !isTruong && (
                            <IconBtn title="Chỉnh sửa" onClick={() => navigate(`${basePath}/update/${t.id}`)}><Pencil className="size-4" /></IconBtn>
                          )}
                          {status === "revise" && !isTruong && (
                            <IconBtn title="Cập nhật theo yêu cầu sửa" onClick={() => navigate(`${basePath}/update-rejected/${t.id}`)}><Pencil className="size-4" /></IconBtn>
                          )}
                          {status === "pending" && isTruong && (
                            <>
                              <IconBtn title="Phê duyệt" onClick={() => setActOn({ t, kind: "approve" })}><CheckCircle2 className="size-4 text-emerald-600" /></IconBtn>
                              <IconBtn title="Yêu cầu chỉnh sửa" danger onClick={() => setActOn({ t, kind: "requestEdit" })}><Ban className="size-4" /></IconBtn>
                            </>
                          )}
                          {status === "approved" && revState !== "revoked" && (
                            <IconBtn
                              title={revState === "pending" ? "Đang có yêu cầu tuyên hủy được xử lý" : "Hủy văn bản"}
                              disabled={revState === "pending"}
                              danger
                              onClick={() => navigate(`/notary-transaction/revoke/${t.id}`)}
                            >
                              <Ban className="size-4" />
                            </IconBtn>
                          )}
                        </div>
                      </td>
                    </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={pageSize} total={filtered.length} unit="bản ghi" onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
          </>
        ) : (
          <EmptyState icon={<FileSearch className="size-6" />} title={`Không tìm thấy dữ liệu giao dịch công chứng ${label}`} desc="Không có giao dịch nào khớp với trạng thái và bộ lọc hiện tại." actionLabel="Reset bộ lọc" onAction={doReset} />
        )}
      </div>

      {actOn?.kind === "approve" && (
        <ConfirmActionDialog
          title="Xác nhận phê duyệt hồ sơ"
          confirmLabel="Phê duyệt"
          message={`Bạn có chắc chắn muốn phê duyệt giao dịch công chứng số ${actOn.t.soCC}? Sau khi phê duyệt, hồ sơ sẽ được đưa vào kho dữ liệu công chứng chính thức và không thể chỉnh sửa trực tiếp.`}
          onClose={() => setActOn(null)}
          onConfirm={() => mutate(actOn.t, "approved", "Phê duyệt giao dịch công chứng thành công.")}
        />
      )}
      {actOn?.kind === "requestEdit" && (
        <RequestEditDialog
          onClose={() => setActOn(null)}
          onSubmit={(reason) => mutate(actOn.t, "revise", "Đã gửi yêu cầu chỉnh sửa giao dịch công chứng thành công.", reason)}
        />
      )}
    </div>
  )
}

/* ============================ DẠNG SỔ (A.3.3) ============================ */


interface BookFilter {
  keyword: string
  vpcc: string
  moSo: string
  khoaSo: string
  soCC: string
  loaiGD: string
  nguoiYeuCau: string
  taiSan: string
  ccv: string
}
const BOOK_EMPTY: BookFilter = { keyword: "", vpcc: "all", moSo: "", khoaSo: "", soCC: "", loaiGD: "all", nguoiYeuCau: "", taiSan: "", ccv: "" }

function BookView({ method, label, onExitBook }: { method: Method; label: string; onExitBook: () => void }) {
  const showToast = useToast()
  const navigate = useNavigate()
  const basePath = method === "paper" ? "/notary-transaction/paper" : "/notary-transaction/electronic"

  // Dạng sổ chỉ hiển thị giao dịch "Lưu chính thức" (đã duyệt) — BR002.
  const pool = useMemo(() => TRANSACTIONS.filter((t) => t.method === method && t.trangThaiHoSo === "approved"), [method])
  const vpccOptions = useMemo(() => [...new Set(pool.map((t) => t.toChuc))].sort((a, b) => a.localeCompare(b, "vi")), [pool])

  const [draft, setDraft] = useState<BookFilter>(BOOK_EMPTY)
  const [applied, setApplied] = useState<BookFilter>(BOOK_EMPTY)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [error, setError] = useState("")

  const filtered = useMemo(() => {
    const kw = applied.keyword.trim().toLowerCase()
    return pool
      .filter((t) => {
        if (kw) {
          const hay = `${t.soCC} ${partySummary(t)} ${t.parties.map((p) => p.giayTo).join(" ")} ${t.ccv}`.toLowerCase()
          if (!hay.includes(kw)) return false
        }
        if (applied.vpcc !== "all" && t.toChuc !== applied.vpcc) return false
        if (applied.soCC && !t.soCC.toLowerCase().includes(applied.soCC.trim().toLowerCase())) return false
        if (applied.loaiGD !== "all" && t.tenGD !== applied.loaiGD) return false
        if (applied.nguoiYeuCau && !requesterInfo(t).toLowerCase().includes(applied.nguoiYeuCau.trim().toLowerCase())) return false
        if (applied.taiSan && !assetBookInfo(t).toLowerCase().includes(applied.taiSan.trim().toLowerCase())) return false
        if (applied.ccv && !t.ccv.toLowerCase().includes(applied.ccv.trim().toLowerCase())) return false
        if (applied.moSo && parseVn(t.ngayCC) < new Date(applied.moSo).getTime()) return false
        if (applied.khoaSo && parseVn(t.ngayCC) > new Date(applied.khoaSo).getTime()) return false
        return true
      })
      // BR003: năm CC giảm dần, số CC tăng dần
      .sort((a, b) => yearOf(b.ngayCC) - yearOf(a.ngayCC) || parseInt(a.soCC) - parseInt(b.soCC))
  }, [pool, applied])

  const start = (Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize))) - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)

  const doSearch = () => {
    if (draft.keyword.length > 250) return setError("Từ khóa tìm kiếm không hợp lệ (vượt quá 250 ký tự)")
    if (draft.moSo && draft.khoaSo && draft.khoaSo < draft.moSo) return setError("Khoảng thời gian mở và đóng sổ không hợp lệ")
    setApplied(draft)
    setError("")
    setPage(1)
  }
  const doReset = () => { setDraft(BOOK_EMPTY); setApplied(BOOK_EMPTY); setError(""); setPage(1) }

  // Xuất báo cáo dạng sổ — bắt buộc chọn VP CC (VR001) + thời gian mở/khóa sổ (VR002) + hợp lệ (VR003).
  const doExport = () => {
    if (draft.vpcc === "all") return showToast("Vui lòng lựa chọn Văn phòng công chứng", "error")
    if (!draft.moSo || !draft.khoaSo) return showToast("Vui lòng lựa chọn thời gian mở và đóng sổ", "error")
    if (draft.khoaSo < draft.moSo || new Date(draft.moSo).getTime() > Date.now()) return showToast("Khoảng thời gian mở và đóng sổ không hợp lệ", "error")
    showToast(`Đang xuất báo cáo sổ công chứng ${label}…`)
  }

  return (
    <div>
      <PageHeader title={`Sổ công chứng ${label}`} desc="Khai thác dạng sổ giao dịch công chứng đã lưu chính thức và xuất báo cáo tổng hợp theo mẫu sổ." />

      <div className="mb-4 flex justify-end">
        <ViewToggle mode="book" canBook onList={onExitBook} onBook={() => {}} />
      </div>

      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
          <input value={draft.keyword} onChange={(e) => setDraft({ ...draft, keyword: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} placeholder="Nhập thông tin tìm kiếm (Số CC, bên liên quan, tài sản, CCV)…" className={cn(inputCls, "h-[38px] pl-9")} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Văn phòng công chứng">
            <NativeSelect value={draft.vpcc} onChange={(e) => setDraft({ ...draft, vpcc: e.target.value })}>
              <option value="all">— Chọn văn phòng công chứng —</option>
              {vpccOptions.map((o) => <option key={o} value={o}>{o}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Thời gian mở sổ"><input type="date" value={draft.moSo} onChange={(e) => setDraft({ ...draft, moSo: e.target.value })} className={cn(inputCls, "text-[13.5px]")} /></Field>
          <Field label="Thời gian khóa sổ"><input type="date" value={draft.khoaSo} onChange={(e) => setDraft({ ...draft, khoaSo: e.target.value })} className={cn(inputCls, "text-[13.5px]")} /></Field>
          <Field label="Số công chứng"><input value={draft.soCC} onChange={(e) => setDraft({ ...draft, soCC: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} className={inputCls} /></Field>
          <Field label="Loại giao dịch">
            <NativeSelect value={draft.loaiGD} onChange={(e) => setDraft({ ...draft, loaiGD: e.target.value })}>
              <option value="all">Tất cả</option>
              {TEN_GD_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Người yêu cầu công chứng"><input value={draft.nguoiYeuCau} onChange={(e) => setDraft({ ...draft, nguoiYeuCau: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} className={inputCls} /></Field>
          <Field label="Tài sản"><input value={draft.taiSan} onChange={(e) => setDraft({ ...draft, taiSan: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} className={inputCls} /></Field>
          <Field label="Công chứng viên"><input value={draft.ccv} onChange={(e) => setDraft({ ...draft, ccv: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doSearch()} className={inputCls} /></Field>
        </div>
        {error && <div className="mt-2.5 text-[12.5px] text-red-600">{error}</div>}
        <div className="mt-[18px] flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" onClick={doReset}>Đặt lại</Button>
          <Button onClick={doSearch}><Search className="size-4" />Tìm kiếm</Button>
          <Button variant="outline" onClick={doExport}><Download className="size-4" />Xuất danh sách</Button>
        </div>
      </div>

      <ResultCount total={filtered.length} />

      <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        {filtered.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-neutral-50">
                    <Th className="w-11 text-center">STT</Th>
                    <Th>Số CC</Th>
                    <Th>Ngày CC</Th>
                    <Th className="min-w-[240px]">Người yêu cầu công chứng</Th>
                    <Th className="min-w-[150px]">Loại giao dịch</Th>
                    <Th className="min-w-[140px]">CCV ký văn bản</Th>
                    <Th className="text-right">Phí công chứng</Th>
                    <Th className="text-right">Giá dịch vụ / chi phí khác</Th>
                    <Th className="min-w-[240px]">Tài sản liên quan</Th>
                    <Th className="min-w-[140px]">Ghi chú</Th>
                    <Th className="w-16 text-center">Thao tác</Th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((t, i) => (
                    <tr key={t.id} onClick={() => navigate(`${basePath}/detail/${t.id}`)} className="cursor-pointer border-b border-neutral-100 align-top hover:bg-neutral-50">
                      <td className="px-4 py-3 text-center tabular-nums text-foreground-muted">{start + i + 1}</td>
                      <td className="px-4 py-3 font-mono text-[12.5px] font-semibold text-link">{t.soCC}</td>
                      <td className="whitespace-nowrap px-4 py-3 tabular-nums text-foreground-muted">{t.ngayCC}</td>
                      <td className="px-4 py-3 text-[12.5px] leading-snug text-foreground" title={requesterInfo(t)}>
                        <div className="line-clamp-2">{requesterInfo(t)}</div>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-foreground">{t.loaiGD}</td>
                      <td className="px-4 py-3 text-[13px] text-foreground">{t.ccv}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-foreground">{nfCurrency(t.phi)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-foreground-muted">{nfCurrency(t.thuLao)}</td>
                      <td className="px-4 py-3 text-[12.5px] leading-snug text-foreground-muted" title={assetBookInfo(t)}>
                        <div className="line-clamp-2">{assetBookInfo(t)}</div>
                      </td>
                      <td className="px-4 py-3 text-[12.5px] leading-snug text-foreground-muted">{t.method === "electronic" ? (t.signValid ? "Ký số hợp lệ" : "Ký số không hợp lệ") : t.ghiChu || "—"}</td>
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <IconBtn title="Xem chi tiết" onClick={() => navigate(`${basePath}/detail/${t.id}`)}><Eye className="size-4" /></IconBtn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={pageSize} total={filtered.length} unit="bản ghi" onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
          </>
        ) : (
          <EmptyState icon={<BookOpen className="size-6" />} title={`Không tìm thấy dữ liệu trong sổ công chứng ${label}`} desc="Không có giao dịch lưu chính thức nào khớp với bộ lọc hiện tại." actionLabel="Đặt lại bộ lọc" onAction={doReset} />
        )}
      </div>
    </div>
  )
}

/* ============================ shared bits ============================ */

function ResultCount({ total }: { total: number }) {
  return (
    <div className="mx-0.5 mb-2.5 mt-[18px] flex items-center gap-2">
      <span className="text-[13px] text-foreground-muted">Kết quả:</span>
      <span className="text-[13px] font-semibold text-foreground-strong">{total} giao dịch</span>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-foreground-strong">{label}</label>
      {children}
    </div>
  )
}

function NguonBadge({ nguon }: { nguon: Transaction["nguon"] }) {
  const c = NGUON_COLOR[nguon]
  return (
    <span className="inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold" style={{ background: c.bg, color: c.fg, border: `1px solid ${c.bd}` }}>
      {NGUON_LABEL[nguon]}
    </span>
  )
}

function GiaiChapBadge({ t }: { t: Transaction }) {
  const m = GIAICHAP_META[t.giaiChap]
  if (t.giaiChap === "none") return <span className="text-foreground-subtle">—</span>
  return (
    <span className="inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold" style={{ background: m.bg, color: m.fg, border: `1px solid ${m.bd}` }}>
      {m.label}
    </span>
  )
}
