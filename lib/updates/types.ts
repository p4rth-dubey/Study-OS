/** Types for Official Education Updates & Deadlines Hub.
 * Strictly adheres to verified official sources across Indian examinations. */

import type { ExamCategory } from "../exams/types";

export type UpdateCategory =
  | "notification"
  | "application"
  | "admit_card"
  | "datesheet"
  | "answer_key"
  | "result"
  | "counselling";

export type UpdateStatus = "upcoming" | "open" | "closed" | "announced" | "tentative";

export interface EducationUpdate {
  id: string;
  title: string;
  examId: string;
  examName: string;
  category: UpdateCategory;
  examCategory: ExamCategory;
  publicationDate: string;
  deadlineDate?: string;
  summary: string;
  details?: string[];
  officialSourceUrl: string;
  conductingAuthority: string;
  status: UpdateStatus;
  isVerified: boolean;
  verifiedAt: string;
  isTentative?: boolean;
}
