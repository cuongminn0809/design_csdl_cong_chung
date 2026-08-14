import { Outlet } from "react-router-dom"

import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"

export function AppShell() {
  return (
    <div className="flex h-svh bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1320px] px-7 py-7">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
