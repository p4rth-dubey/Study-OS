/** Content script for StudyOS — bridges localStorage data to the extension.
 * Runs on: https://study-os-p4rth1.vercel.app/* */

const STORAGE_KEY = "cbse_tracker_v1";

export default defineContentScript({
  matches: ["https://study-os-p4rth1.vercel.app/*"],
  runAt: "document_idle",

  main() {
    console.log("[FocusTube] StudyOS content script loaded.");

    // Sync profile data on page load
    syncProfile();

    // Re-sync when localStorage changes (e.g. user updates progress)
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY) {
        console.log("[FocusTube] StudyOS data changed, re-syncing...");
        syncProfile();
      }
    });

    // Listen for sync requests from the popup/background
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === "REQUEST_SYNC") {
        syncProfile();
        sendResponse({ success: true });
      }
      return true;
    });
  },
});

function syncProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      console.log("[FocusTube] No StudyOS data found in localStorage.");
      return;
    }

    const appState = JSON.parse(raw);
    if (!appState || !Array.isArray(appState.profiles) || appState.profiles.length === 0) {
      console.log("[FocusTube] No profiles found in StudyOS data.");
      return;
    }

    // Get the active profile, or fall back to the first profile
    const activeProfile =
      appState.profiles.find((p: { id: string }) => p.id === appState.activeProfileId) ??
      appState.profiles[0];

    if (!activeProfile) return;

    // Send profile to the background service worker
    chrome.runtime.sendMessage(
      { type: "STUDYOS_PROFILE_DATA", profile: activeProfile },
      (response) => {
        if (chrome.runtime.lastError) {
          console.warn("[FocusTube] Sync error:", chrome.runtime.lastError.message);
          return;
        }
        if (response?.success) {
          console.log("[FocusTube] Profile synced:", activeProfile.name);
        }
      },
    );
  } catch (err) {
    console.warn("[FocusTube] Error reading StudyOS data:", err);
  }
}
