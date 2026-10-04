"use client";

import { useEffect, useState } from "react";

export type QuestionType = "MCQ" | "MSQ" | "TRUE_FALSE" | "NAT";

export type AnswerValue = string | string[] | number | boolean | null;

export interface Question {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[];
}

interface QuestionRendererProps {
  question: Question;
  value?: AnswerValue;
  onAnswer?: (answer: AnswerValue) => void;
}

export default function QuestionRenderer({
  question,
  value,
  onAnswer,
}: QuestionRendererProps) {
  const [selectedSingle, setSelectedSingle] = useState<string | null>(
    typeof value === "string" ? value : null,
  );

  const [selectedMultiple, setSelectedMultiple] = useState<string[]>(
    Array.isArray(value) ? value : [],
  );

  const [natAnswer, setNatAnswer] = useState<string>(
    typeof value === "number" || typeof value === "string" ? String(value) : "",
  );

  useEffect(() => {
    if (question.type === "MCQ") {
      setSelectedSingle(typeof value === "string" ? value : null);
      return;
    }

    if (question.type === "MSQ") {
      setSelectedMultiple(Array.isArray(value) ? value : []);
      return;
    }

    if (question.type === "TRUE_FALSE") {
      setSelectedSingle(typeof value === "boolean" ? String(value) : null);
      return;
    }

    if (question.type === "NAT") {
      setNatAnswer(
        typeof value === "number" || typeof value === "string"
          ? String(value)
          : "",
      );
    }
  }, [question.id, question.type, value]);

  const handleMCQ = (option: string) => {
    setSelectedSingle(option);
    onAnswer?.(option);
  };

  const handleMSQ = (option: string) => {
    const updated = selectedMultiple.includes(option)
      ? selectedMultiple.filter((item) => item !== option)
      : [...selectedMultiple, option];

    setSelectedMultiple(updated);
    onAnswer?.(updated);
  };

  const handleTrueFalse = (value: boolean) => {
    setSelectedSingle(String(value));
    onAnswer?.(value);
  };

  const handleNAT = (value: string) => {
    setNatAnswer(value);

    if (value.trim() === "") {
      onAnswer?.(null);
      return;
    }

    const number = Number(value);

    if (!Number.isNaN(number)) {
      onAnswer?.(number);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {question.type}
        </span>

        <h2 className="mt-2 text-xl font-semibold leading-relaxed text-foreground">
          {question.question}
        </h2>
      </div>

      {question.type === "MCQ" && (
        <MCQOptions
          options={question.options ?? []}
          selected={selectedSingle}
          onSelect={handleMCQ}
        />
      )}

      {question.type === "MSQ" && (
        <MSQOptions
          options={question.options ?? []}
          selected={selectedMultiple}
          onSelect={handleMSQ}
        />
      )}

      {question.type === "TRUE_FALSE" && (
        <TrueFalseOptions
          selected={selectedSingle}
          onSelect={handleTrueFalse}
        />
      )}

      {question.type === "NAT" && (
        <NATInput value={natAnswer} onChange={handleNAT} />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MCQ                                                                        */
/* -------------------------------------------------------------------------- */

function MCQOptions({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: string | null;
  onSelect: (option: string) => void;
}) {
  return (
    <div className="space-y-3" role="radiogroup">
      {options.map((option, index) => {
        const isSelected = selected === option;
        const label = String.fromCharCode(65 + index);

        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(option)}
            className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all ${
              isSelected
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium ${
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground"
              }`}
            >
              {label}
            </span>

            <span className="text-foreground">{option}</span>
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MSQ                                                                        */
/* -------------------------------------------------------------------------- */

function MSQOptions({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: string[];
  onSelect: (option: string) => void;
}) {
  return (
    <div className="space-y-3">
      {options.map((option, index) => {
        const isSelected = selected.includes(option);
        const label = String.fromCharCode(65 + index);

        return (
          <button
            key={option}
            type="button"
            role="checkbox"
            aria-checked={isSelected}
            onClick={() => onSelect(option)}
            className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all ${
              isSelected
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            }`}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs font-bold ${
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border"
              }`}
            >
              {isSelected ? "✓" : ""}
            </span>

            <span className="font-semibold text-muted-foreground">
              {label}.
            </span>

            <span className="text-foreground">{option}</span>
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* TRUE / FALSE                                                               */
/* -------------------------------------------------------------------------- */

function TrueFalseOptions({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (value: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {[true, false].map((value) => {
        const isSelected = selected === String(value);

        return (
          <button
            key={String(value)}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(value)}
            className={`rounded-xl border p-5 text-center font-medium transition-all ${
              isSelected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-foreground hover:border-primary/50 hover:bg-muted/50"
            }`}
          >
            {value ? "True" : "False"}
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* NAT                                                                        */
/* -------------------------------------------------------------------------- */

function NATInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor="nat-answer"
        className="text-sm font-medium text-foreground"
      >
        Enter your numerical answer
      </label>

      <input
        id="nat-answer"
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="e.g. 42"
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
