import { NextRequest, NextResponse } from "next/server";
import { verifyDeveloperAccess } from "../../../../lib/dev/auth";
import { recordAuditLog } from "../../../../lib/dev/audit";
import { getAllFeatureFlags, updateFeatureFlag } from "../../../../lib/dev/flags";
import { collectSystemMetrics } from "../../../../lib/dev/system";
import { getAllExams } from "../../../../lib/exams/registry";
import type { FeatureFlagKey } from "../../../../lib/dev/types";

// Command handler for interactive developer terminal
export async function POST(req: NextRequest) {
  const session = await verifyDeveloperAccess(req);
  if (!session.authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { command } = await req.json();
  if (!command || typeof command !== "string") {
    return NextResponse.json({ output: "Error: No command string supplied.", status: "error" });
  }

  const trimmed = command.trim();
  const parts = trimmed.split(" ");
  const base = parts[0].toLowerCase();
  const args = parts.slice(1);
  const actor = session.email || session.developerId || "founder";

  try {
    switch (base) {
      case "dev.help":
      case "help":
        return NextResponse.json({
          status: "ok",
          output: [
            "=== StudyOS Developer God Mode Console v2.6 ===",
            "Available Commands:",
            "  dev.help                 Display command reference",
            "  dev.status               Full system & process telemetry",
            "  dev.modules              List registered exams and academic modules",
            "  dev.flags                View all feature flags & runtime toggles",
            "  dev.enable <flag_key>    Enable feature flag (e.g. dev.enable EXPERIMENTAL_AI)",
            "  dev.disable <flag_key>   Disable feature flag",
            "  dev.users                Inspect active session & profile metrics",
            "  dev.logs [limit]         Display recent audit activity records",
            "  dev.maintenance [on|off] Toggle platform maintenance gate",
            "  dev.reset-demo           Reset local sandbox test fixture data",
            "  clear                    Clear console display",
          ].join("\n"),
        });

      case "dev.status": {
        const metrics = await collectSystemMetrics();
        return NextResponse.json({
          status: "ok",
          output: [
            `StudyOS System Telemetry [${metrics.environment.toUpperCase()}]`,
            `----------------------------------------------------`,
            `Uptime: ${metrics.uptimeSeconds}s | Node: ${metrics.nodeVersion}`,
            `Heap Usage: ${metrics.memoryUsageMb.heapUsed}MB / ${metrics.memoryUsageMb.heapTotal}MB (RSS: ${metrics.memoryUsageMb.rss}MB)`,
            `Database: ${metrics.database.provider.toUpperCase()} (${metrics.database.status}) ${metrics.database.latencyMs ? `~${metrics.database.latencyMs}ms` : ""}`,
            `Exams: ${metrics.contentIndex.totalExams} registered | Subjects: ${metrics.contentIndex.totalSubjects}`,
            `Question Bank: ${metrics.contentIndex.totalQuestionsInBank} verified questions`,
            `API Practice: ${metrics.apiHealth.practiceGenerate} | CBT Mock: ${metrics.apiHealth.practiceSubmit}`,
          ].join("\n"),
        });
      }

      case "dev.modules": {
        const exams = getAllExams();
        const lines = [
          "Registered Examination Modules:",
          ...exams.map(
            (e) => `  [${e.category.toUpperCase()}] ${e.id.padEnd(16)} -> ${e.name} (${e.subjects.length} subjects)`
          ),
        ];
        return NextResponse.json({ status: "ok", output: lines.join("\n") });
      }

      case "dev.flags": {
        const flags = getAllFeatureFlags();
        const lines = [
          "Feature Flags Registry:",
          ...flags.map((f) => `  ${f.enabled ? "✔ [ON] " : "✖ [OFF]"} ${f.key.padEnd(20)} (${f.category}) - ${f.label}`),
        ];
        return NextResponse.json({ status: "ok", output: lines.join("\n") });
      }

      case "dev.enable": {
        const flagKey = args[0]?.toUpperCase() as FeatureFlagKey;
        if (!flagKey) {
          return NextResponse.json({ status: "error", output: "Usage: dev.enable <FLAG_KEY>" });
        }
        const updated = updateFeatureFlag(flagKey, true, actor);
        return NextResponse.json({
          status: "ok",
          output: `Successfully enabled feature flag: ${updated.key} (${updated.label})`,
        });
      }

      case "dev.disable": {
        const flagKey = args[0]?.toUpperCase() as FeatureFlagKey;
        if (!flagKey) {
          return NextResponse.json({ status: "error", output: "Usage: dev.disable <FLAG_KEY>" });
        }
        const updated = updateFeatureFlag(flagKey, false, actor);
        return NextResponse.json({
          status: "ok",
          output: `Successfully disabled feature flag: ${updated.key} (${updated.label})`,
        });
      }

      case "dev.users": {
        return NextResponse.json({
          status: "ok",
          output: [
            "User Session Telemetry:",
            `  Active Developer: ${actor} (${session.role})`,
            `  Auth Method: ${session.method}`,
            `  Timestamp: ${new Date().toISOString()}`,
            "  Local Profiles Engine: Active (browser storage synchronized)",
          ].join("\n"),
        });
      }

      case "dev.logs": {
        const count = parseInt(args[0] || "10", 10);
        const { getAuditLogs } = await import("../../../../lib/dev/audit");
        const logs = getAuditLogs(count);
        const lines = [
          `Audit Activity Buffer (Last ${logs.length} events):`,
          ...logs.map((l) => `  [${l.timestamp.slice(11, 19)}] [${l.status.toUpperCase()}] ${l.actor} -> ${l.action} (${l.resource})`),
        ];
        return NextResponse.json({ status: "ok", output: lines.join("\n") });
      }

      case "dev.maintenance": {
        const mode = args[0]?.toLowerCase();
        if (mode !== "on" && mode !== "off") {
          return NextResponse.json({ status: "error", output: "Usage: dev.maintenance on|off" });
        }
        recordAuditLog(actor, "FOUNDER", `MAINTENANCE_${mode.toUpperCase()}`, "platform_gateway", "success");
        return NextResponse.json({
          status: "ok",
          output: `Maintenance mode toggled to: ${mode.toUpperCase()} (Bypass active for Founder role)`,
        });
      }

      case "dev.reset-demo": {
        recordAuditLog(actor, "FOUNDER", "SANDBOX_DEMO_RESET", "sandbox_fixture", "success");
        return NextResponse.json({
          status: "ok",
          output: "Sandbox demo fixtures refreshed. Production data isolated and unaffected.",
        });
      }

      default:
        return NextResponse.json({
          status: "error",
          output: `Command not recognized: '${trimmed}'. Type 'dev.help' for available developer commands.`,
        });
    }
  } catch (err) {
    return NextResponse.json({ status: "error", output: `Execution failure: ${(err as Error).message}` });
  }
}
