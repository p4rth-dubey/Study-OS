/**
 * Chapter preparation selector used during onboarding.
 * It keeps exam coverage and the learner's starting point together, so a
 * chapter never has to be selected in one step and described in another.
 */
"use client";

import { useState } from "react";
import { getSubjectsForProfile, scopedChapterId } from "../lib/chapters";

export type PreparationStatus = "not-prepared" | "partially-prepared" | "completed";

const STATUS_OPTIONS: Array<{
  value: PreparationStatus;
  label: string;
  activeClass: string;
}> = [
  { value: "not-prepared", label: "Not prepared", activeClass: "bg-white/[0.12] text-white ring-white/30" },
  { value: "partially-prepared", label: "Partially prepared", activeClass: "bg-[#f59e0b]/15 text-[#fbbf24] ring-[#f59e0b]/35" },
  { value: "completed", label: "Completed", activeClass: "bg-[#22c55e]/15 text-[#4ade80] ring-[#22c55e]/35" },
];

export function getPreparationStatus(
  preparation: Record<string, PreparationStatus>,
  subjectId: string,
  chapterId: string,
): PreparationStatus {
  return preparation[`${subjectId}|${chapterId}`] ?? "not-prepared";
}

export default function ChapterPreparationSelector({
  grade,
  targetExam,
  syllabus,
  preparation,
  onSyllabusChange,
  onPreparationChange,
}: {
  grade: number;
  targetExam?: string;
  syllabus: Record<string, string[]>;
  preparation: Record<string, PreparationStatus>;
  onSyllabusChange: (next: Record<string, string[]>) => void;
  onPreparationChange: (next: Record<string, PreparationStatus>) => void;
}) {
  const subjects = getSubjectsForProfile({ grade, targetExam });
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleChapter = (subjectId: string, scopedId: string) => {
    const current = syllabus[subjectId] ?? [];
    const next = current.includes(scopedId)
      ? current.filter((id) => id !== scopedId)
      : [...current, scopedId];
    onSyllabusChange({ ...syllabus, [subjectId]: next });
  };

  const setSubjectIncluded = (subjectId: string, ids: string[], included: boolean) => {
    onSyllabusChange({ ...syllabus, [subjectId]: included ? ids : [] });
  };

  return (
    <div className="space-y-3">
      {subjects.map((subject) => {
        const allChapters = subject.groups.flatMap((group) =>
          group.chapters.map((chapter) => ({ group, chapter, scopedId: scopedChapterId(subject.id, group.id, chapter.id, targetExam || grade) })),
        );
        const selected = syllabus[subject.id] ?? [];
        const includedCount = allChapters.filter(({ scopedId }) => selected.includes(scopedId)).length;
        const completeCount = allChapters.filter(({ chapter, scopedId }) =>
          selected.includes(scopedId) && getPreparationStatus(preparation, subject.id, chapter.id) === "completed",
        ).length;
        const partialCount = allChapters.filter(({ chapter, scopedId }) =>
          selected.includes(scopedId) && getPreparationStatus(preparation, subject.id, chapter.id) === "partially-prepared",
        ).length;
        const isCollapsed = collapsed[subject.id];
        const allIncluded = includedCount === allChapters.length;

        return (
          <section key={subject.id} className="overflow-hidden rounded-[14px] bg-[#1c1c1c]/70 ring-1 ring-white/[0.07]">
            <div className="flex min-h-[58px] items-center gap-3 px-4">
              <button
                type="button"
                onClick={() => setCollapsed((current) => ({ ...current, [subject.id]: !current[subject.id] }))}
                aria-expanded={!isCollapsed}
                className="min-w-0 flex-1 text-left"
              >
                <p className="text-[15px] font-semibold">{subject.name}</p>
                <p className="mt-0.5 text-[12px] text-[#888]">
                  {includedCount}/{allChapters.length} chapters · {partialCount} partial · {completeCount} completed
                </p>
              </button>
              <button
                type="button"
                onClick={() => setSubjectIncluded(subject.id, allChapters.map(({ scopedId }) => scopedId), !allIncluded)}
                className="min-h-[36px] shrink-0 rounded-full px-3 text-[12px] font-semibold text-[#0099ff] transition-colors hover:bg-white/[0.06]"
              >
                {allIncluded ? "Clear" : "All chapters"}
              </button>
              <span aria-hidden className="text-[#777]">{isCollapsed ? "▸" : "▾"}</span>
            </div>

            {!isCollapsed && (
              <div className="border-t border-white/[0.06] px-2 py-2">
                {subject.groups.map((group) => (
                  <div key={group.id} className="last:mb-0">
                    {group.name && (
                      <p className="px-2 pt-2 pb-1 text-[11px] font-semibold tracking-[0.08em] text-[#0099ff] uppercase">
                        {group.name}
                      </p>
                    )}
                    {group.chapters.map((chapter) => {
                      const scopedId = scopedChapterId(subject.id, group.id, chapter.id, targetExam || grade);
                      const included = selected.includes(scopedId);
                      const status = getPreparationStatus(preparation, subject.id, chapter.id);
                      return (
                        <div
                          key={chapter.id}
                          className={`mb-1 rounded-[11px] p-3 ring-1 transition-colors ${
                            included ? "bg-[#161616] ring-white/[0.07]" : "bg-transparent ring-transparent opacity-60"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              type="button"
                              aria-pressed={included}
                              aria-label={`${included ? "Remove" : "Add"} ${chapter.name} from exam chapters`}
                              onClick={() => toggleChapter(subject.id, scopedId)}
                              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] ring-1 transition-colors ${
                                included ? "bg-white text-black ring-white" : "ring-white/30 hover:ring-white/60"
                              }`}
                            >
                              {included && <span className="text-[13px] font-bold leading-none">✓</span>}
                            </button>
                            <div className="min-w-0 flex-1">
                              <p className="text-[14px] font-medium leading-snug">Ch {chapter.no}: {chapter.name}</p>
                              <p className="mt-1 text-[12px] text-[#777]">{included ? "How prepared are you?" : "Not in my exam syllabus"}</p>
                            </div>
                          </div>
                          {included && (
                            <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-3" role="group" aria-label={`Preparation status for ${chapter.name}`}>
                              {STATUS_OPTIONS.map((option) => {
                                const active = status === option.value;
                                return (
                                  <button
                                    key={option.value}
                                    type="button"
                                    aria-pressed={active}
                                    onClick={() => onPreparationChange({ ...preparation, [`${subject.id}|${chapter.id}`]: option.value })}
                                    className={`min-h-[36px] rounded-[9px] px-2 text-[11.5px] font-semibold ring-1 transition-all active:scale-[0.98] ${
                                      active ? option.activeClass : "bg-white/[0.035] text-[#888] ring-white/[0.08] hover:bg-white/[0.07] hover:text-[#ccc]"
                                    }`}
                                  >
                                    {option.label}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
