import { Event, Result, json } from '../lib/http';
import { createOrder } from '../lib/razorpay';
import { ConfigError, requireEnv } from '../lib/env';
import { paymentCount, userFromBearer } from '../lib/supabase-admin';
import { PRICES, SUBSCRIPTION_MONTHS, Tier, isCurrency } from '../../shared/pricing';

/**
 * POST /.netlify/functions/create-order
 * Body: { currency?: 'INR' | 'USD' | 'CAD' | 'GBP' | 'AUD' }  (defaults to INR)
 * Requires: Authorization: Bearer <supabase access token>
 * The price is decided here from the currency and the customer's payment history.
 */
export const handler = async (event: Event): Promise<Result> => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const user = await userFromBearer(event.headers.authorization || event.headers.Authorization);
    if (!user) return json(401, { error: 'Please sign in before subscribing.' });

    const body = JSON.parse(event.body || '{}');
    const currency = body.currency ?? 'INR';
    if (!isCurrency(currency)) return json(400, { error: 'Unsupported currency.' });

    const tier: Tier = (await paymentCount(user.id)) === 0 ? 'first_year' : 'renewal';
    const amount = PRICES[currency][tier];

    const order = await createOrder({
      amount,
      currency,
      // Receipt must be 40 characters or fewer.
      receipt: `ss_${user.id.replace(/-/g, '').slice(0, 16)}_${Date.now()}`.slice(0, 40),
      notes: { user_id: user.id, purpose: 'subscription', tier, currency, months: String(SUBSCRIPTION_MONTHS) },
    });

    return json(200, {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: requireEnv('RAZORPAY_KEY_ID'),
      tier,
      months: SUBSCRIPTION_MONTHS,
      email: user.email ?? '',
    });
  } catch (err: any) {
    if (err instanceof ConfigError) {
      console.error('create-order configuration error:', err.message);
      return json(500, { error: 'Payments are not configured yet. Please contact support.' });
    }
    console.error('create-order failed:', err);
    return json(502, { error: err?.message || 'Could not start checkout. Please try again.' });
  }
};
