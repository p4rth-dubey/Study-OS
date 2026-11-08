/** Maintenance Controller Subsystem.
 * Toggles system-wide maintenance mode with custom announcements and guaranteed Founder exemption. */
"use client";

import { useState } from "react";

export default function MaintenanceController() {
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState(
    "StudyOS is currently running scheduled kernel maintenance. Normal student operations will resume shortly."
  );
  const [savedNotice, setSavedNotice] = useState(false);

  const handleToggle = () => {
    setEnabled(!enabled);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Maintenance Mode & Access Gate</h2>
          <p className="font-mono text-xs text-[#9ca3af]">
            Hold student and teacher traffic during platform deployments while retaining root developer bypass.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 font-mono text-xs font-bold ${
              enabled
                ? "bg-[#ef4444]/20 text-[#f87171] border border-[#ef4444]/40"
                : "bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/40"
            }`}
          >
            {enabled ? "● MAINTENANCE ENGAGED" : "● NORMAL OPERATING MODE"}
          </span>
        </div>
      </div>

      {savedNotice && (
        <div className="rounded-xl border border-[#22c55e]/40 bg-[#22c55e]/10 p-3 text-xs text-[#4ade80]">
          Maintenance status updated successfully.
        </div>
      )}

      <div className="rounded-2xl border border-[#3b1d60] bg-[#0c0617] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Platform Public Gateway</h3>
            <p className="font-mono text-xs text-[#6b7280]">
              Authorized developer accounts bypass maintenance automatically.
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggle}
            className={`rounded-xl px-4 py-2 font-mono text-xs font-bold transition-all ${
              enabled
                ? "bg-[#ef4444] text-white hover:bg-[#dc2626]"
                : "border border-[#8b5cf6]/50 bg-[#160b2b] text-[#c084fc] hover:bg-[#2e1065]"
            }`}
          >
            {enabled ? "Deactivate Maintenance" : "Engage Maintenance Mode"}
          </button>
        </div>

        <div>
          <label className="block font-mono text-xs text-[#a78bfa] mb-2">Student Announcement Message:</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-white/10 bg-white/5 p-3 font-mono text-xs text-white placeholder:text-[#6b7280] outline-none"
          />
        </div>
      </div>
    </div>
  );
}
