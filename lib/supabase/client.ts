/** Browser-side Supabase client for StudyOS.
 * Use this in Client Components ("use client") and browser-side hooks.
 * The @supabase/ssr createBrowserClient handles cookie-based session management
 * so auth state stays in sync with server-side middleware and API routes. */

import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail loudly at module load time so the developer sees a clear message.
  if (typeof window !== "undefined") {
    console.error(
      "[StudyOS] Supabase env vars missing! " +
        "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    );
  }
}

/** Singleton browser Supabase client.
 * Call this anywhere in client-side code to get an auth-aware client. */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
