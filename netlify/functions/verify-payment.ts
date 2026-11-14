import { Event, Result, json } from '../lib/http';
import { ConfigError, priceFor, pricing, requireEnv } from '../lib/env';
import { verifyCheckoutSignature } from '../lib/crypto';
import { fetchOrder, fetchPayment } from '../lib/razorpay';
import { recordPayment, userFromBearer } from '../lib/supabase-admin';

/**
 * POST /.netlify/functions/verify-payment
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 * Access is restored only after the signature AND the payment are checked server-side.
 */
export const handler = async (event: Event): Promise<Result> => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const user = await userFromBearer(event.headers.authorization || event.headers.Authorization);
    if (!user) return json(401, { error: 'Please sign in again.' });

    const body = JSON.parse(event.body || '{}');
    const orderId: string = body.razorpay_order_id || '';
    const paymentId: string = body.razorpay_payment_id || '';
    const signature: string = body.razorpay_signature || '';
    if (!orderId || !paymentId || !signature) {
      return json(400, { error: 'Missing payment details.' });
    }

    // 1. Signature proves the callback is genuine for this order.
    const keySecret = requireEnv('RAZORPAY_KEY_SECRET');
    if (!verifyCheckoutSignature(orderId, paymentId, signature, keySecret)) {
      return json(400, { error: 'Payment signature could not be verified.' });
    }

    // 2. The order must belong to this customer and carry a known tier at that tier's price.
    const { months, currency } = pricing();
    const order = await fetchOrder(orderId);
    if (order.notes?.user_id !== user.id) {
      return json(403, { error: 'This payment does not belong to your account.' });
    }
    const expected = priceFor(order.notes?.tier);
    if (expected === null || order.amount !== expected || order.currency !== currency) {
      return json(400, { error: 'Payment amount does not match the subscription price.' });
    }

    // 3. Ask Razorpay directly for the payment's current status.
    const payment = await fetchPayment(paymentId);
    if (payment.order_id !== orderId || payment.amount !== expected) {
      return json(400, { error: 'Payment details do not match the order.' });
    }
    if (payment.status === 'authorized') {
      // Not captured yet. Access stays suspended until the webhook sees the capture.
      return json(202, { pending: true, message: 'Payment received and is being confirmed.' });
    }
    if (payment.status !== 'captured') {
      return json(400, { error: `Payment is not successful (status: ${payment.status}).` });
    }

    const result = await recordPayment({
      userId: user.id,
      paymentId,
      orderId,
      amount: expected,
      currency,
      months,
    });
    return json(200, {
      active: true,
      alreadyProcessed: result.alreadyProcessed,
      expiresAt: result.expiresAt,
    });
  } catch (err: any) {
    if (err instanceof ConfigError) {
      console.error('verify-payment configuration error:', err.message);
      return json(500, { error: 'Payments are not configured yet. Please contact support.' });
    }
    console.error('verify-payment failed:', err);
    return json(500, { error: 'We could not confirm your payment. If you were charged, contact support with your payment ID.' });
  }
};
