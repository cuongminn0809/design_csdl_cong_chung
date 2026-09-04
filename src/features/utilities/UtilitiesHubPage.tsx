import { useState } from "react"
import {
  Activity, FileText, HelpCircle, History, KeyRound, LayoutGrid, Search, SlidersHorizontal, UserRound,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { useToast } from "@/features/reconciliation/components/Toast"
import { PageHeader } from "../ingestion/shared"
import { requestGlobalSearchFocus } from "@/components/layout/globalSearch"
import { CARD_ACCESS, UTIL_ROLES, canOpenHub, hasCard, type UtilCard, type UtilRole } from "./config"

interface CardDef { code: UtilCard; title: string; desc: string; icon: React.ReactNode; onOpen: (nav: ReturnType<typeof useNavigate>, showToast: (m: string) => void) => void }

const CARDS: CardDef[] = [
  { code: "profile", title: "Hồ sơ tài khoản", desc: "Xem thông tin tài khoản đang đăng nhập.", icon: <UserRound className="size-5" />, onOpen: (nav) => nav("/quan-tri/ho-so-tai-khoan") },
  { code: "instructions", title: "Hướng dẫn sử dụng", desc: "Tài liệu hướng dẫn thao tác trên hệ thống.", icon: <FileText className="size-5" />, onOpen: (nav) => nav("/tra-cuu/huong-dan-su-dung") },
  { code: "faq", title: "Câu hỏi thường gặp", desc: "Tìm kiếm câu hỏi và câu trả lời phổ biến.", icon: <HelpCircle className="size-5" />, onOpen: (nav) => nav("/tra-cuu/faq") },
  { code: "activities", title: "Hoạt động gần đây", desc: "5 hoạt động mới nhất trong phạm vi quyền.", icon: <Activity className="size-5" />, onOpen: (nav) => nav("/dashboard/hoat-dong-gan-day") },
  { code: "history", title: "Lịch sử thao tác", desc: "Lịch sử thao tác do chính bạn thực hiện.", icon: <History className="size-5" />, onOpen: (nav) => nav("/quan-tri/lich-su-ca-nhan") },
  { code: "sessions", title: "Phiên đăng nhập", desc: "Danh sách phiên đăng nhập của bạn.", icon: <KeyRound className="size-5" />, onOpen: (nav) => nav("/quan-tri/phien-dang-nhap-ca-nhan") },
  { code: "sessionConfig", title: "Cấu hình phiên", desc: "Thời gian hết hạn phiên làm việc (Quản trị hệ thống).", icon: <SlidersHorizontal className="size-5" />, onOpen: (_nav, showToast) => showToast("Cấu hình phiên được quản lý tại Cấu hình tham số hệ thống (nhóm C.2 — đang phát triển).") },
  { code: "quickSearch", title: "Tìm kiếm nhanh", desc: "Tìm nhanh chức năng theo tên.", icon: <Search className="size-5" />, onOpen: (_nav, showToast) => { requestGlobalSearchFocus(); showToast("Đã đặt focus vào ô tìm kiếm chức năng phía trên.") } },
]

export function UtilitiesHubPage() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [role, setRole] = useState<UtilRole>("admin")

  const visibleCards = CARDS.filter((c) => hasCard(role, c.code))

  return (
    <div className="space-y-4">
      <PageHeader title="Tiện ích" desc="Danh sách các tiện ích hỗ trợ thao tác trên hệ thống, hiển thị theo quyền của tài khoản."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] text-foreground-muted">Vai trò:</span>
            <NativeSelect value={role} onChange={(e) => setRole(e.target.value as UtilRole)} className="h-8 w-[240px] text-[12.5px]">
              {UTIL_ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </NativeSelect>
          </div>
        } />

      {!canOpenHub(role) ? (
        <div className="rounded-[14px] border border-border bg-surface p-10 text-center shadow-sm">
          <LayoutGrid className="mx-auto mb-3 size-8 text-foreground-subtle" />
          <div className="text-[15px] font-semibold text-foreground-strong">Không có quyền truy cập.</div>
          <div className="mt-1 text-[13.5px] text-foreground-muted">Vai trò hiện tại không được gán quyền chức năng "Tiện ích".</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visibleCards.map((c) => (
            <button
              key={c.code}
              onClick={() => c.onOpen(navigate, showToast)}
              className="flex flex-col items-start gap-3 rounded-[14px] border border-border bg-surface p-5 text-left shadow-sm transition-colors hover:border-neutral-300 hover:bg-neutral-50"
            >
              <div className="flex size-10 items-center justify-center rounded-[10px] bg-neutral-900 text-white">{c.icon}</div>
              <div>
                <div className="text-[14.5px] font-semibold text-foreground-strong">{c.title}</div>
                <div className="mt-0.5 text-[12.5px] leading-snug text-foreground-muted">{c.desc}</div>
              </div>
            </button>
          ))}
        </div>
      )}
      <div className="text-[11.5px] text-foreground-subtle">
        Thẻ hiển thị: {visibleCards.length}/{CARD_ACCESS.admin.length} theo ma trận phân quyền §6.1.
      </div>
    </div>
  )
}
