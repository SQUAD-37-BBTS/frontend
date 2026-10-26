import { Navigate, Outlet } from "react-router"
import { useAuth } from "@/contexts/AuthContext"

/** Rotas exclusivas de Admin. A API também recusa (403) quem não tem o papel. */
export function AdminRoute() {
  const { usuario } = useAuth()
  if (usuario?.papel_sistema !== "Admin") return <Navigate to="/" replace />
  return <Outlet />
}
