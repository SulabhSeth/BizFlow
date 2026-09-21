import { createClient } from "@/lib/supabase/server";
import { OrdersView, type OrderRow } from "@/components/orders/orders-view";
import { paymentStatusFor, itemsSummaryFor } from "@/lib/order-utils";

export default async function OrdersPage() {
  const supabase = await createClient();

  const [{ data: orders }, { data: customers }, { data: payments }, { data: orderItems }] =
    await Promise.all([
      supabase
        .from("orders")
        .select("id, order_number, customer_id, total, delivery_date, status, created_at")
        .order("created_at", { ascending: false }),
      supabase.from("customers").select("id, name"),
      supabase.from("payments").select("order_id, amount"),
      supabase.from("order_items").select("order_id, name"),
    ]);

  const customerNameById = new Map((customers ?? []).map((c) => [c.id, c.name]));

  const paidByOrder = new Map<string, number>();
  for (const p of payments ?? []) {
    paidByOrder.set(p.order_id, (paidByOrder.get(p.order_id) ?? 0) + p.amount);
  }

  const itemNamesByOrder = new Map<string, string[]>();
  for (const item of orderItems ?? []) {
    const list = itemNamesByOrder.get(item.order_id) ?? [];
    list.push(item.name);
    itemNamesByOrder.set(item.order_id, list);
  }

  const rows: OrderRow[] = (orders ?? []).map((o) => {
    const paid = paidByOrder.get(o.id) ?? 0;
    const balance = Math.max(o.total - paid, 0);
    return {
      id: o.id,
      orderNumber: o.order_number,
      customerName: customerNameById.get(o.customer_id) ?? "Unknown customer",
      itemsSummary: itemsSummaryFor(itemNamesByOrder.get(o.id) ?? []),
      total: o.total,
      paid,
      balance,
      paymentStatus: paymentStatusFor(o.total, paid),
      deliveryDate: o.delivery_date,
      status: o.status ?? "New",
    };
  });

  return <OrdersView orders={rows} />;
}