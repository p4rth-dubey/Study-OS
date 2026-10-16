/** Current Affairs & Daily Learning Module for StudyOS.
 * Provides daily curated news digests, interactive 5-question daily drills, and flashcards. */
"use client";

import { useState } from "react";
import { CURRENT_AFFAIRS_ARTICLES, REVISION_FLASHCARDS } from "../../../lib/current-affairs/registry";
import type { ArticleCategory, CurrentAffairsArticle } from "../../../lib/current-affairs/types";
import { Card, Pill, PrimaryButton, SpotCard } from "../../../components/tracker-ui";
import { Reveal } from "../../../lib/motion";
import { celebrate } from "../../../lib/celebrate";

export default function CurrentAffairsPage() {
  const [activeTab, setActiveTab] = useState<"feed" | "quiz" | "flashcards">("feed");
  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory>("all");
  const [search, setSearch] = useState("");

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Flashcard flip states
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const articles = CURRENT_AFFAIRS_ARTICLES.filter((a) => {
    if (selectedCategory !== "all" && a.category !== selectedCategory) return false;
    if (search.trim()) {
      const term = search.toLowerCase();
      const matchTitle = a.title.toLowerCase().includes(term);
      const matchSummary = a.summary.toLowerCase().includes(term);
      if (!matchTitle && !matchSummary) return false;
    }
    return true;
  });

  const quizArticles = CURRENT_AFFAIRS_ARTICLES.filter((a) => a.quizQuestion !== undefined);

  const handleSelectQuizAnswer = (articleId: string, optionId: string) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [articleId]: optionId }));
  };

  const handleGradeQuiz = () => {
    setQuizSubmitted(true);
    let correct = 0;
    quizArticles.forEach((a) => {
      if (a.quizQuestion && quizAnswers[a.id] === a.quizQuestion.correctAnswer) {
        correct++;
      }
    });
    if (correct >= 3) {
      celebrate("goal");
    }
  };

  const handleResetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const toggleFlip = (id: string) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Reveal>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[11px] tracking-[0.08em] text-[#777] uppercase">
              Daily General Awareness & Revision
            </p>
            <h1 className="display-tight text-[26px] font-bold tracking-tight sm:text-[34px]">
              Current Affairs & Daily Drills
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#22c55e]/10 px-3 py-1 text-[12px] font-semibold text-[#4ade80] ring-1 ring-[#22c55e]/25">
              <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
              Exam-Relevant Daily Digests
            </span>
          </div>
        </div>
      </Reveal>

      {/* Primary Navigation Tabs */}
      <Reveal delay={0.05}>
        <div className="flex border-b border-white/[0.08] pb-3 gap-3">
          {[
            { id: "feed" as const, label: "Daily News Summaries" },
            { id: "quiz" as const, label: `Daily Quick Quiz (${quizArticles.length} Qs)` },
            { id: "flashcards" as const, label: `Revision Flashcards (${REVISION_FLASHCARDS.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 py-2 text-[13.5px] font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-white text-black font-semibold shadow"
                  : "bg-[#1c1c1c] text-[#888] hover:text-white ring-1 ring-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Reveal>

      {/* --- TAB 1: FEED & SUMMARIES --- */}
      {activeTab === "feed" && (
        <div className="space-y-4">
          {/* Search & Category Pills */}
          <div className="space-y-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by keyword (e.g. Gaganyaan, RBI, Hydrogen, Ramsar)..."
              className="h-11 w-full rounded-[12px] bg-[#141414] px-4 text-[13.5px] text-white ring-1 ring-white/10 placeholder:text-[#666] outline-none focus:ring-[#0099ff]"
            />
            <div className="flex flex-wrap gap-2">
              {[
                { id: "all" as ArticleCategory, label: "All Topics" },
                { id: "science_tech" as ArticleCategory, label: "Science & Tech" },
                { id: "economy" as ArticleCategory, label: "Economy & Banking" },
                { id: "environment" as ArticleCategory, label: "Environment & Ecology" },
                { id: "national" as ArticleCategory, label: "National & Policy" },
              ].map((c) => (
                <Pill
                  key={c.id}
                  active={selectedCategory === c.id}
                  onClick={() => setSelectedCategory(c.id)}
                >
                  {c.label}
                </Pill>
              ))}
            </div>
          </div>

          {/* Articles list */}
          <div className="space-y-3.5">
            {articles.map((art, idx) => (
              <Reveal key={art.id} delay={Math.min(idx * 0.05, 0.2)}>
                <SpotCard className="rounded-[18px] bg-[#141414] p-5 ring-1 ring-white/[0.07] sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white/[0.08] px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase text-white ring-1 ring-white/10">
                        {art.category.replace("_", " ")}
                      </span>
                      <span className="text-[12px] text-[#777]">
                        {new Date(art.publicationDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {art.examRelevance.map((rel, rIdx) => (
                        <span
                          key={rIdx}
                          className="rounded-full bg-[#0099ff]/10 px-2 py-0.5 text-[10.5px] font-medium text-[#38bdf8] ring-1 ring-[#0099ff]/20"
                        >
                          {rel}
                        </span>
                      ))}
                    </div>
                  </div>

                  <h3 className="mt-3 text-[16px] font-semibold leading-snug tracking-tight text-white sm:text-[17px]">
                    {art.title}
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-[#ccc]">{art.summary}</p>

                  {/* High Yield Key Takeaways */}
                  <div className="mt-4 rounded-[12px] bg-[#1a1a1a] p-3.5 ring-1 ring-white/[0.05]">
                    <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#22c55e]">
                      High-Yield Exam Takeaways:
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-[12.5px] text-[#bbb]">
                      {art.keyTakeaways.map((point, pIdx) => (
                        <li key={pIdx}>{point}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Source Attribution */}
                  <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 text-[12px] text-[#777]">
                    <span>Source: {art.sourceName}</span>
                    <a
                      href={art.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#999] hover:text-white underline underline-offset-2"
                    >
                      Official Link &rarr;
                    </a>
                  </div>
                </SpotCard>
              </Reveal>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 2: DAILY QUICK QUIZ --- */}
      {activeTab === "quiz" && (
        <div className="space-y-4">
          <Card>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[16px] font-semibold tracking-tight">Daily 5-Question Current Affairs Drill</p>
                <p className="text-[13px] text-[#888]">
                  Test your retention on today&apos;s key national and economic developments.
                </p>
              </div>

              {quizSubmitted && (
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[14px] font-bold text-[#4ade80]">
                    Score:{" "}
                    {
                      quizArticles.filter(
                        (a) => a.quizQuestion && quizAnswers[a.id] === a.quizQuestion.correctAnswer,
                      ).length
                    }{" "}
                    / {quizArticles.length}
                  </span>
                  <button
                    type="button"
                    onClick={handleResetQuiz}
                    className="rounded-full bg-[#1c1c1c] px-3.5 py-1.5 text-[12.5px] font-medium text-white ring-1 ring-white/10 hover:bg-[#252525]"
                  >
                    Retake Quiz
                  </button>
                </div>
              )}
            </div>
          </Card>

          <div className="space-y-4">
            {quizArticles.map((art, idx) => {
              const q = art.quizQuestion!;
              const userAns = quizAnswers[art.id];
              const isCorrect = userAns === q.correctAnswer;

              return (
                <SpotCard
                  key={art.id}
                  className="rounded-[18px] bg-[#141414] p-5 ring-1 ring-white/[0.07] sm:p-6"
                >
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <span className="font-mono text-[13px] font-bold text-white">Q{idx + 1}</span>
                    <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[11px] text-[#aaa]">
                      {art.category.replace("_", " ")}
                    </span>
                  </div>

                  <p className="mt-3 text-[15px] font-medium text-white">{q.questionText}</p>

                  <div className="mt-4 space-y-2">
                    {q.options.map((opt) => {
                      const isSelected = userAns === opt.id;
                      let btnCls = "bg-[#1c1c1c] text-[#ccc] ring-1 ring-white/[0.06] hover:bg-[#222]";

                      if (quizSubmitted) {
                        if (opt.id === q.correctAnswer) {
                          btnCls = "bg-[#22c55e]/20 text-[#4ade80] ring-1 ring-[#22c55e]/40 font-semibold";
                        } else if (isSelected && !isCorrect) {
                          btnCls = "bg-[#f87171]/20 text-[#f87171] ring-1 ring-[#f87171]/40 font-semibold";
                        }
                      } else if (isSelected) {
                        btnCls = "bg-white text-black font-semibold ring-2 ring-white";
                      }

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          disabled={quizSubmitted}
                          onClick={() => handleSelectQuizAnswer(art.id, opt.id)}
                          className={`flex w-full items-center gap-3 rounded-[12px] p-3 text-left text-[14px] transition-all ${btnCls}`}
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 font-mono text-[12px]">
                            {opt.id}
                          </span>
                          <span className="flex-1">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className="mt-3.5 rounded-[10px] bg-[#1a1a1a] p-3 text-[12.5px] text-[#bbb] ring-1 ring-white/[0.05]">
                      <strong className="text-white">Explanation:</strong> {q.explanation}
                    </div>
                  )}
                </SpotCard>
              );
            })}
          </div>

          {!quizSubmitted && (
            <div className="flex justify-end pt-2">
              <PrimaryButton onClick={handleGradeQuiz}>
                Submit & Grade Daily Quiz
              </PrimaryButton>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 3: REVISION FLASHCARDS --- */}
      {activeTab === "flashcards" && (
        <div className="space-y-4">
          <Card>
            <p className="text-[16px] font-semibold tracking-tight">High-Yield Revision Flashcards</p>
            <p className="text-[13px] text-[#888]">
              Tap any flashcard to flip between conceptual question and high-yield answer summary.
            </p>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            {REVISION_FLASHCARDS.map((fc) => {
              const isFlipped = flippedCards[fc.id];
              return (
                <div
                  key={fc.id}
                  onClick={() => toggleFlip(fc.id)}
                  className="cursor-pointer min-h-[180px] rounded-[18px] bg-[#141414] p-5 ring-1 ring-white/[0.08] transition-all hover:bg-[#181818] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#888] mb-2">
                      <span className="uppercase text-[#0099ff]">{fc.topic}</span>
                      <span className="rounded-full bg-white/5 px-2 py-0.5">{fc.examTag}</span>
                    </div>

                    <p className="text-[14.5px] font-medium leading-relaxed text-white whitespace-pre-line">
                      {isFlipped ? fc.back : fc.front}
                    </p>
                  </div>

                  <div className="mt-4 pt-2 border-t border-white/[0.05] flex items-center justify-between text-[11.5px] text-[#666]">
                    <span>{isFlipped ? "Showing Answer" : "Showing Question"}</span>
                    <span className="text-[#999] hover:text-white">Tap to Flip ↻</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
