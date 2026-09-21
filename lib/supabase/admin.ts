import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Admin client using the service role key. This BYPASSES Row Level
 * Security entirely, so it must never be imported into any file that
 * could end up in a Client Component bundle, and should only be used
 * for the rare server-side task that genuinely needs to act across
 * businesses (e.g. a signup flow provisioning a new business row before
 * the owning user technically has access to it yet).
 *
 * The `server-only` import above makes Next throw a build error if this
 * module is ever pulled into client code.
 *
 * Default to lib/supabase/server.ts (the RLS-scoped client) for
 * everything else.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
