import { create } from "zustand";
import { User, Session } from "better-auth";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;

  setAuth: (user: User | null, session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  resetAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,

  setAuth: (user, session) =>
    set({
      user,
      session,
      isLoading: false,
    }),

  setLoading: (loading) =>
    set({
      isLoading: loading,
    }),

  resetAuth: () =>
    set({
      user: null,
      session: null,
      isLoading: false,
    }),
}));
