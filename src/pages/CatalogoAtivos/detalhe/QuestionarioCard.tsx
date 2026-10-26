import { useEffect, useRef, useState } from "react"
import { isAxiosError, isCancel } from "axios"
import { Loader2, Save, Sparkles } from "lucide-react"
import { ErroBanner } from "@/components/common/ErroBanner"
import { SelectField } from "@/components/common/SelectField"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatarData } from "@/lib/ativos"
import {
  buscarContextualizacao,
  listarModelos,
  mensagemDeErroApi,
  salvarContextualizacao,
  sugerirComIa,
} from "@/services/ativosService"
import type { AtivoDetalhe, ModeloFundacional } from "@/types"

const simNao = [
  { value: "Sim", label: "Sim" },
  { value: "Nao", label: "Não" },
]

// Chaves do JSON `respostas`. As quatro primeiras vêm da etapa 3 do pipeline
// (entrega parcial, seção 3.5); as demais completam a caracterização de risco.
const PERGUNTAS = [
  { chave: "usa_ia", texto: "O ativo usa IA?" },
  { chave: "usa_modelo_fundacional", texto: "Usa modelo fundacional?" },
  { chave: "usa_dados_pessoais", texto: "Possui dados pessoais?" },
  { chave: "interage_com_cliente_final", texto: "Interage com o cliente final?" },
  { chave: "decisao_automatizada", texto: "Toma decisões de forma automatizada?" },
  { chave: "supervisao_humana", texto: "Há supervisão humana das decisões?" },
] as const

type Chave = (typeof PERGUNTAS)[number]["chave"]
type Respostas = Record<string, unknown>
/** Respostas preenchidas por sugestão de IA: valor sugerido e justificativa. */
type Sugeridas = Partial<Record<Chave, { valor: string; justificativa: string }>>

// Após poucos segundos de espera, oferece seguir sem a sugestão (entrega parcial, 1.5).
const ESPERA_ATE_PULAR_MS = 3000

const paraCampo = (v: unknown) => (v === true ? "Sim" : v === false ? "Nao" : "")

const situacaoModelo: Record<ModeloFundacional["situacao"], string> = {
  Homologado: "Homologado",
  Em_Avaliacao: "Em avaliação",
  Restrito: "Restrito",
  Descontinuado: "Descontinuado",
}

interface Props {
  ativo: AtivoDetalhe
  podeEditar: boolean
  onChange: () => void
}

export function QuestionarioCard({ ativo, podeEditar, onChange }: Props) {
  const [original, setOriginal] = useState<Respostas>({})
  const [data, setData] = useState<string | null>(null)
  const [campos, setCampos] = useState<Partial<Record<Chave, string>>>({})
  const [modelos, setModelos] = useState<ModeloFundacional[]>([])
  const [modeloId, setModeloId] = useState("")
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [salvo, setSalvo] = useState(false)
  const [sugeridas, setSugeridas] = useState<Sugeridas>({})
  const [sugerindo, setSugerindo] = useState(false)
  const [demorando, setDemorando] = useState(false)
  const [avisoIa, setAvisoIa] = useState<string | null>(null)
  const sugestaoRef = useRef<AbortController | null>(null)

  useEffect(() => {
    let ativoNaTela = true
    buscarContextualizacao(ativo.id)
      .then((c) => {
        if (!ativoNaTela) return
        const respostas = c?.respostas ?? {}
        setOriginal(respostas)
        setData(c?.data ?? null)
        const campos = Object.fromEntries(PERGUNTAS.map((p) => [p.chave, paraCampo(respostas[p.chave])]))
        setCampos(campos)
        // Respostas já gravadas com origem "ia" continuam marcadas enquanto não forem corrigidas.
        const origens = (respostas.origens ?? {}) as Record<string, string>
        setSugeridas(
          Object.fromEntries(
            PERGUNTAS.filter((p) => origens[p.chave] === "ia" && campos[p.chave]).map((p) => [
              p.chave,
              { valor: campos[p.chave], justificativa: "" },
            ]),
          ),
        )
        const m = respostas.modelo_fundacional
        if (m && typeof m === "object" && "id" in m) setModeloId(String((m as { id: string }).id))
      })
      .catch((e) => ativoNaTela && setErro(mensagemDeErroApi(e, "carregar o questionário")))
      .finally(() => ativoNaTela && setCarregando(false))
    // catálogo de modelos: consultado para não exigir redigitação (etapa 3 / processo B)
    listarModelos().then((m) => ativoNaTela && setModelos(m)).catch(() => undefined)
    return () => {
      ativoNaTela = false
      sugestaoRef.current?.abort()
    }
  }, [ativo.id])

  const usaModelo = campos.usa_modelo_fundacional === "Sim"
  const modelo = modelos.find((m) => m.id === modeloId)
  // Resposta antiga em texto livre (ex.: dados de exemplo) conta como preenchida.
  const modeloLegado = typeof original.modelo_fundacional === "string" ? original.modelo_fundacional : null

  // Corrigir uma sugestão (valor diferente do sugerido) passa a contar como resposta do usuário.
  const alterarCampo = (chave: Chave, valor: string) => {
    setCampos((c) => ({ ...c, [chave]: valor }))
    setSugeridas((s) => (s[chave]?.valor === valor ? s : { ...s, [chave]: undefined }))
  }

  const pularSugestao = () => {
    sugestaoRef.current?.abort()
    setAvisoIa("Sugestão ignorada. Preencha o questionário manualmente.")
  }

  const sugerir = async () => {
    const controller = new AbortController()
    sugestaoRef.current = controller
    setAvisoIa(null)
    setErro(null)
    setSugerindo(true)
    setDemorando(false)
    const timer = setTimeout(() => setDemorando(true), ESPERA_ATE_PULAR_MS)
    try {
      const r = await sugerirComIa(ativo.id, controller.signal)
      // Só preenche o que ainda não foi respondido: nunca sobrescreve o usuário.
      const novas: Sugeridas = {}
      const preenchidos: Partial<Record<Chave, string>> = {}
      for (const { chave } of PERGUNTAS) {
        const sugestao = r.sugestoes[chave]
        if (!sugestao || campos[chave]) continue
        const valor = sugestao.valor ? "Sim" : "Nao"
        preenchidos[chave] = valor
        novas[chave] = { valor, justificativa: sugestao.justificativa }
      }
      setCampos((c) => ({ ...c, ...preenchidos }))
      setSugeridas((s) => ({ ...s, ...novas }))
      setAvisoIa(
        Object.keys(novas).length
          ? "Sugestões da IA aplicadas. Revise, confirme ou corrija cada resposta antes de salvar."
          : "A IA não trouxe sugestões para as perguntas ainda em branco.",
      )
    } catch (e) {
      if (isCancel(e)) return
      // 422: descrição curta (a mensagem vem da API). Demais falhas: IA fora do ar ou lenta.
      const insuficiente = isAxiosError(e) && e.response?.status === 422
      setAvisoIa(
        insuficiente
          ? mensagemDeErroApi(e)
          : "Sugestão automática indisponível no momento. Preencha o questionário manualmente.",
      )
    } finally {
      clearTimeout(timer)
      setSugerindo(false)
      setDemorando(false)
    }
  }

  const salvar = async () => {
    setErro(null)
    setSalvo(false)
    if (usaModelo && !modelo && !modeloLegado) {
      setErro("Selecione o modelo fundacional utilizado.")
      return
    }
    // Preserva chaves desconhecidas já gravadas e registra a origem das respostas.
    const respostas: Respostas = { ...original }
    const origens: Record<string, string> = {
      ...((original.origens as Record<string, string> | undefined) ?? {}),
    }
    for (const { chave } of PERGUNTAS) {
      const v = campos[chave]
      if (v) {
        respostas[chave] = v === "Sim"
        origens[chave] = sugeridas[chave]?.valor === v ? "ia" : "usuario"
      } else {
        delete respostas[chave]
        delete origens[chave]
      }
    }
    if (usaModelo && modelo) {
      respostas.modelo_fundacional = {
        id: modelo.id,
        fornecedor: modelo.fornecedor,
        modelo: modelo.modelo,
        versao_variante: modelo.versao_variante,
        situacao: modelo.situacao,
      }
    } else if (!usaModelo) {
      delete respostas.modelo_fundacional
    }
    respostas.origens = origens

    setSalvando(true)
    try {
      const c = await salvarContextualizacao(ativo.id, respostas)
      setOriginal(c.respostas)
      setData(c.data)
      setSalvo(true)
      onChange()
    } catch (e) {
      setErro(mensagemDeErroApi(e, "salvar o questionário"))
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Questionário de avaliação</CardTitle>
        <CardDescription>
          {data ? `Última atualização em ${formatarData(data)}.` : "Ainda não preenchido."}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {carregando ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {PERGUNTAS.map((p) => (
                <SelectField
                  key={p.chave}
                  id={p.chave}
                  label={p.texto}
                  options={simNao}
                  value={campos[p.chave] ?? ""}
                  onChange={(v) => alterarCampo(p.chave, v)}
                  disabled={!podeEditar}
                  placeholder="Não respondido"
                />
              ))}
            </div>

            {PERGUNTAS.some((p) => campos[p.chave] && sugeridas[p.chave]) && (
              <ul className="grid gap-1 rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
                {PERGUNTAS.filter((p) => campos[p.chave] && sugeridas[p.chave]).map((p) => (
                  <li key={p.chave}>
                    <Badge variant="outline">Sugerido pela IA</Badge> <strong>{p.texto}</strong>{" "}
                    {sugeridas[p.chave]?.justificativa}
                  </li>
                ))}
              </ul>
            )}

            {usaModelo && (
              <div className="grid gap-2">
                <SelectField
                  id="modelo_fundacional"
                  label="Modelo fundacional"
                  required
                  options={modelos.map((m) => ({
                    value: m.id,
                    label: `${m.fornecedor} ${m.modelo}${m.versao_variante ? ` ${m.versao_variante}` : ""}`,
                  }))}
                  value={modeloId}
                  onChange={setModeloId}
                  disabled={!podeEditar}
                  placeholder={modeloLegado ? `Registrado: ${modeloLegado}` : "Selecione"}
                />
                {modelo && (
                  <p className="text-xs text-muted-foreground">
                    Situação no catálogo: <strong>{situacaoModelo[modelo.situacao]}</strong>
                    {modelo.restricoes_uso ? ` — ${modelo.restricoes_uso}` : ""}
                  </p>
                )}
              </div>
            )}

            {avisoIa && <p className="text-sm text-muted-foreground">{avisoIa}</p>}
            {erro && <ErroBanner mensagem={erro} />}
            {salvo && <p className="text-sm text-muted-foreground">Questionário salvo.</p>}

            {podeEditar ? (
              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={salvar} disabled={salvando || sugerindo}>
                  {salvando ? <Loader2 className="animate-spin" /> : <Save />} Salvar respostas
                </Button>
                <Button variant="outline" onClick={sugerir} disabled={sugerindo || salvando}>
                  {sugerindo ? <Loader2 className="animate-spin" /> : <Sparkles />}
                  {sugerindo ? "Analisando a descrição..." : "Sugerir com IA"}
                </Button>
                {sugerindo && demorando && (
                  <Button variant="ghost" onClick={pularSugestao}>
                    Pular sugestão e preencher manualmente
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Apenas o Owner ou o Responsável Técnico do ativo podem editar o questionário.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
