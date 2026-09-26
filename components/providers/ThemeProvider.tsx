"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/store/ThemeStore";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      // system theme
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;

      root.classList.toggle("dark", systemDark);
    }
  }, [theme]);

  return children;
}
