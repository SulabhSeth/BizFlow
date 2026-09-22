"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { createInvoiceFromOrder } from "@/actions/invoices";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatDate } from "@/lib/format";

export interface InvoiceableOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  deliveryDate: string;
}

export function CreateInvoicePicker({
  orders,
  autoOpen = false,
}: {
  orders: InvoiceableOrder[];
  autoOpen?: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(autoOpen);
  const [pending, startTransition] = useTransition();
  const [creatingId, setCreatingId] = useState<string | null>(null);

  function handlePick(orderId: string) {
    setCreatingId(orderId);
    startTransition(async () => {
      const result = await createInvoiceFromOrder(orderId);
      setCreatingId(null);
      if (result.error) {
        toast(result.error, "error");
      } else if (result.invoiceId) {
        toast("Invoice generated successfully.");
        setOpen(false);
        router.push(`/invoices/${result.invoiceId}`);
      }
    });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Create Invoice
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Create invoice from order" size="lg">
        {orders.length === 0 ? (
          <EmptyState
            icon={Plus}
            title="No orders to invoice"
            description="Every order already has an invoice, or you don't have any orders yet."
          />
        ) : (
          <div className="max-h-[60vh] space-y-2 overflow-y-auto">
            {orders.map((o) => (
              <button
                key={o.id}
                onClick={() => handlePick(o.id)}
                disabled={pending}
                className="flex w-full items-center justify-between rounded-[var(--radius-control)] border border-border px-3 py-2.5 text-left text-sm transition-colors hover:border-terracotta/40 hover:bg-terracotta-soft/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <div>
                  <p className="font-medium text-charcoal">
                    {o.orderNumber} — {o.customerName}
                  </p>
                  <p className="text-xs text-charcoal-muted">Delivery {formatDate(o.deliveryDate)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-charcoal">{formatCurrency(o.total)}</span>
                  {creatingId === o.id && pending && (
                    <span className="text-xs text-charcoal-muted">Creating…</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}