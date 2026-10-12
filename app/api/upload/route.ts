import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { auth } from "@/lib/auth";

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

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized: Missing active session" },
        { status: 401 }
      );
    }

    const teacherId = session.user.id;

    // 2. Read uploaded file
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // 3. Validate extension
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";

    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return NextResponse.json(
        {
          error: `Unsupported file type: .${fileExtension}. Supported formats: ${ALLOWED_EXTENSIONS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // 4. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds limit (Max 10MB)" },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: "File cannot be empty" },
        { status: 400 }
      );
    }

    // 5. Check Cloudflare Worker environment variables early
    const workerUrl = process.env.CLOUDFLARE_RAG_WORKER_URL;
    const workerSecret = process.env.CLOUDFLARE_RAG_WORKER_SECRET;

    if (!workerUrl || !workerSecret) {
      console.error("Cloudflare Worker environment variables are missing");

      return NextResponse.json(
        { error: "Queue configuration is missing" },
        { status: 500 }
      );
    }

    // 6. Upload file to Supabase Storage using single jobId
    const jobId = crypto.randomUUID();
    const filePath = `documents/${jobId}/${file.name}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { data, error } = await supabaseAdmin.storage
      .from("rag-documents")
      .upload(filePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (error || !data?.path) {
      console.error("Supabase upload error:", error);

      return NextResponse.json(
        { error: "Failed to upload file to storage" },
        { status: 500 }
      );
    }

    // 7. Dispatch job payload to Cloudflare Worker queue
    const workerResponse = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-rag-secret": workerSecret,
      },
      body: JSON.stringify({
        jobId,
        filePath: data.path,
        fileName: file.name,
        teacherId,
        uploadedAt: Date.now(),
      }),
    });

    if (!workerResponse.ok) {
      let workerData: unknown = null;
      try {
        workerData = await workerResponse.json();
      } catch {
        // Fallback for non-JSON errors
      }

      console.error("Cloudflare Worker error:", workerData);

      // Clean up orphaned file on queue dispatch failure
      await supabaseAdmin.storage
        .from("rag-documents")
        .remove([data.path])
        .catch((cleanupError) => {
          console.error("Failed to clean up uploaded file:", cleanupError);
        });

      return NextResponse.json(
        { error: "Failed to add document to processing queue" },
        { status: 500 }
      );
    }

    console.log(`Job ${jobId} added to Cloudflare Queue for file: ${file.name}`);

    // 8. Return response
    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      jobId,
      fileName: file.name,
    });
  } catch (error) {
    console.error("Upload route error:", error);

    return NextResponse.json(
      { error: "Failed to process upload request" },
      { status: 500 }
    );
  }
}