import { createBrowserRouter } from "react-router"
import { AdminRoute } from "@/components/auth/AdminRoute"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { AppLayout } from "@/components/layout/AppLayout"
import AjudaPage from "@/pages/Ajuda/AjudaPage"
import AtivoDetalhePage from "@/pages/CatalogoAtivos/AtivoDetalhePage"
import AuditoriaPage from "@/pages/Auditoria/AuditoriaPage"
import CatalogoAtivosPage from "@/pages/CatalogoAtivos/CatalogoAtivosPage"
import DashboardPage from "@/pages/Dashboard/DashboardPage"
import LoginPage from "@/pages/Login/LoginPage"
import DominiosPage from "@/pages/Dominios/DominiosPage"
import NotFound from "@/pages/NotFound"
import ResponsaveisPage from "@/pages/Responsaveis/ResponsaveisPage"

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage />, handle: { title: "Dashboard" } },
          { path: "catalogo-ativos", element: <CatalogoAtivosPage />, handle: { title: "Catálogo de Ativos" } },
          { path: "catalogo-ativos/:id", element: <AtivoDetalhePage />, handle: { title: "Detalhe do ativo" } },
          { path: "responsaveis", element: <ResponsaveisPage />, handle: { title: "Responsáveis" } },
          { path: "ajuda", element: <AjudaPage />, handle: { title: "Ajuda" } },
          {
            element: <AdminRoute />,
            children: [
              { path: "dominios", element: <DominiosPage />, handle: { title: "Domínios" } },
              { path: "auditoria", element: <AuditoriaPage />, handle: { title: "Auditoria" } },
            ],
          },
        ],
      },
    ],
  },
  { path: "*", element: <NotFound /> },
])
