import { Routes, Route, useParams } from "react-router-dom"

import { AppShell } from "@/components/layout/AppShell"
import { Placeholder } from "@/pages/Placeholder"
import { ALL_ROUTES } from "@/config/routes"
import { ReconciliationPage } from "@/features/reconciliation/ReconciliationPage"
import { DonViCungCapPage } from "@/features/ingestion/DonViCungCapPage"
import { PhuongThucPage } from "@/features/ingestion/PhuongThucPage"
import { NhatKyPage } from "@/features/ingestion/NhatKyPage"
import { TichHopThuCongPage } from "@/features/ingestion/TichHopThuCongPage"
import { TichHopTuDongPage } from "@/features/ingestion/TichHopTuDongPage"
import { ProcessingPage } from "@/features/processing/ProcessingPage"
import { DashboardPage } from "@/features/admin/DashboardPage"
import { DanhMucDungChungPage } from "@/features/admin/DanhMucDungChungPage"
import { DanhMucRiengPage } from "@/features/admin/DanhMucRiengPage"
import { NguoiDungPage } from "@/features/admin/NguoiDungPage"
import { TrangThaiNguoiDungPage } from "@/features/admin/TrangThaiNguoiDungPage"
import { DonViPage } from "@/features/admin/DonViPage"
import { NhomNguoiDungPage } from "@/features/admin/NhomNguoiDungPage"
import { PhienDangNhapPage } from "@/features/admin/PhienDangNhapPage"
import { VaiTroPhanQuyenPage } from "@/features/admin/VaiTroPhanQuyenPage"
import { TransactionListPage } from "@/features/notary/TransactionListPage"
import { TransactionDetailPage } from "@/features/notary/TransactionDetailPage"
import { NotaryFormPage } from "@/features/notary/create/NotaryFormPage"
import { RevokeListPage } from "@/features/notary/revoke/RevokeListPage"
import { RevokedListPage } from "@/features/notary/revoke/RevokedListPage"
import { RevokeDetailPage } from "@/features/notary/revoke/RevokeDetailPage"
import { RevokeApprovalPage } from "@/features/notary/revoke/RevokeApprovalPage"
import { RevokeFormPage } from "@/features/notary/revoke/RevokeFormPage"
import { HistoryPage } from "@/features/notary/history/HistoryPage"
import { TrashPage } from "@/features/notary/history/TrashPage"
import { RevokeHistoryPage } from "@/features/notary/history/RevokeHistoryPage"
import { PreventListPage } from "@/features/prevent/PreventListPage"
import { PreventDetailPage } from "@/features/prevent/PreventDetailPage"
import { PreventFormPage } from "@/features/prevent/PreventFormPage"
import { WorkflowConfigPage } from "@/features/prevent/WorkflowConfigPage"
import { ReleaseListPage } from "@/features/release/ReleaseListPage"
import { ReleaseDetailPage } from "@/features/release/ReleaseDetailPage"
import { ReleaseFormPage } from "@/features/release/ReleaseFormPage"
import { ExploitSearchPage } from "@/features/exploit/ExploitSearchPage"
import { ExploitHistoryPage } from "@/features/exploit/ExploitHistoryPage"
import { DocExploitPage } from "@/features/docexploit/DocExploitPage"
import { CcvLookupPage } from "@/features/ccv/CcvLookupPage"
import { CcvDetailPage } from "@/features/ccv/CcvDetailPage"
import { CcvHistoryPage } from "@/features/ccv/CcvHistoryPage"
import { OrgLookupPage } from "@/features/orglookup/OrgLookupPage"
import { OrgDetailPage } from "@/features/orglookup/OrgDetailPage"
import { OrgHistoryPage } from "@/features/orglookup/OrgHistoryPage"
import { ReferencePage } from "@/features/reference/ReferencePage"
import { ViewFilePage } from "@/features/reference/ViewFilePage"
import { AssetSearchPage } from "@/features/assetexploit/AssetSearchPage"
import { AssetHistoryPage } from "@/features/assetexploit/AssetHistoryPage"
import { ParticipantSearchPage } from "@/features/participant/ParticipantSearchPage"
import { ParticipantHistoryPage } from "@/features/participant/ParticipantHistoryPage"
import { HauKiemDashboardPage } from "@/features/haukiem/HauKiemDashboardPage"
import { HauKiemListPage } from "@/features/haukiem/HauKiemListPage"
import { SentPage } from "@/features/exploitreq/SentPage"
import { ReceivedPage } from "@/features/exploitreq/ReceivedPage"
import { TongHopSoLuongPage } from "@/features/report/TongHopSoLuongPage"
import { CanhBaoBatThuongPage } from "@/features/report/CanhBaoBatThuongPage"
import { SaiLechPage } from "@/features/report/SaiLechPage"
import { PhanTichDaChieuPage } from "@/features/report/PhanTichDaChieuPage"
import { BienDongPhapLyPage } from "@/features/report/BienDongPhapLyPage"

function ReconciliationRoute() {
  const { dataGroup } = useParams()
  return <ReconciliationPage dataGroup={dataGroup} />
}

function CleaningRoute() {
  const { dataGroup } = useParams()
  return <ProcessingPage variant="cleaning" dataGroup={dataGroup} />
}

function NormalizationRoute() {
  const { dataGroup } = useParams()
  return <ProcessingPage variant="normalization" dataGroup={dataGroup} />
}

// Route đã có component thật — loại khỏi danh sách placeholder tự sinh.
const REAL_ROUTES = new Set([
  "/thu-nhan/don-vi-cung-cap",
  "/thu-nhan/phuong-thuc",
  "/thu-nhan/nhat-ky",
  "/thu-nhan/tich-hop-thu-cong",
  "/thu-nhan/tich-hop-tu-dong",
  "/quan-tri/dashboard",
  "/quan-tri/danh-muc-dung-chung",
  "/quan-tri/danh-muc-rieng",
  "/quan-tri/nguoi-dung",
  "/quan-tri/trang-thai-nguoi-dung",
  "/quan-tri/don-vi",
  "/quan-tri/nhom-nguoi-dung",
  "/quan-tri/phien-dang-nhap",
  "/quan-tri/vai-tro-phan-quyen",
])

function App() {
  const placeholderRoutes = ALL_ROUTES.filter(
    (r) => !r.path.startsWith("/doi-soat/") && !r.path.startsWith("/xu-ly/") && !r.path.startsWith("/notary-transaction/") && !r.path.startsWith("/prevent-info/") && !r.path.startsWith("/giai-toa-info/") && !r.path.startsWith("/exploit-info/") && !r.path.startsWith("/exploit/") && !r.path.startsWith("/tra-cuu/") && !r.path.startsWith("/reference-vbccdt") && !r.path.startsWith("/asset-exploit") && !r.path.startsWith("/khai-thac-thong-tin/") && !r.path.startsWith("/exploit-request") && !r.path.startsWith("/bao-cao-thong-ke") && !REAL_ROUTES.has(r.path)
  )

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/doi-soat/:dataGroup" element={<ReconciliationRoute />} />
        <Route path="/xu-ly/lam-sach/:dataGroup" element={<CleaningRoute />} />
        <Route path="/xu-ly/chuan-hoa/:dataGroup" element={<NormalizationRoute />} />
        <Route path="/thu-nhan/don-vi-cung-cap" element={<DonViCungCapPage />} />
        <Route path="/thu-nhan/phuong-thuc" element={<PhuongThucPage />} />
        <Route path="/thu-nhan/nhat-ky" element={<NhatKyPage />} />
        <Route path="/thu-nhan/tich-hop-thu-cong" element={<TichHopThuCongPage />} />
        <Route path="/thu-nhan/tich-hop-tu-dong" element={<TichHopTuDongPage />} />
        <Route path="/quan-tri/dashboard" element={<DashboardPage />} />
        <Route path="/quan-tri/danh-muc-dung-chung" element={<DanhMucDungChungPage />} />
        <Route path="/quan-tri/danh-muc-rieng" element={<DanhMucRiengPage />} />
        <Route path="/quan-tri/nguoi-dung" element={<NguoiDungPage />} />
        <Route path="/quan-tri/trang-thai-nguoi-dung" element={<TrangThaiNguoiDungPage />} />
        <Route path="/quan-tri/don-vi" element={<DonViPage />} />
        <Route path="/quan-tri/nhom-nguoi-dung" element={<NhomNguoiDungPage />} />
        <Route path="/quan-tri/phien-dang-nhap" element={<PhienDangNhapPage />} />
        <Route path="/quan-tri/vai-tro-phan-quyen" element={<VaiTroPhanQuyenPage />} />
        <Route path="/notary-transaction/paper/list" element={<TransactionListPage method="paper" />} />
        <Route path="/notary-transaction/paper/create" element={<NotaryFormPage method="paper" mode="create" />} />
        <Route path="/notary-transaction/paper/update/:id" element={<NotaryFormPage method="paper" mode="edit" />} />
        <Route path="/notary-transaction/paper/update-rejected/:id" element={<NotaryFormPage method="paper" mode="revise" />} />
        <Route path="/notary-transaction/paper/detail/:id" element={<TransactionDetailPage method="paper" />} />
        <Route path="/notary-transaction/electronic/list" element={<TransactionListPage method="electronic" />} />
        <Route path="/notary-transaction/electronic/create" element={<NotaryFormPage method="electronic" mode="create" />} />
        <Route path="/notary-transaction/electronic/update/:id" element={<NotaryFormPage method="electronic" mode="edit" />} />
        <Route path="/notary-transaction/electronic/update-rejected/:id" element={<NotaryFormPage method="electronic" mode="revise" />} />
        <Route path="/notary-transaction/electronic/detail/:id" element={<TransactionDetailPage method="electronic" />} />
        <Route path="/notary-transaction/revoke/list" element={<RevokeListPage />} />
        <Route path="/notary-transaction/revoke/list-approved" element={<RevokedListPage />} />
        <Route path="/notary-transaction/revoke/view/:id" element={<RevokeDetailPage />} />
        <Route path="/notary-transaction/revoke/detail/:id" element={<RevokeApprovalPage />} />
        <Route path="/notary-transaction/revoke/:id" element={<RevokeFormPage />} />
        <Route path="/notary-transaction/history/paper" element={<HistoryPage method="paper" />} />
        <Route path="/notary-transaction/history/digital" element={<HistoryPage method="electronic" />} />
        <Route path="/notary-transaction/history/revoke" element={<RevokeHistoryPage />} />
        <Route path="/notary-transaction/trash/paper" element={<TrashPage method="paper" />} />
        <Route path="/notary-transaction/trash/digital" element={<TrashPage method="electronic" />} />
        <Route path="/prevent-info/search" element={<PreventListPage />} />
        <Route path="/prevent-info/detail/:id" element={<PreventDetailPage />} />
        <Route path="/prevent-info/create" element={<PreventFormPage mode="create" />} />
        <Route path="/prevent-info/update/:id" element={<PreventFormPage mode="edit" />} />
        <Route path="/prevent-info/workflow" element={<WorkflowConfigPage />} />
        <Route path="/giai-toa-info/search" element={<ReleaseListPage />} />
        <Route path="/giai-toa-info/detail/:id" element={<ReleaseDetailPage />} />
        <Route path="/giai-toa-info/create" element={<ReleaseFormPage mode="create" />} />
        <Route path="/giai-toa-info/update/:id" element={<ReleaseFormPage mode="edit" />} />
        <Route path="/exploit-info/notary-transaction-search" element={<ExploitSearchPage />} />
        <Route path="/exploit-info/notary-transaction-search/history" element={<ExploitHistoryPage />} />
        <Route path="/exploit/notary-document" element={<DocExploitPage />} />
        <Route path="/tra-cuu/cong-chung-vien-tchncc" element={<CcvLookupPage />} />
        <Route path="/tra-cuu/cong-chung-vien-tchncc/lich-su" element={<CcvHistoryPage />} />
        <Route path="/tra-cuu/cong-chung-vien-tchncc/chi-tiet/:id" element={<CcvDetailPage />} />
        <Route path="/tra-cuu/cong-chung-vien-tchncc/to-chuc-hncc" element={<OrgLookupPage />} />
        <Route path="/tra-cuu/cong-chung-vien-tchncc/to-chuc-hncc/lich-su" element={<OrgHistoryPage />} />
        <Route path="/tra-cuu/cong-chung-vien-tchncc/to-chuc-hncc/chi-tiet/:id" element={<OrgDetailPage />} />
        <Route path="/reference-vbccdt" element={<ReferencePage />} />
        <Route path="/reference-vbccdt/view-file/:id" element={<ViewFilePage />} />
        <Route path="/asset-exploit/search" element={<AssetSearchPage />} />
        <Route path="/asset-exploit/search-history" element={<AssetHistoryPage />} />
        <Route path="/exploit/participant-lookup" element={<ParticipantSearchPage />} />
        <Route path="/exploit/participant-lookup/history" element={<ParticipantHistoryPage />} />
        <Route path="/khai-thac-thong-tin/hau-kiem-du-lieu" element={<HauKiemDashboardPage />} />
        <Route path="/khai-thac-thong-tin/hau-kiem-du-lieu/danh-sach" element={<HauKiemListPage />} />
        <Route path="/exploit-request/sent" element={<SentPage />} />
        <Route path="/exploit-request/received" element={<ReceivedPage />} />
        <Route path="/bao-cao-thong-ke/giao-dich-cong-chung/tong-hop-so-luong" element={<TongHopSoLuongPage />} />
        <Route path="/bao-cao-thong-ke/giao-dich-cong-chung/bao-cao-canh-bao-bat-thuong-tru-cap-ho-so-luu-tru" element={<CanhBaoBatThuongPage />} />
        <Route path="/bao-cao-thong-ke/giao-dich-cong-chung/bao-cao-du-lieu-sai-lech" element={<SaiLechPage />} />
        <Route path="/bao-cao-thong-ke/giao-dich-cong-chung/phan-tich-da-chieu" element={<PhanTichDaChieuPage />} />
        <Route path="/bao-cao-thong-ke/giao-dich-cong-chung/bien-dong-phap-ly" element={<BienDongPhapLyPage />} />
        {placeholderRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={<Placeholder title={route.label} />} />
        ))}
      </Route>
    </Routes>
  )
}

export default App
