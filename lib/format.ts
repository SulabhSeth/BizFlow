/**
 * Formatting helpers per section 32 of the brief: Indian-style
 * currency grouping (₹48,650), "21 Sep 2026" dates, "4:00 PM" times.
 */

export function formatCurrency(amount: number, currency: string = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** A product's price, unit-aware: "₹1,200" for a piece item, "₹800/kg" for a weight item. */
export function formatPrice(price: number, pricingUnit: "piece" | "kg"): string {
  const base = formatCurrency(price);
  return pricingUnit === "kg" ? `${base}/kg` : base;
}

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/** Postgres `time` columns come back as "HH:MM:SS" strings. */
export function formatTime(value: string | null | undefined): string | null {
  if (!value) return null;
  const [hoursStr, minutesStr] = value.split(":");
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(date);
}

export function formatDateTime(date: string, time?: string | null): string {
  const formattedDate = formatDate(date);
  const formattedTime = formatTime(time);
  return formattedTime ? `${formattedDate}, ${formattedTime}` : formattedDate;
}