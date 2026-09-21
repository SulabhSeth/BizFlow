import type { SupabaseClient } from "@supabase/supabase-js";
import { paymentStatusFor, itemsSummaryFor } from "@/lib/order-utils";

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  pendingPayments: number;
  upcomingDeliveries: number;
}

export interface RecentOrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  itemsSummary: string;
  total: number;
  paymentStatus: "Paid" | "Partially Paid" | "Pending";
  deliveryDate: string;
  status: string;
}

export interface UpcomingDeliveryRow {
  orderId: string;
  orderNumber: string;
  customerName: string;
  itemsSummary: string;
  deliveryDate: string;
  deliveryTime: string | null;
  amountPending: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentOrders: RecentOrderRow[];
  upcomingDeliveries: UpcomingDeliveryRow[];
}

// function paymentStatusFor(total: number, paid: number): "Paid" | "Partially Paid" | "Pending" {
//   if (paid <= 0) return "Pending";
//   if (paid >= total) return "Paid";
//   return "Partially Paid";
// }

// function itemsSummaryFor(names: string[]): string {
//   if (names.length === 0) return "—";
//   if (names.length <= 2) return names.join(", ");
//   return `${names.slice(0, 2).join(", ")} +${names.length - 2} more`;
// }

/**
 * All numbers here come straight from the database — nothing hardcoded.
 * Until Orders (Phase 3) exists to create real order/payment rows,
 * these will legitimately be zero/empty, and start reflecting real
 * activity the moment orders start getting created.
 */
export async function getDashboardData(supabase: SupabaseClient): Promise<DashboardData> {
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: orders }, { data: payments }, { data: customers }, { data: orderItems }] =
    await Promise.all([
      supabase
        .from("orders")
        .select("id, order_number, customer_id, total, delivery_date, delivery_time, status, created_at")
        .order("created_at", { ascending: false }),
      supabase.from("payments").select("order_id, amount"),
      supabase.from("customers").select("id, name"),
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

  const allOrders = orders ?? [];
  const billableOrders = allOrders.filter((o) => o.status !== "Cancelled");

  const totalRevenue = billableOrders.reduce(
    (sum, o) => sum + (paidByOrder.get(o.id) ?? 0),
    0,
  );

  const pendingPayments = billableOrders.reduce((sum, o) => {
    const balance = o.total - (paidByOrder.get(o.id) ?? 0);
    return sum + Math.max(balance, 0);
  }, 0);

  const upcomingDeliveryOrders = allOrders.filter(
    (o) => o.delivery_date >= today && o.status !== "Delivered" && o.status !== "Cancelled",
  );

  const stats: DashboardStats = {
    totalRevenue,
    totalOrders: allOrders.length,
    pendingPayments,
    upcomingDeliveries: upcomingDeliveryOrders.length,
  };

  const recentOrders: RecentOrderRow[] = allOrders.slice(0, 8).map((o) => {
    const paid = paidByOrder.get(o.id) ?? 0;
    return {
      id: o.id,
      orderNumber: o.order_number,
      customerName: customerNameById.get(o.customer_id) ?? "Unknown customer",
      itemsSummary: itemsSummaryFor(itemNamesByOrder.get(o.id) ?? []),
      total: o.total,
      paymentStatus: paymentStatusFor(o.total, paid),
      deliveryDate: o.delivery_date,
      status: o.status ?? "New",
    };
  });

  const upcomingDeliveries: UpcomingDeliveryRow[] = upcomingDeliveryOrders
    .slice()
    .sort((a, b) => a.delivery_date.localeCompare(b.delivery_date))
    .slice(0, 5)
    .map((o) => {
      const paid = paidByOrder.get(o.id) ?? 0;
      return {
        orderId: o.id,
        orderNumber: o.order_number,
        customerName: customerNameById.get(o.customer_id) ?? "Unknown customer",
        itemsSummary: itemsSummaryFor(itemNamesByOrder.get(o.id) ?? []),
        deliveryDate: o.delivery_date,
        deliveryTime: o.delivery_time,
        amountPending: Math.max(o.total - paid, 0),
      };
    });

  return { stats, recentOrders, upcomingDeliveries };
}

export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}