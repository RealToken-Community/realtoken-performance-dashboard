"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { WalletEntry } from "@/components/wallet-entry"
import { LoadingScreen } from "@/components/loading-screen"
import { Dashboard } from "@/components/dashboard"
import { TokensProvider } from "@/components/tokens-provider"
import { PerformanceProvider, usePerformance } from "@/components/performance-provider"
import { toast } from "@/hooks/use-toast"

type AppState =
  | { phase: "entry" }
  | { phase: "loading"; address: string; disableCache?: boolean }
  | { phase: "dashboard"; address: string }

function PageContent() {
  const [state, setState] = useState<AppState>({ phase: "entry" })
  const { status, error } = usePerformance()
  const prevStatusRef = useRef(status)

  // Show error toast when fetch fails
  useEffect(() => {
    if (prevStatusRef.current === "loading" && status === "error" && error) {
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Unable to fetch performance data. The server may be unavailable. Please try again later.",
      })
    }
    prevStatusRef.current = status
  }, [status, error])

  const handleSubmit = useCallback((address: string) => {
    setState({ phase: "loading", address, disableCache: false })
  }, [])

  const handleLoadingComplete = useCallback(() => {
    if (state.phase === "loading") {
      setState({ phase: "dashboard", address: state.address })
    }
  }, [state])

  const handleRefresh = useCallback(() => {
    if (state.phase === "dashboard") {
      setState({ phase: "loading", address: state.address, disableCache: true })
    }
  }, [state])

  const handleSwitchWallet = useCallback(() => {
    setState({ phase: "entry" })
  }, [])

  return (
    <>
      {state.phase === "entry" && <WalletEntry onSubmit={handleSubmit} />}
      {state.phase === "loading" && (
        <LoadingScreen
          address={state.address}
          disableCache={state.disableCache}
          onComplete={handleLoadingComplete}
        />
      )}
      {state.phase === "dashboard" && (
        <Dashboard
          onRefresh={handleRefresh}
          onSwitchWallet={handleSwitchWallet}
        />
      )}
    </>
  )
}

export default function Page() {
  return (
    <TokensProvider>
      <PerformanceProvider>
        <PageContent />
      </PerformanceProvider>
    </TokensProvider>
  )
}


