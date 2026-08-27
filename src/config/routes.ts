import { SUBSYSTEMS, type NavItem } from "@/config/nav"

export interface FlatRoute {
  path: string
  label: string
}

function flatten(items: NavItem[]): FlatRoute[] {
  return items.flatMap((item) => {
    if (item.type === "leaf") return [{ path: item.path, label: item.label }]
    const self = item.path ? [{ path: item.path, label: item.label }] : []
    return [...self, ...flatten(item.children)]
  })
}

export const ALL_ROUTES: FlatRoute[] = SUBSYSTEMS.flatMap((s) => flatten(s.nav))
