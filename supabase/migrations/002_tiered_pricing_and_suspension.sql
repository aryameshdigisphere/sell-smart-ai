-- Pricing and lifecycle update.
--   First 12 months: INR 50,000. Each later 12-month renewal: INR 4,000 (chosen in the app).
--   Access is measured in months. Expired accounts are marked 'suspended' by a daily job.
--   Only a verified payment (RPC below) can set status back to 'active'.

alter table public.subscriptions
  add column if not exists reminder_sent_for timestamptz;  -- period end we last reminded about

-- Replace the 30-day version from 001 with a months-based version.
drop function if exists public.record_payment_and_extend(uuid, text, text, integer, text, integer);

create or replace function public.record_payment_and_extend(
  p_user_id    uuid,
  p_payment_id text,
  p_order_id   text,
  p_amount     integer,
  p_currency   text,
  p_months     integer
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
    select s.current_period_end into v_current
      from public.subscriptions s where s.user_id = p_user_id;
    return query select true, v_current;
    return;
  end if;

  select s.current_period_end into v_current
    from public.subscriptions s where s.user_id = p_user_id for update;

  -- Early renewal stacks on remaining time. After suspension or expiry, the period starts now.
  v_new := greatest(now(), coalesce(v_current, now())) + make_interval(months => p_months);

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

revoke all on function public.record_payment_and_extend(uuid, text, text, integer, text, integer) from public, anon, authenticated;
grant execute on function public.record_payment_and_extend(uuid, text, text, integer, text, integer) to service_role;
