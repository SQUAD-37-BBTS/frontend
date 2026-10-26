import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PaginacaoProps {
  pagina: number
  limite: number
  total: number
  desabilitado?: boolean
  onChange: (pagina: number) => void
}

export function Paginacao({ pagina, limite, total, desabilitado, onChange }: PaginacaoProps) {
  if (total <= limite) return null
  const totalPaginas = Math.max(1, Math.ceil(total / limite))

  return (
    <div className="flex items-center justify-end gap-3 text-sm">
      <span className="text-muted-foreground tabular-nums">
        Página {pagina} de {totalPaginas}
      </span>
      <Button
        variant="outline"
        size="icon"
        aria-label="Página anterior"
        disabled={pagina <= 1 || desabilitado}
        onClick={() => onChange(pagina - 1)}
      >
        <ChevronLeft />
      </Button>
      <Button
        variant="outline"
        size="icon"
        aria-label="Próxima página"
        disabled={pagina >= totalPaginas || desabilitado}
        onClick={() => onChange(pagina + 1)}
      >
        <ChevronRight />
      </Button>
    </div>
  )
}
