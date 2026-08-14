import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AlertTriangle, ArrowLeft, Ban, CheckCircle2, CircleCheck, Download, Eye, FileText, Pencil, Send, ShieldAlert, ShieldCheck, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { StatusPill, Th } from "../ingestion/shared"
import {
  GIAICHAP_META, HOSO_STATUS, NGUON_DETAIL_LABEL, TRANSACTIONS, nfCurrency, type Method,
} from "./config"
import { ConfirmActionDialog, NotaryRoleSelect, RequestEditDialog, type NotaryRole } from "./approval/dialogs"

export function TransactionDetailPage({ method }: { method: Method }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const showToast = useToast()
  const isPaper = method === "paper"
  const label = isPaper ? "giấy" : "điện tử"
  const listPath = isPaper ? "/notary-transaction/paper/list" : "/notary-transaction/electronic/list"
  const basePath = isPaper ? "/notary-transaction/paper" : "/notary-transaction/electronic"
  const [preview, setPreview] = useState<string | null>(null)
  const [role, setRole] = useState<NotaryRole>("ccv")
  const [version, setVersion] = useState(0)
  const [dialog, setDialog] = useState<"submit" | "approve" | "requestEdit" | null>(null)

  const t = useMemo(() => TRANSACTIONS.find((x) => x.id === id && x.method === method) ?? null, [id, method, version])

  if (!t) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <FileText className="size-10 text-foreground-subtle" />
        <div className="text-[15px] font-semibold text-foreground-strong">Không tìm thấy giao dịch</div>
        <Button variant="outline" onClick={() => navigate(listPath)}>Quay lại danh sách</Button>
      </div>
    )
  }

  const isTheChap = t.tenGD === "Thế chấp"
  const taiSanDocs = t.thanhPhan?.filter((d) => d.group === "taisan") ?? []
  const nhanThanDocs = t.thanhPhan?.filter((d) => d.group === "nhanthan") ?? []

  const general: [string, string][] = [
    ["Ngày công chứng", t.ngayCC],
    ["Số công chứng", t.soCC],
    ["Phương thức công chứng", isPaper ? "Công chứng giấy" : "Công chứng điện tử"],
    ["Loại giao dịch", t.loaiGD],
    ["Tên giao dịch", t.tenGD],
    ["Nguồn dữ liệu", NGUON_DETAIL_LABEL[t.nguon]],
    ["Giá trị giao dịch", nfCurrency(t.giaTri)],
    ["Bằng chữ", t.giaTriChu],
    ["Địa điểm công chứng", t.diaDiem],
    ["Mã tham chiếu", t.maThamChieu],
    ["Tổ chức công chứng", t.toChuc],
    ["Công chứng viên", t.ccv],
  ]

  const status = t.trangThaiHoSo
  const isCCV = role === "ccv"
  const isTruong = role === "truong"
  // Visibility Rules (A.3.1.3): CCV thao tác Lưu nháp/Yêu cầu sửa; Trưởng TCHNCC thao tác Chờ duyệt; Đã duyệt khóa (BR-03).
  const canEdit = isCCV && (status === "draft" || status === "revise")
  const canApprove = isTruong && status === "pending"
  const mutate = (s: typeof status, msg: string, phanHoi?: string) => {
    t.trangThaiHoSo = s
    if (phanHoi !== undefined) t.ghiChuPhanHoi = phanHoi
    setVersion((v) => v + 1)
    showToast(msg)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(listPath)} className="flex size-9 items-center justify-center rounded-md border border-border bg-surface text-foreground-muted shadow-xs hover:bg-surface-muted">
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h3 className="text-[22px] font-semibold leading-tight tracking-[-0.02em] text-foreground-strong">Chi tiết giao dịch công chứng {label}</h3>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-mono text-[13px] text-foreground-muted">Số CC {t.soCC}</span>
              <StatusPill meta={HOSO_STATUS[t.trangThaiHoSo]} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <NotaryRoleSelect role={role} onChange={setRole} />
          <Button variant="outline" onClick={() => showToast("Đang xuất báo cáo chi tiết…")}>
            <Download className="size-4" />
            Xuất báo cáo
          </Button>
          <Button variant="outline" onClick={() => navigate(listPath)}>Quay lại</Button>
        </div>
      </div>

      {/* Alertbox ý kiến phản hồi của Trưởng TCHNCC (BR-04) — chỉ khi Yêu cầu sửa */}
      {status === "revise" && t.ghiChuPhanHoi && (
        <div className="mb-4 flex items-start gap-2.5 rounded-[14px] border border-[#fde68a] bg-[#fffbeb] px-5 py-4 shadow-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#b45309]" />
          <div>
            <div className="text-[12.5px] font-semibold text-[#92400e]">Ý kiến phản hồi của Trưởng TCHNCC — Yêu cầu chỉnh sửa</div>
            <div className="mt-0.5 text-[13px] text-[#7c2d12]">{t.ghiChuPhanHoi}</div>
          </div>
        </div>
      )}

      {/* A. Thông tin chung */}
      <Section title="Thông tin chung">
        <div className="grid grid-cols-1 gap-x-8 gap-y-0 sm:grid-cols-2 lg:grid-cols-4">
          {general.map(([k, v]) => (
            <InfoRow key={k} label={k} value={v} />
          ))}
        </div>
        <InfoRow label="Nội dung giao dịch" value={t.noiDung} full />
      </Section>

      {/* B. Thông tin khác */}
      <Section title="Thông tin khác">
        <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
          <InfoRow label="Phí công chứng" value={nfCurrency(t.phi)} />
          <InfoRow label="Thù lao công chứng" value={nfCurrency(t.thuLao)} />
          <InfoRow label="Ghi chú" value={t.ghiChu || "—"} full={false} className="lg:col-span-2" />
        </div>
        {isTheChap && (
          <>
            <div className="mb-2.5 mt-3 border-t border-neutral-100 pt-3 text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">
              Thông tin thế chấp / giải chấp
            </div>
            <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
              <InfoRow label="Trạng thái giải chấp" value={GIAICHAP_META[t.giaiChap].label} />
              <InfoRow label="Thời hạn giải chấp" value={t.thoiHanGiaiChap ?? "—"} />
              <InfoRow label="Ngày giải chấp" value={t.ngayGiaiChap ?? "—"} />
              <InfoRow label="Ghi chú giải chấp" value={t.ghiChuGiaiChap ?? "—"} />
            </div>
          </>
        )}
      </Section>

      {/* C. Bên liên quan */}
      <Section title="Thông tin bên liên quan">
        <div className="overflow-hidden rounded-[10px] border border-border">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-border bg-neutral-50">
                <Th className="w-11 px-3.5 py-2.5 text-center">STT</Th>
                <Th className="px-3.5 py-2.5">Họ tên / Tên tổ chức</Th>
                <Th className="px-3.5 py-2.5">Giấy tờ tùy thân / pháp nhân</Th>
                <Th className="px-3.5 py-2.5">Địa chỉ</Th>
                <Th className="px-3.5 py-2.5">Vai trò</Th>
              </tr>
            </thead>
            <tbody>
              {t.parties.map((p, i) => (
                <tr key={i} className="border-b border-neutral-100">
                  <td className="px-3.5 py-2.5 text-center text-foreground-muted">{i + 1}</td>
                  <td className="px-3.5 py-2.5 font-medium text-foreground">
                    {p.name}
                    {p.isOrg && <span className="ml-2 rounded-full border border-border bg-surface-muted px-1.5 py-px text-[10.5px] font-semibold text-foreground-muted">Tổ chức</span>}
                  </td>
                  <td className="px-3.5 py-2.5 font-mono text-[12px] text-foreground-muted">{p.giayTo}</td>
                  <td className="px-3.5 py-2.5 text-foreground-muted">{p.diaChi}</td>
                  <td className="px-3.5 py-2.5 text-foreground">{p.vaiTro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* D. Tài sản */}
      <Section title="Thông tin tài sản giao dịch">
        {t.assets.length ? (
          <div className="overflow-hidden rounded-[10px] border border-border">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-border bg-neutral-50">
                  <Th className="w-11 px-3.5 py-2.5 text-center">STT</Th>
                  <Th className="px-3.5 py-2.5">Loại tài sản</Th>
                  <Th className="px-3.5 py-2.5">Giấy chứng nhận</Th>
                  <Th className="px-3.5 py-2.5">Chủ sở hữu</Th>
                  <Th className="px-3.5 py-2.5">Địa chỉ / Đặc điểm tài sản</Th>
                </tr>
              </thead>
              <tbody>
                {t.assets.map((a, i) => (
                  <tr key={i} className="border-b border-neutral-100">
                    <td className="px-3.5 py-2.5 text-center text-foreground-muted">{i + 1}</td>
                    <td className="px-3.5 py-2.5 font-medium text-foreground">{a.loai}</td>
                    <td className="px-3.5 py-2.5 font-mono text-[12px] text-foreground-muted">{a.gcn}</td>
                    <td className="px-3.5 py-2.5 text-foreground">{a.chuSoHuu}</td>
                    <td className="px-3.5 py-2.5 text-foreground-muted">{a.dacDiem}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-[10px] border border-dashed border-border py-6 text-center text-[13px] text-foreground-muted">Giao dịch không gắn với tài sản cụ thể.</div>
        )}
      </Section>

      {/* E. Tài liệu đính kèm */}
      <Section title="Tài liệu đính kèm">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Văn bản công chứng */}
          <div className="rounded-[10px] border border-border p-4">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">
              {isPaper ? "Văn bản công chứng giấy" : "Văn bản công chứng điện tử"}
            </div>
            {isPaper ? (
              t.scanFile ? (
                <div>
                  <div className="flex items-center gap-2.5 rounded-lg border border-border bg-neutral-50 p-3">
                    <FileText className="size-5 shrink-0 text-red-600" />
                    <span className="flex-1 truncate font-mono text-[12.5px] text-foreground">{t.scanFile}</span>
                  </div>
                  <div className="mt-2.5 flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPreview(t.scanFile!)}>
                      <Eye className="size-3.5" />
                      Xem trực tuyến
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => showToast("Đang tải văn bản scan…")}>
                      <Download className="size-3.5" />
                      Tải về
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border py-8 text-center text-[13px] text-foreground-muted">Chưa có bản scan văn bản giấy</div>
              )
            ) : (
              <div>
                <div className="flex items-center gap-2.5 rounded-lg border border-border bg-neutral-50 p-3">
                  <FileText className="size-5 shrink-0 text-red-600" />
                  <span className="flex-1 truncate font-mono text-[12.5px] text-foreground">{t.signedFile}</span>
                </div>
                <div className="mt-2.5 flex h-[120px] items-center justify-center rounded-lg border border-border bg-neutral-100 text-[12.5px] text-foreground-muted">
                  Trình xem văn bản ký số trực tuyến
                </div>
                <div className="mt-2.5 flex items-center justify-between">
                  {t.signValid ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#bbf7d0] bg-[#f0fdf4] px-2.5 py-1 text-[12px] font-semibold text-[#15803d]">
                      <ShieldCheck className="size-3.5" />
                      Chữ ký số hợp lệ
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#fecaca] bg-[#fef2f2] px-2.5 py-1 text-[12px] font-semibold text-[#b91c1c]">
                      <ShieldAlert className="size-3.5" />
                      Không hợp lệ / Đã bị sửa đổi
                    </span>
                  )}
                  <Button variant="outline" size="sm" onClick={() => showToast("Đang tải văn bản ký số…")}>
                    <Download className="size-3.5" />
                    Tải về
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Hồ sơ / Thành phần */}
          <div className="rounded-[10px] border border-border p-4">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">
              {isPaper ? "Hồ sơ lưu trữ điện tử" : "Thành phần hồ sơ điện tử"}
            </div>
            {isPaper ? (
              t.hoSoLuuTru && t.hoSoLuuTru.length ? (
                <FileList files={t.hoSoLuuTru} onView={setPreview} showToast={showToast} />
              ) : (
                <div className="rounded-lg border border-dashed border-border py-8 text-center text-[13px] text-foreground-muted">Không có tệp hồ sơ lưu trữ đính kèm.</div>
              )
            ) : (
              <ComponentTabs taiSan={taiSanDocs.map((d) => d.name)} nhanThan={nhanThanDocs.map((d) => d.name)} onView={setPreview} showToast={showToast} />
            )}
          </div>
        </div>
      </Section>

      {/* Thanh hành động xử lý phê duyệt (A.3.1.3) */}
      {(canEdit || canApprove) ? (
        <div className="sticky bottom-0 -mx-1 mt-1 flex flex-wrap justify-end gap-2.5 rounded-t-xl border-t border-border bg-surface/95 px-4 py-3.5 backdrop-blur">
          {canEdit && (
            <>
              <Button variant="outline" onClick={() => navigate(status === "revise" ? `${basePath}/update-rejected/${t.id}` : `${basePath}/update/${t.id}`)}>
                <Pencil className="size-4" />{status === "revise" ? "Cập nhật theo yêu cầu" : "Chỉnh sửa"}
              </Button>
              {status === "draft" && <Button onClick={() => setDialog("submit")}><Send className="size-4" />Trình duyệt</Button>}
            </>
          )}
          {canApprove && (
            <>
              <Button variant="outline" onClick={() => setDialog("requestEdit")}><Ban className="size-4" />Yêu cầu sửa</Button>
              <Button onClick={() => setDialog("approve")}><CheckCircle2 className="size-4" />Phê duyệt</Button>
            </>
          )}
        </div>
      ) : status === "approved" ? (
        <div className="rounded-[12px] border border-dashed border-border bg-neutral-50 px-4 py-3 text-center text-[13px] text-foreground-muted">
          Hồ sơ đã được phê duyệt và đưa vào kho dữ liệu chính thức — không thể chỉnh sửa trực tiếp (BR-03).
        </div>
      ) : null}

      {dialog === "submit" && (
        <ConfirmActionDialog title="Xác nhận trình duyệt hồ sơ" confirmLabel="Xác nhận"
          message="Bạn có chắc chắn muốn trình duyệt giao dịch công chứng này lên Trưởng TCHNCC không? Sau khi trình duyệt, bạn sẽ không thể chỉnh sửa trực tiếp thông tin cho đến khi có phản hồi."
          onClose={() => setDialog(null)} onConfirm={() => { setDialog(null); mutate("pending", "Trình duyệt giao dịch công chứng thành công.") }} />
      )}
      {dialog === "approve" && (
        <ConfirmActionDialog title="Xác nhận phê duyệt giao dịch công chứng" confirmLabel="Xác nhận"
          message="Bạn có chắc chắn muốn phê duyệt giao dịch công chứng này? Sau khi phê duyệt, thông tin sẽ được đưa vào kho dữ liệu chính thức và không thể sửa đổi trực tiếp."
          onClose={() => setDialog(null)} onConfirm={() => { setDialog(null); mutate("approved", "Phê duyệt giao dịch công chứng thành công.") }} />
      )}
      {dialog === "requestEdit" && (
        <RequestEditDialog onClose={() => setDialog(null)} onSubmit={(reason) => { setDialog(null); mutate("revise", "Đã gửi yêu cầu chỉnh sửa giao dịch công chứng thành công.", reason) }} />
      )}

      {preview && <PreviewModal name={preview} onClose={() => setPreview(null)} />}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-[14px] border border-border bg-surface p-5 shadow-sm">
      <div className="mb-3 text-[13px] font-semibold text-foreground-strong">{title}</div>
      {children}
    </div>
  )
}

function InfoRow({ label, value, full, className }: { label: string; value: string; full?: boolean; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-0.5 border-b border-neutral-100 py-2.5", full && "col-span-full", className)}>
      <div className="text-xs text-foreground-muted">{label}</div>
      <div className="text-[13.5px] leading-snug text-foreground">{value}</div>
    </div>
  )
}

function FileList({ files, onView, showToast }: { files: string[]; onView: (n: string) => void; showToast: (m: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      {files.map((f, i) => (
        <div key={i} className="flex items-center gap-2.5 rounded-lg border border-border p-[10px_12px]">
          <span className="text-[12.5px] font-semibold text-foreground-subtle">{i + 1}.</span>
          <FileText className="size-4 shrink-0 text-red-600" />
          <span className="flex-1 truncate font-mono text-[12px] text-foreground">{f}</span>
          <button onClick={() => onView(f)} className="rounded-md p-1.5 text-foreground-muted hover:bg-surface-muted hover:text-foreground-strong" title="Xem">
            <Eye className="size-4" />
          </button>
          <button onClick={() => showToast("Đang tải tệp…")} className="rounded-md p-1.5 text-foreground-muted hover:bg-surface-muted hover:text-foreground-strong" title="Tải về">
            <Download className="size-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

function ComponentTabs({ taiSan, nhanThan, onView, showToast }: { taiSan: string[]; nhanThan: string[]; onView: (n: string) => void; showToast: (m: string) => void }) {
  const tabs = [
    ...(taiSan.length ? [["taisan", "Giấy tờ tài sản", taiSan] as const] : []),
    ...(nhanThan.length ? [["nhanthan", "Giấy tờ nhân thân", nhanThan] as const] : []),
  ]
  const [tab, setTab] = useState(tabs[0]?.[0] ?? "taisan")
  if (!tabs.length) return <div className="rounded-lg border border-dashed border-border py-8 text-center text-[13px] text-foreground-muted">Không có tệp thành phần hồ sơ.</div>
  const active = tabs.find((x) => x[0] === tab) ?? tabs[0]
  return (
    <div>
      <div className="mb-3 flex gap-1 rounded-md border border-border bg-surface-muted p-[3px]">
        {tabs.map(([k, l, files]) => (
          <button key={k} onClick={() => setTab(k)} className={cn("rounded-md px-3 py-[5px] text-[12.5px] font-medium", tab === k ? "bg-surface text-foreground-strong shadow-xs" : "text-foreground-muted")}>
            {l} ({files.length})
          </button>
        ))}
      </div>
      <FileList files={active[2]} onView={onView} showToast={showToast} />
    </div>
  )
}

function PreviewModal({ name, onClose }: { name: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex h-[80vh] w-[900px] max-w-full flex-col overflow-hidden rounded-xl bg-surface shadow-popover">
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
          <div className="flex items-center gap-2.5">
            <FileText className="size-4 text-red-600" />
            <span className="font-mono text-[13px] font-medium text-foreground">{name}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="size-[18px]" /></Button>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-2 bg-neutral-100 text-foreground-muted">
          <CircleCheck className="size-8 text-foreground-subtle" />
          <div className="text-[13.5px]">Trình xem tài liệu (PDF) — bản demo</div>
          <div className="text-xs text-foreground-subtle">{name}</div>
        </div>
      </div>
    </div>
  )
}
