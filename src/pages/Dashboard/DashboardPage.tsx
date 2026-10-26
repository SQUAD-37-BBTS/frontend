import { AlertTriangle, BarChart3, CheckCircle2, Layers, ShieldCheck } from "lucide-react"
import { NovoAtivoDialog } from "@/pages/CatalogoAtivos/NovoAtivoDialog"
import { PageHeader } from "@/components/common/PageHeader"
import { StatCard } from "@/components/common/StatCard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Visão geral da governança de ativos de IA."
        actions={<NovoAtivoDialog />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Ativos Classificados" icon={<CheckCircle2 />} />
        <StatCard label="Simplificada" icon={<AlertTriangle />} />
        <StatCard label="Assistida" icon={<ShieldCheck />} />
        <StatCard label="Orquestrada" icon={<Layers />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ativos recentes</CardTitle>
            <CardDescription>Últimos ativos cadastrados no catálogo.</CardDescription>
          </CardHeader>
          <CardContent>
            <Empty className="border py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BarChart3 />
                </EmptyMedia>
                <EmptyTitle>Nenhum ativo cadastrado</EmptyTitle>
                <EmptyDescription>
                  Os ativos cadastrados aparecerão aqui.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pendências</CardTitle>
            <CardDescription>Ações que aguardam sua atenção.</CardDescription>
          </CardHeader>
          <CardContent>
            <Empty className="border py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CheckCircle2 />
                </EmptyMedia>
                <EmptyTitle>Tudo em dia</EmptyTitle>
                <EmptyDescription>Nenhuma pendência no momento.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
