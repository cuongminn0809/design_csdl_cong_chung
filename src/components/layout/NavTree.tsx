import { useEffect, useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import type { NavItem } from "@/config/nav"

function isActivePath(pathname: string, item: NavItem): boolean {
  if (item.type === "leaf") return pathname === item.path
  if (item.path && pathname.startsWith(item.path)) return true
  return item.children.some((c) => isActivePath(pathname, c))
}

// Tìm sibling đang chứa route hiện tại (accordion: chỉ 1 nhánh chứa lựa chọn hiện tại được mở ở mỗi cấp).
function findActiveIndex(items: NavItem[], pathname: string): number | null {
  const i = items.findIndex((it) => isActivePath(pathname, it))
  return i === -1 ? null : i
}

function NavNode({ item, depth, open, onToggle }: { item: NavItem; depth: number; open: boolean; onToggle: () => void }) {
  const location = useLocation()
  const active = isActivePath(location.pathname, item)

  if (item.type === "leaf") {
    return (
      <NavLink
        to={item.path}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
            "hover:bg-surface-muted",
            isActive
              ? "bg-neutral-900 text-neutral-50 font-medium hover:bg-neutral-900"
              : "text-foreground-muted"
          )
        }
        style={{ paddingLeft: 10 + depth * 14 }}
        end={item.path === "/"}
      >
        {item.icon && <item.icon className="size-[15px] shrink-0" />}
        <span className="truncate">{item.label}</span>
      </NavLink>
    )
  }

  return (
    <div>
      {item.path ? (
        // Group có route: nhãn điều hướng (NavLink), nút chevron riêng để mở/đóng con.
        <div className="flex items-center gap-0.5" style={{ paddingLeft: 10 + depth * 14 }}>
          <NavLink
            to={item.path}
            end
            className={({ isActive }) =>
              cn(
                "flex flex-1 items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors hover:bg-surface-muted",
                isActive ? "bg-neutral-900 text-neutral-50 hover:bg-neutral-900" : active ? "text-foreground-strong" : "text-foreground-muted"
              )
            }
          >
            {item.icon && <item.icon className="size-4 shrink-0" />}
            <span className="flex-1 truncate">{item.label}</span>
          </NavLink>
          <button
            type="button"
            onClick={onToggle}
            aria-label={open ? "Thu gọn" : "Mở rộng"}
            className="flex size-7 shrink-0 items-center justify-center rounded-md text-foreground-subtle transition-colors hover:bg-surface-muted"
          >
            <ChevronRight className={cn("size-3.5 transition-transform", open && "rotate-90")} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "flex w-full items-center gap-1.5 rounded-md px-2.5 py-1.5 text-left text-sm font-medium transition-colors hover:bg-surface-muted",
            active ? "text-foreground-strong" : "text-foreground-muted"
          )}
          style={{ paddingLeft: 10 + depth * 14 }}
        >
          {item.icon && <item.icon className="size-4 shrink-0" />}
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge && (
            <span className="shrink-0 text-[11px] font-normal text-foreground-subtle">{item.badge}</span>
          )}
          <ChevronRight
            className={cn("size-3.5 shrink-0 text-foreground-subtle transition-transform", open && "rotate-90")}
          />
        </button>
      )}
      {open && (
        <div
          className="mt-0.5 flex flex-col gap-0.5 border-l border-border"
          style={{ marginLeft: 14, paddingLeft: 8 }}
        >
          <NavGroupList items={item.children} depth={0} />
        </div>
      )}
    </div>
  )
}

/** Danh sách sibling dùng chung 1 state accordion: chỉ 1 nhánh được mở tại mỗi cấp, tự đồng bộ theo route hiện tại. */
function NavGroupList({ items, depth }: { items: NavItem[]; depth: number }) {
  const location = useLocation()
  const [openIndex, setOpenIndex] = useState<number | null>(() => findActiveIndex(items, location.pathname))

  useEffect(() => {
    setOpenIndex(findActiveIndex(items, location.pathname))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  return (
    <div className="flex flex-col gap-0.5">
      {items.map((item, i) => (
        <NavNode
          key={i}
          item={item}
          depth={depth}
          open={openIndex === i}
          onToggle={() => setOpenIndex((cur) => (cur === i ? null : i))}
        />
      ))}
    </div>
  )
}

export function NavTree({ items }: { items: NavItem[] }) {
  return (
    <nav>
      <NavGroupList items={items} depth={0} />
    </nav>
  )
}
