import { useEffect, useState } from "react"
import { Link } from "react-router"
import { BarChart3, CheckCircle2, Layers, ShieldAlert, X } from "lucide-react"
import { PageHeader } from "@/components/common/PageHeader"
import { ResumoCards } from "@/components/common/ResumoCards"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { useResumo } from "@/hooks/use-resumo"
import { listarAtivos } from "@/services/ativosService"
import { NovoAtivoDialog } from "@/pages/CatalogoAtivos/NovoAtivoDialog"
import { situacaoVariant } from "@/lib/ativos"
import type { Ativo, Criticidade } from "@/types"

const CRITICIDADE_LABEL: Record<Criticidade, string> = {
  Baixa: "Baixa",
  Media: "Média",
  Alta: "Alta",
  Critica: "Crítica",
}

const CRITICIDADE_META: Record<string, { label: string; barClass: string; order: number }> = {
  Critica: { label: "Crítica", barClass: "bg-tone-critical", order: 1 },
  Alta: { label: "Alta", barClass: "bg-tone-warning", order: 2 },
  Media: { label: "Média", barClass: "bg-tone-info", order: 3 },
  Baixa: { label: "Baixa", barClass: "bg-tone-positive", order: 4 },
  Nao_Classificada: { label: "Não classificada", barClass: "bg-muted-foreground/40", order: 5 },
}

const TRILHA_META: Record<string, { label: string; order: number }> = {
  Simplificada: { label: "Simplificada", order: 1 },
  Assistida: { label: "Assistida", order: 2 },
  Orquestrada: { label: "Orquestrada", order: 3 },
  Nao_Classificada: { label: "Aguardando enquadramento", order: 4 },
}

export default function DashboardPage() {
  const [recarregar, setRecarregar] = useState(0)
  const [dominioSelecionado, setDominioSelecionado] = useState<{ id: string; nome: string } | null>(null)
  const [recentes, setRecentes] = useState<Ativo[]>([])

  const resumo = useResumo(recarregar, dominioSelecionado?.id)

  useEffect(() => {
    const controller = new AbortController()
    listarAtivos(
      { pagina: 1, limite: 5, dominio_id: dominioSelecionado?.id },
      controller.signal,
    )
      .then((r) => setRecentes(r.dados))
      .catch(() => {
        // lista complementar: em falha, mantém o estado vazio
      })
    return () => controller.abort()
  }, [recarregar, dominioSelecionado?.id])

  const totalAtivos = resumo?.total ?? 0

  const criticidades = resumo
    ? Object.entries(resumo.por_criticidade ?? {})
        .map(([chave, total]) => {
          const meta = CRITICIDADE_META[chave] ?? {
            label: chave.replace(/_/g, " "),
            barClass: "bg-primary",
            order: 99,
          }
          return { chave, total, ...meta }
        })
        .sort((a, b) => a.order - b.order)
    : []

  const dominios = resumo
    ? [...(resumo.por_dominio ?? [])].sort((a, b) => b.total - a.total)
    : []

  const trilhas = resumo
    ? Object.entries(resumo.por_trilha ?? {})
        .map(([chave, total]) => {
          const meta = TRILHA_META[chave] ?? {
            label: chave.replace(/_/g, " "),
            order: 99,
          }
          return { chave, total, ...meta }
        })
        .sort((a, b) => a.order - b.order)
    : []

  const pendencias = resumo
    ? [
        { label: "Ativos sem Owner", total: resumo.pendencias.sem_owner },
        { label: "Aguardando decisão", total: resumo.pendencias.aguardando_decisao },
        { label: "Sem questionário de avaliação", total: resumo.pendencias.sem_questionario },
      ].filter((p) => p.total > 0)
    : []

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Visão geral da governança de ativos de IA."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {dominioSelecionado && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDominioSelecionado(null)}
              >
                Domínio: {dominioSelecionado.nome}
                <X className="ml-1.5 size-3.5" />
              </Button>
            )}
            <NovoAtivoDialog onCreated={() => setRecarregar((n) => n + 1)} />
          </div>
        }
      />

      <ResumoCards resumo={resumo} />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por criticidade</CardTitle>
            <CardDescription>Criticidade operacional dos ativos no catálogo.</CardDescription>
          </CardHeader>
          <CardContent>
            {criticidades.length === 0 ? (
              <Empty className="border py-10">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ShieldAlert />
                  </EmptyMedia>
                  <EmptyTitle>Sem dados de criticidade</EmptyTitle>
                  <EmptyDescription>Os indicadores de risco aparecerão aqui.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <ul className="space-y-4">
                {criticidades.map((item) => {
                  const percentual = totalAtivos > 0 ? Math.round((item.total / totalAtivos) * 100) : 0
                  return (
                    <li key={item.chave} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.label}</span>
                        <span className="tabular-nums text-muted-foreground">
                          {item.total} ({percentual}%)
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all ${item.barClass}`}
                          style={{ width: `${percentual}%` }}
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ativos por domínio</CardTitle>
            <CardDescription>
              {dominioSelecionado
                ? "Clique no botão do topo para voltar à visão geral."
                : "Clique em uma área para filtrar o dashboard."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dominios.length === 0 ? (
              <Empty className="border py-10">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Layers />
                  </EmptyMedia>
                  <EmptyTitle>Nenhum domínio vinculado</EmptyTitle>
                  <EmptyDescription>A distribuição por área aparecerá aqui.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <ul className="space-y-3">
                {dominios.map((dom) => {
                  const nome = dom.nome ?? "Sem domínio"
                  const percentual = totalAtivos > 0 ? Math.round((dom.total / totalAtivos) * 100) : 0
                  const ativo = dominioSelecionado?.id === dom.dominio_id
                  return (
                    <li key={dom.dominio_id}>
                      <button
                        type="button"
                        onClick={() =>
                          setDominioSelecionado(ativo ? null : { id: dom.dominio_id, nome })
                        }
                        className="w-full space-y-1.5 rounded-lg p-1.5 text-left transition-colors hover:bg-muted/60"
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{nome}</span>
                          <span className="tabular-nums text-muted-foreground">
                            {dom.total} ({percentual}%)
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${percentual}%` }}
                          />
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ativos recentes</CardTitle>
            <CardDescription>Últimos ativos atualizados no catálogo.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentes.length === 0 ? (
              <Empty className="border py-12">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <BarChart3 />
                  </EmptyMedia>
                  <EmptyTitle>Nenhum ativo cadastrado</EmptyTitle>
                  <EmptyDescription>Os ativos cadastrados aparecerão aqui.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <ul className="divide-y">
                {recentes.map((ativo) => (
                  <li key={ativo.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <Link
                        to={`/catalogo-ativos/${ativo.id}`}
                        className="block truncate font-medium hover:underline"
                      >
                        {ativo.nome}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">
                        {ativo.dominio.nome} · {ativo.tipo_componente}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {ativo.criticidade && (
                        <Badge variant="outline">
                          {CRITICIDADE_LABEL[ativo.criticidade]}
                        </Badge>
                      )}
                      <Badge variant={situacaoVariant[ativo.situacao]}>{ativo.situacao}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Pendências</CardTitle>
              <CardDescription>Ações que aguardam sua atenção.</CardDescription>
            </CardHeader>
            <CardContent>
              {pendencias.length === 0 ? (
                <Empty className="border py-10">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <CheckCircle2 />
                    </EmptyMedia>
                    <EmptyTitle>Tudo em dia</EmptyTitle>
                    <EmptyDescription>Nenhuma pendência no momento.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <ul className="divide-y">
                  {pendencias.map((p) => (
                    <li key={p.label} className="flex items-center justify-between py-3 text-sm">
                      <span>{p.label}</span>
                      <Badge variant="secondary" className="tabular-nums">
                        {p.total}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trilhas de governança</CardTitle>
              <CardDescription>Enquadramento automático dos ativos avaliados.</CardDescription>
            </CardHeader>
            <CardContent>
              {trilhas.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Nenhuma trilha calculada ainda.
                </p>
              ) : (
                <ul className="divide-y">
                  {trilhas.map((t) => (
                    <li key={t.chave} className="flex items-center justify-between py-2.5 text-sm">
                      <span>{t.label}</span>
                      <Badge variant="outline" className="tabular-nums">
                        {t.total}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}