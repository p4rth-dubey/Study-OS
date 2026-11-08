/** Time Machine Subsystem.
 * Simulates future and past dates for testing exam deadlines, countdowns, and scheduled revisions.
 * Affects only testing scopes without modifying system hardware clock or production scheduling. */
"use client";

import { useState } from "react";

export default function TimeMachine() {
  const [simulatedOffsetDays, setSimulatedOffsetDays] = useState(0);
  const [targetDate, setTargetDate] = useState("");

  const simulatedDate = new Date();
  simulatedDate.setDate(simulatedDate.getDate() + simulatedOffsetDays);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Time Machine & Exam Clock Simulator</h2>
          <p className="font-mono text-xs text-[#9ca3af]">
            Shift the simulated evaluation clock to test urgency timers, revision pace warnings, and scheduled exams.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-[#8b5cf6]/40 bg-[#160b2b] px-3 py-1 font-mono text-xs text-[#c084fc]">
            {simulatedOffsetDays === 0 ? "REALTIME ACTIVE" : `WARP OFFSET: +${simulatedOffsetDays} DAYS`}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-[#3b1d60] bg-[#0c0617] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <p className="font-mono text-xs text-[#6b7280]">Current Simulated Academic Clock:</p>
            <p className="text-lg font-bold text-white">
              {simulatedDate.toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSimulatedOffsetDays(0)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-white hover:bg-white/10"
            >
              Reset to Today
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block font-mono text-xs text-[#a78bfa]">Quick Jump Shortcuts:</label>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "+1 Day (Tomorrow)", days: 1 },
              { label: "+7 Days (1 Week)", days: 7 },
              { label: "+14 Days (2 Weeks Ahead)", days: 14 },
              { label: "+30 Days (1 Month Ahead)", days: 30 },
              { label: "+90 Days (Exam Season Eve)", days: 90 },
            ].map((jump) => (
              <button
                key={jump.days}
                type="button"
                onClick={() => setSimulatedOffsetDays(jump.days)}
                className={`rounded-xl px-3 py-1.5 font-mono text-xs font-semibold transition-all ${
                  simulatedOffsetDays === jump.days
                    ? "bg-[#8b5cf6] text-white"
                    : "border border-white/10 bg-white/5 text-[#9ca3af] hover:text-white"
                }`}
              >
                {jump.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
