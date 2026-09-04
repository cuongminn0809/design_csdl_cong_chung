import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, Archive, Building2, FileText, MapPin, Settings2, ShieldAlert, Users } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { inputCls } from "../ingestion/shared"
import {
  AccessGate, ChartCard, ConfigPanel, DashboardHeader, ExportDialog, F, HorizontalBarOrTable, LineOrArea, LineOrStackedBar, PALETTE, PieOrBar, StatCard, WidgetGrid, useToggle,
  type ProvinceDist, type WidgetMeta,
} from "./components"
import {
  CCV_RECORDS, DEFAULT_FILTER, DON_VI_KHAITHAC, GDCC_RECORDS, KHAITHAC_RECORDS, LOAI_DU_LIEU_KHAITHAC, LOAI_GD_LIST, LOAI_TAISAN_LIST, LUUTRU_RECORDS,
  NGANCHAN_RECORDS, PERIOD_KINDS, PROVINCES_34, QUARTERS, MONTHS, STP_PROVINCE, TCHNCC_HOME_ORG, TCHNCC_RECORDS, YEAR_OPTIONS, YEUCAUKT_RECORDS,
  buildBuckets, clearWidgetConfigs, countInRange, dashboardTypeOf, exportMsg, exportReportFileName, fmtVN, inRange, isBoRole, isTchnccRole,
  loadWidgetConfigs, resolveExportRange, resolveRange, saveWidgetConfigs, scopeByOrg, scopeByProvince, sumByBucket, sumByBucketSeries, validateExportFilter, validateFilter, validateWidgetName,
  type DashboardRole, type ExportFilterState, type FilterState, type WidgetConfig, type WidgetWidth,
} from "./config"

// BR-07/8.3: chiều rộng widget → viewBox biểu đồ đường (px) để chữ/số scale hợp lý theo độ rộng thực tế.
const chartPxWidth = (w: WidgetWidth) => (w === "30" ? 280 : w === "50" ? 420 : 760)

interface WidgetDef { id: string; group: "card" | "chart"; defaultTitle: string; defaultWidth: WidgetWidth; render: (title: string, width: WidgetWidth) => React.ReactNode }

export function DashboardPage() {
  const showToast = useToast()
  const [role, setRole] = useState<DashboardRole>("ld_btp")
  const bo = isBoRole(role)
  const tchncc = isTchnccRole(role)
  const dashboardType = dashboardTypeOf(role)
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
  const scopeProvince = bo ? applied.province : STP_PROVINCE

  // BR-09: TCHNCC scope theo tổ chức cố định (toChuc); BTP/STP scope theo tỉnh/thành.
  const gdcc = useMemo(() => tchncc ? scopeByOrg(GDCC_RECORDS, TCHNCC_HOME_ORG) : scopeByProvince(GDCC_RECORDS, scopeProvince), [tchncc, scopeProvince])
  const tchnccOrgs = useMemo(() => scopeByProvince(TCHNCC_RECORDS, scopeProvince), [scopeProvince])
  const ccv = useMemo(() => scopeByProvince(CCV_RECORDS, scopeProvince), [scopeProvince])
  const nganchan = useMemo(() => scopeByProvince(NGANCHAN_RECORDS, scopeProvince), [scopeProvince])
  const gdccHieuLuc = useMemo(() => gdcc.filter((r) => r.trangThai === "Có hiệu lực"), [gdcc])
  // BR-08: lượt khai thác — STP chỉ tính đơn vị Sở Tư pháp của mình, TCHNCC chỉ tính lượt do tổ chức mình thực hiện, BTP tính toàn quốc.
  const khaithac = useMemo(() => {
    if (bo) return KHAITHAC_RECORDS
    if (tchncc) return KHAITHAC_RECORDS.filter((r) => r.donVi === "TCHNCC")
    return KHAITHAC_RECORDS.filter((r) => r.donVi === `Sở Tư pháp ${STP_PROVINCE}`)
  }, [bo, tchncc])

  // C01–C05 (BTP/STP) — dùng chung, chỉ khác phạm vi địa bàn.
  const c01 = countInRange(tchnccOrgs.filter((r) => r.trangThai === "Đang hoạt động"), (r) => r.ngayThanhLap, range.from, range.to)
  const c02 = countInRange(ccv.filter((r) => r.trangThai === "Đang hành nghề"), (r) => r.ngayCapCC, range.from, range.to)
  const c03 = countInRange(gdccHieuLuc, (r) => r.ngayCC, range.from, range.to)
  const c04 = countInRange(nganchan.filter((r) => r.loai === "Thông tin ngăn chặn" && r.trangThai === "Đã duyệt"), (r) => r.ngay, range.from, range.to)
  const c05 = countInRange(nganchan.filter((r) => r.loai === "Cảnh báo rủi ro" && r.trangThai === "Đã duyệt"), (r) => r.ngay, range.from, range.to)

  // C01–C03 (TCHNCC, A.7.3) — Hồ sơ công chứng (mọi trạng thái), VBCC điện tử, Hồ sơ lưu trữ điện tử.
  const luutru = useMemo(() => scopeByOrg(LUUTRU_RECORDS, TCHNCC_HOME_ORG), [])
  const c01Tchncc = countInRange(gdcc, (r) => r.ngayCC, range.from, range.to)
  const c02Tchncc = countInRange(gdcc.filter((r) => r.phuongThuc !== "Công chứng giấy"), (r) => r.ngayCC, range.from, range.to)
  const c03Tchncc = countInRange(luutru, (r) => r.ngay, range.from, range.to)

  // B01 (TCHNCC, A.7.3): đối soát tra cứu — tần suất lượt tra cứu do tổ chức thực hiện theo thời gian.
  const bDoiSoat = useToggle<"line" | "area">("line", "area")
  const doiSoatSeries = [{ name: "Lượt tra cứu", color: PALETTE[0], data: sumByBucket(khaithac, (r) => r.ngay, buckets) }]

  // B07 (TCHNCC, A.7.3): yêu cầu khai thác chi tiết GDCC — 2 series nhận/gửi.
  const bYeuCauKt = useToggle<"line" | "area">("line", "area")
  const yeuCauKtSeries = [
    { name: "YC khai thác nhận (từ TCHNCC khác)", color: PALETTE[1], data: sumByBucket(YEUCAUKT_RECORDS.filter((r) => r.denToChuc === TCHNCC_HOME_ORG), (r) => r.ngay, buckets) },
    { name: "YC khai thác gửi (đến TCHNCC khác)", color: PALETTE[2], data: sumByBucket(YEUCAUKT_RECORDS.filter((r) => r.tuToChuc === TCHNCC_HOME_ORG), (r) => r.ngay, buckets) },
  ]

  // B01 (dùng chung): phương thức GDCC
  const b01Rows = useMemo(() => gdccHieuLuc.filter((r) => inRange(r.ngayCC, range.from, range.to)), [gdccHieuLuc, range])
  const b01 = useToggle<"pie" | "bar">("pie", "bar")
  const b01Data = [
    { label: "Công chứng giấy", value: b01Rows.filter((r) => r.phuongThuc === "Công chứng giấy").length, color: PALETTE[0] },
    { label: "CC điện tử trực tuyến", value: b01Rows.filter((r) => r.phuongThuc === "CCĐT trực tuyến").length, color: PALETTE[1] },
    { label: "CC điện tử trực tiếp", value: b01Rows.filter((r) => r.phuongThuc === "CCĐT trực tiếp").length, color: PALETTE[2] },
  ]

  // B02 (dùng chung): GDCC điện tử theo thời gian
  const b02 = useToggle<"area" | "line">("area", "line")
  const b02Series = [
    { name: "CC điện tử trực tuyến", color: PALETTE[1], data: sumByBucket(gdccHieuLuc.filter((r) => r.phuongThuc === "CCĐT trực tuyến"), (r) => r.ngayCC, buckets) },
    { name: "CC điện tử trực tiếp", color: PALETTE[2], data: sumByBucket(gdccHieuLuc.filter((r) => r.phuongThuc === "CCĐT trực tiếp"), (r) => r.ngayCC, buckets) },
  ]

  // Khai thác dữ liệu theo loại — scope theo `khaithac` đã tính ở trên.
  const bKhaiThac = useToggle<"bar" | "pie">("bar", "pie")
  const khaiThacData = LOAI_DU_LIEU_KHAITHAC.map((l, i) => ({ label: l, value: countInRange(khaithac.filter((r) => r.loaiDuLieu === l), (r) => r.ngay, range.from, range.to), color: PALETTE[i % PALETTE.length] }))

  // GDCC giấy theo thời gian — dùng ở STP/TCHNCC.
  const bGiay = useToggle<"area" | "line">("area", "line")
  const giaySeries = [{ name: "Công chứng giấy", color: PALETTE[0], data: sumByBucket(gdccHieuLuc.filter((r) => r.phuongThuc === "Công chứng giấy"), (r) => r.ngayCC, buckets) }]

  // BTP-only: xu hướng khai thác theo đơn vị (B07)
  const b07 = useToggle<"line" | "area">("line", "area")
  const b07Series = sumByBucketSeries(KHAITHAC_RECORDS, (r) => r.ngay, (r) => r.donVi, DON_VI_KHAITHAC, buckets).map((s, i) => ({ ...s, color: PALETTE[i % PALETTE.length] }))

  // BTP-only: xu hướng giao dịch theo thời gian (B08)
  const b08 = useToggle<"line" | "area">("line", "area")
  const b08Series = [{ name: "Tổng GDCC", color: PALETTE[0], data: sumByBucket(gdccHieuLuc, (r) => r.ngayCC, buckets) }]

  // BTP-only: xu hướng giao dịch theo loại giao dịch (B09)
  const b09 = useToggle<"line" | "stackedBar">("line", "stackedBar")
  const b09Series = sumByBucketSeries(gdccHieuLuc, (r) => r.ngayCC, (r) => r.loaiGD, LOAI_GD_LIST, buckets).map((s, i) => ({ ...s, color: PALETTE[i % PALETTE.length] }))

  // BTP-only: xu hướng ngăn chặn theo loại tài sản (B10)
  const b10 = useToggle<"line" | "stackedBar">("line", "stackedBar")
  const b10Series = sumByBucketSeries(nganchan.filter((r) => r.loai === "Thông tin ngăn chặn"), (r) => r.ngay, (r) => r.loaiTaiSan, LOAI_TAISAN_LIST, buckets).map((s, i) => ({ ...s, color: PALETTE[i % PALETTE.length] }))

  // GDCC bị hủy / bị tuyên vô hiệu — cùng công thức, khác phạm vi đã scope ở `gdcc`.
  const bHuy = useToggle<"line" | "area">("line", "area")
  const huySeries = [{ name: "GDCC đã hủy", color: PALETTE[3], data: sumByBucket(gdcc.filter((r) => r.trangThai === "Đã hủy"), (r) => r.ngayCC, buckets) }]
  const bVoHieu = useToggle<"line" | "area">("line", "area")
  const voHieuSeries = [{ name: "GDCC vô hiệu", color: PALETTE[4], data: sumByBucket(gdcc.filter((r) => r.trangThai === "Vô hiệu"), (r) => r.ngayCC, buckets) }]

  // BTP-only: phân bố GDCC theo địa phương (B13)
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

  const legendOf = (series: { name: string; color: string }[]) => series.map((s) => <span key={s.name} className="flex items-center gap-1.5"><span className="size-2.5 rounded-full" style={{ background: s.color }} />{s.name}</span>)

  /* ============================ A.7.4: DANH SÁCH WIDGET THEO CẤP DASHBOARD ============================ */
  const widgetDefs: WidgetDef[] = useMemo(() => {
    if (tchncc) {
      return [
        { id: "tc_card_hoso", group: "card", defaultTitle: "Hồ sơ công chứng", defaultWidth: "30", render: (title) => <StatCard label={title} value={c01Tchncc} icon={<FileText className="size-5" />} /> },
        { id: "tc_card_vbccdt", group: "card", defaultTitle: "VBCC điện tử", defaultWidth: "30", render: (title) => <StatCard label={title} value={c02Tchncc} color="#7c3aed" bg="#f5f3ff" icon={<Building2 className="size-5" />} /> },
        { id: "tc_card_luutru", group: "card", defaultTitle: "Hồ sơ lưu trữ điện tử", defaultWidth: "30", render: (title) => <StatCard label={title} value={c03Tchncc} color="#047857" bg="#ecfdf5" icon={<Archive className="size-5" />} /> },
        { id: "tc_b01", group: "chart", defaultTitle: "Đối soát tra cứu thông tin (B01)", defaultWidth: "50", render: (title, w) => <ChartCard title={title} onExport={() => doExport("DoiSoatTraCuu")} onToggle={bDoiSoat.toggle} toggleLabel={bDoiSoat.mode === "line" ? "Xem dạng vùng" : "Xem dạng đường"}><LineOrArea categories={buckets.map((b) => b.label)} series={doiSoatSeries} mode={bDoiSoat.mode} yLabel="Số lượt tra cứu" width={chartPxWidth(w)} /></ChartCard> },
        { id: "tc_b02", group: "chart", defaultTitle: "Phương thức giao dịch công chứng (B02)", defaultWidth: "50", render: (title) => <ChartCard title={title} onExport={() => doExport("PhuongThucGDCC")} onToggle={b01.toggle} toggleLabel={b01.mode === "pie" ? "Xem dạng cột" : "Xem dạng tròn"}><PieOrBar data={b01Data} mode={b01.mode} /></ChartCard> },
        { id: "tc_b03", group: "chart", defaultTitle: "Thống kê giao dịch công chứng điện tử (B03)", defaultWidth: "50", render: (title, w) => <ChartCard title={title} onExport={() => doExport("GDCCDienTu")} onToggle={b02.toggle} toggleLabel={b02.mode === "area" ? "Xem dạng đường" : "Xem dạng vùng"} legend={legendOf(b02Series)}><LineOrArea categories={buckets.map((b) => b.label)} series={b02Series} mode={b02.mode} yLabel="Số lượng GDCC điện tử" width={chartPxWidth(w)} /></ChartCard> },
        { id: "tc_b04", group: "chart", defaultTitle: "Thống kê giao dịch công chứng giấy (B04)", defaultWidth: "50", render: (title, w) => <ChartCard title={title} onExport={() => doExport("GDCCGiay")} onToggle={bGiay.toggle} toggleLabel={bGiay.mode === "area" ? "Xem dạng đường" : "Xem dạng vùng"}><LineOrArea categories={buckets.map((b) => b.label)} series={giaySeries} mode={bGiay.mode} yLabel="Số lượng GDCC giấy" width={chartPxWidth(w)} /></ChartCard> },
        { id: "tc_b05", group: "chart", defaultTitle: "Tình hình khai thác dữ liệu theo loại dữ liệu (B05)", defaultWidth: "50", render: (title) => <ChartCard title={title} onExport={() => doExport("KhaiThacTheoLoai")} onToggle={bKhaiThac.toggle} toggleLabel={bKhaiThac.mode === "bar" ? "Xem dạng tròn" : "Xem dạng cột"}><PieOrBar data={khaiThacData} mode={bKhaiThac.mode} /></ChartCard> },
        { id: "tc_b06", group: "chart", defaultTitle: "Xu hướng giao dịch bị hủy (B06)", defaultWidth: "50", render: (title, w) => <ChartCard title={title} onExport={() => doExport("XuHuongBiHuy")} onToggle={bHuy.toggle} toggleLabel={bHuy.mode === "line" ? "Xem dạng vùng" : "Xem dạng đường"}><LineOrArea categories={buckets.map((b) => b.label)} series={huySeries} mode={bHuy.mode} yLabel="Số lượng GDCC bị hủy" width={chartPxWidth(w)} /></ChartCard> },
        { id: "tc_b07", group: "chart", defaultTitle: "Yêu cầu khai thác chi tiết GDCC (B07)", defaultWidth: "100", render: (title, w) => <ChartCard title={title} onExport={() => doExport("YeuCauKhaiThac")} onToggle={bYeuCauKt.toggle} toggleLabel={bYeuCauKt.mode === "line" ? "Xem dạng vùng" : "Xem dạng đường"} legend={legendOf(yeuCauKtSeries)}><LineOrArea categories={buckets.map((b) => b.label)} series={yeuCauKtSeries} mode={bYeuCauKt.mode} yLabel="Số lượng yêu cầu khai thác" width={chartPxWidth(w)} /></ChartCard> },
        { id: "tc_b08", group: "chart", defaultTitle: "Xu hướng giao dịch bị tuyên vô hiệu (B08)", defaultWidth: "50", render: (title, w) => <ChartCard title={title} onExport={() => doExport("XuHuongVoHieu")} onToggle={bVoHieu.toggle} toggleLabel={bVoHieu.mode === "line" ? "Xem dạng vùng" : "Xem dạng đường"}><LineOrArea categories={buckets.map((b) => b.label)} series={voHieuSeries} mode={bVoHieu.mode} yLabel="Số lượng GDCC bị tuyên vô hiệu" width={chartPxWidth(w)} /></ChartCard> },
      ]
    }
    const common: WidgetDef[] = [
      { id: "card_tchncc", group: "card", defaultTitle: "Tổ chức HNCC", defaultWidth: "30", render: (title) => <StatCard label={title} value={c01} icon={<Building2 className="size-5" />} /> },
      { id: "card_ccv", group: "card", defaultTitle: "Công chứng viên", defaultWidth: "30", render: (title) => <StatCard label={title} value={c02} color="#7c3aed" bg="#f5f3ff" icon={<Users className="size-5" />} /> },
      { id: "card_gdcc", group: "card", defaultTitle: "Giao dịch công chứng", defaultWidth: "30", render: (title) => <StatCard label={title} value={c03} color="#047857" bg="#ecfdf5" icon={<FileText className="size-5" />} /> },
      { id: "card_nganchan", group: "card", defaultTitle: "Thông tin ngăn chặn", defaultWidth: "30", render: (title) => <StatCard label={title} value={c04} color="#b45309" bg="#fffbeb" icon={<ShieldAlert className="size-5" />} /> },
      { id: "card_canhbao", group: "card", defaultTitle: "Cảnh báo rủi ro", defaultWidth: "30", render: (title) => <StatCard label={title} value={c05} color="#b91c1c" bg="#fef2f2" icon={<AlertTriangle className="size-5" />} /> },
      { id: "b01_phuongthuc", group: "chart", defaultTitle: `Phương thức giao dịch công chứng (B01)`, defaultWidth: "50", render: (title) => <ChartCard title={title} onExport={() => doExport("PhuongThucGDCC")} onToggle={b01.toggle} toggleLabel={b01.mode === "pie" ? "Xem dạng cột" : "Xem dạng tròn"}><PieOrBar data={b01Data} mode={b01.mode} /></ChartCard> },
      { id: "b02_dientu", group: "chart", defaultTitle: `Thống kê giao dịch công chứng điện tử (B02)`, defaultWidth: "50", render: (title, w) => <ChartCard title={title} onExport={() => doExport("GDCCDienTu")} onToggle={b02.toggle} toggleLabel={b02.mode === "area" ? "Xem dạng đường" : "Xem dạng vùng"} legend={legendOf(b02Series)}><LineOrArea categories={buckets.map((b) => b.label)} series={b02Series} mode={b02.mode} yLabel="Số lượng GDCC điện tử" width={chartPxWidth(w)} /></ChartCard> },
    ]
    if (bo) {
      return [
        ...common,
        { id: "b03_khaithac", group: "chart", defaultTitle: "Tình hình khai thác dữ liệu theo loại dữ liệu (B03)", defaultWidth: "50", render: (title) => <ChartCard title={title} onExport={() => doExport("KhaiThacTheoLoai")} onToggle={bKhaiThac.toggle} toggleLabel={bKhaiThac.mode === "bar" ? "Xem dạng tròn" : "Xem dạng cột"}><PieOrBar data={khaiThacData} mode={bKhaiThac.mode} /></ChartCard> },
        { id: "b13_phanbo", group: "chart", defaultTitle: "Phân bố giao dịch công chứng theo địa phương (B13)", defaultWidth: "50", render: (title) => <ChartCard title={title} onExport={() => doExport("PhanBoDiaPhuong")} onToggle={b13.toggle} toggleLabel={b13.mode === "bar" ? "Xem bảng dữ liệu" : "Xem biểu đồ"}><HorizontalBarOrTable data={b13Data} mode={b13.mode} /></ChartCard> },
        { id: "b07_donvi", group: "chart", defaultTitle: "Xu hướng khai thác dữ liệu theo đơn vị (B07)", defaultWidth: "100", render: (title, w) => <ChartCard title={title} onExport={() => doExport("XuHuongKhaiThacDonVi")} onToggle={b07.toggle} toggleLabel={b07.mode === "line" ? "Xem dạng vùng" : "Xem dạng đường"} legend={legendOf(b07Series)}><LineOrArea categories={buckets.map((b) => b.label)} series={b07Series} mode={b07.mode} yLabel="Số lượt khai thác" width={chartPxWidth(w)} /></ChartCard> },
        { id: "b08_xuhuonggd", group: "chart", defaultTitle: "Xu hướng giao dịch theo thời gian (B08)", defaultWidth: "100", render: (title, w) => <ChartCard title={title} onExport={() => doExport("XuHuongGiaoDich")} onToggle={b08.toggle} toggleLabel={b08.mode === "line" ? "Xem dạng vùng" : "Xem dạng đường"}><LineOrArea categories={buckets.map((b) => b.label)} series={b08Series} mode={b08.mode} yLabel="Tổng số GDCC" width={chartPxWidth(w)} /></ChartCard> },
        { id: "b09_loaigd", group: "chart", defaultTitle: "Xu hướng giao dịch theo loại giao dịch (B09)", defaultWidth: "100", render: (title) => <ChartCard title={title} onExport={() => doExport("XuHuongTheoLoaiGD")} onToggle={b09.toggle} toggleLabel={b09.mode === "line" ? "Xem cột xếp chồng" : "Xem dạng đường"} legend={legendOf(b09Series)}><LineOrStackedBar categories={buckets.map((b) => b.label)} series={b09Series} mode={b09.mode} yLabel="Số lượng GDCC" /></ChartCard> },
        { id: "b10_loaitaisan", group: "chart", defaultTitle: "Xu hướng ngăn chặn theo loại tài sản (B10)", defaultWidth: "100", render: (title) => <ChartCard title={title} onExport={() => doExport("XuHuongNganChan")} onToggle={b10.toggle} toggleLabel={b10.mode === "line" ? "Xem cột xếp chồng" : "Xem dạng đường"} legend={legendOf(b10Series)}><LineOrStackedBar categories={buckets.map((b) => b.label)} series={b10Series} mode={b10.mode} yLabel="Số lượng ngăn chặn" /></ChartCard> },
        { id: "b11_biHuy", group: "chart", defaultTitle: "Xu hướng giao dịch bị hủy (B11)", defaultWidth: "50", render: (title, w) => <ChartCard title={title} onExport={() => doExport("XuHuongBiHuy")} onToggle={bHuy.toggle} toggleLabel={bHuy.mode === "line" ? "Xem dạng vùng" : "Xem dạng đường"}><LineOrArea categories={buckets.map((b) => b.label)} series={huySeries} mode={bHuy.mode} yLabel="Số lượng GDCC bị hủy" width={chartPxWidth(w)} /></ChartCard> },
        { id: "b12_voHieu", group: "chart", defaultTitle: "Xu hướng giao dịch bị tuyên vô hiệu (B12)", defaultWidth: "50", render: (title, w) => <ChartCard title={title} onExport={() => doExport("XuHuongVoHieu")} onToggle={bVoHieu.toggle} toggleLabel={bVoHieu.mode === "line" ? "Xem dạng vùng" : "Xem dạng đường"}><LineOrArea categories={buckets.map((b) => b.label)} series={voHieuSeries} mode={bVoHieu.mode} yLabel="Số lượng GDCC bị tuyên vô hiệu" width={chartPxWidth(w)} /></ChartCard> },
      ]
    }
    return [
      ...common,
      { id: "b03_giay", group: "chart", defaultTitle: "Thống kê giao dịch công chứng giấy (B03)", defaultWidth: "50", render: (title, w) => <ChartCard title={title} onExport={() => doExport("GDCCGiay")} onToggle={bGiay.toggle} toggleLabel={bGiay.mode === "area" ? "Xem dạng đường" : "Xem dạng vùng"}><LineOrArea categories={buckets.map((b) => b.label)} series={giaySeries} mode={bGiay.mode} yLabel="Số lượng GDCC giấy" width={chartPxWidth(w)} /></ChartCard> },
      { id: "b04_khaithac", group: "chart", defaultTitle: "Tình hình khai thác dữ liệu theo loại dữ liệu (B04)", defaultWidth: "50", render: (title) => <ChartCard title={title} onExport={() => doExport("KhaiThacTheoLoai")} onToggle={bKhaiThac.toggle} toggleLabel={bKhaiThac.mode === "bar" ? "Xem dạng tròn" : "Xem dạng cột"}><PieOrBar data={khaiThacData} mode={bKhaiThac.mode} /></ChartCard> },
      { id: "b05_biHuy", group: "chart", defaultTitle: "Xu hướng giao dịch bị hủy (B05)", defaultWidth: "50", render: (title, w) => <ChartCard title={title} onExport={() => doExport("XuHuongBiHuy")} onToggle={bHuy.toggle} toggleLabel={bHuy.mode === "line" ? "Xem dạng vùng" : "Xem dạng đường"}><LineOrArea categories={buckets.map((b) => b.label)} series={huySeries} mode={bHuy.mode} yLabel="Số lượng GDCC bị hủy" width={chartPxWidth(w)} /></ChartCard> },
      { id: "b06_voHieu", group: "chart", defaultTitle: "Xu hướng giao dịch bị tuyên vô hiệu (B06)", defaultWidth: "50", render: (title, w) => <ChartCard title={title} onExport={() => doExport("XuHuongVoHieu")} onToggle={bVoHieu.toggle} toggleLabel={bVoHieu.mode === "line" ? "Xem dạng vùng" : "Xem dạng đường"}><LineOrArea categories={buckets.map((b) => b.label)} series={voHieuSeries} mode={bVoHieu.mode} yLabel="Số lượng GDCC bị tuyên vô hiệu" width={chartPxWidth(w)} /></ChartCard> },
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tchncc, bo, c01, c02, c03, c04, c05, c01Tchncc, c02Tchncc, c03Tchncc, b01Data, b02Series, khaiThacData, giaySeries, doiSoatSeries, yeuCauKtSeries, b07Series, b08Series, b09Series, b10Series, huySeries, voHieuSeries, b13Data, buckets])

  /* ============================ A.7.4: CẤU HÌNH HIỂN THỊ (BR-02/BR-03/BR-04/BR-05/BR-06/BR-07/BR-08) ============================ */
  const [configs, setConfigs] = useState<Record<string, WidgetConfig>>({})
  const [configOpen, setConfigOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [exportFilter, setExportFilter] = useState<ExportFilterState>({ preset: "Năm nay", tuNgay: "", denNgay: "", province: "Toàn quốc", format: "PDF" })

  useEffect(() => {
    const saved = loadWidgetConfigs(dashboardType)
    const next: Record<string, WidgetConfig> = {}
    widgetDefs.forEach((w, i) => { next[w.id] = saved?.[w.id] ?? { visible: true, customName: "", order: i, width: w.defaultWidth } })
    setConfigs(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardType])

  useEffect(() => {
    if (Object.keys(configs).length) saveWidgetConfigs(dashboardType, configs)
  }, [configs, dashboardType])

  const onToggleVisible = (id: string) => {
    const cur = configs[id]
    if (!cur) return
    const visibleCount = Object.values(configs).filter((c) => c.visible).length
    if (cur.visible && visibleCount <= 1) { showToast("Không thể ẩn toàn bộ widget. Vui lòng giữ ít nhất 1 widget hiển thị.", "error"); return }
    setConfigs((prev) => ({ ...prev, [id]: { ...prev[id], visible: !prev[id].visible } }))
    showToast("Đã cập nhật cấu hình.")
  }
  const onRename = (id: string, name: string): string => {
    const err = validateWidgetName(name)
    if (err) return err
    setConfigs((prev) => ({ ...prev, [id]: { ...prev[id], customName: name } }))
    showToast("Đã cập nhật cấu hình.")
    return ""
  }
  const onWidthChange = (id: string, width: WidgetWidth) => {
    setConfigs((prev) => ({ ...prev, [id]: { ...prev[id], width } }))
    showToast("Đã cập nhật cấu hình.")
  }
  const onReorder = (dragId: string, dropId: string) => {
    const ids = Object.keys(configs).sort((a, b) => configs[a].order - configs[b].order)
    const from = ids.indexOf(dragId), to = ids.indexOf(dropId)
    if (from < 0 || to < 0) return
    ids.splice(to, 0, ids.splice(from, 1)[0])
    setConfigs((prev) => {
      const next = { ...prev }
      ids.forEach((id, i) => { next[id] = { ...next[id], order: i } })
      return next
    })
    showToast("Đã cập nhật cấu hình.")
  }
  const onRestoreDefault = () => {
    clearWidgetConfigs(dashboardType)
    const next: Record<string, WidgetConfig> = {}
    widgetDefs.forEach((w, i) => { next[w.id] = { visible: true, customName: "", order: i, width: w.defaultWidth } })
    setConfigs(next)
    showToast("Đã khôi phục bố cục mặc định.")
  }

  const widgetMetas: WidgetMeta[] = widgetDefs.map((w) => ({ id: w.id, group: w.group, defaultTitle: w.defaultTitle }))
  const orderedVisible = widgetDefs
    .filter((w) => configs[w.id]?.visible ?? true)
    .sort((a, b) => (configs[a.id]?.order ?? 0) - (configs[b.id]?.order ?? 0))
  const gridItems = orderedVisible.map((w) => {
    const width = configs[w.id]?.width ?? w.defaultWidth
    return { id: w.id, width, node: w.render(configs[w.id]?.customName || w.defaultTitle, width) }
  })

  const doOpenExport = () => { setExportFilter((f) => ({ ...f, province: bo ? applied.province : "Toàn quốc" })); setExportOpen(true) }
  const doExportReport = (f: ExportFilterState) => {
    const err = validateExportFilter(f)
    if (err) return
    const r = exportMsg(gridItems.length)
    const name = exportReportFileName(dashboardType, f.format)
    showToast(r.kind === "ok" ? `Kết xuất báo cáo thành công (${name}).` : r.msg, r.kind)
    setExportOpen(false)
  }
  const exportRangeLabel = useMemo(() => resolveExportRange(exportFilter).label, [exportFilter])

  return (
    <div className="space-y-4">
      <DashboardHeader role={role} onRole={setRole}
        actions={<>
          <Button variant="outline" size="sm" onClick={() => setConfigOpen(true)}><Settings2 className="size-4" />Cấu hình</Button>
          <Button variant="outline" size="sm" onClick={doOpenExport}>Kết xuất báo cáo</Button>
        </>} />
      <AccessGate role={role}>
        {!bo && !tchncc && (
          <div className="flex items-center gap-2 rounded-[14px] border border-border bg-surface px-4 py-2.5 text-[12.5px] text-foreground-muted shadow-sm">
            <MapPin className="size-4 text-foreground-subtle" />Địa bàn: <span className="font-semibold text-foreground-strong">Sở Tư pháp {STP_PROVINCE}</span>
            <span className="text-foreground-subtle">— dữ liệu tự động lọc theo địa bàn của tài khoản (BR-09), không có bộ lọc Tỉnh/Thành phố.</span>
          </div>
        )}
        {tchncc && (
          <div className="flex items-center gap-2 rounded-[14px] border border-border bg-surface px-4 py-2.5 text-[12.5px] text-foreground-muted shadow-sm">
            <Building2 className="size-4 text-foreground-subtle" />Tổ chức: <span className="font-semibold text-foreground-strong">{TCHNCC_HOME_ORG}</span>
            <span className="text-foreground-subtle">— dữ liệu tự động lọc theo tổ chức của tài khoản (BR-09), không có bộ lọc TCHNCC.</span>
          </div>
        )}
        <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
          <div className="mb-1 text-[13px] font-semibold text-foreground-strong">Bộ lọc</div>
          <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", bo ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
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
            {bo && (
              <F label="Phạm vi Tỉnh/Thành phố" required>
                <NativeSelect value={draft.province} onChange={(e) => setDraft((d) => ({ ...d, province: e.target.value }))}>
                  <option value="Toàn quốc">Toàn quốc</option>
                  {PROVINCES_34.map((p) => <option key={p} value={p}>{p}</option>)}
                </NativeSelect>
              </F>
            )}
          </div>
          {error && <div className="mt-3 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12.5px] font-medium text-[#b91c1c]">{error}</div>}
          <div className="mt-4"><Button onClick={doApply}>Áp dụng</Button></div>
          <div className="mt-3 text-[11.5px] text-foreground-subtle">* Phát sinh trong kỳ: {fmtVN(range.from)} – {fmtVN(range.to)} (D-2)</div>
        </div>

        <WidgetGrid items={gridItems} />
      </AccessGate>

      <ConfigPanel open={configOpen} onClose={() => setConfigOpen(false)} widgets={widgetMetas} configs={configs}
        onToggleVisible={onToggleVisible} onRename={onRename} onWidthChange={onWidthChange} onReorder={onReorder}
        onRestoreDefault={onRestoreDefault} onOpenExport={() => { setConfigOpen(false); doOpenExport() }} />

      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} dashboardType={dashboardType} showProvince={!tchncc}
        filter={exportFilter} onChangeFilter={setExportFilter} previewItems={gridItems.map((it) => ({ id: it.id, title: it.id, node: it.node }))}
        onExport={doExportReport} rangeLabel={exportRangeLabel} />
    </div>
  )
}
