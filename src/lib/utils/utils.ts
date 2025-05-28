/**
 * Formats a price number into a string with the Kenyan Shilling (Ksh) currency format
 * @param price - The price to format
 * @returns A string representing the formatted price (e.g., "Ksh 100.00")
 */
export const formatPrice = (price: number): string => {
  return `Ksh ${price.toFixed(2)}`;
}; 