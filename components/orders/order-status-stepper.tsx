"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateOrderStatus } from "@/actions/orders";
import { orderStatuses } from "@/lib/validations/order";
import { useToast } from "@/components/ui/toast";

const activeSteps = orderStatuses.filter((s) => s !== "Cancelled");

export function OrderStatusStepper({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  const currentIndex = activeSteps.indexOf(status as (typeof activeSteps)[number]);

  function handleSelect(step: (typeof activeSteps)[number]) {
    if (step === status) return;
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, step);
      if (result.error) {
        toast(result.error, "error");
      } else {
        toast(`Order marked as ${step}.`);
        router.refresh();
      }
    });
  }

  return (
    <div className={cn("flex items-center", isPending && "opacity-60")}>
      {activeSteps.map((step, i) => {
        const isDone = i < currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <div key={step} className="flex flex-1 items-center last:flex-none">
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleSelect(step)}
              className="flex flex-col items-center gap-1.5 disabled:cursor-not-allowed"
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium transition-colors",
                  isDone
                    ? "border-terracotta bg-terracotta text-white"
                    : isCurrent
                      ? "border-terracotta bg-terracotta-soft text-terracotta"
                      : "border-border-strong bg-surface text-charcoal-muted",
                )}
              >
                {isDone ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap text-xs font-medium",
                  isCurrent || isDone ? "text-charcoal" : "text-charcoal-muted",
                )}
              >
                {step}
              </span>
            </button>
            {i < activeSteps.length - 1 && (
              <div className={cn("mx-1 h-0.5 flex-1", isDone ? "bg-terracotta" : "bg-border")} />
            )}
          </div>
        );
      })}
    </div>
  );
}