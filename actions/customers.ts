"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusinessId } from "@/lib/supabase/business";
import { customerSchema } from "@/lib/validations/customer";

export interface CustomerFormState {
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

/** Never surface raw Postgres error text to the user (section 30). */
function friendlyDbError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("customers_business_id_fkey") || lower.includes("violates foreign key")) {
    return "This customer still has orders linked to them, so they can't be removed.";
  }
  return "Something went wrong. Please try again.";
}

function parseCustomerForm(formData: FormData) {
  return customerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
    notes: formData.get("notes"),
  });
}

export async function createCustomer(
  _prevState: CustomerFormState,
  formData: FormData,
): Promise<CustomerFormState> {
  const parsed = parseCustomerForm(formData);
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error.issues) };
  }

  const supabase = await createClient();
  const businessId = await getCurrentBusinessId(supabase);

  const { error } = await supabase.from("customers").insert({
    business_id: businessId,
    name: parsed.data.name,
    phone: parsed.data.phone || null,
    email: parsed.data.email || null,
    address: parsed.data.address || null,
    notes: parsed.data.notes || null,
  });

  if (error) {
    return { error: friendlyDbError(error.message) };
  }

  revalidatePath("/customers");
  return { success: true };
}

export async function updateCustomer(
  customerId: string,
  _prevState: CustomerFormState,
  formData: FormData,
): Promise<CustomerFormState> {
  const parsed = parseCustomerForm(formData);
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error.issues) };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("customers")
    .update({
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      address: parsed.data.address || null,
      notes: parsed.data.notes || null,
    })
    .eq("id", customerId);

  if (error) {
    return { error: friendlyDbError(error.message) };
  }

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
  return { success: true };
}

export async function deleteCustomer(
  customerId: string,
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();
  const { error } = await supabase.from("customers").delete().eq("id", customerId);

  if (error) {
    return { error: friendlyDbError(error.message) };
  }

  revalidatePath("/customers");
  return { success: true };
}