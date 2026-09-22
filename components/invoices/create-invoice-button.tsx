"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createInvoiceFromOrder } from "@/actions/invoices";
import { useToast } from "@/components/ui/toast";

export function CreateInvoiceButton({
  orderId,
  existingInvoiceId,
}: {
  orderId: string;
  existingInvoiceId: string | null;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  if (existingInvoiceId) {
    return (
      <Link
        href={`/invoices/${existingInvoiceId}`}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-border-strong px-3 text-sm font-medium text-charcoal transition-colors hover:bg-cream-soft"
      >
        <Eye className="h-4 w-4" />
        View Invoice
      </Link>
    );
  }

  function handleCreate() {
    startTransition(async () => {
      const result = await createInvoiceFromOrder(orderId);
      if (result.error) {
        toast(result.error, "error");
      } else if (result.invoiceId) {
        toast("Invoice generated successfully.");
        router.push(`/invoices/${result.invoiceId}`);
      }
    });
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleCreate} loading={pending}>
      <FileText className="h-4 w-4" />
      Create Invoice
    </Button>
  );
}