import mongoose from "mongoose";
import { ChunkModel } from "@/db/mongdb/schema/Chunks.schema";

export type RawChunk = {
  _id?: any;
  content: string;
  metadata?: { heading?: string[] };
  documentId: any;
  chunkIndex: number;
};

type SelectChunksOptions = {
  totalQuestions: number;
  minChunks?: number;
  maxContextChars?: number;
  similarityDedupeThreshold?: number;
};

const STOPWORDS = new Set([
  "the",
  "a",
  "an",
  "of",
  "in",
  "on",
  "for",
  "to",
  "and",
  "or",
  "is",
  "are",
  "was",
  "were",
  "with",
  "by",
  "at",
  "as",
  "be",
  "this",
  "that",
  "it",
  "its",
  "from",
  "into",
  "about",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const w of a) if (b.has(w)) intersection++;
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Post-processes rank-ordered chunks (e.g. from RRF fusion).
 * Focuses strictly on deduplication, content diversity (Jaccard MMR),
 * and context character budgeting.
 */
export function selectBestChunks(
  rankedChunks: RawChunk[],
  options: SelectChunksOptions,
): RawChunk[] {
  const {
    totalQuestions,
    minChunks = 3,
    maxContextChars = 12000,
    similarityDedupeThreshold = 0.8,
  } = options;

  if (!rankedChunks || rankedChunks.length === 0) return [];

  // 1. Calculate target chunk budget based on question count
  const chunkBudget = Math.min(
    Math.max(minChunks, Math.ceil(totalQuestions * 1.5)),
    20,
  );

  // 2. Structural Deduplication (heading / document + index)
  const seenKeys = new Set<string>();
  const uniqueChunks = rankedChunks.filter((chunk) => {
    const key =
      chunk.metadata?.heading?.join("-") ||
      `${chunk.documentId}-${chunk.chunkIndex}`;
    if (seenKeys.has(key)) return false;
    seenKeys.add(key);
    return true;
  });

  // 3. Greedy Diversity Pass (skip semantic near-duplicates)
  const selected: RawChunk[] = [];
  const selectedTokenSets: Set<string>[] = [];

  for (const chunk of uniqueChunks) {
    if (selected.length >= chunkBudget) break;

    const tokens = new Set(tokenize(chunk.content));
    const isDuplicate = selectedTokenSets.some(
      (existing) => jaccard(existing, tokens) >= similarityDedupeThreshold,
    );

    if (!isDuplicate) {
      selected.push(chunk);
      selectedTokenSets.push(tokens);
    }
  }

  // 4. Character Budgeting (trim to fit LLM window while keeping minChunks)
  const finalChunks: RawChunk[] = [];
  let charCount = 0;

  for (const chunk of selected) {
    if (
      charCount + chunk.content.length > maxContextChars &&
      finalChunks.length >= minChunks
    ) {
      break;
    }
    finalChunks.push(chunk);
    charCount += chunk.content.length;
  }

  return finalChunks;
}

/**
 * Topic keyword fallback used when hybrid retrieval / RRF produces no usable candidates.
 */
export async function keywordFallbackChunks(
  topic: string,
  teacherId: string,
  documentIds: string[],
  take = 5,
) {
  const pool = await ChunkModel.find({
    teacherId,
    documentId: {
      $in: documentIds.map((id) => new mongoose.Types.ObjectId(id)),
    },
  })
    .limit(150)
    .lean();

  const topicTokens = new Set(tokenize(topic));

  const scored = pool.map((chunk: any) => {
    const chunkTokens = tokenize(chunk.content ?? "");
    let overlap = 0;
    for (const t of chunkTokens) if (topicTokens.has(t)) overlap++;
    return { chunk, overlap };
  });

  scored.sort((a, b) => b.overlap - a.overlap);

  return scored.slice(0, take).map((s) => s.chunk);
}
