/** Auth helpers for StudyOS — wraps Supabase session utilities.
 * These are BROWSER-SIDE helpers (safe to import in client components). */
"use client";

import { createClient } from "../supabase/client";

export type AuthUser = {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
};

/** Signs in with Google OAuth via Supabase.
 * Redirects the user to Google, then back to /auth/callback?next=<redirect>. */
export async function signInWithGoogle(redirectTo = "/app/onboarding") {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      queryParams: {
        // Request the user's name and avatar from Google.
        access_type: "offline",
        prompt: "select_account",
      },
    },
  });
  if (error) throw error;
}

/** Signs out the current user and clears the Supabase session. */
export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/** Returns the current session user, or null if not signed in. */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return {
    id: user.id,
    email: user.email ?? null,
    name:
      (user.user_metadata?.full_name as string | undefined) ??
      (user.user_metadata?.name as string | undefined) ??
      null,
    avatarUrl:
      (user.user_metadata?.avatar_url as string | undefined) ??
      (user.user_metadata?.picture as string | undefined) ??
      null,
  };
}

/** React hook — subscribe to auth state changes.
 * Returns { user, loading } where user is null when signed out. */
import { useEffect, useState } from "react";

export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (u) {
        setUser({
          id: u.id,
          email: u.email ?? null,
          name:
            (u.user_metadata?.full_name as string | undefined) ??
            (u.user_metadata?.name as string | undefined) ??
            null,
          avatarUrl:
            (u.user_metadata?.avatar_url as string | undefined) ??
            (u.user_metadata?.picture as string | undefined) ??
            null,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      if (u) {
        setUser({
          id: u.id,
          email: u.email ?? null,
          name:
            (u.user_metadata?.full_name as string | undefined) ??
            (u.user_metadata?.name as string | undefined) ??
            null,
          avatarUrl:
            (u.user_metadata?.avatar_url as string | undefined) ??
            (u.user_metadata?.picture as string | undefined) ??
            null,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}
