/* ---------- Types matching the API response format ---------- */

export interface RawEvent {
  amount: string
  destination: string
  event_type: string
  log_index: number
  price_per_token: string
  source: string
  timestamp: string
  token_address: string
  total_price: string
  transaction_hash: string
}

/* Flattened event for the table */
export interface Transaction {
  id: string
  date: string
  tokenAddress: string
  quantity: number
  pricePerToken: number
  totalPrice: number
  eventType: string
  txHash: string
}

/* ---------- Helpers to build events from API response ---------- */

export function buildEventsFromResponse(
  eventsByToken: Record<string, RawEvent[]>
): Transaction[] {
  const events: Transaction[] = []

  for (const [tokenAddr, rawEvents] of Object.entries(eventsByToken)) {
    for (const evt of rawEvents) {
      events.push({
        id: `${evt.transaction_hash}-${evt.log_index}`,
        date: evt.timestamp,
        tokenAddress: tokenAddr,
        quantity: parseFloat(evt.amount),
        pricePerToken: parseFloat(evt.price_per_token),
        totalPrice: parseFloat(evt.total_price),
        eventType: evt.event_type,
        txHash: evt.transaction_hash,
      })
    }
  }

  return events.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
}
