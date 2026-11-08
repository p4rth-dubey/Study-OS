/** Sandbox Mode & Isolated Test Fixture Manager.
 * Generates mock cohorts, demo classrooms, and sample practice test attempts.
 * Operates in full isolation; resetting sandbox data never impacts production records. */
"use client";

import { useState } from "react";

export default function SandboxManager() {
  const [sandboxActive, setSandboxActive] = useState(false);
  const [fixtures, setFixtures] = useState({
    mockStudents: 24,
    mockClassrooms: 3,
    sampleAssignments: 8,
    sampleMockTests: 12,
  });
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleGenerateCohort = () => {
    setFixtures((prev) => ({
      ...prev,
      mockStudents: prev.mockStudents + 10,
      sampleMockTests: prev.sampleMockTests + 5,
    }));
    setStatusMsg("Generated 10 mock student profiles and 5 simulated test attempts in Sandbox partition.");
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleResetSandbox = () => {
    setFixtures({
      mockStudents: 0,
      mockClassrooms: 0,
      sampleAssignments: 0,
      sampleMockTests: 0,
    });
    setStatusMsg("Sandbox partition cleared to zero. Production records remain 100% untouched.");
    setTimeout(() => setStatusMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Isolated Sandbox Test Environment</h2>
          <p className="font-mono text-xs text-[#9ca3af]">
            Generate synthetic classrooms, mock students, and sample attempts without touching production records.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSandboxActive(!sandboxActive)}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-xs font-bold transition-all ${
            sandboxActive
              ? "border border-[#22c55e] bg-[#22c55e]/20 text-[#4ade80]"
              : "border border-[#8b5cf6]/40 bg-[#160b2b] text-[#c084fc] hover:bg-[#2e1065]"
          }`}
        >
          <span>{sandboxActive ? "● SANDBOX ISOLATION ACTIVE" : "ENABLE SANDBOX ISOLATION"}</span>
        </button>
      </div>

      {statusMsg && (
        <div className="rounded-xl border border-[#22c55e]/40 bg-[#22c55e]/10 p-3 text-xs text-[#4ade80]">
          {statusMsg}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Mock Students", count: fixtures.mockStudents, icon: "🎓" },
          { label: "Demo Classrooms", count: fixtures.mockClassrooms, icon: "🏫" },
          { label: "Sample Assignments", count: fixtures.sampleAssignments, icon: "📝" },
          { label: "Simulated Tests", count: fixtures.sampleMockTests, icon: "⏱️" },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-[#3b1d60] bg-[#0c0617] p-4.5">
            <div className="flex items-center justify-between text-lg">
              <span>{item.icon}</span>
              <span className="font-mono text-xl font-bold text-white">{item.count}</span>
            </div>
            <p className="mt-2 text-xs font-semibold text-[#9ca3af]">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleGenerateCohort}
          className="rounded-xl border border-[#8b5cf6]/50 bg-gradient-to-r from-[#7e22ce]/40 to-[#4c1d95]/40 px-4 py-2.5 font-mono text-xs font-semibold text-white hover:border-[#a855f7]"
        >
          + Generate Synthetic Cohort Batch
        </button>

        <button
          type="button"
          onClick={handleResetSandbox}
          className="rounded-xl border border-[#ef4444]/40 bg-[#ef4444]/10 px-4 py-2.5 font-mono text-xs font-semibold text-[#f87171] hover:bg-[#ef4444]/20"
        >
          ⚠ Purge Sandbox Fixtures
        </button>
      </div>
    </div>
  );
}
