import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

/**
 * The filled surface every text-entry control wears — grey at rest, paper with
 * an ink border when focused. Exported so hand-built fields (a combobox input,
 * a multi-select trigger) match `Input` and `SelectTrigger` exactly.
 */
const fieldSurface =
  "border border-transparent bg-muted transition-colors outline-none placeholder:text-muted-foreground hover:bg-accent focus-visible:border-ring focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:bg-destructive/5"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-9 max-sm:h-10 w-full min-w-0 rounded-lg px-3 py-1 text-base [&::-webkit-search-cancel-button]:hidden file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground disabled:pointer-events-none md:text-sm",
        fieldSurface,
        className
      )}
      {...props}
    />
  )
}

export { Input, fieldSurface }
