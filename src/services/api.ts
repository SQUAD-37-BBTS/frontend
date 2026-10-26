import axios, { type InternalAxiosRequestConfig } from "axios"
import { authStorage, SESSAO_EXPIRADA, type Tokens } from "./authStorage"
import { endpoints } from "./endpoints"

const baseURL = import.meta.env.VITE_API_URL

export const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
})

type Retentavel = InternalAxiosRequestConfig & { _retry?: boolean }

// Várias requisições podem receber 401 juntas: uma única renovação atende todas.
let renovando: Promise<string> | null = null

function renovarAccessToken() {
  renovando ??= (async () => {
    const refresh_token = authStorage.refreshToken()
    if (!refresh_token) throw new Error("sem refresh token")
    // Instância sem interceptors, para não entrar em loop.
    const { data } = await axios.post<Tokens>(
      endpoints.refresh,
      { refresh_token },
      { baseURL, timeout: 10000 },
    )
    authStorage.salvar(data)
    return data.access_token
  })().finally(() => {
    renovando = null
  })
  return renovando
}

api.interceptors.request.use((config) => {
  const token = authStorage.accessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as Retentavel | undefined
    const status = error.response?.status
    const ehAuth = config?.url?.startsWith("/auth/")

    // Token de acesso expirado (15 min): renova e repete a requisição uma vez.
    if (status === 401 && config && !config._retry && !ehAuth) {
      config._retry = true
      try {
        const token = await renovarAccessToken()
        config.headers.Authorization = `Bearer ${token}`
        return api(config)
      } catch {
        authStorage.limpar()
        window.dispatchEvent(new Event(SESSAO_EXPIRADA))
      }
    }
    return Promise.reject(error)
  },
)
