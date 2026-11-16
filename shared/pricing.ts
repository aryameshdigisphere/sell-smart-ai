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

// Customer prices. International prices include Razorpay's international card fee.
export const PRICES: Record<Currency, Record<Tier, number>> = {
  INR: { first_year: 5000000, renewal: 400000 }, // ₹50,000 / ₹4,000
  USD: { first_year: 54000, renewal: 4000 },     // $540 / $40
  CAD: { first_year: 74500, renewal: 6000 },     // C$745 / C$60
  GBP: { first_year: 39500, renewal: 3000 },     // £395 / £30
  AUD: { first_year: 74500, renewal: 6000 },     // A$745 / A$60
};

// Display text for the paywall.
export const PRICE_LABELS: Record<Currency, Record<Tier, string>> = {
  INR: { first_year: '₹50,000', renewal: '₹4,000' },
  USD: { first_year: '$540', renewal: '$40' },
  CAD: { first_year: 'C$745', renewal: 'C$60' },
  GBP: { first_year: '£395', renewal: '£30' },
  AUD: { first_year: 'A$745', renewal: 'A$60' },
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
