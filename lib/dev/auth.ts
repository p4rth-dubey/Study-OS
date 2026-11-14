/** Server-Side Developer Authorization & Session Utilities.
 * Enforces secure developer verification without relying on client-side state.
 * Supports Supabase session matching, environment-based developer IDs, and
 * fallback authorization for local engineering environments. */

import type { NextRequest } from "next/server";
import type { DeveloperSession } from "./types";

const DEFAULT_DEVELOPER_EMAILS = [
  "parthveerdubey6167@gmail.com",
  "anshgamerz1212@gmail.com",
];
const FOUNDER_EMAIL = "parthveerdubey6167@gmail.com";
const FOUNDER_DEVELOPER_ID = "p4rth";

// Master developer key from the server environment (never exposed to the browser).
const MASTER_DEV_KEY = process.env.STUDYOS_DEV_KEY;

// Configured developer IDs or emails from environment
const rawEnvEmails = process.env.DEVELOPER_EMAILS || "";
export const AUTHORIZED_DEVELOPER_EMAILS = Array.from(
  new Set(
    [
      ...rawEnvEmails.split(","),
      ...DEFAULT_DEVELOPER_EMAILS,
      ...FOUNDER_EMAIL.split(","),
    ]
      .map((e) => e.replace(/^["']|["']$/g, "").trim().toLowerCase())
      .filter(Boolean)
  )
);

export const AUTHORIZED_DEVELOPER_IDS = (process.env.DEVELOPER_ACCOUNT_IDS || "")
  .split(",")
  .map((id) => id.replace(/^["']|["']$/g, "").trim())
  .filter(Boolean);

/** Helper to check whether an email is registered as an authorized developer. */
export function isAuthorizedDeveloperEmail(email?: string | null): boolean {
  if (!email) return false;
  return AUTHORIZED_DEVELOPER_EMAILS.includes(email.trim().toLowerCase());
}

/** Verifies whether an incoming server request or context is from an authorized developer. */
export async function verifyDeveloperAccess(
  req?: NextRequest
): Promise<DeveloperSession> {
  const timestamp = new Date().toISOString();

  // 1. Check HTTP Header authorization (for CLI / script / secret master key)
  if (req) {
    const headerKey = req.headers.get("x-studyos-dev-key");
    const authHeader = req.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

    if (
      (MASTER_DEV_KEY && headerKey === MASTER_DEV_KEY) ||
      (MASTER_DEV_KEY && bearerToken === MASTER_DEV_KEY)
    ) {
      try {
        const { recordAuditLog } = await import("./audit");
        recordAuditLog("dev_master_key", "FOUNDER", "DEV_AUTH_SUCCESS", "x-studyos-dev-key", "success");
      } catch {}
      return {
        authorized: true,
        role: "FOUNDER",
        developerId: FOUNDER_DEVELOPER_ID,
        email: FOUNDER_EMAIL,
        name: "StudyOS Founder",
        method: "master_key",
        timestamp,
      };
    }

    // Check secure developer cookie
    const devCookie = req.cookies.get("studyos_dev_session");
    if (MASTER_DEV_KEY && devCookie && devCookie.value === MASTER_DEV_KEY) {
      return {
        authorized: true,
        role: "FOUNDER",
        developerId: "dev_founder_cookie",
        email: FOUNDER_EMAIL,
        name: "StudyOS Founder",
        method: "master_key",
        timestamp,
      };
    }
  }

  // 2. Check Supabase Server Session (via cookies or Bearer access token)
  try {
    const authHeader = req?.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

    const { createServerSupabaseClient } = await import("../supabase/server");
    const supabase = await createServerSupabaseClient();

    let user = null;

    // Verify JWT bearer token if present
    if (bearerToken && bearerToken !== MASTER_DEV_KEY) {
      const { data, error } = await supabase.auth.getUser(bearerToken);
      if (!error && data?.user) {
        user = data.user;
      }
    }

    // Fall back to server cookie session
    if (!user) {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        user = data.user;
      }
    }

    if (user) {
      const email = user.email?.trim().toLowerCase();
      const userId = user.id;

      const isListedEmail = email && AUTHORIZED_DEVELOPER_EMAILS.includes(email);
      const isListedId = AUTHORIZED_DEVELOPER_IDS.includes(userId);
      const isAppMetadataAdmin =
        user.app_metadata?.role === "developer" || user.app_metadata?.role === "founder";

      if (isListedEmail || isListedId || isAppMetadataAdmin) {
        try {
          const { recordAuditLog } = await import("./audit");
          recordAuditLog(
            email || userId,
            "FOUNDER",
            "DEV_AUTH_SUCCESS",
            "supabase_session",
            "success",
            { userId, email }
          );
        } catch {}
        return {
          authorized: true,
          role: "FOUNDER",
          developerId: userId,
          email: user.email,
          name: (user.user_metadata?.full_name as string) || (user.user_metadata?.name as string) || "Founder",
          method: "supabase_session",
          timestamp,
        };
      }
    }
  } catch {
    // Supabase auth service unavailable or not configured in current environment
  }

  // Access denied — strictly enforced for everyone, including in development mode.
  // Never grant developer superpowers without verified identity or master key.
  if (req) {
    try {
      const { recordAuditLog } = await import("./audit");
      recordAuditLog(
        "anonymous",
        "GUEST",
        "DEV_AUTH_DENIED",
        req.nextUrl?.pathname || "/developer",
        "denied",
        { ip: req.headers.get("x-forwarded-for") || "unknown" }
      );
    } catch {}
  }

  return {
    authorized: false,
    method: "supabase_session",
    timestamp,
  };
}

/** Issues a developer session cookie response if the provided key matches MASTER_DEV_KEY. */
export function validateMasterKey(key: string): boolean {
  return Boolean(MASTER_DEV_KEY && key && key === MASTER_DEV_KEY);
}
