"use client"

import { useState, useCallback } from "react"
import { WalletEntry } from "@/components/wallet-entry"
import { LoadingScreen } from "@/components/loading-screen"
import { Dashboard } from "@/components/dashboard"
import { TokensProvider } from "@/components/tokens-provider"
import { PerformanceProvider } from "@/components/performance-provider"

type AppState =
  | { phase: "entry" }
  | { phase: "loading"; address: string; disableCache?: boolean }
  | { phase: "dashboard"; address: string }

export default function Page() {
  const [state, setState] = useState<AppState>({ phase: "entry" })

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
    <TokensProvider>
      <PerformanceProvider>
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
      </PerformanceProvider>
    </TokensProvider>
  )
}


