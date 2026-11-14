-- SELL SMART AI: subscription access + Razorpay payment ledger.
-- Run once in the Supabase SQL editor (or via `supabase db push`).

-- One row per customer. current_period_end is the single source of truth for access.
create table if not exists public.subscriptions (
  user_id            uuid primary key references auth.users (id) on delete cascade,
  status             text not null default 'active',
  current_period_end timestamptz not null,
  last_payment_id    text,
  updated_at         timestamptz not null default now()
);

-- Append-only ledger of captured Razorpay payments. The unique payment id makes
-- processing idempotent: verify-payment and the webhook can both fire safely.
create table if not exists public.payments (
  id                 bigint generated always as identity primary key,
  razorpay_payment_id text not null unique,
  razorpay_order_id   text not null,
  user_id            uuid not null references auth.users (id) on delete cascade,
  amount             integer not null,
  currency           text not null,
  created_at         timestamptz not null default now()
);

-- Row Level Security: customers may read only their own subscription row.
-- Nobody but the service role writes; payments are not readable from the browser.
alter table public.subscriptions enable row level security;
alter table public.payments      enable row level security;

drop policy if exists "read own subscription" on public.subscriptions;
create policy "read own subscription"
  on public.subscriptions for select
  to authenticated
  using (auth.uid() = user_id);

-- Records a captured payment and extends access atomically.
-- Renewal stacks on top of remaining time: a payment made 5 days before expiry
-- adds 30 days to that date, not to today, so early renewals are not lost.
create or replace function public.record_payment_and_extend(
  p_user_id    uuid,
  p_payment_id text,
  p_order_id   text,
  p_amount     integer,
  p_currency   text,
  p_days       integer
)
returns table (already_processed boolean, expires_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current timestamptz;
  v_new     timestamptz;
begin
  insert into public.payments (razorpay_payment_id, razorpay_order_id, user_id, amount, currency)
  values (p_payment_id, p_order_id, p_user_id, p_amount, p_currency)
  on conflict (razorpay_payment_id) do nothing;

  if not found then
    -- Payment was already applied (e.g. webhook arrived before the browser callback).
    select s.current_period_end into v_current
      from public.subscriptions s where s.user_id = p_user_id;
    return query select true, v_current;
    return;
  end if;

  select s.current_period_end into v_current
    from public.subscriptions s where s.user_id = p_user_id for update;

  v_new := greatest(now(), coalesce(v_current, now())) + make_interval(days => p_days);

  insert into public.subscriptions (user_id, status, current_period_end, last_payment_id, updated_at)
  values (p_user_id, 'active', v_new, p_payment_id, now())
  on conflict (user_id) do update
    set status = 'active',
        current_period_end = excluded.current_period_end,
        last_payment_id = excluded.last_payment_id,
        updated_at = now();

  return query select false, v_new;
end;
$$;

-- Only the backend (service role) may extend access.
revoke all on function public.record_payment_and_extend(uuid, text, text, integer, text, integer) from public, anon, authenticated;
grant execute on function public.record_payment_and_extend(uuid, text, text, integer, text, integer) to service_role;
