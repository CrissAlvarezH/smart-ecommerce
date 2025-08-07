export function formatPrice(price: number | string): string {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  return `$${Math.round(numericPrice).toLocaleString('es-CO')}`;
}