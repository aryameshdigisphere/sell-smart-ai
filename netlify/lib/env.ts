/** Reads a required environment variable or throws a clear configuration error. */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new ConfigError(`Missing environment variable: ${name}`);
  }
  return value.trim();
}

export class ConfigError extends Error {}

export type Tier = 'first_year' | 'renewal';

function positiveInt(name: string): number {
  const n = Number(requireEnv(name));
  if (!Number.isInteger(n) || n < 100) {
    throw new ConfigError(`${name} must be an integer of at least 100 (paise).`);
  }
  return n;
}

/**
 * Pricing (amounts in paise; 1 INR = 100 paise):
 *   FIRST_YEAR_AMOUNT_PAISE  first 12-month period   (INR 50,000 = 5000000)
 *   RENEWAL_AMOUNT_PAISE     each later 12-month term (INR 4,000  = 400000)
 * Every period is SUBSCRIPTION_MONTHS long (12).
 */
export function pricing() {
  const months = Number(requireEnv('SUBSCRIPTION_MONTHS'));
  if (!Number.isInteger(months) || months < 1) {
    throw new ConfigError('SUBSCRIPTION_MONTHS must be a positive integer.');
  }
  const prices: Record<Tier, number> = {
    first_year: positiveInt('FIRST_YEAR_AMOUNT_PAISE'),
    renewal: positiveInt('RENEWAL_AMOUNT_PAISE'),
  };
  return {
    months,
    currency: (process.env.SUBSCRIPTION_CURRENCY || 'INR').toUpperCase(),
    prices,
  };
}

/** Amount expected for a tier, or null if the tier is unknown. */
export function priceFor(tier: unknown): number | null {
  if (tier !== 'first_year' && tier !== 'renewal') return null;
  return pricing().prices[tier];
}
