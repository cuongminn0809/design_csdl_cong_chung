import { useState } from "react"
import { CircleCheck, Download, Eye, FileText, ShieldAlert, ShieldCheck, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { Th } from "../../ingestion/shared"
import { nfCurrency } from "../config"
import { getSource, type RevokeRequest } from "./config"

/** Khối thông tin read-only dùng chung cho màn Chi tiết (A.3.4-02) & Phê duyệt (A.3.4-05). */
export function RevokeDetailView({ r, showTables = true }: { r: RevokeRequest; showTables?: boolean }) {
  const showToast = useToast()
  const [preview, setPreview] = useState<string | null>(null)
  const s = getSource(r)
  const isPaper = r.method === "paper"
  const huyFile = isPaper ? r.scanFile : r.signedFile

  const sourceInfo: [string, string][] = [
    ["Ngày công chứng", s?.ngayCC ?? "—"],
    ["Số công chứng", s?.soCC ?? "—"],
    ["Loại giao dịch", s?.loaiGD ?? "—"],
    ["Tên giao dịch", s?.tenGD ?? "—"],
    ["Phương thức CC", s ? (s.method === "paper" ? "Công chứng giấy" : "Công chứng điện tử") : "—"],
    ["Địa điểm CC", s?.diaDiem ?? "—"],
    ["Giá trị giao dịch", s ? nfCurrency(s.giaTri) : "—"],
    ["Tổ chức CC", s?.toChuc ?? "—"],
    ["Công chứng viên", s?.ccv ?? "—"],
    ["Mã tham chiếu", s?.maThamChieu ?? "—"],
  ]

  const huyInfo: [string, string][] = [
    ["Ngày công chứng", r.ngayCC],
    ["Số công chứng", r.soCC],
    ["Phương thức công chứng", isPaper ? "Công chứng giấy" : "Công chứng điện tử"],
    ["Loại giao dịch", s?.loaiGD ?? "—"],
    ["Tên giao dịch", "Văn bản hủy"],
    ["Địa điểm công chứng", r.diaDiem],
    ["Tổ chức công chứng", r.toChuc],
    ["Công chứng viên", r.ccv],
  ]

  return (
    <>
      <Section title="Giao dịch công chứng gốc" tone="muted">
        <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
          {sourceInfo.map(([k, v]) => <InfoRow key={k} label={k} value={v} />)}
        </div>
      </Section>

      <Section title="Thông tin văn bản hủy">
        <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
          {huyInfo.map(([k, v]) => <InfoRow key={k} label={k} value={v} />)}
        </div>
        <InfoRow label="Nội dung giao dịch" value={r.noiDung || "—"} full />
      </Section>

      <Section title="Thông tin khác">
        <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
          <InfoRow label="Phí công chứng" value={nfCurrency(r.phi)} />
          <InfoRow label="Thù lao công chứng" value={nfCurrency(r.thuLao)} />
          <InfoRow label="Ghi chú" value={r.ghiChu || "—"} className="lg:col-span-2" />
        </div>
      </Section>

      {showTables && s && (
        <>
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
                  {s.parties.map((p, i) => (
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

          <Section title="Thông tin tài sản giao dịch">
            {s.assets.length ? (
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
                    {s.assets.map((a, i) => (
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
        </>
      )}

      <Section title="Tài liệu đính kèm">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-[10px] border border-border p-4">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">
              {isPaper ? "Văn bản hủy (bản scan)" : "Văn bản công chứng điện tử (Văn bản hủy)"}
            </div>
            {huyFile ? (
              <div>
                <div className="flex items-center gap-2.5 rounded-lg border border-border bg-neutral-50 p-3">
                  <FileText className="size-5 shrink-0 text-red-600" />
                  <span className="flex-1 truncate font-mono text-[12.5px] text-foreground">{huyFile}</span>
                </div>
                {!isPaper && (
                  <div className="mt-2.5 flex items-center gap-2">
                    {r.signValid ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#bbf7d0] bg-[#f0fdf4] px-2.5 py-1 text-[12px] font-semibold text-[#15803d]"><ShieldCheck className="size-3.5" />Chữ ký số hợp lệ</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#fecaca] bg-[#fef2f2] px-2.5 py-1 text-[12px] font-semibold text-[#b91c1c]"><ShieldAlert className="size-3.5" />Không hợp lệ</span>
                    )}
                  </div>
                )}
                <div className="mt-2.5 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPreview(huyFile)}><Eye className="size-3.5" />Xem</Button>
                  <Button variant="outline" size="sm" onClick={() => showToast("Đang tải văn bản hủy…")}><Download className="size-3.5" />Tải về</Button>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border py-8 text-center text-[13px] text-foreground-muted">Chưa có văn bản hủy đính kèm</div>
            )}
          </div>

          <div className="rounded-[10px] border border-border p-4">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">Thành phần hồ sơ khác</div>
            {r.hoSoKhac.length ? (
              <div className="flex flex-col gap-2">
                {r.hoSoKhac.map((fn, i) => (
                  <div key={i} className="flex items-center gap-2.5 rounded-lg border border-border p-[10px_12px]">
                    <span className="text-[12.5px] font-semibold text-foreground-subtle">{i + 1}.</span>
                    <FileText className="size-4 shrink-0 text-red-600" />
                    <span className="flex-1 truncate font-mono text-[12px] text-foreground">{fn}</span>
                    <button onClick={() => setPreview(fn)} className="rounded-md p-1.5 text-foreground-muted hover:bg-surface-muted hover:text-foreground-strong" title="Xem"><Eye className="size-4" /></button>
                    <button onClick={() => showToast("Đang tải tệp…")} className="rounded-md p-1.5 text-foreground-muted hover:bg-surface-muted hover:text-foreground-strong" title="Tải về"><Download className="size-4" /></button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border py-8 text-center text-[13px] text-foreground-muted">Không có tệp hồ sơ khác đính kèm.</div>
            )}
          </div>
        </div>
      </Section>

      {preview && <PreviewModal name={preview} onClose={() => setPreview(null)} />}
    </>
  )
}

function Section({ title, children, tone }: { title: string; children: React.ReactNode; tone?: "muted" }) {
  return (
    <div className={cn("mb-4 rounded-[14px] border p-5 shadow-sm", tone === "muted" ? "border-border bg-neutral-50/60" : "border-border bg-surface")}>
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
