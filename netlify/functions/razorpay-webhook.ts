import { Event, Result, header, json, rawBody } from '../lib/http';
import { ConfigError, priceFor, pricing, requireEnv } from '../lib/env';
import { verifyWebhookSignature } from '../lib/crypto';
import { fetchOrder } from '../lib/razorpay';
import { recordPayment } from '../lib/supabase-admin';

/**
 * POST /.netlify/functions/razorpay-webhook
 * Razorpay Dashboard -> Webhooks, event: payment.captured.
 * Restores access if the browser closed before verify-payment ran. Idempotent by payment id.
 */
export const handler = async (event: Event): Promise<Result> => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const secret = requireEnv('RAZORPAY_WEBHOOK_SECRET');
    const signature = header(event, 'x-razorpay-signature') || '';
    const body = rawBody(event);

    if (!signature || !verifyWebhookSignature(body, signature, secret)) {
      return json(400, { error: 'Invalid webhook signature.' });
    }

    const payload = JSON.parse(body);
    if (payload.event !== 'payment.captured') {
      return json(200, { ignored: true, event: payload.event });
    }

    const payment = payload.payload?.payment?.entity;
    if (!payment?.id || !payment?.order_id) {
      return json(400, { error: 'Malformed payment event.' });
    }

    // Trust the order we created, not the webhook body alone.
    const { months, currency } = pricing();
    const order = await fetchOrder(payment.order_id);
    const userId = order.notes?.user_id;
    const expected = priceFor(order.notes?.tier);
    if (!userId || expected === null || order.amount !== expected || payment.amount !== expected || order.currency !== currency) {
      console.error('Webhook payment rejected: order/amount mismatch', payment.id);
      return json(400, { error: 'Order does not match subscription.' });
    }

    const result = await recordPayment({
      userId,
      paymentId: payment.id,
      orderId: payment.order_id,
      amount: expected,
      currency,
      months,
    });
    return json(200, { ok: true, alreadyProcessed: result.alreadyProcessed });
  } catch (err: any) {
    if (err instanceof ConfigError) {
      console.error('webhook configuration error:', err.message);
      return json(500, { error: 'Webhook not configured.' });
    }
    // 500 makes Razorpay retry the event, so transient failures are not lost.
    console.error('webhook processing failed:', err);
    return json(500, { error: 'Processing failed; Razorpay will retry.' });
  }
};
