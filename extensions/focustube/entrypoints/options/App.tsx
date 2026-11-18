import { useState, useEffect } from "react";
import { getSettings, saveSettings, getProfile, clearAll } from "@/utils/storage";
import type { ExtensionSettings, Profile } from "@/types";
import { DEFAULT_SETTINGS } from "@/types";

export default function OptionsApp() {
  const [settings, setSettings] = useState<ExtensionSettings>(DEFAULT_SETTINGS);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const [s, p] = await Promise.all([getSettings(), getProfile()]);
      setSettings(s);
      setProfile(p);
    }
    load();
  }, []);

  const handleChange = async <K extends keyof ExtensionSettings>(
    key: K,
    value: ExtensionSettings[K],
  ) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await saveSettings(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleReset = async () => {
    if (confirm("Reset all FocusTube data? This will clear synced profiles, channels, and watch history.")) {
      await clearAll();
      setSettings(DEFAULT_SETTINGS);
      setProfile(null);
    }
  };

  return (
    <div className="options-container">
      <header className="options-header">
        <h1>
          <span className="header-icon">📺</span> FocusTube Settings
        </h1>
        <p className="header-sub">Configure your educational YouTube experience</p>
        {saved && <span className="save-badge">✓ Saved</span>}
      </header>

      {/* Account Section */}
      <section className="options-section">
        <h2>🔗 StudyOS Account</h2>
        {profile ? (
          <div className="info-row">
            <span className="info-label">Connected as</span>
            <span className="info-value">
              {profile.name} · Class {profile.grade}
              {profile.targetExam ? ` · ${profile.targetExam.toUpperCase()}` : ""}
            </span>
          </div>
        ) : (
          <p className="info-note">
            Not connected. Visit{" "}
            <a href="https://study-os-p4rth1.vercel.app/app/dashboard" target="_blank" rel="noopener">
              StudyOS
            </a>{" "}
            to sync your profile.
          </p>
        )}
      </section>

      {/* YouTube Filtering */}
      <section className="options-section">
        <h2>🔍 YouTube Filtering</h2>

        <label className="option-row">
          <div>
            <span className="option-label">Enable Content Filtering</span>
            <span className="option-desc">Prioritise educational content on YouTube</span>
          </div>
          <input
            type="checkbox"
            checked={settings.filteringEnabled}
            onChange={(e) => handleChange("filteringEnabled", e.target.checked)}
          />
        </label>

        <label className="option-row">
          <div>
            <span className="option-label">Hide Shorts</span>
            <span className="option-desc">Remove Shorts shelf from the filtered experience</span>
          </div>
          <input
            type="checkbox"
            checked={settings.hideShorts}
            onChange={(e) => handleChange("hideShorts", e.target.checked)}
          />
        </label>

        <label className="option-row">
          <div>
            <span className="option-label">Hide Unrelated Recommendations</span>
            <span className="option-desc">Minimise distracting recommendation sections</span>
          </div>
          <input
            type="checkbox"
            checked={settings.hideRecommendations}
            onChange={(e) => handleChange("hideRecommendations", e.target.checked)}
          />
        </label>
      </section>

      {/* Preferences */}
      <section className="options-section">
        <h2>⚙️ Preferences</h2>

        <div className="option-row">
          <div>
            <span className="option-label">Preferred Language</span>
            <span className="option-desc">Language priority for video recommendations</span>
          </div>
          <select
            value={settings.preferredLanguage}
            onChange={(e) => handleChange("preferredLanguage", e.target.value as "en" | "hi" | "both")}
          >
            <option value="both">English & Hindi</option>
            <option value="en">English Only</option>
            <option value="hi">Hindi Only</option>
          </select>
        </div>

        <div className="option-row">
          <div>
            <span className="option-label">Max Video Duration (minutes)</span>
            <span className="option-desc">0 = no limit</span>
          </div>
          <input
            type="number"
            min="0"
            max="180"
            value={settings.maxVideoDuration}
            onChange={(e) => handleChange("maxVideoDuration", parseInt(e.target.value, 10) || 0)}
            style={{ width: 70 }}
          />
        </div>
      </section>

      {/* Danger Zone */}
      <section className="options-section danger">
        <h2>⚠️ Data</h2>
        <button className="btn-danger" onClick={handleReset}>
          Reset All FocusTube Data
        </button>
      </section>

      <footer className="options-footer">
        StudyOS FocusTube v0.1.0 · Extension data is stored locally on this device.
      </footer>
    </div>
  );
}
