"use client"

import { memo, useMemo, useState, useEffect } from "react"
import Image from "next/image"
import { RefreshCw, ChevronDown, Download } from "lucide-react"
import { getAddress } from "ethers"
import { cn } from "@/lib/utils"
import { KpiTile } from "@/components/kpi-tile"
import { BreakdownBar } from "@/components/breakdown-bar"
import { WalletMenu } from "@/components/wallet-menu"
import { TransactionTable, exportTransactionsCsv } from "@/components/transaction-table"
import { TokenContextBar } from "@/components/token-context-bar"
import { buildEventsFromResponse, type Transaction } from "@/lib/data"
import { useTokens } from "@/components/tokens-provider"
import { usePerformance } from "@/components/performance-provider"

interface DashboardProps {
  onRefresh?: () => void
  onSwitchWallet?: () => void
}

const STORAGE_KEY = "rtperf-event-history-expanded"

function usePersistedState(key: string, defaultValue: boolean) {
  const [value, setValue] = useState(defaultValue)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored !== null) setValue(stored === "true")
    } catch {}
    setHydrated(true)
  }, [key])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(key, String(value))
    } catch {}
  }, [key, value, hydrated])

  return [value, setValue, hydrated] as const
}

export function Dashboard({ onRefresh, onSwitchWallet }: DashboardProps) {
  const [selectedToken, setSelectedToken] = useState<string>("all")
  const [tableExpanded, setTableExpanded, hydrated] = usePersistedState(
    STORAGE_KEY,
    false
  )
  const { tokens } = useTokens()
  const { data, reset } = usePerformance()

  const wallets = useMemo(() => {
    const anyData = data as unknown as { wallets?: unknown }
    if (anyData && Array.isArray(anyData.wallets)) {
      return anyData.wallets as string[]
    }
    return [] as string[]
  }, [data])

  const tokenOptions = useMemo(
    () =>
      tokens.map((token) => ({
        value: token.uuid,
        label: token.shortName || token.fullName,
      })),
    [tokens]
  )

  const tokenNameByAddress = useMemo(() => {
    const map = new Map<string, string>()
    for (const token of tokens) {
      const addr = (token.uuid ?? "").toLowerCase()
      if (addr) {
        map.set(addr, token.shortName || token.fullName)
      }
    }
    return map
  }, [tokens])

  const allEvents: Transaction[] = useMemo(() => {
    if (!data || !("events" in data) || !data.events) return []
    return buildEventsFromResponse(data.events)
  }, [data])

  const eventTypes = useMemo(
    () => [...new Set(allEvents.map((e) => e.eventType))].sort(),
    [allEvents]
  )

  const eventTypesOrder = useMemo(() => {
    const fromApi = data && "event_types" in data && Array.isArray(data.event_types)
      ? (data.event_types as string[])
      : []
    if (fromApi.length > 0) return fromApi
    return eventTypes
  }, [data, eventTypes])

  const filteredEvents = useMemo(() => {
    if (selectedToken === "all") return allEvents
    const selectedLower = selectedToken.toLowerCase()
    return allEvents.filter((e) => e.tokenAddress.toLowerCase() === selectedLower)
  }, [allEvents, selectedToken])

  const tableEvents: Transaction[] = useMemo(() => {
    const events = filteredEvents.map((evt) => {
      const normalizedAddress = evt.tokenAddress.toLowerCase()
      const name = tokenNameByAddress.get(normalizedAddress)
      return {
        ...evt,
        tokenName: name,
      }
    })
    return events
  }, [filteredEvents, tokenNameByAddress])

  const performanceData = useMemo(() => {
    if (!data?.performance) return undefined
    if (selectedToken === "all") {
      return data.performance.portfolio
    }

    try {
      const checksumAddress = getAddress(selectedToken)
      const tokenPerf = data.performance.by_token[checksumAddress]
      return tokenPerf
    } catch {
      return undefined
    }
  }, [data, selectedToken])

  const breakdownSegments = useMemo(() => {
    const realized =
      Number(performanceData?.realized.realized_pnl ?? 0)
  
    const unrealized =
      Number(performanceData?.unrealized.unrealized_pnl ?? 0)
  
    const income =
      Number(performanceData?.distributed_income.total_revenues_distributed ?? 0)
  
    return [
      { label: "Realized", value: realized, color: "#5B8DEF" },
      { label: "Unrealized", value: unrealized, color: "#D4915E" },
      { label: "Income", value: income, color: "#5BBFB5" },
    ]
  }, [
    performanceData?.realized?.realized_pnl,
    performanceData?.unrealized?.unrealized_pnl,
    performanceData?.distributed_income?.total_revenues_distributed,
  ])
  
  return (
    <main className="flex min-h-screen items-start justify-center bg-background px-6 pt-6 pb-16">
      <section className="w-full max-w-[1600px]">
        {/* Section header */}
        <div className="mb-5 flex items-center gap-3">
          <Image
            src="/images/logo.png"
            alt="Realtoken logo"
            width={36}
            height={36}
            className="shrink-0"
          />
          <h1 className="text-lg font-bold tracking-tight text-foreground whitespace-nowrap sm:text-2xl">
            <span className="sm:hidden">Performance Dashboard</span>
            <span className="hidden sm:inline">
              Realtoken Performance Dashboard
            </span>
          </h1>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="flex items-center justify-center rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Refresh data"
                title="Refresh data"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
            <Wallet
              wallets={wallets}
              onSwitchWallet={() => {
                reset()
                onSwitchWallet?.()
              }}
            />
          </div>
        </div>

        {/* Token context bar */}
        <div className="mb-4">
          <TokenContextBar
            options={tokenOptions}
            value={selectedToken}
            onValueChange={setSelectedToken}
          />
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <KpiTile
            title="Realized Gain"
            gainValue={performanceData?.realized.realized_pnl as number}
            percentValue={performanceData?.realized.return_pct as number}
            percentSuffix="total return"
            footer="From completed sales"
            tooltipText={
              <>
                <strong>Realized gains from closed positions.</strong>
                <br />
                Calculated using the Weighted Average Cost (WAC) method, where each sale is matched against an average acquisition price based on prior purchases.
                <br />
                <br />
                <strong>Total cost basis:</strong> what you originally paid for the sold tokens
                <br />
                <strong>Total sales value:</strong> what you received when selling them
              </>
            }          
            detailedInfo={[
              { type: "percent", value: performanceData?.realized.annualized_return_pct as number, label: "Annualized return" },
              { type: "text", value: performanceData?.realized.avg_holding_days as number, label: "Avg. holding period" },
              { type: "gain", value: performanceData?.realized.total_cost_basis_out as number, label: "Total cost basis" },
              { type: "gain", value: performanceData?.realized.total_out_value as number, label: "Total sales value" },
            ]}
          />
          <KpiTile
            title="Unrealized Gain"
            gainValue={performanceData?.unrealized.unrealized_pnl as number}
            percentValue={performanceData?.unrealized.return_pct as number}
            percentSuffix="total return"
            footer="Based on current Realt price"
            tooltipText={
              <>
                <strong>Unrealized gains from open positions.</strong>
                <br />
                Calculated using the Weighted Average Cost (WAC) method, where remaining tokens keep an average acquisition price based on prior purchases.
                <br />
                <br />
                Unrealized PnL compares this cost basis to the current Realt valuation.
              </>
            }
            detailedInfo={[
              { type: "percent", value: performanceData?.unrealized.annualized_return_pct as number, label: "Annualized return" },
              { type: "text", value: performanceData?.unrealized.avg_holding_days as number, label: "Avg. holding period" },
              { type: "gain", value: performanceData?.unrealized.cost_basis as number, label: "Total cost basis" },
              { type: "gain", value: performanceData?.unrealized.current_value as number, label: "Current market value" },
            ]}
          />
          {/* TODO: When annualized return is available, remove comingSoonText and add: percentSuffix="annualized return" */}
          <KpiTile
            title="Distributed Income"
            gainValue={performanceData?.distributed_income.total_revenues_distributed as number}
            percentValue={performanceData?.distributed_income.annualized_return_pct as number}
            comingSoonText="Annualized return"
            footer="Total distributed income"
            tooltipText={
              <>
                <strong>Distributed income</strong>
                <br />
                Includes all types of income such as rent, factoring, and interest payments.
                <br />
                <br />
                Values are extracted from distributed CSV files provided by Realt.
                This reflects income that has been effectively received, not theoretical or expected returns.
              </>
            }
          />
          <KpiTile
            title="Overall Performance"
            gainValue={performanceData?.overall_performance.total_return as number}
            percentValue={performanceData?.overall_performance.roi_pct as number}
            percentSuffix="ROI"
            footer="Realized + Unrealized + Income"
            tooltipText="Overall performance. Calculated using the Internal Rate of Return (IRR) method for the annualized return and combined return across all categories for ROI gain."
            highlighted
            percentPrimary
            secondaryLines={[
              {
                type: "percent",
                value: performanceData?.overall_performance.irr_pct as number,
                label: "Annualized return (IRR)",
              },
            ]}
          >
            <BreakdownBar segments={breakdownSegments} />
          </KpiTile>
        </div>

        {/* Event history -- collapsible */}
        <div className="mt-6">
          <div className="flex items-center justify-between rounded-lg border border-border bg-card px-5 py-3">
            <button
              onClick={() => setTableExpanded((prev) => !prev)}
              className="flex flex-1 items-center gap-3 text-left"
            >
              <h2 className="text-lg font-semibold text-foreground">
                Event history
              </h2>
              <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                {tableEvents.length} event
                {tableEvents.length !== 1 ? "s" : ""}
              </span>
            </button>
            <div className="flex items-center gap-2">
              {tableExpanded && hydrated && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    exportTransactionsCsv(tableEvents)
                  }}
                  className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  aria-label="Export CSV"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Export CSV</span>
                </button>
              )}
              <button
                onClick={() => setTableExpanded((prev) => !prev)}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label={tableExpanded ? "Collapse table" : "Expand table"}
              >
                <ChevronDown
                  className={cn(
                    "h-5 w-5 transition-transform duration-300",
                    tableExpanded && "rotate-180"
                  )}
                />
              </button>
            </div>
          </div>

          <div
            className={cn(
              "grid transition-all duration-300 ease-in-out",
              tableExpanded && hydrated
                ? "grid-rows-[1fr] opacity-100 mt-4"
                : "grid-rows-[0fr] opacity-0"
            )}
          >
            <div className="overflow-hidden">
              <TransactionTable
                data={tableEvents}
                eventTypes={eventTypes}
                eventTypesOrder={eventTypesOrder}
                hideTitle
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

interface WalletProps {
  wallets: string[]
  onSwitchWallet?: () => void
}

const Wallet = memo(function Wallet({ wallets, onSwitchWallet }: WalletProps) {
  if (!wallets.length) return null

  return (
    <WalletMenu
      wallets={wallets}
      onSwitchWallet={onSwitchWallet}
    />
  )
})
