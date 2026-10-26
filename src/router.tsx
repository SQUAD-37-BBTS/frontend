import { createBrowserRouter } from "react-router"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { AppLayout } from "@/components/layout/AppLayout"
import AjudaPage from "@/pages/Ajuda/AjudaPage"
import CatalogoAtivosPage from "@/pages/CatalogoAtivos/CatalogoAtivosPage"
import DashboardPage from "@/pages/Dashboard/DashboardPage"
import LoginPage from "@/pages/Login/LoginPage"
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
          { path: "responsaveis", element: <ResponsaveisPage />, handle: { title: "Responsáveis" } },
          { path: "ajuda", element: <AjudaPage />, handle: { title: "Ajuda" } },
        ],
      },
    ],
  },
  { path: "*", element: <NotFound /> },
])
