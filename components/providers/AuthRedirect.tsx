"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuthStore } from "@/store/userStore";
import { trpc } from "@/trpc/client";

export default function AuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.isLoading);

  const {
    data,
    isLoading: userLoading,
  } = trpc.user.getUser.useQuery(
    {
      userId: user?.id ?? "",
    },
    {
      enabled: !!user?.id,
    },
  );

  useEffect(() => {
    // Wait until the auth store has finished checking the session.
    if (authLoading) return;

    // Not authenticated → login.
    if (!user) {
      if (pathname !== "/login") {
        router.replace("/login");
      }
      return;
    }

    // Wait until the user's database record has loaded.
    if (userLoading) return;

    // Authenticated but no role → role selection.
    if (!data?.role) {
      if (pathname !== "/role") {
        router.replace("/role");
      }
      return;
    }
  }, [
    user,
    data,
    authLoading,
    userLoading,
    pathname,
    router,
  ]);

  return null;
}