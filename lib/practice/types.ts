/** Types for AI Practice Lab & CBT Mock Test System. */

export type QuestionType =
  | "mcq_single"
  | "mcq_multiple"
  | "numerical"
  | "assertion_reason";

export type QuestionDifficulty = "easy" | "medium" | "hard";

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  examId: string;
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicName: string;
  subtopic?: string;
  questionText: string;
  type: QuestionType;
  options?: QuestionOption[];
  correctAnswer: string | string[] | number;
  solutionSteps: string[];
  explanation: string;
  difficulty: QuestionDifficulty;
  marks: number;
  negativeMarks: number;
  source: string;
  year?: number;
  isPyq: boolean;
  isVerified: boolean;
  provenance: "verified_pyq" | "official_sample" | "ai_curated";
  tags: string[];
}

export type PracticeMode =
  | "full_mock"
  | "chapter"
  | "topic"
  | "pyq"
  | "weak_topics"
  | "timed_speed";

export interface PracticeConfig {
  examId: string;
  mode: PracticeMode;
  subjectId?: string;
  topicIds?: string[];
  questionCount: number;
  durationMinutes: number;
  difficulty?: QuestionDifficulty | "mixed";
}

export interface TestPaper {
  id: string;
  examId: string;
  title: string;
  category: string;
  durationMinutes: number;
  totalMarks: number;
  questions: Question[];
  createdAt: string;
}

export interface TestAttemptState {
  testId: string;
  examId: string;
  title: string;
  totalQuestions: number;
  totalMarks: number;
  durationMinutes: number;
  startedAt: string;
  submittedAt?: string;
  answers: Record<string, string | string[] | number | undefined>;
  visited: Record<string, boolean>;
  markedForReview: Record<string, boolean>;
  timeRemainingSeconds: number;
  isCompleted: boolean;
}

export interface QuestionResult {
  questionId: string;
  questionText: string;
  type: QuestionType;
  options?: QuestionOption[];
  userAnswer?: string | string[] | number;
  correctAnswer: string | string[] | number;
  isCorrect: boolean;
  isAttempted: boolean;
  marksAwarded: number;
  maxMarks: number;
  negativeMarks: number;
  solutionSteps: string[];
  explanation: string;
  topicName: string;
  difficulty: QuestionDifficulty;
  provenance: string;
  source: string;
}

export interface TestResult {
  testId: string;
  examId: string;
  title: string;
  totalScore: number;
  maxMarks: number;
  percentage: number;
  accuracyPercent: number;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  timeTakenSeconds: number;
  completedAt: string;
  subjectBreakdown: {
    subjectId: string;
    subjectName: string;
    score: number;
    maxMarks: number;
    accuracy: number;
  }[];
  topicBreakdown: {
    topicName: string;
    correct: number;
    total: number;
  }[];
  questionResults: QuestionResult[];
}
