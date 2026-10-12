"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { TestCardData } from "@/components/Test/TestCard";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldScrubArea,
} from "@/components/reui/number-field";

interface EditTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  test: TestCardData | null;
  onConfirm: (data: {
    title: string;
    description: string;
    duration: number;
  }) => void;
  isPending: boolean;
}

export function EditTestDialog({
  open,
  onOpenChange,
  test,
  onConfirm,
  isPending,
}: EditTestDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState<number>(30);

  useEffect(() => {
    if (test) {
      setTitle(test.title || "");
      setDescription(test.description || "");
      setDuration(Number(test.duration) || 1);
    }
  }, [test]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({ title, description, duration });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Tailwind Fix: sm:max-w-125 replacing sm:max-w-[500px] */}
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Edit Test Details</DialogTitle>
          <DialogDescription>
            Make changes to the title, description, or duration of your test.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="title">Test Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter test title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter test description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (Minutes)</Label>
            <NumberField
              value={duration}
              min={10}
              step={10}
              onValueChange={(val) => setDuration(val ?? 10)}
              size="sm"
            >
              <NumberFieldScrubArea label="Duration" />
              <NumberFieldGroup>
                <NumberFieldDecrement />
                <NumberFieldInput id="duration" />
                <NumberFieldIncrement />
              </NumberFieldGroup>
            </NumberField>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
