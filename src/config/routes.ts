import { SUBSYSTEMS, type NavItem } from "@/config/nav"

export interface FlatRoute {
  path: string
  label: string
}

function flatten(items: NavItem[]): FlatRoute[] {
  return items.flatMap((item) =>
    item.type === "leaf"
      ? [{ path: item.path, label: item.label }]
      : flatten(item.children)
  )
}

export const ALL_ROUTES: FlatRoute[] = SUBSYSTEMS.flatMap((s) => flatten(s.nav))
