"use client";

import { trpc } from "@/trpc/client";
import {
  Loader2,
  CheckCircle2,
  Pencil,
  Trash2,
  Plus,
  X,
  Save,
} from "lucide-react";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { IQuestion } from "@/db/mongdb/schema/questions.schema";

interface QuizTestProps {
  testId: string;
}

type QuestionWithId = IQuestion & { _id: string };

export default function QuizTest({ testId }: QuizTestProps) {
  const [userId, setUserId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<IQuestion>>({});

  const utils = trpc.useUtils();

  useEffect(() => {
    (async () => {
      const session = await authClient.getSession();
      const user = session.data?.user;
      if (user) {
        setUserId(user.id);
      }
    })();
  }, []);

  // tRPC Query
  const {
    data: questions,
    isLoading,
    isError,
    error,
  } = trpc.question.getQuestion.useQuery(
    { testId, teacherId: userId },
    { enabled: !!userId },
  );

  // tRPC Mutations
  const updateQuestionMutation = trpc.question.updateQuestion.useMutation({
    onSuccess: () => {
      setEditingId(null);
      utils.question.getQuestion.invalidate();
    },
  });

  const deleteQuestionMutation = trpc.question.deleteQuestion.useMutation({
    onSuccess: () => {
      utils.question.getQuestion.invalidate();
    },
  });

  // Start editing a specific question
  const handleStartEdit = (q: QuestionWithId) => {
    setEditingId(q._id.toString());
    setEditForm({
      question: q.question,
      options: q.options ? [...q.options] : [],
      answer: q.answer || "",
      correctOptions: q.correctOptions ? [...q.correctOptions] : [],
      explanation: q.explanation || "",
    });
  };

  // Option handlers for editing
  const handleOptionChange = (idx: number, value: string) => {
    const updatedOptions = [...(editForm.options || [])];
    const oldValue = updatedOptions[idx];
    updatedOptions[idx] = value;

    // Synchronize correctOptions if option text changed
    const updatedCorrect = (editForm.correctOptions || []).map((opt) =>
      opt === oldValue ? value : opt,
    );

    setEditForm((prev) => ({
      ...prev,
      options: updatedOptions,
      correctOptions: updatedCorrect,
      answer: prev.answer === oldValue ? value : prev.answer,
    }));
  };

  const handleAddOption = () => {
    setEditForm((prev) => ({
      ...prev,
      options: [...(prev.options || []), ""],
    }));
  };

  const handleRemoveOption = (idx: number) => {
    const optionToRemove = editForm.options?.[idx];
    const updatedOptions = (editForm.options || []).filter((_, i) => i !== idx);
    const updatedCorrect = (editForm.correctOptions || []).filter(
      (opt) => opt !== optionToRemove,
    );

    setEditForm((prev) => ({
      ...prev,
      options: updatedOptions,
      correctOptions: updatedCorrect,
      answer: prev.answer === optionToRemove ? "" : prev.answer,
    }));
  };

  const toggleCorrectOption = (opt: string) => {
    const currentCorrect = editForm.correctOptions || [];
    const exists = currentCorrect.includes(opt);
    const updated = exists
      ? currentCorrect.filter((item) => item !== opt)
      : [...currentCorrect, opt];

    setEditForm((prev) => ({
      ...prev,
      correctOptions: updated,
      answer: updated[0] || "", // Keep fallback answer string in sync
    }));
  };

  const handleSaveEdit = (questionId: string) => {
    updateQuestionMutation.mutate({
      questionId,
      teacherId: userId,
      question: editForm.question as string,
      options: editForm.options,
      answer: editForm.answer,
      correctOptions: editForm.correctOptions,
      explanation: editForm.explanation as string,
    });
  };

  const handleDelete = (questionId: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      deleteQuestionMutation.mutate({
        questionId,
        testId,
        teacherId: userId,
      });
    }
  };

  if (!userId || isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
        Failed to load questions: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {questions?.map((q: QuestionWithId, idx: number) => {
        const qId = q._id.toString();
        const isEditing = editingId === qId;

        if (isEditing) {
          return (
            <div
              key={qId}
              className="p-6 border border-primary/50 rounded-xl bg-card text-card-foreground shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="font-semibold text-sm text-primary">
                  Editing Question #{idx + 1}
                </span>
                <button
                  onClick={() => setEditingId(null)}
                  className="p-1 hover:bg-muted rounded text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Edit Question Text */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Question
                </label>
                <textarea
                  value={editForm.question || ""}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      question: e.target.value,
                    }))
                  }
                  className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={2}
                />
              </div>

              {/* Edit Options */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Options (Check box to mark as Correct)
                </label>
                {editForm.options?.map((opt, optIdx) => {
                  const isChecked = editForm.correctOptions?.includes(opt);
                  return (
                    <div key={optIdx} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!isChecked}
                        onChange={() => toggleCorrectOption(opt)}
                        className="h-4 w-4 rounded border-input accent-primary"
                        title="Mark as correct option"
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) =>
                          handleOptionChange(optIdx, e.target.value)
                        }
                        className="flex-1 p-2.5 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        placeholder={`Option ${optIdx + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(optIdx)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-md"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline pt-1"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Option
                </button>
              </div>

              {/* Edit Explanation */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Explanation
                </label>
                <textarea
                  value={editForm.explanation || ""}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      explanation: e.target.value,
                    }))
                  }
                  className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={2}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setEditingId(null)}
                  className="px-4 py-2 border border-border rounded-lg text-xs font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveEdit(qId)}
                  disabled={updateQuestionMutation.isPending}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {updateQuestionMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  Save Changes
                </button>
              </div>
            </div>
          );
        }

        return (
          <div
            key={qId}
            className="p-6 border border-border rounded-xl bg-card text-card-foreground shadow-xs space-y-4 relative group"
          >
            {/* Header: Question + Controls */}
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-semibold text-lg leading-snug flex-1">
                <span className="text-muted-foreground mr-1.5">{idx + 1}.</span>
                {q.question}
              </h3>

              {/* Edit and Delete Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleStartEdit(q)}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  title="Edit Question"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(qId)}
                  disabled={deleteQuestionMutation.isPending}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  title="Delete Question"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Options */}
            {q.options && q.options.length > 0 && (
              <ul className="space-y-2.5 pt-1">
                {q.options.map((option: string, optIdx: number) => {
                  const isCorrect =
                    q.correctOptions?.includes(option) || q.answer === option;

                  return (
                    <li
                      key={optIdx}
                      className={`flex items-center justify-between p-3.5 border rounded-lg text-sm transition-all ${
                        isCorrect
                          ? "border-emerald-500/50 bg-emerald-500/10 font-medium text-emerald-600 dark:text-emerald-400"
                          : "border-border bg-background/50 text-foreground"
                      }`}
                    >
                      <span>{option}</span>
                      {isCorrect && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Explanation Section */}
            {q.explanation && (
              <div className="mt-4 p-4 rounded-lg bg-muted/60 border border-border/60 text-sm space-y-1">
                <span className="font-medium text-foreground block">
                  Explanation
                </span>
                <p className="text-muted-foreground leading-relaxed">
                  {q.explanation}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
