import { adminClient } from '../lib/supabase-admin';
import { Event, Result, json } from '../lib/http';

/**
 * Scheduled daily. Suspends every active subscription whose period has ended and
 * was not renewed. Suspension is reversed only by record_payment_and_extend,
 * which runs after a verified payment. This job never restores access.
 */
export const config = { schedule: '@daily' };

export const handler = async (_event: Event): Promise<Result> => {
  const nowIso = new Date().toISOString();
  const { data, error } = await adminClient()
    .from('subscriptions')
    .update({ status: 'suspended', updated_at: nowIso })
    .eq('status', 'active')
    .lte('current_period_end', nowIso)
    .select('user_id');

  if (error) {
    console.error('expire-subscriptions failed:', error.message);
    return json(500, { error: error.message });
  }
  console.log(`expire-subscriptions: suspended ${data?.length ?? 0} account(s)`);
  return json(200, { suspended: data?.length ?? 0 });
};
