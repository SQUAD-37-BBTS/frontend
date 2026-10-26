import type { Criticidade, ResultadoDecisao, SituacaoAtivo, TipoPapel } from "@/types"

export const situacaoVariant: Record<SituacaoAtivo, "default" | "secondary" | "outline"> = {
  Inventariado: "default",
  Rascunho: "secondary",
  Descontinuado: "outline",
}

export const criticidadeLabel: Record<Criticidade, string> = {
  Baixa: "Baixa",
  Media: "Média",
  Alta: "Alta",
  Critica: "Crítica",
}

export const papelLabel: Record<TipoPapel, string> = {
  Owner: "Owner",
  Steward: "Steward",
  Responsavel_Tecnico: "Responsável Técnico",
  Consumidor: "Consumidor",
}

export const resultadoLabel: Record<ResultadoDecisao, string> = {
  Aprovado: "Aprovado",
  Rejeitado: "Rejeitado",
  Risco_Aceito: "Risco aceito",
  Adequacao_Solicitada: "Adequação solicitada",
}

export const resultadoVariant: Record<ResultadoDecisao, "default" | "secondary" | "destructive" | "outline"> = {
  Aprovado: "default",
  Rejeitado: "destructive",
  Risco_Aceito: "secondary",
  Adequacao_Solicitada: "outline",
}

export const tiposDecisao = [
  { value: "Aprovacao_Inicial", label: "Aprovação inicial" },
  { value: "Reavaliacao", label: "Reavaliação" },
  { value: "Aceite_Risco", label: "Aceite de risco" },
]

export const rotuloTipoDecisao = (valor: string) =>
  tiposDecisao.find((t) => t.value === valor)?.label ?? valor.replaceAll("_", " ")

export const formatarData = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
