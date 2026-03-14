"use client"

interface BreakdownSegment {
  label: string
  value: number
  color: string
}

interface BreakdownBarProps {
  segments: BreakdownSegment[]
}

export function BreakdownBar({ segments }: BreakdownBarProps) {
  // Clamp negatives to 0 for visual distribution
  const normalized = segments.map((s) => ({
    ...s,
    value: Math.max(0, s.value),
  }))

  const total = normalized.reduce((sum, s) => sum + s.value, 0)

  if (total === 0) return null

  return (
    <div className="flex flex-col gap-2.5">
      {/* Stacked bar */}
      <div className="flex h-2 w-full overflow-hidden rounded-full">
        {normalized.map((segment) => {
          const pct = (segment.value / total) * 100

          return (
            <div
              key={segment.label}
              className="transition-all duration-500"
              style={{
                width: `${pct}%`,
                backgroundColor: segment.color,
              }}
            />
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {normalized.map((segment) => (
          <div key={segment.label} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-[11px] text-muted-foreground">
              {segment.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}