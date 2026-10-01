import z from "zod";
import { TRPCError } from "@trpc/server";
import mongoose from "mongoose";
import { baseProcedure, createTRPCRouter } from "../init";

import { connectDB } from "@/db/mongdb/connection";
import { ChunkModel } from "@/db/mongdb/schema/Chunks.schema";
import { tryCatch } from "@/lib/utils/trycatch";

export const chunksRouter = createTRPCRouter({
  getChunk: baseProcedure
    .input(
      z.object({
        documentId: z.string(),
        teacherId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      tryCatch(async () => {
        await connectDB();

        const chunks = await ChunkModel.find({
          teacherId: input.teacherId,
          documentId: input.documentId,
        });
        if (!chunks) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "This chunk could not be found.",
          });
        }
        console.log(chunks);
        return chunks.map((chunk) => chunk.embedding);
      });
    }),
});
