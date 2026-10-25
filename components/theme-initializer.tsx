"use client";

import { useEffect } from "react";
import { getStoredTheme, applyTheme } from "../lib/theme";

export default function ThemeInitializer() {
  useEffect(() => {
    const theme = getStoredTheme();
    applyTheme(theme);
  }, []);

  return null;
}
