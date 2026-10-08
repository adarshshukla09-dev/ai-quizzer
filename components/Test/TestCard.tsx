"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  HelpCircle,
  Layers,
  Settings2,
  Trophy,
  XCircle,
  AlertCircle,
  Loader2,
  Archive,
  Pencil,
  Trash2,
  BarChart2,
  QrCode,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { trpc } from "@/trpc/client";
import TestQRCode from "./TestQRCode";

export type TestStatus =
  | "GENERATING"
  | "COMPLETED"
  | "FAILED"
  | "DRAFT"
  | "PUBLISHED"
  | "ARCHIVED";

export interface TestCardData {
  _id?: any;
  id?: any;
  teacherId?: string;
  title?: string;
  description?: string;
  documentIds?: any[];
  questionIds?: any[];
  questionCount?: {
    mcq?: any;
    msq?: any;
    nat?: any;
    trueFalse?: any;
  };
  totalMarks?: any;
  duration?: any;
  status?: TestStatus | string;
  isAvailable?: boolean;
  settings?: {
    shuffleQuestions?: boolean;
    shuffleOptions?: boolean;
    showResultImmediately?: boolean;
  };
  createdAt?: any;
  updatedAt?: any;
}

interface TestCardProps {
  test: TestCardData;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const parseString = (val: any, defaultVal = ""): string => {
  if (!val) return defaultVal;
  if (typeof val === "string") return val;
  if (typeof val === "object" && typeof val.toString === "function") {
    return val.toString();
  }
  return String(val);
};

const parseNumber = (val: any, defaultVal = 0): number => {
  if (val === undefined || val === null) return defaultVal;
  if (typeof val === "number") return val;
  if (typeof val === "object" && "$numberInt" in val)
    return Number(val.$numberInt);
  const parsed = Number(val);
  return isNaN(parsed) ? defaultVal : parsed;
};

const formatDate = (val: any): string => {
  if (!val) return "N/A";
  const dateObj = val instanceof Date ? val : new Date(val);
  if (isNaN(dateObj.getTime())) return "N/A";
  return dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const statusConfig: Record<
  string,
  {
    label: string;
    variant: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  PUBLISHED: {
    label: "Published",
    variant:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: CheckCircle2,
  },
  DRAFT: {
    label: "Draft",
    variant:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: AlertCircle,
  },
  GENERATING: {
    label: "Generating",
    variant:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    icon: Loader2,
  },
  COMPLETED: {
    label: "Completed",
    variant:
      "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    icon: CheckCircle2,
  },
  FAILED: {
    label: "Failed",
    variant: "bg-destructive/10 text-destructive border-destructive/20",
    icon: XCircle,
  },
  ARCHIVED: {
    label: "Archived",
    variant: "bg-muted text-muted-foreground border-border",
    icon: Archive,
  },
};

export default function TestCard({ test, onEdit, onDelete }: TestCardProps) {
  if (!test) return null;

  const utils = trpc.useUtils();

  const id = parseString(test._id || test.id);
  const title = test.title || "Untitled Test";
  const statusKey = parseString(test.status, "GENERATING").toUpperCase();
  const statusInfo = statusConfig[statusKey] || statusConfig.GENERATING;
  const StatusIcon = statusInfo.icon;

  const [isAvailable, setIsAvailable] = useState<boolean>(
    test.isAvailable ?? false
  );
  const [showQRCode, setShowQRCode] = useState<boolean>(false);

  useEffect(() => {
    setIsAvailable(test.isAvailable ?? false);
  }, [test.isAvailable]);

  const toggleAvailability = trpc.test.toggleAvailability.useMutation({
    onMutate: async (variables) => {
      const previousValue = isAvailable;
      setIsAvailable(variables.isAvailable);
      return { previousValue };
    },
    onError: (err, _variables, context) => {
      if (context?.previousValue !== undefined) {
        setIsAvailable(context.previousValue);
      }
      toast.error("Failed to update test availability");
    },
    onSettled: () => {
      utils.test.getTest.invalidate();
    },
  });

  const handleAvailabilityChange = (checked: boolean) => {
    toggleAvailability.mutate({
      testId: id,
      isAvailable: checked,
    });
  };

  const handleResultsClick = (e: React.MouseEvent) => {
    if (isAvailable) {
      e.preventDefault();
      toast.warning("Test is currently live", {
        description:
          "Students are currently taking this test. Toggle availability off to view final results.",
      });
    }
  };

  // Metrics calculation
  const duration = parseNumber(test.duration, 0);
  const totalMarks = parseNumber(test.totalMarks, 0);
  const mcq = parseNumber(test.questionCount?.mcq, 0);
  const msq = parseNumber(test.questionCount?.msq, 0);
  const nat = parseNumber(test.questionCount?.nat, 0);
  const trueFalse = parseNumber(test.questionCount?.trueFalse, 0);

  const totalQuestions =
    Array.isArray(test.questionIds) && test.questionIds.length > 0
      ? test.questionIds.length
      : mcq + msq + nat + trueFalse;

  const docCount = Array.isArray(test.documentIds)
    ? test.documentIds.length
    : 0;
  const formattedDate = formatDate(test.createdAt);

  return (
    <TooltipProvider>
      <div className="group relative w-full max-w-4xl rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:border-primary/50 hover:shadow-md flex flex-col justify-between gap-6">
        {/* Header Section */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1 max-w-xl">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-card-foreground">
                {title}
              </h2>
              {test.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {test.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Availability Toggle */}
              <div className="pr-2 border-r border-border/60">
                <Field orientation="horizontal" className="items-center gap-2">
                  <Switch
                    id={`availability-switch-${id}`}
                    checked={isAvailable}
                    disabled={toggleAvailability.isPending}
                    onCheckedChange={handleAvailabilityChange}
                    className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                  />
                  <FieldLabel
                    htmlFor={`availability-switch-${id}`}
                    className="text-xs font-medium text-muted-foreground cursor-pointer min-w-16"
                  >
                    {isAvailable ? "Available" : "Unavailable"}
                  </FieldLabel>
                </Field>
              </div>

              {/* Status Badge */}
              <Badge
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${statusInfo.variant}`}
              >
                <StatusIcon
                  className={`w-3.5 h-3.5 ${
                    statusKey === "GENERATING" ? "animate-spin" : ""
                  }`}
                />
                <span>{statusInfo.label}</span>
              </Badge>

              {/* QR Code Toggle Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={showQRCode ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8 rounded-full border-border hover:bg-accent"
                    onClick={() => setShowQRCode((prev) => !prev)}
                    aria-label="Toggle QR Code"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">
                    {showQRCode ? "Hide QR Code" : "Show QR Code"}
                  </p>
                </TooltipContent>
              </Tooltip>

              {/* Edit Action */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full border-border hover:bg-accent"
                    onClick={() => onEdit?.(id)}
                    aria-label="Edit test"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">Edit Test</p>
                </TooltipContent>
              </Tooltip>

              {/* Delete Action */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full border-border text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => onDelete?.(id)}
                    aria-label="Delete test"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">Delete Test</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* QR Code Container (Toggled) */}
        {showQRCode && (
          <div className="relative flex flex-col items-center justify-center p-6 border border-border bg-accent/20 rounded-xl transition-all">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 rounded-full"
                  onClick={() => setShowQRCode(false)}
                  aria-label="Close QR Code"
                >
                  <X className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p className="text-xs">Close</p>
              </TooltipContent>
            </Tooltip>
            <TestQRCode testCode={id} />
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border/60">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-4 h-4 text-primary shrink-0" />
            <div>
              <span className="block font-semibold text-foreground">
                {duration} mins
              </span>
              <span>Duration</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Trophy className="w-4 h-4 text-primary shrink-0" />
            <div>
              <span className="block font-semibold text-foreground">
                {totalMarks} Marks
              </span>
              <span>Total Score</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <HelpCircle className="w-4 h-4 text-primary shrink-0" />
            <div>
              <span className="block font-semibold text-foreground">
                {totalQuestions} Questions
              </span>
              <span>Question Count</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="w-4 h-4 text-primary shrink-0" />
            <div>
              <span className="block font-semibold text-foreground">
                {docCount} Docs
              </span>
              <span>Source Files</span>
            </div>
          </div>
        </div>

        {/* Question Type Breakdown */}
        {(mcq > 0 || msq > 0 || nat > 0 || trueFalse > 0) && (
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="flex items-center gap-1 font-medium text-muted-foreground">
              <Layers className="w-3.5 h-3.5" /> Breakdown:
            </span>
            {mcq > 0 && (
              <Badge variant="outline" className="text-[11px]">
                MCQ: {mcq}
              </Badge>
            )}
            {msq > 0 && (
              <Badge variant="outline" className="text-[11px]">
                MSQ: {msq}
              </Badge>
            )}
            {nat > 0 && (
              <Badge variant="outline" className="text-[11px]">
                NAT: {nat}
              </Badge>
            )}
            {trueFalse > 0 && (
              <Badge variant="outline" className="text-[11px]">
                T/F: {trueFalse}
              </Badge>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3 border-t border-border/60">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Created {formattedDate}</span>
            </div>

            {test.settings && (
              <div className="flex items-center gap-1.5">
                <Settings2 className="w-3.5 h-3.5 text-muted-foreground" />
                <span>
                  {[
                    test.settings.shuffleQuestions && "Shuffled Qs",
                    test.settings.shuffleOptions && "Shuffled Options",
                    test.settings.showResultImmediately && "Instant Results",
                  ]
                    .filter(Boolean)
                    .join(" • ") || "Default Settings"}
                </span>
              </div>
            )}
          </div>

          <div className="w-full sm:w-auto flex flex-wrap items-center justify-end gap-2">
            {/* See Results Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  {isAvailable ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleResultsClick}
                      className="rounded-full px-4 gap-1.5 text-xs opacity-80"
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                      <span>See Results</span>
                    </Button>
                  ) : (
                    <Button
                      asChild
                      size="sm"
                      variant="secondary"
                      className="rounded-full px-4 gap-1.5 text-xs"
                    >
                      <Link href={`/test/${id}/results`}>
                        <BarChart2 className="w-3.5 h-3.5" />
                        <span>See Results</span>
                      </Link>
                    </Button>
                  )}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">
                  {isAvailable
                    ? "Test is live. Turn off availability to see results."
                    : "View student scores and analytics"}
                </p>
              </TooltipContent>
            </Tooltip>

            {/* Open / Review Test Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  size="sm"
                  className="rounded-full px-5 gap-2 transition-all duration-200 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Link href={`/test/${id}`}>
                    <span>Review Test</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">Review test questions and settings</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}