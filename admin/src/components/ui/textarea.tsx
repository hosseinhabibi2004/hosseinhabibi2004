import * as React from "react"

import { fieldSurface } from "@/components/ui/input"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-lg px-3 py-2 text-base md:text-sm",
        fieldSurface,
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
