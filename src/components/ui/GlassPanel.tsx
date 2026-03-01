import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "darker" | "lighter";
}

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-3xl border backdrop-blur-xl transition-all duration-300",
          variant === "default" && "bg-white/[0.03] border-white/10",
          variant === "darker" && "bg-black/40 border-white/5",
          variant === "lighter" && "bg-white/[0.08] border-white/20",
          className
        )}
        {...props}
      />
    );
  }
);
GlassPanel.displayName = "GlassPanel";
