import { adminClient } from '../lib/supabase-admin';
import { sendEmail } from '../lib/mailer';
import { Event, Result, json } from '../lib/http';

/**
 * Scheduled daily. Emails each customer whose access ends within 30 days.
 * Sends at most one reminder per billing period (tracked in reminder_sent_for).
 */
export const config = { schedule: '@daily' };

const REMINDER_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export const handler = async (_event: Event): Promise<Result> => {
  const now = Date.now();
  const windowEnd = new Date(now + REMINDER_WINDOW_MS).toISOString();
  const db = adminClient();

  const { data: rows, error } = await db
    .from('subscriptions')
    .select('user_id, current_period_end, reminder_sent_for')
    .eq('status', 'active')
    .gt('current_period_end', new Date(now).toISOString())
    .lte('current_period_end', windowEnd);
  if (error) {
    console.error('subscription-reminders query failed:', error.message);
    return json(500, { error: error.message });
  }

  const due = (rows ?? []).filter((r) => r.reminder_sent_for !== r.current_period_end);
  let sent = 0;
  const failures: string[] = [];

  for (const row of due) {
    try {
      const { data: userData, error: userErr } = await db.auth.admin.getUserById(row.user_id);
      const email = userData?.user?.email;
      if (userErr || !email) throw new Error(userErr?.message || 'no email on account');

      const endsOn = new Date(row.current_period_end).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
      });
      await sendEmail(
        email,
        'Your SELL SMART AI access ends in 30 days',
        `Hi,\n\nYour SELL SMART AI access ends on ${endsOn}.\n\n` +
          `To keep access, renew from the app before that date. Renewals are paid manually. ` +
          `If the subscription ends unpaid, your access is suspended until you renew.\n\n` +
          `Your data is stored in your browser and is not deleted when access is suspended.\n\n` +
          `— AryameshDigiSphere\nSupport: support@aryameshdigisphere.online`,
      );

      await db
        .from('subscriptions')
        .update({ reminder_sent_for: row.current_period_end })
        .eq('user_id', row.user_id);
      sent++;
    } catch (err: any) {
      console.error('reminder failed for', row.user_id, err?.message);
      failures.push(row.user_id);
    }
  }

  console.log(`subscription-reminders: sent ${sent}, failed ${failures.length}, candidates ${due.length}`);
  // Non-2xx lets Netlify surface the failure in logs; successful reminders are already recorded.
  return json(failures.length ? 500 : 200, { sent, failed: failures.length });
};
