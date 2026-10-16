/** Scholarship Finder Module for StudyOS.
 * Discover verified government scholarships, merit grants, and STEM financial aid across India. */
"use client";

import { useEffect, useState } from "react";
import { getAllScholarships } from "../../../lib/scholarships/registry";
import type { EducationLevel, Scholarship } from "../../../lib/scholarships/types";
import { Card, Pill, SpotCard } from "../../../components/tracker-ui";
import { Reveal } from "../../../lib/motion";

const BOOKMARKS_KEY = "studyos_bookmarked_scholarships_v1";

function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const target = new Date(`${dateStr}T23:59:59`).getTime();
  const diff = target - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function ScholarshipsPage() {
  const allScholarships = getAllScholarships();

  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<EducationLevel>("all");
  const [incomeFilter, setIncomeFilter] = useState<number | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(BOOKMARKS_KEY);
      if (raw) setBookmarkedIds(JSON.parse(raw));
    } catch {
      // Ignore
    }
  }, []);

  const toggleBookmark = (id: string) => {
    const next = bookmarkedIds.includes(id)
      ? bookmarkedIds.filter((b) => b !== id)
      : [...bookmarkedIds, id];
    setBookmarkedIds(next);
    try {
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
    } catch {
      // Ignore
    }
  };

  const filteredScholarships = allScholarships.filter((s) => {
    if (level !== "all" && s.educationLevel !== level && s.educationLevel !== "all") return false;
    if (incomeFilter !== null && s.maxFamilyIncomePerAnnum && s.maxFamilyIncomePerAnnum < incomeFilter) {
      return false;
    }
    if (search.trim()) {
      const term = search.toLowerCase();
      const matchName = s.name.toLowerCase().includes(term);
      const matchShort = s.shortName.toLowerCase().includes(term);
      const matchOffered = s.offeredBy.toLowerCase().includes(term);
      const matchBeneficiary = s.targetBeneficiary.toLowerCase().includes(term);
      if (!matchName && !matchShort && !matchOffered && !matchBeneficiary) return false;
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
              Financial Aid & Merit Grants
            </p>
            <h1 className="display-tight text-[26px] font-bold tracking-tight sm:text-[34px]">
              Scholarship Finder
            </h1>
          </div>
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-[#f59e0b]/10 px-3 py-1 text-[12px] font-semibold text-[#fbbf24] ring-1 ring-[#f59e0b]/25 sm:self-center">
            <span className="h-2 w-2 rounded-full bg-[#f59e0b]" />
            Official Portals (NSP, DST, AICTE)
          </span>
        </div>
      </Reveal>

      {/* Trust & Safe Disclaimer Banner */}
      <Reveal delay={0.05}>
        <div className="rounded-[16px] bg-[#141414] p-4 text-[13px] leading-relaxed text-[#aaa] ring-1 ring-white/[0.08]">
          <strong className="text-white">Direct Government Applications:</strong> StudyOS aggregates official public
          scholarship guidelines and directs you straight to authorized government portals (such as National
          Scholarship Portal). Never pay fees to any third-party agent. StudyOS never collects your bank or personal data.
        </div>
      </Reveal>

      {/* Search and Filters */}
      <Reveal delay={0.08}>
        <div className="space-y-3">
          {/* Search box */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by scholarship title, ministry, or target group (SC, OBC, Merit, Girl students)..."
              className="h-12 w-full rounded-[14px] bg-[#141414] pl-11 pr-4 text-[14px] text-white ring-1 ring-white/10 placeholder:text-[#666] outline-none focus:ring-[#0099ff]"
            />
            <svg
              className="absolute left-3.5 top-3.5 text-[#666]"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </div>

          {/* Education Level Pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all" as EducationLevel, label: "All Levels" },
              { id: "class_9_10" as EducationLevel, label: "Class 9 & 10 (Pre-Matric)" },
              { id: "class_11_12" as EducationLevel, label: "Class 11 & 12 (Post-Matric)" },
              { id: "ug_engineering" as EducationLevel, label: "Engineering & Technical" },
              { id: "general_ug" as EducationLevel, label: "College Degree (B.Sc / BA)" },
            ].map((lvl) => (
              <Pill
                key={lvl.id}
                active={level === lvl.id}
                onClick={() => setLevel(lvl.id)}
              >
                {lvl.label}
              </Pill>
            ))}
          </div>

          {/* Income Ceiling Filter */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[13px] text-[#888]">
            <span>Income ceiling:</span>
            {[
              { label: "Any Income", value: null },
              { label: "≤ 2.5 Lakh", value: 250000 },
              { label: "≤ 3.5 Lakh", value: 350000 },
              { label: "≤ 8.0 Lakh", value: 800000 },
            ].map((inc, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIncomeFilter(inc.value)}
                className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
                  incomeFilter === inc.value
                    ? "bg-white text-black font-semibold"
                    : "bg-[#1c1c1c] text-[#aaa] ring-1 ring-white/10 hover:text-white"
                }`}
              >
                {inc.label}
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Scholarship Cards Grid */}
      <div className="space-y-4">
        {filteredScholarships.length === 0 ? (
          <Card className="py-12 text-center">
            <p className="text-[15px] font-semibold">No scholarships match your selected criteria</p>
            <p className="mt-1 text-[13px] text-[#888]">
              Try selecting &quot;All Levels&quot; or clearing the income ceiling filter.
            </p>
          </Card>
        ) : (
          filteredScholarships.map((sch, idx) => {
            const daysLeft = daysUntil(sch.applicationDeadline);
            const isBookmarked = bookmarkedIds.includes(sch.id);
            const isExpanded = expandedId === sch.id;

            return (
              <Reveal key={sch.id} delay={Math.min(idx * 0.05, 0.2)}>
                <SpotCard className="rounded-[18px] bg-[#141414] p-5 ring-1 ring-white/[0.07] transition-all hover:bg-[#171717] sm:p-6">
                  {/* Top Bar: Benefit Amount & Bookmark */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="rounded-full bg-white/[0.08] px-2.5 py-0.5 font-mono text-[11px] font-semibold text-[#ddd] ring-1 ring-white/10">
                        {sch.portalName}
                      </span>
                      <h3 className="text-[17px] font-semibold tracking-tight text-white sm:text-[18px]">
                        {sch.name}
                      </h3>
                      <p className="text-[12.5px] text-[#888]">{sch.offeredBy}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleBookmark(sch.id)}
                        aria-label={isBookmarked ? "Remove bookmark" : "Bookmark scholarship"}
                        className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                          isBookmarked ? "bg-white text-black" : "bg-[#1c1c1c] text-[#777] ring-1 ring-white/10 hover:text-white"
                        }`}
                      >
                        ★
                      </button>
                    </div>
                  </div>

                  {/* Benefit Highlight & Income info */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-[#22c55e]/15 px-3 py-1 font-mono text-[13px] font-bold text-[#4ade80] ring-1 ring-[#22c55e]/30">
                      {sch.benefitAmount}
                    </span>
                    {sch.incomeLimitText && (
                      <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[12px] text-[#ccc] ring-1 ring-white/10">
                        {sch.incomeLimitText}
                      </span>
                    )}
                    {daysLeft !== null && daysLeft > 0 ? (
                      <span className="rounded-full bg-[#f59e0b]/15 px-3 py-1 font-mono text-[12px] font-semibold text-[#fbbf24] ring-1 ring-[#f59e0b]/30">
                        Deadline: ~{daysLeft} days left
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#0099ff]/15 px-3 py-1 text-[12px] font-semibold text-[#38bdf8] ring-1 ring-[#0099ff]/30">
                        {sch.status.toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Beneficiary summary */}
                  <p className="mt-3 text-[13.5px] text-[#bbb] leading-relaxed">
                    <strong className="text-white">Target Group:</strong> {sch.targetBeneficiary}
                  </p>

                  {/* Expandable Eligibility & Documents */}
                  {isExpanded && (
                    <div className="mt-4 grid gap-4 rounded-[14px] bg-[#1a1a1a] p-4 text-[13px] ring-1 ring-white/[0.05] sm:grid-cols-2">
                      <div>
                        <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#0099ff]">
                          Eligibility Criteria:
                        </p>
                        <ul className="mt-2 list-disc space-y-1.5 pl-4 text-[#bbb]">
                          {sch.eligibilityCriteria.map((c, cIdx) => (
                            <li key={cIdx}>{c}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#fbbf24]">
                          Required Documents:
                        </p>
                        <ul className="mt-2 list-disc space-y-1.5 pl-4 text-[#bbb]">
                          {sch.documentsRequired.map((d, dIdx) => (
                            <li key={dIdx}>{d}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Footer & Official Apply Link */}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-3 text-[12.5px]">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : sch.id)}
                      className="text-[#999] hover:text-white underline underline-offset-2"
                    >
                      {isExpanded ? "Hide eligibility details" : "View eligibility & document checklist"}
                    </button>

                    <a
                      href={sch.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-medium text-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span>Apply on Official Portal</span>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                        <path d="M15 3h6v6" />
                        <path d="M10 14L21 3" />
                      </svg>
                    </a>
                  </div>
                </SpotCard>
              </Reveal>
            );
          })
        )}
      </div>
    </div>
  );
}
