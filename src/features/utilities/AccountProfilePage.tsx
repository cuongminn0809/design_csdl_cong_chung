import { useState } from "react"
import { ArrowLeft, KeyRound, Pencil } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { useToast } from "@/features/reconciliation/components/Toast"
import { NativeSelect } from "@/features/reconciliation/components/NativeSelect"
import { PageHeader } from "../ingestion/shared"
import { CURRENT_USER, UTIL_ROLES, type UtilRole } from "./config"

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-neutral-100 py-3">
      <div className="text-xs text-foreground-muted">{label}</div>
      <div className="text-[14px] text-foreground">{value}</div>
    </div>
  )
}

export function AccountProfilePage() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [role, setRole] = useState<UtilRole>("ccv")
  const info = CURRENT_USER[role]

  return (
    <div className="space-y-4">
      <PageHeader title="Hồ sơ tài khoản" desc="Thông tin tài khoản của người dùng đang đăng nhập (readonly)."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] text-foreground-muted">Xem theo vai trò:</span>
            <NativeSelect value={role} onChange={(e) => setRole(e.target.value as UtilRole)} className="h-8 w-[220px] text-[12.5px]">
              {UTIL_ROLES.filter((r) => r.key !== "khac").map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </NativeSelect>
          </div>
        } />

      <div className="rounded-[14px] border border-border bg-surface p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
          <Row label="Tên tài khoản" value={info.username} />
          <Row label="Họ và tên" value={info.hoTen} />
          <Row label="Vai trò" value={info.vaiTro} />
          <Row label="Đơn vị" value={info.donVi} />
          <Row label="Chức vụ" value={info.chucVu} />
          <Row label="Số điện thoại" value={info.sdt} />
          <Row label="Email" value={info.email} />
          <Row label="Địa chỉ" value={info.diaChi} />
          <Row label="Trạng thái" value={
            <span className={info.trangThai === "Hoạt động" ? "font-medium text-emerald-600" : "font-medium text-red-600"}>{info.trangThai}</span>
          } />
        </div>

        <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" onClick={() => navigate("/tien-ich")}><ArrowLeft className="size-4" />Đóng</Button>
          <Button variant="outline" onClick={() => showToast("Điều hướng sang màn hình Cập nhật thông tin của Quản trị người dùng.")}><Pencil className="size-4" />Cập nhật thông tin</Button>
          <Button onClick={() => showToast("Điều hướng sang màn hình Đổi mật khẩu của Quản trị người dùng.")}><KeyRound className="size-4" />Đổi mật khẩu</Button>
        </div>
      </div>
    </div>
  )
}
