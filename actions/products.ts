"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusinessId } from "@/lib/supabase/business";
import { productSchema } from "@/lib/validations/product";

export interface ProductFormState {
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

function friendlyDbError(): string {
  return "Something went wrong. Please try again.";
}

function parseProductForm(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    description: formData.get("description"),
    price: formData.get("price"),
  });
}

export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error.issues) };
  }

  const supabase = await createClient();
  const businessId = await getCurrentBusinessId(supabase);

  const { error } = await supabase.from("products").insert({
    business_id: businessId,
    name: parsed.data.name,
    category: parsed.data.category,
    description: parsed.data.description || null,
    price: parsed.data.price,
  });

  if (error) {
    return { error: friendlyDbError() };
  }

  revalidatePath("/products");
  return { success: true };
}

export async function updateProduct(
  productId: string,
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error.issues) };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .update({
      name: parsed.data.name,
      category: parsed.data.category,
      description: parsed.data.description || null,
      price: parsed.data.price,
    })
    .eq("id", productId);

  if (error) {
    return { error: friendlyDbError() };
  }

  revalidatePath("/products");
  return { success: true };
}

export async function setProductActive(
  productId: string,
  isActive: boolean,
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ is_active: isActive })
    .eq("id", productId);

  if (error) {
    return { error: friendlyDbError() };
  }

  revalidatePath("/products");
  return { success: true };
}