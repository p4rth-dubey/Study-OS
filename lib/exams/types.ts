/** Multi-Exam configuration types for StudyOS.
 * Provides unified schema for school, competitive, and entrance examinations across India. */

export type ExamCategory =
  | "school"
  | "engineering"
  | "medical"
  | "government"
  | "entrance";

export type QuestionFormat =
  | "mcq_single"
  | "mcq_multiple"
  | "numerical"
  | "assertion_reason"
  | "descriptive";

export interface MarkingRule {
  correctMarks: number;
  negativeMarks: number;
  partialMarks?: boolean;
  description: string;
}

export interface ExamStage {
  id: string;
  name: string;
  description?: string;
  durationMinutes?: number;
  totalMarks?: number;
}

export interface Topic {
  id: string;
  name: string;
  weightagePercent?: number;
  subtopics?: string[];
}

export interface SubjectConfig {
  id: string;
  name: string;
  code?: string;
  icon?: string;
  topics: Topic[];
}

export interface ExamConfig {
  id: string;
  name: string;
  shortName: string;
  category: ExamCategory;
  academicSession: string;
  conductingBody: string;
  officialUrl: string;
  eligibilitySummary: string;
  eligibilityUrl: string;
  description: string;
  stages: ExamStage[];
  subjects: SubjectConfig[];
  questionFormats: QuestionFormat[];
  markingRules: Record<string, MarkingRule>;
  defaultDurationMinutes: number;
  totalQuestionsDefault?: number;
  maxMarksDefault?: number;
  verifiedAt: string;
  isVerified: boolean;
  preparationStages: { key: string; label: string }[];
  tags: string[];
}
