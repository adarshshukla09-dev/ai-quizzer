"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Shield, UserCheck, GraduationCap } from "lucide-react";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { authClient } from "@/lib/auth-client";
import { useAuthStore } from "@/store/userStore";
import { trpc } from "@/trpc/client";

type Role = "teacher" | "student";

export default function RolePage() {
  const [role, setRole] = useState<Role | "">("");
  const [geminiApiKey, setGeminiApiKey] = useState("");

  const router = useRouter();
  const utils = trpc.useUtils();

  // 1. Get active session
  const session = authClient.useSession();
  const userId = session.data?.user?.id;

  // 2. Query existing user data at the top level of the component
  const { data: userData, isLoading: isUserLoading } =
    trpc.user.getUser.useQuery(
      { userId: userId ?? "" },
      { enabled: !!userId }
    );

  // 3. Pre-select existing role if user already has one set
  useEffect(() => {
    if (userData?.role) {
      setRole(userData.role as Role);
    }
  }, [userData]);

  const { mutateAsync: updateUser, isPending } =
    trpc.user.updateRole.useMutation();

  const handleRoleChange = (value: string) => {
    const newRole = value as Role;
    setRole(newRole);

    if (newRole === "student") {
      setGeminiApiKey("");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!role) return;
    if (role === "teacher" && !geminiApiKey.trim()) return;

    try {
      const updatedUser = await updateUser({
        role,
        geminiApiKey: role === "teacher" ? geminiApiKey.trim() : undefined,
      });

      // Update Zustand state safely (do not expose raw API key)
      useAuthStore.setState((state) => ({
        ...state,
        user: state.user
          ? {
              ...state.user,
              role: updatedUser.role,
              hasGeminiApiKey: Boolean(
                role === "teacher" && geminiApiKey.trim()
              ),
            }
          : state.user,
      }));

      // Invalidate TRPC cache for immediate state sync across components
      await utils.user.getUser.invalidate();

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Failed to update user role:", error);
    }
  };

  const isTeacher = role === "teacher";
  const isValid = role && (!isTeacher || geminiApiKey.trim().length > 0);

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="container relative mx-auto flex min-h-screen w-full flex-col items-center justify-center p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 z-0 h-150 w-200 -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,var(--primary),transparent_70%)] opacity-25 blur-3xl"
      />

      <Card className="relative z-10 w-full max-w-md shadow-lg border-border">
        <CardHeader className="space-y-1.5 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Select Account Role
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Choose your profile type to configure workspace features.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Select your role</Label>

              <RadioGroup
                value={role}
                onValueChange={handleRoleChange}
                className="grid grid-cols-2 gap-3"
              >
                {/* Teacher Option */}
                <Label
                  htmlFor="role-teacher"
                  className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition-all ${
                    role === "teacher"
                      ? "border-primary bg-primary/10 text-primary font-semibold ring-2 ring-primary/20"
                      : "border-border hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <RadioGroupItem
                    id="role-teacher"
                    value="teacher"
                    className="sr-only"
                  />
                  <UserCheck className="size-6" />
                  <span className="text-sm">Teacher</span>
                </Label>

                {/* Student Option */}
                <Label
                  htmlFor="role-student"
                  className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition-all ${
                    role === "student"
                      ? "border-primary bg-primary/10 text-primary font-semibold ring-2 ring-primary/20"
                      : "border-border hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <RadioGroupItem
                    id="role-student"
                    value="student"
                    className="sr-only"
                  />
                  <GraduationCap className="size-6" />
                  <span className="text-sm">Student</span>
                </Label>
              </RadioGroup>
            </div>

            {/* Teacher Gemini API Key Input */}
            {isTeacher && (
              <div className="space-y-2 animate-in fade-in-50 slide-in-from-top-2 duration-200">
                <Label htmlFor="gemini-api-key" className="text-sm font-medium">
                  Gemini API Key <span className="text-destructive">*</span>
                </Label>

                <div className="relative">
                  <Input
                    id="gemini-api-key"
                    type="password"
                    placeholder="Enter your Gemini API key"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    autoComplete="off"
                    disabled={isPending}
                    className="pr-10"
                  />
                  <Shield className="absolute right-3 top-2.5 size-4 text-muted-foreground" />
                </div>

                <p className="text-xs text-muted-foreground">
                  Your Gemini key is encrypted server-side and used strictly for teacher features.
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={!isValid || isPending}
              className="w-full rounded-lg font-medium shadow-sm"
              size="lg"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving Profile...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}