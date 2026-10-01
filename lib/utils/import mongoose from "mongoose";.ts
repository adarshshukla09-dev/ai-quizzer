import mongoose from "mongoose";
import { ChunkModel } from "@/db/mongdb/schema/Chunks.schema";

type RawChunk = {
  _id?: any;
  content: string;
  metadata?: { heading?: string[] };
  documentId: any;
  chunkIndex: number;
  score?: number;
};

type SelectChunksOptions = {
  totalQuestions: number;
  // Tuning knobs, all optional so callers can override per-request if needed.
  absoluteScoreFloor?: number; // hard floor below which a vector match is never trusted
  relativeScoreBand?: number; // how far below the top match we still accept
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
 * Picks the smallest, highest-signal set of chunks to feed the question
 * generator: relevant to the topic, non-redundant with each other, and
 * within a character budget the model can actually use well.
 *
 * Replaces a flat ">= 0.75" cutoff, which either lets weak matches through
 * (when the corpus happens to score high) or throws away everything
 * (when the corpus tops out at, say, 0.68) with no middle ground.
 */
export function selectBestChunks(
  rawChunks: RawChunk[],
  options: SelectChunksOptions,
) {
  const {
    totalQuestions,
    absoluteScoreFloor = 0.55,
    relativeScoreBand = 0.12,
    minChunks = 3,
    maxContextChars = 12000,
    similarityDedupeThreshold = 0.8,
  } = options;

  // 1. Sort by relevance, best first.
  const sorted = [...rawChunks]
    .filter((c) => typeof c.score === "number")
    .sort((a, b) => (b.score as number) - (a.score as number));

  if (sorted.length === 0) return [];

  const topScore = sorted[0].score as number;

  // 2. Adaptive threshold: never trust matches far below the best match
  // for this query, and never trust matches below an absolute floor
  // either, even if they're the "best available" in a weak corpus.
  const dynamicFloor = Math.max(
    absoluteScoreFloor,
    topScore - relativeScoreBand,
  );
  const candidates = sorted.filter((c) => (c.score as number) >= dynamicFloor);

  // 3. How many chunks do we actually need? Scale with question volume
  // (more questions need more source material) but stay within sane bounds.
  const chunkBudget = Math.min(
    Math.max(minChunks, Math.ceil(totalQuestions * 1.5)),
    20,
  );

  // 4. Deduplicate by heading/chunkIndex first (cheap, exact key) — same
  // idea as the original code, just done before the more expensive pass.
  const seenKeys = new Set<string>();
  const keyDeduped = candidates.filter((c) => {
    const key =
      c.metadata?.heading?.join("-") || `${c.documentId}-${c.chunkIndex}`;
    if (seenKeys.has(key)) return false;
    seenKeys.add(key);
    return true;
  });

  // 5. Greedy diversity pass: walk best-to-worst, skip any chunk whose
  // content is basically a near-duplicate of one already picked. This is
  // what the original dedupe missed — two chunks can have different
  // headings/indices but say almost the same thing, which wastes budget
  // and makes the LLM generate near-duplicate questions.
  const selected: RawChunk[] = [];
  const selectedTokenSets: Set<string>[] = [];

  for (const chunk of keyDeduped) {
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

  // 6. Enforce a character budget so the prompt stays focused on the best
  // material instead of ballooning with lower-ranked chunks; always keep
  // at least `minChunks` even if that slightly overshoots the budget.
  const trimmed: RawChunk[] = [];
  let charCount = 0;
  for (const chunk of selected) {
    if (
      charCount + chunk.content.length > maxContextChars &&
      trimmed.length >= minChunks
    ) {
      break;
    }
    trimmed.push(chunk);
    charCount += chunk.content.length;
  }

  return trimmed;
}

/**
 * Fallback used only when vector search returns nothing usable (e.g. index
 * not ready, or the topic genuinely isn't in the corpus). Instead of
 * grabbing an arbitrary handful of chunks from the documents, pull a wider
 * pool and rank it locally by keyword overlap with the topic, so the
 * fallback is still topic-relevant rather than effectively random.
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
