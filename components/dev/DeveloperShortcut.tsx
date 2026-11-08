/** Developer Shortcut Listener & Global God Mode Trigger.
 * Listens for Ctrl + Shift + D across all routes and summons /developer. */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DeveloperShortcut() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Shift + D (or Cmd + Shift + D on macOS)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "D" || e.key === "d")) {
        e.preventDefault();
        const currentPath = window.location.pathname;
        if (currentPath.startsWith("/developer")) {
          router.push("/app/dashboard");
        } else {
          router.push("/developer");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return null;
}
