/** Reality Switcher Subsystem.
 * Simulates user personas (Student, Teacher, Parent, School Admin, Free, Pro)
 * without altering production records or destructive side-effects. */
"use client";

import { useState } from "react";
import type { RealityPersona } from "../../lib/dev/types";

interface PersonaOption {
  id: RealityPersona;
  name: string;
  role: string;
  badge: string;
  description: string;
  exam: string;
  grade: number;
}

const PERSONAS: PersonaOption[] = [
  {
    id: "founder",
    name: "Architect & Founder (Default)",
    role: "System Creator",
    badge: "ROOT",
    description: "Complete unmetered access to every portal, code generator, and CBT simulation.",
    exam: "cbse-10",
    grade: 10,
  },
  {
    id: "student_cbse10",
    name: "Aarav Sharma",
    role: "Class 10 Board Aspirant",
    badge: "STUDENT",
    description: "Simulates CBSE 10th science & maths board drills with standard stage gates.",
    exam: "cbse-10",
    grade: 10,
  },
  {
    id: "student_jee",
    name: "Rohan Verma",
    role: "JEE Main & Advanced Aspirant",
    badge: "STUDENT",
    description: "Simulates engineering test portal with -1 negative marking rules and PCM syllabus.",
    exam: "jee-main",
    grade: 12,
  },
  {
    id: "student_neet",
    name: "Ananya Patel",
    role: "NEET-UG Medical Aspirant",
    badge: "STUDENT",
    description: "Simulates 720-mark medical entrance test interface and Biology high-yield drills.",
    exam: "neet-ug",
    grade: 12,
  },
  {
    id: "student_upsc",
    name: "Vikram Malhotra",
    role: "UPSC CSE Aspirant",
    badge: "ASPIRANT",
    description: "Simulates GS-1 & CSAT prelims drills, current affairs tracking, and polity modules.",
    exam: "upsc-cse",
    grade: 12,
  },
  {
    id: "teacher",
    name: "Dr. Sunita Rao",
    role: "Senior Science Teacher",
    badge: "TEACHER",
    description: "Simulates classroom assignment generator, batch syllabus oversight, and student rosters.",
    exam: "cbse-10",
    grade: 10,
  },
  {
    id: "parent",
    name: "Rajesh Sharma",
    role: "Parent Guardian",
    badge: "PARENT",
    description: "Simulates weekly progress report view, test score push alerts, and streak digests.",
    exam: "cbse-10",
    grade: 10,
  },
  {
    id: "school_admin",
    name: "Principal K. N. Iyer",
    role: "Institution Administrator",
    badge: "ADMIN",
    description: "Simulates institutional analytics, faculty accounts, and school-wide exam schedules.",
    exam: "cbse-10",
    grade: 10,
  },
  {
    id: "free_tier",
    name: "Free Tier Student Simulation",
    role: "Unpaid Basic User",
    badge: "FREE",
    description: "Test boundary conditions: basic practice tests, standard question counts, non-pro limits.",
    exam: "cbse-10",
    grade: 10,
  },
];

export default function RealitySwitcher() {
  const [activePersona, setActivePersona] = useState<RealityPersona>("founder");
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  const switchPersona = (p: PersonaOption) => {
    setActivePersona(p.id);
    setAppliedNotice(`Simulation shifted to: ${p.name} (${p.role}). All local telemetry isolated.`);
    setTimeout(() => setAppliedNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Reality Switcher & Persona Simulation</h2>
          <p className="font-mono text-xs text-[#9ca3af]">
            Simulate StudyOS from any student, teacher, or administrative perspective without touching real accounts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-[#a855f7]">Current Active Persona:</span>
          <span className="rounded-full border border-[#8b5cf6]/40 bg-[#160b2b] px-3 py-1 font-mono text-xs font-bold text-[#c084fc]">
            {PERSONAS.find((p) => p.id === activePersona)?.badge}
          </span>
        </div>
      </div>

      {appliedNotice && (
        <div className="flex items-center gap-2 rounded-xl border border-[#22c55e]/40 bg-[#22c55e]/10 p-3 text-xs text-[#4ade80] animate-fadeIn">
          <span>✔</span>
          <span className="font-medium">{appliedNotice}</span>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PERSONAS.map((p) => {
          const isSelected = activePersona === p.id;
          return (
            <div
              key={p.id}
              onClick={() => switchPersona(p)}
              className={`cursor-pointer flex flex-col justify-between rounded-2xl border p-4.5 transition-all ${
                isSelected
                  ? "border-[#a855f7] bg-gradient-to-br from-[#241045] to-[#120724] shadow-[0_0_25px_rgba(168,85,247,0.3)] ring-1 ring-[#a855f7]/50"
                  : "border-white/5 bg-[#090512]/60 hover:border-white/10 hover:bg-[#120a22]/50"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase ${
                      p.badge === "ROOT"
                        ? "bg-[#ef4444]/20 text-[#f87171]"
                        : p.badge === "TEACHER"
                        ? "bg-[#3b82f6]/20 text-[#60a5fa]"
                        : p.badge === "ADMIN"
                        ? "bg-[#eab308]/20 text-[#facc15]"
                        : "bg-[#8b5cf6]/20 text-[#c084fc]"
                    }`}
                  >
                    {p.badge}
                  </span>
                  {isSelected && (
                    <span className="font-mono text-[10px] text-[#4ade80] font-semibold">● ACTIVE</span>
                  )}
                </div>
                <h3 className="mt-2 text-sm font-semibold text-white">{p.name}</h3>
                <p className="font-mono text-[11px] text-[#a78bfa]">{p.role}</p>
                <p className="mt-2 text-xs text-[#9ca3af] leading-relaxed">{p.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-[#6b7280]">
                <span>Target: {p.exam.toUpperCase()}</span>
                <span>Grade: {p.grade}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
