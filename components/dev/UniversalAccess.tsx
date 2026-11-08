/** Universal Access Module.
 * Unlocks unmetered developer bypass for all 12 examination tracks,
 * premium CBT mocks, and syllabus stage gates. */
"use client";

import { getAllExams } from "../../lib/exams/registry";

export default function UniversalAccess() {
  const allExams = getAllExams();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Universal Access Gatekeeper</h2>
          <p className="font-mono text-xs text-[#9ca3af]">
            Bypass all academic paywalls, stage locks, and exam curriculum filters in developer testing mode.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-[#22c55e]/40 bg-[#22c55e]/15 px-3 py-1 font-mono text-xs font-bold text-[#4ade80]">
            ✔ ALL MODULES UNLOCKED (FOUNDER PASS)
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {allExams.map((exam) => (
          <div
            key={exam.id}
            className="flex flex-col justify-between rounded-2xl border border-[#3b1d60]/50 bg-[#0c0617]/90 p-4 hover:border-[#8b5cf6]/50 transition-all"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded bg-[#8b5cf6]/20 px-2 py-0.5 font-mono text-[9px] font-bold text-[#c084fc] uppercase">
                  {exam.category}
                </span>
                <span className="font-mono text-[10px] text-[#22c55e]">UNLOCKED</span>
              </div>
              <h3 className="mt-2 text-sm font-semibold text-white">{exam.name}</h3>
              <p className="font-mono text-[11px] text-[#9ca3af]">{exam.conductingBody}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {exam.subjects.map((sub) => (
                  <span
                    key={sub.id}
                    className="rounded bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-[#cbd5e1]"
                  >
                    {sub.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between font-mono text-[11px] text-[#6b7280]">
              <span>Stages: Unrestricted</span>
              <span className="text-[#a855f7]">Test Lab Ready</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
