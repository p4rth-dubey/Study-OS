/** Developer Dashboard Overview Component.
 * Surfaces real-time Node process telemetry, memory, database connectivity, and quick actions. */
"use client";

import { useEffect, useState } from "react";
import type { SystemMetrics } from "../../lib/dev/types";

export default function DeveloperDashboardOverview({
  onNavigateTab,
}: {
  onNavigateTab: (tabId: string) => void;
}) {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const res = await fetch("/api/dev/system");
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (err) {
      console.error("Failed to load telemetry:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#4c1d95]/50 bg-gradient-to-r from-[#170a2c] via-[#0f061e] to-[#07030e] p-6 sm:p-8 shadow-[0_0_50px_rgba(107,33,168,0.25)]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" />
              <span className="font-mono text-xs font-bold tracking-widest text-[#c084fc] uppercase">
                STUDYOS GOD MODE // FOUNDER ROOT
              </span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Command Center & Planetary Engine
            </h1>
            <p className="mt-1 text-sm text-[#9ca3af] max-w-xl">
              Real-time platform telemetry, feature flags, diagnostic HUD, isolated sandbox fixture manager, and database inspection.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateTab("console")}
              className="rounded-xl border border-[#a855f7] bg-[#7e22ce]/30 px-4 py-2 font-mono text-xs font-bold text-white hover:bg-[#7e22ce]/50 transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)]"
            >
              &gt;_ Open Console
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab("flags")}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-mono text-xs font-semibold text-white hover:bg-white/10 transition-all"
            >
              Feature Unlocker
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Telemetry Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#3b1d60] bg-[#0c0617] p-5">
          <p className="font-mono text-[10px] uppercase text-[#6b7280]">System Memory (RSS)</p>
          <p className="mt-2 text-2xl font-black text-white font-mono">
            {metrics ? `${metrics.memoryUsageMb.rss} MB` : "..."}
          </p>
          <p className="mt-1 font-mono text-[11px] text-[#a855f7]">
            Heap: {metrics?.memoryUsageMb.heapUsed}MB / {metrics?.memoryUsageMb.heapTotal}MB
          </p>
        </div>

        <div className="rounded-2xl border border-[#3b1d60] bg-[#0c0617] p-5">
          <p className="font-mono text-[10px] uppercase text-[#6b7280]">Database Status</p>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                metrics?.database.connected ? "bg-[#22c55e]" : "bg-[#f59e0b]"
              }`}
            />
            <p className="text-xl font-bold text-white font-mono">
              {metrics?.database.provider.toUpperCase() || "..."}
            </p>
          </div>
          <p className="mt-1 font-mono text-[11px] text-[#9ca3af]">
            Latency: {metrics?.database.latencyMs ? `${metrics.database.latencyMs}ms` : "Local Engine"}
          </p>
        </div>

        <div className="rounded-2xl border border-[#3b1d60] bg-[#0c0617] p-5">
          <p className="font-mono text-[10px] uppercase text-[#6b7280]">Verified Question Bank</p>
          <p className="mt-2 text-2xl font-black text-white font-mono">
            {metrics?.contentIndex.totalQuestionsInBank || 0} Qs
          </p>
          <p className="mt-1 font-mono text-[11px] text-[#22c55e]">Authentic Board & Entrance PYQs</p>
        </div>

        <div className="rounded-2xl border border-[#3b1d60] bg-[#0c0617] p-5">
          <p className="font-mono text-[10px] uppercase text-[#6b7280]">Registered Curriculums</p>
          <p className="mt-2 text-2xl font-black text-white font-mono">
            {metrics?.contentIndex.totalExams || 0} Exams
          </p>
          <p className="mt-1 font-mono text-[11px] text-[#c084fc]">
            {metrics?.contentIndex.totalSubjects || 0} Total Subjects Mapped
          </p>
        </div>
      </div>

      {/* Quick Access Matrix */}
      <div>
        <h2 className="text-base font-bold text-white mb-3 tracking-tight">Superpower Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              id: "console",
              title: "Interactive Terminal",
              desc: "Issue dev.help, dev.status, dev.enable, dev.disable commands",
              icon: ">_",
            },
            {
              id: "reality",
              title: "Reality Persona Switcher",
              desc: "Simulate Student (CBSE/JEE/NEET), Teacher, Parent, Admin views",
              icon: "🎭",
            },
            {
              id: "flags",
              title: "Feature Flag Unlocker",
              desc: "Toggle AI Question Gen, CBT engine, Teacher portal on/off",
              icon: "🎛️",
            },
            {
              id: "xray",
              title: "X-Ray Vision HUD",
              desc: "Inspect live React components, network latency, and memory",
              icon: "👁️",
            },
            {
              id: "database",
              title: "Database God View",
              desc: "Explore profiles, test history, and raw verified question bank",
              icon: "🗄️",
            },
            {
              id: "sandbox",
              title: "Sandbox Manager",
              desc: "Synthesize test cohorts & reset fixtures without touching production",
              icon: "🧪",
            },
          ].map((action) => (
            <div
              key={action.id}
              onClick={() => onNavigateTab(action.id)}
              className="cursor-pointer group flex flex-col justify-between rounded-2xl border border-[#3b1d60]/60 bg-[#0c0617] p-5 hover:border-[#8b5cf6] hover:bg-[#150a26] transition-all"
            >
              <div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 font-mono text-sm group-hover:bg-[#8b5cf6]/20 group-hover:text-[#c084fc] transition-colors">
                  {action.icon}
                </div>
                <h3 className="mt-3 text-sm font-semibold text-white group-hover:text-[#c084fc] transition-colors">
                  {action.title}
                </h3>
                <p className="mt-1 text-xs text-[#9ca3af] leading-relaxed">{action.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 font-mono text-[10px] text-[#7c3aed] flex items-center justify-end">
                Launch Tool &rarr;
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
