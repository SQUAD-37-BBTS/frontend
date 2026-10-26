import { NavLink, useLocation } from "react-router"
import { BarChart3, CircleHelp, LayoutDashboard, Users } from "lucide-react"
import logoSvg from "@/assets/bbts-logo.svg"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const principal = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/catalogo-ativos", label: "Catálogo de Ativos", icon: BarChart3 },
  { path: "/responsaveis", label: "Responsáveis", icon: Users },
]

const suporte = [{ path: "/ajuda", label: "Ajuda", icon: CircleHelp }]

function isActive(current: string, path: string) {
  return path === "/" ? current === "/" : current.startsWith(path)
}

function NavGroup({
  label,
  items,
  pathname,
}: {
  label: string
  items: typeof principal
  pathname: string
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(({ path, label, icon: Icon }) => (
            <SidebarMenuItem key={path}>
              <SidebarMenuButton
                tooltip={label}
                isActive={isActive(pathname, path)}
                render={<NavLink to={path} end={path === "/"} />}
              >
                <Icon />
                <span>{label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function AppSidebar() {
  const { pathname } = useLocation()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-14 justify-center border-b">
        <NavLink to="/" className="flex items-center gap-3 px-2">
          <img
            src={logoSvg}
            alt="BBTS"
            className="h-6 w-auto group-data-[collapsible=icon]:hidden"
          />
          <span className="text-lg font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            Orion
          </span>
        </NavLink>
      </SidebarHeader>

      <SidebarContent>
        <NavGroup label="Plataforma" items={principal} pathname={pathname} />
        <NavGroup label="Suporte" items={suporte} pathname={pathname} />
      </SidebarContent>

      <SidebarFooter className="border-t">
        <p className="px-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          Governança de IA
        </p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
