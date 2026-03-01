import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "red" | "amber" | "zinc";
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          {
            "bg-white/10 text-white": variant === "default",
            "bg-red-600/20 text-red-500 border border-red-600/30":
              variant === "red",
            "bg-amber-500/20 text-amber-500 border border-amber-500/30":
              variant === "amber",
            "bg-zinc-800 text-zinc-300 border border-zinc-700":
              variant === "zinc",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";
