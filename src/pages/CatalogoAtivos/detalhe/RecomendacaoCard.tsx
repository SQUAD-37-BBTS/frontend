import { useCallback, useEffect, useState } from "react"
import { Check, Lightbulb, Loader2, X } from "lucide-react"
import { ErroBanner } from "@/components/common/ErroBanner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { formatarData } from "@/lib/ativos"
import { buscarRecomendacao, mensagemDeErroApi, responderRecomendacao } from "@/services/ativosService"
import type { AtivoDetalhe, RecomendacaoGovernanca } from "@/types"

interface Props {
  ativo: AtivoDetalhe
  podeDecidir: boolean
  /** Atualiza o histórico de decisões e o ativo depois de uma resposta. */
  onResposta: () => void
  /** Muda quando papéis ou questionário mudam, para recalcular a recomendação. */
  versao: string
}

/**
 * Recomendação de governança (história 2). A IA só recomenda: aceitar ou
 * rejeitar é ato do Owner, com justificativa, e vira decisão imutável.
 */
export function RecomendacaoCard({ ativo, podeDecidir, onResposta, versao }: Props) {
  const [dados, setDados] = useState<RecomendacaoGovernanca | null>(null)
  const [justificativa, setJustificativa] = useState("")
  const [enviando, setEnviando] = useState<"Aceitar" | "Rejeitar" | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const carregar = useCallback(() => {
    buscarRecomendacao(ativo.id)
      .then(setDados)
      .catch((e) => setErro(mensagemDeErroApi(e, "carregar a recomendação")))
  }, [ativo.id])

  useEffect(carregar, [carregar, versao])

  if (!dados?.recomendacoes.length) return erro ? <ErroBanner mensagem={erro} onRetry={carregar} /> : null

  const responder = async (acao: "Aceitar" | "Rejeitar") => {
    setErro(null)
    setEnviando(acao)
    try {
      await responderRecomendacao(ativo.id, acao, justificativa.trim())
      setJustificativa("")
      carregar()
      onResposta()
    } catch (e) {
      setErro(mensagemDeErroApi(e, "registrar a resposta"))
    } finally {
      setEnviando(null)
    }
  }

  const ultima = dados.ultima_resposta
  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="size-4" /> Recomendação de governança
        </CardTitle>
        <CardDescription>
          Sugestão automática com base no cadastro. A decisão é sempre do Owner e fica registrada.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <p className="text-sm">{dados.texto}</p>
        {ultima && (
          <p className="text-xs text-muted-foreground">
            Última resposta: {ultima.tipo_decisao === "Recomendacao_Aceita" ? "aceita" : "rejeitada"} por{" "}
            {ultima.pessoa.nome} em {formatarData(ultima.data)}.
          </p>
        )}

        {podeDecidir ? (
          <>
            <Field>
              <FieldLabel htmlFor="justificativa_recomendacao">
                Justificativa<span className="text-destructive">*</span>
              </FieldLabel>
              <Textarea
                id="justificativa_recomendacao"
                rows={2}
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                placeholder="Por que está aceitando ou rejeitando a recomendação?"
              />
            </Field>
            {erro && <ErroBanner mensagem={erro} />}
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => responder("Aceitar")} disabled={!justificativa.trim() || enviando !== null}>
                {enviando === "Aceitar" ? <Loader2 className="animate-spin" /> : <Check />} Aceitar
              </Button>
              <Button
                variant="outline"
                onClick={() => responder("Rejeitar")}
                disabled={!justificativa.trim() || enviando !== null}
              >
                {enviando === "Rejeitar" ? <Loader2 className="animate-spin" /> : <X />} Rejeitar
              </Button>
            </div>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">
            Apenas o Owner do ativo (ou um Admin) aceita ou rejeita recomendações.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
