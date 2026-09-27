"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  FileText,
  FileUp,
  Loader2,
} from "lucide-react";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/components/reui/number-field";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/userStore";

export interface DocumentItem {
  _id: string;
  title: string;
  category: string;
}

export interface TestPayload {
  title: string;
  description: string;
  topic: string;
  duration: number;
  documentIds: string[];
  questionCount: Record<QuestionTypeKey, number>;
}

interface CreateTestDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSubmit?: (payload: TestPayload) => void;
  documents?: DocumentItem[];
}

const QUESTION_TYPES = [
  {
    key: "mcq",
    label: "Multiple Choice (MCQ)",
    description: "Single correct answer",
  },
  {
    key: "msq",
    label: "Multiple Select (MSQ)",
    description: "One or more correct answers",
  },
  {
    key: "nat",
    label: "Numerical Answer (NAT)",
    description: "Direct numerical entry",
  },
  {
    key: "trueFalse",
    label: "True / False",
    description: "Binary choice question",
  },
] as const;

type QuestionTypeKey = (typeof QUESTION_TYPES)[number]["key"];

const DEFAULT_QUESTION_COUNTS: Record<QuestionTypeKey, number> = {
  mcq: 5,
  msq: 0,
  nat: 0,
  trueFalse: 0,
};

const DEFAULT_TEST_DATA = {
  title: "",
  description: "",
  topic: "",
  duration: 60,
};

export function CreateTestDialog({
  isOpen,
  setIsOpen,
  onSubmit,
}: CreateTestDialogProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [questionCount, setQuestionCount] = useState<
    Record<QuestionTypeKey, number>
  >(DEFAULT_QUESTION_COUNTS);
  const [testData, setTestData] = useState(DEFAULT_TEST_DATA);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);

  const totalQuestions = Object.values(questionCount).reduce(
    (acc, count) => acc + count,
    0,
  );

  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user?.id) {
      router.push("/login");
    }
  }, [user?.id, router]);

  const {
    data: documents,
    isLoading,
    isError,
    error,
  } = trpc.document.getDocument.useQuery(
    { teacherId: user?.id ?? "" },
    { enabled: !!user?.id },
  );

  const resetForm = () => {
    setStep(1);
    setTestData(DEFAULT_TEST_DATA);
    setQuestionCount(DEFAULT_QUESTION_COUNTS);
    setSelectedDocumentIds([]);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const handleQuestionCountChange = (type: QuestionTypeKey, value: number) => {
    setQuestionCount((prev) => ({
      ...prev,
      [type]: isNaN(value) ? 0 : Math.max(0, value),
    }));
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTestData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleDocument = (id: string) => {
    setSelectedDocumentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSave = () => {
    const finalPayload: TestPayload = {
      ...testData,
      documentIds: selectedDocumentIds,
      questionCount,
    };

    if (onSubmit) {
      onSubmit(finalPayload);
    } else {
      console.log("Final Payload:", finalPayload);
    }

    handleOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b pb-3 mb-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  step === i
                    ? "bg-primary text-primary-foreground"
                    : step > i
                      ? "bg-muted text-foreground"
                      : "bg-muted/50 text-muted-foreground"
                }`}
              >
                {step > i ? <Check className="h-4 w-4" /> : i}
              </div>
              <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
                {i === 1 ? "Details" : i === 2 ? "Documents" : "Questions"}
              </span>
              {i < 3 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle>Test Details</DialogTitle>
              <DialogDescription>
                Provide general information about the test structure.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. Midterm Computer Science Exam"
                  value={testData.title}
                  onChange={handleInput}
                  autoFocus
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="e.g. Covers React hooks and state management"
                  value={testData.description}
                  onChange={handleInput}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="topic">Test Topics (from PDF)</Label>
                <Input
                  id="topic"
                  name="topic"
                  placeholder="e.g. Custom hooks, Context API, useCallback"
                  value={testData.topic}
                  onChange={handleInput}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="duration">Duration (Minutes)</Label>
                <div className="w-full max-w-48">
                  <NumberField
                    id="duration"
                    value={testData.duration}
                    onValueChange={(val) =>
                      setTestData((prev) => ({
                        ...prev,
                        duration: val ?? 0,
                      }))
                    }
                    min={5}
                    max={300}
                    step={5}
                  >
                    <NumberFieldGroup>
                      <NumberFieldDecrement />
                      <NumberFieldInput />
                      <NumberFieldIncrement />
                    </NumberFieldGroup>
                  </NumberField>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={() => setStep(2)}
                disabled={!testData.title.trim()}
              >
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Step 2: Document Selection */}
        {step === 2 && (
          <>
            <DialogHeader>
              <DialogTitle>Select Knowledge Base</DialogTitle>
              <DialogDescription>
                Choose source documents used to generate test questions.
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="h-70 pr-3 my-2">
              {isLoading ? (
                <div className="flex items-center justify-center p-8 h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : !documents || documents.length === 0 ? (
                <div className="flex items-center justify-center p-4 h-full">
                  <Empty>
                    <EmptyHeader>
                      <EmptyTitle>No documents found</EmptyTitle>
                      <EmptyDescription>
                        You haven&apos;t uploaded any study materials yet.
                        Upload a document to generate questions automatically.
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent className="flex-col items-center gap-3">
                      <Button asChild size="sm">
                        <Link href="/documents/upload">
                          <FileUp className="mr-2 h-4 w-4" /> Upload Document
                        </Link>
                      </Button>
                    </EmptyContent>
                  </Empty>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {documents.map((doc) => {
                    const selected = selectedDocumentIds.includes(doc._id);

                    return (
                      <Card
                        key={doc._id}
                        className={`p-3 flex flex-row items-center justify-between transition-all hover:border-primary/50 cursor-pointer ${
                          selected ? "border-primary bg-primary/5" : ""
                        }`}
                        onClick={() => toggleDocument(doc._id)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="h-5 w-5 text-muted-foreground shrink-0" />

                          <div className="min-w-0">
                            <p className="text-sm font-medium leading-none truncate">
                              {doc.title}
                            </p>

                            <p className="text-xs text-muted-foreground mt-1">
                              {doc.category}
                            </p>
                          </div>
                        </div>

                        <div
                          className="shrink-0 ml-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={selected}
                            onCheckedChange={() => toggleDocument(doc._id)}
                          />
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            <DialogFooter className="flex justify-between sm:justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ChevronLeft className="mr-1 h-4 w-4" /> Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={selectedDocumentIds.length === 0}
              >
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Step 3: Question Distribution */}
        {step === 3 && (
          <>
            <DialogHeader>
              <DialogTitle>Question Distribution</DialogTitle>
              <DialogDescription>
                Specify how many questions to generate for each format type.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3 py-2">
              {QUESTION_TYPES.map(({ key, label, description }) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-lg border p-3 shadow-xs"
                >
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">{label}</Label>
                    <p className="text-xs text-muted-foreground">
                      {description}
                    </p>
                  </div>

                  <div className="w-28 max-w-48">
                    <NumberField
                      value={questionCount[key]}
                      onValueChange={(val) =>
                        handleQuestionCountChange(key, val ?? 0)
                      }
                      min={0}
                      max={50}
                    >
                      <NumberFieldGroup>
                        <NumberFieldDecrement />
                        <NumberFieldInput />
                        <NumberFieldIncrement />
                      </NumberFieldGroup>
                    </NumberField>
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center text-xs text-muted-foreground px-1 pt-1">
                <span>Total Questions:</span>
                <span className="font-semibold text-foreground">
                  {totalQuestions}
                </span>
              </div>
            </div>

            <DialogFooter className="flex justify-between sm:justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ChevronLeft className="mr-1 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleSave} disabled={totalQuestions === 0}>
                Create Test
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
