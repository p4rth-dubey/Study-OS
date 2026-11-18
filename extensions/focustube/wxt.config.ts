import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  srcDir: ".",
  manifest: {
    name: "StudyOS FocusTube",
    description:
      "Educational YouTube experience by StudyOS — filter distractions, discover syllabus-aligned videos, and track learning progress.",
    version: "0.1.0",
    permissions: ["storage", "alarms"],
    host_permissions: [
      "https://study-os-p4rth1.vercel.app/*",
      "https://www.youtube.com/*",
      "https://www.googleapis.com/youtube/*",
    ],
    icons: {
      "16": "icons/icon-16.svg",
      "32": "icons/icon-32.svg",
      "48": "icons/icon-48.svg",
      "128": "icons/icon-128.svg",
    },
    action: {
      default_title: "StudyOS FocusTube",
    },
  },
});
