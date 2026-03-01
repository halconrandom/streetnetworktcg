import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { motion, HTMLMotionProps } from "motion/react";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: "primary" | "secondary" | "ghost" | "glass" | "accent";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "inline-flex items-center justify-center rounded-2xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20":
              variant === "primary",
            "bg-zinc-800 text-zinc-100 hover:bg-zinc-700":
              variant === "secondary",
            "bg-transparent hover:bg-white/10 text-zinc-300 hover:text-white":
              variant === "ghost",
            "bg-white/5 border border-white/10 text-white hover:bg-white/10 backdrop-blur-md":
              variant === "glass",
            "bg-amber-500 text-black hover:bg-amber-600 shadow-lg shadow-amber-500/20":
              variant === "accent",
            "h-9 px-4 text-sm": size === "sm",
            "h-11 px-6 text-base": size === "md",
            "h-14 px-8 text-lg": size === "lg",
            "h-11 w-11": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
