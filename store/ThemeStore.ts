import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  changeTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "light",

      changeTheme: (theme) => {
        set({ theme });
      },

      toggleTheme: () => {
        const currentTheme = get().theme;

        set({
          theme: currentTheme === "dark" ? "light" : "dark",
        });
      },
    }),
    {
      name: "theme-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);