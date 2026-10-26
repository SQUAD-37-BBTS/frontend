import { useEffect, useState } from "react"
import { Loader2, Save } from "lucide-react"
import { ErroBanner } from "@/components/common/ErroBanner"
import { SelectField } from "@/components/common/SelectField"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatarData } from "@/lib/ativos"
import {
  buscarContextualizacao,
  listarModelos,
  mensagemDeErroApi,
  salvarContextualizacao,
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

  useEffect(() => {
    let ativoNaTela = true
    buscarContextualizacao(ativo.id)
      .then((c) => {
        if (!ativoNaTela) return
        const respostas = c?.respostas ?? {}
        setOriginal(respostas)
        setData(c?.data ?? null)
        setCampos(Object.fromEntries(PERGUNTAS.map((p) => [p.chave, paraCampo(respostas[p.chave])])))
        const m = respostas.modelo_fundacional
        if (m && typeof m === "object" && "id" in m) setModeloId(String((m as { id: string }).id))
      })
      .catch((e) => ativoNaTela && setErro(mensagemDeErroApi(e, "carregar o questionário")))
      .finally(() => ativoNaTela && setCarregando(false))
    // catálogo de modelos: consultado para não exigir redigitação (etapa 3 / processo B)
    listarModelos().then((m) => ativoNaTela && setModelos(m)).catch(() => undefined)
    return () => {
      ativoNaTela = false
    }
  }, [ativo.id])

  const usaModelo = campos.usa_modelo_fundacional === "Sim"
  const modelo = modelos.find((m) => m.id === modeloId)
  // Resposta antiga em texto livre (ex.: dados de exemplo) conta como preenchida.
  const modeloLegado = typeof original.modelo_fundacional === "string" ? original.modelo_fundacional : null

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
        origens[chave] = "usuario"
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
                  onChange={(v) => setCampos((c) => ({ ...c, [p.chave]: v }))}
                  disabled={!podeEditar}
                  placeholder="Não respondido"
                />
              ))}
            </div>

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

            {erro && <ErroBanner mensagem={erro} />}
            {salvo && <p className="text-sm text-muted-foreground">Questionário salvo.</p>}

            {podeEditar ? (
              <div>
                <Button onClick={salvar} disabled={salvando}>
                  {salvando ? <Loader2 className="animate-spin" /> : <Save />} Salvar respostas
                </Button>
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
