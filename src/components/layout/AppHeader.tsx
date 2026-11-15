import { Fragment } from "react";
import { Link, useMatches } from "react-router";
import { Bell, ChevronDown, LogOut, Settings } from "lucide-react";
import logoSvg from "@/assets/bbts-logo.svg";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarTrigger } from "@/components/ui/sidebar";

export interface RouteHandle {
  title?: string;
}

export function AppHeader() {
  const { usuario, logout } = useAuth();
  const nome = usuario?.nome ?? "Usuário";
  const crumbs = useMatches()
    .map((match) => ({
      pathname: match.pathname,
      title: (match.handle as RouteHandle | undefined)?.title,
    }))
    .filter(
      (crumb): crumb is { pathname: string; title: string } => !!crumb.title,
    );

  const menuItemClass =
    "cursor-pointer py-2 text-base hover:bg-tertiary-pressed hover:text-tertiary-foreground focus:bg-tertiary-pressed focus:text-tertiary-foreground hover:[&_svg]:text-tertiary-foreground focus:[&_svg]:text-tertiary-foreground";

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full shrink-0 items-center gap-3 bg-primary px-4 text-primary-foreground shadow-sm">
      <SidebarTrigger className="-ml-1 size-10 hover:bg-white/15 hover:text-primary-foreground" />

      <Link to="/" className="flex items-center gap-2.5">
        <img src={logoSvg} alt="BBTS" className="h-6 w-auto" />
        <span className="text-lg font-semibold tracking-tight text-primary-foreground">
          Orion
        </span>
      </Link>

      <Breadcrumb className="ml-2 flex min-w-0 items-center sm:ml-6">
        <BreadcrumbList className="flex-nowrap leading-none text-primary-foreground/70">
          {crumbs.map((crumb, index) => (
            <Fragment key={crumb.pathname}>
              {index > 0 && <BreadcrumbSeparator className="hidden sm:block" />}
              <BreadcrumbItem
                className={
                  index === crumbs.length - 1
                    ? "min-w-0"
                    : "hidden sm:inline-flex"
                }
              >
                {index === crumbs.length - 1 ? (
                  <BreadcrumbPage className="truncate leading-none font-medium text-primary-foreground">
                    {crumb.title}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    className="leading-none hover:text-primary-foreground"
                    render={<Link to={crumb.pathname} />}
                  >
                    {crumb.title}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notificações"
          className="hover:bg-white/15 hover:text-primary-foreground"
        >
          <Bell />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="gap-2 px-2 hover:bg-white/15 hover:text-primary-foreground aria-expanded:bg-white/15 aria-expanded:text-primary-foreground"
                aria-label="Menu do usuário"
              />
            }
          >
            <Avatar size="sm">
              <AvatarFallback className="bg-white/20 text-primary-foreground">
                {nome.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium sm:inline">{nome}</span>
            <ChevronDown className="opacity-70" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex flex-col gap-0.5 px-2.5 py-2 font-normal">
                <span className="truncate text-lg font-medium text-foreground">
                  {nome}
                </span>
                <span className="truncate text-base text-muted-foreground">
                  {usuario?.email ?? "Minha conta"}
                </span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className={menuItemClass}>
              <Settings /> Configurações
            </DropdownMenuItem>
            <DropdownMenuItem
              className={menuItemClass}
              onClick={() => void logout()}
            >
              <LogOut /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
