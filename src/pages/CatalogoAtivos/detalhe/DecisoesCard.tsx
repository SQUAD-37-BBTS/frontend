import { useCallback, useEffect, useState, type FormEvent } from "react"
import { Gavel, Loader2 } from "lucide-react"
import { ErroBanner } from "@/components/common/ErroBanner"
import { SelectField } from "@/components/common/SelectField"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import {
  formatarData,
  resultadoLabel,
  resultadoVariant,
  rotuloTipoDecisao,
  tiposDecisao,
} from "@/lib/ativos"
import { listarDecisoes, mensagemDeErroApi, registrarDecisao } from "@/services/ativosService"
import type { AtivoDetalhe, Decisao, ResultadoDecisao } from "@/types"

const opcoesResultado = (Object.keys(resultadoLabel) as ResultadoDecisao[]).map((r) => ({
  value: r,
  label: resultadoLabel[r],
}))

interface Props {
  ativo: AtivoDetalhe
  podeDecidir: boolean
  onChange: () => void
}

export function DecisoesCard({ ativo, podeDecidir, onChange }: Props) {
  const [decisoes, setDecisoes] = useState<Decisao[]>([])
  const [tipo, setTipo] = useState("")
  const [resultado, setResultado] = useState("")
  const [justificativa, setJustificativa] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const carregar = useCallback(() => {
    listarDecisoes(ativo.id)
      .then(setDecisoes)
      .catch((e) => setErro(mensagemDeErroApi(e, "carregar o histórico")))
  }, [ativo.id])

  useEffect(carregar, [carregar])

  const descontinuado = ativo.situacao === "Descontinuado"
  const inventaria =
    ativo.situacao === "Rascunho" && (resultado === "Aprovado" || resultado === "Risco_Aceito")

  const enviar = async (event: FormEvent) => {
    event.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      await registrarDecisao(ativo.id, {
        tipo_decisao: tipo,
        resultado_decisao: resultado as ResultadoDecisao,
        justificativa: justificativa.trim(),
      })
      setTipo("")
      setResultado("")
      setJustificativa("")
      carregar()
      onChange() // a situação do ativo pode ter mudado
    } catch (e) {
      setErro(mensagemDeErroApi(e, "registrar a decisão"))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Decisões de governança</CardTitle>
        <CardDescription>
          Histórico imutável: decisões não podem ser editadas nem removidas.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {decisoes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma decisão registrada.</p>
        ) : (
          <ul className="divide-y">
            {decisoes.map((d) => (
              <li key={d.id} className="grid gap-1 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={resultadoVariant[d.resultado_decisao]}>
                      {resultadoLabel[d.resultado_decisao]}
                    </Badge>
                    <span className="font-medium">{rotuloTipoDecisao(d.tipo_decisao)}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {d.pessoa.nome} · {formatarData(d.data)}
                  </span>
                </div>
                <p className="text-muted-foreground">{d.justificativa}</p>
              </li>
            ))}
          </ul>
        )}

        {podeDecidir && !descontinuado && (
          <form onSubmit={enviar} className="grid gap-4 border-t pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                id="tipo_decisao"
                label="Tipo de decisão"
                required
                options={tiposDecisao}
                value={tipo}
                onChange={setTipo}
              />
              <SelectField
                id="resultado_decisao"
                label="Resultado"
                required
                options={opcoesResultado}
                value={resultado}
                onChange={setResultado}
              />
            </div>
            <Field>
              <FieldLabel htmlFor="justificativa">
                Justificativa<span className="text-destructive">*</span>
              </FieldLabel>
              <Textarea
                id="justificativa"
                rows={3}
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                placeholder="Explique o motivo da decisão..."
              />
            </Field>
            {inventaria && (
              <p className="text-xs text-muted-foreground">
                Ao registrar, o ativo passará de Rascunho para Inventariado. O questionário de
                avaliação precisa estar preenchido.
              </p>
            )}
            {erro && <ErroBanner mensagem={erro} />}
            <div>
              <Button type="submit" disabled={enviando || !tipo || !resultado || !justificativa.trim()}>
                {enviando ? <Loader2 className="animate-spin" /> : <Gavel />} Registrar decisão
              </Button>
            </div>
          </form>
        )}

        {!podeDecidir && (
          <p className="text-xs text-muted-foreground">
            Apenas o Owner do ativo (ou um Admin) registra decisões.
          </p>
        )}
        {descontinuado && (
          <p className="text-xs text-muted-foreground">Ativo descontinuado não recebe novas decisões.</p>
        )}
        {!podeDecidir && erro && <ErroBanner mensagem={erro} />}
      </CardContent>
    </Card>
  )
}
