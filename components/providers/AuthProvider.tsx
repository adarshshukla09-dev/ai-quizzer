"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useAuthStore } from "@/store/userStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore((state) => state.setAuth);
  const setLoading = useAuthStore((state) => state.setLoading);
  const resetAuth = useAuthStore((state) => state.resetAuth);

  const { data: sessionData, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending) {
      setLoading(true);
      return;
    }

    if (sessionData?.user && sessionData?.session) {
      setAuth(sessionData.user, sessionData.session);
    } else {
      resetAuth();
    }
  }, [sessionData, isPending, setAuth, resetAuth, setLoading]);

  return children;
}
