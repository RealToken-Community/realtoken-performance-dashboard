"use client"

import { TokenCombobox } from "@/components/token-combobox"
import { cn } from "@/lib/utils"

interface TokenOption {
  value: string
  label: string
}

interface TokenContextBarProps {
  options: TokenOption[]
  value: string
  onValueChange: (value: string) => void
}

export function TokenContextBar({
  options,
  value,
  onValueChange,
}: TokenContextBarProps) {
  const isFiltered = value !== "all"
  const selectedLabel = options.find((o) => o.value === value)?.label

  return (
    <div
      className={cn(
        "relative rounded-lg border px-5 py-3 transition-all duration-300",
        isFiltered
          ? "border-primary/30 bg-primary/[0.04]"
          : "border-border bg-card/50"
      )}
    >
      {/* Left accent bar when filtered */}
      <div
        className={cn(
          "absolute left-0 top-3 bottom-3 w-[3px] rounded-full transition-all duration-300",
          isFiltered ? "bg-primary opacity-100" : "bg-transparent opacity-0"
        )}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        {/* Label + combobox */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <span className="shrink-0 text-sm font-medium text-foreground">
            Scope
          </span>
          <TokenCombobox
            options={options}
            value={value}
            onValueChange={onValueChange}
            placeholder="All tokens -- Global portfolio view"
            className="w-full sm:w-[380px]"
          />
        </div>

        {/* Context description */}
        <p className="text-xs leading-relaxed text-muted-foreground">
          {isFiltered ? (
            <>
              Viewing performance for{" "}
              <span className="font-medium text-foreground">
                {selectedLabel}
              </span>
              . Performance indicators and transactions are filtered to this token.
            </>
          ) : (
            "Showing global portfolio performance across all tokens. Select a token to view individual metrics."
          )}
        </p>
      </div>
    </div>
  )
}
