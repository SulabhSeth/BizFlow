import { cn } from "@/lib/utils";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "terracotta";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-cream-soft text-charcoal-muted",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  terracotta: "bg-terracotta-soft text-terracotta",
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}

/** Maps the app's domain statuses to a badge tone, kept in one place so every screen agrees on the colors. */
export function orderStatusTone(status: string): BadgeTone {
  switch (status) {
    case "New":
      return "terracotta";
    case "Confirmed":
    case "Preparing":
      return "warning";
    case "Ready":
      return "warning";
    case "Delivered":
      return "success";
    case "Cancelled":
      return "danger";
    default:
      return "neutral";
  }
}

export function paymentStatusTone(status: "Paid" | "Partially Paid" | "Pending"): BadgeTone {
  switch (status) {
    case "Paid":
      return "success";
    case "Partially Paid":
      return "warning";
    case "Pending":
      return "danger";
    default:
      return "neutral";
  }
}

export function invoiceStatusTone(status: string): BadgeTone {
  switch (status) {
    case "Draft":
      return "neutral";
    case "Issued":
      return "warning";
    case "Paid":
      return "success";
    case "Partially Paid":
      return "warning";
    default:
      return "neutral";
  }
}