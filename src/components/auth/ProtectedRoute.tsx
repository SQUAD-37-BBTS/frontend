import { Navigate, Outlet, useLocation } from "react-router"
import { useAuth } from "@/contexts/AuthContext"

/** Só renderiza as rotas filhas para quem está autenticado. */
export function ProtectedRoute() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === "carregando") {
    return (
      <div className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">
        Carregando...
      </div>
    )
  }
  if (status === "anonimo") {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Outlet />
}
