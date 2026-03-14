"use client"

import { useState, useRef, useEffect } from "react"
import { Wallet, Copy, Check, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

interface WalletMenuProps {
  wallets: string[]
  onSwitchWallet?: () => void
}

export function WalletMenu({ wallets, onSwitchWallet }: WalletMenuProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState<number | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleCopy(address: string, index: number) {
    navigator.clipboard.writeText(address)
    setCopied(index)
    setTimeout(() => setCopied(null), 1500)
  }

  function truncate(address: string) {
    return `${address.slice(0, 6)}...${address.slice(-6)}`
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
          open && "bg-secondary text-foreground"
        )}
        aria-label="Show linked wallets"
      >
        <Wallet className="h-4 w-4" />
        <span className="hidden sm:inline">{wallets.length} wallets</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-border bg-card p-4 shadow-xl shadow-black/30">
          <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
            Performance is calculated across all wallets linked to the same
            Realt user ID.
          </p>

          <div className="flex flex-col gap-1.5">
            {wallets.map((address, i) => (
              <div
                key={address}
                className="flex items-center justify-between rounded-lg bg-secondary/60 px-3 py-2"
              >
                <span className="font-mono text-xs text-foreground">
                  {truncate(address)}
                </span>
                <button
                  onClick={() => handleCopy(address, i)}
                  className="ml-2 flex-shrink-0 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={`Copy wallet address ${truncate(address)}`}
                >
                  {copied === i ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>

          {onSwitchWallet && (
            <>
              <div className="my-3 h-px bg-border/40" />
              <button
                onClick={() => {
                  setOpen(false)
                  onSwitchWallet()
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <LogOut className="h-3.5 w-3.5" />
                Switch wallet
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
