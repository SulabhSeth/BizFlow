import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { OrderForm } from "@/components/orders/order-form";

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string }>;
}) {
  const { customer } = await searchParams;
  const supabase = await createClient();

  const [{ data: customers }, { data: products }] = await Promise.all([
    supabase.from("customers").select("id, name, phone").order("name"),
    supabase
      .from("products")
      .select("id, name, price")
      .eq("is_active", true)
      .order("name"),
  ]);

  return (
    <div className="px-6 py-8 md:px-10">
      <Link
        href="/orders"
        className="inline-flex items-center gap-1.5 text-sm text-charcoal-muted hover:text-charcoal"
      >
        <ArrowLeft className="h-4 w-4" />
        Orders
      </Link>
      <p className="mt-3 font-display text-2xl text-charcoal">New Order</p>

      <div className="mt-6 max-w-3xl">
        <OrderForm
          customers={customers ?? []}
          products={products ?? []}
          initialCustomerId={customer}
        />
      </div>
    </div>
  );
}