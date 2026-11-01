/** Student Workspace — planning tools that complement the existing dashboard. */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTracker } from "../../../lib/storage";
import { getSubjectsForProfile, scopedChapterId } from "../../../lib/chapters";
import { getStageKeys } from "../../../lib/stages";
import { Card, EmptyNotice, PrimaryButton } from "../../../components/tracker-ui";

type JournalEntry = { id: string; date: string; text: string };
const journalKey = (profileId: string) => `studyos_journal_${profileId}`;

export default function WorkspacePage() {
  const { profile, ready } = useTracker();
  const [query, setQuery] = useState("");
  const [focusSeconds, setFocusSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [note, setNote] = useState("");
  const [journal, setJournal] = useState<JournalEntry[]>([]);

  useEffect(() => {
    if (!profile) return;
    const load = window.setTimeout(() => {
      try { setJournal(JSON.parse(localStorage.getItem(journalKey(profile.id)) ?? "[]") as JournalEntry[]); } catch { setJournal([]); }
    }, 0);
    return () => window.clearTimeout(load);
  }, [profile]);
  useEffect(() => {
    if (!running || focusSeconds === 0) return;
    const timer = window.setInterval(() => setFocusSeconds((n) => Math.max(0, n - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [running, focusSeconds]);

  if (!ready) return null;
  if (!profile) return <EmptyNotice title="No workspace yet" copy="Finish onboarding to build your study workspace." />;

  const subjects = getSubjectsForProfile(profile);
  const openTasks = (profile.todos ?? []).filter((task) => !task.done);
  const stageKeys = getStageKeys(profile.targetExam || profile.grade);
  const included = subjects.flatMap((subject) => subject.groups.flatMap((group) => group.chapters
    .filter((chapter) => (profile.examSyllabus[subject.id] ?? []).includes(scopedChapterId(subject.id, group.id, chapter.id, profile.targetExam || profile.grade)))
    .map((chapter) => ({ subject, chapter }))));
  const debt = included.reduce((total, { subject, chapter }) => total + stageKeys.filter((key) => profile.progress[`${subject.id}.${chapter.id}`]?.[key] !== "done").length, 0);
  const term = query.trim().toLowerCase();
  const results = !term ? [] : [
    ...included.filter(({ chapter, subject }) => `${subject.name} ${chapter.name}`.toLowerCase().includes(term)).map(({ subject, chapter }) => ({ type: subject.name, text: `Ch ${chapter.no}: ${chapter.name}` })),
    ...openTasks.filter((task) => task.text.toLowerCase().includes(term)).map((task) => ({ type: "Task", text: task.text })),
  ].slice(0, 8);
  const saveJournal = () => {
    const text = note.trim();
    if (!text) return;
    const next = [{ id: `${Date.now()}`, date: new Date().toISOString(), text }, ...journal].slice(0, 30);
    setJournal(next); setNote(""); localStorage.setItem(journalKey(profile.id), JSON.stringify(next));
  };
  const minutes = String(Math.floor(focusSeconds / 60)).padStart(2, "0");
  const seconds = String(focusSeconds % 60).padStart(2, "0");

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[13px] font-medium tracking-wide text-[#999] uppercase">Student workspace & planning</p>
        <h1 className="display-tight mt-1 text-[30px] sm:text-[38px]">Plan, focus, and recover.</h1>
        <p className="mt-1 text-[14px] text-[#999]">A practical home for the next action, missed work, deadlines, and reflection.</p>
      </div>

      <Card>
        <label className="text-[13px] font-semibold">Smart Search</label>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search chapters and open tasks…" className="mt-2 h-12 w-full rounded-[12px] bg-[#1c1c1c] px-4 text-[15px] outline-none ring-1 ring-white/10 placeholder:text-[#666] focus:ring-[#0099ff]" />
        {query && <div className="mt-2 space-y-1">{results.length ? results.map((result, index) => <p key={`${result.type}-${index}`} className="rounded-[9px] bg-white/[0.04] px-3 py-2 text-[13px]"><span className="mr-2 text-[#0099ff]">{result.type}</span>{result.text}</p>) : <p className="px-1 text-[13px] text-[#888]">No chapters or open tasks match.</p>}</div>}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-start justify-between gap-3"><div><h2 className="text-[17px] font-semibold">SmartPlanner</h2><p className="mt-1 text-[13px] text-[#999]">Your next realistic actions, kept small.</p></div><span className="rounded-full bg-white/[0.07] px-3 py-1 text-[12px] font-bold">{openTasks.length} open</span></div>
          <div className="mt-4 space-y-2">{openTasks.slice(0, 3).map((task) => <p key={task.id} className="rounded-[10px] bg-white/[0.04] px-3 py-2.5 text-[13px]">{task.text}</p>)}{openTasks.length === 0 && <p className="text-[13px] text-[#888]">Nothing queued. Add one small task for today.</p>}</div>
          <Link href="/app/todo" className="mt-4 inline-flex text-[13px] font-semibold text-[#0099ff]">Open planner →</Link>
        </Card>
        <Card>
          <h2 className="text-[17px] font-semibold">BacklogRescue</h2><p className="mt-1 text-[13px] text-[#999]">Your open list is the backlog. Rescue it by choosing just one next action.</p>
          <p className="tnum mt-4 text-[32px] font-semibold">{openTasks.length}<span className="ml-2 text-[14px] font-normal text-[#888]">tasks waiting</span></p>
          <Link href="/app/todo" className="mt-3 inline-flex text-[13px] font-semibold text-[#0099ff]">Triage tasks →</Link>
        </Card>
        <Card>
          <h2 className="text-[17px] font-semibold">AcademicCalendar</h2><p className="mt-1 text-[13px] text-[#999]">Your exam dates, already tied to the plan.</p>
          <div className="mt-4 space-y-2">{subjects.map((subject) => <p key={subject.id} className="flex justify-between rounded-[10px] bg-white/[0.04] px-3 py-2.5 text-[13px]"><span>{subject.name}</span><span className="text-[#bbb]">{profile.datesheet[subject.examKey] ? new Date(`${profile.datesheet[subject.examKey]}T12:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Date not set"}</span></p>)}</div>
        </Card>
        <Card>
          <h2 className="text-[17px] font-semibold">StudyDebt</h2><p className="mt-1 text-[13px] text-[#999]">The remaining learning, revision, and practice stages—not a guilt score.</p>
          <p className="tnum mt-4 text-[32px] font-semibold">{debt}<span className="ml-2 text-[14px] font-normal text-[#888]">stages remaining</span></p>
          <Link href="/app/analysis" className="mt-3 inline-flex text-[13px] font-semibold text-[#0099ff]">See the forecast →</Link>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card><h2 className="text-[17px] font-semibold">FocusTimer</h2><p className="mt-1 text-[13px] text-[#999]">A calm, Pomodoro-style focus session.</p><p className="tnum mt-5 text-center text-[50px] font-semibold tracking-tight">{minutes}:{seconds}</p><div className="mt-4 flex justify-center gap-2"><button onClick={() => { setRunning(false); setFocusSeconds(25 * 60); }} className="rounded-full px-3 py-2 text-[12px] text-[#aaa] hover:bg-white/[0.06]">Reset</button><PrimaryButton onClick={() => focusSeconds === 0 ? (setFocusSeconds(25 * 60), setRunning(true)) : setRunning((value) => !value)}>{running && focusSeconds > 0 ? "Pause" : focusSeconds === 0 ? "Start again" : "Start focus"}</PrimaryButton></div></Card>
        <Card><h2 className="text-[17px] font-semibold">StudyJournal</h2><p className="mt-1 text-[13px] text-[#999]">Record a target, win, or short reflection.</p><textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} placeholder="What moved forward today?" className="mt-3 min-h-22 w-full rounded-[12px] bg-[#1c1c1c] p-3 text-[13px] outline-none ring-1 ring-white/10 placeholder:text-[#666] focus:ring-[#0099ff]" /><div className="mt-2 flex justify-between gap-2"><p className="text-[12px] text-[#777]">{journal.length} saved notes</p><PrimaryButton small onClick={saveJournal}>Save note</PrimaryButton></div>{journal[0] && <p className="mt-3 rounded-[10px] bg-white/[0.04] p-3 text-[13px] text-[#bbb]">{journal[0].text}</p>}</Card>
      </div>

      <Card><h2 className="text-[17px] font-semibold">ParentView</h2><p className="mt-1 text-[13px] text-[#999]">A calm, read-only summary you can choose to share with a parent or guardian.</p><div className="mt-4 grid gap-2 sm:grid-cols-3"><p className="rounded-[10px] bg-white/[0.04] p-3 text-[13px]"><strong className="block text-[20px]">{profile.streak.count}</strong>day streak</p><p className="rounded-[10px] bg-white/[0.04] p-3 text-[13px]"><strong className="block text-[20px]">{selectedProgress(profile)}</strong>chapters started</p><p className="rounded-[10px] bg-white/[0.04] p-3 text-[13px]"><strong className="block text-[20px]">{openTasks.length}</strong>tasks open</p></div><p className="mt-3 text-[12px] text-[#777]">No information is shared automatically.</p></Card>
    </div>
  );
}

function selectedProgress(profile: NonNullable<ReturnType<typeof useTracker>["profile"]>) { return Object.keys(profile.progress).length; }
