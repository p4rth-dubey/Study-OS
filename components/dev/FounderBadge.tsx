/** Founder Profile Badge & Developer HUD Indicator.
 * Displays an exclusive cybernetic badge indicating God Mode is active.
 * Click opens or navigates to /developer. */
"use client";

import Link from "next/link";

export default function FounderBadge({
  small = false,
  showLink = true,
}: {
  small?: boolean;
  showLink?: boolean;
}) {
  const badgeContent = (
    <div
      className={`group relative inline-flex items-center gap-2 rounded-full border border-[#8b5cf6]/40 bg-[#150d2a]/90 backdrop-blur-md transition-all duration-300 hover:border-[#a855f7] hover:shadow-[0_0_20px_rgba(168,85,247,0.35)] ${
        small ? "px-2.5 py-0.5 text-[10px]" : "px-3.5 py-1.5 text-[11px]"
      }`}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c084fc] opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#a855f7]" />
      </span>
      <span className="font-mono font-bold tracking-[0.16em] text-white uppercase drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]">
        FOUNDER
      </span>
      <span className="rounded bg-[#a855f7]/25 px-1 py-0.2 font-mono text-[9px] text-[#e9d5ff]">
        GOD MODE
      </span>
    </div>
  );

  if (showLink) {
    return (
      <Link href="/developer" title="Open StudyOS Developer God Mode (Ctrl + Shift + D)">
        {badgeContent}
      </Link>
    );
  }

  return badgeContent;
}
