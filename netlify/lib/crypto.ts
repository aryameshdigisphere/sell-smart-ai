import { createHmac, timingSafeEqual } from 'crypto';

/** Constant-time comparison of two hex/utf8 strings. */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/**
 * Checkout signature: HMAC-SHA256(order_id + "|" + payment_id, key_secret).
 * Proves the browser callback came from Razorpay for this order.
 */
export function verifyCheckoutSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  keySecret: string
): boolean {
  const expected = createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return safeEqual(expected, signature);
}

/**
 * Webhook signature: HMAC-SHA256 of the exact raw request body,
 * keyed with the webhook secret you set in the Razorpay dashboard.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  webhookSecret: string
): boolean {
  const expected = createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
  return safeEqual(expected, signature);
}
