import { useState, type FormEvent } from "react"
import { Check, Loader2, Plus } from "lucide-react"
import { SelectField, type Opcao } from "@/components/common/SelectField"
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
import { criarPessoa } from "@/services/adminService"
import { mensagemDeErroApi } from "@/services/ativosService"

const papeisSistema: Opcao[] = [
  { value: "Usuario", label: "Usuário" },
  { value: "Admin", label: "Admin" },
]

interface Valores {
  nome: string
  email: string
  area: string
  papel_sistema: string
  senha: string
}

const vazio: Valores = {
  nome: "",
  email: "",
  area: "",
  papel_sistema: "Usuario",
  senha: "",
}

function NovoResponsavelForm({ onDone }: { onDone: () => void }) {
  const [valores, setValores] = useState<Valores>(vazio)
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const set = (campo: keyof Valores) => (valor: string) =>
    setValores((v) => ({ ...v, [campo]: valor }))

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErro(null)

    if (!valores.nome.trim() || !valores.email.trim() || !valores.senha) {
      setErro("Informe nome, e-mail e senha inicial para continuar.")
      return
    }

    if (valores.senha.length < 8) {
      setErro("A senha inicial deve ter pelo menos 8 caracteres.")
      return
    }

    setEnviando(true)
    try {
      await criarPessoa({
        nome: valores.nome.trim(),
        email: valores.email.trim().toLowerCase(),
        senha: valores.senha,
        ...(valores.area.trim() && { area: valores.area.trim() }),
        ...(valores.papel_sistema && {
          papel_sistema: valores.papel_sistema as "Admin" | "Usuario",
        }),
      })
      onDone()
    } catch (e) {
      setErro(mensagemDeErroApi(e, "cadastrar o responsável"))
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <DialogHeader>
        <DialogTitle>Novo Responsável</DialogTitle>
        <DialogDescription>
          Cadastre uma pessoa para assumir papéis nos ativos e acessar o sistema.
        </DialogDescription>
      </DialogHeader>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="nome">
            Nome<span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="nome"
            maxLength={150}
            placeholder="Nome completo"
            value={valores.nome}
            onChange={(e) => set("nome")(e.target.value)}
            disabled={enviando}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="email">
            E-mail<span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="email"
            type="email"
            maxLength={255}
            placeholder="nome@empresa.com.br"
            value={valores.email}
            onChange={(e) => set("email")(e.target.value)}
            disabled={enviando}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="area">Área</FieldLabel>
            <Input
              id="area"
              maxLength={150}
              placeholder="Ex.: Dados e IA"
              value={valores.area}
              onChange={(e) => set("area")(e.target.value)}
              disabled={enviando}
            />
          </Field>

          <SelectField
            id="papel_sistema"
            label="Perfil no sistema"
            options={papeisSistema}
            value={valores.papel_sistema}
            onChange={set("papel_sistema")}
          />
        </div>

        <Field>
          <FieldLabel htmlFor="senha">
            Senha inicial<span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="senha"
            type="password"
            minLength={8}
            placeholder="Mínimo de 8 caracteres"
            value={valores.senha}
            onChange={(e) => set("senha")(e.target.value)}
            disabled={enviando}
          />
        </Field>
      </FieldGroup>

      {erro && (
        <p role="alert" className="text-sm text-destructive">
          {erro}
        </p>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={enviando}>
          Cancelar
        </Button>
        <Button type="submit" disabled={enviando}>
          {enviando ? <Loader2 className="animate-spin" /> : <Check />} Cadastrar responsável
        </Button>
      </DialogFooter>
    </form>
  )
}

export function NovoResponsavelDialog({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus /> Novo Responsável
      </DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <NovoResponsavelForm
          onDone={() => {
            setOpen(false)
            onCreated?.()
          }}
        />
      </DialogContent>
    </Dialog>
  )
}