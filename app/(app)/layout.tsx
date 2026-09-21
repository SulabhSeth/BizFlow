import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, businesses ( name )")
    .eq("id", user.id)
    .single();

  const business = (profile as { businesses?: { name?: string } | null } | null)?.businesses;

  return (
    <AppShell businessName={business?.name ?? "Your bakery"} ownerName={profile?.full_name ?? null}>
      {children}
    </AppShell>
  );
}