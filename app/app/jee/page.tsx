/** JEE Command Center — Dedicated Engineering entrance portal for JEE Main & Advanced.
 * Features 1-click profile target activation, CBT mock test launchers,
 * live syllabus mastery, and official NTA resources. */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTracker } from "../../../lib/storage";
import { EXAM_REGISTRY } from "../../../lib/exams/registry";
import { JEE_SUBJECTS, scopedChapterId } from "../../../lib/chapters";
import { calculateSubjectPace } from "../../../lib/planner";
import { Card, GhostButton, PrimaryButton } from "../../../components/tracker-ui";
import { celebrate } from "../../../lib/celebrate";

export default function JeePage() {
  const store = useTracker();
  const router = useRouter();
  const { profile, ready } = store;
  const exam = EXAM_REGISTRY["jee-main"];

  if (!ready) return null;

  const isCurrentTarget = profile?.targetExam === "jee-main" || profile?.targetExam === "jee-advanced";

  const handleSetTarget = () => {
    if (!profile) return;
    store.updateTargetExam("jee-main");
    celebrate("goal");
  };

  // Compute live subject stats
  const subjectStats = JEE_SUBJECTS.map((sub) => {
    let totalChapters = 0;
    let completedChapters = 0;
    for (const g of sub.groups) {
      for (const ch of g.chapters) {
        totalChapters++;
        const prog = profile?.progress?.[`${sub.id}.${ch.id}`];
        if (prog && prog.revision === "done") {
          completedChapters++;
        } else if (prog && prog.pyq === "done") {
          completedChapters++;
        }
      }
    }
    const pace = profile ? calculateSubjectPace(profile, sub) : null;
    return {
      sub,
      totalChapters,
      completedChapters,
      pace,
    };
  });

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#0284c7]/20 via-[#0369a1]/10 to-transparent p-6 ring-1 ring-[#0284c7]/30 sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#0284c7]/20 px-3 py-1 font-mono text-[11px] font-bold text-[#38bdf8] uppercase">
                Engineering Stream
              </span>
              <span className="text-[12px] text-[#888]">NTA · JEE 2026</span>
            </div>
            <h1 className="mt-2 text-[26px] font-bold tracking-tight text-white sm:text-[34px]">
              JEE Command Center
            </h1>
            <p className="mt-1 max-w-xl text-[14px] text-[#aaa]">
              Joint Entrance Examination (Main &amp; Advanced). Track Physics, Chemistry, and Mathematics
              with verified PYQs, Computer-Based Test (CBT) mock exams, and pace modeling.
            </p>
          </div>

          <div className="shrink-0">
            {isCurrentTarget ? (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-400 ring-1 ring-emerald-500/30">
                <span>✓ Active Target Exam</span>
              </div>
            ) : (
              <PrimaryButton onClick={handleSetTarget}>
                Set as My Primary Goal →
              </PrimaryButton>
            )}
          </div>
        </div>
      </div>

      {/* CBT Quick Mock Launchers */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-semibold text-white">Full-Length CBT Mock Tests</h2>
            <p className="text-[13px] text-[#999]">
              Real NTA pattern (+4/-1, timed 180 min, section palette, autosave recovery).
            </p>
          </div>
          <Link
            href="/app/practice?exam=jee-main"
            className="text-[13px] font-medium text-[#38bdf8] hover:underline"
          >
            All Practice Modes →
          </Link>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[16px] bg-[#1a1a1a] p-4 ring-1 ring-white/10">
            <span className="rounded-full bg-[#38bdf8]/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#38bdf8]">
              Full Mock
            </span>
            <h3 className="mt-2 font-semibold text-white">JEE Main Full Mock 2026</h3>
            <p className="mt-1 text-[12px] text-[#888]">
              75 Questions · 300 Marks · 180 Min. Includes Physics, Chemistry, Mathematics.
            </p>
            <div className="mt-4">
              <Link
                href="/app/practice/test?exam=jee-main&mode=mock"
                className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-white px-3 text-[13px] font-semibold text-black transition-transform active:scale-95"
              >
                Launch Mock CBT →
              </Link>
            </div>
          </div>

          <div className="rounded-[16px] bg-[#1a1a1a] p-4 ring-1 ring-white/10">
            <span className="rounded-full bg-[#f59e0b]/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#f59e0b]">
              High-Yield
            </span>
            <h3 className="mt-2 font-semibold text-white">Physics &amp; Maths Speed Drill</h3>
            <p className="mt-1 text-[12px] text-[#888]">
              20 Questions · Mechanics, Electrodynamics &amp; Calculus high-frequency topics.
            </p>
            <div className="mt-4">
              <Link
                href="/app/practice/test?exam=jee-main&mode=pyq"
                className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-white/10 px-3 text-[13px] font-semibold text-white ring-1 ring-white/20 hover:bg-white/15"
              >
                Start Drill →
              </Link>
            </div>
          </div>

          <div className="rounded-[16px] bg-[#1a1a1a] p-4 ring-1 ring-white/10">
            <span className="rounded-full bg-[#a855f7]/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#a855f7]">
              Subject Test
            </span>
            <h3 className="mt-2 font-semibold text-white">Chemistry NCERT Reactions</h3>
            <p className="mt-1 text-[12px] text-[#888]">
              15 Questions · Organic mechanisms, Chemical Bonding, and Coordination.
            </p>
            <div className="mt-4">
              <Link
                href="/app/practice/test?exam=jee-main&mode=chapter&subject=chemistry"
                className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-white/10 px-3 text-[13px] font-semibold text-white ring-1 ring-white/20 hover:bg-white/15"
              >
                Start Chemistry →
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {/* Subject-Wise Syllabus Mastery */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[18px] font-semibold text-white">Syllabus Breakdown &amp; Checklists</h2>
          <Link
            href="/app/chapters"
            className="text-[13px] font-medium text-[#38bdf8] hover:underline"
          >
            Open Interactive Chapters Tracker →
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {subjectStats.map(({ sub, totalChapters, completedChapters, pace }) => (
            <div
              key={sub.id}
              className="flex flex-col justify-between rounded-[18px] bg-[#141414] p-4 ring-1 ring-white/10"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-[16px] font-bold text-white">{sub.name}</h3>
                  <span className="font-mono text-[12px] text-[#888]">
                    {sub.groups.flatMap((g) => g.chapters).length} Ch
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[#0284c7]"
                      style={{
                        width: `${pace ? pace.completionPercentage : 0}%`,
                      }}
                    />
                  </div>
                  <span className="font-mono text-[12px] font-bold text-white">
                    {pace ? pace.completionPercentage : 0}%
                  </span>
                </div>
                <p className="mt-2 text-[12.5px] text-[#999]">
                  {pace ? `${pace.remainingStages} stages pending` : `${totalChapters} chapters in syllabus`}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06]">
                <Link
                  href={`/app/chapters?subject=${sub.id}`}
                  className="flex items-center justify-between text-[13px] font-medium text-[#38bdf8] hover:underline"
                >
                  <span>Track {sub.name} chapters</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Official Guidelines & Exam Pattern */}
      <Card>
        <h2 className="text-[17px] font-semibold text-white">Official Pattern &amp; Conduct Details</h2>
        <div className="mt-3 grid gap-3 text-[13px] text-[#bbb] sm:grid-cols-2">
          <div className="rounded-xl bg-[#1c1c1c] p-3.5 ring-1 ring-white/[0.06]">
            <p className="font-semibold text-white">Conducting Authority</p>
            <p className="mt-0.5 text-[#888]">National Testing Agency (NTA)</p>
            <a
              href="https://jeemain.nta.nic.in/"
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-[#38bdf8] hover:underline"
            >
              Official Portal: jeemain.nta.nic.in ↗
            </a>
          </div>

          <div className="rounded-xl bg-[#1c1c1c] p-3.5 ring-1 ring-white/[0.06]">
            <p className="font-semibold text-white">Marking Scheme</p>
            <p className="mt-0.5 text-[#888]">+4 for correct MCQ/Numerical, -1 for negative marking, 0 unattempted.</p>
            <Link
              href="/app/updates"
              className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-[#38bdf8] hover:underline"
            >
              View 2026 Notification &amp; Datesheets →
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
