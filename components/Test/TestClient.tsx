"use client";

import dynamic from "next/dynamic";

const QuizTest = dynamic(() => import("@/components/Test/QuizTest"), {
  ssr: false,
});

const StudentTest = dynamic(() => import("@/components/quiz/StudentQuiz"), {
  ssr: false,
});
import type { Question } from "@/components/quiz/QuestionRenderer";
interface TestClientProps {
  role: "teacher" | "student";
  testId: string;
  studentId?: string;
  questions?: Question[];
}

export default function TestClient({
  role,
  testId,
  studentId,
  questions = [],
}: TestClientProps) {
  if (role === "teacher") {
    return <QuizTest testId={testId} />;
  }

  return (
    <StudentTest testId={testId} studentId={studentId!} questions={questions} />
  );
}
