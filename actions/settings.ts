"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusinessId } from "@/lib/supabase/business";
import { settingsSchema } from "@/lib/validations/settings";

export interface SettingsFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  /** Changes on every successful save so the form can toast each time, not just the first. */
  savedAt?: number;
}

export async function updateBusinessSettings(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const parsed = settingsSchema.safeParse({
    name: formData.get("name"),
    ownerName: formData.get("ownerName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
    website: formData.get("website"),
    instagram: formData.get("instagram"),
    gstin: formData.get("gstin"),
    invoicePrefix: formData.get("invoicePrefix"),
    description: formData.get("description"),
    logoUrl: formData.get("logoUrl") ?? "",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { fieldErrors };
  }

  const d = parsed.data;
  const supabase = await createClient();
  const businessId = await getCurrentBusinessId(supabase);

  const { error } = await supabase
    .from("businesses")
    .update({
      name: d.name,
      owner_name: d.ownerName || null,
      phone: d.phone || null,
      email: d.email || null,
      address: d.address || null,
      website: d.website || null,
      instagram: d.instagram || null,
      gstin: d.gstin || null,
      invoice_prefix: d.invoicePrefix,
      description: d.description || null,
      logo_url: d.logoUrl || null,
    })
    .eq("id", businessId);

  if (error) {
    console.error("Failed to save settings:", error);
    return { error: "Something went wrong saving your settings. Please try again." };
  }

  // Keep the greeting/sidebar name in sync with the owner name set here.
  if (d.ownerName) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ full_name: d.ownerName }).eq("id", user.id);
    }
  }

  // Business name shows in the sidebar (layout), dashboard and invoices.
  revalidatePath("/", "layout");
  return { savedAt: Date.now() };
}