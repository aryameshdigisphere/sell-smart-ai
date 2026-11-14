/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly GEMINI_API_KEY?: string;
  readonly APP_URL?: string;
  readonly VITE_PLAN_PRICE_LABEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
