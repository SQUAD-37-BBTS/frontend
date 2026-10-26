import { PageHeader } from "@/components/common/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const topicos = [
  {
    titulo: "Catálogo de Ativos",
    descricao:
      "Cadastre e classifique modelos, APIs e soluções de IA, definindo seu nível de autonomia e criticidade.",
  },
  {
    titulo: "Responsáveis",
    descricao:
      "Atribua papéis de Gestor do Negócio, Responsável Técnico e Consumidor a cada ativo.",
  },
  {
    titulo: "Classificação",
    descricao:
      "Os ativos são classificados como Simplificada, Assistida ou Orquestrada conforme o uso de IA e automação.",
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
