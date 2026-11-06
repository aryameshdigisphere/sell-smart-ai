import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase client configuration for SELL SMART AI.
 * 
 * Safely reads environment variables via Vite's `import.meta.env`.
 * Only the public project URL and publishable (anon) API key are exposed to the browser.
 * Never expose the Supabase service-role key or database passwords here.
 */

const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL || '';
const supabasePublishableKey: string = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

/**
 * Checks if Supabase credentials are configured with live project values
 * (i.e. not empty and not the placeholder strings).
 */
export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
  supabasePublishableKey &&
  supabaseUrl.trim().length > 0 &&
  supabasePublishableKey.trim().length > 0 &&
  !supabaseUrl.includes('your-project-id') &&
  supabasePublishableKey !== 'your-supabase-publishable-key'
);

/**
 * The initialized Supabase client instance.
 * Uses a safe fallback endpoint if credentials are not yet supplied in .env.local,
 * preventing uncaught exceptions during client bundle initialization.
 */
export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder-project.supabase.co',
  isSupabaseConfigured ? supabasePublishableKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
