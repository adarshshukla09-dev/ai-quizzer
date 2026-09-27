"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import TestCard from "@/components/utils/TestCard";
import { useAuthStore } from "@/store/userStore";
import { trpc } from "@/trpc/client";
import { Card } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { FileQuestion, AlertCircle } from "lucide-react";

export default function TestList() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user?.id) {
      router.push("/login");
    }
  }, [user?.id, router]);

  const {
    data: tests,
    isLoading,
    isError,
    error,
  } = trpc.test.getTest.useQuery(
    { teacherId: user?.id ?? "" },
    { enabled: !!user?.id },
  );

  // 1. Auth Guard State
  if (!user?.id) {
    return (
      <div className="p-4 text-sm text-muted-foreground animate-pulse">
        Redirecting to login...
      </div>
    );
  }

  // 2. Loading Skeleton State
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 p-2">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-24 w-full animate-pulse bg-muted/40" />
        ))}
      </div>
    );
  }

  // 3. Error State
  if (isError) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>Failed to load tests: {error.message}</span>
      </div>
    );
  }

  // 4. Empty State
  if (!tests || tests.length === 0) {
    return (
      <div className="flex justify-center p-8 border rounded-lg bg-card">
        <Empty>
          <EmptyHeader>
            <div className="flex justify-center mb-2">
              <FileQuestion className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <EmptyTitle>No tests generated yet</EmptyTitle>
            <EmptyDescription>
              Create your first test using the button above to start generating
              AI questions from your documents.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  // 5. Test List
  return (
    <section className="flex flex-col gap-3 p-2">
      {tests.map((test) => (
        <TestCard key={test._id} test={test} />
      ))}
    </section>
  );
}
