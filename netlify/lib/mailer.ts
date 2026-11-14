import { requireEnv } from './env';

/**
 * Sends a transactional email through Resend (https://resend.com).
 * Requires RESEND_API_KEY and REMINDER_FROM_EMAIL (a sender on a domain you have verified).
 */
export async function sendEmail(to: string, subject: string, text: string): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${requireEnv('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: requireEnv('REMINDER_FROM_EMAIL'),
      to: [to],
      subject,
      text,
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Email send failed (${res.status}): ${detail.slice(0, 200)}`);
  }
}
