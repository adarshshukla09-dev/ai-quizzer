"use client";

import { ChangeEvent, DragEvent, useEffect, useState } from "react";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";


export default function Home() {
  const [status, setStatus] = useState<{
    type: "idle" | "success" | "error";
    message: string;
  }>({
    type: "idle",
    message: "",
  });
  const router = useRouter();
  const [uploading, setUploading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const session = authClient.useSession();
  const user = session.data?.user;

  const { data: userData, isLoading: isUserLoading } =
    trpc.user.getUser.useQuery(
      {
        userId: user?.id ?? "",
      },
      {
        enabled: !!user?.id,
      },
    );
   useEffect(() => {
    if (isUserLoading || !userData) return;

    if (userData.role === "teacher" && !userData.hasGeminiApiKey) {
      toast.error("Gemini API key required", {
        description:
          "Teachers need to add a Gemini API key before uploading documents. Open your role settings and add your key.",
      });
      router.push("/role");
    } else if (userData.role === "student") {
      toast.error("You are a student", {
        description:
          "You are a student. You cannot upload documents. Change to teacher and add gemini api key.",
      });
      router.push("/role"); // Optional redirect if students shouldn't stay here
    }
  }, [userData, isUserLoading, router]);

  const processFile = async (file: File) => {
    // Teacher must have a Gemini API key
    if (
      userData?.role === "teacher" &&
      !userData.hasGeminiApiKey
    ) {
      toast.error("Gemini API key required", {
        description:
          "Teachers need to add a Gemini API key before uploading documents. Open your role settings and add your key.",
      });

      return;
    }

    setUploading(true);
    setStatus({
      type: "idle",
      message: "Uploading document...",
    });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data:any = await res.json();

      if (res.ok) {
        setUploadedFile(file.name);

        setStatus({
          type: "success",
          message: `Successfully uploaded ${file.name}`,
        });
      } else {
        setStatus({
          type: "error",
          message: data.error || "Failed to upload file.",
        });
      }
    } catch {
      setStatus({
        type: "error",
        message: "An unexpected error occurred during upload.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];

    if (file) {
      processFile(file);
    }
  };

  return (
    <main className="container mx-auto relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden p-6">
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -top-72
          left-1/2
          z-0
          h-175
          w-250
          -translate-x-1/2
          bg-[radial-gradient(ellipse_at_top,var(--primary),transparent_70%)]
          opacity-30
          blur-3xl
          sm:h-225
          sm:w-350
        "
      />

      <div className="relative z-10 flex w-full max-w-2xl flex-col gap-8">
        <div className="text-center">
          <h1 className="text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
            Document Assistant
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Upload PDF, DOCX, or PPTX files to analyze documents and generate
            intelligent quizzes instantly.
          </p>
        </div>

        <Card
          className={cn(
            `
              group relative cursor-pointer
              border-2 border-dashed
              transition-all duration-300
              hover:shadow-xl
            `,
            isDragging
              ? "scale-[1.02] border-primary bg-primary/10"
              : "border-muted-foreground/25 hover:border-primary/50",
            uploading && "pointer-events-none opacity-60",
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="flex min-h-90 flex-col items-center justify-center gap-6 p-12 text-center">
            <div className="rounded-full bg-primary/10 p-6 text-primary transition-transform duration-300 group-hover:scale-110">
              {uploading ? (
                <Loader2 className="size-12 animate-spin" />
              ) : (
                <Upload className="size-12" />
              )}
            </div>

            <div className="space-y-3">
              <p className="text-xl font-semibold text-foreground">
                {uploading
                  ? "Processing your document..."
                  : "Drag & drop your file here"}
              </p>

              <p className="text-base text-muted-foreground">
                or click below to browse from your device
              </p>

              <p className="text-sm text-muted-foreground">
                Supports PDF, DOCX, PPTX • Maximum size 10MB
              </p>
            </div>

            <input
              id="file-upload"
              type="file"
              accept=".pdf,.docx,.pptx"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />

            <Button
              size="lg"
              className="rounded-full px-8 text-base shadow-md"
              disabled={uploading || isUserLoading}
              onClick={() =>
                document.getElementById("file-upload")?.click()
              }
            >
              Select Document
            </Button>
          </CardContent>
        </Card>

        {status.message && (
          <Alert
            variant={status.type === "error" ? "destructive" : "default"}
            className="rounded-xl"
          >
            {status.type === "success" && (
              <CheckCircle2 className="size-5 text-primary" />
            )}

            {status.type === "error" && (
              <AlertCircle className="size-5" />
            )}

            <AlertDescription className="text-sm">
              {status.message}
            </AlertDescription>
          </Alert>
        )}

        {uploadedFile && (
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <FileText className="size-8 text-primary" />

              <div className="overflow-hidden">
                <CardTitle className="truncate text-base">
                  {uploadedFile}
                </CardTitle>

                <CardDescription className="text-sm">
                  Ready for AI queries
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        )}

        <p className="text-center text-sm text-muted-foreground">
          AI Quizzer v1.0
        </p>
      </div>
    </main>
  );
}