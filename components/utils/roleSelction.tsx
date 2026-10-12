"use client";

import { useState, FormEvent } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type Role = "teacher" | "student";

interface ChooseRoleDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSubmitRole?: (
    role: Role,
    geminiApiKey?: string
  ) => Promise<void>;
}

export default function ChooseRoleDialog({
  isOpen = true,
  onClose,
  onSubmitRole,
}: ChooseRoleDialogProps) {
  const [role, setRole] = useState<Role | "">("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleChange = (value: string) => {
    const newRole = value as Role;

    setRole(newRole);

    // Clear the API key if the user switches back to student
    if (newRole === "student") {
      setGeminiApiKey("");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!role) return;

    // Teacher must provide a Gemini API key
    if (role === "teacher" && !geminiApiKey.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);

      await onSubmitRole?.(
        role,
        role === "teacher" ? geminiApiKey.trim() : undefined
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const roles: { label: string; value: Role }[] = [
    {
      label: "Teacher",
      value: "teacher",
    },
    {
      label: "Student",
      value: "student",
    },
  ];

  const isTeacher = role === "teacher";
  const isValid = role && (!isTeacher || geminiApiKey.trim());

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose?.();
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Choose Role
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-2">
          <Field>
            <FieldLabel>Select your role</FieldLabel>

            <RadioGroup
              value={role}
              onValueChange={handleRoleChange}
              className="space-y-3 pt-2"
            >
              {roles.map((item) => {
                const selected = role === item.value;

                return (
                  <Label
                    key={item.value}
                    htmlFor={`role-${item.value}`}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3.5 transition-colors ${
                      selected
                        ? "border-primary bg-primary/10"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <RadioGroupItem
                      id={`role-${item.value}`}
                      value={item.value}
                    />

                    <span className="text-sm font-medium">
                      {item.label}
                    </span>
                  </Label>
                );
              })}
            </RadioGroup>

            <FieldDescription className="mt-2">
              Choose the profile type that best describes your account.
            </FieldDescription>
          </Field>

          {isTeacher && (
            <Field>
              <FieldLabel htmlFor="gemini-api-key">
                Gemini API Key
              </FieldLabel>

              <Input
                id="gemini-api-key"
                type="password"
                placeholder="Enter your Gemini API key"
                value={geminiApiKey}
                onChange={(event) => setGeminiApiKey(event.target.value)}
                autoComplete="off"
              />

              <FieldDescription>
                Your Gemini API key will be securely stored and used for
                teacher features.
              </FieldDescription>
            </Field>
          )}

          <div className="flex gap-3">
            {onClose && (
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-1/2"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}

            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className={onClose ? "w-1/2" : "w-full"}
            >
              {isSubmitting ? "Saving..." : "Submit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}