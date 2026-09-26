"use client";

import { useState } from "react";
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
import { ChevronRight, ChevronLeft, Check, FileText } from "lucide-react";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldScrubArea,
} from "@/components/reui/number-field";

interface ToggleProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
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

export function CreateTestDialog({ isOpen, setIsOpen }: ToggleProps) {
  const [step, setStep] = useState(1);
  const [questionCount, setQuestionCount] = useState({
    mcq: 0,
    msq: 0,
    nat: 0,
    trueFalse: 0,
  });

  const [testData, setTestData] = useState({
    title: "",
    description: "",
    duration: "",
  });

  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);

  const documents = [
    { _id: "1", title: "React Basics", category: "Frontend" },
    { _id: "2", title: "NextJS Guide", category: "Fullstack" },
    { _id: "3", title: "TypeScript", category: "Languages" },
  ];

  const handleQuestionCountChange = (
    type: keyof typeof questionCount,
    value: number,
  ) => {
    setQuestionCount((prev) => ({
      ...prev,
      [type]: Math.max(0, value),
    }));
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTestData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const toggleDocument = (id: string) => {
    setSelectedDocumentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setStep(1); // Reset wizard state on close
    }
  };

  const handleSave = () => {
    const finalPayload = {
      ...testData,
      documentIds: selectedDocumentIds,
      questionCount,
    };

    console.log("Final Payload:", finalPayload);
    // Call your tRPC mutation here

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

              <div className="w-full  max-w-48">
                <NumberField defaultValue={60} min={0} max={100} step={10}>
                  <NumberFieldScrubArea label="Questions" />
                  <NumberFieldGroup>
                    <NumberFieldDecrement />
                    <NumberFieldInput />
                    <NumberFieldIncrement />
                  </NumberFieldGroup>
                </NumberField>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setStep(2)} disabled={!testData.title}>
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
              <div className="flex flex-col gap-2">
                {documents.map((doc) => {
                  const selected = selectedDocumentIds.includes(doc._id);

                  return (
                    <Card
                      key={doc._id}
                      className={`p-3 flex flex-row items-center justify-between transition-all hover:border-primary/50 ${
                        selected ? "border-primary bg-primary/5" : ""
                      }`}
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

                      <div className="shrink-0 ml-4">
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => toggleDocument(doc._id)}
                        />
                      </div>
                    </Card>
                  );
                })}
              </div>
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

                  <div className="w-25  max-w-48">
                    <NumberField defaultValue={5} min={0} max={10}>
                      <NumberFieldScrubArea label="Questions" />
                      <NumberFieldGroup>
                        <NumberFieldDecrement />
                        <NumberFieldInput />
                        <NumberFieldIncrement />
                      </NumberFieldGroup>
                    </NumberField>
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter className="flex justify-between sm:justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ChevronLeft className="mr-1 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleSave}>Create Test</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
