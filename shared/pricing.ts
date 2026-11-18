// Single source of truth for prices, used by the browser and the Netlify functions.
// Amounts are in the currency's smallest unit (paise, cents, pence).
// Prices are fixed here (not in environment variables) on purpose.

export const CURRENCIES = ['INR', 'USD', 'CAD', 'GBP', 'AUD'] as const;
export type Currency = (typeof CURRENCIES)[number];
export type Tier = 'first_year' | 'renewal';

export const SUBSCRIPTION_MONTHS = 12;

export const CURRENCY_NAMES: Record<Currency, string> = {
  INR: 'Indian Rupee (₹)',
  USD: 'US Dollar ($)',
  CAD: 'Canadian Dollar (C$)',
  GBP: 'British Pound (£)',
  AUD: 'Australian Dollar (A$)',
};

// Customer prices. International prices include Razorpay's international card fee (3.54%).
export const PRICES: Record<Currency, Record<Tier, number>> = {
  INR: { first_year: 1500000, renewal: 600000 }, // ₹15,000 / ₹6,000
  USD: { first_year: 16500, renewal: 6000 },     // $165 / $60
  CAD: { first_year: 22500, renewal: 9000 },     // C$225 / C$90
  GBP: { first_year: 12000, renewal: 4500 },     // £120 / £45
  AUD: { first_year: 22500, renewal: 9000 },     // A$225 / A$90
};

// Display text for the paywall.
export const PRICE_LABELS: Record<Currency, Record<Tier, string>> = {
  INR: { first_year: '₹15,000', renewal: '₹6,000' },
  USD: { first_year: '$165', renewal: '$60' },
  CAD: { first_year: 'C$225', renewal: 'C$90' },
  GBP: { first_year: '£120', renewal: '£45' },
  AUD: { first_year: 'A$225', renewal: 'A$90' },
};

export function isCurrency(value: unknown): value is Currency {
  return typeof value === 'string' && (CURRENCIES as readonly string[]).includes(value);
}

/** Expected charge in smallest units for a currency and tier, or null if unknown. */
export function priceFor(currency: unknown, tier: unknown): number | null {
  if (!isCurrency(currency)) return null;
  if (tier !== 'first_year' && tier !== 'renewal') return null;
  return PRICES[currency][tier];
}
