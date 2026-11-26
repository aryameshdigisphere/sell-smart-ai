import { adminClient, userFromBearer } from '../lib/supabase-admin';
import { Event, Result, json } from '../lib/http';

const TRIAL_DAYS = 15;

export const handler = async (event: Event): Promise<Result> => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  const user = await userFromBearer(event.headers.authorization);
  if (!user) return json(401, { error: 'Please sign in first.' });

  const db = adminClient();

  // One trial per account: any existing subscription row blocks a new trial.
  const { data: existing, error: readError } = await db
    .from('subscriptions')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (readError) return json(500, { error: readError.message });
  if (existing) {
    return json(409, { error: 'This account has already used its free trial or a subscription.' });
  }

  const now = new Date();
  const end = new Date(now.getTime() + TRIAL_DAYS * 86_400_000);
  const { error } = await db.from('subscriptions').insert({
    user_id: user.id,
    status: 'trial',
    current_period_end: end.toISOString(),
    updated_at: now.toISOString(),
  });
  if (error) return json(500, { error: error.message });

  return json(200, { status: 'trial', expiresAt: end.toISOString() });
};