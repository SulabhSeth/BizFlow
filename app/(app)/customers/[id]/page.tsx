import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus, ClipboardList } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge, orderStatusTone } from "@/components/ui/badge";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { EditCustomerButton } from "@/components/customers/customer-detail-actions";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: customer } = await supabase
    .from("customers")
    .select("id, name, phone, email, address, notes")
    .eq("id", id)
    .single();

  if (!customer) {
    notFound();
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, order_date, delivery_date, status, total")
    .eq("customer_id", id)
    .order("order_date", { ascending: false });

  const orderIds = (orders ?? []).map((o) => o.id);
  const { data: payments } =
    orderIds.length > 0
      ? await supabase.from("payments").select("order_id, amount").in("order_id", orderIds)
      : { data: [] };

  const paidByOrder = new Map<string, number>();
  for (const p of payments ?? []) {
    paidByOrder.set(p.order_id, (paidByOrder.get(p.order_id) ?? 0) + p.amount);
  }

  const billableOrders = (orders ?? []).filter((o) => o.status !== "Cancelled");
  const totalSpent = billableOrders.reduce((sum, o) => sum + o.total, 0);
  const amountPaid = billableOrders.reduce((sum, o) => sum + (paidByOrder.get(o.id) ?? 0), 0);
  const amountPending = Math.max(totalSpent - amountPaid, 0);

  return (
    <div className="px-6 py-8 md:px-10">
                <Link
            href={`/orders/new?customer=${customer.id}`}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-terracotta px-3 text-sm font-medium text-white transition-colors hover:bg-[#a4502f]"
          >
        <ArrowLeft className="h-4 w-4" />
        Customers
      </Link>

      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-display text-2xl text-charcoal">{customer.name}</p>
          <div className="mt-1 space-y-0.5 text-sm text-charcoal-muted">
            {customer.phone && <p>{customer.phone}</p>}
            {customer.email && <p>{customer.email}</p>}
            {customer.address && <p>{customer.address}</p>}
          </div>
          {customer.notes && (
            <p className="mt-2 rounded-[var(--radius-control)] bg-cream-soft px-3 py-2 text-sm text-charcoal-muted">
              {customer.notes}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <EditCustomerButton customer={customer} />
          <Link
            href="/orders"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-terracotta px-3 text-sm font-medium text-white transition-colors hover:bg-[#a4502f]"
          >
            <Plus className="h-4 w-4" />
            New Order
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-charcoal-muted">Total orders</p>
          <p className="mt-1 font-display text-xl text-charcoal">{orders?.length ?? 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-charcoal-muted">Total spent</p>
          <p className="mt-1 font-display text-xl text-charcoal">{formatCurrency(totalSpent)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-charcoal-muted">Amount paid</p>
          <p className="mt-1 font-display text-xl text-charcoal">{formatCurrency(amountPaid)}</p>
        </Card>
        <Card className={`p-4 ${amountPending > 0 ? "border-danger/30 bg-danger-soft/40" : ""}`}>
          <p className="text-xs text-charcoal-muted">Amount pending</p>
          <p className={`mt-1 font-display text-xl ${amountPending > 0 ? "text-danger" : "text-charcoal"}`}>
            {formatCurrency(amountPending)}
          </p>
        </Card>
      </div>

      <div className="mt-8">
        <p className="mb-3 font-medium text-charcoal">Order history</p>
        {!orders || orders.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No orders yet"
            description="Orders placed by this customer will show up here."
          />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Order #</Th>
                <Th>Order date</Th>
                <Th>Delivery date</Th>
                <Th>Total</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {orders.map((order) => (
                <Tr key={order.id}>
                  <Td>
                    <Link href={`/orders/${order.id}`} className="font-medium hover:text-terracotta">
                      {order.order_number}
                    </Link>
                  </Td>
                  <Td className="text-charcoal-muted">{formatDate(order.order_date)}</Td>
                  <Td className="text-charcoal-muted">{formatDate(order.delivery_date)}</Td>
                  <Td>{formatCurrency(order.total)}</Td>
                  <Td>
                    <Badge tone={orderStatusTone(order.status ?? "")}>{order.status}</Badge>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </div>
    </div>
  );
}