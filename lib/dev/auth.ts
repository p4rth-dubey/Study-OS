/** Server-Side Developer Authorization & Session Utilities.
 * Enforces secure developer verification without relying on client-side state.
 * Supports Supabase session matching, environment-based developer IDs, and
 * fallback authorization for local engineering environments. */

import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "../supabase/server";
import { recordAuditLog } from "./audit";
import type { DeveloperSession } from "./types";

const FOUNDER_EMAIL = "parthveerdubey6167@gmail.com";
const FOUNDER_DEVELOPER_ID = "p4rth";

// Master developer key from the server environment (never exposed to the
// browser). It is intentionally optional: Google/Supabase sign-in with an
// authorized email remains sufficient, while the manual key gate is disabled
// until a key is explicitly configured.
const MASTER_DEV_KEY = process.env.STUDYOS_DEV_KEY;

// Configured developer IDs or emails from environment
const AUTHORIZED_DEVELOPER_EMAILS = (process.env.DEVELOPER_EMAILS || FOUNDER_EMAIL)
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const AUTHORIZED_DEVELOPER_IDS = (process.env.DEVELOPER_ACCOUNT_IDS || "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

/** Verifies whether an incoming server request or context is from an authorized developer. */
export async function verifyDeveloperAccess(
  req?: NextRequest
): Promise<DeveloperSession> {
  const timestamp = new Date().toISOString();

  // 1. Check HTTP Header authorization (for CLI / script / secret token)
  if (req) {
    const headerKey = req.headers.get("x-studyos-dev-key");
    const authHeader = req.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

    if (
      (MASTER_DEV_KEY && headerKey === MASTER_DEV_KEY) ||
      (MASTER_DEV_KEY && bearerToken === MASTER_DEV_KEY)
    ) {
      recordAuditLog("dev_master_key", "FOUNDER", "DEV_AUTH_SUCCESS", "x-studyos-dev-key", "success");
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
        email: "parthveerdubey6167@gmail.com",
        name: "StudyOS Founder",
        method: "master_key",
        timestamp,
      };
    }
  }

  // 2. Check Supabase Server Session
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (!error && user) {
      const email = user.email?.toLowerCase();
      const userId = user.id;

      const isListedEmail = email && AUTHORIZED_DEVELOPER_EMAILS.includes(email);
      const isListedId = AUTHORIZED_DEVELOPER_IDS.includes(userId);
      const isAppMetadataAdmin = user.app_metadata?.role === "developer" || user.app_metadata?.role === "founder";

      if (isListedEmail || isListedId || isAppMetadataAdmin) {
        recordAuditLog(
          email || userId,
          "FOUNDER",
          "DEV_AUTH_SUCCESS",
          "supabase_session",
          "success",
          { userId, email }
        );
        return {
          authorized: true,
          role: "FOUNDER",
          developerId: userId,
          email: user.email,
          name: (user.user_metadata?.full_name as string) || "Founder",
          method: "supabase_session",
          timestamp,
        };
      }
    }
  } catch {
    // Supabase auth service unavailable or not configured in current environment
  }

  // 3. Local Development Mode Failover
  // In pure local dev mode (NODE_ENV !== "production"), allow developer access
  // so the author can build and test God Mode without mandatory cloud OAuth.
  const isDev = process.env.NODE_ENV !== "production";
  if (isDev) {
    return {
      authorized: true,
      role: "FOUNDER",
      developerId: "dev_local_architect",
      email: "architect@local.studyos",
      name: "Local Founder / Architect",
      method: "local_dev",
      timestamp,
    };
  }

  // Access denied
  if (req) {
    recordAuditLog(
      "anonymous",
      "GUEST",
      "DEV_AUTH_DENIED",
      req.nextUrl.pathname,
      "denied",
      { ip: req.headers.get("x-forwarded-for") || "unknown" }
    );
  }

  return {
    authorized: false,
    method: "local_dev",
    timestamp,
  };
}

/** Issues a developer session cookie response if the provided key matches MASTER_DEV_KEY. */
export function validateMasterKey(key: string): boolean {
  return Boolean(MASTER_DEV_KEY && key && key === MASTER_DEV_KEY);
}
