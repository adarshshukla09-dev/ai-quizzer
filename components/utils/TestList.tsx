"use client";

import React, { useState, lazy, Suspense } from "react";
import { trpc } from "@/trpc/client";
import TestCard, { TestCardData } from "@/components/utils/TestCard";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";

// Lazy load the dialog components
const EditTestDialog = lazy(() =>
  import("@/components/dialogs/EditDialog").then((mod) => ({
    default: mod.EditTestDialog,
  })),
);

const DeleteTestDialog = lazy(() =>
  import("@/components/dialogs/DeleteTestDialog").then((mod) => ({
    default: mod.DeleteTestDialog,
  })),
);

export default function TestList() {
  const session = authClient.useSession();
  const user = session.data?.user;
  const utils = trpc.useUtils();

  const [selectedTest, setSelectedTest] = useState<TestCardData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {
    data: tests,
    isLoading,
    isError,
    error,
  } = trpc.test.getTest.useQuery(
    { teacherId: user?.id ?? "" },
    { enabled: !!user?.id },
  );

  const updateMutation = trpc.test.updateTest.useMutation({
    onSuccess: () => {
      utils.test.getTest.invalidate();
      setIsEditDialogOpen(false);
      setSelectedTest(null);
    },
  });

  const deleteMutation = trpc.test.DeleteTest.useMutation({
    onSuccess: () => {
      utils.test.getTest.invalidate();
      setIsDeleteDialogOpen(false);
      setSelectedTest(null);
    },
  });

  const handleOpenEdit = (test: TestCardData) => {
    setSelectedTest(test);
    setIsEditDialogOpen(true);
  };

  const handleOpenDelete = (test: TestCardData) => {
    setSelectedTest(test);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmEdit = (data: {
    title: string;
    description: string;
    duration: number;
  }) => {
    if (!selectedTest || !user?.id) return;
    const testId = String(selectedTest._id || selectedTest.id);

    updateMutation.mutate({
      testId,
      teacherId: user.id,
      title: data.title,
      description: data.description,
      duration: data.duration,
    });
  };

  const handleConfirmDelete = () => {
    if (!selectedTest || !user?.id) return;
    const testId = String(selectedTest._id || selectedTest.id);

    deleteMutation.mutate({
      testId,
      teacherId: user.id,
    });
  };

  if (session.isPending || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user?.id) {
    return (
      <div className="text-muted-foreground">
        Please log in to view your tests.
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500">Error loading tests: {error.message}</div>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {tests?.map((test: any) => (
          <TestCard
            key={test._id || test.id}
            test={test}
            onEdit={() => handleOpenEdit(test)}
            onDelete={() => handleOpenDelete(test)}
          />
        ))}
      </div>

      <Suspense fallback={null}>
        {isEditDialogOpen && (
          <EditTestDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            test={selectedTest}
            onConfirm={handleConfirmEdit}
            isPending={updateMutation.isPending}
          />
        )}

        {isDeleteDialogOpen && (
          <DeleteTestDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            test={selectedTest}
            onConfirm={handleConfirmDelete}
            isPending={deleteMutation.isPending}
          />
        )}
      </Suspense>
    </>
  );
}
