"use client";

import { useState, FormEvent, useEffect } from "react";

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
import { useAuthStore } from "@/store/userStore";
import { useRouter } from "next/navigation";

type Role = "teacher" | "student";

interface ChooseRoleDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSubmitRole?: (role: Role) => Promise<void>;
}

export default function ChooseRoleDialog({
  isOpen = true,
  onClose,
  onSubmitRole,
}: ChooseRoleDialogProps) {
  const [role, setRole] = useState<Role | "">("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!role) return;

    await onSubmitRole?.(role);
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
              onValueChange={(value) => setRole(value as Role)}
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

                    <span className="text-sm font-medium">{item.label}</span>
                  </Label>
                );
              })}
            </RadioGroup>

            <FieldDescription className="mt-2">
              Choose the profile type that best describes your account.
            </FieldDescription>
          </Field>

          <div className="flex gap-3">
            {onClose && (
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-1/2"
              >
                Cancel
              </Button>
            )}

            <Button
              type="submit"
              disabled={!role}
              className={onClose ? "w-1/2" : "w-full"}
            >
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
