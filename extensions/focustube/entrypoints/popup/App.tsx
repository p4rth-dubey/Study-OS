import { useState, useEffect } from "react";
import type { Profile, ExtensionSettings } from "@/types";
import { DEFAULT_SETTINGS } from "@/types";

export default function App() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<ExtensionSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [profileRes, settingsRes] = await Promise.all([
          chrome.runtime.sendMessage({ type: "GET_PROFILE" }),
          chrome.runtime.sendMessage({ type: "GET_SETTINGS" }),
        ]);
        setProfile(profileRes?.profile ?? null);
        setSettings(settingsRes?.settings ?? DEFAULT_SETTINGS);
        // Get last sync time
        const result = await chrome.storage.local.get("ft_last_sync");
        setLastSync(result.ft_last_sync ?? null);
      } catch (err) {
        console.error("[FocusTube] Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleConnectStudyOS = () => {
    chrome.tabs.create({ url: "https://study-os-p4rth1.vercel.app/app/dashboard" });
  };

  const handleToggleFocusMode = async () => {
    const updated = { ...settings, focusModeEnabled: !settings.focusModeEnabled };
    setSettings(updated);
    await chrome.storage.local.set({ ft_settings: updated });
  };

  const handleToggleFiltering = async () => {
    const updated = { ...settings, filteringEnabled: !settings.filteringEnabled };
    setSettings(updated);
    await chrome.storage.local.set({ ft_settings: updated });
  };

  const handleOpenSettings = () => {
    chrome.runtime.openOptionsPage();
  };

  if (loading) {
    return (
      <div className="popup-container">
        <div className="loading">
          <div className="spinner" />
          <span>Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-container">
      {/* Header */}
      <header className="header">
        <div className="header-brand">
          <div className="logo">
            <span className="logo-icon">📺</span>
            <div>
              <h1 className="logo-title">FocusTube</h1>
              <span className="logo-subtitle">by StudyOS</span>
            </div>
          </div>
          <button className="icon-btn" onClick={handleOpenSettings} title="Settings">
            ⚙️
          </button>
        </div>
      </header>

      {/* Connection Status */}
      <section className="section">
        {profile ? (
          <div className="status-card connected">
            <div className="status-dot green" />
            <div className="status-info">
              <span className="status-label">Connected</span>
              <span className="status-detail">
                {profile.name} · Class {profile.grade}
                {profile.targetExam ? ` · ${profile.targetExam.toUpperCase()}` : ""}
              </span>
              {lastSync && (
                <span className="sync-time">
                  Synced: {new Date(lastSync).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="status-card disconnected">
            <div className="status-dot red" />
            <div className="status-info">
              <span className="status-label">Not Connected</span>
              <span className="status-detail">Open StudyOS to sync your profile</span>
            </div>
            <button className="btn btn-primary" onClick={handleConnectStudyOS}>
              Connect
            </button>
          </div>
        )}
      </section>

      {/* Quick Controls */}
      <section className="section">
        <h2 className="section-title">Quick Controls</h2>
        <div className="controls">
          <div className="toggle-row">
            <div>
              <span className="toggle-label">🎯 Focus Mode</span>
              <span className="toggle-desc">Hide distractions on YouTube</span>
            </div>
            <button
              className={`toggle ${settings.focusModeEnabled ? "on" : "off"}`}
              onClick={handleToggleFocusMode}
              aria-label="Toggle Focus Mode"
            >
              <span className="toggle-knob" />
            </button>
          </div>
          <div className="toggle-row">
            <div>
              <span className="toggle-label">🔍 Content Filtering</span>
              <span className="toggle-desc">Prioritise educational content</span>
            </div>
            <button
              className={`toggle ${settings.filteringEnabled ? "on" : "off"}`}
              onClick={handleToggleFiltering}
              aria-label="Toggle Filtering"
            >
              <span className="toggle-knob" />
            </button>
          </div>
        </div>
      </section>

      {/* Learning Target (shows when profile is connected) */}
      {profile && (
        <section className="section">
          <h2 className="section-title">📖 Current Target</h2>
          <div className="target-card">
            {getPendingInfo(profile)}
          </div>
        </section>
      )}

      {/* Recommended Videos — placeholder for Phase 8 */}
      <section className="section">
        <h2 className="section-title">🎬 Recommended</h2>
        <div className="placeholder-card">
          {profile
            ? "Video recommendations coming soon…"
            : "Connect your StudyOS account to get personalized recommendations."}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <span>StudyOS FocusTube v0.1.0</span>
      </footer>
    </div>
  );
}

/** Compute a brief summary of pending study topics from the profile. */
function getPendingInfo(profile: Profile): string {
  const subjects = Object.keys(profile.examSyllabus ?? {});
  if (subjects.length === 0) return "No syllabus configured yet.";

  let totalChapters = 0;
  let doneChapters = 0;

  for (const subjectId of subjects) {
    const chapterIds = profile.examSyllabus[subjectId] ?? [];
    totalChapters += chapterIds.length;

    for (const chId of chapterIds) {
      const prog = profile.progress?.[`${subjectId}.${chId}`];
      if (prog) {
        const stages = Object.keys(prog).filter((k) => k !== "updatedAt");
        const allDone = stages.length > 0 && stages.every((k) => prog[k] === "done");
        if (allDone) doneChapters++;
      }
    }
  }

  const remaining = totalChapters - doneChapters;
  const pct = totalChapters > 0 ? Math.round((doneChapters / totalChapters) * 100) : 0;
  return `${remaining} chapters pending · ${pct}% complete across ${subjects.length} subjects`;
}
