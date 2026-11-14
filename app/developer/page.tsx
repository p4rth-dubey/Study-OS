/** Master Page for StudyOS Developer God Mode (/developer).
 * Authenticates server session and mounts the full developer control plane. */
"use client";

import { useEffect, useState } from "react";
import { useAuthUser, signInWithGoogle, signOut } from "../../lib/auth/helpers";
import { createClient } from "../../lib/supabase/client";
import DeveloperSidebar from "../../components/dev/DeveloperSidebar";
import DeveloperDashboardOverview from "../../components/dev/DeveloperDashboardOverview";
import DeveloperConsole from "../../components/dev/DeveloperConsole";
import FeatureUnlocker from "../../components/dev/FeatureUnlocker";
import RealitySwitcher from "../../components/dev/RealitySwitcher";
import DeveloperXRay from "../../components/dev/DeveloperXRay";
import DatabaseInspector from "../../components/dev/DatabaseInspector";
import SandboxManager from "../../components/dev/SandboxManager";
import TimeMachine from "../../components/dev/TimeMachine";
import MaintenanceController from "../../components/dev/MaintenanceController";
import DeveloperActivityLogs from "../../components/dev/DeveloperActivityLogs";

export default function DeveloperPage() {
  const { user, loading: userLoading } = useAuthUser();
  const [activeTab, setActiveTab] = useState("overview");
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [masterKeyInput, setMasterKeyInput] = useState("");
  const [unlockError, setUnlockError] = useState<string | null>(null);

  const checkAuth = async () => {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/dev/auth", {
        headers,
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setAuthorized(Boolean(data.authorized));
      } else {
        setAuthorized(false);
      }
    } catch {
      setAuthorized(false);
    }
  };

  useEffect(() => {
    if (!userLoading) {
      checkAuth();
    }
  }, [user, userLoading]);

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
  if (authorized === null || userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07040f] text-[#c084fc]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#a855f7] border-t-transparent" />
          <p className="font-mono text-xs tracking-wider">VERIFYING DEVELOPER KERNEL ACCESS...</p>
        </div>
      </div>
    );
  }

  // Access Denied: User is logged in as a regular student / unauthorized email
  if (!authorized && user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07040f] p-4 text-white">
        <div className="w-full max-w-md rounded-3xl border border-red-500/30 bg-[#0d071c] p-8 shadow-[0_0_60px_rgba(239,68,68,0.18)]">
          <div className="flex justify-center mb-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/50 bg-red-500/20 text-2xl">
              🛑
            </span>
          </div>

          <h1 className="text-center text-xl font-black tracking-tight text-white">
            ACCESS FORBIDDEN (403)
          </h1>
          <p className="mt-2 text-center font-mono text-xs text-[#9ca3af]">
            Developer God Mode is strictly restricted to verified developer accounts.
          </p>

          <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-950/20 p-4 text-center">
            <p className="font-mono text-[11px] text-[#888] uppercase tracking-wider">Signed in as</p>
            <p className="font-mono text-xs font-bold text-red-400 mt-1 break-all">{user.email}</p>
            <p className="text-[11px] text-[#aaa] mt-2">
              This account does not have developer privileges.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <a
              href="/app/dashboard"
              className="flex w-full items-center justify-center rounded-xl bg-white/10 py-3 font-mono text-xs font-bold text-white hover:bg-white/15 transition-colors"
            >
              &larr; Return to Student Dashboard
            </a>
            <button
              type="button"
              onClick={async () => {
                await signOut();
                await signInWithGoogle("/developer");
              }}
              className="flex w-full items-center justify-center rounded-xl border border-white/10 py-2.5 font-mono text-xs text-[#ccc] hover:border-white/30 hover:text-white transition-colors"
            >
              Switch to Developer Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Access Denied: User is not logged in
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
            Restricted kernel environment. Sign in with the authorized developer Google account or enter a master key.
          </p>

          <div className="mt-6 space-y-4">
            <button
              type="button"
              onClick={() => signInWithGoogle("/developer")}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-white py-3 font-mono text-xs font-bold text-black shadow-lg hover:bg-white/90 active:scale-[0.98] transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              Sign In with Developer Google Account
            </button>

            <div className="relative flex items-center justify-center my-3">
              <span className="w-full border-t border-white/10" />
              <span className="bg-[#0d071c] px-3 font-mono text-[10px] text-[#6b7280] uppercase">or</span>
            </div>

            <form onSubmit={handleUnlockWithKey} className="space-y-3">
              <input
                type="password"
                placeholder="Developer Master Key..."
                value={masterKeyInput}
                onChange={(e) => setMasterKeyInput(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 p-3.5 font-mono text-xs text-white placeholder:text-[#6b7280] outline-none focus:border-[#a855f7]"
              />

              {unlockError && (
                <p className="font-mono text-xs text-[#f87171] text-center">{unlockError}</p>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-[#9333ea] to-[#6b21a8] py-3 font-mono text-xs font-bold text-white shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:brightness-110"
              >
                Unlock with Master Key
              </button>
            </form>
          </div>

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
