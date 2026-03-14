export interface RealTokenMeta {
  fullName: string
  shortName: string
  symbol: string
  tokenPrice: number
  currency: string
  uuid: string
}

let cachedTokens: RealTokenMeta[] | null = null
let inFlightPromise: Promise<RealTokenMeta[]> | null = null

async function fetchTokensFromApi(): Promise<RealTokenMeta[]> {
  const response = await fetch("https://api.realtoken.community/v1/token")

  if (!response.ok) {
    throw new Error(`Failed to fetch tokens: ${response.statusText}`)
  }

  const data = (await response.json()) as RealTokenMeta[]
  return data
}

export async function getTokens(): Promise<RealTokenMeta[]> {
  if (cachedTokens) {
    return cachedTokens
  }

  if (inFlightPromise) {
    return inFlightPromise
  }

  inFlightPromise = fetchTokensFromApi()
    .then((tokens) => {
      cachedTokens = tokens
      inFlightPromise = null
      return tokens
    })
    .catch((error) => {
      inFlightPromise = null
      throw error
    })

  return inFlightPromise
}

