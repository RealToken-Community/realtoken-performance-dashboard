"use client"

import { useState } from "react"
import { ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface TokenOption {
  value: string
  label: string
}

interface TokenComboboxProps {
  options: TokenOption[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function TokenCombobox({
  options,
  value,
  onValueChange,
  placeholder = "Filter by token...",
  className,
}: TokenComboboxProps) {
  const [open, setOpen] = useState(false)

  const selectedLabel =
    value === "all"
      ? null
      : options.find((o) => o.value === value)?.label ?? null

  return (
    <div className="flex items-center gap-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-[300px] justify-between border-border bg-secondary/50 text-sm font-normal hover:bg-secondary/70",
              className
            )}
          >
            <span className={cn("truncate", !selectedLabel && "text-muted-foreground")}>
              {selectedLabel ?? placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search token..." />
            <CommandList>
              <CommandEmpty>No token found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="__all_tokens__"
                  onSelect={() => {
                    onValueChange("all")
                    setOpen(false)
                  }}
                >
                  All Tokens
                </CommandItem>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      onValueChange(option.value)
                      setOpen(false)
                    }}
                  >
                    <span className="truncate">{option.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {value !== "all" && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={() => onValueChange("all")}
          aria-label="Clear token filter"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
