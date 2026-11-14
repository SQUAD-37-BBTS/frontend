import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-t-md rounded-b-none border-0 border-b border-[#8D8D8D] bg-container-neutral-raised px-4 py-2 text-left text-sm text-[#161616] transition-colors outline-none placeholder:text-[#6F6F6F] focus-visible:border-b-input-border-focus focus-visible:ring-0  disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-b-2 aria-invalid:border-destructive file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#161616]",
        className
      )}
      {...props}
    />
  )
}

export { Input }