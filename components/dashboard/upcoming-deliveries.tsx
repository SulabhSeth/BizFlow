import Link from "next/link";
import { Truck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { UpcomingDeliveryRow } from "@/lib/dashboard";

export function UpcomingDeliveries({ deliveries }: { deliveries: UpcomingDeliveryRow[] }) {
  return (
    <Card className="p-5">
      <p className="mb-3 font-medium text-charcoal">Upcoming Deliveries</p>
      {deliveries.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="Nothing scheduled"
          description="Deliveries coming up soon will be listed here."
        />
      ) : (
        <div className="space-y-1">
          {deliveries.map((d) => (
            <Link
              key={d.orderId}
              href={`/orders/${d.orderId}`}
              className="block rounded-[var(--radius-control)] px-2 py-2.5 transition-colors hover:bg-cream-soft"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-charcoal">{d.customerName}</p>
                  <p className="text-sm text-charcoal-muted">{d.itemsSummary}</p>
                  <p className="mt-0.5 text-xs text-charcoal-muted">
                    {formatDateTime(d.deliveryDate, d.deliveryTime)}
                  </p>
                </div>
                {d.amountPending > 0 && (
                  <span className="whitespace-nowrap text-sm font-medium text-danger">
                    {formatCurrency(d.amountPending)} pending
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}