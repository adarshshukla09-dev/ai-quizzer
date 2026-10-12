
import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-embedding-2-preview";

const BATCH_SIZE = 20;
const CONCURRENCY = 3;
const MAX_RETRIES = 5;
const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

function createGeminiClient(apiKey: string): GoogleGenAI {
  if (!apiKey?.trim()) {
    throw new Error("Gemini API key is required");
  }

  return new GoogleGenAI({
    apiKey: apiKey.trim(),
  });
}

async function embedBatch(
  apiKey: string,
  texts: string[],
  taskType:
    | "RETRIEVAL_DOCUMENT"
    | "RETRIEVAL_QUERY",
): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  const ai = createGeminiClient(apiKey);

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
        response.embeddings?.map(
          (embedding) => embedding.values ?? [],
        ) ?? [];

      if (embeddings.length !== texts.length) {
        throw new Error(
          `Expected ${texts.length} embeddings, ` +
            `got ${embeddings.length}`,
        );
      }

      for (const embedding of embeddings) {
        if (embedding.length === 0) {
          throw new Error(
            "Google returned an empty embedding",
          );
        }
      }

      return embeddings;
    } catch (error: unknown) {
      const err = error as {
        status?: number;
        code?: number;
        message?: string;
      };

      const message =
        err.message ?? String(error);

      const isRateLimit =
        err.status === 429 ||
        err.code === 429 ||
        message.includes("429") ||
        message.includes("RESOURCE_EXHAUSTED");

      if (!isRateLimit || attempt >= MAX_RETRIES) {
        throw error;
      }

      const delay = Math.min(
        60_000,
        5_000 * 2 ** attempt,
      );

      console.warn(
        `Gemini rate limited. ` +
          `Retrying in ${delay / 1000}s...`,
      );

      await sleep(delay);

      attempt++;
    }
  }
}

/**
 * Generate embeddings for document chunks.
 *
 * IMPORTANT:
 * apiKey must be the user's decrypted Gemini API key.
 *
 * This function must only be called server-side.
 */
export async function getDocumentEmbeddings(
  apiKey: string,
  texts: string[],
): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  const allEmbeddings: number[][] = [];

  const totalBatches = Math.ceil(
    texts.length / BATCH_SIZE,
  );

  const batches: string[][] = Array.from(
    { length: totalBatches },
    (_, i) =>
      texts.slice(
        i * BATCH_SIZE,
        (i + 1) * BATCH_SIZE,
      ),
  );

  for (
    let i = 0;
    i < batches.length;
    i += CONCURRENCY
  ) {
    const currentBatches = batches.slice(
      i,
      i + CONCURRENCY,
    );

    const results = await Promise.all(
      currentBatches.map((batch, index) => {
        const batchNumber = i + index + 1;

        console.log(
          `Embedding batch ${batchNumber}/${totalBatches} ` +
            `(${batch.length} chunks)`,
        );

        return embedBatch(
          apiKey,
          batch,
          "RETRIEVAL_DOCUMENT",
        );
      }),
    );

    allEmbeddings.push(...results.flat());
  }

  return allEmbeddings;
}

/**
 * Generate an embedding for a search query.
 *
 * IMPORTANT:
 * apiKey must be the user's decrypted Gemini API key.
 *
 * This function must only be called server-side.
 */
export async function getQueryEmbedding(
  apiKey: string,
  text: string,
): Promise<number[]> {
  if (!text.trim()) {
    throw new Error(
      "Query text cannot be empty",
    );
  }

  const [embedding] = await embedBatch(
    apiKey,
    [text],
    "RETRIEVAL_QUERY",
  );

  if (!embedding?.length) {
    throw new Error(
      "Google returned an empty query embedding",
    );
  }

  console.log(
    "Query embedding dimension:",
    embedding.length,
  );

  return embedding;
}