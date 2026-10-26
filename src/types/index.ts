// Tipos espelham os contratos da API do backend (campos em snake_case).

export type SituacaoAtivo = "Rascunho" | "Inventariado" | "Descontinuado"

export type Criticidade = "Baixa" | "Media" | "Alta" | "Critica"

export type TipoPapel = "Owner" | "Steward" | "Responsavel_Tecnico" | "Consumidor"

export interface PessoaResumo {
  id: string
  nome: string
  email: string
}

export interface PapelAtivo {
  tipo_papel: TipoPapel
  pessoa: PessoaResumo
}

export interface Dominio {
  id: string
  nome: string
}

export type Pendencia = "sem_owner"

export interface Ativo {
  id: string
  nome: string
  tipo_componente: string
  descricao: string | null
  objetivo: string | null
  dominio_id: string
  situacao: SituacaoAtivo
  criticidade: Criticidade | null
  usa_cloud: boolean
  created_at: string
  updated_at: string
  dominio: Dominio
  motor_enquadramento: { trilha_governanca: string } | null
  /** Na listagem, apenas Owner e Steward. */
  papel_ativo: PapelAtivo[]
  pendencias: Pendencia[]
}

export interface Pagina<T> {
  dados: T[]
  total: number
  pagina: number
  limite: number
}

export interface ResumoDashboard {
  total: number
  por_situacao: Record<string, number>
  por_criticidade: Record<string, number>
  por_trilha: Record<string, number>
  por_dominio: { dominio_id: string; nome: string | null; total: number }[]
  pendencias: {
    sem_owner: number
    aguardando_decisao: number
    sem_questionario: number
  }
}

export type PapelSistema = "Admin" | "Usuario"

export interface Usuario {
  id: string
  nome: string
  email: string
  area: string | null
  papel_sistema: PapelSistema
}

export interface Pessoa extends PessoaResumo {
  area: string | null
  papel_sistema: PapelSistema
  ativo: boolean
}

export type ResultadoDecisao =
  | "Aprovado"
  | "Rejeitado"
  | "Risco_Aceito"
  | "Adequacao_Solicitada"

export interface Decisao {
  id: string
  tipo_decisao: string
  justificativa: string
  resultado_decisao: ResultadoDecisao
  data: string
  pessoa: PessoaResumo
}

/** Papel com id (detalhe do ativo), necessário para remoção. */
export interface PapelDoAtivo extends PapelAtivo {
  id: string
  pessoa_id: string
}

export interface AtivoDetalhe extends Omit<Ativo, "papel_ativo"> {
  papel_ativo: PapelDoAtivo[]
  contextualizacao_avaliacao: { id: string; data: string; updated_at: string } | null
}

export interface Contextualizacao {
  respostas: Record<string, unknown>
  data: string
}

export interface ModeloFundacional {
  id: string
  fornecedor: string
  modelo: string
  versao_variante: string | null
  situacao: "Homologado" | "Em_Avaliacao" | "Restrito" | "Descontinuado"
  restricoes_uso: string | null
}

export interface DominioCompleto extends Dominio {
  owner_id: string
  pessoa: PessoaResumo
  _count: { ativo: number }
}

export interface LogAuditoria {
  id: string
  tabela_afetada: string
  data_alteracao: string
  motivo: string | null
  pessoa: PessoaResumo
}
