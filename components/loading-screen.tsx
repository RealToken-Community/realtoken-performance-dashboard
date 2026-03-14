"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { usePerformance } from "@/components/performance-provider"

const STEPS = [
  "Fetching transaction history...",
  "Calculating performance metrics...",
  "Preparing dashboard...",
]

interface LoadingScreenProps {
  address: string
  onComplete: () => void
}

export function LoadingScreen({ address, onComplete }: LoadingScreenProps) {
  const [step, setStep] = useState(0)
  const { status, startFetch } = usePerformance()

  useEffect(() => {
    const interval = setInterval(
      () => setStep((prev) => (prev + 1) % STEPS.length),
      2200
    )

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    startFetch(address)
  }, [address, startFetch])

  useEffect(() => {
    if (status === "success" || status === "error") {
      onComplete()
    }
  }, [status, onComplete])

  function truncate(addr: string) {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="flex flex-col items-center gap-6">
        {/* Pulsing logo */}
        <div className="animate-pulse">
          <Image
            src="/images/logo.png"
            alt="Realtoken logo"
            width={48}
            height={48}
            priority
          />
        </div>

        {/* Spinner */}
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary" />

        {/* Progress messages */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-medium text-foreground transition-all duration-300">
            {STEPS[step]}
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            {truncate(address)}
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={
                i <= step
                  ? "h-1.5 w-6 rounded-full bg-primary transition-colors duration-300"
                  : "h-1.5 w-6 rounded-full bg-muted transition-colors duration-300"
              }
            />
          ))}
        </div>
      </div>
    </main>
  )
}
