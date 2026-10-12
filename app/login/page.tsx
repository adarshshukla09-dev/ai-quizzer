"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GalleryVerticalEnd } from "lucide-react";

import { LoginForm } from "@/components/utils/login-form";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      const session = await authClient.getSession();

      if (session.data?.user) {
        router.replace("/");
      }
    }

    checkSession();
  }, [router]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a
          href="#"
          className="flex items-center gap-2 self-center font-medium text-black dark:text-foreground"
        >
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Acme Inc.
        </a>

        <LoginForm />
      </div>
    </div>
  );
}
