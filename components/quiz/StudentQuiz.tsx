"use client";

import { useState } from "react";
import QuestionRenderer, {
  AnswerValue,
  Question,
} from "@/components/quiz/QuestionRenderer";
import { trpc } from "@/trpc/client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

interface StudentQuizProps {
  testId: string;
  studentId: string;
  questions: Question[];
}

export default function StudentQuiz({
  testId,
  studentId,
  questions,
}: StudentQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});

  // Controls confirmation dialog
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);

  const submitTest = trpc.test.submitTest.useMutation();

  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) {
    return <div>No questions available.</div>;
  }

  const currentAnswer = answers[currentQuestion.id] ?? null;

  const answeredCount = Object.values(answers).filter(
    (answer) => answer !== null && answer !== undefined,
  ).length;

  const unansweredCount = questions.length - answeredCount;

  const handleAnswer = (answer: AnswerValue) => {
    setAnswers((previous) => ({
      ...previous,
      [currentQuestion.id]: answer,
    }));
  };

  const goNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((index) => index + 1);
    }
  };

  const goPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((index) => index - 1);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentIndex(index);
  };

  // Open confirmation dialog
  const handleSubmitClick = () => {
    setShowSubmitConfirmation(true);
  };

  // Actually submit the test
  const handleConfirmSubmit = async () => {
    const submittedAnswers = questions.map((question) => ({
      questionId: question.id,
      answer: answers[question.id] ?? null,
    }));

    try {
      const result = await submitTest.mutateAsync({
        testId,
        studentId,
        answers: submittedAnswers,
      });

      console.log("Test submitted:", result);

      // Close confirmation dialog
      setShowSubmitConfirmation(false);

      // You can redirect/show result here
      // router.push(`/tests/${testId}/result`);
    } catch (error) {
      console.error("Failed to submit test:", error);
    }
  };

  return (
    <>
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Question {currentIndex + 1} of {questions.length}
            </p>

            <h1 className="text-2xl font-bold">Test</h1>
          </div>

          <div className="text-sm text-muted-foreground">
            {answeredCount}/{questions.length} answered
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <QuestionRenderer
            question={currentQuestion}
            value={currentAnswer}
            onAnswer={handleAnswer}
          />
        </div>

        <div className="mt-6 rounded-2xl border bg-card p-4">
          <p className="mb-3 text-sm font-medium">Questions</p>

          <div className="flex flex-wrap gap-2">
            {questions.map((question, index) => {
              const answered =
                answers[question.id] !== undefined &&
                answers[question.id] !== null;

              const active = index === currentIndex;

              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => goToQuestion(index)}
                  className={`h-10 w-10 rounded-lg border text-sm font-medium transition ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : answered
                        ? "border-primary/50 bg-primary/10"
                        : "border-border hover:bg-muted"
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={goPrevious}
            className="rounded-lg border px-5 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          {currentIndex === questions.length - 1 ? (
            <button
              type="button"
              disabled={submitTest.isPending}
              onClick={handleSubmitClick}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              Submit Test
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
            >
              Next
            </button>
          )}
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <Dialog
        open={showSubmitConfirmation}
        onOpenChange={setShowSubmitConfirmation}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Test?</DialogTitle>

            <DialogDescription>
              Are you sure you want to submit your test? You will not be able to
              change your answers after submission.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border bg-muted/50 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total questions</span>
              <span className="font-medium">{questions.length}</span>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <span className="text-muted-foreground">Answered</span>
              <span className="font-medium">{answeredCount}</span>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <span className="text-muted-foreground">Unanswered</span>
              <span
                className={
                  unansweredCount > 0
                    ? "font-medium text-destructive"
                    : "font-medium"
                }
              >
                {unansweredCount}
              </span>
            </div>
          </div>

          {unansweredCount > 0 && (
            <p className="text-sm text-destructive">
              You still have {unansweredCount} unanswered question
              {unansweredCount !== 1 ? "s" : ""}. Are you sure you want to
              submit?
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSubmitConfirmation(false)}
              disabled={submitTest.isPending}
            >
              Continue Test
            </Button>

            <Button
              type="button"
              onClick={handleConfirmSubmit}
              disabled={submitTest.isPending}
            >
              {submitTest.isPending ? "Submitting..." : "Yes, Submit Test"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
