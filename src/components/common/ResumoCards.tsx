import { useEffect, useState } from "react"
import { AlertTriangle, CheckCircle2, FileQuestion, Layers, UserX } from "lucide-react"
import { StatCard } from "@/components/common/StatCard"
import { obterResumo } from "@/services/ativosService"
import type { ResumoDashboard } from "@/types"

/** Indicadores do catálogo (GET /dashboard). Falha de carga mostra "—". */
export function ResumoCards({ recarregar }: { recarregar?: number }) {
  const [resumo, setResumo] = useState<ResumoDashboard | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    obterResumo(controller.signal)
      .then(setResumo)
      .catch(() => {
        // indicadores são complementares: a página segue utilizável sem eles
      })
    return () => controller.abort()
  }, [recarregar])

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
