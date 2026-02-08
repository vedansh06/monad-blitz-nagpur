import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-charcoal-700/60 border-2 border-golden-border shadow-inner",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 transition-all duration-500 ease-out rounded-full relative overflow-hidden"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    >
      {/* Main gradient fill */}
      <div className="absolute inset-0 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600"></div>
      
      {/* Golden shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-200/30 to-transparent animate-shimmer bg-[length:200%_100%]"></div>
      
      {/* Inner golden glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-gold-300/20 via-gold-100/10 to-gold-300/20 rounded-full"></div>
    </ProgressPrimitive.Indicator>
    
    {/* Outer golden glow effect */}
    <div className="absolute -inset-1 bg-gradient-to-r from-gold-400/20 via-gold-500/30 to-gold-600/20 rounded-full blur-sm opacity-60 -z-10"></div>
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
