import { createBrowserRouter } from "react-router"
import { AppLayout } from "@/components/layout/AppLayout"
import AjudaPage from "@/pages/Ajuda/AjudaPage"
import CatalogoAtivosPage from "@/pages/CatalogoAtivos/CatalogoAtivosPage"
import NovoAtivoPage from "@/pages/CatalogoAtivos/NovoAtivoPage"
import DashboardPage from "@/pages/Dashboard/DashboardPage"
import NotFound from "@/pages/NotFound"
import ResponsaveisPage from "@/pages/Responsaveis/ResponsaveisPage"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage />, handle: { title: "Dashboard" } },
      {
        path: "catalogo-ativos",
        handle: { title: "Catálogo de Ativos" },
        children: [
          { index: true, element: <CatalogoAtivosPage /> },
          { path: "novo", element: <NovoAtivoPage />, handle: { title: "Novo Ativo" } },
        ],
      },
      { path: "responsaveis", element: <ResponsaveisPage />, handle: { title: "Responsáveis" } },
      { path: "ajuda", element: <AjudaPage />, handle: { title: "Ajuda" } },
    ],
  },
  { path: "*", element: <NotFound /> },
])
