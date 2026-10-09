import { NextResponse } from "next/server";

export async function POST() {
  try {
    const workerUrl = process.env.CLOUDFLARE_RAG_WORKER_URL;
    const workerSecret = process.env.CLOUDFLARE_RAG_WORKER_SECRET;

    if (!workerUrl || !workerSecret) {
      throw new Error("Cloudflare Worker environment variables are missing");
    }

    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-rag-secret": workerSecret,
      },
      body: JSON.stringify({
        filePath: "test/test-document.txt",
        fileName: "test-document.txt",
        teacherId: "test-teacher-123",
        uploadedAt: Date.now(),
      }),
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Worker test error:", error);

    return NextResponse.json(
      {
        error: "Failed to contact Cloudflare Worker",
      },
      { status: 500 },
    );
  }
}