const ACCESS_KEY = "orion.access_token"
const REFRESH_KEY = "orion.refresh_token"

// O storage pode lançar (modo privado, site data bloqueado): nunca quebrar o app.
function ler(chave: string) {
  try {
    return localStorage.getItem(chave)
  } catch {
    return null
  }
}

function gravar(chave: string, valor: string | null) {
  try {
    if (valor) localStorage.setItem(chave, valor)
    else localStorage.removeItem(chave)
  } catch {
    // sem persistência: a sessão vale só até recarregar
  }
}

export interface Tokens {
  access_token: string
  refresh_token: string
}

export const authStorage = {
  accessToken: () => ler(ACCESS_KEY),
  refreshToken: () => ler(REFRESH_KEY),
  salvar: (tokens: Tokens) => {
    gravar(ACCESS_KEY, tokens.access_token)
    gravar(REFRESH_KEY, tokens.refresh_token)
  },
  limpar: () => {
    gravar(ACCESS_KEY, null)
    gravar(REFRESH_KEY, null)
  },
}

/** Disparado quando a sessão não pode mais ser renovada. */
export const SESSAO_EXPIRADA = "orion:sessao-expirada"
