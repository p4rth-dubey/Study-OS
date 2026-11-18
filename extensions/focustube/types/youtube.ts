/** YouTube-related types for the extension. */

export interface YouTubeVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  channelId: string;
  thumbnailUrl: string;
  duration?: string;
  publishedAt: string;
  description: string;
}

export interface VideoRecommendation extends YouTubeVideo {
  subjectId: string;
  subjectName: string;
  chapterId: string;
  chapterName: string;
  reason: string;
  relevanceScore: number;
}

export interface TrustedChannel {
  channelId: string;
  name: string;
  category: ChannelCategory;
  source: "studyos" | "user";
  addedAt: string;
}

export type ChannelCategory =
  | "mathematics"
  | "science"
  | "physics"
  | "chemistry"
  | "biology"
  | "english"
  | "hindi"
  | "history"
  | "geography"
  | "economics"
  | "civics"
  | "general"
  | "competitive";
