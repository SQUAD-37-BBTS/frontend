import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { DataTable, type Column } from "@/components/common/DataTable"
import { PageHeader } from "@/components/common/PageHeader"
import type { Responsavel } from "@/types"

const columns: Column<Responsavel>[] = [
  {
    id: "nome",
    header: "Nome",
    cell: (pessoa) => <span className="font-medium">{pessoa.nome}</span>,
  },
  { id: "email", header: "E-mail", cell: (pessoa) => pessoa.email },
  { id: "area", header: "Área", cell: (pessoa) => pessoa.area },
  {
    id: "papel",
    header: "Papel",
    cell: (pessoa) => <Badge variant="secondary">{pessoa.papel}</Badge>,
  },
]

export default function ResponsaveisPage() {
  const [busca, setBusca] = useState("")
  const responsaveis: Responsavel[] = []

  const termo = busca.trim().toLowerCase()
  const filtrados = responsaveis.filter(
    (pessoa) =>
      pessoa.nome.toLowerCase().includes(termo) ||
      pessoa.email.toLowerCase().includes(termo),
  )

  return (
    <>
      <PageHeader
        title="Responsáveis"
        description="Pessoas com papéis de responsabilidade sobre os ativos de IA."
      />

      <DataTable
        data={filtrados}
        columns={columns}
        getRowId={(pessoa) => pessoa.id}
        searchPlaceholder="Pesquisar por nome ou e-mail..."
        searchValue={busca}
        onSearchChange={setBusca}
        emptyTitle={busca ? "Nenhum responsável encontrado" : "Nenhum responsável cadastrado"}
        emptyDescription={
          busca
            ? "Tente ajustar os termos da pesquisa."
            : "Os responsáveis aparecerão aqui quando forem cadastrados."
        }
      />
    </>
  )
}
