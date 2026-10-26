import { useState, type ReactNode } from "react"
import { Columns3, Inbox, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export interface Column<T> {
  id: string
  header: string
  cell: (item: T) => ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  getRowId: (item: T) => string
  searchPlaceholder?: string
  searchValue: string
  onSearchChange: (value: string) => void
  emptyTitle?: string
  emptyDescription?: string
}

export function DataTable<T>({
  data,
  columns,
  getRowId,
  searchPlaceholder = "Pesquisar...",
  searchValue,
  onSearchChange,
  emptyTitle = "Nenhum registro encontrado",
  emptyDescription,
}: DataTableProps<T>) {
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const visible = columns.filter((col) => !hidden.has(col.id))

  const toggleColumn = (id: string, show: boolean) =>
    setHidden((prev) => {
      const next = new Set(prev)
      if (show) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <Card className="gap-0 py-0">
      <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-8"
          />
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span className="text-xs text-muted-foreground">
            Total: <strong className="text-foreground tabular-nums">{data.length}</strong>
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" />}>
              <Columns3 /> Colunas
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {columns.map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  checked={!hidden.has(col.id)}
                  onCheckedChange={(checked) => toggleColumn(col.id, checked)}
                >
                  {col.header}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            {visible.map((col) => (
              <TableHead
                key={col.id}
                className="px-4 text-xs font-medium tracking-wider text-muted-foreground uppercase"
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        {data.length > 0 && (
          <TableBody>
            {data.map((item) => (
              <TableRow key={getRowId(item)}>
                {visible.map((col) => (
                  <TableCell key={col.id} className="px-4 py-3">
                    {col.cell(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        )}
      </Table>

      {data.length === 0 && (
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Inbox />
            </EmptyMedia>
            <EmptyTitle>{emptyTitle}</EmptyTitle>
            {emptyDescription && <EmptyDescription>{emptyDescription}</EmptyDescription>}
          </EmptyHeader>
        </Empty>
      )}
    </Card>
  )
}
