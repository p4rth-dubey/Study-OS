/** Official Education Updates & Exam Deadlines Hub.
 * Provides authentic, verified information on board exams, entrance tests, and government recruitments. */
"use client";

import { useEffect, useState } from "react";
import { getAllUpdates } from "../../../lib/updates/registry";
import type { EducationUpdate } from "../../../lib/updates/types";
import { Card, Pill, SpotCard } from "../../../components/tracker-ui";
import { Reveal } from "../../../lib/motion";
import { useTracker } from "../../../lib/storage";

const BOOKMARKS_KEY = "studyos_bookmarked_updates_v1";

function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const target = new Date(`${dateStr}T23:59:59`).getTime();
  const diff = target - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function UpdatesPage() {
  const store = useTracker();
  const { profile } = store;
  const allUpdates = getAllUpdates();

  // Map user's target exam or grade to their exam category
  const targetExam = profile?.targetExam || (profile?.grade === 9 ? "cbse-9" : "cbse-10");
  const userCategory = targetExam.startsWith("cbse")
    ? "school"
    : targetExam.includes("jee") || targetExam.includes("gate")
    ? "engineering"
    : targetExam.includes("neet")
    ? "medical"
    : targetExam.includes("upsc") || targetExam.includes("ssc") || targetExam.includes("bank")
    ? "government"
    : "all";

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("for_you");
  const [selectedType, setSelectedType] = useState<string>("all");
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

  const filteredUpdates = allUpdates.filter((u) => {
    if (selectedCategory === "for_you") {
      // Prioritize user's exact exam or exam category
      const matchExam = targetExam && (u.examId === targetExam || u.examName.toLowerCase().includes(targetExam.replace("cbse-", "class ")));
      const matchCat = userCategory !== "all" && u.examCategory === userCategory;
      if (!matchExam && !matchCat) return false;
    } else if (selectedCategory !== "all" && u.examCategory !== selectedCategory) {
      return false;
    }

    if (selectedType !== "all" && u.category !== selectedType) return false;
    if (search.trim()) {
      const term = search.toLowerCase();
      const matchTitle = u.title.toLowerCase().includes(term);
      const matchExam = u.examName.toLowerCase().includes(term);
      const matchSummary = u.summary.toLowerCase().includes(term);
      const matchAuthority = u.conductingAuthority.toLowerCase().includes(term);
      if (!matchTitle && !matchExam && !matchSummary && !matchAuthority) return false;
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
              Official Portals & Deadlines
            </p>
            <h1 className="display-tight text-[26px] font-bold tracking-tight sm:text-[34px]">
              Education Updates & Deadlines
            </h1>
          </div>
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-[#0099ff]/10 px-3 py-1 text-[12px] font-semibold text-[#38bdf8] ring-1 ring-[#0099ff]/25 sm:self-center">
            <span className="h-2 w-2 rounded-full bg-[#0099ff]" />
            Official Verified Feeds Only
          </span>
        </div>
      </Reveal>

      {/* Search & Filters */}
      <Reveal delay={0.05}>
        <div className="space-y-3">
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by exam name, circular title, or conducting authority (CBSE, NTA, UPSC)..."
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

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              ...(profile
                ? [{ id: "for_you", label: `★ For You (${profile.name})` }]
                : []),
              { id: "all", label: "All Categories" },
              { id: "school", label: "School / CBSE" },
              { id: "engineering", label: "Engineering" },
              { id: "medical", label: "Medical" },
              { id: "government", label: "Government" },
              { id: "entrance", label: "Entrance / CUET" },
            ].map((cat) => (
              <Pill
                key={cat.id}
                active={selectedCategory === cat.id}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </Pill>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Updates List */}
      <div className="space-y-3.5">
        {filteredUpdates.length === 0 ? (
          <Card className="py-12 text-center">
            <p className="text-[15px] font-semibold">No updates match your filters</p>
            <p className="mt-1 text-[13px] text-[#888]">
              Try adjusting your search keyword or selecting &quot;All Categories&quot;.
            </p>
          </Card>
        ) : (
          filteredUpdates.map((item, idx) => {
            const daysLeft = daysUntil(item.deadlineDate);
            const isBookmarked = bookmarkedIds.includes(item.id);
            const isExpanded = expandedId === item.id;

            return (
              <Reveal key={item.id} delay={Math.min(idx * 0.04, 0.2)}>
                <SpotCard className="rounded-[18px] bg-[#141414] p-5 ring-1 ring-white/[0.07] transition-all hover:bg-[#171717] sm:p-6">
                  {/* Top line: tags, dates, bookmark */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white/[0.08] px-2.5 py-0.5 text-[11px] font-semibold text-white ring-1 ring-white/10">
                        {item.examName}
                      </span>
                      <span className="rounded-full bg-white/[0.05] px-2.5 py-0.5 text-[11px] uppercase tracking-wider text-[#999]">
                        {item.category.replace("_", " ")}
                      </span>
                      <span className="text-[12px] text-[#666]">
                        {new Date(item.publicationDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Status / Deadline chip */}
                      {daysLeft !== null && daysLeft > 0 ? (
                        <span className="rounded-full bg-[#22c55e]/15 px-2.5 py-0.5 font-mono text-[11.5px] font-semibold text-[#4ade80] ring-1 ring-[#22c55e]/30">
                          {daysLeft}d left
                        </span>
                      ) : daysLeft !== null && daysLeft <= 0 ? (
                        <span className="rounded-full bg-white/10 px-2.5 py-0.5 font-mono text-[11.5px] text-[#888]">
                          Deadline passed
                        </span>
                      ) : (
                        <span className="rounded-full bg-[#0099ff]/15 px-2.5 py-0.5 text-[11.5px] font-semibold text-[#38bdf8] ring-1 ring-[#0099ff]/30">
                          {item.status.toUpperCase()}
                        </span>
                      )}

                      {/* Bookmark Button */}
                      <button
                        type="button"
                        onClick={() => toggleBookmark(item.id)}
                        aria-label={isBookmarked ? "Remove bookmark" : "Bookmark update"}
                        className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                          isBookmarked ? "bg-white text-black" : "bg-[#1c1c1c] text-[#777] ring-1 ring-white/10 hover:text-white"
                        }`}
                      >
                        ★
                      </button>
                    </div>
                  </div>

                  {/* Title & Summary */}
                  <h3 className="mt-3 text-[16px] font-semibold leading-snug tracking-tight text-white sm:text-[17px]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-[#ccc]">{item.summary}</p>

                  {/* Expandable Details */}
                  {isExpanded && item.details && (
                    <div className="mt-4 space-y-2 rounded-[14px] bg-[#1a1a1a] p-4 text-[13px] text-[#bbb] ring-1 ring-white/[0.05]">
                      <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#999]">
                        Key Official Highlights:
                      </p>
                      <ul className="list-disc space-y-1.5 pl-4">
                        {item.details.map((point, pIdx) => (
                          <li key={pIdx}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Footer: Conducting Authority & Official Link */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-3 text-[12.5px]">
                    <div className="flex items-center gap-1.5 text-[#888]">
                      <span>Issued by:</span>
                      <strong className="text-[#ccc]">{item.conductingAuthority}</strong>
                    </div>

                    <div className="flex items-center gap-3">
                      {item.details && (
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}
                          className="text-[12.5px] text-[#999] hover:text-white underline underline-offset-2"
                        >
                          {isExpanded ? "Hide details" : "Read guidelines"}
                        </button>
                      )}
                      <a
                        href={item.officialSourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full bg-white px-3.5 py-1.5 text-[12.5px] font-medium text-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <span>Official Portal</span>
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
