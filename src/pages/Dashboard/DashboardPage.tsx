import { useEffect, useState } from "react"
import { Link } from "react-router"
import { BarChart3, CheckCircle2 } from "lucide-react"
import { PageHeader } from "@/components/common/PageHeader"
import { ResumoCards } from "@/components/common/ResumoCards"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { useResumo } from "@/hooks/use-resumo"
import { listarAtivos } from "@/services/ativosService"
import { NovoAtivoDialog } from "@/pages/CatalogoAtivos/NovoAtivoDialog"
import { situacaoVariant } from "@/lib/ativos"
import type { Ativo } from "@/types"

export default function DashboardPage() {
  const [recarregar, setRecarregar] = useState(0)
  const [recentes, setRecentes] = useState<Ativo[]>([])
  const resumo = useResumo(recarregar)

  useEffect(() => {
    const controller = new AbortController()
    listarAtivos({ pagina: 1, limite: 5 }, controller.signal)
      .then((r) => setRecentes(r.dados))
      .catch(() => {
        // lista complementar: em falha, mantém o estado vazio
      })
    return () => controller.abort()
  }, [recarregar])

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
        actions={<NovoAtivoDialog onCreated={() => setRecarregar((n) => n + 1)} />}
      />

      <ResumoCards resumo={resumo} />

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
                    <Badge variant={situacaoVariant[ativo.situacao]}>{ativo.situacao}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pendências</CardTitle>
            <CardDescription>Ações que aguardam sua atenção.</CardDescription>
          </CardHeader>
          <CardContent>
            {pendencias.length === 0 ? (
              <Empty className="border py-12">
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
      </div>
    </>
  )
}
