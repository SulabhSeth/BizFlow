import type { SupabaseClient, User } from "@supabase/supabase-js";

/**
 * Ensures the given user has a business linked to their profile,
 * provisioning one from their signup metadata if not. Safe to call
 * repeatedly — it's a no-op once a business is already linked.
 */
export async function ensureBusinessForUser(
  supabase: SupabaseClient,
  user: User,
): Promise<string | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("business_id")
    .eq("id", user.id)
    .single();

  if (profile?.business_id) return profile.business_id;

  const businessName =
    (user.user_metadata?.business_name as string | undefined)?.trim() || "My Bakery";
  const ownerName = (user.user_metadata?.full_name as string | undefined)?.trim() || null;

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .insert({ name: businessName, owner_name: ownerName, email: user.email })
    .select("id")
    .single();

  if (businessError || !business) {
    console.error("Failed to provision business:", businessError);
    return null;
  }

  const { error: linkError } = await supabase
    .from("profiles")
    .update({ business_id: business.id })
    .eq("id", user.id);

  if (linkError) {
    console.error("Failed to link business to profile:", linkError);
    return null;
  }

  return business.id;
}

/**
 * The signed-in user's business_id, via the same current_business_id()
 * Postgres function RLS policies use. Needed whenever we write a new
 * row (insert payloads must include business_id explicitly — RLS's
 * with check only verifies it, it doesn't fill it in).
 *
 * Self-healing: if the user somehow doesn't have a business linked yet
 * (e.g. provisioning failed silently on their very first login), this
 * provisions one now rather than erroring out until they log out and
 * back in.
 */
export async function getCurrentBusinessId(supabase: SupabaseClient): Promise<string> {
  const { data, error } = await supabase.rpc("current_business_id");
  if (!error && data) {
    return data as string;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You're not signed in. Please log in again.");
  }

  const businessId = await ensureBusinessForUser(supabase, user);
  if (!businessId) {
    throw new Error("Could not set up your business. Please log out and back in.");
  }
  return businessId;
}