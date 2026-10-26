import { isAxiosError } from "axios"
import { api } from "./api"
import { endpoints } from "./endpoints"
import type {
  Ativo,
  Criticidade,
  Dominio,
  Pagina,
  PessoaResumo,
  ResumoDashboard,
  SituacaoAtivo,
  TipoPapel,
} from "@/types"

export interface FiltrosAtivos {
  pagina?: number
  limite?: number
  busca?: string
  situacao?: SituacaoAtivo
  dominio_id?: string
}

export interface NovoAtivo {
  nome: string
  tipo_componente: string
  dominio_id: string
  descricao?: string
  objetivo?: string
  criticidade?: Criticidade
  usa_cloud?: boolean
}

export const listarAtivos = (filtros: FiltrosAtivos, signal?: AbortSignal) =>
  api
    .get<Pagina<Ativo>>(endpoints.ativos, { params: filtros, signal })
    .then((r) => r.data)

export const criarAtivo = (ativo: NovoAtivo) =>
  api.post<Ativo>(endpoints.ativos, ativo).then((r) => r.data)

export const adicionarPapel = (ativoId: string, pessoa_id: string, tipo_papel: TipoPapel) =>
  api.post(endpoints.papeisDoAtivo(ativoId), { pessoa_id, tipo_papel })

export const listarDominios = () =>
  api
    .get<Pagina<Dominio>>(endpoints.dominios, { params: { limite: 100 } })
    .then((r) => r.data.dados)

export const listarPessoasAtivas = () =>
  api
    .get<Pagina<PessoaResumo>>(endpoints.pessoas, { params: { limite: 100, ativo: true } })
    .then((r) => r.data.dados)

export const obterResumo = (signal?: AbortSignal) =>
  api.get<ResumoDashboard>(endpoints.dashboard, { signal }).then((r) => r.data)

/** Mensagem amigável para falhas da API (nunca expõe detalhes internos). */
export function mensagemDeErroApi(erro: unknown, acao = "concluir a operação") {
  if (!isAxiosError(erro) || !erro.response) {
    return "Não foi possível conectar ao servidor. Tente novamente."
  }
  switch (erro.response.status) {
    case 400:
      return "Dados inválidos. Revise os campos e tente novamente."
    case 403:
      return "Você não tem permissão para esta ação."
    case 409:
      return "Já existe um registro com esses dados."
    case 429:
      return "Muitas requisições. Aguarde um instante e tente novamente."
    case 503:
    case 504:
      return "Serviço temporariamente indisponível. Tente novamente em instantes."
    default:
      return `Não foi possível ${acao}.`
  }
}
