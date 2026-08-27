import { Bell, Search } from "lucide-react"
import { useLocation } from "react-router-dom"

import { SUBSYSTEMS, type NavItem } from "@/config/nav"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

function findBreadcrumb(items: NavItem[], pathname: string, trail: string[] = []): string[] | null {
  for (const item of items) {
    if (item.type === "leaf") {
      if (item.path === pathname) return [...trail, item.label]
    } else {
      if (item.path === pathname) return [...trail, item.label]
      const found = findBreadcrumb(item.children, pathname, [...trail, item.label])
      if (found) return found
    }
  }
  return null
}

export function Header() {
  const location = useLocation()
  const crumb =
    SUBSYSTEMS.map((s) => findBreadcrumb(s.nav, location.pathname)).find(Boolean) ??
    ["Tổng quan"]

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-4 border-b border-border bg-white/70 px-7 backdrop-blur-[8px]">
      <div className="flex min-w-0 flex-1 items-center gap-1.5 text-sm">
        {crumb.map((c, i) => (
          <span key={i} className="flex items-center gap-1.5 truncate">
            {i > 0 && <span className="text-foreground-subtle">/</span>}
            <span
              className={
                i === crumb.length - 1
                  ? "truncate font-medium text-foreground-strong"
                  : "truncate text-foreground-muted"
              }
            >
              {c}
            </span>
          </span>
        ))}
      </div>

      <div className="relative hidden w-64 md:block">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle" />
        <Input placeholder="Tìm kiếm..." className="pl-8" />
      </div>

      {/* Tài khoản hiển thị ở footer sidebar, không lặp lại ở header. */}
      <Button variant="ghost" size="icon" aria-label="Thông báo">
        <Bell className="size-4.5" />
      </Button>
    </header>
  )
}
