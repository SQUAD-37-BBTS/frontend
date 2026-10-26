import { useEffect, useState } from "react"
import { Loader2, Plus, X } from "lucide-react"
import { ErroBanner } from "@/components/common/ErroBanner"
import { SelectField } from "@/components/common/SelectField"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { papelLabel } from "@/lib/ativos"
import {
  adicionarPapel,
  listarPessoasAtivas,
  mensagemDeErroApi,
  removerPapel,
} from "@/services/ativosService"
import type { AtivoDetalhe, PessoaResumo, TipoPapel } from "@/types"

const opcoesPapel = (Object.keys(papelLabel) as TipoPapel[]).map((p) => ({
  value: p,
  label: papelLabel[p],
}))

interface Props {
  ativo: AtivoDetalhe
  podeEditar: boolean
  onChange: () => void
}

export function PapeisCard({ ativo, podeEditar, onChange }: Props) {
  const [pessoas, setPessoas] = useState<PessoaResumo[]>([])
  const [pessoaId, setPessoaId] = useState("")
  const [papel, setPapel] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (!podeEditar) return
    listarPessoasAtivas().then(setPessoas).catch(() => undefined)
  }, [podeEditar])

  const executar = async (acao: () => Promise<unknown>, descricao: string) => {
    setErro(null)
    setEnviando(true)
    try {
      await acao()
      onChange()
    } catch (e) {
      setErro(mensagemDeErroApi(e, descricao))
    } finally {
      setEnviando(false)
    }
  }

  const adicionar = async () => {
    await executar(() => adicionarPapel(ativo.id, pessoaId, papel as TipoPapel), "atribuir o papel")
    setPessoaId("")
    setPapel("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Papéis e responsáveis</CardTitle>
        <CardDescription>Quem responde por este ativo.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {ativo.pendencias.includes("sem_owner") && (
          <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            Este ativo não tem Owner. Atribua um para que possa ser aprovado.
          </p>
        )}

        {ativo.papel_ativo.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum papel atribuído.</p>
        ) : (
          <ul className="divide-y">
            {ativo.papel_ativo.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.pessoa.nome}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.pessoa.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={p.tipo_papel === "Owner" ? "default" : "secondary"}>
                    {papelLabel[p.tipo_papel]}
                  </Badge>
                  {podeEditar && (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Remover ${papelLabel[p.tipo_papel]} ${p.pessoa.nome}`}
                      disabled={enviando}
                      onClick={() => executar(() => removerPapel(ativo.id, p.id), "remover o papel")}
                    >
                      <X />
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {erro && <ErroBanner mensagem={erro} />}

        {podeEditar && (
          <div className="grid gap-3 border-t pt-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <SelectField
              id="papel-pessoa"
              label="Pessoa"
              options={pessoas.map((p) => ({ value: p.id, label: `${p.nome} (${p.email})` }))}
              value={pessoaId}
              onChange={setPessoaId}
            />
            <SelectField
              id="papel-tipo"
              label="Papel"
              options={opcoesPapel}
              value={papel}
              onChange={setPapel}
            />
            <Button disabled={!pessoaId || !papel || enviando} onClick={adicionar}>
              {enviando ? <Loader2 className="animate-spin" /> : <Plus />} Adicionar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
