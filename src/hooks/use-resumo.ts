import { useEffect, useState } from "react"
import { obterResumo } from "@/services/ativosService"
import type { ResumoDashboard } from "@/types"

/** Indicadores do catálogo (GET /dashboard). Falha de carga deixa `null`. */
export function useResumo(recarregar = 0) {
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

  return resumo
}
