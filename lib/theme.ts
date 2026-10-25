/** StudyOS Color Palette Theme Engine.
 * Supports 5 refined accent palettes over the deep black aesthetic:
 * 1. Cosmic Violet (default)
 * 2. Emerald Aurora
 * 3. Electric Sapphire
 * 4. Solar Amber
 * 5. Crimson Rose
 */

export type ThemePaletteId = "violet" | "emerald" | "blue" | "amber" | "rose";

export interface ThemePalette {
  id: ThemePaletteId;
  name: string;
  tagline: string;
  previewColor: string;
  accentHex: string;
  gradientCss: string;
  glowRgba: string;
}

export const THEME_PALETTES: ThemePalette[] = [
  {
    id: "violet",
    name: "Cosmic Violet",
    tagline: "Deep violet & magenta aurora",
    previewColor: "#8b5cf6",
    accentHex: "#7c3aed",
    gradientCss: "linear-gradient(135deg, #6a4cf5, #d44df0, #ff7a3d)",
    glowRgba: "rgba(106, 76, 245, 0.45)",
  },
  {
    id: "emerald",
    name: "Emerald Aurora",
    tagline: "Vibrant neon mint & emerald",
    previewColor: "#10b981",
    accentHex: "#10b981",
    gradientCss: "linear-gradient(135deg, #059669, #10b981, #06b6d4)",
    glowRgba: "rgba(16, 185, 129, 0.45)",
  },
  {
    id: "blue",
    name: "Electric Sapphire",
    tagline: "Precision cyan & cobalt blue",
    previewColor: "#0099ff",
    accentHex: "#0099ff",
    gradientCss: "linear-gradient(135deg, #0284c7, #0099ff, #6366f1)",
    glowRgba: "rgba(0, 153, 255, 0.45)",
  },
  {
    id: "amber",
    name: "Solar Amber",
    tagline: "Warm focus gold & solar orange",
    previewColor: "#f59e0b",
    accentHex: "#f59e0b",
    gradientCss: "linear-gradient(135deg, #ea580c, #f59e0b, #fbbf24)",
    glowRgba: "rgba(245, 158, 11, 0.45)",
  },
  {
    id: "rose",
    name: "Crimson Rose",
    tagline: "Intense ruby & neon rose",
    previewColor: "#f43f5e",
    accentHex: "#e11d48",
    gradientCss: "linear-gradient(135deg, #be123c, #e11d48, #fb7185)",
    glowRgba: "rgba(225, 29, 72, 0.45)",
  },
];

export const THEME_STORAGE_KEY = "studyos_theme_palette_v1";

export function getStoredTheme(): ThemePaletteId {
  if (typeof window === "undefined") return "violet";
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemePaletteId | null;
    if (saved && THEME_PALETTES.some((t) => t.id === saved)) {
      return saved;
    }
  } catch {
    // Ignore storage errors
  }
  return "violet";
}

export function applyTheme(id: ThemePaletteId): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-theme", id);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, id);
  } catch {
    // Ignore storage errors
  }
}
