"use client";

import { useActionState, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, UserPlus } from "lucide-react";
import { createOrder, type OrderFormState } from "@/actions/orders";
import { paymentMethods } from "@/lib/validations/order";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { OrderItemRow, type OrderItemState } from "./order-item-row";
import { CustomerFormModal } from "@/components/customers/customer-form";
import { calcItemTotal, type PricingUnit } from "@/lib/order-utils";
import { formatCurrency } from "@/lib/format";

interface CustomerOption {
  id: string;
  name: string;
  phone: string | null;
}

interface ProductOption {
  id: string;
  name: string;
  price: number;
  pricingUnit: PricingUnit;
}

interface OrderFormProps {
  customers: CustomerOption[];
  products: ProductOption[];
  initialCustomerId?: string;
}

let itemKeySeq = 0;
function newItem(): OrderItemState {
  itemKeySeq += 1;
  return { key: `item-${itemKeySeq}`, productId: null, name: "", unit: "piece", quantity: 1, unitPrice: 0 };
}

const initialState: OrderFormState = {};

export function OrderForm({ customers, products, initialCustomerId }: OrderFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createOrder, initialState);
  const [customerId, setCustomerId] = useState(initialCustomerId ?? "");
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [items, setItems] = useState<OrderItemState[]>([newItem()]);
  const [discount, setDiscount] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [advancePaid, setAdvancePaid] = useState(0);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + calcItemTotal(item.quantity, item.unitPrice, item.unit), 0),
    [items],
  );
  const total = Math.max(subtotal - discount + deliveryFee, 0);
  const balance = Math.max(total - advancePaid, 0);

  function updateItem(key: string, next: OrderItemState) {
    setItems((prev) => prev.map((item) => (item.key === key ? next : item)));
  }

  function removeItem(key: string) {
    setItems((prev) => (prev.length > 1 ? prev.filter((item) => item.key !== key) : prev));
  }

  return (
    <>
      <form action={formAction} className="space-y-6">
        <input type="hidden" name="customerId" value={customerId} />
        <input
          type="hidden"
          name="items"
          value={JSON.stringify(
            items.map((item) => ({
              productId: item.productId,
              name: item.name,
              unit: item.unit,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          )}
        />

        {state.error && (
          <p className="rounded-[var(--radius-control)] bg-danger-soft px-3 py-2 text-sm text-danger">
            {state.error}
          </p>
        )}

        <Card className="p-5">
          <p className="mb-4 font-medium text-charcoal">Customer</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">Select a customer…</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.phone ? ` — ${c.phone}` : ""}
                  </option>
                ))}
              </Select>
              {state.fieldErrors?.customerId && (
                <p className="mt-1.5 text-sm text-danger">{state.fieldErrors.customerId}</p>
              )}
            </div>
            <Button type="button" variant="secondary" onClick={() => setAddCustomerOpen(true)}>
              <UserPlus className="h-4 w-4" />
              New customer
            </Button>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-medium text-charcoal">Order Items</p>
            <Button type="button" variant="secondary" size="sm" onClick={() => setItems((prev) => [...prev, newItem()])}>
              <Plus className="h-4 w-4" />
              Add item
            </Button>
          </div>
          <div className="space-y-3">
            {items.map((item) => (
              <OrderItemRow
                key={item.key}
                item={item}
                products={products}
                onChange={(next) => updateItem(item.key, next)}
                onRemove={() => removeItem(item.key)}
                canRemove={items.length > 1}
              />
            ))}
          </div>
          {state.fieldErrors?.items && <p className="mt-2 text-sm text-danger">{state.fieldErrors.items}</p>}
        </Card>

        <Card className="p-5">
          <p className="mb-4 font-medium text-charcoal">Order Details</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Delivery date" htmlFor="deliveryDate" error={state.fieldErrors?.deliveryDate}>
              <Input id="deliveryDate" name="deliveryDate" type="date" required />
            </FormField>
            <FormField label="Delivery time (optional)" htmlFor="deliveryTime" error={state.fieldErrors?.deliveryTime}>
              <Input id="deliveryTime" name="deliveryTime" type="time" />
            </FormField>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Customer notes" htmlFor="customerNotes" error={state.fieldErrors?.customerNotes}>
              <Textarea id="customerNotes" name="customerNotes" placeholder="Eggless, deliver before 5 PM" />
            </FormField>
            <FormField label="Internal notes" htmlFor="internalNotes" error={state.fieldErrors?.internalNotes}>
              <Textarea id="internalNotes" name="internalNotes" placeholder="Notes for you, not shown to the customer" />
            </FormField>
          </div>
        </Card>

        <Card className="p-5">
          <p className="mb-4 font-medium text-charcoal">Payment</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Discount (₹)" htmlFor="discount" error={state.fieldErrors?.discount}>
              <Input
                id="discount"
                name="discount"
                type="number"
                min="0"
                step="1"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
              />
            </FormField>
            <FormField label="Delivery fee (₹)" htmlFor="deliveryFee" error={state.fieldErrors?.deliveryFee}>
              <Input
                id="deliveryFee"
                name="deliveryFee"
                type="number"
                min="0"
                step="1"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(Number(e.target.value) || 0)}
              />
            </FormField>
            <FormField label="Advance paid (₹)" htmlFor="advancePaid" error={state.fieldErrors?.advancePaid}>
              <Input
                id="advancePaid"
                name="advancePaid"
                type="number"
                min="0"
                step="1"
                value={advancePaid}
                onChange={(e) => setAdvancePaid(Number(e.target.value) || 0)}
              />
            </FormField>
            <FormField label="Payment method" htmlFor="paymentMethod" error={state.fieldErrors?.paymentMethod}>
              <Select id="paymentMethod" name="paymentMethod" defaultValue="Cash">
                <option value="">Select method…</option>
                {paymentMethods.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <div className="mt-5 space-y-1.5 border-t border-border pt-4 text-sm">
            <div className="flex justify-between text-charcoal-muted">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-charcoal-muted">
              <span>Discount</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
            <div className="flex justify-between text-charcoal-muted">
              <span>Delivery fee</span>
              <span>+{formatCurrency(deliveryFee)}</span>
            </div>
            <div className="flex justify-between font-medium text-charcoal">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between text-charcoal-muted">
              <span>Paid</span>
              <span>{formatCurrency(advancePaid)}</span>
            </div>
            <div className="flex justify-between font-medium text-danger">
              <span>Balance due</span>
              <span>{formatCurrency(balance)}</span>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="submit" loading={pending}>
            Create Order
          </Button>
        </div>
      </form>

      <CustomerFormModal
        open={addCustomerOpen}
        onClose={() => {
          setAddCustomerOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}