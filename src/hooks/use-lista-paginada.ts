import { useEffect, useState } from "react"
import { mensagemDeErroApi } from "@/services/ativosService"
import type { Pagina } from "@/types"

interface Consulta {
  pagina: number
  limite: number
  busca?: string
}

/**
 * Lista paginada com busca no servidor (debounce de 300 ms).
 * `buscar` deve ser uma função estável (definida fora do componente).
 */
export function useListaPaginada<T>(
  buscar: (consulta: Consulta, signal: AbortSignal) => Promise<Pagina<T>>,
  acao: string,
  limite = 20,
) {
  const [busca, setBusca] = useState("")
  const [termo, setTermo] = useState("")
  const [pagina, setPagina] = useState(1)
  const [recarregar, setRecarregar] = useState(0)
  const [resultado, setResultado] = useState<Pagina<T> | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    const id = setTimeout(() => {
      setTermo(busca.trim())
      setPagina(1)
    }, 300)
    return () => clearTimeout(id)
  }, [busca])

  useEffect(() => {
    const controller = new AbortController()
    setCarregando(true)
    setErro(null)
    buscar({ pagina, limite, busca: termo || undefined }, controller.signal)
      .then(setResultado)
      .catch((e) => {
        if (!controller.signal.aborted) setErro(mensagemDeErroApi(e, acao))
      })
      .finally(() => {
        if (!controller.signal.aborted) setCarregando(false)
      })
    return () => controller.abort()
  }, [buscar, acao, limite, pagina, termo, recarregar])

  return {
    busca,
    setBusca,
    termo,
    pagina,
    setPagina,
    limite,
    resultado,
    carregando,
    erro,
    recarregar: () => setRecarregar((n) => n + 1),
  }
}
