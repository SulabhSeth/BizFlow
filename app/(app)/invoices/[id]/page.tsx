import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge, invoiceStatusTone } from "@/components/ui/badge";
import { InvoiceActions } from "@/components/invoices/invoice-actions";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select(
      "id, invoice_number, issue_date, status, subtotal, discount, delivery_fee, total, amount_paid, balance_due, notes, business_id, order_id, customers ( name, phone, email, address ), orders ( order_number )",
    )
    .eq("id", id)
    .single();

  if (!invoice) {
    notFound();
  }

  const customer = invoice.customers as unknown as {
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
  } | null;
  const order = invoice.orders as unknown as { order_number: string } | null;

  const [{ data: business }, { data: items }] = await Promise.all([
    supabase
      .from("businesses")
      .select("name, address, phone, email, gstin, logo_url, currency")
      .eq("id", invoice.business_id)
      .single(),
    supabase.from("invoice_items").select("id, description, quantity, unit_price, amount").eq("invoice_id", id),
  ]);

  return (
    <div className="px-6 py-8 md:px-10">
      <div className="no-print flex items-center justify-between">
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1.5 text-sm text-charcoal-muted hover:text-charcoal"
        >
          <ArrowLeft className="h-4 w-4" />
          Invoices
        </Link>
        <InvoiceActions invoiceNumber={invoice.invoice_number} />
      </div>

      <div
        id="invoice-content"
        className="print-invoice mx-auto mt-6 max-w-3xl rounded-[var(--radius-card)] border border-border bg-surface p-8 shadow-[var(--shadow-card)] sm:p-10"
      >
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div className="flex items-start gap-3">
            {business?.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={business.logo_url} alt="" className="h-24 w-24 rounded-[var(--radius-control)] object-cover" />
            )}
            <div>
              <p className="font-display text-xl text-charcoal">{business?.name ?? "Your Bakery"}</p>
              {business?.address && <p className="text-sm text-charcoal-muted">{business.address}</p>}
              {business?.phone && <p className="text-sm text-charcoal-muted">{business.phone}</p>}
              {business?.email && <p className="text-sm text-charcoal-muted">{business.email}</p>}
              {business?.gstin && <p className="text-sm text-charcoal-muted">GSTIN: {business.gstin}</p>}
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="font-display text-lg text-charcoal">Invoice {invoice.invoice_number}</p>
            <p className="mt-1 text-sm text-charcoal-muted">{formatDate(invoice.issue_date)}</p>
            {order && <p className="text-sm text-charcoal-muted">Order {order.order_number}</p>}
            <div className="mt-2">
              <Badge tone={invoiceStatusTone(invoice.status ?? "Draft")}>{invoice.status}</Badge>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <p className="text-xs font-medium uppercase tracking-wide text-charcoal-muted">Billed to</p>
          <p className="mt-1 font-medium text-charcoal">{customer?.name ?? "—"}</p>
          {customer?.address && <p className="text-sm text-charcoal-muted">{customer.address}</p>}
          {customer?.phone && <p className="text-sm text-charcoal-muted">{customer.phone}</p>}
          {customer?.email && <p className="text-sm text-charcoal-muted">{customer.email}</p>}
        </div>

        <table className="mt-8 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs font-medium uppercase tracking-wide text-charcoal-muted">
              <th className="pb-2">Description</th>
              <th className="pb-2 text-right">Qty</th>
              <th className="pb-2 text-right">Unit price</th>
              <th className="pb-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(items ?? []).map((item) => (
              <tr key={item.id}>
                <td className="py-2 text-charcoal">{item.description}</td>
                <td className="py-2 text-right text-charcoal-muted">{item.quantity}</td>
                <td className="py-2 text-right text-charcoal-muted">{formatCurrency(item.unit_price)}</td>
                <td className="py-2 text-right text-charcoal">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 flex justify-end">
          <div className="w-full max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between text-charcoal-muted">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-charcoal-muted">
              <span>Discount</span>
              <span>-{formatCurrency(invoice.discount)}</span>
            </div>
            <div className="flex justify-between text-charcoal-muted">
              <span>Delivery fee</span>
              <span>+{formatCurrency(invoice.delivery_fee)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-1.5 font-medium text-charcoal">
              <span>Grand Total</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
            <div className="flex justify-between text-charcoal-muted">
              <span>Amount Paid</span>
              <span>{formatCurrency(invoice.amount_paid)}</span>
            </div>
            <div className="flex justify-between font-medium text-danger">
              <span>Balance Due</span>
              <span>{formatCurrency(invoice.balance_due)}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-8 border-t border-border pt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-charcoal-muted">Notes</p>
            <p className="mt-1 text-sm text-charcoal-muted">{invoice.notes}</p>
          </div>
        )}

        <p className="mt-10 text-center text-sm text-charcoal-muted">Thank you for your order!</p>
      </div>
    </div>
  );
}