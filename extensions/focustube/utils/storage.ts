/** Typed chrome.storage.local wrapper for the extension. */

import type { ExtensionSettings, Profile, TrustedChannel, WatchedVideo } from "@/types";
import { DEFAULT_SETTINGS } from "@/types";

const KEYS = {
  settings: "ft_settings",
  profile: "ft_studyos_profile",
  channels: "ft_trusted_channels",
  watchHistory: "ft_watch_history",
  lastSync: "ft_last_sync",
} as const;

/** Get extension settings, falling back to defaults. */
export async function getSettings(): Promise<ExtensionSettings> {
  const result = await chrome.storage.local.get(KEYS.settings);
  return { ...DEFAULT_SETTINGS, ...(result[KEYS.settings] ?? {}) };
}

/** Save extension settings. */
export async function saveSettings(settings: Partial<ExtensionSettings>): Promise<void> {
  const current = await getSettings();
  await chrome.storage.local.set({ [KEYS.settings]: { ...current, ...settings } });
}

/** Get the synced StudyOS profile (may be null if not synced yet). */
export async function getProfile(): Promise<Profile | null> {
  const result = await chrome.storage.local.get(KEYS.profile);
  return result[KEYS.profile] ?? null;
}

/** Save the synced StudyOS profile. */
export async function saveProfile(profile: Profile): Promise<void> {
  await chrome.storage.local.set({
    [KEYS.profile]: profile,
    [KEYS.lastSync]: new Date().toISOString(),
  });
}

/** Get trusted channels list. */
export async function getChannels(): Promise<TrustedChannel[]> {
  const result = await chrome.storage.local.get(KEYS.channels);
  return result[KEYS.channels] ?? [];
}

/** Save trusted channels list. */
export async function saveChannels(channels: TrustedChannel[]): Promise<void> {
  await chrome.storage.local.set({ [KEYS.channels]: channels });
}

/** Get video watch history. */
export async function getWatchHistory(): Promise<WatchedVideo[]> {
  const result = await chrome.storage.local.get(KEYS.watchHistory);
  return result[KEYS.watchHistory] ?? [];
}

/** Add a video to watch history. */
export async function addToWatchHistory(video: WatchedVideo): Promise<void> {
  const history = await getWatchHistory();
  // Keep last 200 entries
  const updated = [video, ...history].slice(0, 200);
  await chrome.storage.local.set({ [KEYS.watchHistory]: updated });
}

/** Get the timestamp of the last sync with StudyOS. */
export async function getLastSync(): Promise<string | null> {
  const result = await chrome.storage.local.get(KEYS.lastSync);
  return result[KEYS.lastSync] ?? null;
}

/** Clear all extension data. */
export async function clearAll(): Promise<void> {
  await chrome.storage.local.remove(Object.values(KEYS));
}
