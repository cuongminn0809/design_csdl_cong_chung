import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Bell } from "lucide-react"

import { cn } from "@/lib/utils"
import { NotiDetailModal } from "./dialogs"
import { activeNotifications, relativeTime, unreadCount, useNotifications } from "./config"

export function NotiBell() {
  const navigate = useNavigate()
  useNotifications() // đăng ký re-render khi store thông báo thay đổi (đọc/xóa)
  const [open, setOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  const unread = unreadCount()
  const top10 = [...activeNotifications()].sort((a, b) => b.receivedAt.localeCompare(a.receivedAt)).slice(0, 10)

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        aria-label="Thông báo"
        onClick={() => setOpen((v) => !v)}
        className="relative flex size-9 items-center justify-center rounded-md text-foreground-muted outline-none transition-colors hover:bg-surface-muted focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <Bell className="size-4.5" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-none text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[360px] overflow-hidden rounded-md border border-border bg-surface shadow-popover">
          <div className="border-b border-border px-4 py-3 text-[13.5px] font-semibold text-foreground-strong">
            Thông báo {unread > 0 && <span className="font-normal text-foreground-muted">({unread} chưa đọc)</span>}
          </div>
          <div className="max-h-[360px] overflow-y-auto">
            {top10.length ? top10.map((n) => (
              <button
                key={n.id}
                onClick={() => { setOpen(false); setDetailId(n.id) }}
                className="flex w-full flex-col items-start gap-0.5 border-b border-neutral-100 px-4 py-2.5 text-left last:border-0 hover:bg-surface-muted"
              >
                <div className={cn("flex items-center gap-1.5 text-[13px]", !n.read ? "font-semibold text-foreground-strong" : "text-foreground-muted")}>
                  {!n.read && <span className="size-1.5 shrink-0 rounded-full bg-red-600" />}
                  <span className="truncate">{n.title}</span>
                </div>
                <div className="line-clamp-1 text-[12px] text-foreground-muted">{n.content.length > 50 ? n.content.slice(0, 50) + "…" : n.content}</div>
                <div className="text-[11px] text-foreground-subtle">{relativeTime(n.receivedAt)}</div>
              </button>
            )) : (
              <div className="px-4 py-6 text-center text-[13px] text-foreground-muted">Chưa có thông báo</div>
            )}
          </div>
          <button
            onClick={() => { setOpen(false); navigate("/tien-ich/thong-bao") }}
            className="block w-full border-t border-border px-4 py-2.5 text-center text-[13px] font-medium text-link hover:bg-surface-muted"
          >
            Xem tất cả
          </button>
        </div>
      )}

      {detailId && <NotiDetailModal id={detailId} onClose={() => setDetailId(null)} />}
    </div>
  )
}
