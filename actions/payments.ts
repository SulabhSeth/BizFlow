"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusinessId } from "@/lib/supabase/business";
import { paymentSchema } from "@/lib/validations/payment";
import { paymentStatusFor } from "@/lib/order-utils";

export interface PaymentFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
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
 * If the order already has an invoice (generated before this payment
 * came in), keep its amount_paid/balance_due/status snapshot in sync
 * rather than letting it silently go stale.
 */
async function syncInvoiceForOrder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  orderId: string,
  orderTotal: number,
  amountPaid: number,
) {
  const { data: invoice } = await supabase
    .from("invoices")
    .select("id")
    .eq("order_id", orderId)
    .maybeSingle();

  if (!invoice) return;

  const balanceDue = Math.max(orderTotal - amountPaid, 0);
  const paymentStatus = paymentStatusFor(orderTotal, amountPaid);
  const invoiceStatus = paymentStatus === "Pending" ? "Issued" : paymentStatus;

  await supabase
    .from("invoices")
    .update({ amount_paid: amountPaid, balance_due: balanceDue, status: invoiceStatus })
    .eq("id", invoice.id);
}

export async function recordPayment(
  orderId: string,
  _prevState: PaymentFormState,
  formData: FormData,
): Promise<PaymentFormState> {
  const parsed = paymentSchema.safeParse({
    amount: formData.get("amount"),
    method: formData.get("method"),
    paymentDate: formData.get("paymentDate"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error.issues) };
  }

  const supabase = await createClient();
  const businessId = await getCurrentBusinessId(supabase);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, total")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    return { error: "Couldn't find that order." };
  }

    const { data: existingPayments } = await supabase.from("payments").select("amount").eq("order_id", orderId);
  const alreadyPaid = (existingPayments ?? []).reduce((sum, p) => sum + p.amount, 0);
  // Round to the nearest paisa — summing decimals in JS can otherwise
  // leave remaining as e.g. 0.9999999999998 instead of exactly 1,
  // which would wrongly reject a payment that exactly pays off the
  // balance.
  const remaining = Math.round((order.total - alreadyPaid) * 100) / 100;

  if (parsed.data.amount > remaining) {
    return {
      fieldErrors: {
        amount: `Amount can't exceed the remaining balance of ${remaining.toFixed(0)}.`,
      },
    };
  }

  const { error: insertError } = await supabase.from("payments").insert({
    business_id: businessId,
    order_id: orderId,
    amount: parsed.data.amount,
    method: parsed.data.method,
    payment_date: parsed.data.paymentDate,
    notes: parsed.data.notes || null,
  });

  if (insertError) {
    console.error("Failed to record payment:", insertError);
    return { error: "Something went wrong recording the payment. Please try again." };
  }

  await syncInvoiceForOrder(supabase, orderId, order.total, alreadyPaid + parsed.data.amount);

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");
  revalidatePath("/dashboard");
  revalidatePath("/customers");
  revalidatePath("/invoices");
  return { success: true };
}