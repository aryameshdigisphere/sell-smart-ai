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
  INR: { first_year: 500000, renewal: 150000 }, // ₹5,000 / ₹1,500
  USD: { first_year: 5500, renewal: 1500 },     // $55 / $15
  CAD: { first_year: 7500, renewal: 2300 },     // C$75 / C$23
  GBP: { first_year: 4000, renewal: 1200 },     // £40 / £12
  AUD: { first_year: 7500, renewal: 2300 },     // A$75 / A$23
};

// Display text for the paywall.
export const PRICE_LABELS: Record<Currency, Record<Tier, string>> = {
  INR: { first_year: '₹5,000', renewal: '₹1,500' },
  USD: { first_year: '$55', renewal: '$15' },
  CAD: { first_year: 'C$75', renewal: 'C$23' },
  GBP: { first_year: '£40', renewal: '£12' },
  AUD: { first_year: 'A$75', renewal: 'A$23' },
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
