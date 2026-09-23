import React from "react";
import Link from "next/link";
import { ArrowRight, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface TestItem {
  id: number;
  name: string;
  active: boolean;
  createdAt: string;
}

interface TestCardProps {
  test: TestItem;
}

export default function TestCard({ test }: TestCardProps) {
  return (
    <div className="group w-full max-w-4xl rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:border-primary/50 hover:shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
      {/* Test details */}
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-card-foreground">
            {test.name}
          </h2>

          {/* Status Badge */}
          <Badge
            variant={test.active ? "default" : "secondary"}
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${
              test.active
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-muted text-muted-foreground border border-border"
            }`}
          >
            {test.active ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Active</span>
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Inactive</span>
              </>
            )}
          </Badge>
        </div>

        {/* Creation Date */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Created on {test.createdAt}</span>
        </div>
      </div>

      {/* Action CTA */}
      <div className="w-full sm:w-auto flex justify-end">
        <Button
          asChild
          size="icon"
          className="h-12 w-12 rounded-full border border-border bg-background text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 shadow-sm group-hover:translate-x-1"
        >
          <Link href={`/test/${test.id}`} aria-label={`Open ${test.name}`}>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
