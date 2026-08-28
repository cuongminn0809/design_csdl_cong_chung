import type { LucideIcon } from "lucide-react"
import {
  Building2, CheckCheck, Database, FileClock, FileSignature, FileText, FileX2, HardDriveDownload, History, Inbox,
  LayoutDashboard, LayoutGrid, List, MessageCircle, RefreshCw, ScrollText, Settings2, Ban, ShieldAlert, ShieldCheck, ShieldOff, SlidersHorizontal, Trash2, Users, Workflow, Search, QrCode, Boxes,
} from "lucide-react"

export interface DataGroup {
  code: string
  label: string
}

// B2 — Đối soát: 8 nhóm (ngăn chặn gộp chung + TCHNCC), theo prototype B2.1
export const B2_GROUPS: DataGroup[] = [
  { code: "gdcc", label: "Giao dịch công chứng" },
  { code: "ben-lien-quan", label: "Bên liên quan" },
  { code: "tai-san", label: "Tài sản GDCC" },
  { code: "ngan-chan", label: "Ngăn chặn / cảnh báo rủi ro" },
  { code: "to-chuc-hanh-nghe", label: "Tổ chức hành nghề CC" },
  { code: "cong-chung-vien", label: "Công chứng viên" },
  { code: "ho-so", label: "Hồ sơ công chứng" },
  { code: "danh-muc", label: "Danh mục" },
]

// B3.1 / B3.3 — Xử lý: 9 nhóm (ngăn chặn tách PMCD & HSCDL), theo README §9 nhóm dữ liệu
export const DATA_GROUPS: DataGroup[] = [
  { code: "gdcc", label: "Giao dịch công chứng" },
  { code: "ben-lien-quan", label: "Bên liên quan" },
  { code: "tai-san", label: "Tài sản GDCC" },
  { code: "ngan-chan-pmcd", label: "Ngăn chặn PMCD" },
  { code: "ngan-chan-hscdl", label: "Ngăn chặn HSCDL" },
  { code: "to-chuc-hanh-nghe", label: "Tổ chức hành nghề CC" },
  { code: "cong-chung-vien", label: "Công chứng viên" },
  { code: "ho-so", label: "Hồ sơ công chứng" },
  { code: "danh-muc", label: "Danh mục" },
]

export interface NavLeaf {
  type: "leaf"
  label: string
  path: string
  /** Icon hiển thị bên trái nhãn */
  icon?: LucideIcon
}

export interface NavGroup {
  type: "group"
  label: string
  path?: string
  /** Mã module hiển thị bên phải, ví dụ "B1" */
  badge?: string
  /** Icon hiển thị bên trái nhãn nhóm */
  icon?: LucideIcon
  /** Mở sẵn khi vào phân hệ (không cần route con đang active) */
  defaultOpen?: boolean
  children: NavItem[]
}

export type NavItem = NavLeaf | NavGroup

export interface Subsystem {
  code: string
  label: string
  nav: NavItem[]
}

const reconciliationChildren: NavLeaf[] = B2_GROUPS.map((g) => ({
  type: "leaf",
  label: g.label,
  path: `/doi-soat/${g.code}`,
}))

const cleaningChildren: NavLeaf[] = DATA_GROUPS.map((g) => ({
  type: "leaf",
  label: g.label,
  path: `/xu-ly/lam-sach/${g.code}`,
}))

const normalizationChildren: NavLeaf[] = DATA_GROUPS.map((g) => ({
  type: "leaf",
  label: g.label,
  path: `/xu-ly/chuan-hoa/${g.code}`,
}))

export const SUBSYSTEMS: Subsystem[] = [
  {
    code: "kho-du-lieu",
    label: "Quản lý kho dữ liệu",
    nav: [
      { type: "leaf", label: "Tổng quan", path: "/", icon: LayoutDashboard },
      {
        type: "group",
        label: "Thu nhận dữ liệu",
        badge: "B1",
        icon: Inbox,
        children: [
          {
            type: "group",
            label: "Thiết lập thu nhận",
            icon: Settings2,
            defaultOpen: true,
            children: [
              { type: "leaf", label: "Đơn vị cung cấp dữ liệu", path: "/thu-nhan/don-vi-cung-cap", icon: Building2 },
              { type: "leaf", label: "Phương thức thu nhận", path: "/thu-nhan/phuong-thuc", icon: List },
              { type: "leaf", label: "Nhật ký thu thập", path: "/thu-nhan/nhat-ky", icon: FileText },
            ],
          },
          { type: "leaf", label: "Tích hợp thủ công", path: "/thu-nhan/tich-hop-thu-cong", icon: HardDriveDownload },
          { type: "leaf", label: "Tích hợp tự động", path: "/thu-nhan/tich-hop-tu-dong", icon: RefreshCw },
        ],
      },
      {
        type: "group",
        label: "Đối soát dữ liệu",
        badge: "B2",
        icon: CheckCheck,
        children: reconciliationChildren,
      },
      {
        type: "group",
        label: "Chuẩn hóa & làm sạch",
        badge: "B3",
        icon: MessageCircle,
        children: [
          { type: "group", label: "Làm sạch dữ liệu", badge: "B3.1", children: cleaningChildren },
          { type: "group", label: "Chuẩn hóa dữ liệu", badge: "B3.3", children: normalizationChildren },
        ],
      },
      { type: "leaf", label: "Kho dữ liệu", path: "/kho-du-lieu", icon: Database },
    ],
  },
  {
    code: "quan-tri",
    label: "Quản trị hệ thống",
    nav: [
      {
        type: "group",
        label: "Người dùng & phân quyền",
        icon: Users,
        defaultOpen: true,
        children: [
          { type: "leaf", label: "Dashboard tổng quan", path: "/quan-tri/dashboard" },
          { type: "leaf", label: "Quản lý người dùng", path: "/quan-tri/nguoi-dung" },
          { type: "leaf", label: "Nhóm người dùng", path: "/quan-tri/nhom-nguoi-dung" },
          { type: "leaf", label: "Quản lý đơn vị", path: "/quan-tri/don-vi" },
          { type: "leaf", label: "Vai trò & phân quyền", path: "/quan-tri/vai-tro-phan-quyen" },
          { type: "leaf", label: "Phiên đăng nhập", path: "/quan-tri/phien-dang-nhap" },
          { type: "leaf", label: "Danh mục trạng thái NSD", path: "/quan-tri/trang-thai-nguoi-dung" },
        ],
      },
      {
        type: "group",
        label: "Quản lý danh mục",
        icon: LayoutGrid,
        defaultOpen: true,
        children: [
          { type: "leaf", label: "Danh mục dùng chung", path: "/quan-tri/danh-muc-dung-chung" },
          { type: "leaf", label: "Danh mục riêng của hệ thống", path: "/quan-tri/danh-muc-rieng" },
        ],
      },
    ],
  },
  {
    code: "csdlcc",
    label: "Cơ sở dữ liệu công chứng",
    nav: [
      {
        type: "group",
        label: "Quản lý giao dịch công chứng",
        icon: FileSignature,
        defaultOpen: true,
        children: [
          {
            type: "group",
            label: "Giao dịch công chứng giấy",
            icon: FileText,
            defaultOpen: true,
            children: [
              { type: "leaf", label: "Danh sách giao dịch", path: "/notary-transaction/paper/list" },
              { type: "leaf", label: "Lịch sử giao dịch", path: "/notary-transaction/history/paper", icon: History },
              { type: "leaf", label: "Thùng rác giao dịch", path: "/notary-transaction/trash/paper", icon: Trash2 },
            ],
          },
          {
            type: "group",
            label: "Giao dịch công chứng điện tử",
            icon: ScrollText,
            defaultOpen: true,
            children: [
              { type: "leaf", label: "Danh sách giao dịch", path: "/notary-transaction/electronic/list" },
              { type: "leaf", label: "Lịch sử giao dịch", path: "/notary-transaction/history/digital", icon: History },
              { type: "leaf", label: "Thùng rác giao dịch", path: "/notary-transaction/trash/digital", icon: Trash2 },
            ],
          },
        ],
      },
      {
        type: "group",
        label: "Quản lý tuyên hủy",
        icon: FileX2,
        defaultOpen: true,
        children: [
          { type: "leaf", label: "Danh sách tuyên hủy", path: "/notary-transaction/revoke/list", icon: Ban },
          { type: "leaf", label: "GDCC đã hủy", path: "/notary-transaction/revoke/list-approved", icon: FileX2 },
          { type: "leaf", label: "Lịch sử xử lý tuyên hủy", path: "/notary-transaction/history/revoke", icon: FileClock },
        ],
      },
      {
        type: "group",
        label: "Quản lý ngăn chặn, giải tỏa",
        icon: ShieldAlert,
        defaultOpen: true,
        children: [
          { type: "leaf", label: "Thông tin ngăn chặn", path: "/prevent-info/search", icon: SlidersHorizontal },
          { type: "leaf", label: "Thông tin giải tỏa", path: "/giai-toa-info/search", icon: ShieldOff },
          { type: "leaf", label: "Quản lý quy trình", path: "/prevent-info/workflow", icon: Workflow },
        ],
      },
      {
        type: "group",
        label: "Tra cứu thông tin",
        icon: Search,
        defaultOpen: true,
        children: [
          { type: "leaf", label: "Tra cứu phục vụ công chứng", path: "/exploit-info/notary-transaction-search", icon: Search },
          {
            type: "group",
            label: "Công chứng viên và TCHNCC",
            path: "/tra-cuu/cong-chung-vien-tchncc",
            icon: Users,
            defaultOpen: true,
            children: [
              { type: "leaf", label: "Lịch sử tra cứu thông tin CCV", path: "/tra-cuu/cong-chung-vien-tchncc/lich-su", icon: History },
              {
                type: "group",
                label: "Tổ chức HNCC",
                path: "/tra-cuu/cong-chung-vien-tchncc/to-chuc-hncc",
                icon: Building2,
                defaultOpen: true,
                children: [
                  { type: "leaf", label: "Lịch sử tra cứu thông tin tổ chức HNCC", path: "/tra-cuu/cong-chung-vien-tchncc/to-chuc-hncc/lich-su", icon: History },
                ],
              },
            ],
          },
        ],
      },
      {
        type: "group",
        label: "Khai thác thông tin",
        icon: HardDriveDownload,
        defaultOpen: true,
        children: [
          { type: "leaf", label: "Văn bản công chứng", path: "/exploit/notary-document", icon: ScrollText },
          { type: "leaf", label: "Tham chiếu VBCCĐT", path: "/reference-vbccdt", icon: QrCode },
          { type: "leaf", label: "Thông tin tài sản", path: "/asset-exploit/search", icon: Boxes },
          { type: "leaf", label: "Thông tin người tham gia GDCC", path: "/exploit/participant-lookup", icon: Users },
          { type: "leaf", label: "Hậu kiểm dữ liệu", path: "/khai-thac-thong-tin/hau-kiem-du-lieu", icon: ShieldCheck },
        ],
      },
    ],
  },
]
