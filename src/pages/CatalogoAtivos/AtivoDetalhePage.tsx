import { useCallback, useEffect, useState } from "react"
import { Link, useParams } from "react-router"
import { ArrowLeft } from "lucide-react"
import { ErroBanner } from "@/components/common/ErroBanner"
import { PageHeader } from "@/components/common/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { criticidadeLabel, situacaoVariant } from "@/lib/ativos"
import { buscarAtivo, mensagemDeErroApi } from "@/services/ativosService"
import { DecisoesCard } from "./detalhe/DecisoesCard"
import { PapeisCard } from "./detalhe/PapeisCard"
import { QuestionarioCard } from "./detalhe/QuestionarioCard"
import { RecomendacaoCard } from "./detalhe/RecomendacaoCard"
import type { AtivoDetalhe } from "@/types"

function Informacao({ rotulo, valor }: { rotulo: string; valor?: string | null }) {
  return (
    <div className="grid gap-1">
      <dt className="text-xs font-medium tracking-wider text-muted-foreground uppercase">{rotulo}</dt>
      <dd className="text-sm">{valor || "—"}</dd>
    </div>
  )
}

export default function AtivoDetalhePage() {
  const { id = "" } = useParams()
  const { usuario } = useAuth()
  const [ativo, setAtivo] = useState<AtivoDetalhe | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  // Incrementado quando a recomendação é respondida, para recarregar o histórico de decisões.
  const [versaoDecisoes, setVersaoDecisoes] = useState(0)

  const carregar = useCallback(
    (signal?: AbortSignal) =>
      buscarAtivo(id, signal)
        .then((a) => {
          setAtivo(a)
          setErro(null)
        })
        .catch((e) => {
          if (!signal?.aborted) setErro(mensagemDeErroApi(e, "carregar o ativo"))
        }),
    [id],
  )

  useEffect(() => {
    const controller = new AbortController()
    carregar(controller.signal)
    return () => controller.abort()
  }, [carregar])

  const voltar = (
    <Button variant="outline" render={<Link to="/catalogo-ativos" />}>
      <ArrowLeft /> Voltar ao catálogo
    </Button>
  )

  if (!ativo) {
    return (
      <>
        <PageHeader title="Ativo" actions={voltar} />
        {erro ? (
          <ErroBanner mensagem={erro} onRetry={() => carregar()} />
        ) : (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        )}
      </>
    )
  }

  // Espelha as regras do backend (a API continua sendo a autoridade: 403 se divergir).
  const admin = usuario?.papel_sistema === "Admin"
  const meusPapeis = ativo.papel_ativo.filter((p) => p.pessoa_id === usuario?.id).map((p) => p.tipo_papel)
  const ehOwner = admin || meusPapeis.includes("Owner")
  const podeQuestionario = ehOwner || meusPapeis.includes("Responsavel_Tecnico")
  const recarregar = () => void carregar()
  const aoResponderRecomendacao = () => {
    setVersaoDecisoes((v) => v + 1)
    recarregar()
  }

  return (
    <>
      <PageHeader
        title={ativo.nome}
        description={`${ativo.dominio.nome} · ${ativo.tipo_componente}`}
        actions={voltar}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={situacaoVariant[ativo.situacao]}>{ativo.situacao}</Badge>
        {ativo.criticidade && <Badge variant="outline">Criticidade {criticidadeLabel[ativo.criticidade]}</Badge>}
        {ativo.pendencias.includes("sem_owner") && <Badge variant="destructive">Sem Owner</Badge>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações</CardTitle>
          <CardDescription>Cadastro do componente.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Informacao rotulo="Descrição" valor={ativo.descricao} />
            <Informacao rotulo="Objetivo" valor={ativo.objetivo} />
            <Informacao rotulo="Usa cloud" valor={ativo.usa_cloud ? "Sim" : "Não"} />
            <Informacao rotulo="Trilha de governança" valor={ativo.motor_enquadramento?.trilha_governanca} />
          </dl>
        </CardContent>
      </Card>

      <RecomendacaoCard
        ativo={ativo}
        podeDecidir={ehOwner}
        onResposta={aoResponderRecomendacao}
        versao={`${ativo.papel_ativo.map((p) => p.id).join(",")}|${ativo.contextualizacao_avaliacao?.updated_at ?? ""}`}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <PapeisCard ativo={ativo} podeEditar={ehOwner} onChange={recarregar} />
        <QuestionarioCard ativo={ativo} podeEditar={podeQuestionario} onChange={recarregar} />
      </div>

      <DecisoesCard key={versaoDecisoes} ativo={ativo} podeDecidir={ehOwner} onChange={recarregar} />
    </>
  )
}
