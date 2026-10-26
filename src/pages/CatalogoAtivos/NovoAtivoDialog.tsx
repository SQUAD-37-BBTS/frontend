import { useRef, useState, type FormEvent } from "react"
import { Check, ChevronLeft, ChevronRight, Plus } from "lucide-react"
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
import { cn } from "@/lib/utils"

const tiposAtivo = ["Modelo de ML", "LLM / API", "Agente", "Serviço de dados", "Automação"]
const alcances = ["Área", "Diretoria", "Empresa", "Externo"]
const simNao = ["Sim", "Não"]
const autonomias = ["Simplificada", "Assistida", "Orquestrada"]

function SelectField({
  id,
  label,
  options,
}: {
  id: string
  label: string
  options: string[]
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select name={id} items={options.map((o) => ({ value: o, label: o }))}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder="Selecione" />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}

function TextField({
  id,
  label,
  placeholder,
  required,
}: {
  id: string
  label: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>
        {label}
        {required && <span className="text-destructive">*</span>}
      </FieldLabel>
      <Input id={id} name={id} placeholder={placeholder} required={required} />
    </Field>
  )
}

function TextAreaField({ id, label, placeholder }: { id: string; label: string; placeholder?: string }) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Textarea id={id} name={id} rows={3} placeholder={placeholder} />
    </Field>
  )
}

const steps = [
  {
    title: "Identificação",
    description: "Dados básicos do componente.",
    fields: (
      <>
        <TextField id="nome" label="Nome" placeholder="Nome do ativo" required />
        <SelectField id="tipo" label="Tipo" options={tiposAtivo} />
        <TextAreaField
          id="descricao"
          label="O que é este componente?"
          placeholder="Descreva brevemente o componente..."
        />
      </>
    ),
  },
  {
    title: "Uso",
    description: "Como o componente atua e quem o utiliza.",
    fields: (
      <>
        <TextAreaField id="atuacao" label="Como ele atua?" />
        <TextField id="consumidores" label="Quem utiliza / consumidores" />
        <SelectField id="alcance" label="Alcance" options={alcances} />
        <TextAreaField id="consequencias" label="Consequências se der errado" />
      </>
    ),
  },
  {
    title: "Responsabilidade",
    description: "Pessoas responsáveis pelo ativo.",
    fields: (
      <>
        <TextField id="gestor" label="Gestor de negócios" placeholder="Nome" />
        <TextField id="responsavelTecnico" label="Responsável técnico" placeholder="Nome" />
        <SelectField id="cloud" label="Usa cloud?" options={simNao} />
      </>
    ),
  },
  {
    title: "Dados e IA",
    description: "Origem dos dados e nível de autonomia.",
    fields: (
      <>
        <TextField
          id="origemDados"
          label="Origem dos dados"
          placeholder="Referenciar fonte ou catálogo."
        />
        <TextField id="dataOwner" label="Data owner" />
        <SelectField id="usaIA" label="Uso por IA/automação?" options={simNao} />
        <SelectField id="autonomia" label="Autonomia" options={autonomias} />
      </>
    ),
  },
]

function NovoAtivoForm({ onDone }: { onDone: () => void }) {
  const [current, setCurrent] = useState(0)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])

  const isLast = current === steps.length - 1
  const progress = ((current + 1) / steps.length) * 100

  const stepIsValid = () => {
    const inputs = stepRefs.current[current]?.querySelectorAll<HTMLInputElement>("input, textarea")
    return Array.from(inputs ?? []).every((input) => input.reportValidity())
  }

  const next = () => {
    if (stepIsValid()) setCurrent((step) => step + 1)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isLast) return next()
    // TODO: enviar para a API quando a integração estiver disponível.
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <DialogHeader>
        <DialogTitle>Novo Ativo</DialogTitle>
        <DialogDescription>
          Etapa {current + 1} de {steps.length} — {steps[current].title}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-3">
        <Progress value={progress} aria-label="Progresso do cadastro" />
        <ol className="grid grid-cols-4 gap-2">
          {steps.map((step, index) => {
            const done = index < current
            const active = index === current
            return (
              <li
                key={step.title}
                className={cn(
                  "flex items-center gap-2 text-xs",
                  active ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px]",
                    (done || active) && "border-primary bg-primary text-primary-foreground",
                  )}
                >
                  {done ? <Check className="size-3" /> : index + 1}
                </span>
                <span className="hidden truncate sm:inline">{step.title}</span>
              </li>
            )
          })}
        </ol>
      </div>

      {steps.map((step, index) => (
        <div
          key={step.title}
          ref={(el) => {
            stepRefs.current[index] = el
          }}
          hidden={index !== current}
        >
          <p className="mb-4 text-sm text-muted-foreground">{step.description}</p>
          <FieldGroup>{step.fields}</FieldGroup>
        </div>
      ))}

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrent((step) => step - 1)}
          disabled={current === 0}
        >
          <ChevronLeft /> Voltar
        </Button>
        {isLast ? (
          <Button type="submit">
            <Check /> Salvar ativo
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

export function NovoAtivoDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus /> Novo Ativo
      </DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <NovoAtivoForm onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
