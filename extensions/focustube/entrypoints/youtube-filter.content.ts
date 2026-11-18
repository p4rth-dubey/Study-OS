/** Content script for YouTube — handles DOM filtering.
 * Runs on: https://www.youtube.com/*
 * This is a placeholder for Phase 6; the basic structure is set up here. */

export default defineContentScript({
  matches: ["https://www.youtube.com/*"],
  runAt: "document_idle",

  async main() {
    console.log("[FocusTube] YouTube content script loaded.");

    // Check if filtering is enabled
    const response = await chrome.runtime.sendMessage({ type: "GET_SETTINGS" });
    const settings = response?.settings;

    if (!settings?.filteringEnabled) {
      console.log("[FocusTube] Filtering is disabled.");
      return;
    }

    if (settings.hideShorts) {
      hideShorts();
    }

    // Observe DOM changes for SPA navigation
    const observer = new MutationObserver(() => {
      if (settings.hideShorts) {
        hideShorts();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  },
});

/** Hide YouTube Shorts shelf and navigation from the filtered experience. */
function hideShorts() {
  // Hide Shorts shelf on the homepage
  const shortsShelf = document.querySelectorAll("ytd-reel-shelf-renderer, ytd-rich-shelf-renderer[is-shorts]");
  shortsShelf.forEach((el) => {
    (el as HTMLElement).style.display = "none";
  });

  // Hide Shorts tab in the navigation
  const shortsTabs = document.querySelectorAll('a[title="Shorts"], tp-yt-paper-tab:has(a[href="/shorts"])');
  shortsTabs.forEach((el) => {
    (el as HTMLElement).style.display = "none";
  });
}
