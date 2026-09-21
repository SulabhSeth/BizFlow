import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      rows={3}
      className={cn(
        "w-full rounded-[var(--radius-control)] border border-border-strong bg-surface px-3 py-2 text-sm text-charcoal placeholder:text-charcoal-muted/60",
        "focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
