import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

const MODEL = "gemini-embedding-2-preview";

// Keep comfortably below the 100 RPM free-tier limit.
const MAX_TEXTS_PER_MINUTE = 80;
const BATCH_SIZE = 20;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function embedBatch(texts: string[]): Promise<number[][]> {
  let attempt = 0;

  while (true) {
    try {
      const response = await ai.models.embedContent({
        model: MODEL,
        contents: texts.map((text) => ({
          parts: [{ text }],
        })),
      });

      const embeddings =
        response.embeddings?.map((embedding) => embedding.values ?? []) ?? [];

      if (embeddings.length !== texts.length) {
        throw new Error(
          `Expected ${texts.length} embeddings, got ${embeddings.length}`,
        );
      }

      for (const embedding of embeddings) {
        if (embedding.length === 0) {
          throw new Error("Google returned an empty embedding");
        }
      }

      return embeddings;
    } catch (error: any) {
      const message = error?.message ?? String(error);

      const isRateLimit =
        error?.status === 429 ||
        error?.code === 429 ||
        message.includes("429") ||
        message.includes("RESOURCE_EXHAUSTED");

      if (!isRateLimit || attempt >= 5) {
        throw error;
      }

      const delay = Math.min(60_000, 5_000 * 2 ** attempt);

      console.warn(`Gemini rate limited. Retrying in ${delay / 1000}s...`);

      await sleep(delay);
      attempt++;
    }
  }
}

export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);

    console.log(
      `Embedding batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(
        texts.length / BATCH_SIZE,
      )} (${batch.length} chunks)`,
    );

    const embeddings = await embedBatch(batch);

    allEmbeddings.push(...embeddings);

    /*
     * Your free-tier quota is 100 requests/minute.
     *
     * Because a batch can still consume quota per text,
     * pace batches instead of firing them all at once.
     */
    if (i + BATCH_SIZE < texts.length) {
      await sleep(15_000);
    }
  }

  return allEmbeddings;
}
