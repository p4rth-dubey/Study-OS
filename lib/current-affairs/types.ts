/** Types for Current Affairs & Daily Learning module. */

export type ArticleCategory =
  | "all"
  | "national"
  | "economy"
  | "science_tech"
  | "environment"
  | "polity"
  | "international";

export interface ArticleQuizQuestion {
  questionText: string;
  options: { id: string; text: string }[];
  correctAnswer: string;
  explanation: string;
}

export interface CurrentAffairsArticle {
  id: string;
  title: string;
  category: ArticleCategory;
  publicationDate: string;
  summary: string;
  examRelevance: string[];
  keyTakeaways: string[];
  sourceName: string;
  sourceUrl: string;
  quizQuestion?: ArticleQuizQuestion;
}

export interface Flashcard {
  id: string;
  category: ArticleCategory;
  topic: string;
  front: string;
  back: string;
  examTag: string;
}
