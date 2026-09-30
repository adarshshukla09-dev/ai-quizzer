import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

const MODEL = "gemini-embedding-2-preview";

const MAX_TEXTS_PER_MINUTE = 80;
const BATCH_SIZE = 20;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function embedBatch(
  texts: string[],
  taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY",
): Promise<number[][]> {
  let attempt = 0;

  while (true) {
    try {
      const response = await ai.models.embedContent({
        model: MODEL,

        contents: texts.map((text) => ({
          parts: [{ text }],
        })),

        config: {
          taskType,
        },
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

export async function getDocumentEmbeddings(
  texts: string[],
): Promise<number[][]> {
  return embedBatch(texts, "RETRIEVAL_DOCUMENT");
}

export async function getQueryEmbedding(text: string): Promise<number[]> {
  const [embedding] = await embedBatch([text], "RETRIEVAL_QUERY");
  console.log("Query embedding dimension:", embedding.length);

  return embedding;
}
