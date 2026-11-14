import React, { useEffect, useState } from 'react';
import { Lock, Loader2, CalendarClock, LogOut } from 'lucide-react';
import { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { startSubscriptionCheckout } from '../lib/payments';

const RENEWAL_WARNING_DAYS = 30;
// Shown on the paywall, e.g. "₹50,000 for the first 12 months · ₹4,000 per 12 months after".
const PLAN_PRICE_LABEL = import.meta.env.VITE_PLAN_PRICE_LABEL || '';

interface GateProps {
  children: React.ReactNode;
}

type Access =
  | { state: 'loading' }
  | { state: 'active'; expiresAt: Date }
  | { state: 'suspended'; expiresAt: Date | null };

/**
 * Blocks the dashboard until the signed-in customer has an unexpired subscription.
 * The browser check is for user experience. Access to paid server functions is
 * enforced in Netlify Functions and Supabase RLS, not by this component.
 */
export const SubscriptionGate: React.FC<GateProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [access, setAccess] = useState<Access>({ state: 'loading' });
  const [now, setNow] = useState(() => Date.now());

  // Track the session.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Re-read the subscription when the session changes.
  const loadAccess = async (userId: string) => {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('status, current_period_end')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) {
      console.error('Could not read subscription:', error.message);
      setAccess({ state: 'suspended', expiresAt: null });
      return;
    }
    if (!data) return setAccess({ state: 'suspended', expiresAt: null });
    const expiresAt = new Date(data.current_period_end);
    // Access requires both an active status and an unexpired period.
    const isActive = data.status === 'active' && expiresAt.getTime() > Date.now();
    setAccess(isActive ? { state: 'active', expiresAt } : { state: 'suspended', expiresAt });
  };

  useEffect(() => {
    if (session === undefined) return;
    if (!session) return setAccess({ state: 'loading' });
    setAccess({ state: 'loading' });
    loadAccess(session.user.id);
  }, [session]);

  // Keep the expiry check fresh while the app stays open.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  // Local development without Supabase keys: skip the gate. Production never does.
  if (!isSupabaseConfigured) {
    if (import.meta.env.DEV) return <>{children}</>;
    return (
      <Shell>
        <p className="text-sm text-rose-300">Billing is not configured on this deployment. Add the Supabase variables and redeploy.</p>
      </Shell>
    );
  }

  if (session === undefined) {
    return <Shell><Loader2 className="h-6 w-6 animate-spin text-emerald-400 mx-auto" /></Shell>;
  }

  if (!session) return <Shell><LoginForm /></Shell>;

  if (access.state === 'loading') {
    return <Shell><Loader2 className="h-6 w-6 animate-spin text-emerald-400 mx-auto" /></Shell>;
  }

  const active = access.state === 'active' && access.expiresAt.getTime() > now;
  if (active) {
    const msLeft = access.expiresAt.getTime() - now;
    const daysLeft = Math.ceil(msLeft / 86_400_000);
    return (
      <>
        {daysLeft <= RENEWAL_WARNING_DAYS && (
          <RenewalBanner expiresAt={access.expiresAt} daysLeft={daysLeft} onRenewed={() => loadAccess(session.user.id)} />
        )}
        {children}
      </>
    );
  }

  return (
    <Shell>
      <Paywall
        email={session.user.email ?? ''}
        expiredAt={access.expiresAt}
        onPaid={() => loadAccess(session.user.id)}
      />
    </Shell>
  );
};

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="text-center mb-5">
        <span className="font-extrabold text-lg tracking-tight">SELL SMART</span>
        <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">AI</span>
      </div>
      {children}
    </div>
  </div>
);

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) throw error;
        if (!data.session) setInfo('Check your email to confirm your account, then sign in.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'Sign-in failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <h2 className="text-base font-semibold text-center">{isSignUp ? 'Create your account' : 'Sign in to continue'}</h2>
      <input
        type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <input
        type="password" required minLength={6} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      {error && <p className="text-xs text-rose-400">{error}</p>}
      {info && <p className="text-xs text-emerald-400">{info}</p>}
      <button type="submit" disabled={busy}
        className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm disabled:opacity-60">
        {busy ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
      </button>
      <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="w-full text-xs text-slate-400 hover:text-slate-200 underline">
        {isSignUp ? 'Already have an account? Sign in' : 'New here? Create an account'}
      </button>
    </form>
  );
};

const Paywall: React.FC<{ email: string; expiredAt: Date | null; onPaid: () => void }> = ({ email, expiredAt, onPaid }) => {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  const pay = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const result = await startSubscriptionCheckout((msg) => setMessage({ text: msg, error: false }));
      if (result.status === 'paid') {
        setMessage({ text: 'Payment confirmed. Welcome back!', error: false });
        onPaid();
      } else if (result.status === 'pending') {
        setMessage({ text: 'Payment received and being confirmed. This page will update shortly.', error: false });
        setTimeout(onPaid, 5000);
      } else {
        setMessage(null);
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Payment failed.', error: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4 text-center">
      <Lock className="h-8 w-8 text-emerald-400 mx-auto" />
      <h2 className="text-base font-semibold">{expiredAt ? 'Access suspended' : 'Subscribe to unlock the dashboard'}</h2>
      <p className="text-xs text-slate-400">
        {expiredAt
          ? `Your subscription ended on ${expiredAt.toLocaleDateString()} and was not renewed, so access is suspended. Renew to restore it. Your data stays on this device.`
          : 'One payment unlocks full access for 12 months.'}
      </p>
      {PLAN_PRICE_LABEL && <p className="text-lg font-bold text-slate-100">{PLAN_PRICE_LABEL}</p>}
      <button onClick={pay} disabled={busy}
        className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm disabled:opacity-60">
        {busy ? 'Working…' : expiredAt ? 'Renew access' : 'Subscribe now'}
      </button>
      {message && <p className={`text-xs ${message.error ? 'text-rose-400' : 'text-slate-300'}`}>{message.text}</p>}
      <button onClick={() => supabase.auth.signOut()} className="text-xs text-slate-500 hover:text-slate-300 inline-flex items-center gap-1">
        <LogOut className="h-3 w-3" /> Sign out ({email})
      </button>
    </div>
  );
};

const RenewalBanner: React.FC<{ expiresAt: Date; daysLeft: number; onRenewed: () => void }> = ({ expiresAt, daysLeft, onRenewed }) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const renew = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await startSubscriptionCheckout();
      if (result.status === 'paid') onRenewed();
    } catch (err: any) {
      setError(err.message || 'Renewal failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-200 text-xs">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2">
          <CalendarClock className="h-3.5 w-3.5" />
          {daysLeft <= 1 ? 'Your access ends today' : `${daysLeft} days left`} (until {expiresAt.toLocaleDateString()}). Renewals are manual.
          {error && <span className="text-rose-300 ml-2">{error}</span>}
        </span>
        <button onClick={renew} disabled={busy} className="px-3 py-1 rounded bg-amber-400 text-slate-950 font-semibold disabled:opacity-60">
          {busy ? 'Working…' : 'Renew now'}
        </button>
      </div>
    </div>
  );
};
