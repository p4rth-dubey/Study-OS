/** /auth/callback — Supabase OAuth callback route handler.
 * After Google redirects the user back here, Supabase exchanges the code for a
 * session and sets the auth cookies. Then we redirect to the intended page
 * (defaults to /app/onboarding for new users, /app/dashboard for returning ones). */

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "../../../lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/app/dashboard";

  if (!code) {
    // No code in the URL — something went wrong with the OAuth flow.
    return NextResponse.redirect(`${origin}/app/onboarding?error=oauth_failed`);
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[StudyOS] Auth callback error:", error.message);
    return NextResponse.redirect(
      `${origin}/app/onboarding?error=${encodeURIComponent(error.message)}`
    );
  }

  // Successfully signed in — redirect to the originally intended page.
  return NextResponse.redirect(`${origin}${next}`);
}
