import { useState } from "react"
import { Link } from "react-router"
import { AlertTriangle, CheckCircle2, Layers, Plus, ShieldCheck } from "lucide-react"
import { DataTable, type Column } from "@/components/common/DataTable"
import { PageHeader } from "@/components/common/PageHeader"
import { StatCard } from "@/components/common/StatCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Ativo, StatusAtivo } from "@/types"

const statusVariant: Record<StatusAtivo, "default" | "secondary" | "outline"> = {
  Homologado: "default",
  "Em Análise": "secondary",
  Pendente: "outline",
}

const columns: Column<Ativo>[] = [
  {
    id: "nome",
    header: "Nome do Ativo",
    cell: (ativo) => <span className="font-medium">{ativo.nome}</span>,
  },
  { id: "tipo", header: "Tipo", cell: (ativo) => ativo.tipo },
  {
    id: "status",
    header: "Status",
    cell: (ativo) => <Badge variant={statusVariant[ativo.status]}>{ativo.status}</Badge>,
  },
  { id: "classificacao", header: "Classificação", cell: (ativo) => ativo.classificacao },
  { id: "responsavel", header: "Responsável", cell: (ativo) => ativo.responsavel },
]

export default function CatalogoAtivosPage() {
  const [busca, setBusca] = useState("")
  const ativos: Ativo[] = []

  const termo = busca.trim().toLowerCase()
  const filtrados = ativos.filter(
    (ativo) =>
      ativo.nome.toLowerCase().includes(termo) ||
      ativo.responsavel.toLowerCase().includes(termo),
  )

  return (
    <>
      <PageHeader
        title="Catálogo de Ativos"
        description="Gerenciamento, classificação e governança de modelos e soluções de IA."
        actions={
          <Button render={<Link to="/catalogo-ativos/novo" />}>
            <Plus /> Novo Ativo
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Ativos Classificados" icon={<CheckCircle2 />} />
        <StatCard label="Simplificada" icon={<AlertTriangle />} />
        <StatCard label="Assistida" icon={<ShieldCheck />} />
        <StatCard label="Orquestrada" icon={<Layers />} />
      </div>

      <DataTable
        data={filtrados}
        columns={columns}
        getRowId={(ativo) => ativo.id}
        searchPlaceholder="Pesquisar por nome ou responsável..."
        searchValue={busca}
        onSearchChange={setBusca}
        emptyTitle={busca ? "Nenhum ativo encontrado" : "Nenhum ativo cadastrado"}
        emptyDescription={
          busca
            ? "Tente ajustar os termos da pesquisa."
            : "Cadastre o primeiro ativo para vê-lo listado aqui."
        }
      />
    </>
  )
}
