"use client"

import { useMemo } from "react"
import katex from "katex"
import "katex/dist/katex.min.css"

interface MathProps {
  /** LaTeX expression to render */
  children: string
  /** Display mode (block) vs inline */
  display?: boolean
  /** Additional class name */
  className?: string
}

/**
 * Renders a LaTeX math expression using KaTeX.
 * 
 * Usage:
 *   <Math>{"\\sum_{t} \\frac{CF_t}{(1+r)^t} = 0"}</Math>
 */
export function Math({ children, display = false, className }: MathProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(children, {
        displayMode: display,
        throwOnError: false,
        output: "html",
      })
    } catch {
      return children
    }
  }, [children, display])

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
