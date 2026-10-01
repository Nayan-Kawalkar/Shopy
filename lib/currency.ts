// Indian Rupee formatting with Indian digit grouping: ₹1,23,456 and ₹68.50.
const wholeRupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const withPaise = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatINR(amount: number | null | undefined) {
  const value = amount ?? 0;
  return Number.isInteger(value) ? wholeRupees.format(value) : withPaise.format(value);
}

// Parses what someone typed as a price ("68", "₹1,200", "45.5"); returns null if it isn't a positive amount.
export function parseRupees(text: string) {
  const value = Number(text.replace(/[₹,\s]/g, ""));
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 100) / 100;
}
