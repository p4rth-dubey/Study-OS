/** Database God View & Storage Inspector.
 * Inspects real local profiles, registered questions, and Supabase connection state.
 * Read-only safe viewer; never exposes credentials or sensitive secrets. */
"use client";

import { useEffect, useState } from "react";
import { VERIFIED_QUESTION_BANK } from "../../lib/practice/question-bank";
import { useTracker } from "../../lib/storage";

export default function DatabaseInspector() {
  const store = useTracker();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState<"profiles" | "questions">("profiles");

  const filteredQuestions = VERIFIED_QUESTION_BANK.filter(
    (q) =>
      q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.examId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.subjectId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Database God View & Storage Explorer</h2>
          <p className="font-mono text-xs text-[#9ca3af]">
            Inspect real browser storage tables, student profiles, and verified question banks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedTab("profiles")}
            className={`rounded-xl px-3.5 py-1.5 font-mono text-xs font-semibold transition-all ${
              selectedTab === "profiles"
                ? "bg-[#8b5cf6] text-white"
                : "border border-white/10 bg-white/5 text-[#9ca3af] hover:text-white"
            }`}
          >
            Profiles Table ({store.state.profiles.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab("questions")}
            className={`rounded-xl px-3.5 py-1.5 font-mono text-xs font-semibold transition-all ${
              selectedTab === "questions"
                ? "bg-[#8b5cf6] text-white"
                : "border border-white/10 bg-white/5 text-[#9ca3af] hover:text-white"
            }`}
          >
            Question Bank ({VERIFIED_QUESTION_BANK.length})
          </button>
        </div>
      </div>

      {selectedTab === "profiles" ? (
        <div className="rounded-2xl border border-[#3b1d60] bg-[#0c0617] p-5">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-sm font-semibold text-white">LocalStorage Primary Partition (cbse_tracker_v1)</h3>
            <span className="font-mono text-[10px] text-[#22c55e]">Active Schema: v{store.state.schemaVersion}</span>
          </div>

          <div className="mt-4 space-y-3 font-mono text-xs">
            {store.state.profiles.map((p) => (
              <div key={p.id} className="rounded-xl border border-white/5 bg-[#120a22]/80 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{p.name}</span>
                  <span className="rounded bg-[#8b5cf6]/20 px-2 py-0.5 text-[10px] text-[#c084fc]">
                    ID: {p.id}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#9ca3af]">
                  <div>Target: <strong className="text-white">{p.targetExam || `Class ${p.grade}`}</strong></div>
                  <div>Streak: <strong className="text-white">{p.streak?.count || 0} days</strong></div>
                  <div>Todos: <strong className="text-white">{p.todos?.length || 0}</strong></div>
                  <div>Syllabus Keys: <strong className="text-white">{Object.keys(p.progress || {}).length}</strong></div>
                </div>
              </div>
            ))}
            {store.state.profiles.length === 0 && (
              <div className="py-8 text-center text-[#6b7280]">No student profiles currently recorded in storage.</div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#3b1d60] bg-[#0c0617] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-sm font-semibold text-white">Verified Production Questions</h3>
            <input
              type="text"
              placeholder="Search by subject, exam, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs text-white placeholder:text-[#6b7280] outline-none"
            />
          </div>

          <div className="space-y-3 font-mono text-xs max-h-[500px] overflow-y-auto">
            {filteredQuestions.map((q) => (
              <div key={q.id} className="rounded-xl border border-white/5 bg-[#120a22]/70 p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[#a855f7]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#c084fc] uppercase">
                      {q.examId}
                    </span>
                    <span className="text-[10px] text-[#9ca3af]">{q.subjectId}</span>
                  </div>
                  <span className="text-[10px] text-[#4ade80]">+{q.marks} / -{q.negativeMarks || 0}</span>
                </div>
                <p className="text-[#e2e8f0] text-xs font-sans">{q.questionText}</p>
                <div className="text-[10px] text-[#6b7280]">Source: {q.source}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
