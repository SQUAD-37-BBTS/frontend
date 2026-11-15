import * as React from "react"
import { cn } from "cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-t-md rounded-b-none bg-container-neutral-raised px-4 py-2.5 text-left text-sm text-input-foreground transition-colors outline-none",
        "border-t-0 border-r-0 border-l-0 border-b border-b-input-border",
        "placeholder:text-input-placeholder",
        "focus-visible:border-b-input-border-focus focus-visible:ring-0",
        "aria-invalid:border-b-destructive",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }