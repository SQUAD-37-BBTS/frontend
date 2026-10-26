import { api } from "./api"
import { endpoints } from "./endpoints"
import type { DominioCompleto, LogAuditoria, Pagina, Pessoa } from "@/types"

interface Filtro {
  pagina?: number
  limite?: number
  busca?: string
}

export const listarPessoas = (filtros: Filtro, signal?: AbortSignal) =>
  api.get<Pagina<Pessoa>>(endpoints.pessoas, { params: filtros, signal }).then((r) => r.data)

export const listarDominiosCompletos = (filtros: Filtro, signal?: AbortSignal) =>
  api
    .get<Pagina<DominioCompleto>>(endpoints.dominios, { params: filtros, signal })
    .then((r) => r.data)

export const criarDominio = (dominio: { nome: string; owner_id: string }) =>
  api.post(endpoints.dominios, dominio).then((r) => r.data)

// Na auditoria, o campo de busca da tabela filtra por `tabela` (ex.: "ativo").
export const listarAuditoria = ({ busca, ...filtros }: Filtro, signal?: AbortSignal) =>
  api
    .get<Pagina<LogAuditoria>>(endpoints.auditoria, {
      params: { ...filtros, tabela: busca },
      signal,
    })
    .then((r) => r.data)
