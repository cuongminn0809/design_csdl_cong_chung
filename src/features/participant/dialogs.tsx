import { useState } from "react"
import { Eye, FileText, ScrollText, User, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { Pagination, StatusPill, Th } from "../ingestion/shared"
import { TXN_STATUS, canViewGdcc, type Participant, type PartRole } from "./config"

function Modal({ title, icon, wide, onClose, footer, children }: { title: string; icon?: React.ReactNode; wide?: boolean; onClose: () => void; footer?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={onClose}>
      <div className={cn("flex max-h-[88vh] w-full flex-col overflow-hidden rounded-xl bg-surface shadow-popover", wide ? "max-w-[940px]" : "max-w-[720px]")} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
          <span className="flex items-center gap-2 text-[15px] font-semibold text-foreground-strong">{icon}{title}</span>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="size-[18px]" /></Button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">{footer ?? <Button variant="outline" onClick={onClose}>Đóng</Button>}</div>
      </div>
    </div>
  )
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-x-6 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
}
function Row({ label, value, wide }: { label: string; value?: string; wide?: boolean }) {
  return <div className={cn("flex flex-col gap-0.5 border-b border-neutral-100 py-2", wide && "sm:col-span-2 lg:col-span-3")}><div className="text-xs text-foreground-muted">{label}</div><div className="text-[13.5px] leading-snug text-foreground">{value || "—"}</div></div>
}

/* ============================ POP01 — CHI TIẾT BÊN THAM GIA (3 TAB) ============================ */
type Tab = "info" | "txn" | "doc"
export function ParticipantDetailModal({ rec, role, onAccessLog, onClose }: {
  rec: Participant; role: PartRole; onAccessLog: () => void; onClose: () => void
}) {
  const showToast = useToast()
  const [tab, setTab] = useState<Tab>("info")
  const isOrg = rec.loai === "Tổ chức"
  const tabs: [Tab, string][] = [["info", "Thông tin bên tham gia"], ["txn", "Giao dịch liên quan"], ["doc", "Văn bản liên quan"]]

  return (
    <Modal title="Chi tiết bên tham gia giao dịch công chứng" icon={<Eye className="size-[18px] text-foreground-muted" />} wide onClose={onClose}
      footer={<>
        <Button variant="outline" onClick={onAccessLog}><ScrollText className="size-4" />Nhật ký truy cập</Button>
        <Button variant="outline" onClick={onClose}>Đóng</Button>
      </>}>
      <div className="mb-4 flex flex-wrap gap-1 rounded-md border border-border bg-surface-muted p-[3px]">
        {tabs.map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={cn("rounded-md px-3 py-[6px] text-[13px] font-medium", tab === k ? "bg-surface text-foreground-strong shadow-xs" : "text-foreground-muted hover:text-foreground")}>{l}</button>)}
      </div>

      {tab === "info" && (
        <>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">Thông tin nhân thân / pháp nhân</div>
          <Grid>
            <Row label="Bên liên quan" value={rec.benLienQuan} />
            <Row label="Loại bên tham gia" value={rec.loai} />
            <Row label={isOrg ? "Tên tổ chức" : "Họ tên người tham gia"} value={rec.hoTen} />
            <Row label={isOrg ? "Mã số thuế" : "Số CCCD/CMND/Hộ chiếu"} value={rec.soGiayTo} />
            <Row label={isOrg ? "Ngày đăng ký" : "Ngày cấp"} value={rec.ngayCap} />
            <Row label={isOrg ? "Cơ quan đăng ký" : "Nơi cấp"} value={rec.noiCap} />
            {!isOrg && <Row label="Giới tính" value={rec.gioiTinh} />}
            <Row label={isOrg ? "Ngày thành lập" : "Ngày sinh"} value={rec.ngaySinh} />
            <Row label="Số điện thoại" value={rec.soDienThoai} />
            <Row label="Email" value={rec.email} />
            <Row label="Địa chỉ" value={rec.diaChi} wide />
          </Grid>
        </>
      )}

      {tab === "txn" && (
        rec.lienQuan.length ? (
          <div className="overflow-x-auto rounded-[10px] border border-border">
            <table className="w-full min-w-[860px] border-collapse text-[13px]">
              <thead><tr className="border-b border-border bg-neutral-50"><Th className="w-11 px-3.5 py-2.5 text-center">STT</Th><Th className="px-3.5 py-2.5">Số công chứng</Th><Th className="px-3.5 py-2.5">Ngày CC</Th><Th className="px-3.5 py-2.5">Tên giao dịch</Th><Th className="px-3.5 py-2.5">Bên liên quan</Th><Th className="px-3.5 py-2.5">CCV</Th><Th className="px-3.5 py-2.5">TCHNCC</Th><Th className="px-3.5 py-2.5">Trạng thái</Th><Th className="px-3.5 py-2.5 text-center">Thao tác</Th></tr></thead>
              <tbody>
                {rec.lienQuan.map((g, i) => (
                  <tr key={i} className="border-b border-neutral-100 last:border-0">
                    <td className="px-3.5 py-2.5 text-center text-foreground-muted">{i + 1}</td>
                    <td className="px-3.5 py-2.5 font-mono text-[12px] font-semibold text-link">{g.soCC}</td>
                    <td className="whitespace-nowrap px-3.5 py-2.5 tabular-nums text-foreground-muted">{g.ngayCC}</td>
                    <td className="px-3.5 py-2.5 text-foreground">{g.tenGD}</td>
                    <td className="px-3.5 py-2.5 text-foreground-muted">{g.benLienQuan}</td>
                    <td className="px-3.5 py-2.5 text-foreground-muted">{g.ccv}</td>
                    <td className="px-3.5 py-2.5 text-foreground-muted">{g.tchncc}</td>
                    <td className="px-3.5 py-2.5"><StatusPill meta={TXN_STATUS[g.trangThai]} /></td>
                    <td className="px-3.5 py-2.5 text-center">
                      {canViewGdcc(role, g.sameOrg)
                        ? <button onClick={() => showToast(`Đang mở chi tiết giao dịch công chứng ${g.soCC}…`)} className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-[12px] font-medium text-foreground-strong shadow-xs hover:bg-surface-muted"><Eye className="size-3.5" />Xem chi tiết</button>
                        : <span className="text-[11.5px] text-foreground-subtle">Ngoài phạm vi quyền</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-[13px] text-foreground-muted">Không có giao dịch công chứng liên quan.</p>
      )}

      {tab === "doc" && (
        rec.vanBan.length ? (
          <div className="overflow-x-auto rounded-[10px] border border-border">
            <table className="w-full min-w-[820px] border-collapse text-[13px]">
              <thead><tr className="border-b border-border bg-neutral-50"><Th className="w-11 px-3.5 py-2.5 text-center">STT</Th><Th className="px-3.5 py-2.5">Loại văn bản</Th><Th className="px-3.5 py-2.5">Số công chứng</Th><Th className="px-3.5 py-2.5">Tên GDCC</Th><Th className="px-3.5 py-2.5">CCV</Th><Th className="px-3.5 py-2.5">TCHNCC</Th><Th className="px-3.5 py-2.5 text-center">Thao tác</Th></tr></thead>
              <tbody>
                {rec.vanBan.map((v, i) => (
                  <tr key={i} className="border-b border-neutral-100 last:border-0">
                    <td className="px-3.5 py-2.5 text-center text-foreground-muted">{i + 1}</td>
                    <td className="px-3.5 py-2.5 text-foreground">{v.loaiVB}</td>
                    <td className="px-3.5 py-2.5 font-mono text-[12px] font-semibold text-link">{v.soCC}</td>
                    <td className="px-3.5 py-2.5 text-foreground">{v.tenGD}</td>
                    <td className="px-3.5 py-2.5 text-foreground-muted">{v.ccv}</td>
                    <td className="px-3.5 py-2.5 text-foreground-muted">{v.tchncc}</td>
                    <td className="px-3.5 py-2.5 text-center">
                      {canViewGdcc(role, v.sameOrg)
                        ? <button onClick={() => showToast(`Đang mở xem file ${v.loaiVB.toLowerCase()} ${v.soCC}…`)} className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-[12px] font-medium text-foreground-strong shadow-xs hover:bg-surface-muted"><FileText className="size-3.5" />Xem CT</button>
                        : <span className="text-[11.5px] text-foreground-subtle">Ngoài phạm vi quyền</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-[13px] text-foreground-muted">Không có văn bản công chứng liên quan.</p>
      )}
    </Modal>
  )
}

/* ============================ POP02 — NHẬT KÝ TRUY CẬP ============================ */
export function AccessLogModal({ rec, onClose }: { rec: Participant; onClose: () => void }) {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const start = (Math.min(page, Math.max(1, Math.ceil(rec.nhatKy.length / size))) - 1) * size
  const paged = rec.nhatKy.slice(start, start + size)
  return (
    <Modal title="Nhật ký truy cập" icon={<User className="size-[18px] text-foreground-muted" />} onClose={onClose}>
      <div className="mb-3 text-[13px] text-foreground-muted">Bên tham gia: <span className="font-semibold text-foreground-strong">{rec.hoTen}</span> — {rec.soGiayTo}</div>
      {rec.nhatKy.length ? (
        <div className="overflow-hidden rounded-[10px] border border-border">
          <table className="w-full border-collapse text-[13px]">
            <thead><tr className="border-b border-border bg-neutral-50"><Th className="w-11 px-3.5 py-2.5 text-center">STT</Th><Th className="px-3.5 py-2.5">Người truy cập</Th><Th className="px-3.5 py-2.5">Đơn vị</Th><Th className="px-3.5 py-2.5">Địa chỉ IP</Th><Th className="px-3.5 py-2.5">Thời gian truy cập</Th></tr></thead>
            <tbody>{paged.map((l, i) => (
              <tr key={i} className="border-b border-neutral-100 last:border-0">
                <td className="px-3.5 py-2.5 text-center text-foreground-muted">{start + i + 1}</td>
                <td className="px-3.5 py-2.5 text-foreground">{l.nguoi}</td>
                <td className="px-3.5 py-2.5 text-foreground-muted">{l.donVi}</td>
                <td className="px-3.5 py-2.5 font-mono text-[12px] text-foreground-muted">{l.ip}</td>
                <td className="whitespace-nowrap px-3.5 py-2.5 tabular-nums text-foreground-muted">{l.thoiGian}</td>
              </tr>
            ))}</tbody>
          </table>
          <Pagination page={page} pageSize={size} total={rec.nhatKy.length} unit="lượt truy cập" onPage={setPage} onPageSize={(n) => { setSize(n); setPage(1) }} />
        </div>
      ) : <div className="rounded-[10px] border border-dashed border-border py-8 text-center text-[13px] text-foreground-muted">Chưa có lượt truy cập nào.</div>}
    </Modal>
  )
}
