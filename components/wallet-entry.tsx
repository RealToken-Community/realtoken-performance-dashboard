"use client"

import { useState } from "react"
import Image from "next/image"
import { ArrowRight, TrendingUp, PieChart, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const FEATURES = [
  {
    icon: TrendingUp,
    title: "Realized & Unrealized Gains",
    description:
      "Track your closed and open positions using Weighted Average Cost methodology.",
  },
  {
    icon: PieChart,
    title: "Income & Distributions",
    description:
      "Monitor all received dividends and interest payments across your portfolio.",
  },
  {
    icon: BarChart3,
    title: "Annualized Returns (IRR)",
    description:
      "Get accurate annualized performance metrics using Internal Rate of Return.",
  },
]

interface WalletEntryProps {
  onSubmit: (address: string) => void
}

export function WalletEntry({ onSubmit }: WalletEntryProps) {
  const [address, setAddress] = useState("")
  const [error, setError] = useState("")

  function handleSubmit() {
    const trimmed = address.trim()
    if (!trimmed) {
      setError("Please enter a wallet address")
      return
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
      setError("Invalid Ethereum address format")
      return
    }
    setError("")
    onSubmit(trimmed)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16">
      <div className="flex w-full max-w-2xl flex-col items-center">
        {/* Logo + Title */}
        <div className="mb-10 flex flex-col items-center gap-4">
          <Image
            src="/images/logo.png"
            alt="Realtoken logo"
            width={56}
            height={56}
          />
          <h1 className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl text-balance">
            Realtoken Performance Dashboard
          </h1>
          <p className="max-w-md text-center text-sm leading-relaxed text-muted-foreground">
            Enter your wallet address to analyze your RealToken portfolio
            performance across all linked wallets.
          </p>
        </div>

        {/* Wallet input */}
        <div className="mb-4 flex w-full max-w-lg flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value)
                if (error) setError("")
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit()
              }}
              placeholder="0x..."
              className={cn(
                "flex-1 rounded-lg border bg-secondary/50 px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary",
                error ? "border-red-500/60" : "border-border"
              )}
              spellCheck={false}
              autoComplete="off"
            />
            <Button
              onClick={handleSubmit}
              className="shrink-0 gap-2 px-5 py-3"
              size="lg"
            >
              Analyze
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}
          <p className="text-xs text-muted-foreground/70">
            All wallets linked to the same Realt user ID will be automatically
            detected.
          </p>
        </div>

        {/* Feature cards */}
        <div className="mt-10 grid w-full max-w-lg grid-cols-1 gap-4 sm:grid-cols-3 sm:max-w-none">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card/50 p-5"
            >
              <feature.icon className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
