/** Smart planning tools embedded in the to-do list. */
"use client";

import { useState } from "react";
import { useTracker, type Todo } from "../lib/storage";
import { getSubjectsForProfile, scopedChapterId } from "../lib/chapters";
import { getStageKeys } from "../lib/stages";
import { Card, PrimaryButton } from "./tracker-ui";

const DAY = 86_400_000;
const pad = (value: number) => String(value).padStart(2, "0");
const iso = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const shift = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
const until = (date?: string) => date ? Math.round((new Date(`${date}T12:00:00`).getTime() - new Date().setHours(0, 0, 0, 0)) / DAY) : null;

function indianStudyDay(date: string): { mode: "holiday" | "festival"; name: string } | null {
  const local = new Date(`${date}T12:00:00`);
  // Sundays and fixed-date observances apply every year.
  if (local.getDay() === 0) return { mode: "holiday", name: "Sunday" };
  const [, month, day] = date.split("-");
  const fixed: Record<string, string> = {
    "01-01": "New Year’s Day",
    "01-26": "Republic Day",
    "08-15": "Independence Day",
    "10-02": "Gandhi Jayanti",
    "12-25": "Christmas",
  };
  if (fixed[`${month}-${day}`]) return { mode: "holiday", name: fixed[`${month}-${day}`] };

  // Lunar dates change annually. These verified 2026 dates keep this year's
  // planner accurate; regional/family dates can still be overridden below.
  const festivals2026: Record<string, string> = {
    "2026-03-04": "Holi",
    "2026-03-21": "Eid al-Fitr",
    "2026-08-28": "Raksha Bandhan",
    "2026-11-08": "Diwali",
  };
  return festivals2026[date] ? { mode: "festival", name: festivals2026[date] } : null;
}

export default function StudyPlanning() {
  const store = useTracker();
  const { profile } = store;
  const [testName, setTestName] = useState("");
  const [testSubject, setTestSubject] = useState("");
  const [testDate, setTestDate] = useState("");
  const [weekOffset, setWeekOffset] = useState(0);
  if (!profile) return null;

  const subjects = getSubjectsForProfile(profile);
  const stages = getStageKeys(profile.targetExam || profile.grade);
  const upcoming = [
    ...(profile.todos ?? []).filter((todo) => todo.kind === "test" && todo.dueDate).map((todo) => ({ subjectId: todo.subjectId, date: todo.dueDate!, label: todo.text, type: "Test" })),
    ...subjects.flatMap((subject) => profile.datesheet[subject.examKey] ? [{ subjectId: subject.id, date: profile.datesheet[subject.examKey]!, label: `${subject.name} main exam`, type: "Exam" }] : []),
  ].filter((entry) => (until(entry.date) ?? -1) >= 0).sort((a, b) => a.date.localeCompare(b.date));
  const priority = (subjectId: string): Todo["priority"] => {
    const left = until(upcoming.find((entry) => entry.subjectId === subjectId)?.date);
    return left !== null && left <= 10 ? "high" : left !== null && left <= 21 ? "medium" : "low";
  };
  const unfinished = subjects.flatMap((subject) => subject.groups.flatMap((group) => group.chapters
    .filter((chapter) => {
      const included = profile.examSyllabus[subject.id];
      return !included?.length || included.includes(scopedChapterId(subject.id, group.id, chapter.id, profile.targetExam || profile.grade));
    })
    .filter((chapter) => stages.some((stage) => profile.progress[`${subject.id}.${chapter.id}`]?.[stage] !== "done"))
    .map((chapter) => ({ subjectId: subject.id, text: `Revise Ch ${chapter.no}: ${chapter.name}`, priority: priority(subject.id) }))
  ));
  const suggestions = (unfinished.length ? unfinished : subjects.map((subject) => ({
    subjectId: subject.id,
    text: `Plan a focused revision block for ${subject.name}`,
    priority: priority(subject.id),
  }))).sort((a, b) => (a.priority === "high" ? -1 : b.priority === "high" ? 1 : 0)).slice(0, 5);

  const now = new Date();
  const monday = shift(now, -((now.getDay() + 6) % 7) + weekOffset * 7);
  const week = Array.from({ length: 7 }, (_, index) => shift(monday, index));
  const open = (profile.todos ?? []).filter((todo) => !todo.done);
  const addWeeklyPlan = () => {
    const existing = new Set((profile.todos ?? []).filter((todo) => !todo.done).map((todo) => todo.text));
    suggestions.slice(0, 4).forEach((suggestion) => {
      if (!existing.has(suggestion.text)) store.addTodo(suggestion.text, suggestion.subjectId, { priority: suggestion.priority });
    });
  };
  const pace = subjects.map((subject) => {
    const remaining = unfinished.filter((item) => item.subjectId === subject.id).length;
    const examDate = profile.datesheet[subject.examKey];
    const days = until(examDate);
    return { subject, remaining, examDate, weekly: days && days > 0 ? Math.max(1, Math.ceil((remaining / days) * 7)) : null };
  }).filter((item) => item.remaining > 0 && item.weekly !== null);
  const addTest = () => {
    if (!testName.trim() || !testDate) return;
    store.addTodo(testName, testSubject || null, { kind: "test", priority: "high", dueDate: testDate });
    setTestName(""); setTestDate("");
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-[18px] font-semibold">Your auto-generated weekly plan</h2><p className="mt-1 text-[14px] text-[#999]">Unfinished chapters are ranked by the nearest test or main exam, then turned into your next actions.</p></div>
          <button type="button" onClick={addWeeklyPlan} className="rounded-full bg-white px-4 py-2 text-[12px] font-bold text-black">Add this week&apos;s tasks</button>
        </div>
        {pace.length > 0 && <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{pace.map((item) => <p key={item.subject.id} className="rounded-[11px] bg-[#0099ff]/[0.07] px-3.5 py-3 text-[13px] leading-relaxed text-[#cfeeff]"><strong>{item.subject.name}:</strong> {item.remaining} chapters left · aim for {item.weekly}/week before {new Date(`${item.examDate}T12:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>)}</div>}
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {suggestions.map((suggestion, index) => <div key={suggestion.text} className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] bg-white/[0.04] p-3.5"><p className="text-[14px] font-medium"><span className="mr-2 font-mono text-[11px] text-[#666]">{String(index + 1).padStart(2, "0")}</span>{suggestion.text}<span className={`ml-2 text-[11px] ${suggestion.priority === "high" ? "text-[#f87171]" : suggestion.priority === "medium" ? "text-[#fbbf24]" : "text-[#999]"}`}>{suggestion.priority} priority</span></p><button type="button" onClick={() => store.addTodo(suggestion.text, suggestion.subjectId, { priority: suggestion.priority })} className="rounded-full bg-white px-3.5 py-2 text-[12px] font-bold text-black">Add</button></div>)}
        </div>
      </Card>

      <Card>
        <h2 className="text-[16px] font-semibold">Add a test between exams</h2><p className="mt-1 text-[13px] text-[#999]">Tests automatically make that subject&apos;s unfinished chapters more urgent.</p>
        <div className="mt-3 grid gap-2 lg:grid-cols-[minmax(240px,1fr)_170px_170px_auto]">
          <input value={testName} onChange={(event) => setTestName(event.target.value)} placeholder="e.g. Physics mock: Mechanics" maxLength={140} className="h-11 rounded-[10px] bg-[#1c1c1c] px-3 text-[13px] outline-none ring-1 ring-white/10 placeholder:text-[#666] focus:ring-[#0099ff]" />
          <select value={testSubject} onChange={(event) => setTestSubject(event.target.value)} className="h-11 rounded-[10px] bg-[#1c1c1c] px-3 text-[13px] outline-none ring-1 ring-white/10"><option value="">All subjects</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select>
          <input type="date" value={testDate} onChange={(event) => setTestDate(event.target.value)} aria-label="Test date" className="h-11 rounded-[10px] bg-[#1c1c1c] px-3 text-[13px] outline-none ring-1 ring-white/10" style={{ colorScheme: "dark" }} />
          <PrimaryButton small onClick={addTest}>Add test</PrimaryButton>
        </div>
        {upcoming.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{upcoming.slice(0, 5).map((entry) => <span key={`${entry.label}-${entry.date}`} className="rounded-full bg-[#f59e0b]/10 px-3 py-1.5 text-[12px] text-[#fbbf24] ring-1 ring-[#f59e0b]/20">{entry.type} · {entry.label} · {until(entry.date) === 0 ? "today" : `${until(entry.date)}d`}</span>)}</div>}
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-[16px] font-semibold">Weekly planner</h2><p className="mt-1 text-[13px] text-[#999]">Holidays become productive study days; festivals become lighter revision days.</p></div><div className="flex gap-1"><button type="button" onClick={() => setWeekOffset((value) => value - 1)} className="h-9 w-9 rounded-full bg-white/[0.06]">←</button><button type="button" onClick={() => setWeekOffset((value) => value + 1)} className="h-9 w-9 rounded-full bg-white/[0.06]">→</button></div></div>
        <div className="mt-4 flex snap-x gap-3 overflow-x-auto pb-3">{week.map((day, index) => { const key = iso(day); const manual = profile.plannerDays?.[key]; const automatic = indianStudyDay(key); const mode = manual ?? automatic?.mode ?? null; const daily = open.filter((todo) => todo.dueDate === key); const auto = suggestions[index % suggestions.length]; return <div key={key} className={`min-h-[220px] w-[230px] shrink-0 snap-start rounded-[13px] p-4 ring-1 ${mode === "festival" ? "bg-[#f59e0b]/10 ring-[#f59e0b]/25" : mode === "holiday" ? "bg-[#0099ff]/10 ring-[#0099ff]/25" : "bg-white/[0.035] ring-white/[0.07]"}`}><p className="text-[11px] font-semibold text-[#888]">{day.toLocaleDateString("en-IN", { weekday: "short" }).toUpperCase()}</p><p className="text-[20px] font-semibold">{day.getDate()}</p><p className={`mt-2 text-[12px] ${mode === "festival" ? "text-[#fbbf24]" : mode === "holiday" ? "text-[#38bdf8]" : "text-[#bbb]"}`}>{mode === "festival" ? `${automatic?.name ?? "Festival"} · light revision` : mode === "holiday" ? `${automatic?.name ?? "Holiday"} · 2 focus blocks` : "Priority chapter + practice"}</p>{daily.slice(0, 2).map((todo) => <p key={todo.id} className="mt-3 line-clamp-2 border-t border-white/10 pt-2 text-[12px] font-medium">{todo.kind === "test" ? "Test: " : ""}{todo.text}</p>)}{daily.length === 0 && auto && <p className="mt-3 line-clamp-3 border-t border-white/10 pt-2 text-[12px] font-medium text-[#ddd]">{mode === "festival" ? `Light: ${auto.text}` : auto.text}</p>}<div className="mt-3 flex gap-2"><button type="button" onClick={() => store.setPlannerDay(key, "festival")} className="text-[11px] text-[#fbbf24]">Festival</button><button type="button" onClick={() => store.setPlannerDay(key, "holiday")} className="text-[11px] text-[#38bdf8]">Holiday</button>{manual && <button type="button" onClick={() => store.setPlannerDay(key, null)} className="text-[11px] text-[#888]">Clear</button>}</div></div>; })}</div>
        <p className="mt-3 text-[12px] text-[#777]">Sundays, New Year&apos;s Day, Christmas, and major national holidays are recognised automatically. Holi, Eid al-Fitr, Raksha Bandhan, and Diwali use a lighter revision plan in 2026; regional or family dates can still be marked manually.</p>
      </Card>
    </div>
  );
}
