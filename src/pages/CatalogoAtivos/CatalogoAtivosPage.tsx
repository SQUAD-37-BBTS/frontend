import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DataTable, type Column } from "@/components/common/DataTable"
import { PageHeader } from "@/components/common/PageHeader"
import { ResumoCards } from "@/components/common/ResumoCards"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { listarAtivos, mensagemDeErroApi } from "@/services/ativosService"
import { NovoAtivoDialog } from "./NovoAtivoDialog"
import type { Ativo, Criticidade, Pagina, SituacaoAtivo } from "@/types"

const LIMITE = 20

const situacaoVariant: Record<SituacaoAtivo, "default" | "secondary" | "outline"> = {
  Inventariado: "default",
  Rascunho: "secondary",
  Descontinuado: "outline",
}

const criticidadeLabel: Record<Criticidade, string> = {
  Baixa: "Baixa",
  Media: "Média",
  Alta: "Alta",
  Critica: "Crítica",
}

const pessoaDo = (ativo: Ativo, papel: "Owner" | "Steward") =>
  ativo.papel_ativo.find((p) => p.tipo_papel === papel)?.pessoa.nome

const columns: Column<Ativo>[] = [
  {
    id: "nome",
    header: "Nome do Ativo",
    cell: (ativo) => <span className="font-medium">{ativo.nome}</span>,
  },
  { id: "tipo", header: "Tipo", cell: (ativo) => ativo.tipo_componente },
  { id: "dominio", header: "Domínio", cell: (ativo) => ativo.dominio.nome },
  {
    id: "situacao",
    header: "Situação",
    cell: (ativo) => <Badge variant={situacaoVariant[ativo.situacao]}>{ativo.situacao}</Badge>,
  },
  {
    id: "criticidade",
    header: "Criticidade",
    cell: (ativo) => (ativo.criticidade ? criticidadeLabel[ativo.criticidade] : "—"),
  },
  {
    id: "owner",
    header: "Owner",
    cell: (ativo) =>
      pessoaDo(ativo, "Owner") ?? <Badge variant="destructive">Sem Owner</Badge>,
  },
  { id: "steward", header: "Steward", cell: (ativo) => pessoaDo(ativo, "Steward") ?? "—" },
]

export default function CatalogoAtivosPage() {
  const [busca, setBusca] = useState("")
  const [termo, setTermo] = useState("")
  const [pagina, setPagina] = useState(1)
  const [recarregar, setRecarregar] = useState(0)
  const [resultado, setResultado] = useState<Pagina<Ativo> | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  // Busca no servidor com debounce, voltando para a primeira página.
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
    listarAtivos({ pagina, limite: LIMITE, busca: termo || undefined }, controller.signal)
      .then(setResultado)
      .catch((e) => {
        if (!controller.signal.aborted) setErro(mensagemDeErroApi(e, "carregar os ativos"))
      })
      .finally(() => {
        if (!controller.signal.aborted) setCarregando(false)
      })
    return () => controller.abort()
  }, [pagina, termo, recarregar])

  const total = resultado?.total ?? 0
  const totalPaginas = Math.max(1, Math.ceil(total / LIMITE))

  return (
    <>
      <PageHeader
        title="Catálogo de Ativos"
        description="Gerenciamento, classificação e governança de modelos e soluções de IA."
        actions={<NovoAtivoDialog onCreated={() => setRecarregar((n) => n + 1)} />}
      />

      <ResumoCards recarregar={recarregar} />

      {erro && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <span>{erro}</span>
          <Button variant="outline" size="sm" onClick={() => setRecarregar((n) => n + 1)}>
            Tentar novamente
          </Button>
        </div>
      )}

      <DataTable
        data={resultado?.dados ?? []}
        total={total}
        columns={columns}
        getRowId={(ativo) => ativo.id}
        searchPlaceholder="Pesquisar por nome ou descrição..."
        searchValue={busca}
        onSearchChange={setBusca}
        emptyTitle={
          carregando ? "Carregando ativos..." : termo ? "Nenhum ativo encontrado" : "Nenhum ativo cadastrado"
        }
        emptyDescription={
          carregando
            ? undefined
            : termo
              ? "Tente ajustar os termos da pesquisa."
              : "Cadastre o primeiro ativo para vê-lo listado aqui."
        }
      />

      {total > LIMITE && (
        <div className="flex items-center justify-end gap-3 text-sm">
          <span className="text-muted-foreground tabular-nums">
            Página {pagina} de {totalPaginas}
          </span>
          <Button
            variant="outline"
            size="icon"
            aria-label="Página anterior"
            disabled={pagina <= 1 || carregando}
            onClick={() => setPagina((p) => p - 1)}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Próxima página"
            disabled={pagina >= totalPaginas || carregando}
            onClick={() => setPagina((p) => p + 1)}
          >
            <ChevronRight />
          </Button>
        </div>
      )}
    </>
  )
}
