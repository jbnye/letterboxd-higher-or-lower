import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      {...props}
      className={cn(
        "peer inline-flex h-[1.15rem] w-16 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
        "bg-white data-[state=checked]:bg-[#1e2228]",
      )}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "block rounded-full ring-0 transition-transform overflow-hidden cursor-pointer",
          "w-[1.15rem] h-[1.15rem]",
          "data-[state=unchecked]:translate-x-0",
          "data-[state=checked]:translate-x-[calc(4rem-1.15rem)]", 
          "bg-black data-[state=checked]:bg-black"
        )}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="-40 -40 80 80" className="w-full h-full rotate-340" >
          <circle r="39" />
          <path fill="#fff" d="M0,38a38,38 0 0 1 0,-76a19,19 0 0 1 0,38a19,19 0 0 0 0,38" />
          <circle r="5" cy="19" fill="#fff" />
          <circle r="5" cy="-19" />
        </svg>
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );
}

export { Switch }
