import { NextRequest, NextResponse } from "next/server";

import {
  processDocument,
  type RagJob,
} from "@/lib/rag/process-document";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate request using shared internal secret
    const secret = request.headers.get("x-internal-rag-secret");
    const expectedSecret = process.env.CLOUDFLARE_RAG_WORKER_SECRET;

    if (
      !expectedSecret ||
      !secret ||
      secret !== expectedSecret
    ) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Parse request JSON body
    let job: RagJob;

    try {
      job = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400 }
      );
    }

    // 3. Strict payload validation
    if (
      !job.jobId ||
      typeof job.jobId !== "string" ||
      !job.filePath ||
      typeof job.filePath !== "string" ||
      !job.fileName ||
      typeof job.fileName !== "string" ||
      !job.teacherId ||
      typeof job.teacherId !== "string"
    ) {
      return NextResponse.json(
        { error: "Missing or invalid required job fields" },
        { status: 400 }
      );
    }

    // 4. Process document
    console.log(`[RAG Job ${job.jobId}] Starting processing for: ${job.fileName}`);

    const result = await processDocument(job);

    console.log(`[RAG Job ${job.jobId}] Completed processing for: ${job.fileName}`);

    return NextResponse.json({
      success: true,
      jobId: job.jobId,
      result,
    });
  } catch (error) {
    console.error("RAG processing error:", error);

    /*
     * Returning a 500 status code triggers retry/dead-lettering logic
     * in the Cloudflare Queue consumer when a failure occurs.
     */
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "RAG processing failed",
      },
      { status: 500 }
    );
  }
}