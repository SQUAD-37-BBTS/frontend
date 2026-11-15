import { useEffect, useState } from "react"
import { obterResumo } from "@/services/ativosService"
import type { ResumoDashboard } from "@/types"

/** Indicadores do catálogo (GET /dashboard). Falha de carga deixa `null`. */
export function useResumo(recarregar = 0, dominioId?: string) {
  const [resumo, setResumo] = useState<ResumoDashboard | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    obterResumo(dominioId, controller.signal)
      .then(setResumo)
      .catch(() => {
        // indicadores são complementares: a página segue utilizável sem eles
      })
    return () => controller.abort()
  }, [recarregar, dominioId])

  return resumo
}
