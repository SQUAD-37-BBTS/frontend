export type StatusAtivo = "Homologado" | "Em Análise" | "Pendente"

export interface Ativo {
  id: string
  nome: string
  tipo: string
  status: StatusAtivo
  classificacao: string
  responsavel: string
}

export type PapelResponsabilidade =
  | "Gestor do Negócio"
  | "Responsável Técnico"
  | "Consumidor"

export interface Responsavel {
  id: string
  nome: string
  email: string
  area: string
  papel: PapelResponsabilidade
}
