# SELL SMART AI: Subscriptions, Razorpay, and Netlify

## Plan and rules

Prices are in `shared/pricing.ts`. Customers choose INR, USD, CAD, GBP, or AUD on the paywall. The old price variables (`FIRST_YEAR_AMOUNT_PAISE`, `RENEWAL_AMOUNT_PAISE`, `SUBSCRIPTION_CURRENCY`, `SUBSCRIPTION_MONTHS`, `VITE_PLAN_PRICE_LABEL`) are no longer read and can be deleted in Netlify.

International payments must be enabled on your Razorpay account for each currency before customers can pay in it.

| Rule | Behaviour |
|---|---|
| First 12 months | INR 50,000, one payment |
| Each later 12 months | INR 4,000, one payment per term |
| Renewal | Manual only. The customer pays again in the app. |
| Reminder | Banner in the app from 30 days before expiry, plus one email per billing period |
| Expiry without payment | A daily job sets the account to `suspended`. The dashboard locks. |
| Restore | Only after a verified, captured Razorpay payment. Restoring starts a new 12-month period from the payment date. |

Early renewal adds 12 months to the current end date, so no paid time is lost.
Data stays in the browser and is never deleted by suspension.

## What was added

| Path | Purpose |
|---|---|
| `supabase/migrations/001_subscriptions.sql` | Tables, RLS, payment ledger |
| `supabase/migrations/002_tiered_pricing_and_suspension.sql` | 12-month periods, reminder tracking, restore-only-via-payment function |
| `netlify/functions/create-order.ts` | Chooses first-year or renewal price from payment history; creates the Razorpay order |
| `netlify/functions/verify-payment.ts` | Verifies signature, order owner, tier price, and captured payment; then restores access |
| `netlify/functions/razorpay-webhook.ts` | Restores access on `payment.captured` if the browser never confirmed |
| `netlify/functions/expire-subscriptions.ts` | Daily: suspends lapsed accounts (never restores) |
| `netlify/functions/subscription-reminders.ts` | Daily: 30-day reminder email, once per period |
| `netlify/lib/*` | Signatures, pricing, Razorpay and Supabase clients, mailer |
| `src/lib/payments.ts`, `src/components/SubscriptionGate.tsx` | Checkout and the access gate |

## 1. Supabase

1. SQL Editor: run `001_subscriptions.sql`, then `002_tiered_pricing_and_suspension.sql`. Run them in order.
2. Authentication > Providers > Email: decide whether email confirmation is required.
3. Project Settings > API: copy the URL, the publishable key, and the **service_role** key. The service_role key goes only in Netlify.

## 2. Razorpay

1. Settings > API Keys: generate keys. Start in test mode.
2. Webhooks (location varies by dashboard version): add `https://<your-site>/.netlify/functions/razorpay-webhook`, event `payment.captured`, with a secret you choose.
3. Confirm auto-capture is on, so payments are captured without a separate step.

## 3. Resend (reminder emails)

1. Create an API key and verify the sending domain.
2. Set `RESEND_API_KEY` and `REMINDER_FROM_EMAIL`. Without them the reminder job fails and logs the error, and no reminders are marked as sent, so the job retries the next day.

## 4. Netlify environment variables

| Variable | Scope | Notes |
|---|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` | Browser | |
| `VITE_PLAN_PRICE_LABEL` | Browser | Paywall text |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | Server | |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Server | |
| `FIRST_YEAR_AMOUNT_PAISE` | Server | `5000000` |
| `RENEWAL_AMOUNT_PAISE` | Server | `400000` |
| `SUBSCRIPTION_MONTHS` | Server | `12` |
| `SUBSCRIPTION_CURRENCY` | Server | `INR` |
| `RESEND_API_KEY`, `REMINDER_FROM_EMAIL` | Server | |

Trigger a new deploy after changing any variable.

## 5. Deploy

Connect the repo in Netlify. Build settings come from `netlify.toml`.
Scheduled functions run daily. Check that your Netlify plan includes scheduled functions.

## 6. Test (test mode)

1. New account: the paywall shows the first-year price. Pay. Check `subscriptions` (about 12 months out, status `active`) and `payments` (one row, amount 5000000).
2. Renewal: sign in as a paid customer. The banner appears in the final 30 days. Pay the renewal price. The new end date should be 12 months after the old one. Check that `payments` now shows 400000 for that row.
3. Suspension: in Supabase, set `current_period_end` to a past time for a test user. Trigger `expire-subscriptions` from Netlify (Functions > Scheduled). Status becomes `suspended`, and the dashboard locks.
4. Restore: pay again while suspended. Status returns to `active` with a new 12-month period from today. Restoring without a payment is not possible: the job only suspends.
5. Reminder: set `current_period_end` to 20 days from now for a test user, trigger `subscription-reminders`, and confirm one email. Trigger it again and confirm no second email. `reminder_sent_for` should match `current_period_end`.
6. Webhook: send a test `payment.captured` event from Razorpay. Expect `200` in function logs.

Use `netlify dev` to run functions locally. Plain `npm run dev` does not serve `/.netlify/functions/*`.

## Going live

Complete Razorpay KYC, switch to live keys, create a live-mode webhook with its own secret, and redeploy.

## Known limits

- **Manual renewal only.** Razorpay Subscriptions (autopay) would charge automatically; that is a separate change.
- **Price changes** take effect through the env vars. Existing end dates are not changed.
- **Gemini content route.** `/api/generate-copy` runs only in `server.ts`, not on Netlify, so it is not yet gated or live.
- **Browser-side gate.** The dashboard check runs in the browser. Server-side paid features need their own subscription check before they go live.
