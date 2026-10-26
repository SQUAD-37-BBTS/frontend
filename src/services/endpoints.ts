// Configuração central dos endpoints
export const endpoints = {
  login: "/auth/login",
  refresh: "/auth/refresh",
  logout: "/auth/logout",
  me: "/auth/me",
  ativos: "/ativos",
  papeisDoAtivo: (id: string) => `/ativos/${id}/papeis`,
  dominios: "/dominios",
  pessoas: "/pessoas",
  dashboard: "/dashboard",
}
