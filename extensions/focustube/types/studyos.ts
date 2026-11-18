/** StudyOS types — ported from the main app for extension use.
 * These mirror lib/storage.tsx and lib/chapters.ts exactly. */

export type StageKey =
  | "theory"
  | "ncert"
  | "exemplar"
  | "pyq"
  | "cbq"
  | "revision";

export type StageState = "none" | "progress" | "done";

export interface Chapter {
  id: string;
  no: number;
  name: string;
}

export interface ChapterGroup {
  id: string;
  name: string | null;
  chapters: Chapter[];
}

export interface Subject {
  id: string;
  name: string;
  examKey: string;
  groups: ChapterGroup[];
}

export interface Datesheet {
  [key: string]: string | undefined;
}

export type ChapterProgress = Record<string, StageState | string | undefined> & {
  updatedAt?: string;
};

export interface Streak {
  count: number;
  lastActive: string;
}

export interface Todo {
  id: string;
  text: string;
  subjectId: string | null;
  done: boolean;
  createdAt: string;
  kind?: "task" | "test";
  priority?: "high" | "medium" | "low";
  dueDate?: string;
}

export interface Profile {
  id: string;
  name: string;
  grade: number;
  targetExam?: string;
  datesheet: Datesheet;
  examSyllabus: Record<string, string[]>;
  progress: Record<string, ChapterProgress>;
  streak: Streak;
  todos?: Todo[];
  weeklyGoal?: number;
}

export interface AppState {
  schemaVersion: number;
  activeProfileId: string | null;
  lastBackupAt: string | null;
  profiles: Profile[];
}
