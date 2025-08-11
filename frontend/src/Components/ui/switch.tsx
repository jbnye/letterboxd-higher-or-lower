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
          "block rounded-full ring-0 transition-transform overflow-hidden",
          "w-[1.15rem] h-[1.15rem]",
          "data-[state=unchecked]:translate-x-0",
          "data-[state=checked]:translate-x-[calc(4rem-1.15rem)]", 
          "bg-black data-[state=checked]:bg-black"
        )}
      >
        <img
          src="/Images/Yin_yang.svg.png"
          alt="Yin Yang"
          className="w-full h-full object-cover"
        />
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );
}

export { Switch }
