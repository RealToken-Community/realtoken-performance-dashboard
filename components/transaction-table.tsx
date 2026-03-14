"use client"

import { useState, useMemo } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type Column,
  type FilterFn,
} from "@tanstack/react-table"
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Filter,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Transaction } from "@/lib/data"

const ROWS_PER_PAGE = 15

export function exportTransactionsCsv(data: Transaction[]) {
  const header = ["Date", "Token", "Quantity", "Price/Token", "Total", "Event", "TX Hash"]
  const csvRows = [
    header.join(","),
    ...data.map((tx) =>
      [
        new Date(tx.date).toISOString(),
        `"${tx.tokenName}"`,
        tx.quantity,
        Number.isFinite(tx.pricePerToken) ? tx.pricePerToken : "",
        Number.isFinite(tx.totalPrice) ? tx.totalPrice : "",
        `"${tx.eventType}"`,
        tx.txHash,
      ].join(",")
    ),
  ]
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "events.csv"
  a.click()
  URL.revokeObjectURL(url)
}

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

/* ---------- Event type badge palette (theme-aligned, ~12 colors) ---------- */
/* First 6: highly distinct. Remaining: still distinguishable. */

const EVENT_BADGE_PALETTE: readonly string[] = [
  "bg-blue-500/15 text-blue-400 border-blue-500/25",
  "bg-amber-500/15 text-amber-400 border-amber-500/25",
  "bg-teal-500/15 text-teal-400 border-teal-500/25",
  "bg-sky-500/15 text-sky-400 border-sky-500/25",
  "bg-violet-500/15 text-violet-400 border-violet-500/25",
  "bg-rose-500/15 text-rose-400 border-rose-500/25",
  "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  "bg-orange-500/15 text-orange-400 border-orange-500/25",
  "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
  "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/25",
  "bg-lime-500/15 text-lime-400 border-lime-500/25",
  "bg-indigo-500/15 text-indigo-400 border-indigo-500/25",
]

const EVENT_BADGE_DEFAULT =
  "bg-muted text-muted-foreground border-border"

function getEventBadgeClass(
  eventType: string,
  eventTypesOrder: string[]
): string {
  const index = eventTypesOrder.indexOf(eventType)
  if (index === -1 || index >= EVENT_BADGE_PALETTE.length) {
    return EVENT_BADGE_DEFAULT
  }
  return EVENT_BADGE_PALETTE[index]
}

/* ---------- Formatting ---------- */

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

function formatDate(iso: string): string {
  const d = new Date(iso)
  const day = String(d.getUTCDate()).padStart(2, "0")
  const month = MONTHS[d.getUTCMonth()]
  const year = d.getUTCFullYear()
  return `${day} ${month} ${year}`
}

function formatCurrency(val: number): string {
  const [intPart, decPart] = val.toFixed(2).split(".")
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ") + "." + decPart + " $"
}

function formatQuantity(val: number): string {
  return val.toFixed(2)
}

function truncateHash(hash: string): string {
  return hash.slice(0, 6) + "..." + hash.slice(-4)
}

/* ---------- Custom filter functions ---------- */

const numberRangeFilter: FilterFn<Transaction> = (
  row,
  columnId,
  filterValue: [number | undefined, number | undefined]
) => {
  const val = row.getValue<number>(columnId)
  const [min, max] = filterValue
  if (min !== undefined && val < min) return false
  if (max !== undefined && val > max) return false
  return true
}

const multiSelectFilter: FilterFn<Transaction> = (
  row,
  columnId,
  filterValue: string[]
) => {
  if (!filterValue || filterValue.length === 0) return true
  return filterValue.includes(row.getValue<string>(columnId))
}

/* ---------- Column filter components ---------- */

function TextColumnFilter({ column }: { column: Column<Transaction> }) {
  const value = (column.getFilterValue() as string) ?? ""
  return (
    <div className="flex flex-col gap-2 p-3">
      <p className="text-xs font-medium text-muted-foreground">
        Filter by {column.id === "tokenName" ? "token" : column.id}
      </p>
      <Input
        placeholder="Type to filter..."
        value={value}
        onChange={(e) => column.setFilterValue(e.target.value || undefined)}
        className="h-8 bg-secondary/50 border-border text-sm"
      />
    </div>
  )
}

function NumberRangeFilter({ column }: { column: Column<Transaction> }) {
  const filterValue = (column.getFilterValue() as
    | [number | undefined, number | undefined]
    | undefined) ?? [undefined, undefined]

  return (
    <div className="flex flex-col gap-2 p-3">
      <p className="text-xs font-medium text-muted-foreground">
        Filter range
      </p>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          placeholder="Min"
          value={filterValue[0] ?? ""}
          onChange={(e) => {
            const val = e.target.value ? Number(e.target.value) : undefined
            column.setFilterValue([val, filterValue[1]])
          }}
          className="h-8 w-24 bg-secondary/50 border-border text-sm"
        />
        <span className="text-xs text-muted-foreground">to</span>
        <Input
          type="number"
          placeholder="Max"
          value={filterValue[1] ?? ""}
          onChange={(e) => {
            const val = e.target.value ? Number(e.target.value) : undefined
            column.setFilterValue([filterValue[0], val])
          }}
          className="h-8 w-24 bg-secondary/50 border-border text-sm"
        />
      </div>
    </div>
  )
}

function MultiSelectFilter({
  column,
  options,
  eventTypesOrder,
}: {
  column: Column<Transaction>
  options: string[]
  eventTypesOrder: string[]
}) {
  const filterValue = (column.getFilterValue() as string[] | undefined) ?? []

  function toggle(val: string) {
    const next = filterValue.includes(val)
      ? filterValue.filter((v) => v !== val)
      : [...filterValue, val]
    column.setFilterValue(next.length > 0 ? next : undefined)
  }

  return (
    <div className="flex flex-col gap-2 p-3">
      <p className="text-xs font-medium text-muted-foreground">
        Filter by event type
      </p>
      <div className="flex flex-col gap-1">
        {options.map((opt) => (
          <label
            key={opt}
            className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm transition-colors hover:bg-secondary/50"
          >
            <input
              type="checkbox"
              checked={filterValue.includes(opt)}
              onChange={() => toggle(opt)}
              className="h-3.5 w-3.5 rounded border-border accent-primary"
            />
            <Badge
              variant="outline"
              className={cn(
                "whitespace-nowrap text-xs font-medium",
                getEventBadgeClass(opt, eventTypesOrder)
              )}
            >
              {opt}
            </Badge>
          </label>
        ))}
      </div>
    </div>
  )
}

/* ---------- Filterable header wrapper ---------- */

function FilterableHeader({
  column,
  label,
  children,
  align = "left",
}: {
  column: Column<Transaction>
  label: string
  children: React.ReactNode
  align?: "left" | "right" | "center"
}) {
  const isFiltered = column.getIsFiltered()
  return (
    <div
      className={cn(
        "flex items-center gap-1",
        align === "right" && "justify-end",
        align === "center" && "justify-center"
      )}
    >
      <Popover>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors hover:bg-secondary/60",
              isFiltered
                ? "text-primary"
                : "text-muted-foreground/40 hover:text-muted-foreground"
            )}
            aria-label={`Filter ${label}`}
          >
            <Filter className="h-3 w-3" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto min-w-[200px] p-0"
          align={align === "right" ? "end" : align === "center" ? "center" : "start"}
        >
          {children}
        </PopoverContent>
      </Popover>
    </div>
  )
}

/* ---------- Props ---------- */

interface TransactionTableProps {
  data: Transaction[]
  eventTypes: string[]
  eventTypesOrder: string[]
  hideTitle?: boolean
}

/* ---------- Component ---------- */

export function TransactionTable({
  data,
  eventTypes,
  eventTypesOrder,
  hideTitle,
}: TransactionTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "date", desc: false },
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  /* --- Column definitions --- */
  const columns = useMemo<ColumnDef<Transaction>[]>(
    () => [
      {
        accessorKey: "date",
        header: ({ column }) => (
          <div className="flex items-center gap-1">
            <button
              className="flex cursor-pointer items-center gap-1 whitespace-nowrap select-none"
              onClick={() => column.toggleSorting()}
            >
              Date
              <SortIcon column={column} />
            </button>
          </div>
        ),
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap text-sm">
            {formatDate(getValue<string>())}
          </span>
        ),
        enableColumnFilter: false,
      },
      {
        accessorKey: "tokenName",
        header: ({ column }) => (
          <div className="flex items-center gap-1">
            <button
              className="flex cursor-pointer items-center gap-1 whitespace-nowrap select-none"
              onClick={() => column.toggleSorting()}
            >
              Token
              <SortIcon column={column} />
            </button>
            <FilterableHeader column={column} label="token">
              <TextColumnFilter column={column} />
            </FilterableHeader>
          </div>
        ),
        cell: ({ getValue }) => (
          <span className="text-sm font-medium">{getValue<string>()}</span>
        ),
        filterFn: "includesString",
      },
      {
        accessorKey: "quantity",
        header: ({ column }) => (
          <div className="flex items-center justify-end gap-1">
            <button
              className="flex cursor-pointer items-center gap-1 whitespace-nowrap select-none"
              onClick={() => column.toggleSorting()}
            >
              Qty
              <SortIcon column={column} />
            </button>
            <FilterableHeader column={column} label="quantity" align="right">
              <NumberRangeFilter column={column} />
            </FilterableHeader>
          </div>
        ),
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap text-right font-mono text-sm">
            {formatQuantity(getValue<number>())}
          </span>
        ),
        filterFn: numberRangeFilter,
        meta: { align: "right" },
      },
      {
        accessorKey: "pricePerToken",
        header: () => (
          <span className="whitespace-nowrap">Price/Token</span>
        ),
        cell: ({ getValue }) => {
          const value = getValue<number>()
          if (value == null || Number.isNaN(value)) {
            return (
              <span className="whitespace-nowrap text-right font-mono text-sm text-muted-foreground">
                -
              </span>
            )
          }
          return (
            <span className="whitespace-nowrap text-right font-mono text-sm">
              {formatCurrency(value)}
            </span>
          )
        },
        enableSorting: false,
        enableColumnFilter: false,
        meta: { align: "right" },
      },
      {
        accessorKey: "totalPrice",
        header: ({ column }) => (
          <div className="flex items-center justify-end gap-1">
            <button
              className="flex cursor-pointer items-center gap-1 whitespace-nowrap select-none"
              onClick={() => column.toggleSorting()}
            >
              Total price
              <SortIcon column={column} />
            </button>
            <FilterableHeader column={column} label="total price" align="right">
              <NumberRangeFilter column={column} />
            </FilterableHeader>
          </div>
        ),
        cell: ({ getValue }) => {
          const value = getValue<number>()
          if (value == null || Number.isNaN(value)) {
            return (
              <span className="whitespace-nowrap text-right font-mono text-sm text-muted-foreground">
                -
              </span>
            )
          }
          return (
            <span className="whitespace-nowrap text-right font-mono text-sm">
              {formatCurrency(value)}
            </span>
          )
        },
        filterFn: numberRangeFilter,
        meta: { align: "right" },
      },
      {
        accessorKey: "eventType",
        header: ({ column }) => (
          <div className="flex items-center justify-center gap-1">
            <span className="whitespace-nowrap">Event</span>
            <FilterableHeader column={column} label="event" align="center">
              <MultiSelectFilter
                column={column}
                options={eventTypes}
                eventTypesOrder={eventTypesOrder}
              />
            </FilterableHeader>
          </div>
        ),
        cell: ({ getValue }) => {
          const et = getValue<string>()
          return (
            <Badge
              variant="outline"
              className={cn(
                "whitespace-nowrap text-xs font-medium",
                getEventBadgeClass(et, eventTypesOrder)
              )}
            >
              {et}
            </Badge>
          )
        },
        filterFn: multiSelectFilter,
        enableSorting: false,
        meta: { align: "center" },
      },
      {
        accessorKey: "txHash",
        header: () => <span className="whitespace-nowrap">TX Hash</span>,
        cell: ({ getValue }) => {
          const hash = getValue<string>()
          return (
            <a
              href={`https://gnosisscan.io/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {truncateHash(hash)}
              <ExternalLink className="h-3 w-3" />
            </a>
          )
        },
        enableSorting: false,
        enableColumnFilter: false,
      },
    ],
    [eventTypes, eventTypesOrder]
  )

  /* --- Table instance --- */
  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: ROWS_PER_PAGE },
    },
  })

  const activeFilterCount = columnFilters.length
  const totalRows = table.getFilteredRowModel().rows.length

  /* --- CSV export --- */
  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      {(!hideTitle || activeFilterCount > 0) && (
        <div className="flex items-center gap-3">
          {!hideTitle && (
            <h2 className="text-lg font-semibold text-foreground">
              Event history
            </h2>
          )}
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setColumnFilters([])}
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="mr-1 h-3 w-3" />
              Clear {activeFilterCount} filter
              {activeFilterCount > 1 ? "s" : ""}
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-border hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => {
                  const align =
                    (header.column.columnDef.meta as { align?: string })
                      ?.align ?? "left"
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        align === "right" && "text-right",
                        align === "center" && "text-center"
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-border transition-colors hover:bg-secondary/30"
                >
                  {row.getVisibleCells().map((cell) => {
                    const align =
                      (cell.column.columnDef.meta as { align?: string })
                        ?.align ?? "left"
                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          align === "right" && "text-right",
                          align === "center" && "text-center"
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {totalRows} transaction{totalRows !== 1 ? "s" : ""}
          {totalRows !== data.length && ` (filtered from ${data.length})`}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            className="border-border"
          >
            Previous
          </Button>
          <span>
            {table.getState().pagination.pageIndex + 1} /{" "}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            className="border-border"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ---------- Sort icon ---------- */

function SortIcon({ column }: { column: Column<Transaction> }) {
  const sorted = column.getIsSorted()
  if (!sorted)
    return (
      <ArrowUpDown className="ml-1 inline h-3 w-3 text-muted-foreground/50" />
    )
  return sorted === "asc" ? (
    <ArrowUp className="ml-1 inline h-3 w-3 text-foreground" />
  ) : (
    <ArrowDown className="ml-1 inline h-3 w-3 text-foreground" />
  )
}
