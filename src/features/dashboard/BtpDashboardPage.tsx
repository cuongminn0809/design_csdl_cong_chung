import { useMemo, useState } from "react"
import { AlertTriangle, Building2, FileText, Settings2, ShieldAlert, Users } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { inputCls } from "../ingestion/shared"
import {
  AccessGate, ChartCard, DashboardHeader, F, HorizontalBarOrTable, LineOrArea, LineOrStackedBar, PALETTE, PieOrBar, StatCard, useToggle,
  type ProvinceDist,
} from "./components"
import {
  CCV_RECORDS, DEFAULT_FILTER, DON_VI_KHAITHAC, GDCC_RECORDS, KHAITHAC_RECORDS, LOAI_DU_LIEU_KHAITHAC, LOAI_GD_LIST, LOAI_TAISAN_LIST,
  NGANCHAN_RECORDS, PERIOD_KINDS, PROVINCES_34, QUARTERS, MONTHS, TCHNCC_RECORDS, YEAR_OPTIONS,
  buildBuckets, countInRange, exportMsg, fmtVN, inRange, resolveRange, scopeByProvince, sumByBucket, sumByBucketSeries, validateFilter,
  type DashboardRole, type FilterState,
} from "./config"

export function BtpDashboardPage() {
  const showToast = useToast()
  const [role, setRole] = useState<DashboardRole>("ld_btp")
  const [draft, setDraft] = useState<FilterState>(DEFAULT_FILTER)
  const [applied, setApplied] = useState<FilterState>(DEFAULT_FILTER)
  const [error, setError] = useState("")

  const doApply = () => {
    const err = validateFilter(draft)
    if (err) return setError(err)
    setError("")
    setApplied(draft)
  }
  const doExport = (name: string) => { const r = exportMsg(1); showToast(`${r.msg} (${name})`, r.kind) }

  const range = useMemo(() => resolveRange(applied), [applied])
  const buckets = useMemo(() => buildBuckets(applied), [applied])

  const gdcc = useMemo(() => scopeByProvince(GDCC_RECORDS, applied.province), [applied.province])
  const tchncc = useMemo(() => scopeByProvince(TCHNCC_RECORDS, applied.province), [applied.province])
  const ccv = useMemo(() => scopeByProvince(CCV_RECORDS, applied.province), [applied.province])
  const nganchan = useMemo(() => scopeByProvince(NGANCHAN_RECORDS, applied.province), [applied.province])
  const khaithac = useMemo(() => KHAITHAC_RECORDS, [])

  const gdccHieuLuc = useMemo(() => gdcc.filter((r) => r.trangThai === "Có hiệu lực"), [gdcc])

  // C01–C05
  const c01 = countInRange(tchncc.filter((r) => r.trangThai === "Đang hoạt động"), (r) => r.ngayThanhLap, range.from, range.to)
  const c02 = countInRange(ccv.filter((r) => r.trangThai === "Đang hành nghề"), (r) => r.ngayCapCC, range.from, range.to)
  const c03 = countInRange(gdccHieuLuc, (r) => r.ngayCC, range.from, range.to)
  const c04 = countInRange(nganchan.filter((r) => r.loai === "Thông tin ngăn chặn" && r.trangThai === "Đã duyệt"), (r) => r.ngay, range.from, range.to)
  const c05 = countInRange(nganchan.filter((r) => r.loai === "Cảnh báo rủi ro" && r.trangThai === "Đã duyệt"), (r) => r.ngay, range.from, range.to)

  // B01: phương thức GDCC
  const b01Rows = useMemo(() => gdccHieuLuc.filter((r) => inRange(r.ngayCC, range.from, range.to)), [gdccHieuLuc, range])
  const b01 = useToggle<"pie" | "bar">("pie", "bar")
  const b01Data = [
    { label: "Công chứng giấy", value: b01Rows.filter((r) => r.phuongThuc === "Công chứng giấy").length, color: PALETTE[0] },
    { label: "CC điện tử trực tuyến", value: b01Rows.filter((r) => r.phuongThuc === "CCĐT trực tuyến").length, color: PALETTE[1] },
    { label: "CC điện tử trực tiếp", value: b01Rows.filter((r) => r.phuongThuc === "CCĐT trực tiếp").length, color: PALETTE[2] },
  ]

  // B02: GDCC điện tử theo thời gian
  const b02 = useToggle<"area" | "line">("area", "line")
  const b02Series = [
    { name: "CC điện tử trực tuyến", color: PALETTE[1], data: sumByBucket(gdccHieuLuc.filter((r) => r.phuongThuc === "CCĐT trực tuyến"), (r) => r.ngayCC, buckets) },
    { name: "CC điện tử trực tiếp", color: PALETTE[2], data: sumByBucket(gdccHieuLuc.filter((r) => r.phuongThuc === "CCĐT trực tiếp"), (r) => r.ngayCC, buckets) },
  ]

  // B03: khai thác dữ liệu theo loại
  const b03 = useToggle<"bar" | "pie">("bar", "pie")
  const b03Data = LOAI_DU_LIEU_KHAITHAC.map((l, i) => ({ label: l, value: countInRange(khaithac.filter((r) => r.loaiDuLieu === l), (r) => r.ngay, range.from, range.to), color: PALETTE[i % PALETTE.length] }))

  // B07: xu hướng khai thác theo đơn vị
  const b07 = useToggle<"line" | "area">("line", "area")
  const b07Series = sumByBucketSeries(khaithac, (r) => r.ngay, (r) => r.donVi, DON_VI_KHAITHAC, buckets).map((s, i) => ({ ...s, color: PALETTE[i % PALETTE.length] }))

  // B08: xu hướng giao dịch theo thời gian
  const b08 = useToggle<"line" | "area">("line", "area")
  const b08Series = [{ name: "Tổng GDCC", color: PALETTE[0], data: sumByBucket(gdccHieuLuc, (r) => r.ngayCC, buckets) }]

  // B09: xu hướng giao dịch theo loại giao dịch
  const b09 = useToggle<"line" | "stackedBar">("line", "stackedBar")
  const b09Series = sumByBucketSeries(gdccHieuLuc, (r) => r.ngayCC, (r) => r.loaiGD, LOAI_GD_LIST, buckets).map((s, i) => ({ ...s, color: PALETTE[i % PALETTE.length] }))

  // B10: xu hướng ngăn chặn theo loại tài sản
  const b10 = useToggle<"line" | "stackedBar">("line", "stackedBar")
  const b10Series = sumByBucketSeries(nganchan.filter((r) => r.loai === "Thông tin ngăn chặn"), (r) => r.ngay, (r) => r.loaiTaiSan, LOAI_TAISAN_LIST, buckets).map((s, i) => ({ ...s, color: PALETTE[i % PALETTE.length] }))

  // B11: GDCC bị hủy
  const b11 = useToggle<"line" | "area">("line", "area")
  const b11Series = [{ name: "GDCC đã hủy", color: PALETTE[3], data: sumByBucket(gdcc.filter((r) => r.trangThai === "Đã hủy"), (r) => r.ngayCC, buckets) }]

  // B12: GDCC bị tuyên vô hiệu
  const b12 = useToggle<"line" | "area">("line", "area")
  const b12Series = [{ name: "GDCC vô hiệu", color: PALETTE[4], data: sumByBucket(gdcc.filter((r) => r.trangThai === "Vô hiệu"), (r) => r.ngayCC, buckets) }]

  // B13: phân bố GDCC theo địa phương
  const b13 = useToggle<"bar" | "table">("bar", "table")
  const b13Data: ProvinceDist[] = useMemo(() => {
    const rows = gdccHieuLuc.filter((r) => inRange(r.ngayCC, range.from, range.to))
    return PROVINCES_34.map((tinh) => {
      const rs = rows.filter((r) => r.tinh === tinh)
      const dienTu = rs.filter((r) => r.phuongThuc !== "Công chứng giấy").length
      const giay = rs.filter((r) => r.phuongThuc === "Công chứng giấy").length
      return { tinh, dienTu, giay, total: dienTu + giay }
    }).sort((a, b) => b.total - a.total)
  }, [gdccHieuLuc, range])

  return (
    <div className="space-y-4">
      <DashboardHeader role={role} onRole={setRole}
        actions={<>
          <Button variant="outline" size="sm" onClick={() => showToast("Đang mở màn hình cấu hình hiển thị Dashboard…")}><Settings2 className="size-4" />Cấu hình</Button>
          <Button variant="outline" size="sm" onClick={() => showToast("Đang mở dialog kết xuất báo cáo Dashboard…")}>Kết xuất báo cáo</Button>
        </>} />
      <AccessGate role={role}>
        <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
          <div className="mb-1 text-[13px] font-semibold text-foreground-strong">Bộ lọc</div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <F label="Năm" required>
              <NativeSelect value={String(draft.year)} onChange={(e) => { const v = e.target.value; setDraft((d) => ({ ...d, year: v === "custom" ? "custom" : Number(v) })); setError("") }}>
                {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
                <option value="custom">Tùy chọn</option>
              </NativeSelect>
            </F>
            {draft.year !== "custom" && (
              <F label="Loại kỳ" required>
                <NativeSelect value={draft.kind} onChange={(e) => setDraft((d) => ({ ...d, kind: e.target.value as FilterState["kind"] }))}>
                  {PERIOD_KINDS.map((k) => <option key={k.key} value={k.key}>{k.label}</option>)}
                </NativeSelect>
              </F>
            )}
            {draft.year !== "custom" && draft.kind === "theo-quy" && (
              <F label="Chọn quý" required>
                <NativeSelect value={draft.quarter} onChange={(e) => setDraft((d) => ({ ...d, quarter: Number(e.target.value) }))}>
                  {QUARTERS.map((q) => <option key={q.key} value={q.key}>{q.label}</option>)}
                </NativeSelect>
              </F>
            )}
            {draft.year !== "custom" && draft.kind === "theo-thang" && (
              <F label="Chọn tháng" required>
                <NativeSelect value={draft.month} onChange={(e) => setDraft((d) => ({ ...d, month: Number(e.target.value) }))}>
                  {MONTHS.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
                </NativeSelect>
              </F>
            )}
            {draft.year === "custom" && (
              <>
                <F label="Từ ngày" required><input type="date" value={draft.tuNgay} onChange={(e) => { setDraft((d) => ({ ...d, tuNgay: e.target.value })); setError("") }} className={cn(inputCls, "text-[13.5px]")} /></F>
                <F label="Đến ngày" required><input type="date" value={draft.denNgay} onChange={(e) => { setDraft((d) => ({ ...d, denNgay: e.target.value })); setError("") }} className={cn(inputCls, "text-[13.5px]")} /></F>
              </>
            )}
            <F label="Phạm vi Tỉnh/Thành phố" required>
              <NativeSelect value={draft.province} onChange={(e) => setDraft((d) => ({ ...d, province: e.target.value }))}>
                <option value="Toàn quốc">Toàn quốc</option>
                {PROVINCES_34.map((p) => <option key={p} value={p}>{p}</option>)}
              </NativeSelect>
            </F>
          </div>
          {error && <div className="mt-3 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]">{error}</div>}
          <div className="mt-4"><Button onClick={doApply}>Áp dụng</Button></div>
          <div className="mt-3 text-[11.5px] text-foreground-subtle">* Phát sinh trong kỳ: {fmtVN(range.from)} – {fmtVN(range.to)} (D-2)</div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Tổ chức HNCC" value={c01} icon={<Building2 className="size-5" />} />
          <StatCard label="Công chứng viên" value={c02} color="#7c3aed" bg="#f5f3ff" icon={<Users className="size-5" />} />
          <StatCard label="Giao dịch công chứng" value={c03} color="#047857" bg="#ecfdf5" icon={<FileText className="size-5" />} />
          <StatCard label="Thông tin ngăn chặn" value={c04} color="#b45309" bg="#fffbeb" icon={<ShieldAlert className="size-5" />} />
          <StatCard label="Cảnh báo rủi ro" value={c05} color="#b91c1c" bg="#fef2f2" icon={<AlertTriangle className="size-5" />} />
        </div>

        <ChartCard title="Phương thức giao dịch công chứng (B01)" onExport={() => doExport("PhuongThucGDCC")} onToggle={b01.toggle} toggleLabel={b01.mode === "pie" ? "Xem dạng cột" : "Xem dạng tròn"}>
          <PieOrBar data={b01Data} mode={b01.mode} />
        </ChartCard>

        <ChartCard title="Thống kê giao dịch công chứng điện tử (B02)" onExport={() => doExport("GDCCDienTu")} onToggle={b02.toggle} toggleLabel={b02.mode === "area" ? "Xem dạng đường" : "Xem dạng vùng"}
          legend={b02Series.map((s) => <span key={s.name} className="flex items-center gap-1.5"><span className="size-2.5 rounded-full" style={{ background: s.color }} />{s.name}</span>)}>
          <LineOrArea categories={buckets.map((b) => b.label)} series={b02Series} mode={b02.mode} yLabel="Số lượng GDCC điện tử" />
        </ChartCard>

        <ChartCard title="Tình hình khai thác dữ liệu theo loại dữ liệu (B03)" onExport={() => doExport("KhaiThacTheoLoai")} onToggle={b03.toggle} toggleLabel={b03.mode === "bar" ? "Xem dạng tròn" : "Xem dạng cột"}>
          <PieOrBar data={b03Data} mode={b03.mode === "bar" ? "bar" : "pie"} />
        </ChartCard>

        <ChartCard title="Phân bố giao dịch công chứng theo địa phương (B13)" onExport={() => doExport("PhanBoDiaPhuong")} onToggle={b13.toggle} toggleLabel={b13.mode === "bar" ? "Xem bảng dữ liệu" : "Xem biểu đồ"}>
          <HorizontalBarOrTable data={b13Data} mode={b13.mode} />
        </ChartCard>

        <ChartCard title="Xu hướng khai thác dữ liệu theo đơn vị (B07)" onExport={() => doExport("XuHuongKhaiThacDonVi")} onToggle={b07.toggle} toggleLabel={b07.mode === "line" ? "Xem dạng vùng" : "Xem dạng đường"}
          legend={b07Series.map((s) => <span key={s.name} className="flex items-center gap-1.5"><span className="size-2.5 rounded-full" style={{ background: s.color }} />{s.name}</span>)}>
          <LineOrArea categories={buckets.map((b) => b.label)} series={b07Series} mode={b07.mode} yLabel="Số lượt khai thác" />
        </ChartCard>

        <ChartCard title="Xu hướng giao dịch theo thời gian (B08)" onExport={() => doExport("XuHuongGiaoDich")} onToggle={b08.toggle} toggleLabel={b08.mode === "line" ? "Xem dạng vùng" : "Xem dạng đường"}>
          <LineOrArea categories={buckets.map((b) => b.label)} series={b08Series} mode={b08.mode} yLabel="Tổng số GDCC" />
        </ChartCard>

        <ChartCard title="Xu hướng giao dịch theo loại giao dịch (B09)" onExport={() => doExport("XuHuongTheoLoaiGD")} onToggle={b09.toggle} toggleLabel={b09.mode === "line" ? "Xem cột xếp chồng" : "Xem dạng đường"}
          legend={b09Series.map((s) => <span key={s.name} className="flex items-center gap-1.5"><span className="size-2.5 rounded-full" style={{ background: s.color }} />{s.name}</span>)}>
          <LineOrStackedBar categories={buckets.map((b) => b.label)} series={b09Series} mode={b09.mode} yLabel="Số lượng GDCC" />
        </ChartCard>

        <ChartCard title="Xu hướng ngăn chặn theo loại tài sản (B10)" onExport={() => doExport("XuHuongNganChan")} onToggle={b10.toggle} toggleLabel={b10.mode === "line" ? "Xem cột xếp chồng" : "Xem dạng đường"}
          legend={b10Series.map((s) => <span key={s.name} className="flex items-center gap-1.5"><span className="size-2.5 rounded-full" style={{ background: s.color }} />{s.name}</span>)}>
          <LineOrStackedBar categories={buckets.map((b) => b.label)} series={b10Series} mode={b10.mode} yLabel="Số lượng ngăn chặn" />
        </ChartCard>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <ChartCard title="Xu hướng giao dịch bị hủy (B11)" onExport={() => doExport("XuHuongBiHuy")} onToggle={b11.toggle} toggleLabel={b11.mode === "line" ? "Xem dạng vùng" : "Xem dạng đường"}>
            <LineOrArea categories={buckets.map((b) => b.label)} series={b11Series} mode={b11.mode} yLabel="Số lượng GDCC bị hủy" width={400} />
          </ChartCard>
          <ChartCard title="Xu hướng giao dịch bị tuyên vô hiệu (B12)" onExport={() => doExport("XuHuongVoHieu")} onToggle={b12.toggle} toggleLabel={b12.mode === "line" ? "Xem dạng vùng" : "Xem dạng đường"}>
            <LineOrArea categories={buckets.map((b) => b.label)} series={b12Series} mode={b12.mode} yLabel="Số lượng GDCC bị tuyên vô hiệu" width={400} />
          </ChartCard>
        </div>
      </AccessGate>
    </div>
  )
}
