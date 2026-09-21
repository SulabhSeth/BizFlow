import { createClient } from "@/lib/supabase/server";
import { ProductsView, type ProductRow } from "@/components/products/products-view";

export default async function ProductsPage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("id, name, category, description, pricing_unit, price, is_active")
    .order("name");

  const rows: ProductRow[] = (products ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    description: p.description,
    pricingUnit: p.pricing_unit as "piece" | "kg",
    price: p.price,
    isActive: p.is_active,
  }));

  return <ProductsView products={rows} />;
}