import type { FormEvent, ReactNode } from "react"
import { Link } from "react-router"
import { ArrowLeft } from "lucide-react"
import { PageHeader } from "@/components/common/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const tiposAtivo = ["Modelo de ML", "LLM / API", "Agente", "Serviço de dados", "Automação"]
const alcances = ["Área", "Diretoria", "Empresa", "Externo"]
const simNao = ["Sim", "Não"]
const autonomias = ["Simplificada", "Assistida", "Orquestrada"]

function SelectField({
  id,
  label,
  options,
  placeholder = "Selecione",
}: {
  id: string
  label: string
  options: string[]
  placeholder?: string
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select name={id} items={options.map((o) => ({ value: o, label: o }))}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder={placeholder} />
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

function TextField({ id, label, placeholder }: { id: string; label: string; placeholder?: string }) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input id={id} name={id} placeholder={placeholder} />
    </Field>
  )
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup className="grid gap-4 md:grid-cols-2">{children}</FieldGroup>
      </CardContent>
    </Card>
  )
}

export default function NovoAtivoPage() {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // TODO: enviar para a API quando a integração estiver disponível.
  }

  return (
    <>
      <PageHeader
        title="Novo Ativo"
        description="Preencha as informações para cadastrar um novo ativo de IA."
        actions={
          <Button variant="outline" render={<Link to="/catalogo-ativos" />}>
            <ArrowLeft /> Voltar
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Section title="Identificação" description="Dados básicos do componente.">
          <TextField id="nome" label="Nome" placeholder="Nome do ativo" />
          <SelectField id="tipo" label="Tipo" options={tiposAtivo} />
          <Field className="md:col-span-2">
            <FieldLabel htmlFor="descricao">O que é este componente?</FieldLabel>
            <Textarea
              id="descricao"
              name="descricao"
              rows={3}
              placeholder="Descreva brevemente o componente..."
            />
          </Field>
        </Section>

        <Section title="Uso" description="Como o componente atua e quem o utiliza.">
          <Field className="md:col-span-2">
            <FieldLabel htmlFor="atuacao">Como ele atua?</FieldLabel>
            <Textarea id="atuacao" name="atuacao" rows={3} />
          </Field>
          <TextField id="consumidores" label="Quem utiliza / consumidores" />
          <SelectField id="alcance" label="Alcance" options={alcances} />
          <Field className="md:col-span-2">
            <FieldLabel htmlFor="consequencias">Consequências se der errado</FieldLabel>
            <Textarea id="consequencias" name="consequencias" rows={3} />
          </Field>
        </Section>

        <Section title="Responsabilidade" description="Pessoas responsáveis pelo ativo.">
          <TextField id="gestor" label="Gestor de negócios" placeholder="Nome" />
          <TextField id="responsavelTecnico" label="Responsável técnico" placeholder="Nome" />
          <SelectField id="cloud" label="Usa cloud?" options={simNao} />
        </Section>

        <Section title="Dados e IA" description="Origem dos dados e nível de autonomia.">
          <TextField
            id="origemDados"
            label="Origem dos dados"
            placeholder="Referenciar fonte ou catálogo."
          />
          <TextField id="dataOwner" label="Data owner" />
          <SelectField id="usaIA" label="Uso por IA/automação?" options={simNao} />
          <SelectField id="autonomia" label="Autonomia" options={autonomias} />
        </Section>

        <div className="flex justify-end gap-2">
          <Button variant="outline" render={<Link to="/catalogo-ativos" />}>
            Cancelar
          </Button>
          <Button type="submit">Salvar ativo</Button>
        </div>
      </form>
    </>
  )
}
