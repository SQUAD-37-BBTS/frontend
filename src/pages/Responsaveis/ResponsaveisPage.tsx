import { DataTable, type Column } from "@/components/common/DataTable"
import { ErroBanner } from "@/components/common/ErroBanner"
import { PageHeader } from "@/components/common/PageHeader"
import { Paginacao } from "@/components/common/Paginacao"
import { Badge } from "@/components/ui/badge"
import { useListaPaginada } from "@/hooks/use-lista-paginada"
import { listarPessoas } from "@/services/adminService"
import type { Pessoa } from "@/types"

const columns: Column<Pessoa>[] = [
  {
    id: "nome",
    header: "Nome",
    cell: (pessoa) => <span className="font-medium">{pessoa.nome}</span>,
  },
  { id: "email", header: "E-mail", cell: (pessoa) => pessoa.email },
  { id: "area", header: "Área", cell: (pessoa) => pessoa.area ?? "—" },
  {
    id: "perfil",
    header: "Perfil no sistema",
    cell: (pessoa) => (
      <Badge variant={pessoa.papel_sistema === "Admin" ? "default" : "secondary"}>
        {pessoa.papel_sistema}
      </Badge>
    ),
  },
  {
    id: "situacao",
    header: "Situação",
    cell: (pessoa) =>
      pessoa.ativo ? "Ativa" : <Badge variant="outline">Desativada</Badge>,
  },
]

export default function ResponsaveisPage() {
  const lista = useListaPaginada<Pessoa>(listarPessoas, "carregar as pessoas")

  return (
    <>
      <PageHeader
        title="Responsáveis"
        description="Pessoas que podem assumir papéis (Owner, Steward, Responsável Técnico, Consumidor) nos ativos."
      />

      {lista.erro && <ErroBanner mensagem={lista.erro} onRetry={lista.recarregar} />}

      <DataTable
        data={lista.resultado?.dados ?? []}
        total={lista.resultado?.total}
        columns={columns}
        getRowId={(pessoa) => pessoa.id}
        searchPlaceholder="Pesquisar por nome ou e-mail..."
        searchValue={lista.busca}
        onSearchChange={lista.setBusca}
        emptyTitle={
          lista.carregando
            ? "Carregando pessoas..."
            : lista.termo
              ? "Nenhuma pessoa encontrada"
              : "Nenhuma pessoa cadastrada"
        }
        emptyDescription={
          lista.carregando
            ? undefined
            : lista.termo
              ? "Tente ajustar os termos da pesquisa."
              : "As pessoas aparecerão aqui quando forem cadastradas por um Admin."
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
