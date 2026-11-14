import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { requireEnv } from './env';

/**
 * Server-only Supabase client using the service role key.
 * This key bypasses RLS, so it must only ever live in Netlify environment variables.
 */
let cached: SupabaseClient | null = null;

export function adminClient(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL?.trim() || requireEnv('VITE_SUPABASE_URL');
  cached = createClient(url, requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

/** Resolves the calling customer from their Supabase access token. */
export async function userFromBearer(authHeader: string | undefined) {
  const token = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return null;
  const { data, error } = await adminClient().auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

/** Number of captured payments this customer has ever made. Zero means first-year pricing applies. */
export async function paymentCount(userId: string): Promise<number> {
  const { count, error } = await adminClient()
    .from('payments')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (error) throw new Error(`Database error: ${error.message}`);
  return count ?? 0;
}

/**
 * Applies a verified payment. This is the only code path that sets status back to 'active'.
 * Idempotent by payment id.
 */
export async function recordPayment(args: {
  userId: string;
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  months: number;
}): Promise<{ alreadyProcessed: boolean; expiresAt: string }> {
  const { data, error } = await adminClient().rpc('record_payment_and_extend', {
    p_user_id: args.userId,
    p_payment_id: args.paymentId,
    p_order_id: args.orderId,
    p_amount: args.amount,
    p_currency: args.currency,
    p_months: args.months,
  });
  if (error) throw new Error(`Database error: ${error.message}`);
  const row = Array.isArray(data) ? data[0] : data;
  return { alreadyProcessed: Boolean(row?.already_processed), expiresAt: row?.expires_at };
}
