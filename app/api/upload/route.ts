import { NextRequest, NextResponse } from "next/server";
import { Queue } from "bullmq";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { auth } from "@/lib/auth";

const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_EXTENSIONS = [
  "pdf",
  "docx",
  "pptx",
  "xlsx",
  "odt",
  "txt",
  "md",
  "csv",
];

const uploadQueue = new Queue("rag-ingestion", {
  connection,
});

export async function POST(req: NextRequest) {
  try {
    // Better Auth Server Session Retrieval
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized: Missing active session" },
        { status: 401 },
      );
    }

    const teacherId = session.user.id;

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";

    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return NextResponse.json(
        {
          error: `Unsupported file type: .${fileExtension}. Supported formats: ${ALLOWED_EXTENSIONS.join(
            ", ",
          )}`,
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds limit (Max 10MB)" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filePath = `documents/${crypto.randomUUID()}/${file.name}`;

    const { data, error } = await supabaseAdmin.storage
      .from("rag-documents")
      .upload(filePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return NextResponse.json(
        { error: "Failed to upload file to storage" },
        { status: 500 },
      );
    }

    const job = await uploadQueue.add(
      "process-rag",
      {
        filePath: data.path,
        fileName: file.name,
        teacherId, // Guaranteed to exist now
        uploadedAt: Date.now(),
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    );

    console.log(`Job ${job.id} added to queue for file: ${file.name}`);

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      jobId: job.id,
      fileName: file.name,
    });
  } catch (error) {
    console.error("Upload route error:", error);
    return NextResponse.json(
      { error: "Failed to process upload request" },
      { status: 500 },
    );
  }
}
