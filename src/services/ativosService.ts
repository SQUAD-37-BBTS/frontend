import { isAxiosError } from "axios"
import { api } from "./api"
import { endpoints } from "./endpoints"
import type {
  Ativo,
  AtivoDetalhe,
  Contextualizacao,
  Criticidade,
  Decisao,
  Dominio,
  ModeloFundacional,
  Pagina,
  PessoaResumo,
  ResultadoDecisao,
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

export interface NovaDecisao {
  tipo_decisao: string
  resultado_decisao: ResultadoDecisao
  justificativa: string
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

// ---------- Detalhe do ativo

export const buscarAtivo = (id: string, signal?: AbortSignal) =>
  api.get<AtivoDetalhe>(endpoints.ativoPorId(id), { signal }).then((r) => r.data)

export const removerPapel = (ativoId: string, papelId: string) =>
  api.delete(endpoints.papelDoAtivo(ativoId, papelId))

/** Ativo sem questionário ainda: a API responde 404, tratado como "vazio". */
export const buscarContextualizacao = (id: string) =>
  api
    .get<Contextualizacao>(endpoints.contextualizacao(id))
    .then((r) => r.data)
    .catch((e) => {
      if (isAxiosError(e) && e.response?.status === 404) return null
      throw e
    })

export const salvarContextualizacao = (id: string, respostas: Record<string, unknown>) =>
  api.put<Contextualizacao>(endpoints.contextualizacao(id), { respostas }).then((r) => r.data)

export const listarDecisoes = (id: string) =>
  api.get<Decisao[]>(endpoints.decisoes(id)).then((r) => r.data)

export const registrarDecisao = (id: string, decisao: NovaDecisao) =>
  api.post<Decisao>(endpoints.decisoes(id), decisao).then((r) => r.data)

export const listarModelos = () =>
  api
    .get<Pagina<ModeloFundacional>>(endpoints.modelos, { params: { limite: 100 } })
    .then((r) => r.data.dados)

/** Mensagem amigável para falhas da API (nunca expõe detalhes internos). */
export function mensagemDeErroApi(erro: unknown, acao = "concluir a operação") {
  if (!isAxiosError(erro) || !erro.response) {
    return "Não foi possível conectar ao servidor. Tente novamente."
  }
  // 403 e 409 trazem regras de negócio em português (ex.: "Requer o papel Owner").
  const msg = (erro.response.data as { message?: unknown } | undefined)?.message
  if ((erro.response.status === 403 || erro.response.status === 409) && typeof msg === "string") {
    return msg
  }
  switch (erro.response.status) {
    case 400:
      return "Dados inválidos. Revise os campos e tente novamente."
    case 403:
      return "Você não tem permissão para esta ação."
    case 404:
      return "Registro não encontrado."
    case 409:
      return "Conflito: o registro já existe ou a operação não é permitida no estado atual."
    case 429:
      return "Muitas requisições. Aguarde um instante e tente novamente."
    case 503:
    case 504:
      return "Serviço temporariamente indisponível. Tente novamente em instantes."
    default:
      return `Não foi possível ${acao}.`
  }
}
