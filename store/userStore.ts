import { create } from "zustand";
import { User, Session } from "better-auth";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;

  setAuth: (user: User | null, session: Session | null) => void;

  setLoading: (isLoading: boolean) => void;

  resetAuth: () => void;

  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: true,

      setAuth: (user, session) => {
        set({
          user,
          session,
          isLoading: false,
        });
      },

      setLoading: (isLoading) => {
        set({
          isLoading,
        });
      },

      resetAuth: () => {
        set({
          user: null,
          session: null,
          isLoading: false,
        });
      },

      isAuthenticated: () => {
        return !!get().user && !!get().session;
      },
    }),

    {
      name: "auth-store",

      storage: createJSONStorage(() => localStorage),

      // Store only necessary data
      partialize: (state) => ({
        user: state.user,
        session: state.session,
      }),
    },
  ),
);
