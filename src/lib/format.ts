export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);

  return formatted.replace(/\s+/g, '');
}

export function roundRupiah(amount: number): number {
  return Math.round(amount);
}
