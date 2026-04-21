export const formatCurrency = (amount: number | string) => {
  const num = typeof amount === "string" ? Number(amount) : (amount ?? 0);
  if (Number.isNaN(num)) return String(amount);
  return `Br ${num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};
