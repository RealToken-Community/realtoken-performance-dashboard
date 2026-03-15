"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"
import type { PerformanceData } from "@/lib/performance"
import { getPerformance } from "@/lib/performance"

type PerformanceStatus = "idle" | "loading" | "success" | "error"

interface PerformanceContextValue {
  address: string | null
  data: PerformanceData | null
  status: PerformanceStatus
  error: string | null
  startFetch: (address: string, disableCache?: boolean) => void
  reset: () => void
}

const PerformanceContext = createContext<PerformanceContextValue | undefined>(
  undefined
)

export function PerformanceProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [address, setAddress] = useState<string | null>(null)
  const [data, setData] = useState<PerformanceData | null>(null)
  const [status, setStatus] = useState<PerformanceStatus>("idle")
  const [error, setError] = useState<string | null>(null)

  const startFetch = useCallback((walletAddress: string, disableCache?: boolean) => {
    setAddress(walletAddress)
    setStatus("loading")
    setError(null)

    getPerformance(walletAddress, disableCache)
      .then((result) => {
        setData(result)
        setStatus("success")
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "Failed to load performance"
        )
        setStatus("error")
      })
  }, [])

  const reset = useCallback(() => {
    setAddress(null)
    setData(null)
    setStatus("idle")
    setError(null)
  }, [])

  const value = useMemo(
    () => ({
      address,
      data,
      status,
      error,
      startFetch,
      reset,
    }),
    [address, data, status, error, startFetch, reset]
  )

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  )
}

export function usePerformance(): PerformanceContextValue {
  const ctx = useContext(PerformanceContext)
  if (!ctx) {
    throw new Error("usePerformance must be used within a PerformanceProvider")
  }
  return ctx
}

