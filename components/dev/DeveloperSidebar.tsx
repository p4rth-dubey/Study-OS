/** Developer Sidebar Navigation & Quick Action Controls.
 * Cybernetic lavender & charcoal aesthetic with status pings and section jumps. */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import FounderBadge from "./FounderBadge";

interface NavItem {
  id: string;
  label: string;
  icon: string;
  description: string;
}

const DEV_NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "System Telemetry", icon: "⚡", description: "Real-time Node & DB diagnostics" },
  { id: "console", label: "Dev Console", icon: ">_", description: "Interactive terminal command center" },
  { id: "flags", label: "Feature Unlocker", icon: "🎛️", description: "Universal module & flag controls" },
  { id: "reality", label: "Reality Switcher", icon: "🎭", description: "Simulate Student, Teacher, Parent" },
  { id: "xray", label: "X-Ray Vision", icon: "👁️", description: "UI hierarchy & latency inspector" },
  { id: "database", label: "Database God View", icon: "🗄️", description: "Raw store & question browser" },
  { id: "sandbox", label: "Sandbox Manager", icon: "🧪", description: "Test fixtures & mock cohorts" },
  { id: "timemachine", label: "Time Machine", icon: "⏳", description: "Simulate academic deadlines" },
  { id: "maintenance", label: "Maintenance Gate", icon: "🛡️", description: "Platform maintenance controller" },
  { id: "audit", label: "Audit Logs", icon: "📜", description: "Immutable developer action records" },
];

export default function DeveloperSidebar({
  activeTab,
  onSelectTab,
}: {
  activeTab: string;
  onSelectTab: (id: string) => void;
}) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-[#3b1d60]/40 bg-[#090611]/95 backdrop-blur-2xl">
      {/* Brand Header */}
      <div className="flex h-20 items-center justify-between border-b border-[#2d164d]/60 px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#9333ea]/50 bg-gradient-to-br from-[#7e22ce]/30 to-[#3b0764]/60 text-lg shadow-[0_0_15px_rgba(147,51,234,0.3)]">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-sm font-black tracking-wider text-white">STUDYOS</span>
              <span className="rounded bg-[#a855f7]/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#c084fc]">
                GOD MODE
              </span>
            </div>
            <p className="font-mono text-[10px] text-[#9ca3af]">Kernel Control Panel</p>
          </div>
        </div>
      </div>

      {/* Founder Status Pill */}
      <div className="border-b border-[#2d164d]/40 p-4">
        <div className="flex items-center justify-between rounded-xl border border-[#4c1d95]/40 bg-[#160b2b]/60 p-3">
          <FounderBadge small showLink={false} forceShow={true} />
          <span className="font-mono text-[10px] text-[#a78bfa]">ROOT ACCESS</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3 scrollbar-none">
        <p className="px-3 pt-2 pb-1 font-mono text-[10px] tracking-wider text-[#7c3aed] uppercase">
          Core Subsystems
        </p>
        {DEV_NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left transition-all ${
                isActive
                  ? "border border-[#8b5cf6]/50 bg-gradient-to-r from-[#6b21a8]/35 to-[#2e1065]/50 text-white shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                  : "text-[#9ca3af] hover:border hover:border-white/5 hover:bg-white/[0.03] hover:text-white"
              }`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] font-mono text-xs">
                {item.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold leading-tight">{item.label}</p>
                <p className="truncate font-mono text-[10px] text-[#6b7280]">{item.description}</p>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer Return & Shortcut */}
      <div className="border-t border-[#2d164d]/50 p-4">
        <div className="mb-3 flex items-center justify-between text-[11px] text-[#9ca3af]">
          <span>Toggle Shortcut</span>
          <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-white">
            Ctrl+Shift+D
          </kbd>
        </div>
        <Link
          href="/app/dashboard"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-white/10"
        >
          <span>&larr; Exit to Student OS</span>
        </Link>
      </div>
    </aside>
  );
}
