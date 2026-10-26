import { Outlet } from "react-router"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppHeader } from "./AppHeader"
import { AppSidebar } from "./AppSidebar"

export function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl space-y-6">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
