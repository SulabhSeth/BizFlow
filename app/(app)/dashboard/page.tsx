import Link from "next/link";
import { Plus, IndianRupee, ClipboardList, Clock, Truck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData, getGreeting } from "@/lib/dashboard";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { UpcomingDeliveries } from "@/components/dashboard/upcoming-deliveries";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { formatCurrency } from "@/lib/format";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user!.id)
    .single();

  const { stats, recentOrders, upcomingDeliveries } = await getDashboardData(supabase);

  return (
    <div className="px-6 py-8 md:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-2xl text-charcoal">
            {getGreeting()}, {profile?.full_name ?? "there"}
          </p>
          <p className="mt-1 text-sm text-charcoal-muted">
            Here&apos;s what&apos;s happening with your bakery today.
          </p>
        </div>
                <Link
          href="/orders/new"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-terracotta px-4 text-sm font-medium text-white transition-colors hover:bg-[#a4502f]"
        >
          <Plus className="h-4 w-4" />
          New Order
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon={IndianRupee} />
        <StatCard label="Total Orders" value={String(stats.totalOrders)} icon={ClipboardList} />
        <StatCard
          label="Pending Payments"
          value={formatCurrency(stats.pendingPayments)}
          icon={Clock}
          tone={stats.pendingPayments > 0 ? "danger" : "neutral"}
        />
        <StatCard label="Upcoming Deliveries" value={String(stats.upcomingDeliveries)} icon={Truck} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentOrders orders={recentOrders} />
        </div>
        <div className="space-y-6">
          <QuickActions />
          <UpcomingDeliveries deliveries={upcomingDeliveries} />
        </div>
      </div>
    </div>
  );
}