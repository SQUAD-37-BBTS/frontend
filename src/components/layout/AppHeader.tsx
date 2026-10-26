import { Fragment } from "react"
import { Link, useMatches } from "react-router"
import { Bell, ChevronsUpDown, LogOut, Settings } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/AuthContext"
import { SidebarTrigger } from "@/components/ui/sidebar"

export interface RouteHandle {
  title?: string
}

export function AppHeader() {
  const { usuario, logout } = useAuth()
  const nome = usuario?.nome ?? "Usuário"
  const crumbs = useMatches()
    .map((match) => ({
      pathname: match.pathname,
      title: (match.handle as RouteHandle | undefined)?.title,
    }))
    .filter((crumb): crumb is { pathname: string; title: string } => !!crumb.title)

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 bg-primary px-4 text-primary-foreground shadow-sm">
      <SidebarTrigger className="-ml-1 hover:bg-white/15 hover:text-primary-foreground" />
      <Separator orientation="vertical" className="mr-2 bg-white/30 data-[orientation=vertical]:h-4" />

      <Breadcrumb>
        <BreadcrumbList className="text-primary-foreground/70">
          {crumbs.map((crumb, index) => (
            <Fragment key={crumb.pathname}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {index === crumbs.length - 1 ? (
                  <BreadcrumbPage className="font-medium text-primary-foreground">{crumb.title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink className="hover:text-primary-foreground" render={<Link to={crumb.pathname} />}>
                    {crumb.title}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" aria-label="Notificações" className="hover:bg-white/15 hover:text-primary-foreground">
          <Bell />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" className="gap-2 px-2 hover:bg-white/15 hover:text-primary-foreground aria-expanded:bg-white/15 aria-expanded:text-primary-foreground" aria-label="Menu do usuário" />}
          >
            <Avatar size="sm">
              <AvatarFallback className="bg-white/20 text-primary-foreground">{nome.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium sm:inline">{nome}</span>
            <ChevronsUpDown className="opacity-70" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="truncate">{usuario?.email ?? "Minha conta"}</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings /> Configurações
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => void logout()}>
              <LogOut /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
