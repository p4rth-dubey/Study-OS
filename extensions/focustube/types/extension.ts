/** Extension-specific types. */

export interface ExtensionSettings {
  focusModeEnabled: boolean;
  hideShorts: boolean;
  hideRecommendations: boolean;
  filteringEnabled: boolean;
  preferredLanguage: "en" | "hi" | "both";
  maxVideoDuration: number; // minutes, 0 = no limit
  syncedAt: string | null;
}

export interface FocusSession {
  startedAt: string;
  topicLabel: string;
  subjectId: string;
  chapterId: string;
  durationMinutes: number;
  isActive: boolean;
}

export interface WatchedVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  subjectId: string;
  chapterId: string;
  watchedAt: string;
  durationWatched: number; // seconds
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
  focusModeEnabled: false,
  hideShorts: true,
  hideRecommendations: false,
  filteringEnabled: true,
  preferredLanguage: "both",
  maxVideoDuration: 0,
  syncedAt: null,
};
