"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { useAuthStore } from "@/store/userStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore((state) => state.setAuth);
  const setLoading = useAuthStore((state) => state.setLoading);
  const resetAuth = useAuthStore((state) => state.resetAuth);

  const { data: sessionData, isPending } = authClient.useSession();

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setLoading(isPending);

    if (isPending) return;

    if (sessionData?.user && sessionData?.session) {
      setAuth(sessionData.user, sessionData.session);

      // if (sessionData.user.role == null && pathname !== "/role") {
      // router.push("/role");
      // }
    } else {
      resetAuth();
    }
  }, [
    sessionData,
    isPending,
    pathname,
    router,
    setAuth,
    resetAuth,
    setLoading,
  ]);

  return children;
}
