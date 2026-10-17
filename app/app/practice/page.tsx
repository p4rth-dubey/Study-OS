/** AI Practice Lab & CBT Mock Test Hub.
 * Allows students to configure, launch, and review high-yield practice drills and full CBT mock tests. */
"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getAllExams, getExamById } from "../../../lib/exams/registry";
import { loadActiveSession, loadTestHistory } from "../../../lib/practice/storage";
import { useTracker } from "../../../lib/storage";
import type { PracticeConfig, PracticeMode, TestPaper, TestAttemptState, TestResult } from "../../../lib/practice/types";
import { Card, CircleChart, GhostButton, Pill, PrimaryButton, SpotCard, StatusTag } from "../../../components/tracker-ui";
import { Reveal } from "../../../lib/motion";

function PracticeHubPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile } = useTracker();
  const exams = getAllExams();

  const [selectedExamId, setSelectedExamId] = useState<string>("cbse-10");
  const [mode, setMode] = useState<PracticeMode>("full_mock");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeSession, setActiveSession] = useState<{ paper: TestPaper; attempt: TestAttemptState } | null>(null);
  const [history, setHistory] = useState<TestResult[]>([]);

  useEffect(() => {
    const qExam = searchParams.get("exam");
    if (qExam) {
      setSelectedExamId(qExam);
    } else if (profile?.targetExam) {
      setSelectedExamId(profile.targetExam);
    }
  }, [searchParams, profile?.targetExam]);

  useEffect(() => {
    setActiveSession(loadActiveSession());
    setHistory(loadTestHistory());
  }, []);

  const selectedExam = getExamById(selectedExamId) || exams[0];

  const handleStartPractice = async (override?: Partial<PracticeConfig>) => {
    setLoading(true);
    try {
      const config: PracticeConfig = {
        examId: override?.examId || selectedExamId,
        mode: override?.mode || mode,
        subjectId: override?.subjectId || (selectedSubjectId ? selectedSubjectId : undefined),
        questionCount: override?.questionCount || questionCount,
        durationMinutes: Math.round((override?.questionCount || questionCount) * 1.8),
      };

      const res = await fetch("/api/practice/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (!res.ok) throw new Error("Failed to generate test");
      const paper = (await res.json()) as TestPaper;

      // Initialize attempt state
      const attempt: TestAttemptState = {
        testId: paper.id,
        examId: paper.examId,
        title: paper.title,
        totalQuestions: paper.questions.length,
        totalMarks: paper.totalMarks,
        durationMinutes: paper.durationMinutes,
        startedAt: new Date().toISOString(),
        answers: {},
        visited: { [paper.questions[0]?.id || ""]: true },
        markedForReview: {},
        timeRemainingSeconds: paper.durationMinutes * 60,
        isCompleted: false,
      };

      // Store in localStorage for session recovery
      localStorage.setItem("studyos_active_paper_v1", JSON.stringify(paper));
      localStorage.setItem("studyos_active_test_v1", JSON.stringify(attempt));

      router.push("/app/practice/test");
    } catch {
      // Offline fallback: load questions from question bank directly
      router.push(`/app/practice/test?exam=${override?.examId || selectedExamId}&count=${override?.questionCount || questionCount}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Reveal>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[11px] tracking-[0.08em] text-[#777] uppercase">
              Adaptive Practice & Mock Engine
            </p>
            <h1 className="display-tight text-[26px] font-bold tracking-tight sm:text-[34px]">
              AI Practice Lab
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#22c55e]/10 px-3 py-1 text-[12px] font-semibold text-[#4ade80] ring-1 ring-[#22c55e]/25">
              <span className="h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" />
              Verified PYQs & CBT Engine
            </span>
          </div>
        </div>
      </Reveal>

      {/* Resume Active Session Banner if interrupted */}
      {activeSession && !activeSession.attempt.isCompleted && (
        <Reveal>
          <div className="flex flex-col gap-3 rounded-[16px] bg-[#f59e0b]/10 p-4 ring-1 ring-[#f59e0b]/25 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f59e0b]/20 text-[18px] text-[#fbbf24]">
                ⏱
              </span>
              <div>
                <p className="text-[14.5px] font-semibold text-[#fbbf24]">
                  In-Progress Test Attempt Detected
                </p>
                <p className="text-[12.5px] text-[#ddd]">
                  {activeSession.paper.title} · {Math.ceil(activeSession.attempt.timeRemainingSeconds / 60)}m remaining
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("studyos_active_paper_v1");
                  localStorage.removeItem("studyos_active_test_v1");
                  setActiveSession(null);
                }}
                className="rounded-full px-3 py-1.5 text-[12px] text-[#999] hover:text-white"
              >
                Discard
              </button>
              <Link href="/app/practice/test">
                <PrimaryButton small>Resume Test &rarr;</PrimaryButton>
              </Link>
            </div>
          </div>
        </Reveal>
      )}

      {/* Main Test Configurator */}
      <Reveal delay={0.05}>
        <SpotCard className="rounded-[20px] bg-[#141414] p-5 ring-1 ring-white/[0.08] sm:p-7">
          <div className="space-y-5">
            <div>
              <p className="text-[16px] font-semibold tracking-tight">Configure Practice Session</p>
              <p className="mt-1 text-[13px] text-[#999]">
                Choose target examination, blueprint mode, and question distribution.
              </p>
            </div>

            {/* Exam Selector */}
            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#ccc]">1. Target Examination</label>
              <div className="flex flex-wrap gap-2">
                {exams.map((ex) => (
                  <Pill
                    key={ex.id}
                    active={selectedExamId === ex.id}
                    onClick={() => {
                      setSelectedExamId(ex.id);
                      setSelectedSubjectId("");
                    }}
                  >
                    {ex.shortName}
                  </Pill>
                ))}
              </div>
            </div>

            {/* Practice Mode Selector */}
            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#ccc]">2. Practice Mode</label>
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { id: "full_mock" as PracticeMode, title: "Full Mock Test", desc: "Timed simulation with exam marking rules" },
                  { id: "pyq" as PracticeMode, title: "PYQ Drill", desc: "Authentic past board and entrance questions" },
                  { id: "topic" as PracticeMode, title: "Topic Practice", desc: "Focus on specific conceptual syllabus units" },
                  { id: "weak_topics" as PracticeMode, title: "Weak Areas Drill", desc: "Target lowest accuracy areas from past tests" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMode(m.id)}
                    className={`rounded-[14px] p-3.5 text-left transition-all ${
                      mode === m.id
                        ? "bg-white text-black ring-1 ring-white"
                        : "bg-[#1c1c1c] text-white ring-1 ring-white/[0.08] hover:bg-[#222]"
                    }`}
                  >
                    <p className="text-[14px] font-semibold">{m.title}</p>
                    <p className={`mt-1 text-[12px] leading-snug ${mode === m.id ? "text-black/70" : "text-[#888]"}`}>
                      {m.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Filter (if applicable) */}
            {selectedExam.subjects.length > 0 && (
              <div>
                <label className="mb-2 block text-[13px] font-medium text-[#ccc]">3. Subject Scope</label>
                <div className="flex flex-wrap gap-2">
                  <Pill
                    active={selectedSubjectId === ""}
                    onClick={() => setSelectedSubjectId("")}
                  >
                    All Subjects ({selectedExam.subjects.map((s) => s.name).join(", ")})
                  </Pill>
                  {selectedExam.subjects.map((sub) => (
                    <Pill
                      key={sub.id}
                      active={selectedSubjectId === sub.id}
                      onClick={() => setSelectedSubjectId(sub.id)}
                    >
                      {sub.name}
                    </Pill>
                  ))}
                </div>
              </div>
            )}

            {/* Question count selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[13px] font-medium text-[#ccc]">4. Number of Questions</label>
                <span className="font-mono text-[13px] text-white font-semibold">{questionCount} Questions</span>
              </div>
              <div className="flex gap-2">
                {[5, 10, 15, 25, 35].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setQuestionCount(cnt)}
                    className={`h-10 flex-1 rounded-[10px] text-[13px] font-medium transition-colors ${
                      questionCount === cnt
                        ? "bg-white text-black"
                        : "bg-[#1c1c1c] text-[#ccc] ring-1 ring-white/10 hover:bg-[#252525]"
                    }`}
                  >
                    {cnt} Qs
                  </button>
                ))}
              </div>
            </div>

            {/* Marking summary and Launch CTA */}
            <div className="flex flex-col gap-4 pt-3 border-t border-white/[0.08] sm:flex-row sm:items-center sm:justify-between">
              <div className="text-[12.5px] text-[#888]">
                <p>
                  Marking Scheme: <strong className="text-white">+{Object.values(selectedExam.markingRules)[0]?.correctMarks ?? 1}</strong> correct,{" "}
                  <strong className="text-white">-{Object.values(selectedExam.markingRules)[0]?.negativeMarks ?? 0}</strong> wrong
                </p>
                <p className="mt-0.5">Estimated Duration: ~{Math.round(questionCount * 1.8)} minutes</p>
              </div>
              <PrimaryButton onClick={() => handleStartPractice()}>
                {loading ? "Preparing Test..." : "Start Practice Session &rarr;"}
              </PrimaryButton>
            </div>
          </div>
        </SpotCard>
      </Reveal>

      {/* High Yield Quick Drills */}
      <Reveal delay={0.1}>
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[16px] font-semibold tracking-tight">High-Yield Curated Drills</h2>
            <span className="font-mono text-[12px] text-[#666]">Instant Start</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "JEE Main Physics Kinematics Drill",
                examId: "jee-main",
                subjectId: "physics",
                count: 10,
                badge: "JEE Main PYQ",
                desc: "High-probability mechanics & kinematics problems with step-by-step solutions.",
              },
              {
                title: "NEET Biology Cell & Genetics Rapid",
                examId: "neet-ug",
                subjectId: "biology",
                count: 15,
                badge: "NEET NCERT",
                desc: "100% NCERT line-by-line questions from cell biology & genetics units.",
              },
              {
                title: "CBSE Class 10 Science Board Rehearsal",
                examId: "cbse-10",
                subjectId: "science",
                count: 10,
                badge: "CBSE 2024",
                desc: "Assertion-reason and competency questions mirroring latest board pattern.",
              },
              {
                title: "UPSC Prelims Indian Polity Rapid",
                examId: "upsc-cse",
                subjectId: "gs-paper-1",
                count: 10,
                badge: "UPSC CSE",
                desc: "Constitutional articles, parliamentary procedures, and judicial landmarks.",
              },
              {
                title: "SSC CGL Arithmetic & Reasoning Speed",
                examId: "ssc-cgl",
                subjectId: "quant",
                count: 15,
                badge: "SSC CGL",
                desc: "Speed drills covering percentage, profit-loss, and TCS pattern reasoning.",
              },
              {
                title: "Banking PO Simplification & Series",
                examId: "banking-po",
                subjectId: "quant",
                count: 10,
                badge: "IBPS / SBI",
                desc: "Number series and approximation drills built for 20-minute sectional mastery.",
              },
            ].map((drill, idx) => (
              <SpotCard
                key={idx}
                className="flex flex-col justify-between rounded-[16px] bg-[#141414] p-4 ring-1 ring-white/[0.06] hover:bg-[#181818]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-white/[0.08] px-2.5 py-0.5 text-[11px] font-semibold text-[#aaa] ring-1 ring-white/10">
                      {drill.badge}
                    </span>
                    <span className="font-mono text-[11px] text-[#777]">{drill.count} Questions</span>
                  </div>
                  <p className="mt-2 text-[14.5px] font-semibold leading-tight">{drill.title}</p>
                  <p className="mt-1 text-[12.5px] text-[#888] leading-relaxed">{drill.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/[0.05] flex justify-end">
                  <GhostButton
                    small
                    onClick={() =>
                      handleStartPractice({
                        examId: drill.examId,
                        subjectId: drill.subjectId,
                        questionCount: drill.count,
                        mode: "pyq",
                      })
                    }
                  >
                    Start Drill &rarr;
                  </GhostButton>
                </div>
              </SpotCard>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Past Test History */}
      <Reveal delay={0.15}>
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[16px] font-semibold tracking-tight">Recent Mock Tests & Scores</h2>
            <span className="font-mono text-[12px] text-[#666]">{history.length} completed</span>
          </div>

          {history.length === 0 ? (
            <Card className="py-8 text-center">
              <p className="text-[15px] font-medium text-[#ccc]">No mock test attempts recorded yet.</p>
              <p className="mt-1 text-[13px] text-[#777]">
                Start your first practice session above to unlock performance analytics and accuracy tracking.
              </p>
            </Card>
          ) : (
            <div className="space-y-2.5">
              {history.map((test) => (
                <div
                  key={test.testId}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-[16px] bg-[#141414] p-4 ring-1 ring-white/[0.06]"
                >
                  <div className="flex items-center gap-4">
                    <CircleChart pct={test.accuracyPercent} size={54} />
                    <div>
                      <p className="text-[14.5px] font-semibold tracking-tight">{test.title}</p>
                      <p className="text-[12px] text-[#888]">
                        Score: <strong className="text-white">{test.totalScore}/{test.maxMarks}</strong> ·{" "}
                        {test.correctCount} correct · {test.incorrectCount} wrong · {test.unattemptedCount} skipped ·{" "}
                        {Math.round(test.timeTakenSeconds / 60)}m taken
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="font-mono text-[11px] text-[#666]">
                      {new Date(test.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Reveal>
    </div>
  );
}

export default function PracticeHubPage() {
  return (
    <Suspense>
      <PracticeHubPageInner />
    </Suspense>
  );
}
