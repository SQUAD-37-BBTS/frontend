import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { api } from "@/services/api"
import { authStorage, SESSAO_EXPIRADA, type Tokens } from "@/services/authStorage"
import { endpoints } from "@/services/endpoints"
import type { Usuario } from "@/types"

type Status = "carregando" | "autenticado" | "anonimo"

interface AuthContextValue {
  usuario: Usuario | null
  status: Status
  login: (email: string, senha: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [status, setStatus] = useState<Status>(() =>
    authStorage.accessToken() || authStorage.refreshToken() ? "carregando" : "anonimo",
  )

  // Restaura a sessão ao abrir o app (o interceptor renova o token se preciso).
  useEffect(() => {
    if (status !== "carregando") return
    api
      .get<Usuario>(endpoints.me)
      .then(({ data }) => {
        setUsuario(data)
        setStatus("autenticado")
      })
      .catch(() => {
        authStorage.limpar()
        setStatus("anonimo")
      })
    // Só na montagem: depois disso o status muda por login/logout.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sessão que não pôde ser renovada: volta ao login sem recarregar a página.
  useEffect(() => {
    const expirou = () => {
      setUsuario(null)
      setStatus("anonimo")
    }
    window.addEventListener(SESSAO_EXPIRADA, expirou)
    return () => window.removeEventListener(SESSAO_EXPIRADA, expirou)
  }, [])

  const login = useCallback(async (email: string, senha: string) => {
    const { data: tokens } = await api.post<Tokens>(endpoints.login, {
      email: email.trim().toLowerCase(),
      senha,
    })
    authStorage.salvar(tokens)
    try {
      const { data } = await api.get<Usuario>(endpoints.me)
      setUsuario(data)
      setStatus("autenticado")
    } catch (erro) {
      authStorage.limpar()
      throw erro
    }
  }, [])

  const logout = useCallback(async () => {
    const refresh_token = authStorage.refreshToken()
    try {
      if (refresh_token) await api.post(endpoints.logout, { refresh_token })
    } catch {
      // mesmo sem alcançar a API, a sessão local é encerrada
    }
    authStorage.limpar()
    setUsuario(null)
    setStatus("anonimo")
  }, [])

  const value = useMemo(
    () => ({ usuario, status, login, logout }),
    [usuario, status, login, logout],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider")
  return ctx
}
