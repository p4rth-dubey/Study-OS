/** Preparation stage definitions — the vocabulary of the tracker.
 * Single interface: stage keys per grade/exam + subject-aware labels. */

export type StageKey =
  | "theory"
  | "ncert"
  | "exemplar"
  | "pyq"
  | "cbq"
  | "revision";

export type Grade = 9 | 10;
export type StageState = "none" | "progress" | "done";

const STAGE_SETS: Record<string, StageKey[]> = {
  "9": ["theory", "ncert", "revision"],
  "10": ["theory", "ncert", "exemplar", "pyq", "cbq"],
  "11": ["theory", "ncert", "exemplar", "revision"],
  "12": ["theory", "ncert", "exemplar", "pyq", "cbq"],
  "cbse-9": ["theory", "ncert", "revision"],
  "cbse-10": ["theory", "ncert", "exemplar", "pyq", "cbq"],
  "cbse-11": ["theory", "ncert", "exemplar", "revision"],
  "cbse-12": ["theory", "ncert", "exemplar", "pyq", "cbq"],
  "cbse-11-science": ["theory", "ncert", "exemplar", "revision"],
  "cbse-11-commerce": ["theory", "ncert", "exemplar", "revision"],
  "cbse-11-arts": ["theory", "ncert", "exemplar", "revision"],
  "cbse-12-science": ["theory", "ncert", "exemplar", "pyq", "cbq"],
  "cbse-12-commerce": ["theory", "ncert", "exemplar", "pyq", "cbq"],
  "cbse-12-arts": ["theory", "ncert", "exemplar", "pyq", "cbq"],
  "jee-main": ["theory", "ncert", "pyq", "revision"],
  "jee-advanced": ["theory", "ncert", "pyq", "revision"],
  "neet-ug": ["theory", "ncert", "pyq", "revision"],
  "upsc-cse": ["theory", "pyq", "revision"],
  "ssc-cgl": ["theory", "pyq", "revision"],
  "banking-po": ["theory", "pyq", "revision"],
};

const LABELS_BY_SUBJECT: Record<string, Partial<Record<StageKey, string>>> = {
  maths: { theory: "Concepts and Formulae", ncert: "NCERT & Practice" },
  physics: { theory: "Core Concepts", ncert: "Standard Problems", pyq: "PYQs (10-Yr)" },
  chemistry: { theory: "NCERT Theory", ncert: "Reactions & Equations", pyq: "PYQs (10-Yr)" },
  biology: { theory: "NCERT Line-by-Line", ncert: "Diagrams & Exemplar", pyq: "NEET PYQs" },
  accountancy: { theory: "Accounting Principles", ncert: "NCERT Practical Problems", pyq: "Board Numerical PYQs" },
  business: { theory: "Case Studies & Concepts", ncert: "NCERT Direct Questions", pyq: "Board Case Problem PYQs" },
  economics: { theory: "Economic Concepts", ncert: "Data & Diagrams", pyq: "Past Board Papers" },
  history: { theory: "Historical Sources & Themes", ncert: "NCERT Text Questions", pyq: "Source-based PYQs" },
  polscience: { theory: "Political Concepts & Articles", ncert: "NCERT Exercises", pyq: "Cartoon & Passage PYQs" },
  geography: { theory: "Map Work & Physical Concepts", ncert: "NCERT Chapter Questions", pyq: "Map & Theory PYQs" },
  "gs-paper-1": { theory: "Standard Books & Notes", pyq: "UPSC 25-Year PYQs", revision: "Current Affairs Linking" },
  default: {
    theory: "Theory Read",
    ncert: "NCERT Questions",
    exemplar: "NCERT Exemplar Questions",
    pyq: "Previous Year Questions",
    cbq: "Competency Focused Questions",
    revision: "Revision",
  },
};

/** Stage keys in exact display order for a grade or target exam. */
export function getStageKeys(gradeOrExam: number | string): StageKey[] {
  const key = String(gradeOrExam);
  return STAGE_SETS[key] ?? (Number(gradeOrExam) === 9 ? STAGE_SETS["9"] : STAGE_SETS["10"]);
}

/** Human label. Call as getStageLabel("maths", "theory") or getStageLabel("theory"). */
export function getStageLabel(subjectId: string, stageKey?: string): string {
  let sub = subjectId;
  let key = stageKey;
  if (!key) {
    key = sub;
    sub = "default";
  }
  const subKey = (sub || "default").toLowerCase();
  return (
    LABELS_BY_SUBJECT[subKey]?.[key as StageKey] ??
    LABELS_BY_SUBJECT.default[key as StageKey] ??
    key
  );
}
