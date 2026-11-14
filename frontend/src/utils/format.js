export function formatDate(value, options = {}) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    ...options,
  }).format(date);
}

export function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function formatCurrency(value) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(Number(value || 0));
}

export function titleCase(value = "") {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function errorMessage(error) {
  return error?.message || "Something went wrong. Please try again.";
}
