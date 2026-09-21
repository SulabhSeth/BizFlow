import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded-[var(--radius-control)] border border-border-strong bg-surface px-3 text-sm text-charcoal placeholder:text-charcoal-muted/60",
          "focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta",
          "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";