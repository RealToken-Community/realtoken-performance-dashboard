"use client"

import { useState } from "react"
import { Info } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/**
 * Format a raw float into a signed percentage string, e.g. 15.2 -> "+15.2%".
 * If value is null/undefined, returns "-" instead.
 */
export function formatPercent(value?: number | null): string {
  if (value == null) return "-"
  const sign = value >= 0 ? "+" : ""
  return `${sign}${value.toFixed(1)}%`
}

/**
 * Format a raw float into a signed gain string with space as thousands separator.
 * e.g. 12450 -> "+12 450 $"  |  -800 -> "-800 $"
 */
export function formatGain(value?: number): string {
  if (value == null) return "-"
  const sign = value >= 0 ? "+" : ""
  const abs = Math.abs(value)
  const intPart = Math.round(abs).toString()
  const withSpaces = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  return `${sign}${value < 0 ? "-" : ""}${withSpaces} $`
}

/* ---------- Detailed information shown on hover ---------- */

interface DetailedInfo {
  label: string
  value: number
  /** "percent" renders as +X.X%, "gain" renders formatted $, "text" renders as "N days" */
  type: "percent" | "gain" | "text"
}

/* ---------- Secondary line for custom layouts ---------- */

interface SecondaryLine {
  label?: string
  value: number
  type: "percent" | "gain"
}

/* ---------- Main tile props ---------- */

interface KpiTileProps {
  title: string
  /** Raw gain value in $ (float) */
  gainValue?: number
  /** Raw percentage value (float) */
  percentValue: number
  /** Suffix displayed after the percentage, e.g. "overall return" */
  percentSuffix?: string
  footer: string
  /** Tooltip content - supports React nodes for formatting (bold, line breaks, etc.) */
  tooltipText?: React.ReactNode
  highlighted?: boolean
  /** If true, percentage is the primary display and gain is secondary */
  percentPrimary?: boolean
  /** Extra secondary lines rendered below the main secondary */
  secondaryLines?: SecondaryLine[]
  children?: React.ReactNode
  /** Detailed information revealed on hover */
  detailedInfo?: DetailedInfo[]
  /** If provided, replaces the secondary % line with a "Coming Soon" placeholder */
  comingSoonText?: string
}

export function KpiTile({
  title,
  gainValue,
  percentValue,
  percentSuffix,
  footer,
  tooltipText,
  highlighted = false,
  percentPrimary = false,
  secondaryLines,
  children,
  detailedInfo,
  comingSoonText,
}: KpiTileProps) {
  const [showDetails, setShowDetails] = useState(false)

  const formattedGain = formatGain(gainValue)
  const formattedPercent = formatPercent(percentValue)
  const percentColor = percentValue >= 0 ? "text-emerald-400" : "text-red-400"

  /* ---- Primary display ---- */
  const primaryDisplay = percentPrimary ? (
    <span className={cn("text-3xl font-bold tracking-tight", percentColor)}>
      {formattedPercent}
      {percentSuffix && (
        <span className="ml-1.5 text-base font-medium text-muted-foreground">
          {percentSuffix}
        </span>
      )}
    </span>
  ) : (
    <span className="text-3xl font-bold tracking-tight text-foreground">
      {formattedGain}
    </span>
  )

  /* ---- Secondary display ---- */
  const secondaryDisplay = comingSoonText ? (
    <span className="mt-1.5 flex items-center gap-2 text-sm">
      <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
        Coming soon
      </span>
      <span className="text-muted-foreground/60 italic">
        {comingSoonText}
      </span>
    </span>
  ) : percentPrimary ? (
    <span className="mt-1.5 text-sm font-medium text-foreground">
      {formattedGain}
    </span>
  ) : (
    <span className={cn("mt-1.5 text-sm font-medium", percentColor)}>
      {formattedPercent}
      {percentSuffix && (
        <span className="ml-1 text-muted-foreground">{percentSuffix}</span>
      )}
    </span>
  )

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border bg-card p-6 transition-all duration-300 hover:shadow-lg",
        highlighted
          ? "border-primary/40 shadow-[0_0_24px_-6px] shadow-primary/10"
          : "border-border hover:border-border/80"
      )}
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </span>
        {tooltipText && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="text-muted-foreground/50 transition-colors hover:text-muted-foreground"
                aria-label={`More info about ${title}`}
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-72">
              <div className="leading-relaxed">{tooltipText}</div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Divider */}
      <div className="my-4 h-px bg-border/60" />

      {/* Primary value */}
      {primaryDisplay}

      {/* Extra secondary lines rendered before gain when percentPrimary */}
      {percentPrimary && secondaryLines && secondaryLines.length > 0 && (
        <div className="mt-1 flex flex-col gap-0.5">
          {secondaryLines.map((line, i) => {
            const val =
              line.type === "percent"
                ? formatPercent(line.value)
                : formatGain(line.value)
            const color =
              line.type === "percent"
                ? line.value >= 0
                  ? "text-emerald-400"
                  : "text-red-400"
                : "text-foreground"
            return (
              <div key={i} className="flex items-center gap-1.5 text-sm">
                <span className={cn("font-medium", color)}>{val}</span>
                {line.label && (
                  <span className="text-muted-foreground">{line.label}</span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Secondary value */}
      {secondaryDisplay}

      {/* Extra secondary lines rendered after secondary for non-percentPrimary tiles */}
      {!percentPrimary && secondaryLines && secondaryLines.length > 0 && (
        <div className="mt-1 flex flex-col gap-0.5">
          {secondaryLines.map((line, i) => {
            const val =
              line.type === "percent"
                ? formatPercent(line.value)
                : formatGain(line.value)
            const color =
              line.type === "percent"
                ? line.value >= 0
                  ? "text-emerald-400"
                  : "text-red-400"
                : "text-foreground"
            return (
              <div key={i} className="flex items-center gap-1.5 text-sm">
                <span className={cn("font-medium", color)}>{val}</span>
                {line.label && (
                  <span className="text-muted-foreground">{line.label}</span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Detailed information - always rendered to reserve height, fade in/out on hover */}
      {detailedInfo && detailedInfo.length > 0 && (
        <div
          className={cn(
            "mt-3 flex flex-col gap-1.5 transition-opacity duration-300",
            showDetails ? "opacity-100" : "opacity-0"
          )}
          aria-hidden={!showDetails}
        >
          <div className="h-px bg-border/40" />
          {detailedInfo.map((detail, i) => {
            let displayValue: string
            let color: string

            if (detail.type === "percent") {
              displayValue = formatPercent(detail.value)
              color =
                detail.value >= 0 ? "text-emerald-400" : "text-red-400"
            } else if (detail.type === "gain") {
              displayValue = formatGain(detail.value)
              color = "text-foreground"
            } else {
              displayValue = `${Math.round(detail.value)} days`
              color = "text-muted-foreground"
            }

            return (
              <div
                key={i}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-muted-foreground">{detail.label}</span>
                <span className={cn("font-medium", color)}>{displayValue}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Optional breakdown visual */}
      {children && <div className="mt-4">{children}</div>}

      {/* Spacer pushes footer to the bottom so all tiles align */}
      <div className="flex-1" />

      {/* Footer */}
      <p className="mt-4 text-xs text-muted-foreground">{footer}</p>
    </div>
  )
}
