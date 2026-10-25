"use client";

import { useEffect, useState } from "react";
import { THEME_PALETTES, type ThemePaletteId, getStoredTheme, applyTheme } from "../lib/theme";

export default function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const [activeTheme, setActiveTheme] = useState<ThemePaletteId>("violet");

  useEffect(() => {
    setActiveTheme(getStoredTheme());
  }, []);

  const handleSelect = (id: ThemePaletteId) => {
    setActiveTheme(id);
    applyTheme(id);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.05] ring-1 ring-white/10">
        {THEME_PALETTES.map((t) => {
          const isSelected = activeTheme === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => handleSelect(t.id)}
              title={`${t.name} - ${t.tagline}`}
              aria-label={`Switch theme to ${t.name}`}
              className={`h-5 w-5 rounded-full transition-all ${
                isSelected
                  ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#090909]"
                  : "opacity-60 hover:opacity-100 hover:scale-105"
              }`}
              style={{ background: t.previewColor }}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
      {THEME_PALETTES.map((t) => {
        const isSelected = activeTheme === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => handleSelect(t.id)}
            className={`flex flex-col items-start rounded-[16px] p-3 text-left transition-all ${
              isSelected
                ? "bg-white/[0.08] ring-2 ring-white text-white shadow-lg"
                : "bg-[#181818] ring-1 ring-white/[0.08] text-[#aaa] hover:bg-[#202020] hover:text-white"
            }`}
          >
            <div className="flex w-full items-center justify-between mb-2">
              <span
                className="h-6 w-6 rounded-full shadow-inner ring-1 ring-white/20"
                style={{ background: t.gradientCss }}
              />
              {isSelected && (
                <span className="text-[11px] font-bold text-white bg-white/20 rounded-full px-1.5 py-0.5">
                  Active
                </span>
              )}
            </div>
            <p className="text-[13.5px] font-semibold text-white leading-tight">{t.name}</p>
            <p className="mt-1 text-[11px] text-[#777] leading-snug line-clamp-1">{t.tagline}</p>
          </button>
        );
      })}
    </div>
  );
}
