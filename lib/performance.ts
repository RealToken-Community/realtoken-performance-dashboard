import type { RawEvent } from "@/lib/data"

export interface RealizedPerformance {
  realized_pnl: number
  return_pct: number
  annualized_return_pct: number
  total_cost_basis_out: number
  total_out_value: number
  avg_holding_days: number
}

export interface UnealizedPerformance {
  unrealized_pnl: number
  return_pct: number
  annualized_return_pct: number
  cost_basis: number
  current_value: number
  avg_holding_days: number
}

export interface DistributedIncome {
  total_revenues_distributed: number
  annualized_return_pct: number
}

export interface OverallPerformance {
  total_return: number
  irr_pct: number
  roi_pct: number
  total_cost_basis: number
  income_distributed: number
  realized_gain: number
  unrealized_gain: number
}

export interface PerformanceData {
  wallets: string[]
  event_types: string[]
  events: Record<string, RawEvent[]>
  performance: {
    portfolio: {
      realized: RealizedPerformance
      unrealized: UnealizedPerformance
      distributed_income: DistributedIncome
      overall_performance : OverallPerformance
    }
    by_token: Record<
      string, // token uuid
      {
        realized: RealizedPerformance
        unrealized: UnealizedPerformance
        distributed_income: DistributedIncome
        overall_performance : OverallPerformance
      }
    >
  }
}

export async function getPerformance(
  walletAddress: string,
  disableCache?: boolean
): Promise<PerformanceData> {
  const baseUrl = process.env.NEXT_PUBLIC_API_PORT
    ? `${window.location.protocol}//${window.location.hostname}:${process.env.NEXT_PUBLIC_API_PORT}`
    : window.location.origin

  const params = new URLSearchParams({
    wallet: walletAddress,
  })

  if (disableCache) {
    params.set("no_cache", "true")
  }

  const url = `${baseUrl}/api/v1/realtokens-performance?${params.toString()}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch performance: ${response.statusText}`)
  }

  const data = (await response.json()) as PerformanceData
  return data
}

