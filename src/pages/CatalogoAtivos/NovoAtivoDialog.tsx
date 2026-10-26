import { useEffect, useState, type FormEvent } from "react"
import { Check, ChevronLeft, ChevronRight, Loader2, Plus } from "lucide-react"
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
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  adicionarPapel,
  criarAtivo,
  listarDominios,
  listarPessoasAtivas,
  mensagemDeErroApi,
} from "@/services/ativosService"
import { cn } from "@/lib/utils"
import type { Criticidade, Dominio, PessoaResumo } from "@/types"

interface Opcao {
  value: string
  label: string
}

const tiposComponente: Opcao[] = [
  "Painel / Dashboard",
  "Modelo de ML",
  "LLM / API",
  "Agente",
  "Serviço de dados",
  "Automação",
].map((t) => ({ value: t, label: t }))

const criticidades: Opcao[] = [
  { value: "Baixa", label: "Baixa" },
  { value: "Media", label: "Média" },
  { value: "Alta", label: "Alta" },
  { value: "Critica", label: "Crítica" },
]

const simNao: Opcao[] = [
  { value: "Nao", label: "Não" },
  { value: "Sim", label: "Sim" },
]

interface Valores {
  nome: string
  tipo_componente: string
  dominio_id: string
  descricao: string
  objetivo: string
  criticidade: string
  usa_cloud: string
  steward_id: string
  responsavel_tecnico_id: string
}

const vazio: Valores = {
  nome: "",
  tipo_componente: "",
  dominio_id: "",
  descricao: "",
  objetivo: "",
  criticidade: "",
  usa_cloud: "Nao",
  steward_id: "",
  responsavel_tecnico_id: "",
}

function SelectField({
  id,
  label,
  options,
  value,
  onChange,
  required,
  placeholder = "Selecione",
}: {
  id: string
  label: string
  options: Opcao[]
  value: string
  onChange: (value: string) => void
  required?: boolean
  placeholder?: string
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>
        {label}
        {required && <span className="text-destructive">*</span>}
      </FieldLabel>
      <Select items={options} value={value || null} onValueChange={(v) => onChange(v ?? "")}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}

const etapas = [
  { title: "Identificação", description: "Dados básicos do componente." },
  { title: "Classificação", description: "Criticidade e uso de cloud." },
  {
    title: "Responsáveis",
    description: "Você será registrado como Owner. Indique os demais responsáveis, se já souber.",
  },
]

function NovoAtivoForm({ onDone }: { onDone: () => void }) {
  const [atual, setAtual] = useState(0)
  const [valores, setValores] = useState<Valores>(vazio)
  const [dominios, setDominios] = useState<Dominio[]>([])
  const [pessoas, setPessoas] = useState<PessoaResumo[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  // Ativo criado, mas com papéis pendentes: não permite reenviar (evita duplicar).
  const [aviso, setAviso] = useState<string | null>(null)

  useEffect(() => {
    listarDominios().then(setDominios).catch(() => setErro("Não foi possível carregar os domínios."))
    // lista de pessoas é opcional: sem ela só não dá para indicar responsáveis
    listarPessoasAtivas().then(setPessoas).catch(() => undefined)
  }, [])

  const set = (campo: keyof Valores) => (valor: string) =>
    setValores((v) => ({ ...v, [campo]: valor }))

  const ultima = atual === etapas.length - 1
  const progresso = ((atual + 1) / etapas.length) * 100

  const etapaValida = () => {
    if (atual !== 0) return true
    if (!valores.nome.trim() || !valores.tipo_componente || !valores.dominio_id) {
      setErro("Informe nome, tipo e domínio para continuar.")
      return false
    }
    return true
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErro(null)
    if (!etapaValida()) return
    if (!ultima) return setAtual((e) => e + 1)

    setEnviando(true)
    try {
      const ativo = await criarAtivo({
        nome: valores.nome.trim(),
        tipo_componente: valores.tipo_componente,
        dominio_id: valores.dominio_id,
        usa_cloud: valores.usa_cloud === "Sim",
        ...(valores.descricao.trim() && { descricao: valores.descricao.trim() }),
        ...(valores.objetivo.trim() && { objetivo: valores.objetivo.trim() }),
        ...(valores.criticidade && { criticidade: valores.criticidade as Criticidade }),
      })

      // O ativo já existe: falha ao atribuir papéis não deve duplicar o cadastro.
      const papeis = [
        { id: valores.steward_id, tipo: "Steward" as const },
        { id: valores.responsavel_tecnico_id, tipo: "Responsavel_Tecnico" as const },
      ].filter((p) => p.id)
      const resultados = await Promise.allSettled(
        papeis.map((p) => adicionarPapel(ativo.id, p.id, p.tipo)),
      )
      if (resultados.some((r) => r.status === "rejected")) {
        setAviso(
          "O ativo foi criado, mas não foi possível atribuir todos os responsáveis. Atribua-os depois no ativo.",
        )
        setEnviando(false)
        return
      }
      onDone()
    } catch (e) {
      setErro(mensagemDeErroApi(e, "criar o ativo"))
      setEnviando(false)
    }
  }

  if (aviso) {
    return (
      <div className="grid gap-6">
        <DialogHeader>
          <DialogTitle>Ativo criado</DialogTitle>
          <DialogDescription>{aviso}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" onClick={onDone}>
            Fechar
          </Button>
        </DialogFooter>
      </div>
    )
  }

  const opcoesDominio = dominios.map((d) => ({ value: d.id, label: d.nome }))
  const opcoesPessoa = pessoas.map((p) => ({ value: p.id, label: `${p.nome} (${p.email})` }))

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <DialogHeader>
        <DialogTitle>Novo Ativo</DialogTitle>
        <DialogDescription>
          Etapa {atual + 1} de {etapas.length} — {etapas[atual].title}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-3">
        <Progress value={progresso} aria-label="Progresso do cadastro" />
        <ol className="grid grid-cols-3 gap-2">
          {etapas.map((etapa, index) => {
            const feita = index < atual
            const ativa = index === atual
            return (
              <li
                key={etapa.title}
                className={cn(
                  "flex items-center gap-2 text-xs",
                  ativa ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px]",
                    (feita || ativa) && "border-primary bg-primary text-primary-foreground",
                  )}
                >
                  {feita ? <Check className="size-3" /> : index + 1}
                </span>
                <span className="hidden truncate sm:inline">{etapa.title}</span>
              </li>
            )
          })}
        </ol>
      </div>

      <div>
        <p className="mb-4 text-sm text-muted-foreground">{etapas[atual].description}</p>
        <FieldGroup>
          {atual === 0 && (
            <>
              <Field>
                <FieldLabel htmlFor="nome">
                  Nome<span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="nome"
                  maxLength={200}
                  placeholder="Nome do ativo"
                  value={valores.nome}
                  onChange={(e) => set("nome")(e.target.value)}
                />
              </Field>
              <SelectField
                id="tipo_componente"
                label="Tipo de componente"
                required
                options={tiposComponente}
                value={valores.tipo_componente}
                onChange={set("tipo_componente")}
              />
              <SelectField
                id="dominio_id"
                label="Domínio"
                required
                options={opcoesDominio}
                value={valores.dominio_id}
                onChange={set("dominio_id")}
              />
              <Field>
                <FieldLabel htmlFor="descricao">O que é este componente?</FieldLabel>
                <Textarea
                  id="descricao"
                  rows={3}
                  placeholder="Descreva brevemente o componente..."
                  value={valores.descricao}
                  onChange={(e) => set("descricao")(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="objetivo">Objetivo</FieldLabel>
                <Textarea
                  id="objetivo"
                  rows={2}
                  value={valores.objetivo}
                  onChange={(e) => set("objetivo")(e.target.value)}
                />
              </Field>
            </>
          )}

          {atual === 1 && (
            <>
              <SelectField
                id="criticidade"
                label="Criticidade"
                options={criticidades}
                value={valores.criticidade}
                onChange={set("criticidade")}
                placeholder="Não classificada"
              />
              <SelectField
                id="usa_cloud"
                label="Usa cloud?"
                options={simNao}
                value={valores.usa_cloud}
                onChange={set("usa_cloud")}
              />
            </>
          )}

          {atual === 2 && (
            <>
              <SelectField
                id="steward_id"
                label="Steward de dados"
                options={opcoesPessoa}
                value={valores.steward_id}
                onChange={set("steward_id")}
              />
              <SelectField
                id="responsavel_tecnico_id"
                label="Responsável técnico"
                options={opcoesPessoa}
                value={valores.responsavel_tecnico_id}
                onChange={set("responsavel_tecnico_id")}
              />
            </>
          )}
        </FieldGroup>
      </div>

      {erro && (
        <p role="alert" className="text-sm text-destructive">
          {erro}
        </p>
      )}

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setErro(null)
            setAtual((e) => e - 1)
          }}
          disabled={atual === 0 || enviando}
        >
          <ChevronLeft /> Voltar
        </Button>
        {ultima ? (
          <Button type="submit" disabled={enviando}>
            {enviando ? <Loader2 className="animate-spin" /> : <Check />} Salvar ativo
          </Button>
        ) : (
          <Button type="submit">
            Próximo <ChevronRight />
          </Button>
        )}
      </DialogFooter>
    </form>
  )
}

export function NovoAtivoDialog({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus /> Novo Ativo
      </DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <NovoAtivoForm
          onDone={() => {
            setOpen(false)
            onCreated?.()
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
