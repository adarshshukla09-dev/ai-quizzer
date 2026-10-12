"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import type { TestPayload } from "@/components/Test/CreateTest";

const QRCodeScanner = dynamic(() => import("@/components/Test/QRCodeScanner"), {
  ssr: false,
})
const TestList = dynamic(() => import("@/components/Test/TestList"), {
  ssr: false,
});

const CreateTestDialog = dynamic(
  () =>
    import("@/components/Test/CreateTest").then((mod) => mod.CreateTestDialog),
  { ssr: false },
);
const handleScan = (value: string) => {
    console.log("QR value:", value);
  };
export default function TestPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const router = useRouter();

  const createTestMutation = trpc.test.createTest.useMutation();
  const generateQuestionMutation = trpc.question.createQuestion.useMutation();

  useEffect(() => {
    async function getSession() {
      const session = await authClient.getSession();

      setUser(session.data?.user ?? null);
      setIsLoadingAuth(false);
    }

    getSession();
  }, []);

  const handleCreateTest = async (payload: TestPayload) => {
    if (!user?.id) return;

    const totalQuestions = Object.values(payload.questionCount).reduce(
      (sum, count) => sum + count,
      0,
    );

    const test = await createTestMutation.mutateAsync({
      teacherId: user.id,
      title: payload.title,
      description: payload.description,
      documentIds: payload.documentIds,
      questionCount: payload.questionCount,
      totalMarks: totalQuestions,
      duration: payload.duration,
    });

    await generateQuestionMutation.mutateAsync({
      testId: test._id.toString(),
      documentIds: payload.documentIds,
      topic: payload.topic,
      teacherId: user.id,
      mcq: payload.questionCount.mcq,
      msq: payload.questionCount.msq,
      nat: payload.questionCount.nat,
      tf: payload.questionCount.trueFalse,
    });

    setIsOpen(false);
  };

  if (isLoadingAuth) {
    return <div>Loading...</div>;
  }

  return (
    <>
    { user.role === "teacher" ? <div className="container max-w-5xl mx-auto py-12 mt-9 px-4 space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Your Tests</h1>

          <p className="text-muted-foreground text-sm">
            Select a test to review questions or check status.
          </p>
        </div>

        <Button onClick={() => setIsOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Test
        </Button>
      </header>

      <main>
        <TestList />
      </main>

      <CreateTestDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onSubmit={handleCreateTest}
      />
    </div> :
       <div className="container max-w-5xl mx-auto py-12 mt-9 px-4 space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Your Tests</h1>

          <p className="text-muted-foreground text-sm">
            Select a test to review questions or check status.
          </p>
        </div>

        
      </header>

      <main>
      <QRCodeScanner onScan={handleScan} />      </main>
      </div>}
    </>
  );
}
