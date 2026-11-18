/** Background service worker — handles messaging between content scripts,
 * popup, and manages extension state. */

import { getSettings, getProfile, saveProfile } from "@/utils/storage";

export default defineBackground(() => {
  console.log("[FocusTube] Background service worker started.");

  // Listen for messages from content scripts and popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handleMessage(message, sender, sendResponse);
    return true; // Keep the message channel open for async responses
  });

  // Set up periodic sync alarm
  chrome.alarms.create("focustube-sync-check", { periodInMinutes: 30 });

  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === "focustube-sync-check") {
      console.log("[FocusTube] Periodic sync check.");
      // Future: trigger re-sync with StudyOS if tab is open
    }
  });
});

type MessagePayload =
  | { type: "STUDYOS_PROFILE_DATA"; profile: unknown }
  | { type: "GET_PROFILE" }
  | { type: "GET_SETTINGS" }
  | { type: "STUDYOS_SYNC_STATUS" };

async function handleMessage(
  message: MessagePayload,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response: unknown) => void,
) {
  switch (message.type) {
    case "STUDYOS_PROFILE_DATA": {
      // Content script on StudyOS sent us the profile data
      if (message.profile) {
        await saveProfile(message.profile as import("@/types").Profile);
        console.log("[FocusTube] Profile synced from StudyOS.");
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: "No profile data" });
      }
      break;
    }
    case "GET_PROFILE": {
      const profile = await getProfile();
      sendResponse({ profile });
      break;
    }
    case "GET_SETTINGS": {
      const settings = await getSettings();
      sendResponse({ settings });
      break;
    }
    case "STUDYOS_SYNC_STATUS": {
      const profile = await getProfile();
      sendResponse({ synced: profile !== null, profileName: profile?.name ?? null });
      break;
    }
    default:
      sendResponse({ error: "Unknown message type" });
  }
}
