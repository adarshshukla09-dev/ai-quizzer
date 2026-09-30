import mongoose from "mongoose";
import { tryCatch } from "./trycatch";
import { ChunkModel, IChunk } from "../../db/mongdb/schema/Chunks.schema";

export type SearchChunkResult = Omit<IChunk, "embedding"> & {
  _id: mongoose.Types.ObjectId;
};

export async function searchSimilarChunks<T = SearchChunkResult>(
  embedding: number[],
  teacherId: string,
  documentIds: string[],
  {
    numCandidates = 150,
    limit = 40,
  }: {
    numCandidates?: number;
    limit?: number;
  } = {},
): Promise<T[]> {
  return ChunkModel.aggregate([
    {
      $vectorSearch: {
        index: "chunk_embedding_index",
        path: "embedding",
        queryVector: embedding,
        numCandidates,
        limit,
        filter: {
          teacherId,
          documentId: {
            $in: documentIds.map((id) => new mongoose.Types.ObjectId(id)),
          },
        },
      },
    },
    {
      $project: {
        embedding: 0, // Omit large vector payload
      },
    },
  ]) as Promise<T[]>;
}

export async function searchKeywordChunks(
  topic: string,
  teacherId: string,
  documentIds: string[],
) {
  return tryCatch(async () => {
    if (!teacherId || !documentIds?.length) {
      return [];
    }

    return ChunkModel.find({
      $text: {
        $search: topic,
      },
      teacherId,
      documentId: {
        $in: documentIds.map((id) => new mongoose.Types.ObjectId(id)),
      },
    })
      .select("-embedding") // Omit vector payload
      .limit(20)
      .lean();
  });
}

export interface RRFResult<T> {
  chunk: T;
  score: number;
  sources: ("dense" | "keyword")[];
  denseRank?: number;
  keywordRank?: number;
}

export function rrf<T extends { _id: any }>(
  denseResults: T[],
  keywordResults: T[],
  k = 60,
): RRFResult<T>[] {
  const merged = new Map<string, RRFResult<T>>();

  denseResults.forEach((chunk, index) => {
    const id = chunk._id.toString();
    const rrfScore = 1 / (k + index + 1);

    merged.set(id, {
      chunk,
      score: rrfScore,
      sources: ["dense"],
      denseRank: index + 1,
    });
  });

  keywordResults.forEach((chunk, index) => {
    const id = chunk._id.toString();
    const rrfScore = 1 / (k + index + 1);

    const existing = merged.get(id);

    if (existing) {
      existing.score += rrfScore;
      existing.sources.push("keyword");
      existing.keywordRank = index + 1;
    } else {
      merged.set(id, {
        chunk,
        score: rrfScore,
        sources: ["keyword"],
        keywordRank: index + 1,
      });
    }
  });

  return [...merged.values()].sort((a, b) => b.score - a.score);
}
