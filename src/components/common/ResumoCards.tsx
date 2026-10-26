import { AlertTriangle, CheckCircle2, FileQuestion, Layers, UserX } from "lucide-react"
import { StatCard } from "@/components/common/StatCard"
import type { ResumoDashboard } from "@/types"

/** Indicadores do catálogo. Sem dados (carregando ou falha), exibe "—". */
export function ResumoCards({ resumo }: { resumo: ResumoDashboard | null }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total de ativos" value={resumo?.total} icon={<Layers />} />
      <StatCard
        label="Inventariados"
        value={resumo ? (resumo.por_situacao.Inventariado ?? 0) : undefined}
        icon={<CheckCircle2 />}
      />
      <StatCard
        label="Aguardando decisão"
        value={resumo?.pendencias.aguardando_decisao}
        icon={<FileQuestion />}
      />
      <StatCard
        label="Sem Owner"
        value={resumo?.pendencias.sem_owner}
        icon={resumo?.pendencias.sem_owner ? <AlertTriangle /> : <UserX />}
      />
    </div>
  )
}
