import { useState, type FormEvent } from "react"
import { isAxiosError } from "axios"
import { Navigate, useLocation } from "react-router"
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react"
import logoSvg from "@/assets/bbts-logo.svg"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/AuthContext"

function mensagemDeErro(erro: unknown) {
  if (!isAxiosError(erro) || !erro.response) {
    return "Não foi possível conectar ao servidor. Tente novamente."
  }
  switch (erro.response.status) {
    case 401:
      return "E-mail ou senha incorretos."
    case 429:
      return "Muitas tentativas de acesso. Aguarde alguns minutos e tente novamente."
    case 400:
      return "Informe um e-mail válido e a senha."
    case 503:
    case 504:
      return "Serviço temporariamente indisponível. Tente novamente em instantes."
    default:
      return "Não foi possível entrar. Tente novamente."
  }
}

export default function LoginPage() {
  const { status, login } = useAuth()
  const location = useLocation()
  const destino = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? "/"

  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  if (status === "autenticado") return <Navigate to={destino} replace />

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      await login(email, senha)
    } catch (e) {
      setErro(mensagemDeErro(e))
      setSenha("")
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm overflow-hidden pt-0">
        <div className="flex h-20 items-center justify-center gap-3 bg-primary text-primary-foreground">
          <img src={logoSvg} alt="BBTS" className="h-7 w-auto" />
          <span className="text-xl font-semibold tracking-tight">Orion</span>
        </div>
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
          <CardDescription>Acesse a plataforma de governança de ativos.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-5">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">E-mail</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  placeholder="nome@bbts.com.br"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="senha">Senha</FieldLabel>
                <div className="relative">
                  <Input
                    id="senha"
                    name="senha"
                    type={mostrarSenha ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="pr-10"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute inset-y-0 right-0"
                    aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                    onClick={() => setMostrarSenha((v) => !v)}
                  >
                    {mostrarSenha ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
              </Field>
            </FieldGroup>

            {erro && (
              <p role="alert" className="text-sm text-destructive">
                {erro}
              </p>
            )}

            <Button type="submit" disabled={enviando || !email || !senha}>
              {enviando ? <Loader2 className="animate-spin" /> : <LogIn />}
              {enviando ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
