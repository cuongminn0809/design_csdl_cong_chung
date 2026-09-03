import { Fragment, useState } from "react"
import { Minus, Plus, RotateCcw } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { COL_LABELS, fmtBlank, fmtNum, todayLongVN, type Tt17Row } from "./config"

function Th({ className, children, rowSpan, colSpan }: { className?: string; children?: React.ReactNode; rowSpan?: number; colSpan?: number }) {
  return <th rowSpan={rowSpan} colSpan={colSpan} className={cn("px-3 py-2 text-left text-[11.5px] font-semibold text-foreground-muted", className)}>{children}</th>
}

/* ============================ BẢNG SỐ LIỆU (nhiều tầng tiêu đề) ============================ */
const GROUPS = [
  { title: "Số CCV", from: 0, to: 1 },
  { title: "CÔNG CHỨNG", from: 1, to: 10 },
  { title: "CHỨNG THỰC", from: 10, to: 17 },
  { title: "Tổng nộp NS/thuế", from: 17, to: 18 },
]

function cellValue(row: Tt17Row, code: string): string {
  switch (code) {
    case "1": return fmtNum(row.c1)
    case "2": return fmtNum(row.c2)
    case "3": return fmtNum(row.c3)
    case "4": return fmtNum(row.c4)
    case "5": return fmtNum(row.c5)
    case "6": return fmtNum(row.c6)
    case "7": return fmtNum(row.c7)
    case "9": return fmtNum(row.c9)
    case "10": return fmtNum(row.c10)
    case "19": return row.ghiChu || ""
    default: return fmtBlank() // 8, 11-18: chưa có nguồn / để trống (BR-02)
  }
}

export function Tt17DataTable({ rows, total, showGhiChu, nameLabel, onClickName, groupLabels }: {
  rows: Tt17Row[]; total?: Tt17Row; showGhiChu: boolean; nameLabel: string
  onClickName?: (row: Tt17Row) => void
  groupLabels?: Record<string, string> // "I" -> "I. Phòng công chứng", "II" -> "II. Văn phòng công chứng"
}) {
  const cols = showGhiChu ? COL_LABELS : COL_LABELS.filter((c) => c.code !== "19")
  let lastGroup: string | undefined
  return (
    <div className="overflow-x-auto rounded-[10px] border border-border">
      <table className="w-full min-w-[1400px] border-collapse text-[12.5px]">
        <thead>
          <tr className="border-b border-border bg-neutral-50">
            <Th rowSpan={3} className="w-[220px] align-bottom">{nameLabel}</Th>
            {GROUPS.map((g) => (
              <Th key={g.title} colSpan={g.to - g.from} className="border-l border-border text-center font-bold uppercase">{g.title}</Th>
            ))}
            {showGhiChu && <Th rowSpan={3} className="border-l border-border align-bottom">Ghi chú<div className="font-normal normal-case text-foreground-subtle">Cột (19)</div></Th>}
          </tr>
          <tr className="border-b border-border bg-neutral-50">
            {cols.filter((c) => c.code !== "19").map((c) => <Th key={c.code} className="border-l border-border text-center">({c.code})</Th>)}
          </tr>
          <tr className="border-b border-border bg-neutral-50">
            {cols.filter((c) => c.code !== "19").map((c) => <Th key={c.code} className="border-l border-border text-center font-normal normal-case text-foreground-subtle">[{c.unit}]</Th>)}
          </tr>
        </thead>
        <tbody>
          {total && (
            <tr className="border-b border-border bg-amber-50/60 font-semibold">
              <td className="px-3 py-2.5 text-foreground-strong">{total.label}</td>
              {cols.filter((c) => c.code !== "19").map((c) => <td key={c.code} className="border-l border-border px-3 py-2.5 text-right tabular-nums text-foreground-strong">{cellValue(total, c.code)}</td>)}
              {showGhiChu && <td className="border-l border-border px-3 py-2.5" />}
            </tr>
          )}
          {rows.map((r) => {
            const groupHeader = r.group && r.group !== lastGroup ? r.group : undefined
            lastGroup = r.group
            return (
              <Fragment key={r.key}>
                {groupHeader && groupLabels && (
                  <tr className="border-b border-neutral-100 bg-neutral-50">
                    <td colSpan={cols.length + 1} className="px-3 py-2 text-[12px] font-bold text-foreground-strong">{groupLabels[groupHeader]}</td>
                  </tr>
                )}
                <tr className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className={cn("px-3 py-2.5 text-foreground", r.group && "pl-6")}>
                    {onClickName ? <button onClick={() => onClickName(r)} className="text-link hover:underline">{r.label}</button> : r.label}
                  </td>
                  {cols.filter((c) => c.code !== "19").map((c) => <td key={c.code} className="border-l border-border px-3 py-2.5 text-right tabular-nums text-foreground-muted">{cellValue(r, c.code)}</td>)}
                  {showGhiChu && <td className="border-l border-border px-3 py-2.5 text-foreground-subtle">{r.ghiChu || ""}</td>}
                </tr>
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/** Dialog xác nhận chung (BR-13: chưa đến ngày chốt báo cáo). */
export function ConfirmDialog({ title, message, onCancel, onConfirm, confirmLabel = "Xác nhận" }: {
  title: string; message: string; onCancel: () => void; onConfirm: () => void; confirmLabel?: string
}) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-[rgba(10,10,10,0.5)] p-6" onClick={onCancel}>
      <div className="w-full max-w-[480px] rounded-xl bg-surface p-6 shadow-popover" onClick={(e) => e.stopPropagation()}>
        <div className="text-[15px] font-semibold text-foreground-strong">{title}</div>
        <p className="mt-2 text-[13.5px] leading-relaxed text-foreground-muted">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>Hủy</Button>
          <Button onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  )
}

/* ============================ CÂY TIÊU ĐỀ NHIỀU TẦNG — khớp đúng Biểu 10a/TP/CC và 10b/TP/CC gốc ============================ */
interface HNode { label: string; unit?: string; code?: string; children?: HNode[] }
const leafCount = (n: HNode): number => (n.children ? n.children.reduce((s, c) => s + leafCount(c), 0) : 1)
const treeDepth = (n: HNode): number => (n.children ? 1 + Math.max(...n.children.map(treeDepth)) : 1)
function headerRows(nodes: HNode[], depth: number, acc: HNode[][]) {
  if (!acc[depth]) acc[depth] = []
  for (const n of nodes) { acc[depth].push(n); if (n.children) headerRows(n.children, depth + 1, acc) }
}

// Cây chỉ tiêu (1)–(18) dùng chung cho cả Biểu 10a và 10b (đúng cấu trúc "Công chứng" / "Chứng thực" trong file mẫu).
function indicatorTree(unit18: string, ghiChu: boolean): HNode[] {
  const tree: HNode[] = [
    { label: "Số công chứng viên", unit: "Người", code: "1" },
    { label: "Công chứng", children: [
      { label: "Số việc công chứng giao dịch", unit: "Việc", children: [
        { label: "Tổng số", code: "2" },
        { label: "Chia ra", children: [
          { label: "Công chứng giao dịch về bất động sản", children: [{ label: "Tổng số", code: "3" }, { label: "Trong đó: công chứng giao dịch điện tử", code: "4" }] },
          { label: "Công chứng giao dịch khác", children: [{ label: "Tổng số", code: "5" }, { label: "Trong đó: công chứng giao dịch điện tử", code: "6" }] },
        ] },
      ] },
      { label: "Số tiền thu được", unit: "Đồng", children: [
        { label: "Phí công chứng", code: "7" },
        { label: "Phí, giá dịch vụ theo yêu cầu liên quan đến việc công chứng", children: [
          { label: "Phí khai thác, sử dụng thông tin liên quan đến giao dịch theo quy định của pháp luật", code: "8" },
          { label: "Giá dịch vụ theo yêu cầu liên quan đến việc công chứng khi yêu cầu tổ chức hành nghề công chứng", code: "9" },
        ] },
        { label: "Chi phí khác", code: "10" },
      ] },
    ] },
    { label: "Chứng thực", children: [
      { label: "Chứng thực bản sao từ bản chính", children: [
        { label: "Số lượng bản sao được chứng thực", unit: "Bản", children: [{ label: "Tổng số", code: "11" }, { label: "Trong đó: chứng thực bản sao điện tử từ bản chính", code: "12" }] },
        { label: "Phí chứng thực bản sao", unit: "Đồng", code: "13" },
      ] },
      { label: "Chứng thực chữ ký trong giấy tờ, văn bản", children: [{ label: "Tổng số việc", unit: "Việc", code: "14" }, { label: "Phí chứng thực chữ ký trong giấy tờ, văn bản", unit: "Đồng", code: "15" }] },
      { label: "Chứng thực chữ ký người dịch", children: [{ label: "Tổng số việc", unit: "Việc", code: "16" }, { label: "Phí chứng thực chữ ký người dịch", unit: "Đồng", code: "17" }] },
    ] },
    { label: "Tổng số tiền nộp vào ngân sách/thuế", unit: unit18, code: "18" },
  ]
  if (ghiChu) tree.push({ label: "Ghi chú", code: "19" })
  return tree
}

function HCell({ node, totalDepth, first }: { node: HNode; totalDepth: number; first?: boolean }) {
  const isLeaf = !node.children
  return (
    <th rowSpan={isLeaf ? totalDepth : 1} colSpan={leafCount(node)}
      className={cn("border border-border bg-neutral-50 px-2 py-1.5 text-center align-middle text-[11px] font-semibold leading-tight text-neutral-800", first && "text-left")}>
      <div>{node.label}</div>
      {node.unit && <div className="font-normal text-neutral-500">({node.unit})</div>}
      {node.code && <div className="font-normal text-neutral-500">({node.code})</div>}
    </th>
  )
}

/** Bảng chỉ tiêu đúng cấu trúc tiêu đề nhiều tầng của Biểu 10a/10b (dùng riêng trong chế độ Xem biểu mẫu). */
function OfficialIndicatorTable({ rows, total, showGhiChu, nameColLabel, groupLabels }: {
  rows: Tt17Row[]; total?: Tt17Row; showGhiChu: boolean; nameColLabel?: string
  groupLabels?: Record<string, string>
}) {
  const unit18 = showGhiChu ? "Đồng" : "Nghìn đồng"
  const tree = indicatorTree(unit18, showGhiChu)
  const depth = Math.max(...tree.map(treeDepth))
  const acc: HNode[][] = []
  headerRows(tree, 0, acc)
  const leafCodes = tree.flatMap((n) => flattenLeaves(n))
  let lastGroup: string | undefined

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1500px] border-collapse text-[12px]">
        <thead>
          {nameColLabel !== undefined && (
            <tr><th rowSpan={depth} className="w-[200px] border border-border bg-neutral-50 px-2 py-1.5 text-left align-bottom text-[11px] font-semibold text-neutral-800">{nameColLabel || "Đơn vị"}</th>
              {acc[0].map((n, i) => <HCell key={i} node={n} totalDepth={depth} />)}
            </tr>
          )}
          {nameColLabel === undefined && <tr>{acc[0].map((n, i) => <HCell key={i} node={n} totalDepth={depth} first={i === 0} />)}</tr>}
          {acc.slice(1).map((row, ri) => <tr key={ri}>{row.map((n, i) => <HCell key={i} node={n} totalDepth={depth} />)}</tr>)}
        </thead>
        <tbody>
          {total && (
            <tr className="bg-amber-50/60 font-semibold">
              <td className="border border-border px-2.5 py-2 text-neutral-800">{total.label}</td>
              {leafCodes.map((code) => <td key={code} className="border border-border px-2.5 py-2 text-right tabular-nums text-neutral-800">{cellValue(total, code)}</td>)}
            </tr>
          )}
          {rows.map((r) => {
            const groupHeader = r.group && r.group !== lastGroup ? r.group : undefined
            lastGroup = r.group
            return (
              <Fragment key={r.key}>
                {groupHeader && groupLabels && (
                  <tr><td colSpan={leafCodes.length + 1} className="border border-border bg-neutral-50 px-2.5 py-1.5 text-[11.5px] font-bold text-neutral-800">{groupLabels[groupHeader]}</td></tr>
                )}
                <tr>
                  <td className={cn("border border-border px-2.5 py-2 text-neutral-800", r.group && "pl-6")}>{r.label}</td>
                  {leafCodes.map((code) => <td key={code} className="border border-border px-2.5 py-2 text-right tabular-nums text-neutral-700">{cellValue(r, code)}</td>)}
                </tr>
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
function flattenLeaves(n: HNode): string[] { return n.children ? n.children.flatMap(flattenLeaves) : [n.code!] }

/* ============================ XEM BIỂU MẪU (Biểu 10a/10b chính thức) ============================ */
export function Tt17FormPreview({ variant, bieuSoLabel, unitReport, unitReceive, rows, total, nameColLabel, periodLabel, dateRangeLabel, groupLabels, ghiChuNote }: {
  variant: "10a" | "10b"; unitReport: string; unitReceive: string; rows: Tt17Row[]; total?: Tt17Row
  /** Nhãn dòng "Biểu số:" — mặc định "10a/TP/CC" hoặc "10b/TP/CC"; cấp Bộ phạm vi Toàn quốc dùng nhãn riêng (không ghi "Biểu 10b/TP/CC của Bộ"). */
  bieuSoLabel?: string
  /** Nhãn cột tên đơn vị bên trái (chỉ Biểu 10b có cột này; 10a để undefined). */
  nameColLabel?: string
  periodLabel: string; dateRangeLabel: string
  groupLabels?: Record<string, string>
  ghiChuNote?: string
}) {
  const [zoom, setZoom] = useState(100)
  const is10a = variant === "10a"
  const title = is10a
    ? "TỔ CHỨC VÀ KẾT QUẢ HOẠT ĐỘNG CỦA TỔ CHỨC HÀNH NGHỀ CÔNG CHỨNG"
    : "SỐ TỔ CHỨC VÀ KẾT QUẢ HOẠT ĐỘNG CÔNG CHỨNG TRÊN ĐỊA BÀN TỈNH/THÀNH PHỐ"

  return (
    <div className="rounded-[14px] border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="text-[12.5px] font-medium text-foreground-muted">Xem trước biểu mẫu — khớp cấu trúc Biểu {is10a ? "10a/TP/CC" : "10b/TP/CC"} theo Thông tư 17/2025/TT-BTP</span>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon" className="size-7" disabled={zoom <= 50} onClick={() => setZoom((z) => Math.max(50, z - 10))}><Minus className="size-3.5" /></Button>
          <button onClick={() => setZoom(100)} className="w-12 text-center text-[12px] font-medium text-foreground hover:underline">{zoom}%</button>
          <Button variant="outline" size="icon" className="size-7" disabled={zoom >= 200} onClick={() => setZoom((z) => Math.min(200, z + 10))}><Plus className="size-3.5" /></Button>
          <Button variant="ghost" size="icon" className="size-7" onClick={() => setZoom(100)}><RotateCcw className="size-3.5" /></Button>
        </div>
      </div>
      <div className="overflow-auto p-6" style={{ maxHeight: 720 }}>
        <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top left", width: zoom !== 100 ? `${10000 / zoom}%` : undefined }}>
          <div className="mx-auto max-w-[1560px] rounded-md border border-border bg-white p-8 text-[12.5px] text-neutral-900">
            {/* Khối thông tin đầu biểu — 3 cột, khớp A1:R6 / A1:T6 file gốc */}
            <div className="grid grid-cols-3 gap-4 text-[11.5px] leading-snug">
              <div>
                <div className="font-semibold">{bieuSoLabel ? bieuSoLabel : `Biểu số: ${is10a ? "10a/TP/CC" : "10b/TP/CC"}`}</div>
                <div className="text-neutral-600">Ban hành theo Thông tư số 17/2025/TT-BTP</div>
                <div className="mt-2 text-neutral-600">Ngày nhận báo cáo (BC):</div>
                <div className="text-neutral-600">BC 6 tháng: ngày {is10a ? "10" : "20"} tháng 6 năm báo cáo</div>
                <div className="text-neutral-600">BC sơ bộ năm: ngày {is10a ? "10" : "20"} tháng 11 năm báo cáo</div>
                <div className="text-neutral-600">BC tròn năm: ngày {is10a ? "10" : "20"} tháng 01 năm sau</div>
              </div>
              <div className="text-center">
                <div className="text-[14.5px] font-bold uppercase leading-snug">{title}</div>
                <div className="mt-1 text-neutral-600">(Sơ bộ 6 tháng/sơ bộ năm/tròn năm)</div>
                <div className="mt-1 font-medium">Kỳ báo cáo: {periodLabel}</div>
                <div className="text-neutral-600">({dateRangeLabel})</div>
              </div>
              <div>
                <div>Đơn vị báo cáo:</div>
                <div className="font-semibold">{unitReport}</div>
                <div className="mt-2">Đơn vị nhận báo cáo:</div>
                <div className="font-semibold">{unitReceive}</div>
              </div>
            </div>

            <div className="mt-5">
              <OfficialIndicatorTable rows={rows} total={total} showGhiChu={!is10a} nameColLabel={nameColLabel} groupLabels={groupLabels} />
            </div>

            <div className="mt-4 text-[11.5px] leading-relaxed text-neutral-700">
              <div className="font-semibold">* Ghi chú:</div>
              {is10a ? (
                <div>{ghiChuNote || "—"}</div>
              ) : (
                <ul className="list-disc space-y-0.5 pl-5">
                  <li>Các phòng công chứng, văn phòng công chứng báo cáo từ cột (2) đến cột (15); các Sở Tư pháp báo cáo tất cả các cột trong biểu này;</li>
                  <li>Số liệu ước tính: 01 tháng đối với báo cáo 6 tháng; 02 tháng đối với báo cáo năm;</li>
                  <li>{ghiChuNote || "Số liệu trong báo cáo này được tổng hợp từ báo cáo của các tổ chức hành nghề công chứng trực thuộc."}</li>
                </ul>
              )}
            </div>

            {/* Vùng ký xác nhận */}
            <div className={cn("mt-10 grid gap-6 text-center text-[12px]", is10a ? "grid-cols-2" : "grid-cols-3")}>
              <div />
              {!is10a && <div />}
              <div className="italic text-neutral-500">…, {todayLongVN()}</div>
            </div>
            <div className={cn("mt-1 grid gap-6 text-center text-[12px]", is10a ? "grid-cols-2" : "grid-cols-3")}>
              <div>
                <div className="font-semibold">Người lập biểu</div>
                <div className="mt-8 italic text-neutral-500">(Ký, ghi rõ họ, tên)</div>
              </div>
              {!is10a && (
                <div>
                  <div className="font-semibold">Người kiểm tra</div>
                  <div className="mt-8 italic text-neutral-500">(Ký, ghi rõ họ, tên, chức vụ)</div>
                </div>
              )}
              <div>
                <div className="font-semibold">{is10a ? "NGƯỜI ĐẠI DIỆN THEO PHÁP LUẬT" : unitReport.startsWith("Bộ") ? "LÃNH ĐẠO BỘ TƯ PHÁP" : "GIÁM ĐỐC"}</div>
                <div className="mt-8 italic text-neutral-500">{is10a ? "(Ký, đóng dấu, ghi rõ họ, tên)" : "(Ký tên, đóng dấu)"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
