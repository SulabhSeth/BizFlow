import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/settings/settings-form";

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data: business } = await supabase
    .from("businesses")
    .select(
      "name, owner_name, phone, email, address, website, instagram, gstin, invoice_prefix, currency, description, logo_url",
    )
    .single();

  return (
    <div className="px-6 py-8 md:px-10">
      <p className="font-display text-2xl text-charcoal">Settings</p>
      <p className="mt-1 text-sm text-charcoal-muted">
        These details appear on your invoices and around the app.
      </p>
      <div className="mt-6 max-w-3xl">
        {business ? (
          <SettingsForm business={business} />
        ) : (
          <p className="text-sm text-charcoal-muted">
            We couldn&apos;t load your business details. Try logging out and back in.
          </p>
        )}
      </div>
    </div>
  );
}