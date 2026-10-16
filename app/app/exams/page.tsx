/** Multi-Exam Hub for StudyOS.
 * Comprehensive exploration of supported school, competitive, and entrance examinations across India. */
"use client";

import { useState } from "react";
import Link from "next/link";
import { getAllExams, EXAM_CATEGORIES } from "../../../lib/exams/registry";
import type { ExamCategory, ExamConfig } from "../../../lib/exams/types";
import { Card, Pill, PrimaryButton, SpotCard } from "../../../components/tracker-ui";
import { Reveal } from "../../../lib/motion";

export default function ExamsHubPage() {
  const allExams = getAllExams();
  const [selectedCategory, setSelectedCategory] = useState<ExamCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedExam, setSelectedExam] = useState<ExamConfig | null>(null);

  const filteredExams = allExams.filter((ex) => {
    if (selectedCategory !== "all" && ex.category !== selectedCategory) return false;
    if (search.trim()) {
      const term = search.toLowerCase();
      const matchName = ex.name.toLowerCase().includes(term);
      const matchShort = ex.shortName.toLowerCase().includes(term);
      const matchBody = ex.conductingBody.toLowerCase().includes(term);
      const matchTag = ex.tags.some((t) => t.toLowerCase().includes(term));
      if (!matchName && !matchShort && !matchBody && !matchTag) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Reveal>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[11px] tracking-[0.08em] text-[#777] uppercase">
              Curriculum & Blueprint Directory
            </p>
            <h1 className="display-tight text-[26px] font-bold tracking-tight sm:text-[34px]">
              Multi-Exam Hub
            </h1>
          </div>
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-[#0099ff]/10 px-3 py-1 text-[12px] font-semibold text-[#38bdf8] ring-1 ring-[#0099ff]/25 sm:self-center">
            <span className="h-2 w-2 rounded-full bg-[#0099ff]" />
            12 Standard Examinations Supported
          </span>
        </div>
      </Reveal>

      {/* Search & Category Filter */}
      <Reveal delay={0.05}>
        <div className="space-y-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exams by name, authority, or level (CBSE, JEE, NEET, UPSC, SSC, GATE, CUET)..."
            className="h-12 w-full rounded-[14px] bg-[#141414] px-4 text-[14px] text-white ring-1 ring-white/10 placeholder:text-[#666] outline-none focus:ring-[#0099ff]"
          />

          <div className="flex flex-wrap gap-2">
            <Pill
              active={selectedCategory === "all"}
              onClick={() => setSelectedCategory("all")}
            >
              All Examinations ({allExams.length})
            </Pill>
            {EXAM_CATEGORIES.map((cat) => (
              <Pill
                key={cat.id}
                active={selectedCategory === cat.id}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label} ({allExams.filter((e) => e.category === cat.id).length})
              </Pill>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Grid of Exams */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredExams.map((ex, idx) => (
          <Reveal key={ex.id} delay={Math.min(idx * 0.04, 0.2)}>
            <SpotCard className="flex h-full flex-col justify-between rounded-[20px] bg-[#141414] p-5 ring-1 ring-white/[0.07] transition-all hover:bg-[#181818] sm:p-6">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-white/[0.08] px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase text-white ring-1 ring-white/10">
                    {ex.category}
                  </span>
                  <span className="font-mono text-[11px] text-[#777]">{ex.academicSession}</span>
                </div>

                <h3 className="mt-3 text-[18px] font-semibold tracking-tight text-white">
                  {ex.shortName}
                </h3>
                <p className="mt-0.5 text-[12px] text-[#888]">{ex.conductingBody}</p>

                <p className="mt-2.5 text-[13px] leading-relaxed text-[#ccc] line-clamp-2">
                  {ex.description}
                </p>

                {/* Exam Details Badges */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[11.5px] text-[#aaa]">
                    {ex.subjects.length} Subjects
                  </span>
                  <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[11.5px] text-[#aaa]">
                    {ex.defaultDurationMinutes} mins
                  </span>
                  <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[11.5px] text-[#aaa]">
                    Max {ex.maxMarksDefault || 100} Marks
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-3 text-[12.5px]">
                <button
                  type="button"
                  onClick={() => setSelectedExam(ex)}
                  className="font-medium text-[#0099ff] hover:underline"
                >
                  View Syllabus & Blueprint &rarr;
                </button>

                <Link
                  href={`/app/practice?exam=${ex.id}`}
                  className="rounded-full bg-white px-3.5 py-1.5 text-[12px] font-medium text-black transition-transform hover:scale-105 active:scale-95"
                >
                  Practice Test
                </Link>
              </div>
            </SpotCard>
          </Reveal>
        ))}
      </div>

      {/* Blueprint & Syllabus Detail Modal */}
      {selectedExam && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[88dvh] w-full max-w-3xl overflow-y-auto rounded-[22px] bg-[#141414] p-6 ring-1 ring-white/10 sm:p-8">
            <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#0099ff]">
                  {selectedExam.conductingBody} · {selectedExam.academicSession}
                </span>
                <h2 className="text-[22px] font-bold tracking-tight text-white sm:text-[26px]">
                  {selectedExam.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedExam(null)}
                aria-label="Close modal"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1c1c1c] text-[#888] ring-1 ring-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-5 text-[13.5px]">
              <div>
                <h4 className="font-mono text-[12px] font-semibold uppercase tracking-wider text-[#999]">
                  Eligibility & Entry Criteria
                </h4>
                <p className="mt-1 text-[#ddd] leading-relaxed">{selectedExam.eligibilitySummary}</p>
              </div>

              <div>
                <h4 className="font-mono text-[12px] font-semibold uppercase tracking-wider text-[#999]">
                  Marking Rules & Test Structure
                </h4>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {Object.entries(selectedExam.markingRules).map(([key, rule]) => (
                    <div key={key} className="rounded-[12px] bg-[#1c1c1c] p-3 ring-1 ring-white/5">
                      <p className="font-semibold text-white capitalize">{key.replace("_", " ")} Scheme</p>
                      <p className="mt-0.5 text-[#aaa]">{rule.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-mono text-[12px] font-semibold uppercase tracking-wider text-[#999]">
                  Subjects & Core Syllabus Topics ({selectedExam.subjects.length} Subjects)
                </h4>
                <div className="mt-2.5 space-y-3">
                  {selectedExam.subjects.map((sub) => (
                    <div key={sub.id} className="rounded-[14px] bg-[#1c1c1c] p-4 ring-1 ring-white/5">
                      <p className="font-semibold text-white text-[14.5px]">{sub.name}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {sub.topics.map((t) => (
                          <span
                            key={t.id}
                            className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[12px] text-[#bbb]"
                          >
                            {t.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-mono text-[12px] font-semibold uppercase tracking-wider text-[#999]">
                  Recommended Preparation Stages
                </h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedExam.preparationStages.map((stg) => (
                    <span
                      key={stg.key}
                      className="rounded-full bg-[#22c55e]/15 px-3 py-1 font-mono text-[12px] font-semibold text-[#4ade80] ring-1 ring-[#22c55e]/30"
                    >
                      ✓ {stg.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-4">
                <a
                  href={selectedExam.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] text-[#999] hover:text-white underline underline-offset-2"
                >
                  Official Portal ({selectedExam.officialUrl}) &rarr;
                </a>

                <div className="flex gap-2">
                  <Link href={`/app/practice?exam=${selectedExam.id}`}>
                    <PrimaryButton small>Launch Mock Test &rarr;</PrimaryButton>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
