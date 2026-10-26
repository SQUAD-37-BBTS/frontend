import { Link } from "react-router"
import { DataTable, type Column } from "@/components/common/DataTable"
import { ErroBanner } from "@/components/common/ErroBanner"
import { PageHeader } from "@/components/common/PageHeader"
import { Paginacao } from "@/components/common/Paginacao"
import { ResumoCards } from "@/components/common/ResumoCards"
import { Badge } from "@/components/ui/badge"
import { useListaPaginada } from "@/hooks/use-lista-paginada"
import { useResumo } from "@/hooks/use-resumo"
import { listarAtivos } from "@/services/ativosService"
import { NovoAtivoDialog } from "./NovoAtivoDialog"
import { criticidadeLabel, situacaoVariant } from "@/lib/ativos"
import type { Ativo } from "@/types"

const pessoaDo = (ativo: Ativo, papel: "Owner" | "Steward") =>
  ativo.papel_ativo.find((p) => p.tipo_papel === papel)?.pessoa.nome

const columns: Column<Ativo>[] = [
  {
    id: "nome",
    header: "Nome do Ativo",
    cell: (ativo) => (
      <Link to={`/catalogo-ativos/${ativo.id}`} className="font-medium hover:underline">
        {ativo.nome}
      </Link>
    ),
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
    cell: (ativo) => pessoaDo(ativo, "Owner") ?? <Badge variant="destructive">Sem Owner</Badge>,
  },
  { id: "steward", header: "Steward", cell: (ativo) => pessoaDo(ativo, "Steward") ?? "—" },
]

export default function CatalogoAtivosPage() {
  const lista = useListaPaginada<Ativo>(listarAtivos, "carregar os ativos")
  const resumo = useResumo(lista.resultado?.total)

  return (
    <>
      <PageHeader
        title="Catálogo de Ativos"
        description="Gerenciamento, classificação e governança de modelos e soluções de IA."
        actions={<NovoAtivoDialog onCreated={lista.recarregar} />}
      />

      <ResumoCards resumo={resumo} />

      {lista.erro && <ErroBanner mensagem={lista.erro} onRetry={lista.recarregar} />}

      <DataTable
        data={lista.resultado?.dados ?? []}
        total={lista.resultado?.total}
        columns={columns}
        getRowId={(ativo) => ativo.id}
        searchPlaceholder="Pesquisar por nome ou descrição..."
        searchValue={lista.busca}
        onSearchChange={lista.setBusca}
        emptyTitle={
          lista.carregando
            ? "Carregando ativos..."
            : lista.termo
              ? "Nenhum ativo encontrado"
              : "Nenhum ativo cadastrado"
        }
        emptyDescription={
          lista.carregando
            ? undefined
            : lista.termo
              ? "Tente ajustar os termos da pesquisa."
              : "Cadastre o primeiro ativo para vê-lo listado aqui."
        }
      />

      <Paginacao
        pagina={lista.pagina}
        limite={lista.limite}
        total={lista.resultado?.total ?? 0}
        desabilitado={lista.carregando}
        onChange={lista.setPagina}
      />
    </>
  )
}
