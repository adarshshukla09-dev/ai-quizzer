"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type QuestionType = "single" | "multiple" | "numerical";

type Question = {
  id: number;
  question: string;
  marks: number;
  type: QuestionType;
  options?: string[];
  answer: string | string[];
  explanation: string;
};

const questions: Question[] = [
  {
    id: 1,
    question: "Which language is used for building Next.js applications?",
    marks: 2,
    type: "single",
    options: ["Python", "JavaScript", "Java", "C++"],
    answer: "JavaScript",
    explanation:
      "Next.js is a React framework built using JavaScript or TypeScript.",
  },

  {
    id: 2,
    question: "Which of the following are JavaScript frameworks/libraries?",
    marks: 3,
    type: "multiple",
    options: ["React", "Angular", "Django", "Vue"],
    answer: ["React", "Angular", "Vue"],
    explanation:
      "React, Angular, and Vue are JavaScript frontend frameworks/libraries.",
  },

  {
    id: 3,
    question: "What is the value of 25 × 4?",
    marks: 2,
    type: "numerical",
    answer: "100",
    explanation: "25 multiplied by 4 equals 100.",
  },
];

export default function QuizTest() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const question = questions[current];

  function toggleOption(option: string) {
    if (question.type === "multiple") {
      setSelected((prev) =>
        prev.includes(option)
          ? prev.filter((x) => x !== option)
          : [...prev, option],
      );
    } else {
      setSelected([option]);
    }

    setSubmitted(false);
  }

  function checkAnswer() {
    setSubmitted(true);
  }

  function isCorrect() {
    if (question.type === "multiple") {
      return (
        selected.length === (question.answer as string[]).length &&
        selected.every((x) => (question.answer as string[]).includes(x))
      );
    }

    return selected[0] === question.answer;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="rounded-2xl border bg-card p-6">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">Question {current + 1}</h2>

          <span className="text-sm text-muted-foreground">
            {question.marks} Marks
          </span>
        </div>

        <p className="text-lg font-medium mb-6">{question.question}</p>

        {/* Options */}

        {question.type !== "numerical" && (
          <div className="space-y-3">
            {question.options?.map((option) => {
              const selectedOption = selected.includes(option);

              const correct = submitted && question.answer.includes(option);

              const wrong =
                submitted &&
                selectedOption &&
                !question.answer.includes(option);

              return (
                <button
                  key={option}
                  onClick={() => toggleOption(option)}
                  className={`
          w-full text-left p-4 rounded-xl border transition
          
          ${selectedOption ? "border-primary bg-primary/10" : "hover:bg-muted"}

          ${correct ? "border-green-500 bg-green-500/10" : ""}

          ${wrong ? "border-red-500 bg-red-500/10" : ""}

          `}
                >
                  <div className="flex justify-between">
                    <span>{option}</span>

                    {submitted && correct && (
                      <CheckCircle2 className="text-green-500" />
                    )}

                    {submitted && wrong && <XCircle className="text-red-500" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Numerical Answer */}

        {question.type === "numerical" && (
          <input
            value={selected[0] || ""}
            onChange={(e) => setSelected([e.target.value])}
            placeholder="Enter numerical answer"
            className="
        w-full rounded-xl border p-4
        bg-background
        "
          />
        )}

        <Button onClick={checkAnswer} className="mt-6">
          Submit Answer
        </Button>

        {submitted && (
          <div
            className={`
        mt-6 rounded-xl p-4
        
        ${isCorrect() ? "bg-green-500/10" : "bg-red-500/10"}

        `}
          >
            <div className="font-bold mb-2">
              {isCorrect() ? "Correct Answer 🎉" : "Incorrect Answer"}
            </div>

            <p>
              <b>Correct Answer:</b>{" "}
              {Array.isArray(question.answer)
                ? question.answer.join(", ")
                : question.answer}
            </p>

            <p className="mt-2 text-muted-foreground">
              <b>Explanation:</b> {question.explanation}
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button
          disabled={current === 0}
          variant="outline"
          onClick={() => {
            setCurrent((x) => x - 1);
            setSelected([]);
            setSubmitted(false);
          }}
        >
          Previous
        </Button>

        <Button
          disabled={current === questions.length - 1}
          onClick={() => {
            setCurrent((x) => x + 1);
            setSelected([]);
            setSubmitted(false);
          }}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
