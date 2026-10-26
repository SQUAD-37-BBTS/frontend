import { useEffect, useState, type FormEvent } from "react"
import { Loader2, Plus } from "lucide-react"
import { DataTable, type Column } from "@/components/common/DataTable"
import { ErroBanner } from "@/components/common/ErroBanner"
import { PageHeader } from "@/components/common/PageHeader"
import { Paginacao } from "@/components/common/Paginacao"
import { SelectField } from "@/components/common/SelectField"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useListaPaginada } from "@/hooks/use-lista-paginada"
import { criarDominio, listarDominiosCompletos } from "@/services/adminService"
import { listarPessoasAtivas, mensagemDeErroApi } from "@/services/ativosService"
import type { DominioCompleto, PessoaResumo } from "@/types"

const columns: Column<DominioCompleto>[] = [
  { id: "nome", header: "Domínio", cell: (d) => <span className="font-medium">{d.nome}</span> },
  { id: "owner", header: "Owner do domínio", cell: (d) => d.pessoa.nome },
  { id: "ativos", header: "Ativos", cell: (d) => d._count.ativo },
]

function NovoDominioForm({ onDone }: { onDone: () => void }) {
  const [nome, setNome] = useState("")
  const [ownerId, setOwnerId] = useState("")
  const [pessoas, setPessoas] = useState<PessoaResumo[]>([])
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    listarPessoasAtivas().then(setPessoas).catch(() => setErro("Não foi possível carregar as pessoas."))
  }, [])

  const enviar = async (event: FormEvent) => {
    event.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      await criarDominio({ nome: nome.trim(), owner_id: ownerId })
      onDone()
    } catch (e) {
      setErro(mensagemDeErroApi(e, "criar o domínio"))
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="grid gap-6">
      <DialogHeader>
        <DialogTitle>Novo domínio</DialogTitle>
        <DialogDescription>Área de negócio que agrupa ativos.</DialogDescription>
      </DialogHeader>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="dominio-nome">
            Nome<span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="dominio-nome"
            maxLength={150}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex.: Financeiro"
          />
        </Field>
        <SelectField
          id="dominio-owner"
          label="Owner do domínio"
          required
          options={pessoas.map((p) => ({ value: p.id, label: `${p.nome} (${p.email})` }))}
          value={ownerId}
          onChange={setOwnerId}
        />
      </FieldGroup>
      {erro && <ErroBanner mensagem={erro} />}
      <DialogFooter>
        <Button type="submit" disabled={enviando || !nome.trim() || !ownerId}>
          {enviando && <Loader2 className="animate-spin" />} Criar domínio
        </Button>
      </DialogFooter>
    </form>
  )
}

export default function DominiosPage() {
  const lista = useListaPaginada<DominioCompleto>(listarDominiosCompletos, "carregar os domínios")
  const [aberto, setAberto] = useState(false)

  return (
    <>
      <PageHeader
        title="Domínios"
        description="Áreas de negócio que organizam os ativos e os indicadores da gestão."
        actions={
          <Dialog open={aberto} onOpenChange={setAberto}>
            <DialogTrigger render={<Button />}>
              <Plus /> Novo domínio
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <NovoDominioForm
                onDone={() => {
                  setAberto(false)
                  lista.recarregar()
                }}
              />
            </DialogContent>
          </Dialog>
        }
      />

      {lista.erro && <ErroBanner mensagem={lista.erro} onRetry={lista.recarregar} />}

      <DataTable
        data={lista.resultado?.dados ?? []}
        total={lista.resultado?.total}
        columns={columns}
        getRowId={(d) => d.id}
        searchPlaceholder="Pesquisar por nome..."
        searchValue={lista.busca}
        onSearchChange={lista.setBusca}
        emptyTitle={lista.carregando ? "Carregando domínios..." : "Nenhum domínio encontrado"}
        emptyDescription={lista.carregando ? undefined : "Crie o primeiro domínio para cadastrar ativos."}
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
