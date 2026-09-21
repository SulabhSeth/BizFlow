"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureBusinessForUser } from "@/lib/supabase/business";
import { loginSchema, signUpSchema } from "@/lib/validations/auth";

export interface AuthFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  message?: string;
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
 * Ensures the signed-in user has a business linked to their profile.
 * Runs after every successful sign-in/sign-up. If this is the user's
 * first time getting a session (immediately after signup, or after
 * confirming their email and logging in for the first time), it
 * provisions their business from the metadata captured at signup.
 */
// async function ensureBusinessForUser(supabase: SupabaseClient, user: User) {
//   const { data: profile } = await supabase
//     .from("profiles")
//     .select("business_id")
//     .eq("id", user.id)
//     .single();

//   if (profile?.business_id) return;

//   const businessName =
//     (user.user_metadata?.business_name as string | undefined)?.trim() || "My Bakery";
//   const ownerName = (user.user_metadata?.full_name as string | undefined)?.trim() || null;

//   const { data: business, error: businessError } = await supabase
//     .from("businesses")
//     .insert({ name: businessName, owner_name: ownerName, email: user.email })
//     .select("id")
//     .single();

//   if (businessError || !business) {
//     // Don't block sign-in over this — the dashboard can retry.
//     console.error("Business insert error:", businessError);
//     console.error("Failed to provision business:", businessError);
//     return;
//   }

//   await supabase.from("profiles").update({ business_id: business.id }).eq("id", user.id);
// }

export async function signUp(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse({
    businessName: formData.get("businessName"),
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error.issues) };
  }

  const { businessName, fullName, email, password } = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, business_name: businessName } },
  });

  if (error) {
    console.error("Supabase signUp error:", error.status, error.message);
    console.error("Auth signup error:", JSON.stringify(error, null, 2));
    return { error: friendlyAuthError(error.message) };
  }

  if (data.user && !data.session) {
    return {
      message: "Account created. Check your email to confirm your account, then log in.",
    };
  }

  if (data.user && data.session) {
    await ensureBusinessForUser(supabase, data.user);
  }

  redirect("/dashboard");
}

export async function signIn(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error.issues) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    console.error("Supabase signIn error:", error.status, error.message);
    return { error: friendlyAuthError(error.message) };
  }

  if (data.user) {
    await ensureBusinessForUser(supabase, data.user);
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/** Never surface raw Supabase/Postgres error text to the user (section 30). */
function friendlyAuthError(message: string): string {
  if (message.toLowerCase().includes("invalid login credentials")) {
    return "That email and password don't match our records.";
  }
  if (message.toLowerCase().includes("already registered")) {
    return "An account with this email already exists. Try logging in instead.";
  }
  if (message.toLowerCase().includes("email not confirmed")) {
    return "Please confirm your email before logging in.";
  }
  return "Something went wrong. Please try again.";
}