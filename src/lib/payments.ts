import { supabase } from './supabase';
import type { Currency } from '../../shared/pricing';

/**
 * Browser-side Razorpay Checkout. Order creation and payment verification happen
 * in Netlify Functions; the browser never sees the key secret.
 */

const CHECKOUT_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open(): void; on(event: string, cb: (r: any) => void): void };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadCheckoutScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = CHECKOUT_SCRIPT;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error('Could not load the payment window. Check your connection and try again.'));
      };
      document.body.appendChild(script);
    });
  }
  return scriptPromise;
}

async function accessToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Please sign in before subscribing.');
  return token;
}

async function postFunction(name: string, body: unknown, token: string) {
  const res = await fetch(`/.netlify/functions/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export interface CheckoutResult {
  status: 'paid' | 'pending' | 'dismissed';
  expiresAt?: string;
}

/**
 * Opens Razorpay Checkout for one subscription period.
 * Resolves when the payment is verified server-side, or when the customer closes the window.
 */
export async function startSubscriptionCheckout(
  currency: Currency,
  onProgress?: (msg: string) => void
): Promise<CheckoutResult> {
  onProgress?.('Preparing secure checkout…');
  const token = await accessToken();

  const created = await postFunction('create-order', { currency }, token);
  if (!created.ok) throw new Error(created.data?.error || 'Could not start checkout.');
  const { orderId, amount, keyId, email, months } = created.data;

  await loadCheckoutScript();

  return new Promise<CheckoutResult>((resolve, reject) => {
    const rzp = new window.Razorpay!({
      key: keyId,
      amount,
      currency,
      order_id: orderId,
      name: 'AryameshDigiSphere',
      description: `Subscription: ${months} months of access`,
      prefill: { email },
      theme: { color: '#10b981' },
      modal: {
        ondismiss: () => resolve({ status: 'dismissed' }),
      },
      handler: async (response: Record<string, string>) => {
        try {
          onProgress?.('Confirming payment…');
          const session = await accessToken();
          const verified = await postFunction('verify-payment', response, session);
          if (verified.status === 202) return resolve({ status: 'pending' });
          if (!verified.ok) throw new Error(verified.data?.error || 'Payment could not be confirmed.');
          resolve({ status: 'paid', expiresAt: verified.data.expiresAt });
        } catch (err) {
          reject(err);
        }
      },
    });

    rzp.on('payment.failed', (resp: any) => {
      reject(new Error(resp?.error?.description || 'Payment failed. No money was taken for this attempt.'));
    });
    rzp.open();
  });
}
