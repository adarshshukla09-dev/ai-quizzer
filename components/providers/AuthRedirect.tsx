"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/userStore";
import { trpc } from "@/trpc/client";

export default function AuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  const user = useAuthStore((state) => state.user);

  const { data, isLoading } = trpc.user.getUser.useQuery(
    { userId: user?.id ?? "" },
    {
      enabled: !!user?.id,
    },
  );

  useEffect(() => {
    if (!user || isLoading) return;

    if (!data?.role && pathname !== "/role") {
      router.replace("/role");
    }
  }, [user, data, isLoading, pathname, router]);

  return null;
}
