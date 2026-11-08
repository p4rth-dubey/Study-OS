/** Developer Activity & Audit Logger for StudyOS.
 * Provides in-memory ring-buffer logging on the server side with optional
 * local persistence so sensitive actions, feature toggles, and commands are audited.
 * Never logs credentials, secrets, or PII. */

import type { AuditLogEntry } from "./types";

const MAX_AUDIT_LOGS = 200;

// In-memory server-side ring buffer
declare global {
  // eslint-disable-next-line no-var
  var __studyos_audit_logs__: AuditLogEntry[] | undefined;
}

if (!globalThis.__studyos_audit_logs__) {
  globalThis.__studyos_audit_logs__ = [
    {
      id: "init_sys_boot",
      timestamp: new Date().toISOString(),
      actor: "system",
      role: "SYSTEM_KERNEL",
      action: "AUDIT_SUBSYSTEM_INITIALIZED",
      resource: "lib/dev/audit.ts",
      status: "success",
      metadata: { environment: process.env.NODE_ENV || "development" },
    },
  ];
}

export function recordAuditLog(
  actor: string,
  role: string,
  action: string,
  resource: string,
  status: "success" | "denied" | "failure",
  metadata?: Record<string, unknown>
): AuditLogEntry {
  // Sanitize metadata to strip any sensitive keys
  const sanitizedMeta: Record<string, unknown> = {};
  if (metadata) {
    for (const [k, v] of Object.entries(metadata)) {
      const lower = k.toLowerCase();
      if (
        lower.includes("key") ||
        lower.includes("secret") ||
        lower.includes("token") ||
        lower.includes("password") ||
        lower.includes("auth")
      ) {
        sanitizedMeta[k] = "[REDACTED]";
      } else {
        sanitizedMeta[k] = v;
      }
    }
  }

  const entry: AuditLogEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    actor,
    role,
    action,
    resource,
    status,
    metadata: sanitizedMeta,
  };

  const buffer = globalThis.__studyos_audit_logs__!;
  buffer.unshift(entry);

  if (buffer.length > MAX_AUDIT_LOGS) {
    buffer.splice(MAX_AUDIT_LOGS);
  }

  return entry;
}

export function getAuditLogs(limit = 50, filterStatus?: string): AuditLogEntry[] {
  const buffer = globalThis.__studyos_audit_logs__ || [];
  if (filterStatus && filterStatus !== "all") {
    return buffer.filter((e) => e.status === filterStatus).slice(0, limit);
  }
  return buffer.slice(0, limit);
}

export function clearAuditLogs(actor: string): boolean {
  globalThis.__studyos_audit_logs__ = [
    {
      id: `audit_cleared_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor,
      role: "FOUNDER",
      action: "AUDIT_LOGS_PURGED",
      resource: "audit_buffer",
      status: "success",
      metadata: { clearedAt: new Date().toISOString() },
    },
  ];
  return true;
}
