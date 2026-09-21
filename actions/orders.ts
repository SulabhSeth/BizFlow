"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusinessId } from "@/lib/supabase/business";
import { orderSchema, orderStatuses } from "@/lib/validations/order";
import { calcItemTotal } from "@/lib/order-utils";

export async function updateOrderStatus(
  orderId: string,
  status: (typeof orderStatuses)[number],
): Promise<{ error?: string; success?: boolean }> {
  if (!orderStatuses.includes(status)) {
    return { error: "That's not a valid order status." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);

  if (error) {
    console.error("Failed to update order status:", error);
    return { error: "Something went wrong updating the status. Please try again." };
  }

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export interface OrderFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

function fieldErrorsFromZod(issues: { path: PropertyKey[]; message: string }[]) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0]);
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

/**
 * Generates a per-business order number like "ORD-0007" and retries
 * on a rare race with another concurrent insert (unique constraint on
 * (business_id, order_number)) rather than relying on a DB sequence —
 * simple and adequate for a single-owner bakery's order volume.
 */
async function nextOrderNumber(
  supabase: Awaited<ReturnType<typeof createClient>>,
  businessId: string,
): Promise<string> {
  const { count } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId);

  const next = (count ?? 0) + 1;
  return `ORD-${String(next).padStart(4, "0")}`;
}

export async function createOrder(
  _prevState: OrderFormState,
  formData: FormData,
): Promise<OrderFormState> {
  let itemsRaw: unknown;
  try {
    itemsRaw = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return { error: "Something went wrong reading the order items. Please try again." };
  }

  const parsed = orderSchema.safeParse({
    customerId: formData.get("customerId"),
    deliveryDate: formData.get("deliveryDate"),
    deliveryTime: formData.get("deliveryTime"),
    customerNotes: formData.get("customerNotes"),
    internalNotes: formData.get("internalNotes"),
    discount: formData.get("discount") || 0,
    deliveryFee: formData.get("deliveryFee") || 0,
    advancePaid: formData.get("advancePaid") || 0,
    paymentMethod: formData.get("paymentMethod") || undefined,
    items: itemsRaw,
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error.issues) };
  }

  const { customerId, deliveryDate, deliveryTime, customerNotes, internalNotes, discount, deliveryFee, advancePaid, paymentMethod, items } =
    parsed.data;

  const subtotal = items.reduce(
    (sum, item) => sum + calcItemTotal(item.quantity, item.unitPrice, item.unit),
    0,
  );
  const total = Math.max(subtotal - discount + deliveryFee, 0);

  if (advancePaid > total) {
    return { fieldErrors: { advancePaid: "Amount paid can't be more than the order total." } };
  }

  const supabase = await createClient();
  const businessId = await getCurrentBusinessId(supabase);
  const orderNumber = await nextOrderNumber(supabase, businessId);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      business_id: businessId,
      customer_id: customerId,
      order_number: orderNumber,
      delivery_date: deliveryDate,
      delivery_time: deliveryTime || null,
      customer_notes: customerNotes || null,
      internal_notes: internalNotes || null,
      subtotal,
      discount,
      delivery_fee: deliveryFee,
      total,
      status: "New",
    })
    .select("id")
    .single();

  if (orderError || !order) {
    console.error("Failed to create order:", orderError);
    return { error: "Something went wrong creating the order. Please try again." };
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    items.map((item) => ({
      business_id: businessId,
      order_id: order.id,
      product_id: item.productId,
      name: item.name,
      unit: item.unit,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total: calcItemTotal(item.quantity, item.unitPrice, item.unit),
    })),
  );

  if (itemsError) {
    console.error("Failed to create order items:", itemsError);
    return { error: "The order was created, but its items failed to save. Please edit the order to add them." };
  }

  if (advancePaid > 0) {
    const { error: paymentError } = await supabase.from("payments").insert({
      business_id: businessId,
      order_id: order.id,
      amount: advancePaid,
      method: paymentMethod ?? "Cash",
      payment_date: new Date().toISOString().slice(0, 10),
    });

    if (paymentError) {
      console.error("Failed to record advance payment:", paymentError);
      return {
        error: "The order was created, but the advance payment failed to save. You can record it from the order page.",
      };
    }
  }

  revalidatePath("/orders");
  revalidatePath("/dashboard");
  revalidatePath("/customers");
  redirect(`/orders/${order.id}`);
}