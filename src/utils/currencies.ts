import { Currency, CurrencyConfig } from '../types';

export const CURRENCIES: Record<Currency, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    rate: 1.0,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    rate: 0.79,
  },
  CAD: {
    code: 'CAD',
    symbol: 'CA$',
    name: 'Canadian Dollar',
    rate: 1.38,
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    rate: 1.54,
  },
};

/**
 * Format a number amount into localized currency display.
 * @param amountInUSD Amount stored internally in base USD
 * @param targetCurrency The user-selected currency to display
 * @param convert Whether to apply currency exchange rate (defaults to true)
 */
export function formatCurrency(
  amountInUSD: number,
  targetCurrency: Currency = 'USD',
  convert: boolean = true
): string {
  const currencyInfo = CURRENCIES[targetCurrency] || CURRENCIES.USD;
  const value = convert ? amountInUSD * currencyInfo.rate : amountInUSD;

  // Format with commas and 2 decimals
  const formattedNumber = Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const sign = value < 0 ? '-' : '';
  return `${sign}${currencyInfo.symbol}${formattedNumber}`;
}

/**
 * Convert user input in selected currency back to base USD for storage
 */
export function convertToUSD(amountInCurrency: number, currentCurrency: Currency): number {
  const currencyInfo = CURRENCIES[currentCurrency] || CURRENCIES.USD;
  return amountInCurrency / currencyInfo.rate;
}

/**
 * Convert base USD to user's selected currency
 */
export function convertFromUSD(amountInUSD: number, targetCurrency: Currency): number {
  const currencyInfo = CURRENCIES[targetCurrency] || CURRENCIES.USD;
  return amountInUSD * currencyInfo.rate;
}
