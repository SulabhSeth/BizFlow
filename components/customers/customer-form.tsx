"use client";

import { useActionState, useEffect } from "react";
import { createCustomer, updateCustomer, type CustomerFormState } from "@/actions/customers";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export interface CustomerFormValues {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
}

interface CustomerFormModalProps {
  open: boolean;
  onClose: () => void;
  /** Omit to create a new customer; pass an existing customer to edit it. */
  customer?: CustomerFormValues;
}

const initialState: CustomerFormState = {};

export function CustomerFormModal({ open, onClose, customer }: CustomerFormModalProps) {
  const toast = useToast();
  const action = customer ? updateCustomer.bind(null, customer.id) : createCustomer;
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) {
      toast(customer ? "Customer updated successfully." : "Customer added successfully.");
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <Modal open={open} onClose={onClose} title={customer ? "Edit customer" : "Add customer"}>
      {state.error && (
        <p className="mb-4 rounded-[var(--radius-control)] bg-danger-soft px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}
      <form action={formAction} className="space-y-4">
        <FormField label="Name" htmlFor="name" error={state.fieldErrors?.name}>
          <Input id="name" name="name" defaultValue={customer?.name} placeholder="Priya Sharma" />
        </FormField>
        <FormField label="Phone" htmlFor="phone" error={state.fieldErrors?.phone}>
          <Input
            id="phone"
            name="phone"
            defaultValue={customer?.phone ?? ""}
            placeholder="+91 98765 43210"
          />
        </FormField>
        <FormField label="Email" htmlFor="email" error={state.fieldErrors?.email}>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={customer?.email ?? ""}
            placeholder="priya@example.com"
          />
        </FormField>
        <FormField label="Address" htmlFor="address" error={state.fieldErrors?.address}>
          <Input id="address" name="address" defaultValue={customer?.address ?? ""} />
        </FormField>
        <FormField label="Notes" htmlFor="notes" error={state.fieldErrors?.notes}>
          <Input
            id="notes"
            name="notes"
            defaultValue={customer?.notes ?? ""}
            placeholder="Allergic to nuts, prefers eggless"
          />
        </FormField>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={pending}>
            {customer ? "Save changes" : "Add customer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}