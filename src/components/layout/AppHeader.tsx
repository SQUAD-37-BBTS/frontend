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
import { SidebarTrigger } from "@/components/ui/sidebar"

export interface RouteHandle {
  title?: string
}

export function AppHeader() {
  const crumbs = useMatches()
    .map((match) => ({
      pathname: match.pathname,
      title: (match.handle as RouteHandle | undefined)?.title,
    }))
    .filter((crumb): crumb is { pathname: string; title: string } => !!crumb.title)

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />

      <Breadcrumb>
        <BreadcrumbList>
          {crumbs.map((crumb, index) => (
            <Fragment key={crumb.pathname}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {index === crumbs.length - 1 ? (
                  <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link to={crumb.pathname} />}>
                    {crumb.title}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" aria-label="Notificações">
          <Bell />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" className="gap-2 px-2" aria-label="Menu do usuário" />}
          >
            <Avatar size="sm">
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium sm:inline">Usuário</span>
            <ChevronsUpDown className="text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings /> Configurações
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LogOut /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
