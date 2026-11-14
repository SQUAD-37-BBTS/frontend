"use client";

import * as React from "react";
import { cn } from "cn";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "block text-left text-xs font-medium tracking-wide text-[#161616] select-none",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
