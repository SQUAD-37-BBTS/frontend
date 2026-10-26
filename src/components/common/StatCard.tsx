import type { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"

interface StatCardProps {
  label: string
  value?: string | number
  icon: ReactNode
}

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardDescription>{label}</CardDescription>
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary [&_svg]:size-4">
          {icon}
        </span>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-tight tabular-nums">
          {value ?? "—"}
        </p>
      </CardContent>
    </Card>
  )
}
