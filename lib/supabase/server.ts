/** Server-side Supabase client for StudyOS.
 * Use this ONLY in Server Components, Route Handlers (app/api/**), and server actions.
 * Never import this in client-side files — it reads cookies via next/headers which is
 * unavailable in the browser. */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Creates a server-side Supabase client with cookie-aware session handling.
 * Must be called inside an async server context (Route Handler, Server Component, etc.). */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // setAll is called from Server Components where cookies cannot be set.
          // This is safe to ignore — the middleware will refresh the session.
        }
      },
    },
  });
}
