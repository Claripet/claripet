/** Format a number as Indonesian Rupiah, e.g. 165000 -> "Rp 165.000". */
export function formatPrice(n: number): string {
  return "Rp " + n.toLocaleString("id-ID");
}
