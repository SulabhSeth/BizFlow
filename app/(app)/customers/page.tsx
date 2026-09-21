import { createClient } from "@/lib/supabase/server";
import { CustomersView, type CustomerRow } from "@/components/customers/customers-view";

export default async function CustomersPage() {
  const supabase = await createClient();

  // RLS already scopes every one of these to the signed-in user's
  // business — no manual business_id filter needed on the client side.
  const [{ data: customers }, { data: orders }, { data: payments }] = await Promise.all([
    supabase
      .from("customers")
      .select("id, name, phone, email, address, notes")
      .order("name"),
    supabase.from("orders").select("id, customer_id, total, order_date, status"),
    supabase.from("payments").select("order_id, amount"),
  ]);

  const paidByOrder = new Map<string, number>();
  for (const payment of payments ?? []) {
    paidByOrder.set(payment.order_id, (paidByOrder.get(payment.order_id) ?? 0) + payment.amount);
  }

  const rows: CustomerRow[] = (customers ?? []).map((customer) => {
    const customerOrders = (orders ?? []).filter((o) => o.customer_id === customer.id);
    const billableOrders = customerOrders.filter((o) => o.status !== "Cancelled");

    const totalSpent = billableOrders.reduce((sum, o) => sum + o.total, 0);
    const totalPaid = billableOrders.reduce(
      (sum, o) => sum + (paidByOrder.get(o.id) ?? 0),
      0,
    );
    const lastOrderDate = customerOrders.length
      ? customerOrders.reduce((latest, o) => (o.order_date > latest ? o.order_date : latest), customerOrders[0].order_date)
      : null;

    return {
      ...customer,
      orderCount: customerOrders.length,
      totalSpent,
      pendingAmount: Math.max(totalSpent - totalPaid, 0),
      lastOrderDate,
    };
  });

  return <CustomersView customers={rows} />;
}