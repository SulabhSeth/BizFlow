import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Supabase client for use in Server Components, Server Actions and Route
 * Handlers. Reads/writes auth cookies via Next's `cookies()` API and is
 * always scoped by the signed-in user's session — RLS does the rest, so
 * every query made with this client only ever sees that user's business
 * data.
 *
 * Must be created fresh per request (do not module-cache the instance).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll was called from a Server Component. This can be
            // ignored if middleware is refreshing the session, which it
            // is here (see middleware.ts).
          }
        },
      },
    },
  );
}
