import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge, paymentStatusTone } from "@/components/ui/badge";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { OrderStatusStepper } from "@/components/orders/order-status-stepper";
import { CancelOrderButton } from "@/components/orders/cancel-order-button";
import { paymentStatusFor, formatWeight, type PricingUnit } from "@/lib/order-utils";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import { CreateInvoiceButton } from "@/components/invoices/create-invoice-button";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, order_number, order_date, delivery_date, delivery_time, status, customer_notes, internal_notes, subtotal, discount, delivery_fee, total, customer_id, customers ( id, name, phone )",
    )
    .eq("id", id)
    .single();

  if (!order) {
    notFound();
  }

  const customer = order.customers as unknown as { id: string; name: string; phone: string | null } | null;

  const [{ data: items }, { data: payments }, { data: existingInvoice }] = await Promise.all([
  supabase.from("order_items").select("id, name, unit, quantity, unit_price, total").eq("order_id", id),
  supabase
    .from("payments")
    .select("id, amount, method, payment_date, notes")
    .eq("order_id", id)
    .order("payment_date", { ascending: false }),
  supabase.from("invoices").select("id").eq("order_id", id).maybeSingle(),
]);

  const paid = (payments ?? []).reduce((sum, p) => sum + p.amount, 0);
  const balance = Math.max(order.total - paid, 0);
  const paymentStatus = paymentStatusFor(order.total, paid);
  const isCancelled = order.status === "Cancelled";

  return (
    <div className="px-6 py-8 md:px-10">
      <Link
        href="/orders"
        className="inline-flex items-center gap-1.5 text-sm text-charcoal-muted hover:text-charcoal"
      >
        <ArrowLeft className="h-4 w-4" />
        Orders
      </Link>

      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <p className="font-display text-2xl text-charcoal">{order.order_number}</p>
            {isCancelled && <Badge tone="danger">Cancelled</Badge>}
          </div>
          {customer && (
            <Link
              href={`/customers/${customer.id}`}
              className="mt-1 inline-flex items-center gap-1.5 text-sm text-charcoal-muted hover:text-terracotta"
            >
              {customer.name}
              {customer.phone && (
                <span className="inline-flex items-center gap-1 text-charcoal-muted">
                  <Phone className="h-3 w-3" />
                  {customer.phone}
                </span>
              )}
            </Link>
          )}
        </div>
               <div className="flex gap-2">
          <CreateInvoiceButton orderId={order.id} existingInvoiceId={existingInvoice?.id ?? null} />
          {!isCancelled && <CancelOrderButton orderId={order.id} />}
        </div>
      </div>

      {!isCancelled && (
        <Card className="mt-6 p-5">
          <OrderStatusStepper orderId={order.id} status={order.status ?? "New"} />
        </Card>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-5">
            <p className="mb-3 font-medium text-charcoal">Order Items</p>
            <Table>
              <Thead>
                <Tr>
                  <Th>Item</Th>
                  <Th>Qty</Th>
                  <Th>Unit price</Th>
                  <Th>Total</Th>
                </Tr>
              </Thead>
              <Tbody>
                {(items ?? []).map((item) => {
                  const unit = (item.unit ?? "piece") as PricingUnit;
                  return (
                    <Tr key={item.id}>
                      <Td className="font-medium text-charcoal">{item.name}</Td>
                      <Td className="text-charcoal-muted">
                        {unit === "kg" ? formatWeight(item.quantity) : item.quantity}
                      </Td>
                      <Td className="text-charcoal-muted">
                        {formatCurrency(item.unit_price)}
                        {unit === "kg" ? "/kg" : ""}
                      </Td>
                      <Td>{formatCurrency(item.total)}</Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Card>

          {(order.customer_notes || order.internal_notes) && (
            <Card className="p-5">
              {order.customer_notes && (
                <div>
                  <p className="text-xs font-medium text-charcoal-muted">Customer notes</p>
                  <p className="mt-1 text-sm text-charcoal">{order.customer_notes}</p>
                </div>
              )}
              {order.internal_notes && (
                <div className={order.customer_notes ? "mt-4" : ""}>
                  <p className="text-xs font-medium text-charcoal-muted">Internal notes</p>
                  <p className="mt-1 text-sm text-charcoal">{order.internal_notes}</p>
                </div>
              )}
            </Card>
          )}

          <Card className="p-5">
            <p className="mb-3 font-medium text-charcoal">Payment history</p>
            {(payments ?? []).length === 0 ? (
              <p className="text-sm text-charcoal-muted">No payments recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {(payments ?? []).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-[var(--radius-control)] border border-border px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium text-charcoal">{formatCurrency(p.amount)}</p>
                      <p className="text-xs text-charcoal-muted">
                        {p.method} · {formatDate(p.payment_date)}
                      </p>
                    </div>
                    {p.notes && <p className="max-w-[50%] text-right text-xs text-charcoal-muted">{p.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <p className="mb-3 font-medium text-charcoal">Pricing Summary</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-charcoal-muted">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-charcoal-muted">
                <span>Discount</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
              <div className="flex justify-between text-charcoal-muted">
                <span>Delivery fee</span>
                <span>+{formatCurrency(order.delivery_fee)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-1.5 font-medium text-charcoal">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
              <div className="flex justify-between text-charcoal-muted">
                <span>Paid</span>
                <span>{formatCurrency(paid)}</span>
              </div>
              <div className="flex justify-between font-medium text-danger">
                <span>Balance due</span>
                <span>{formatCurrency(balance)}</span>
              </div>
            </div>
            <div className="mt-3">
              <Badge tone={paymentStatusTone(paymentStatus)}>{paymentStatus}</Badge>
            </div>
          </Card>

          <Card className="p-5">
            <p className="mb-3 font-medium text-charcoal">Delivery</p>
            <p className="text-sm text-charcoal">{formatDateTime(order.delivery_date, order.delivery_time)}</p>
            <p className="mt-2 text-xs text-charcoal-muted">Order placed {formatDate(order.order_date)}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}