import { DataTable, type Column } from "@/components/common/DataTable"
import { ErroBanner } from "@/components/common/ErroBanner"
import { PageHeader } from "@/components/common/PageHeader"
import { Paginacao } from "@/components/common/Paginacao"
import { Badge } from "@/components/ui/badge"
import { useListaPaginada } from "@/hooks/use-lista-paginada"
import { formatarData } from "@/lib/ativos"
import { listarAuditoria } from "@/services/adminService"
import type { LogAuditoria } from "@/types"

const columns: Column<LogAuditoria>[] = [
  { id: "data", header: "Data", cell: (l) => formatarData(l.data_alteracao) },
  { id: "usuario", header: "Usuário", cell: (l) => l.pessoa.nome },
  { id: "tabela", header: "Tabela", cell: (l) => <Badge variant="secondary">{l.tabela_afetada}</Badge> },
  { id: "motivo", header: "Motivo", cell: (l) => l.motivo ?? "—" },
]

export default function AuditoriaPage() {
  const lista = useListaPaginada<LogAuditoria>(listarAuditoria, "carregar a auditoria", 50)

  return (
    <>
      <PageHeader
        title="Auditoria"
        description="Registro de quem alterou o quê e quando. Visível apenas para Admins."
      />

      {lista.erro && <ErroBanner mensagem={lista.erro} onRetry={lista.recarregar} />}

      <DataTable
        data={lista.resultado?.dados ?? []}
        total={lista.resultado?.total}
        columns={columns}
        getRowId={(l) => l.id}
        searchPlaceholder="Filtrar por tabela (ex.: ativo, decisao)..."
        searchValue={lista.busca}
        onSearchChange={lista.setBusca}
        emptyTitle={lista.carregando ? "Carregando registros..." : "Nenhum registro encontrado"}
        emptyDescription={lista.carregando ? undefined : "Ajuste o filtro de tabela."}
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
