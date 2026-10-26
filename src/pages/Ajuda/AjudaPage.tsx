import { PageHeader } from "@/components/common/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const topicos = [
  {
    titulo: "Catálogo de Ativos",
    descricao:
      "Cadastre painéis, modelos, agentes e demais componentes. Todo ativo nasce como Rascunho e quem o cadastra passa a ser o Owner.",
  },
  {
    titulo: "Papéis",
    descricao:
      "Cada ativo tem Owner, Steward, Responsável Técnico e Consumidores. Ativos sem Owner aparecem como pendência.",
  },
  {
    titulo: "Questionário de avaliação",
    descricao:
      "Informe fatos sobre o ativo (cloud, dados pessoais, uso de IA e de modelo fundacional). Ele é necessário antes da aprovação.",
  },
  {
    titulo: "Decisões",
    descricao:
      "O Owner registra decisões com justificativa: aprovar, rejeitar, aceitar risco ou solicitar adequações. O histórico não pode ser editado nem apagado.",
  },
  {
    titulo: "Situação do ativo",
    descricao:
      "Rascunho vira Inventariado quando o Owner aprova ou aceita o risco. Ativos que saem de uso são marcados como Descontinuado.",
  },
  {
    titulo: "Administração",
    descricao:
      "Admins gerenciam domínios, catálogos e consultam a auditoria, que registra quem alterou o quê e quando.",
  },
]

export default function AjudaPage() {
  return (
    <>
      <PageHeader title="Ajuda" description="Entenda como usar a plataforma Orion." />

      <div className="grid gap-4 md:grid-cols-3">
        {topicos.map((topico) => (
          <Card key={topico.titulo}>
            <CardHeader>
              <CardTitle>{topico.titulo}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{topico.descricao}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}
