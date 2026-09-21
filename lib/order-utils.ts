/** Shared helpers for turning raw order/payment/item rows into display-ready data. */

export type PricingUnit = "piece" | "kg";

/**
 * The line total for one order item. For "kg" items, quantity is
 * stored in grams and unitPrice is the rate per kilogram, so the
 * total is (grams / 1000) * pricePerKg. For "piece" items it's the
 * familiar quantity * unitPrice.
 */
export function calcItemTotal(quantity: number, unitPrice: number, unit: PricingUnit): number {
  return unit === "kg" ? (quantity / 1000) * unitPrice : quantity * unitPrice;
}

/** Renders a gram quantity as "500 g" or, at 1000+, as "1.2 kg". */
export function formatWeight(grams: number): string {
  if (grams < 1000) return `${grams} g`;
  const kg = grams / 1000;
  return `${kg % 1 === 0 ? kg : kg.toFixed(2)} kg`;
}

export function paymentStatusFor(total: number, paid: number): "Paid" | "Partially Paid" | "Pending" {
  if (paid <= 0) return "Pending";
  if (paid >= total) return "Paid";
  return "Partially Paid";
}

export function itemsSummaryFor(names: string[]): string {
  if (names.length === 0) return "—";
  if (names.length <= 2) return names.join(", ");
  return `${names.slice(0, 2).join(", ")} +${names.length - 2} more`;
}