/** Feature Unlocker & Runtime Flags Controller.
 * Enables/disables platform modules with persistent server-side synchronization. */
"use client";

import { useEffect, useState } from "react";
import { devFetch } from "../../lib/dev/client";
import type { FeatureFlag, FeatureFlagKey } from "../../lib/dev/types";

export default function FeatureUnlocker() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);

  const fetchFlags = async () => {
    try {
      const res = await devFetch("/api/dev/flags");
      const data = await res.json();
      if (data.flags) setFlags(data.flags);
    } catch (err) {
      console.error("Failed to load flags:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const toggleFlag = async (key: FeatureFlagKey, currentState: boolean) => {
    setUpdatingKey(key);
    try {
      const res = await devFetch("/api/dev/flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, enabled: !currentState }),
      });
      const data = await res.json();
      if (data.success) {
        setFlags((prev) =>
          prev.map((f) => (f.key === key ? { ...f, enabled: !currentState } : f))
        );
      }
    } catch (err) {
      console.error("Failed to toggle flag:", err);
    } finally {
      setUpdatingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-[#3b1d60] bg-[#0c0617] text-[#c084fc]">
        <span className="animate-pulse font-mono text-sm">Loading Feature Flag Registry...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Feature Flags & Module Unlocker</h2>
          <p className="font-mono text-xs text-[#9ca3af]">
            Toggle experimental algorithms, institutional features, and testing gateways in real-time.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchFlags}
          className="rounded-xl border border-[#8b5cf6]/40 bg-[#160b2b] px-3.5 py-1.5 font-mono text-xs text-[#c084fc] hover:bg-[#2e1065]"
        >
          ↻ Refresh Flags
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {flags.map((flag) => {
          const isPending = updatingKey === flag.key;
          return (
            <div
              key={flag.key}
              className={`flex flex-col justify-between rounded-2xl border p-4.5 transition-all ${
                flag.enabled
                  ? "border-[#8b5cf6]/50 bg-gradient-to-br from-[#1b0d36]/90 to-[#0e061c]/90 shadow-[0_0_20px_rgba(139,92,246,0.15)]"
                  : "border-white/5 bg-[#090512]/60 opacity-75"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[9px] uppercase font-bold tracking-wider ${
                      flag.category === "ai"
                        ? "bg-[#ec4899]/20 text-[#f472b6]"
                        : flag.category === "institution"
                        ? "bg-[#3b82f6]/20 text-[#60a5fa]"
                        : flag.category === "experimental"
                        ? "bg-[#f59e0b]/20 text-[#fbbf24]"
                        : "bg-[#8b5cf6]/20 text-[#c084fc]"
                    }`}
                  >
                    {flag.category}
                  </span>
                  <span className="font-mono text-[10px] text-[#6b7280]">{flag.key}</span>
                </div>
                <h3 className="mt-2 text-sm font-semibold text-white">{flag.label}</h3>
                <p className="mt-1 text-xs text-[#9ca3af] leading-relaxed">{flag.description}</p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                <span className="font-mono text-[11px] text-[#6b7280]">
                  State:{" "}
                  <strong className={flag.enabled ? "text-[#4ade80]" : "text-[#9ca3af]"}>
                    {flag.enabled ? "ACTIVE (ENABLED)" : "LOCKED (DISABLED)"}
                  </strong>
                </span>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => toggleFlag(flag.key, flag.enabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    flag.enabled ? "bg-[#8b5cf6]" : "bg-[#27272a]"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      flag.enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
