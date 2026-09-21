"use client";

import { Trash2 } from "lucide-react";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { calcItemTotal, type PricingUnit } from "@/lib/order-utils";
import { formatCurrency } from "@/lib/format";

export interface OrderItemState {
  key: string;
  productId: string | null;
  name: string;
  unit: PricingUnit;
  quantity: number;
  unitPrice: number;
}

interface ProductOption {
  id: string;
  name: string;
  price: number;
  pricingUnit: PricingUnit;
}

interface OrderItemRowProps {
  item: OrderItemState;
  products: ProductOption[];
  onChange: (next: OrderItemState) => void;
  onRemove: () => void;
  canRemove: boolean;
}

const CUSTOM_VALUE = "__custom__";

export function OrderItemRow({ item, products, onChange, onRemove, canRemove }: OrderItemRowProps) {
  const isCustom = item.productId === null;
  const isWeight = item.unit === "kg";

  function handleProductSelect(value: string) {
    if (value === CUSTOM_VALUE) {
      onChange({ ...item, productId: null, name: "", unit: "piece", unitPrice: 0, quantity: 1 });
      return;
    }
    const product = products.find((p) => p.id === value);
    if (!product) return;
    onChange({
      ...item,
      productId: product.id,
      name: product.name,
      unit: product.pricingUnit,
      unitPrice: product.price,
      quantity: product.pricingUnit === "kg" ? 500 : 1,
    });
  }

  return (
    <div className="grid grid-cols-1 gap-3 rounded-[var(--radius-control)] border border-border p-3 sm:grid-cols-[1.5fr_1fr_0.8fr_0.8fr_auto] sm:items-end sm:p-2">
      <div>
        <label className="mb-1 block text-xs text-charcoal-muted sm:hidden">Item</label>
        <Select value={item.productId ?? CUSTOM_VALUE} onChange={(e) => handleProductSelect(e.target.value)}>
          <option value={CUSTOM_VALUE}>Custom item…</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
              {p.pricingUnit === "kg" ? " (by weight)" : ""}
            </option>
          ))}
        </Select>
        {isCustom && (
          <div className="mt-2 space-y-2">
            <Input
              placeholder="Custom item name"
              value={item.name}
              onChange={(e) => onChange({ ...item, name: e.target.value })}
            />
            <Select
              value={item.unit}
              onChange={(e) => {
                const unit = e.target.value as PricingUnit;
                onChange({ ...item, unit, quantity: unit === "kg" ? 500 : 1 });
              }}
            >
              <option value="piece">Priced as: fixed price</option>
              <option value="kg">Priced as: by weight (₹/kg)</option>
            </Select>
          </div>
        )}
      </div>

      <div>
        <label className="mb-1 block text-xs text-charcoal-muted sm:hidden">
          {isWeight ? "Weight (g)" : "Quantity"}
        </label>
        <Input
          type="number"
          min={isWeight ? "1" : "1"}
          step={isWeight ? "10" : "1"}
          value={item.quantity}
          onChange={(e) => onChange({ ...item, quantity: Number(e.target.value) })}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-charcoal-muted sm:hidden">
          {isWeight ? "Price per kg (₹)" : "Unit price (₹)"}
        </label>
        <Input
          type="number"
          min="0"
          step="1"
          value={item.unitPrice}
          onChange={(e) => onChange({ ...item, unitPrice: Number(e.target.value) })}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-charcoal-muted sm:hidden">Total</label>
        <p className="flex h-11 items-center text-sm font-medium text-charcoal">
          {formatCurrency(calcItemTotal(item.quantity, item.unitPrice, item.unit))}
        </p>
      </div>

      <button
        type="button"
        onClick={onRemove}
        disabled={!canRemove}
        aria-label="Remove item"
        className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-control)] text-charcoal-muted hover:bg-danger-soft hover:text-danger disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}