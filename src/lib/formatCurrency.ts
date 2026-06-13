export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
  
  // Ensure "Rp" has no space after it and any trailing decimals are removed
  return formatted.replace(/\s+/g, '').replace(/Rp/g, 'Rp');
}
