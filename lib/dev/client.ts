"use client";

import { createClient } from "../supabase/client";

/** Authenticated fetch wrapper for Developer God Mode.
 * Attaches the Supabase JWT bearer token so developer APIs are authorized. */
export async function devFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(init.headers || {});

  try {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${session.access_token}`);
    }
  } catch {
    // Ignore in offline or degraded network environments
  }

  return fetch(input, {
    ...init,
    headers,
    credentials: "include",
  });
}
