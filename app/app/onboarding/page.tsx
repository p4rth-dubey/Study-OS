/** Onboarding — Google Auth gate + 4 personalization steps.
 *
 * Flow:
 *   Step 0 (auth)  — Sign in with Google (or continue as guest)
 *   Step 1 (details)  — Name auto-filled from Google; pick target exam
 *   Step 2 (datesheet) — Exam dates
 *   Step 3 (syllabus)  — Chapter checklist
 *   Step 4 (backfill)  — Credit already-done work
 *
 * Google name & avatar are pulled from the Supabase session and pre-filled
 * into the student name field, so returning users skip typing it.
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { useTracker, type Datesheet } from "../../../lib/storage";
import { getSubjectsForProfile, scopedChapterId } from "../../../lib/chapters";
import {
  Card,
  DateField,
  Field,
  GhostButton,
  PrimaryButton,
  inputCls,
} from "../../../components/tracker-ui";
import SyllabusChecklist from "../../../components/syllabus-checklist";
import { SmoothScroll, reducedMotion } from "../../../lib/motion";
import { celebrate } from "../../../lib/celebrate";
import { BrandMark } from "../../../components/site-header";
import { useAuthUser, signInWithGoogle, signOut } from "../../../lib/auth/helpers";

const STEPS = [
  { n: "01", title: "Details", copy: "Who's studying & target goal." },
  { n: "02", title: "Datesheet", copy: "Pace plans backwards from these." },
  { n: "03", title: "Syllabus", copy: "Only your real exam chapters." },
  { n: "04", title: "Backfill", copy: "Credit work already done." },
];

export const EXAM_GOALS = [
  { id: "cbse-10", grade: 10, title: "CBSE Class 10", subtitle: "Science, Maths, Social Science", tag: "School Board" },
  { id: "cbse-9", grade: 9, title: "CBSE Class 9", subtitle: "Science, Maths, Social Science", tag: "School Prep" },
  { id: "jee-main", grade: 12, title: "JEE Main / Advanced", subtitle: "Physics, Chemistry, Mathematics", tag: "Engineering" },
  { id: "neet-ug", grade: 12, title: "NEET-UG", subtitle: "Biology, Physics, Chemistry", tag: "Medical" },
  { id: "upsc-cse", grade: 12, title: "UPSC Civil Services", subtitle: "GS Paper 1, CSAT & Current Affairs", tag: "Civil Services" },
  { id: "ssc-cgl", grade: 12, title: "SSC CGL", subtitle: "Quant, Reasoning, English, General Awareness", tag: "Staff Selection" },
  { id: "banking-po", grade: 12, title: "Banking PO (SBI/IBPS)", subtitle: "Quantitative Aptitude, Reasoning, English", tag: "Banking" },
] as const;

function daysUntil(iso: string): number | null {
  if (!iso) return null;
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return Math.round((d.getTime() - t.getTime()) / 86400000);
}

/* ─── Google Sign-In gate (step 0) ─── */

function AuthGate({ onContinue }: { onContinue: () => void }) {
  const { user, loading } = useAuthUser();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setSigningIn(true); 
      setError(null);
      await signInWithGoogle("/app/onboarding");
      // signInWithGoogle triggers a full-page redirect, so nothing after this runs.
    } catch (err) {
      setError((err as Error).message ?? "Sign-in failed. Please try again.");
      setSigningIn(false);
    }
  };

  // If already signed in, jump straight past the gate.
  useEffect(() => {
    if (!loading && user) {
      onContinue();
    }
  }, [loading, user, onContinue]);

  if (loading) {
    return (
      <div className="flex min-h-[340px] items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-center">
      <div className="space-y-2">
        <h2 className="text-[26px] font-semibold tracking-tight">Welcome to StudyOS</h2>
        <p className="mx-auto max-w-sm text-[15px] text-[#999]">
          Sign in with Google to sync your progress across devices and never lose your study data.
        </p>
      </div>

      {/* Google Sign-In button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={signingIn}
        className="mx-auto flex min-h-[52px] w-full max-w-xs items-center justify-center gap-3 rounded-[14px] bg-white px-5 font-semibold text-black shadow-lg transition-all hover:bg-white/90 active:scale-[0.98] disabled:opacity-60"
      >
        {signingIn ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
        ) : (
          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
        )}
        {signingIn ? "Redirecting to Google…" : "Continue with Google"}
      </button>

      {error && (
        <p className="text-center text-[13px] text-red-400">{error}</p>
      )}

      {/* Divider */}
      <div className="relative">
        <span className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10" />
        </span>
        <span className="relative flex justify-center">
          <span className="bg-[#141414] px-3 text-[12px] text-[#666]">or</span>
        </span>
      </div>

      {/* Continue as guest */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={onContinue}
          className="mx-auto flex w-full max-w-xs items-center justify-center gap-2 rounded-[14px] bg-white/[0.06] px-5 py-3.5 text-[15px] font-medium text-[#ccc] ring-1 ring-white/10 transition-all hover:bg-white/[0.1] active:scale-[0.98]"
        >
          Continue without signing in
        </button>
        <p className="text-[12px] text-[#666]">
          Your data stays on this device only. You won&apos;t be able to sync across devices.
        </p>
      </div>

      {/* Trust badges */}
      <div className="flex flex-wrap justify-center gap-2 pt-2">
        {["No ads", "100% Free", "Offline-first", "Open source"].map((t) => (
          <span
            key={t}
            className="rounded-full bg-white/[0.06] px-3 py-1.5 text-[11px] font-medium text-[#bbb] ring-1 ring-white/10"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Main onboarding page ─── */

export default function OnboardingPage() {
  const store = useTracker();
  const router = useRouter();
  const { user } = useAuthUser();

  // Step 0 = auth gate; Steps 1-4 = the existing personalization flow.
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [targetExam, setTargetExam] = useState<string>("cbse-10");
  const [grade, setGrade] = useState(10);
  const [datesheet, setDatesheet] = useState<Datesheet>({ science: "", maths: "", sst: "" });
  const [syllabus, setSyllabus] = useState<Record<string, string[]> | null>(null);
  const [backfilled, setBackfilled] = useState<Record<string, boolean>>({});
  const bodyRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  // Auto-fill name from Google account when user signs in.
  useEffect(() => {
    if (user?.name && !name) {
      setName(user.name.trim().slice(0, 40));
    }
  }, [user, name]);

  useEffect(() => {
    if (!reducedMotion()) {
      if (bodyRef.current)
        gsap.fromTo(
          bodyRef.current,
          { opacity: 0, x: 28 },
          { opacity: 1, x: 0, duration: 0.55, ease: "power3.out" }
        );
      if (step >= 1 && barRef.current)
        gsap.to(barRef.current, {
          width: `${(step / 4) * 100}%`,
          duration: 0.6,
          ease: "power3.out",
        });
    }
  }, [step]);

  if (!store.ready) return null;

  const currentSubjects = getSubjectsForProfile({ grade, targetExam });

  const handleSelectGoal = (id: string, g: number) => {
    setTargetExam(id);
    setGrade(g);
  };

  const startSyllabus = () => {
    const full: Record<string, string[]> = {};
    for (const s of currentSubjects) {
      full[s.id] = s.groups.flatMap((g) =>
        g.chapters.map((ch) => scopedChapterId(s.id, g.id, ch.id, targetExam || grade))
      );
    }
    setSyllabus(full);
    setStep(3);
  };

  const finish = (withBackfill: boolean) => {
    store.createProfile({
      name: name.trim() || user?.name || "Student",
      grade,
      targetExam,
      datesheet,
      examSyllabus: syllabus,
    });
    if (withBackfill) {
      const bySubject: Record<string, string[]> = {};
      for (const [key, v] of Object.entries(backfilled)) {
        if (!v) continue;
        const [sid, cid] = key.split("|");
        (bySubject[sid] = bySubject[sid] ?? []).push(cid);
      }
      for (const [sid, cids] of Object.entries(bySubject)) store.backfill(sid, cids, true);
    }
    celebrate("goal");
    router.replace("/app/dashboard");
  };

  const datesSet = currentSubjects.filter((s) => datesheet[s.examKey || s.id]).length;
  const selectedCount = syllabus ? Object.values(syllabus).reduce((n, a) => n + a.length, 0) : 0;
  const totalCount = currentSubjects.reduce(
    (n, s) => n + s.groups.reduce((m, g) => m + g.chapters.length, 0),
    0
  );
  const backfillCount = Object.values(backfilled).filter(Boolean).length;

  return (
    <SmoothScroll>
      <section className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute top-[-180px] left-1/2 h-[380px] w-[720px] max-w-full -translate-x-1/2 rounded-full opacity-25 blur-[130px]"
          style={{ background: "linear-gradient(135deg, #6a4cf5, #d44df0, #ff7a3d)" }}
        />
        <div className="relative mx-auto max-w-5xl px-4 pt-6 pb-10 lg:pt-10">
          <div className="text-center">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-2 text-xs font-medium tracking-wide text-[#ccc] ring-1 ring-white/10">
              <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#22c55e]" />
              <BrandMark size={18} />
              Personalized setup · takes 2 minutes
            </p>
            <h1 className="display-tight mx-auto mt-5 max-w-2xl text-[40px] sm:text-[56px]">
              Set up your prep.
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-[16px] text-[#999]">
              {step === 0
                ? "Sign in to sync your progress, then personalise your dashboard in four quick steps."
                : "Four quick steps. Choose your exam, syllabus, and target dates — your whole dashboard adapts instantly."}
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[280px_1fr]">
            {/* Rail — hidden on step 0 (auth gate) */}
            {step > 0 && (
              <aside className="hidden lg:block">
                <ol className="relative space-y-1.5">
                  <span aria-hidden className="absolute top-5 bottom-5 left-[27px] w-px bg-white/10" />
                  {STEPS.map((s, i) => {
                    const idx = i + 1;
                    const active = idx === step;
                    const done = idx < step;
                    return (
                      <li
                        key={s.n}
                        aria-current={active ? "step" : undefined}
                        className={`relative rounded-[15px] p-4 ring-1 transition-all ${
                          active
                            ? "bg-white text-black ring-white"
                            : done
                              ? "bg-[#141414] ring-white/10"
                              : "bg-[#101010] ring-white/[0.05]"
                        }`}
                      >
                        <p className={`font-mono text-[12px] ${active ? "text-black/60" : "text-[#666]"}`}>
                          {done ? "✓" : s.n}
                        </p>
                        <p className="mt-0.5 text-[15px] font-semibold tracking-tight">{s.title}</p>
                        <p className={`text-[13px] ${active ? "text-black/60" : "text-[#777]"}`}>{s.copy}</p>
                        {active && (
                          <span
                            aria-hidden
                            className="absolute top-1/2 -right-[9px] hidden h-4 w-4 -translate-y-1/2 rotate-45 bg-white lg:block"
                          />
                        )}
                      </li>
                    );
                  })}
                </ol>
                {/* Google account badge (if signed in) */}
                {user && (
                  <div className="mt-4 flex items-center gap-3 rounded-[16px] bg-white/[0.05] p-3.5 ring-1 ring-white/10">
                    {user.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.avatarUrl}
                        alt={user.name ?? "User avatar"}
                        className="h-9 w-9 rounded-full ring-1 ring-white/20"
                      />
                    ) : (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[16px] font-bold text-black">
                        {(user.name?.charAt(0) ?? "U").toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-white">{user.name}</p>
                      <p className="truncate text-[11px] text-[#888]">{user.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => signOut().then(() => setStep(0))}
                      className="shrink-0 text-[11px] text-[#666] hover:text-[#999]"
                    >
                      Sign out
                    </button>
                  </div>
                )}
                <div
                  className="mt-4 rounded-[20px] p-5"
                  style={{ background: "linear-gradient(150deg, #6a4cf5, #d44df0 60%, #ff5577)" }}
                >
                  <p className="text-[15px] font-semibold tracking-tight">Tailored Experience</p>
                  <p className="mt-1 text-[14px] leading-relaxed opacity-90">
                    Whether you are preparing for Class 10 Boards, cracking JEE, or clearing NEET,
                    your navigation, checklist, and practice tests match your goal.
                  </p>
                </div>
              </aside>
            )}

            {/* Form card */}
            <Card className={`glow-ring relative overflow-hidden sm:p-7 ${step === 0 ? "lg:col-span-2" : ""}`}>
              <div
                aria-hidden
                className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full opacity-[0.12] blur-[80px]"
                style={{ background: "linear-gradient(135deg, #6a4cf5, #ff7a3d)" }}
              />

              {/* Step 0 — Auth gate */}
              {step === 0 && (
                <div ref={bodyRef} className="relative">
                  <AuthGate onContinue={() => setStep(1)} />
                </div>
              )}

              {/* Steps 1–4 — Personalization form */}
              {step > 0 && (
                <>
                  <div className="relative flex items-center justify-between">
                    <p className="text-[13px] font-medium tracking-wide text-[#999] uppercase">
                      Step {step} of 4 · {STEPS[step - 1].title}
                    </p>
                    <p className="tnum font-mono text-[12px] text-[#666]">{Math.round((step / 4) * 100)}%</p>
                  </div>
                  <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-white/[0.08]">
                    <span
                      ref={barRef}
                      className="block h-full rounded-full"
                      style={{
                        width: `${(step / 4) * 100}%`,
                        background: "linear-gradient(90deg, #6a4cf5, #d44df0, #ff7a3d)",
                      }}
                    />
                  </div>

                  {/* Mobile step dots */}
                  <ol className="relative mt-4 flex gap-2 lg:hidden" aria-label="Progress">
                    {STEPS.map((s, i) => (
                      <li key={s.n} className="flex-1">
                        <span
                          className={`block h-1.5 rounded-full transition-colors ${i + 1 <= step ? "bg-white" : "bg-white/10"}`}
                        />
                        <span className={`mt-1 block text-[11px] font-medium ${i + 1 === step ? "text-white" : "text-[#666]"}`}>
                          {s.title}
                        </span>
                      </li>
                    ))}
                  </ol>

                  <div ref={bodyRef} key={step} className="relative mt-6">
                    {/* ── Step 1 — Details ── */}
                    {step === 1 && (
                      <form
                        className="space-y-5"
                        onSubmit={(e) => {
                          e.preventDefault();
                          setStep(2);
                        }}
                      >
                        <h2 className="text-[22px] font-semibold tracking-tight">Who&apos;s studying?</h2>
                        <Field label="Student name">
                          <div className="flex items-center gap-3">
                            {user?.avatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={user.avatarUrl}
                                alt="Avatar"
                                className="h-12 w-12 shrink-0 rounded-full ring-1 ring-white/20"
                              />
                            ) : (
                              <span
                                aria-hidden
                                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[19px] font-bold text-black ring-1 ring-white/20"
                              >
                                {(name.trim().charAt(0) || "S").toUpperCase()}
                              </span>
                            )}
                            <input
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="e.g. Aarav"
                              required
                              autoFocus
                              maxLength={40}
                              className={inputCls}
                            />
                          </div>
                          {user && (
                            <p className="mt-1.5 text-[12px] text-[#666]">
                              ✓ Signed in as {user.email}
                            </p>
                          )}
                        </Field>

                        <Field label="Target Examination / Goal">
                          <div role="radiogroup" aria-label="Target Examination" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {EXAM_GOALS.map((opt) => {
                              const active = targetExam === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  role="radio"
                                  aria-checked={active}
                                  onClick={() => handleSelectGoal(opt.id, opt.grade)}
                                  className={`flex flex-col justify-between rounded-[14px] p-3.5 text-left ring-1 transition-all active:scale-[0.98] ${
                                    active
                                      ? "bg-white text-black ring-white shadow-lg"
                                      : "bg-[#1c1c1c] ring-white/10 hover:bg-[#242424]"
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <span className="font-semibold text-[14.5px]">{opt.title}</span>
                                    <span
                                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                        active ? "bg-black/10 text-black" : "bg-white/10 text-[#bbb]"
                                      }`}
                                    >
                                      {opt.tag}
                                    </span>
                                  </div>
                                  <span className={`mt-1 text-[12px] leading-relaxed ${active ? "text-black/70" : "text-[#888]"}`}>
                                    {opt.subtitle}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </Field>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {["Offline-first", "No password needed", "100% Free", "Adaptive Curriculum"].map((t) => (
                            <span
                              key={t}
                              className="rounded-full bg-white/[0.06] px-3 py-1.5 text-[12px] font-medium text-[#bbb] ring-1 ring-white/10"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                        <PrimaryButton type="submit">Next: datesheet →</PrimaryButton>
                      </form>
                    )}

                    {/* ── Step 2 — Datesheet ── */}
                    {step === 2 && (
                      <form
                        className="space-y-4"
                        onSubmit={(e) => {
                          e.preventDefault();
                          startSyllabus();
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h2 className="text-[22px] font-semibold tracking-tight">Exam datesheet</h2>
                            <p className="-mt-0.5 text-[14px] text-[#999]">
                              Pace is planned backwards from these dates for each subject.
                            </p>
                          </div>
                          <span className="tnum shrink-0 rounded-full bg-white/[0.07] px-3 py-1.5 font-mono text-[12px] font-bold ring-1 ring-white/10">
                            {datesSet}/{currentSubjects.length} set
                          </span>
                        </div>

                        {currentSubjects.map((sub, idx) => {
                          const key = sub.examKey || sub.id;
                          const left = daysUntil(datesheet[key] ?? "");
                          const dotColors = ["bg-[#6a4cf5]", "bg-[#d44df0]", "bg-[#ff7a3d]", "bg-[#10b981]", "bg-[#0284c7]"];
                          const dot = dotColors[idx % dotColors.length];
                          return (
                            <div key={key} className="rounded-[14px] bg-[#1c1c1c]/60 p-3 ring-1 ring-white/[0.05]">
                              <div className="mb-1 flex items-center gap-2 px-1">
                                <span aria-hidden className={`h-2 w-2 rounded-full ${dot}`} />
                                <span className="text-[13px] font-semibold">{sub.name}</span>
                                {left !== null && (
                                  <span className={`ml-auto text-[12px] font-medium ${left < 0 ? "text-[#f87171]" : "text-[#4ade80]"}`}>
                                    {left < 0 ? `${Math.abs(left)}d ago — update?` : left === 0 ? "exam today?!" : `in ${left}d`}
                                  </span>
                                )}
                              </div>
                              <DateField
                                label={`${sub.name} exam date`}
                                value={datesheet[key]}
                                required
                                onChange={(v) => setDatesheet((d) => ({ ...d, [key]: v }))}
                              />
                            </div>
                          );
                        })}

                        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                          <GhostButton onClick={() => setStep(1)}>← Back</GhostButton>
                          <PrimaryButton type="submit">Next: syllabus →</PrimaryButton>
                        </div>
                      </form>
                    )}

                    {/* ── Step 3 — Syllabus ── */}
                    {step === 3 && syllabus && (
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h2 className="text-[22px] font-semibold tracking-tight">Exam syllabus</h2>
                            <p className="mt-1 text-[14px] text-[#999]">
                              Uncheck chapters NOT in your target syllabus — daily pace stays honest.
                            </p>
                          </div>
                          <span className="tnum shrink-0 rounded-full bg-white/[0.07] px-3 py-1.5 font-mono text-[12px] font-bold ring-1 ring-white/10">
                            {selectedCount}/{totalCount}
                          </span>
                        </div>
                        <div className="mt-4 max-h-[46dvh] overflow-y-auto pr-1">
                          <SyllabusChecklist grade={grade} targetExam={targetExam} value={syllabus} onChange={setSyllabus} />
                        </div>
                        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                          <GhostButton onClick={() => setStep(2)}>← Back</GhostButton>
                          <PrimaryButton onClick={() => setStep(4)}>Next: finished work →</PrimaryButton>
                        </div>
                      </div>
                    )}

                    {/* ── Step 4 — Backfill ── */}
                    {step === 4 && syllabus && (
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h2 className="text-[22px] font-semibold tracking-tight">Already finished anything?</h2>
                            <p className="mt-1 text-[14px] text-[#999]">
                              Tap chapters you&apos;ve fully completed — or skip. Everything stays editable.
                            </p>
                          </div>
                          {backfillCount > 0 && (
                            <span className="tnum shrink-0 rounded-full bg-[#22c55e]/10 px-3 py-1.5 font-mono text-[12px] font-bold text-[#4ade80] ring-1 ring-[#22c55e]/25">
                              {backfillCount} done
                            </span>
                          )}
                        </div>
                        <div className="mt-4 max-h-[42dvh] space-y-3 overflow-y-auto pr-1">
                          {currentSubjects.map((s) => {
                            const rows = s.groups.flatMap((g) =>
                              g.chapters
                                .filter((ch) =>
                                  (syllabus[s.id] ?? []).includes(
                                    scopedChapterId(s.id, g.id, ch.id, targetExam || grade)
                                  )
                                )
                                .map((ch) => ({ ch }))
                            );
                            if (rows.length === 0) return null;
                            const doneInSub = rows.filter(({ ch }) => backfilled[`${s.id}|${ch.id}`]).length;
                            const allOn = doneInSub === rows.length;
                            return (
                              <div
                                key={s.id}
                                className="overflow-hidden rounded-[14px] bg-[#1c1c1c]/60 ring-1 ring-white/[0.05]"
                              >
                                <div className="flex min-h-[48px] items-center justify-between gap-2 px-3.5">
                                  <p className="text-[14px] font-semibold">
                                    {s.name}{" "}
                                    <span className="tnum font-mono text-[12px] font-normal text-[#888]">
                                      {doneInSub}/{rows.length}
                                    </span>
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setBackfilled((b) => {
                                        const next = { ...b };
                                        for (const { ch } of rows) next[`${s.id}|${ch.id}`] = !allOn;
                                        return next;
                                      })
                                    }
                                    className="min-h-[36px] rounded-full px-3 text-[12.5px] font-semibold text-[#0099ff] hover:bg-white/[0.06]"
                                  >
                                    {allOn ? "Clear" : "Select all"}
                                  </button>
                                </div>
                                <div className="space-y-1.5 px-2 pb-2">
                                  {rows.map(({ ch }) => {
                                    const key = `${s.id}|${ch.id}`;
                                    const done = !!backfilled[key];
                                    return (
                                      <button
                                        key={key}
                                        type="button"
                                        onClick={() => setBackfilled((b) => ({ ...b, [key]: !b[key] }))}
                                        aria-pressed={done}
                                        className={`flex min-h-[52px] w-full items-center justify-between gap-3 rounded-[10px] px-3.5 text-left ring-1 transition-all active:scale-[0.99] ${
                                          done
                                            ? "bg-white text-black ring-white"
                                            : "bg-[#1c1c1c] ring-white/[0.06] hover:bg-[#222]"
                                        }`}
                                      >
                                        <span className="text-[14px] font-medium">
                                          Ch {ch.no}: {ch.name}
                                        </span>
                                        <span className="shrink-0 text-[13px] font-semibold">
                                          {done ? "✓ Done" : "Mark"}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                          <GhostButton onClick={() => finish(false)}>Skip &amp; finish</GhostButton>
                          <PrimaryButton onClick={() => finish(true)}>Start tracking →</PrimaryButton>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>
      </section>
    </SmoothScroll>
  );
}
