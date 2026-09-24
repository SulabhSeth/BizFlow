"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet } from "lucide-react";
import { recordPayment, type PaymentFormState } from "@/actions/payments";
import { paymentMethods } from "@/lib/validations/order";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/format";

const initialState: PaymentFormState = {};

export function RecordPaymentButton({ orderId, balance }: { orderId: string; balance: number }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const recordPaymentForOrder = recordPayment.bind(null, orderId);
  const [state, formAction, pending] = useActionState(recordPaymentForOrder, initialState);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (state.success) {
      toast("Payment recorded successfully.");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reacting to a server action result, not synchronizable at render time
      setOpen(false);
      router.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  if (balance <= 0) return null;

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Wallet className="h-4 w-4" />
        Record Payment
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Record payment" size="sm">
        <p className="mb-4 text-sm text-charcoal-muted">
          Balance due: <span className="font-medium text-charcoal">{formatCurrency(balance)}</span>
        </p>
        {state.error && (
          <p className="mb-4 rounded-[var(--radius-control)] bg-danger-soft px-3 py-2 text-sm text-danger">
            {state.error}
          </p>
        )}
        <form action={formAction} className="space-y-4">
          <FormField label="Amount (₹)" htmlFor="amount" error={state.fieldErrors?.amount}>
            <Input id="amount" name="amount" type="number" min="0" step="1" defaultValue={balance} />
          </FormField>
          <FormField label="Payment method" htmlFor="method" error={state.fieldErrors?.method}>
            <Select id="method" name="method" defaultValue="Cash">
              {paymentMethods.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Payment date" htmlFor="paymentDate" error={state.fieldErrors?.paymentDate}>
            <Input id="paymentDate" name="paymentDate" type="date" defaultValue={today} />
          </FormField>
          <FormField label="Notes (optional)" htmlFor="notes" error={state.fieldErrors?.notes}>
            <Textarea id="notes" name="notes" placeholder="e.g. Paid via UPI, ref #1234" />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={pending}>
              Record Payment
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}