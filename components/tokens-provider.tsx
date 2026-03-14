"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { RealTokenMeta } from "@/lib/tokens"
import { getTokens } from "@/lib/tokens"

interface TokensContextValue {
  tokens: RealTokenMeta[]
  isLoading: boolean
  error: string | null
}

const TokensContext = createContext<TokensContextValue | undefined>(undefined)

export function TokensProvider({ children }: { children: React.ReactNode }) {
  const [tokens, setTokens] = useState<RealTokenMeta[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    setIsLoading(true)
    setError(null)

    getTokens()
      .then((allTokens) => {
        if (cancelled) return

        const filteredTokens = allTokens.filter((token) => {
          const shortName = token.shortName ?? ""
          return !/^old/i.test(shortName)
        })

        setTokens(filteredTokens)
        setIsLoading(false)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Failed to load tokens")
        setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <TokensContext.Provider value={{ tokens, isLoading, error }}>
      {children}
    </TokensContext.Provider>
  )
}

export function useTokens(): TokensContextValue {
  const ctx = useContext(TokensContext)
  if (!ctx) {
    throw new Error("useTokens must be used within a TokensProvider")
  }
  return ctx
}

