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

export type PapelResponsabilidade =
  | "Owner"
  | "Steward"
  | "Responsável Técnico"
  | "Consumidor"

export interface Responsavel {
  id: string
  nome: string
  email: string
  area: string
  papel: PapelResponsabilidade
}
