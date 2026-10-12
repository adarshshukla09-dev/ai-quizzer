"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { useAuthStore } from "@/store/userStore";

// Unauthenticated public routes allowed without logging in
const PUBLIC_ROUTES = ["/", "/docs"];

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

      const userRole = (sessionData.user as { role?: string })?.role;

      // If user is logged in but hasn't selected a role, direct them to /role
      if (!userRole && pathname !== "/role") {
        router.replace("/role");
      }
    } else {
      resetAuth();

      // Check if current route is allowed for unauthenticated users
      const isPublicRoute = PUBLIC_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
      );

      // If not on a public route or already on /login, redirect unauthenticated users to /login
      if (!isPublicRoute && pathname !== "/login") {
        router.replace("/login");
      }
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