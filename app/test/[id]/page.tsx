import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { serverTrpc } from "@/trpc/server";
import TestClient from "@/components/Test/TestClient";

interface TestPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TestPage({ params }: TestPageProps) {
  const { id } = await params;


  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user;

  if (!user) {
    return <div>Please login first.</div>;
  }

  if (user.role === "teacher") {
    return <TestClient role="teacher" testId={id} />;
  }

  if (user.role === "student") {
    const questions = await serverTrpc.question.getQuestionForStudent({
      testId: id,
    });

    const formattedQuestions = questions.map((question) => ({
      id: question._id.toString(),
      question: question.question,
      type: question.questionType,
      options: question.options ?? [],
    }));

    return (
      <TestClient
        role="student"
        testId={id}
        studentId={user.id}
        questions={formattedQuestions}
      />
    );
  }

  return <div>You are not authorized to access this test.</div>;
}
