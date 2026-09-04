import { useEffect, useMemo, useRef, useState } from "react"
import { Bell, Search } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

import { SUBSYSTEMS, type NavItem } from "@/config/nav"
import { ALL_ROUTES } from "@/config/routes"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { onGlobalSearchFocusRequest } from "@/components/layout/globalSearch"

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

// Bỏ dấu tiếng Việt để tìm kiếm không phân biệt dấu/hoa-thường (BR-02/BR-04, SCR-A.9.1-13).
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase()

export function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState("")
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)

  const crumb =
    SUBSYSTEMS.map((s) => findBreadcrumb(s.nav, location.pathname)).find(Boolean) ??
    ["Tổng quan"]

  const results = useMemo(() => {
    const k = norm(keyword.trim())
    if (!k) return []
    return ALL_ROUTES.filter((r) => norm(r.label).includes(k)).slice(0, 10)
  }, [keyword])

  useEffect(() => onGlobalSearchFocusRequest(() => inputRef.current?.focus()), [])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

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

      <div ref={boxRef} className="relative hidden w-64 md:block">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle" />
        <Input
          ref={inputRef}
          value={keyword}
          maxLength={100}
          placeholder="Tìm kiếm chức năng..."
          className="pl-8"
          onChange={(e) => { setKeyword(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
        />
        {open && keyword.trim() && (
          <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-[340px] overflow-hidden rounded-md border border-border bg-surface shadow-popover">
            {results.length ? (
              results.map((r) => (
                <button
                  key={r.path}
                  onClick={() => { navigate(r.path); setKeyword(""); setOpen(false) }}
                  className="block w-full truncate px-3.5 py-2.5 text-left text-[13px] text-foreground hover:bg-surface-muted"
                >
                  {r.label}
                </button>
              ))
            ) : (
              <div className="px-3.5 py-3 text-[13px] text-foreground-muted">Không tìm thấy chức năng phù hợp.</div>
            )}
          </div>
        )}
      </div>

      {/* Tài khoản hiển thị ở footer sidebar, không lặp lại ở header. */}
      <Button variant="ghost" size="icon" aria-label="Thông báo">
        <Bell className="size-4.5" />
      </Button>
    </header>
  )
}
