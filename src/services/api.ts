import axios from "axios"

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
})

// Interceptor de requisição (ex.: anexar token)
api.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem("token")
    // if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error),
)

// Interceptor de resposta (tratamento global de erros)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // const status = error.response?.status
    // if (status === 401) {
    //   localStorage.removeItem("token")
    //   window.location.href = "/login"
    // }
    // if (status === 403) { /* sem permissão */ }
    // if (status >= 500) { /* erro no servidor */ }
    return Promise.reject(error)
  },
)
