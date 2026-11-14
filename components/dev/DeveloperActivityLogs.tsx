/** Developer Activity Audit Log Viewer.
 * Renders verified audit records with filtering, search, and pagination.
 * Zero secrets or PII. */
"use client";

import { useEffect, useState } from "react";
import { devFetch } from "../../lib/dev/client";
import type { AuditLogEntry } from "../../lib/dev/types";

export default function DeveloperActivityLogs() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchLogs = async () => {
    try {
      const res = await devFetch(`/api/dev/audit?status=${filterStatus}`);
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterStatus]);

  const handleClear = async () => {
    if (!confirm("Are you sure you want to purge the current audit memory buffer?")) return;
    try {
      await devFetch("/api/dev/audit", { method: "DELETE" });
      fetchLogs();
    } catch (err) {
      console.error("Failed to clear logs:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Developer Activity & Audit Logs</h2>
          <p className="font-mono text-xs text-[#9ca3af]">
            Tamper-evident system log tracking authentication attempts, command executions, and flag mutations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#160b2b] px-3 py-1.5 font-mono text-xs text-[#c084fc] outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="success">Success Only</option>
            <option value="denied">Denied Only</option>
            <option value="failure">Failure Only</option>
          </select>

          <button
            type="button"
            onClick={fetchLogs}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-white hover:bg-white/10"
          >
            ↻
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="rounded-xl border border-[#ef4444]/40 bg-[#ef4444]/10 px-3 py-1.5 font-mono text-xs text-[#f87171] hover:bg-[#ef4444]/20"
          >
            Purge Buffer
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-[#3b1d60] bg-[#0c0617] overflow-hidden">
        <div className="divide-y divide-white/5 font-mono text-xs max-h-[550px] overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-white/[0.02]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                      log.status === "success"
                        ? "bg-[#22c55e]/20 text-[#4ade80]"
                        : log.status === "denied"
                        ? "bg-[#f59e0b]/20 text-[#fbbf24]"
                        : "bg-[#ef4444]/20 text-[#f87171]"
                    }`}
                  >
                    {log.status}
                  </span>
                  <span className="font-bold text-white">{log.action}</span>
                  <span className="text-[#6b7280]">({log.resource})</span>
                </div>
                <div className="text-[11px] text-[#9ca3af]">
                  Actor: <strong className="text-[#c084fc]">{log.actor}</strong> · Role: {log.role}
                </div>
              </div>

              <div className="text-[11px] text-[#6b7280] shrink-0">
                {new Date(log.timestamp).toLocaleString("en-IN")}
              </div>
            </div>
          ))}

          {logs.length === 0 && !loading && (
            <div className="py-12 text-center text-[#6b7280]">No audit records found matching criteria.</div>
          )}
        </div>
      </div>
    </div>
  );
}
