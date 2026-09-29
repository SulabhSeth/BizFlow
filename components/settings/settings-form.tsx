"use client";

import { useActionState, useEffect } from "react";
import { updateBusinessSettings, type SettingsFormState } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { LogoUpload } from "./logo-upload";

export interface BusinessSettings {
  name: string;
  owner_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  website: string | null;
  instagram: string | null;
  gstin: string | null;
  invoice_prefix: string;
  currency: string;
  description: string | null;
  logo_url: string | null;
}

const initialState: SettingsFormState = {};

export function SettingsForm({ business }: { business: BusinessSettings }) {
  const toast = useToast();
  const [state, formAction, pending] = useActionState(updateBusinessSettings, initialState);
  const errors = state.fieldErrors ?? {};

  useEffect(() => {
    if (state.savedAt) toast("Settings saved successfully.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.savedAt]);

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <p className="rounded-[var(--radius-control)] bg-danger-soft px-3 py-2 text-sm text-danger">{state.error}</p>
      )}

      <Card className="p-5">
        <p className="mb-4 font-medium text-charcoal">Business</p>
        <div className="space-y-4">
          <LogoUpload initialLogo={business.logo_url} />
          {errors.logoUrl && <p className="text-sm text-danger">{errors.logoUrl}</p>}
          <FormField label="Business name" htmlFor="name" error={errors.name}>
            <Input id="name" name="name" defaultValue={business.name} />
          </FormField>
          <FormField label="Business description" htmlFor="description" error={errors.description}>
            <Textarea
              id="description"
              name="description"
              defaultValue={business.description ?? ""}
              placeholder="Homemade cakes and cookies, baked fresh to order"
            />
          </FormField>
        </div>
      </Card>

      <Card className="p-5">
        <p className="mb-4 font-medium text-charcoal">Contact</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Owner name" htmlFor="ownerName" error={errors.ownerName}>
            <Input id="ownerName" name="ownerName" defaultValue={business.owner_name ?? ""} />
          </FormField>
          <FormField label="Phone" htmlFor="phone" error={errors.phone}>
            <Input id="phone" name="phone" defaultValue={business.phone ?? ""} placeholder="+91 98765 43210" />
          </FormField>
          <FormField label="Email" htmlFor="email" error={errors.email}>
            <Input id="email" name="email" type="email" defaultValue={business.email ?? ""} />
          </FormField>
          <FormField label="Website" htmlFor="website" error={errors.website}>
            <Input id="website" name="website" defaultValue={business.website ?? ""} placeholder="www.tulsibakes.in" />
          </FormField>
          <FormField label="Instagram" htmlFor="instagram" error={errors.instagram}>
            <Input id="instagram" name="instagram" defaultValue={business.instagram ?? ""} placeholder="@tulsibakes" />
          </FormField>
        </div>
        <div className="mt-4">
          <FormField label="Address" htmlFor="address" error={errors.address}>
            <Textarea id="address" name="address" defaultValue={business.address ?? ""} />
          </FormField>
        </div>
      </Card>

      <Card className="p-5">
        <p className="mb-4 font-medium text-charcoal">Invoicing</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField label="GSTIN (optional)" htmlFor="gstin" error={errors.gstin}>
            <Input id="gstin" name="gstin" defaultValue={business.gstin ?? ""} />
          </FormField>
          <FormField label="Invoice prefix" htmlFor="invoicePrefix" error={errors.invoicePrefix}>
            <Input id="invoicePrefix" name="invoicePrefix" defaultValue={business.invoice_prefix} />
          </FormField>
          <FormField label="Currency" htmlFor="currency">
            <Input id="currency" value="INR (₹)" disabled readOnly />
          </FormField>
        </div>
        <p className="mt-3 text-xs text-charcoal-muted">
          The prefix applies to new invoices (e.g. INV-0007); existing invoice numbers don&apos;t change. Currency is
          fixed to Indian Rupees for now.
        </p>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" loading={pending}>
          Save changes
        </Button>
      </div>
    </form>
  );
}