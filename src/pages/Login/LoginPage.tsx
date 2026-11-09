import { useState, type FormEvent } from "react"
import { isAxiosError } from "axios"
import { Navigate, useLocation } from "react-router"
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react"

import logoSvg from "@/assets/bbts-logo-v2.svg"
import bgLogin from "@/assets/bgLogin.jpg"

import { Button } from "@/components/ui/button"
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
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-white">

      <div className="flex flex-col justify-center items-center px-6 py-10 sm:py-12 lg:px-16 w-full max-w-sm sm:max-w-md lg:max-w-xl mx-auto">
        <div className="w-full">
          <div className="mb-8 flex flex-col items-center sm:items-start text-center sm:text-left">
            <img
              src={logoSvg}
              alt="BBTS Orion"
              className="w-[90px] sm:w-[120px] h-auto object-contain mb-5 sm:mb-8"
            />
            <h2 className="text-2xl sm:text-3xl lg:text-5xl text-primary font-bold tracking-tight">
              Acesse sua Conta Orion
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 w-full">
            <FieldGroup className="space-y-4">
              <Field className="flex flex-col gap-1.5">
                <FieldLabel htmlFor="email">E-mail corporativo</FieldLabel>
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

              <Field className="flex flex-col gap-1.5 pb-2">
                <FieldLabel htmlFor="senha">Senha</FieldLabel>
                <div className="relative">
                  <Input
                    id="senha"
                    name="senha"
                    type={mostrarSenha ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Digite sua senha"
                    required
                    className="pr-10"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute inset-y-0 right-0 hover:bg-transparent"
                    aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                    onClick={() => setMostrarSenha((v) => !v)}
                  >
                    {mostrarSenha ? (
                      <EyeOff className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Eye className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </Field>
            </FieldGroup>

            {erro && (
              <p role="alert" className="text-sm text-destructive font-semibold">
                {erro}
              </p>
            )}

            <Button
              type="submit"
              disabled={enviando || !email || !senha}
              className="w-full h-auto py-3.5 text-sm sm:text-base font-bold text-[#3D5AFF] bg-[#FDF429] uppercase hover:bg-[#e6dd25] flex items-center justify-center gap-2 transition-colors"
            >
              {enviando ? <Loader2 className="animate-spin h-5 w-5" /> : <LogIn className="h-5 w-5" />}
              {enviando ? "Entrando..." : "Acessar a plataforma"}
            </Button>
          </form>
        </div>
      </div>

      <div
        className="hidden lg:block w-full h-full bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url(${bgLogin})`,
          backgroundPosition: "80% center",
        }}
      />
    </div>
  )
}