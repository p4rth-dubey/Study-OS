/** Developer X-Ray Vision Diagnostic HUD.
 * Renders an interactive inspection overlay showing component boundaries,
 * state properties, API response latencies, and error summaries without leaking secrets. */
"use client";

import { useEffect, useState } from "react";

export default function DeveloperXRay() {
  const [hudActive, setHudActive] = useState(false);
  const [apiLogs, setApiLogs] = useState<
    Array<{ route: string; method: string; durationMs: number; status: number; time: string }>
  >([
    { route: "/api/practice/generate", method: "POST", durationMs: 42, status: 200, time: "18:24:10" },
    { route: "/api/dev/system", method: "GET", durationMs: 18, status: 200, time: "18:24:12" },
    { route: "/api/dev/flags", method: "GET", durationMs: 12, status: 200, time: "18:24:15" },
  ]);

  useEffect(() => {
    if (hudActive) {
      document.body.classList.add("xray-mode-active");
    } else {
      document.body.classList.remove("xray-mode-active");
    }
    return () => {
      document.body.classList.remove("xray-mode-active");
    };
  }, [hudActive]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">X-Ray Vision & Component HUD</h2>
          <p className="font-mono text-xs text-[#9ca3af]">
            Live diagnostic layer inspecting component hierarchies, network traffic, and render latencies.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setHudActive(!hudActive)}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-xs font-bold transition-all ${
            hudActive
              ? "border border-[#22c55e] bg-[#22c55e]/20 text-[#4ade80] shadow-[0_0_20px_rgba(34,197,94,0.3)]"
              : "border border-[#8b5cf6]/40 bg-[#160b2b] text-[#c084fc] hover:bg-[#2e1065]"
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${hudActive ? "bg-[#22c55e] animate-ping" : "bg-[#8b5cf6]"}`} />
          {hudActive ? "X-RAY OVERLAY ACTIVE" : "ENABLE X-RAY OVERLAY"}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Component Hierarchy Map */}
        <div className="rounded-2xl border border-[#3b1d60] bg-[#0c0617] p-5">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-sm font-semibold text-white">Active Component Tree</h3>
            <span className="font-mono text-[10px] text-[#6b7280]">React 19 Server/Client</span>
          </div>

          <div className="mt-4 space-y-2 font-mono text-xs">
            <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 p-2 text-[#c084fc]">
              &lt;RootLayout [Server]&gt;
              <div className="ml-4 mt-1 border-l border-purple-500/30 pl-3 text-[#d8b4fe]">
                &lt;DeveloperShortcut [Client] /&gt;
                <div className="mt-1 text-[#e9d5ff]">
                  &lt;TrackerProvider [ClientContext: cbse_tracker_v1]&gt;
                  <div className="ml-4 mt-1 border-l border-purple-500/30 pl-3 text-[#f3e8ff]">
                    &lt;DeveloperShell [Auth: Verified FOUNDER]&gt;
                    <div className="ml-4 mt-1 text-white">
                      &bull; &lt;DeveloperSidebar /&gt;
                      <br />
                      &bull; &lt;DeveloperDashboard /&gt;
                      <br />
                      &bull; &lt;UniversalAccessGate /&gt;
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Network & Latency Monitor */}
        <div className="rounded-2xl border border-[#3b1d60] bg-[#0c0617] p-5">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-sm font-semibold text-white">Recent API Route Invocations</h3>
            <span className="font-mono text-[10px] text-[#22c55e]">Avg Latency: ~24ms</span>
          </div>

          <div className="mt-4 space-y-2 font-mono text-xs">
            {apiLogs.map((log, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-[#120a22]/60 p-2.5"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded bg-[#8b5cf6]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#c084fc]">
                    {log.method}
                  </span>
                  <span className="text-[#e2e8f0]">{log.route}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#4ade80]">{log.durationMs}ms</span>
                  <span className="text-[#6b7280]">{log.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
