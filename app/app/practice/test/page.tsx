/** CBT Mock Test Runner & Review Engine for StudyOS.
 * Provides authentic computer-based test interface with timer countdown,
 * question navigation palette, autosave recovery, and instant multi-dimensional evaluation. */
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { VERIFIED_QUESTION_BANK } from "../../../../lib/practice/question-bank";
import { evaluateTestAttempt } from "../../../../lib/practice/evaluator";
import {
  clearActiveSession,
  loadActiveSession,
  saveActiveSession,
  saveTestResult,
  updateActiveAttempt,
} from "../../../../lib/practice/storage";
import type { Question, QuestionOption, QuestionResult, TestAttemptState, TestPaper, TestResult } from "../../../../lib/practice/types";
import { Card, CircleChart, GhostButton, Modal, PrimaryButton, SpotCard } from "../../../../components/tracker-ui";
import { celebrate } from "../../../../lib/celebrate";

export default function MockTestRunnerPage() {
  const [paper, setPaper] = useState<TestPaper | null>(null);
  const [attempt, setAttempt] = useState<TestAttemptState | null>(null);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [filterReview, setFilterReview] = useState<"all" | "incorrect" | "correct" | "unattempted">("all");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize or restore active session
  useEffect(() => {
    const existing = loadActiveSession();
    if (existing && !existing.attempt.isCompleted) {
      setPaper(existing.paper);
      setAttempt(existing.attempt);
      return;
    }

    // If no active session, create a default practice session using verified questions
    const defaultQuestions: Question[] = VERIFIED_QUESTION_BANK.slice(0, 8);
    const newPaper: TestPaper = {
      id: `test_cbt_${Date.now()}`,
      examId: "jee-main",
      title: "All-India Engineering & Science Practice Simulation",
      category: "engineering",
      durationMinutes: 15,
      totalMarks: defaultQuestions.reduce((a, b) => a + b.marks, 0),
      questions: defaultQuestions,
      createdAt: new Date().toISOString(),
    };

    const newAttempt: TestAttemptState = {
      testId: newPaper.id,
      examId: newPaper.examId,
      title: newPaper.title,
      totalQuestions: newPaper.questions.length,
      totalMarks: newPaper.totalMarks,
      durationMinutes: newPaper.durationMinutes,
      startedAt: new Date().toISOString(),
      answers: {},
      visited: { [newPaper.questions[0]?.id || ""]: true },
      markedForReview: {},
      timeRemainingSeconds: newPaper.durationMinutes * 60,
      isCompleted: false,
    };

    saveActiveSession(newPaper, newAttempt);
    setPaper(newPaper);
    setAttempt(newAttempt);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!paper || !attempt || attempt.isCompleted || result) return;

    timerRef.current = setInterval(() => {
      setAttempt((prev: TestAttemptState | null) => {
        if (!prev) return null;
        if (prev.timeRemainingSeconds <= 1) {
          clearInterval(timerRef.current!);
          // Timer expired: auto submit
          handleAutoSubmit(prev);
          return { ...prev, timeRemainingSeconds: 0 };
        }
        const next: TestAttemptState = { ...prev, timeRemainingSeconds: prev.timeRemainingSeconds - 1 };
        updateActiveAttempt(next);
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paper, attempt?.isCompleted, result]);

  const handleAutoSubmit = (currentAttempt: TestAttemptState) => {
    if (!paper) return;
    const completed: TestAttemptState = { ...currentAttempt, isCompleted: true, submittedAt: new Date().toISOString() };
    const evaluated = evaluateTestAttempt(paper, completed);
    saveTestResult(evaluated);
    clearActiveSession();
    setResult(evaluated);
    celebrate("goal");
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (!attempt) return;
    const nextAnswers = { ...attempt.answers, [questionId]: optionId };
    const nextAttempt: TestAttemptState = { ...attempt, answers: nextAnswers };
    setAttempt(nextAttempt);
    updateActiveAttempt(nextAttempt);
  };

  const handleNumericalInput = (questionId: string, val: string) => {
    if (!attempt) return;
    const nextAnswers = { ...attempt.answers, [questionId]: val };
    const nextAttempt: TestAttemptState = { ...attempt, answers: nextAnswers };
    setAttempt(nextAttempt);
    updateActiveAttempt(nextAttempt);
  };

  const handleClearResponse = (questionId: string) => {
    if (!attempt) return;
    const nextAnswers = { ...attempt.answers };
    delete nextAnswers[questionId];
    const nextAttempt: TestAttemptState = { ...attempt, answers: nextAnswers };
    setAttempt(nextAttempt);
    updateActiveAttempt(nextAttempt);
  };

  const handleToggleMarkReview = (questionId: string) => {
    if (!attempt) return;
    const nextMarked = { ...attempt.markedForReview, [questionId]: !attempt.markedForReview[questionId] };
    const nextAttempt: TestAttemptState = { ...attempt, markedForReview: nextMarked };
    setAttempt(nextAttempt);
    updateActiveAttempt(nextAttempt);
  };

  const handleNavigate = (idx: number) => {
    if (!paper || !attempt) return;
    const targetQ = paper.questions[idx];
    if (targetQ) {
      const nextVisited = { ...attempt.visited, [targetQ.id]: true };
      const nextAttempt: TestAttemptState = { ...attempt, visited: nextVisited };
      setAttempt(nextAttempt);
      updateActiveAttempt(nextAttempt);
    }
    setCurrentIdx(idx);
  };

  const handleFinalSubmit = async () => {
    if (!paper || !attempt) return;
    setSubmitting(true);
    setShowSubmitModal(false);

    try {
      const completed: TestAttemptState = {
        ...attempt,
        isCompleted: true,
        submittedAt: new Date().toISOString(),
      };

      // Call server submit API
      const res = await fetch("/api/practice/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paper, attempt: completed }),
      });

      let evaluated: TestResult;
      if (res.ok) {
        evaluated = (await res.json()) as TestResult;
      } else {
        // Fallback local evaluator
        evaluated = evaluateTestAttempt(paper, completed);
      }

      saveTestResult(evaluated);
      clearActiveSession();
      setResult(evaluated);
      celebrate("goal");
    } catch {
      // Local evaluation fallback
      const completed: TestAttemptState = { ...attempt, isCompleted: true, submittedAt: new Date().toISOString() };
      const evaluated = evaluateTestAttempt(paper, completed);
      saveTestResult(evaluated);
      clearActiveSession();
      setResult(evaluated);
    } finally {
      setSubmitting(false);
    }
  };

  if (!paper || !attempt) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-[14px] text-[#999]">Loading examination environment...</p>
      </div>
    );
  }

  // --- RESULT VIEW ---
  if (result) {
    const filteredQuestions = result.questionResults.filter((q: QuestionResult) => {
      if (filterReview === "correct") return q.isCorrect;
      if (filterReview === "incorrect") return !q.isCorrect && q.isAttempted;
      if (filterReview === "unattempted") return !q.isAttempted;
      return true;
    });

    return (
      <div className="space-y-6">
        {/* Scorecard Hero */}
        <div className="relative overflow-hidden rounded-[20px] bg-[#141414] p-6 ring-1 ring-white/[0.08] sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <CircleChart pct={result.accuracyPercent} size={96} sub="accuracy" />
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#888]">
                  Test Evaluation Complete
                </span>
                <h1 className="display-tight text-[26px] font-bold sm:text-[32px]">
                  Score: {result.totalScore} / {result.maxMarks}
                </h1>
                <p className="mt-1 text-[13.5px] text-[#aaa]">
                  {result.title} · {Math.round(result.timeTakenSeconds / 60)}m {result.timeTakenSeconds % 60}s taken
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/app/practice">
                <PrimaryButton small>Back to Practice Lab</PrimaryButton>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Chips */}
          <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <div className="rounded-[12px] bg-[#22c55e]/10 p-3 ring-1 ring-[#22c55e]/25">
              <p className="text-[11px] font-mono uppercase text-[#4ade80]">Correct</p>
              <p className="mt-0.5 text-[20px] font-bold text-white">{result.correctCount}</p>
            </div>
            <div className="rounded-[12px] bg-[#f87171]/10 p-3 ring-1 ring-[#f87171]/25">
              <p className="text-[11px] font-mono uppercase text-[#f87171]">Incorrect</p>
              <p className="mt-0.5 text-[20px] font-bold text-white">{result.incorrectCount}</p>
            </div>
            <div className="rounded-[12px] bg-white/[0.06] p-3 ring-1 ring-white/10">
              <p className="text-[11px] font-mono uppercase text-[#999]">Skipped</p>
              <p className="mt-0.5 text-[20px] font-bold text-white">{result.unattemptedCount}</p>
            </div>
            <div className="rounded-[12px] bg-[#0099ff]/10 p-3 ring-1 ring-[#0099ff]/25">
              <p className="text-[11px] font-mono uppercase text-[#38bdf8]">Percentage</p>
              <p className="mt-0.5 text-[20px] font-bold text-white">{result.percentage}%</p>
            </div>
          </div>
        </div>

        {/* Subject & Topic Breakdown */}
        {result.subjectBreakdown.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <p className="text-[15px] font-semibold tracking-tight">Subject Performance</p>
              <div className="mt-3 space-y-3">
                {result.subjectBreakdown.map((s) => (
                  <div key={s.subjectId}>
                    <div className="flex justify-between text-[13px] mb-1">
                      <span>{s.subjectName}</span>
                      <span className="font-mono font-medium">{s.score}/{s.maxMarks} ({s.accuracy}%)</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.08]">
                      <div
                        className="h-full rounded-full bg-[#22c55e]"
                        style={{ width: `${Math.min(100, Math.max(0, s.accuracy))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <p className="text-[15px] font-semibold tracking-tight">Topic Accuracy Breakdown</p>
              <div className="mt-3 space-y-2">
                {result.topicBreakdown.map((t: { topicName: string; correct: number; total: number }, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-[10px] bg-[#1c1c1c] px-3 py-2 text-[13px] ring-1 ring-white/[0.05]"
                  >
                    <span className="truncate pr-2">{t.topicName}</span>
                    <span className="shrink-0 font-mono text-[12px] text-[#aaa]">
                      {t.correct}/{t.total} ({t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0}%)
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Detailed Question Review & Solutions */}
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-[18px] font-semibold tracking-tight">Detailed Question & Solution Review</h2>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "all", label: `All (${result.questionResults.length})` },
                { id: "incorrect", label: `Incorrect (${result.incorrectCount})` },
                { id: "correct", label: `Correct (${result.correctCount})` },
                { id: "unattempted", label: `Skipped (${result.unattemptedCount})` },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilterReview(f.id as typeof filterReview)}
                  className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
                    filterReview === f.id
                      ? "bg-white text-black"
                      : "bg-[#1c1c1c] text-[#999] ring-1 ring-white/10 hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredQuestions.map((q: QuestionResult, idx: number) => (
              <SpotCard
                key={q.questionId}
                className="rounded-[18px] bg-[#141414] p-5 ring-1 ring-white/[0.07] sm:p-6"
              >
                <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[13px] font-semibold text-white">Q{idx + 1}</span>
                    <span className="rounded-full bg-white/[0.08] px-2.5 py-0.5 text-[11px] font-medium text-[#bbb]">
                      {q.topicName}
                    </span>
                    <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[11px] text-[#888]">
                      {q.provenance === "verified_pyq" ? "Official PYQ" : "Curated Practice"}
                    </span>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${
                      q.isCorrect
                        ? "bg-[#22c55e]/15 text-[#4ade80] ring-1 ring-[#22c55e]/30"
                        : q.isAttempted
                          ? "bg-[#f87171]/15 text-[#f87171] ring-1 ring-[#f87171]/30"
                          : "bg-white/10 text-[#999]"
                    }`}
                  >
                    {q.isCorrect
                      ? `+${q.marksAwarded} Marks`
                      : q.isAttempted
                        ? `${q.marksAwarded} Marks`
                        : "0 Marks (Skipped)"}
                  </span>
                </div>

                {/* Question Text */}
                <p className="mt-4 text-[15px] font-medium leading-relaxed whitespace-pre-line text-[#f0f0f0]">
                  {q.questionText}
                </p>

                {/* Options display */}
                {q.options && q.options.length > 0 && (
                  <div className="mt-3.5 space-y-2">
                    {q.options.map((opt: QuestionOption) => {
                      const isUserChoice = String(q.userAnswer) === opt.id;
                      const isCorrectChoice = String(q.correctAnswer) === opt.id;

                      let optStyle = "bg-[#1c1c1c] text-[#ccc] ring-1 ring-white/5";
                      if (isCorrectChoice) {
                        optStyle = "bg-[#22c55e]/15 text-[#4ade80] ring-1 ring-[#22c55e]/40 font-semibold";
                      } else if (isUserChoice && !q.isCorrect) {
                        optStyle = "bg-[#f87171]/15 text-[#f87171] ring-1 ring-[#f87171]/40 font-semibold";
                      }

                      return (
                        <div
                          key={opt.id}
                          className={`flex items-center gap-3 rounded-[12px] p-3 text-[14px] ${optStyle}`}
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 font-mono text-[12px]">
                            {opt.id}
                          </span>
                          <span className="flex-1">{opt.text}</span>
                          {isCorrectChoice && <span className="text-[12px] text-[#4ade80]">✓ Correct</span>}
                          {isUserChoice && !isCorrectChoice && (
                            <span className="text-[12px] text-[#f87171]">✗ Your Choice</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Step-by-Step Solution & Explanation */}
                <div className="mt-4 rounded-[14px] bg-[#1a1a1a] p-4 ring-1 ring-white/[0.06]">
                  <p className="text-[12px] font-mono uppercase tracking-wider text-[#0099ff] font-semibold">
                    Step-by-Step Explanation
                  </p>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#ddd]">{q.explanation}</p>
                  {q.solutionSteps.length > 0 && (
                    <ol className="mt-2.5 list-decimal space-y-1 pl-4 text-[13px] text-[#bbb]">
                      {q.solutionSteps.map((step: string, sIdx: number) => (
                        <li key={sIdx}>{step}</li>
                      ))}
                    </ol>
                  )}
                  <p className="mt-2 text-[11px] text-[#666]">Source: {q.source}</p>
                </div>
              </SpotCard>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- ACTIVE CBT RUNNER VIEW ---
  const currentQ = paper.questions[currentIdx];
  const minutes = Math.floor(attempt.timeRemainingSeconds / 60);
  const seconds = attempt.timeRemainingSeconds % 60;
  const isTimeCritical = attempt.timeRemainingSeconds < 300; // less than 5 min

  const answeredCount = Object.keys(attempt.answers).length;
  const markedCount = Object.values(attempt.markedForReview).filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Top Runner Bar */}
      <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 rounded-[16px] bg-[#141414]/90 p-4 backdrop-blur-md ring-1 ring-white/10">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold tracking-tight">{paper.title}</p>
          <p className="text-[12px] text-[#888]">
            Question {currentIdx + 1} of {paper.questions.length} · Section: {currentQ.subjectName}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer Display */}
          <div
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-[14px] font-bold ring-1 ${
              isTimeCritical
                ? "bg-[#f87171]/20 text-[#f87171] ring-[#f87171]/50 animate-pulse"
                : "bg-white/[0.08] text-white ring-white/15"
            }`}
          >
            <span>⏱</span>
            <span>
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
          </div>

          {/* Submit Button */}
          <PrimaryButton small onClick={() => setShowSubmitModal(true)}>
            Submit Test
          </PrimaryButton>
        </div>
      </div>

      {/* Main Runner Body: Split Layout */}
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Left: Question Viewer Panel (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <SpotCard className="rounded-[20px] bg-[#141414] p-5 ring-1 ring-white/[0.08] sm:p-7">
            {/* Question Header */}
            <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[14px] font-bold text-white">Q.{currentIdx + 1}</span>
                <span className="rounded-full bg-white/[0.08] px-2.5 py-0.5 text-[11.5px] font-medium text-[#ccc]">
                  {currentQ.topicName}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[12px]">
                <span className="text-[#4ade80] font-semibold">+{currentQ.marks}</span>
                {currentQ.negativeMarks > 0 && (
                  <span className="text-[#f87171] font-semibold">-{currentQ.negativeMarks}</span>
                )}
              </div>
            </div>

            {/* Question Text */}
            <div className="mt-5 text-[15.5px] font-medium leading-relaxed whitespace-pre-line text-white">
              {currentQ.questionText}
            </div>

            {/* Answer Input Choices */}
            <div className="mt-6 space-y-2.5">
              {currentQ.type === "numerical" ? (
                <div>
                  <label className="mb-2 block text-[13px] font-medium text-[#ccc]">
                    Enter Numerical Value (Integer or Decimal):
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={attempt.answers[currentQ.id] !== undefined ? String(attempt.answers[currentQ.id]) : ""}
                    onChange={(e) => handleNumericalInput(currentQ.id, e.target.value)}
                    placeholder="e.g. 8 or 3.14"
                    className="h-12 w-full max-w-xs rounded-[12px] bg-[#1c1c1c] px-4 font-mono text-[16px] text-white ring-1 ring-white/15 focus:ring-[#0099ff] outline-none"
                  />
                </div>
              ) : (
                currentQ.options?.map((opt: QuestionOption) => {
                  const isSelected = String(attempt.answers[currentQ.id]) === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, opt.id)}
                      className={`flex w-full items-center gap-3.5 rounded-[14px] p-3.5 text-left text-[14.5px] transition-all ${
                        isSelected
                          ? "bg-white text-black ring-2 ring-white font-semibold"
                          : "bg-[#1c1c1c] text-[#ddd] ring-1 ring-white/[0.08] hover:bg-[#222] hover:text-white"
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[13px] ${
                          isSelected ? "bg-black text-white" : "bg-white/10 text-white"
                        }`}
                      >
                        {opt.id}
                      </span>
                      <span className="flex-1">{opt.text}</span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Action Bar */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleMarkReview(currentQ.id)}
                  className={`rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
                    attempt.markedForReview[currentQ.id]
                      ? "bg-[#a855f7] text-white"
                      : "bg-[#1c1c1c] text-[#ccc] ring-1 ring-white/10 hover:bg-[#252525]"
                  }`}
                >
                  {attempt.markedForReview[currentQ.id] ? "✓ Marked for Review" : "Mark for Review"}
                </button>
                {attempt.answers[currentQ.id] !== undefined && (
                  <button
                    type="button"
                    onClick={() => handleClearResponse(currentQ.id)}
                    className="rounded-full px-3 py-2 text-[12.5px] text-[#888] hover:text-white"
                  >
                    Clear Response
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <GhostButton
                  small
                  onClick={() => handleNavigate(Math.max(0, currentIdx - 1))}
                  danger={false}
                >
                  &larr; Previous
                </GhostButton>
                <PrimaryButton
                  small
                  onClick={() => handleNavigate(Math.min(paper.questions.length - 1, currentIdx + 1))}
                >
                  Save & Next &rarr;
                </PrimaryButton>
              </div>
            </div>
          </SpotCard>
        </div>

        {/* Right: Question Navigation Palette (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card>
            <p className="text-[14.5px] font-semibold tracking-tight">Question Palette</p>

            {/* Legend */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11.5px] text-[#aaa]">
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded bg-[#22c55e]" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded bg-[#f87171]" />
                <span>Not Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded bg-[#a855f7]" />
                <span>Marked for Review ({markedCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded bg-white/[0.12]" />
                <span>Not Visited</span>
              </div>
            </div>

            {/* Question Grid Buttons */}
            <div className="mt-4 grid grid-cols-5 gap-2">
              {paper.questions.map((q: Question, idx: number) => {
                const isCurrent = idx === currentIdx;
                const isAnswered = attempt.answers[q.id] !== undefined;
                const isMarked = attempt.markedForReview[q.id];
                const isVisited = attempt.visited[q.id];

                let btnStyle = "bg-white/[0.08] text-[#999]"; // Not visited
                if (isMarked) {
                  btnStyle = "bg-[#a855f7] text-white";
                } else if (isAnswered) {
                  btnStyle = "bg-[#22c55e] text-black font-semibold";
                } else if (isVisited) {
                  btnStyle = "bg-[#f87171]/80 text-white";
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => handleNavigate(idx)}
                    className={`relative flex h-10 w-full items-center justify-center rounded-[8px] font-mono text-[13px] transition-transform active:scale-95 ${btnStyle} ${
                      isCurrent ? "ring-2 ring-white scale-105 z-10" : ""
                    }`}
                  >
                    {idx + 1}
                    {isMarked && isAnswered && (
                      <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                    )}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation Submission Modal */}
      {showSubmitModal && (
        <Modal
          title="Submit Mock Test"
          onClose={() => setShowSubmitModal(false)}
        >
          <div className="space-y-4">
            <p className="text-[14px] text-[#ccc]">
              Are you sure you want to end this test attempt? Check your summary below:
            </p>

            <div className="grid grid-cols-2 gap-2 text-[13px]">
              <div className="rounded-[10px] bg-[#1c1c1c] p-3 ring-1 ring-white/5">
                <p className="text-[#888]">Total Questions</p>
                <p className="text-[18px] font-bold text-white">{paper.questions.length}</p>
              </div>
              <div className="rounded-[10px] bg-[#1c1c1c] p-3 ring-1 ring-white/5">
                <p className="text-[#4ade80]">Answered</p>
                <p className="text-[18px] font-bold text-white">{answeredCount}</p>
              </div>
              <div className="rounded-[10px] bg-[#1c1c1c] p-3 ring-1 ring-white/5">
                <p className="text-[#f87171]">Unanswered</p>
                <p className="text-[18px] font-bold text-white">{paper.questions.length - answeredCount}</p>
              </div>
              <div className="rounded-[10px] bg-[#1c1c1c] p-3 ring-1 ring-white/5">
                <p className="text-[#c084fc]">Marked for Review</p>
                <p className="text-[18px] font-bold text-white">{markedCount}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 pt-2">
              <GhostButton small onClick={() => setShowSubmitModal(false)}>
                Cancel & Resume
              </GhostButton>
              <PrimaryButton small onClick={handleFinalSubmit}>
                {submitting ? "Grading..." : "Confirm & Submit"}
              </PrimaryButton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
