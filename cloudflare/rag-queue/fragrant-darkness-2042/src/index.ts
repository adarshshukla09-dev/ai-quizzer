interface RagJob {
  jobId: string;
  filePath: string;
  fileName: string;
  teacherId: string;
  uploadedAt: number;
}
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
  
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const secret = request.headers.get("x-internal-rag-secret");

    if (!secret || secret !== env.INTERNAL_RAG_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }

    let body: RagJob;

    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: "Invalid JSON" },
        { status: 400 },
      );
    }

    if (!body.filePath || !body.fileName || !body.teacherId) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    try {
      await env.RAG_QUEUE.send(body);

      return Response.json({
        success: true,
        message: "Job added to Cloudflare Queue",
      });
    } catch (error) {
      console.error("Queue send error:", error);

      return Response.json(
        { error: "Failed to enqueue job" },
        { status: 500 },
      );
    }
  },
 async queue(
    batch: MessageBatch,
    env: Env,
  ): Promise<void> {
    for (const message of batch.messages) {
      const job = message.body as RagJob;

      console.log(`Received RAG job: ${job.fileName}`);
      console.log("Job ID:", job.jobId);

      try {
        const response = await fetch(
          `${env.NEXT_APP_URL}/api/internal/rag/process`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-internal-rag-secret": env.INTERNAL_RAG_SECRET,
            },
            body: JSON.stringify(job),
          },
        );

        const responseText = await response.text();

        console.log(
          `RAG processor response: ${response.status}`,
          responseText,
        );

        if (response.ok) {
          console.log(`Job ${job.jobId} completed successfully`);

          message.ack();
        } else {
          console.error(
            `Job ${job.jobId} failed with status ${response.status}`,
          );

          message.retry();
        }
      } catch (error) {
        console.error(
          `Failed to call RAG processor for job ${job.jobId}:`,
          error,
        );

        message.retry();
      }
    }
  },
} satisfies ExportedHandler<Cloudflare.Env>;