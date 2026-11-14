import { requireEnv } from './env';

const API = 'https://api.razorpay.com/v1';

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface RazorpayPayment {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
  notes?: Record<string, string>;
}

async function call<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
  const keyId = requireEnv('RAZORPAY_KEY_ID');
  const keySecret = requireEnv('RAZORPAY_KEY_SECRET');
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64'),
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data: any = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.description || `Razorpay request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}

export function createOrder(params: {
  amount: number;
  currency: string;
  receipt: string;
  notes: Record<string, string>;
}): Promise<RazorpayOrder> {
  return call<RazorpayOrder>('POST', '/orders', params);
}

export function fetchOrder(orderId: string): Promise<RazorpayOrder> {
  return call<RazorpayOrder>('GET', `/orders/${encodeURIComponent(orderId)}`);
}

export function fetchPayment(paymentId: string): Promise<RazorpayPayment> {
  return call<RazorpayPayment>('GET', `/payments/${encodeURIComponent(paymentId)}`);
}
