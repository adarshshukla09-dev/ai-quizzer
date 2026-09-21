import { Queue } from "bullmq";
import { redis } from "@/lib/utils/redis";

export const ragQueue = new Queue("rag-ingestion", {
  connection: redis,
});
