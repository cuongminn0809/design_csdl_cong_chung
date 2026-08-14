import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { ChevronsUpDown, Database } from "lucide-react"

import { cn } from "@/lib/utils"
import { SUBSYSTEMS } from "@/config/nav"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { NavTree } from "@/components/layout/NavTree"

/** Phân hệ suy ra từ URL để sidebar bám theo route. */
function subsystemForPath(pathname: string) {
  if (pathname.startsWith("/quan-tri")) return "quan-tri"
  if (pathname.startsWith("/notary-transaction") || pathname.startsWith("/prevent-info") || pathname.startsWith("/giai-toa-info")) return "csdlcc"
  return SUBSYSTEMS[0].code
}

export function Sidebar() {
  const { pathname } = useLocation()
  const [subsystemCode, setSubsystemCode] = useState(() => subsystemForPath(pathname))

  // Điều hướng sang phân hệ khác (vd. link chéo) thì sidebar bám theo URL.
  useEffect(() => {
    setSubsystemCode(subsystemForPath(pathname))
  }, [pathname])

  const subsystem = SUBSYSTEMS.find((s) => s.code === subsystemCode)!

  return (
    <aside className="flex h-svh w-[264px] shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex items-center gap-2.5 px-4 py-4">
        <img src="/images/logo-btp.png" alt="Bộ Tư pháp" className="size-8 rounded-md object-contain" />
        <div className="min-w-0">
          <div className="truncate text-xs font-semibold text-foreground-strong">Kho CSDLCC</div>
          <div className="truncate text-[11px] text-foreground-muted">Bộ Tư pháp</div>
        </div>
      </div>

      <div className="px-3 pb-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "flex w-full items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-2 text-left text-sm shadow-xs",
              "hover:bg-surface-muted transition-colors"
            )}
          >
            <Database className="size-4 shrink-0 text-foreground-muted" />
            <span className="flex-1 truncate font-medium">{subsystem.label}</span>
            <ChevronsUpDown className="size-3.5 shrink-0 text-foreground-subtle" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[236px]">
            {SUBSYSTEMS.map((s) => (
              <DropdownMenuItem key={s.code} onSelect={() => setSubsystemCode(s.code)}>
                {s.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ScrollArea className="min-h-0 flex-1 px-3">
        <div className="pb-4">
          <NavTree items={subsystem.nav} />
        </div>
      </ScrollArea>

      <div className="flex-none border-t border-border p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
          <Avatar className="size-[30px] shrink-0">
            <AvatarFallback className="bg-neutral-900 text-[11px] font-semibold text-white">QT</AvatarFallback>
          </Avatar>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-[12.5px] font-semibold text-foreground-strong">Quản trị hệ thống</div>
            <div className="truncate text-[11px] text-foreground-muted">admin@congchung.gov.vn</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
