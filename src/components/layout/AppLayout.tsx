import { Outlet } from "react-router"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppHeader } from "./AppHeader"
import { AppSidebar } from "./AppSidebar"

export function AppLayout() {
  return (
    <SidebarProvider className="flex-col">
      <AppHeader />
      <div className="flex flex-1">
        <AppSidebar />
        <SidebarInset className="min-w-0">
          <main className="min-w-0 flex-1 p-3 sm:p-4 lg:p-6">
            <div className="w-full space-y-6">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}