import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AlertTriangle, ArrowLeft, Download, FileText, ShieldAlert } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { StatusPill, Th } from "../ingestion/shared"
import { OBJECT_LABEL, PREVENT_STATUS, objectTypesOf, preventById, type ObjectType } from "./config"

export function PreventDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const showToast = useToast()
  const r = preventById(id)
  const types = r ? objectTypesOf(r) : []
  const [tab, setTab] = useState<ObjectType>(types[0] ?? "person")

  if (!r) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <FileText className="size-10 text-foreground-subtle" />
        <div className="text-[15px] font-semibold text-foreground-strong">Không tìm thấy thông tin ngăn chặn</div>
        <Button variant="outline" onClick={() => navigate("/prevent-info/search")}>Quay lại danh sách</Button>
      </div>
    )
  }

  const general: [string, string][] = [
    ["Đơn vị gửi yêu cầu", r.donViGuiYeuCau],
    ["Số văn bản", r.soVanBan],
    ["Ngày ban hành văn bản", r.ngayBanHanh],
    ["Số văn bản đến", r.soVanBanDen || "—"],
    ["Ngày văn bản đến", r.ngayVanBanDen || "—"],
    ["Tỉnh/Thành phố", r.tinhThanhPho],
  ]
  const activeTab = types.includes(tab) ? tab : types[0]

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/prevent-info/search")} className="flex size-9 items-center justify-center rounded-md border border-border bg-surface text-foreground-muted shadow-xs hover:bg-surface-muted">
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h3 className="text-[22px] font-semibold leading-tight tracking-[-0.02em] text-foreground-strong">Chi tiết thông tin ngăn chặn</h3>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-mono text-[13px] text-foreground-muted">Số VB {r.soVanBan}</span>
              <StatusPill meta={PREVENT_STATUS[r.trangThai]} />
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate("/prevent-info/search")}>Đóng</Button>
      </div>

      {/* Section 1 — Thông tin văn bản */}
      <Section title="Thông tin văn bản ngăn chặn">
        <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
          {general.map(([k, v]) => <InfoRow key={k} label={k} value={v} />)}
        </div>
        <InfoRow label="Trích yếu" value={r.trichYeu} full />
        <div className="mt-3 flex items-center gap-3 border-t border-neutral-100 pt-3">
          <span className="text-xs text-foreground-muted">File đính kèm:</span>
          {r.fileName ? (
            <button onClick={() => showToast("Đang tải file đính kèm…")} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-[12.5px] font-medium text-link shadow-xs hover:bg-surface-muted">
              <FileText className="size-3.5 text-red-600" />{r.fileName}<Download className="size-3.5" />
            </button>
          ) : <span className="text-[12.5px] text-foreground-subtle">Chưa có tệp đính kèm</span>}
        </div>
      </Section>

      {/* Section 2 — Ý kiến & phản hồi */}
      {r.lyDoTuChoi && (
        <div className="mb-4 flex items-start gap-2.5 rounded-[14px] border border-[#fecaca] bg-[#fef2f2] px-5 py-4 shadow-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600" />
          <div>
            <div className="text-[12.5px] font-semibold text-[#b91c1c]">Lý do từ chối</div>
            <div className="mt-0.5 text-[13px] text-[#7f1d1d]">{r.lyDoTuChoi}</div>
          </div>
        </div>
      )}

      {/* Section 3 — Đối tượng ngăn chặn */}
      <Section title="Thông tin đối tượng ngăn chặn">
        {types.length ? (
          <>
            <div className="mb-4 flex gap-1 rounded-md border border-border bg-surface-muted p-[3px]">
              {types.map((t) => (
                <button key={t} onClick={() => setTab(t)} className={cn("rounded-md px-3.5 py-[6px] text-[12.5px] font-medium", activeTab === t ? "bg-surface text-foreground-strong shadow-xs" : "text-foreground-muted hover:text-foreground")}>
                  {OBJECT_LABEL[t]} ({t === "asset" ? r.assets.length : t === "person" ? r.persons.length : r.orgs.length})
                </button>
              ))}
            </div>
            {activeTab === "person" && <PersonTable rec={r} />}
            {activeTab === "org" && <OrgTable rec={r} />}
            {activeTab === "asset" && <AssetTable rec={r} />}
          </>
        ) : (
          <div className="rounded-[10px] border border-dashed border-border py-6 text-center text-[13px] text-foreground-muted">Chưa có đối tượng ngăn chặn.</div>
        )}
      </Section>
    </div>
  )
}

function ObjBadge() {
  return <span className="inline-flex items-center gap-1 rounded-full border border-[#fecaca] bg-[#fef2f2] px-2 py-0.5 text-[11px] font-semibold text-[#b91c1c]"><ShieldAlert className="size-3" />Ngăn chặn</span>
}

function PersonTable({ rec }: { rec: ReturnType<typeof preventById> & {} }) {
  return (
    <TableWrap cols={["STT", "Trạng thái", "Họ tên", "Loại giấy tờ", "Số giấy tờ", "Ngày sinh", "Địa chỉ", "Giới tính", "Quốc tịch"]}>
      {rec!.persons.map((p, i) => (
        <tr key={i} className="border-b border-neutral-100">
          <Td center>{i + 1}</Td><Td><ObjBadge /></Td><Td strong>{p.hoTen}</Td><Td>{p.loaiGiayTo}</Td>
          <Td mono>{p.soGiayTo}</Td><Td>{p.ngaySinh ?? "—"}</Td><Td>{p.diaChi ?? "—"}</Td><Td>{p.gioiTinh ?? "—"}</Td><Td>{p.quocTich ?? "—"}</Td>
        </tr>
      ))}
    </TableWrap>
  )
}
function OrgTable({ rec }: { rec: ReturnType<typeof preventById> & {} }) {
  return (
    <TableWrap cols={["STT", "Trạng thái", "Tên tổ chức", "Loại giấy tờ", "Số giấy tờ", "Địa chỉ", "Người đại diện", "Chức vụ"]}>
      {rec!.orgs.map((o, i) => (
        <tr key={i} className="border-b border-neutral-100">
          <Td center>{i + 1}</Td><Td><ObjBadge /></Td><Td strong>{o.tenToChuc}</Td><Td>{o.loaiGiayTo}</Td>
          <Td mono>{o.soGiayTo}</Td><Td>{o.diaChi ?? "—"}</Td><Td>{o.nguoiDaiDien ?? "—"}</Td><Td>{o.chucVu ?? "—"}</Td>
        </tr>
      ))}
    </TableWrap>
  )
}
function AssetTable({ rec }: { rec: ReturnType<typeof preventById> & {} }) {
  return (
    <TableWrap cols={["STT", "Trạng thái", "Loại tài sản", "Giấy chứng nhận", "Chủ sở hữu", "Nơi cấp", "Thông tin khác"]}>
      {rec!.assets.map((a, i) => (
        <tr key={i} className="border-b border-neutral-100">
          <Td center>{i + 1}</Td><Td><ObjBadge /></Td><Td strong>{a.loaiTaiSan}</Td><Td mono>{a.soGiayChungNhan}</Td>
          <Td>{a.chuSoHuu}</Td><Td>{a.noiCap ?? "—"}</Td><Td>{a.thongTinKhac ?? "—"}</Td>
        </tr>
      ))}
    </TableWrap>
  )
}

function TableWrap({ cols, children }: { cols: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-[10px] border border-border">
      <table className="w-full min-w-[820px] border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-border bg-neutral-50">
            {cols.map((c, i) => <Th key={i} className={cn("px-3.5 py-2.5", i === 0 && "w-11 text-center")}>{c}</Th>)}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}
function Td({ children, center, strong, mono }: { children: React.ReactNode; center?: boolean; strong?: boolean; mono?: boolean }) {
  return <td className={cn("px-3.5 py-2.5", center && "text-center text-foreground-muted", strong && "font-medium text-foreground", mono && "font-mono text-[12px] text-foreground-muted", !center && !strong && !mono && "text-foreground-muted")}>{children}</td>
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-[14px] border border-border bg-surface p-5 shadow-sm">
      <div className="mb-3 text-[13px] font-semibold text-foreground-strong">{title}</div>
      {children}
    </div>
  )
}
function InfoRow({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={cn("flex flex-col gap-0.5 border-b border-neutral-100 py-2.5", full && "col-span-full")}>
      <div className="text-xs text-foreground-muted">{label}</div>
      <div className="text-[13.5px] leading-snug text-foreground">{value}</div>
    </div>
  )
}
