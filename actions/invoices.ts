"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusinessId } from "@/lib/supabase/business";

/**
 * Generates a per-business invoice number using the business's own
 * invoice_prefix (from Settings, once that exists — defaults to
 * "INV"), e.g. "INV-0001". Same simple count-based approach as order
 * numbers; adequate for a single-owner bakery's volume.
 */
async function nextInvoiceNumber(
  supabase: Awaited<ReturnType<typeof createClient>>,
  businessId: string,
): Promise<string> {
  const [{ count }, { data: business }] = await Promise.all([
    supabase.from("invoices").select("id", { count: "exact", head: true }).eq("business_id", businessId),
    supabase.from("businesses").select("invoice_prefix").eq("id", businessId).single(),
  ]);

  const prefix = business?.invoice_prefix || "INV";
  const next = (count ?? 0) + 1;
  return `${prefix}-${String(next).padStart(4, "0")}`;
}

export async function createInvoiceFromOrder(
  orderId: string,
): Promise<{ error?: string; invoiceId?: string }> {
  const supabase = await createClient();
  const businessId = await getCurrentBusinessId(supabase);

  const { data: existing } = await supabase
    .from("invoices")
    .select("id")
    .eq("order_id", orderId)
    .maybeSingle();

  if (existing) {
    return { invoiceId: existing.id };
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, customer_id, subtotal, discount, delivery_fee, total")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    return { error: "Couldn't find that order." };
  }

  const [{ data: items }, { data: payments }] = await Promise.all([
    supabase.from("order_items").select("name, quantity, unit_price, total").eq("order_id", orderId),
    supabase.from("payments").select("amount").eq("order_id", orderId),
  ]);

  const amountPaid = (payments ?? []).reduce((sum, p) => sum + p.amount, 0);
  const balanceDue = Math.max(order.total - amountPaid, 0);
  const status = balanceDue <= 0 ? "Paid" : amountPaid > 0 ? "Partially Paid" : "Issued";

  const invoiceNumber = await nextInvoiceNumber(supabase, businessId);

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert({
      business_id: businessId,
      order_id: order.id,
      customer_id: order.customer_id,
      invoice_number: invoiceNumber,
      status,
      subtotal: order.subtotal,
      discount: order.discount,
      delivery_fee: order.delivery_fee,
      total: order.total,
      amount_paid: amountPaid,
      balance_due: balanceDue,
    })
    .select("id")
    .single();

  if (invoiceError || !invoice) {
    console.error("Failed to create invoice:", invoiceError);
    return { error: "Something went wrong creating the invoice. Please try again." };
  }

  const { error: itemsError } = await supabase.from("invoice_items").insert(
    (items ?? []).map((item) => ({
      business_id: businessId,
      invoice_id: invoice.id,
      description: item.name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      amount: item.total,
    })),
  );

  if (itemsError) {
    console.error("Failed to create invoice items:", itemsError);
    return { error: "The invoice was created, but its line items failed to save." };
  }

  revalidatePath("/invoices");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/dashboard");
  return { invoiceId: invoice.id };
}