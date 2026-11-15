import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import logoSvg from "@/assets/bbts-logo.svg"

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <img
          src={logoSvg}
          alt="BBTS"
          className="h-20 w-auto brightness-0 opacity-90 dark:brightness-100 dark:opacity-100 mb-8"
        />
      <h1 className="text-3xl font-semibold tracking-tight">Erro 404 - Página não encontrada</h1>
      <p className="text-muted-foreground">
        O endereço acessado não existe ou foi movido.
      </p>
      <Button render={<Link to="/" />}>Voltar para o início</Button>
    </div>
  )
}
