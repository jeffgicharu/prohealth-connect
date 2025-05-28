import { formatPrice } from '../utils';

describe('formatPrice', () => {
  it('should format a price correctly with two decimal places', () => {
    expect(formatPrice(100)).toBe('Ksh 100.00');
    expect(formatPrice(75.5)).toBe('Ksh 75.50');
    expect(formatPrice(0.99)).toBe('Ksh 0.99');
  });

  it('should handle zero correctly', () => {
    expect(formatPrice(0)).toBe('Ksh 0.00');
  });

  it('should handle negative numbers correctly', () => {
    expect(formatPrice(-10.5)).toBe('Ksh -10.50');
  });
}); 