/** Master Page for StudyOS Developer God Mode (/developer).
 * Authenticates server session and mounts the full developer control plane. */
"use client";

import { useEffect, useState } from "react";
import DeveloperSidebar from "../../components/dev/DeveloperSidebar";
import DeveloperDashboardOverview from "../../components/dev/DeveloperDashboardOverview";
import DeveloperConsole from "../../components/dev/DeveloperConsole";
import FeatureUnlocker from "../../components/dev/FeatureUnlocker";
import RealitySwitcher from "../../components/dev/RealitySwitcher";
import DeveloperXRay from "../../components/dev/DeveloperXRay";
import UniversalAccess from "../../components/dev/UniversalAccess";
import DatabaseInspector from "../../components/dev/DatabaseInspector";
import SandboxManager from "../../components/dev/SandboxManager";
import TimeMachine from "../../components/dev/TimeMachine";
import MaintenanceController from "../../components/dev/MaintenanceController";
import DeveloperActivityLogs from "../../components/dev/DeveloperActivityLogs";

export default function DeveloperPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [masterKeyInput, setMasterKeyInput] = useState("");
  const [unlockError, setUnlockError] = useState<string | null>(null);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/dev/auth");
      if (res.ok) {
        const data = await res.json();
        setAuthorized(data.authorized);
      } else {
        setAuthorized(false);
      }
    } catch {
      setAuthorized(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleUnlockWithKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError(null);
    try {
      const res = await fetch("/api/dev/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: masterKeyInput }),
      });
      const data = await res.json();
      if (data.success) {
        setAuthorized(true);
      } else {
        setUnlockError(data.error || "Invalid developer credential");
      }
    } catch (err) {
      setUnlockError((err as Error).message);
    }
  };

  // Loading state
  if (authorized === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07040f] text-[#c084fc]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#a855f7] border-t-transparent" />
          <p className="font-mono text-xs tracking-wider">VERIFYING DEVELOPER KERNEL ACCESS...</p>
        </div>
      </div>
    );
  }

  // Access Denied / Manual Master Key Gate
  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07040f] p-4 text-white">
        <div className="w-full max-w-md rounded-3xl border border-[#3b1d60] bg-[#0d071c] p-8 shadow-[0_0_60px_rgba(107,33,168,0.3)]">
          <div className="flex justify-center mb-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#9333ea]/50 bg-[#7e22ce]/20 text-2xl">
              ⚡
            </span>
          </div>

          <h1 className="text-center text-xl font-black tracking-tight text-white">
            STUDYOS DEVELOPER GATE
          </h1>
          <p className="mt-2 text-center font-mono text-xs text-[#9ca3af]">
            Restricted kernel environment. Enter Founder Master Key or authenticate with an authorized developer ID.
          </p>

          <form onSubmit={handleUnlockWithKey} className="mt-6 space-y-4">
            <div>
              <input
                type="password"
                placeholder="Developer Master Key..."
                value={masterKeyInput}
                onChange={(e) => setMasterKeyInput(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 p-3.5 font-mono text-xs text-white placeholder:text-[#6b7280] outline-none focus:border-[#a855f7]"
                autoFocus
              />
            </div>

            {unlockError && (
              <p className="font-mono text-xs text-[#f87171] text-center">{unlockError}</p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-[#9333ea] to-[#6b21a8] py-3 font-mono text-xs font-bold text-white shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:brightness-110"
            >
              Verify & Unlock God Mode
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/app/dashboard" className="font-mono text-xs text-[#9ca3af] hover:text-white">
              &larr; Return to Student Portal
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Authorized Developer Environment
  return (
    <div className="min-h-screen bg-[#07040f] text-white">
      <DeveloperSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      <main className="pl-72 min-h-screen">
        <div className="mx-auto max-w-6xl p-6 sm:p-10">
          {activeTab === "overview" && <DeveloperDashboardOverview onNavigateTab={setActiveTab} />}
          {activeTab === "console" && <DeveloperConsole />}
          {activeTab === "flags" && <FeatureUnlocker />}
          {activeTab === "reality" && <RealitySwitcher />}
          {activeTab === "xray" && <DeveloperXRay />}
          {activeTab === "database" && <DatabaseInspector />}
          {activeTab === "sandbox" && <SandboxManager />}
          {activeTab === "timemachine" && <TimeMachine />}
          {activeTab === "maintenance" && <MaintenanceController />}
          {activeTab === "audit" && <DeveloperActivityLogs />}
        </div>
      </main>
    </div>
  );
}
