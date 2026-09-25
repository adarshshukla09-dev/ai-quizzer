import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ThemeState {
  theme: "light" | "dark" | "system";

  changeTheme: (theme: "light" | "dark" | "system") => void;

  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "light",

      changeTheme: (theme) => {
        set({
          theme,
        });
      },

      toggleTheme: () => {
        const currentTheme = get().theme;

        set({
          theme: currentTheme === "light" ? "dark" : "light",
        });
      },
    }),

    {
      name: "theme-store",

      storage: createJSONStorage(() => localStorage),
    },
  ),
);
