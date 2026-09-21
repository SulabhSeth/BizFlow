/** Shared helpers for turning raw order/payment/item rows into display-ready data. */

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