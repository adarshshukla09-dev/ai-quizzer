import z from "zod";
import { TRPCError } from "@trpc/server";
import mongoose from "mongoose";
import { baseProcedure, createTRPCRouter } from "../init";

import { connectDB } from "@/db/mongdb/connection";
import { DocumentModel } from "@/db/mongdb/schema/documents.schema";
import { ChunkModel } from "@/db/mongdb/schema/Chunks.schema";
import { tryCatch } from "@/lib/utils/trycatch";

export const documentRouter = createTRPCRouter({
  getDocument: baseProcedure
    .input(
      z.object({
        teacherId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      return tryCatch(async () => {
        await connectDB();

        const documents = await DocumentModel.find({
          teacherId: input.teacherId,
        });

        return documents;
      });
    }),
  updateDocument: baseProcedure
    .input(
      z.object({
        _id: z.string(),

        title: z.string(),

        teacherId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        await connectDB();

        const document = await DocumentModel.findOne({
          _id: input._id,

          teacherId: input.teacherId,
        });

        if (!document) {
          throw new TRPCError({
            code: "NOT_FOUND",

            message: "Document not found",
          });
        }

        const updated = await DocumentModel.updateOne(
          {
            _id: input._id,
            teacherId: input.teacherId,
          },

          {
            $set: {
              title: input.title,
            },
          },
        );

        return {
          success: true,

          updatedCount: updated.modifiedCount,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",

          message: "Failed to update document",

          cause: error,
        });
      }
    }),

  addDocument: baseProcedure
    .input(
      z.object({
        teacherId: z.string(),

        title: z.string(),

        content: z.string().optional(),

        pageCount: z.number().optional(),

        filetype: z.enum([
          "pdf",
          "docx",
          "ppt",
          "odt",
          "txt",
          "html",
          "md",
          "csv",
        ]),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        await connectDB();

        const document = await DocumentModel.create(input);

        return document;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",

          message: "Failed to create document",

          cause: error,
        });
      }
    }),

  deleteDocument: baseProcedure
    .input(
      z.object({
        documentId: z.string(),

        teacherId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        await connectDB();

        const document = await DocumentModel.findOne({
          _id: input.documentId,

          teacherId: input.teacherId,
        });

        if (!document) {
          throw new TRPCError({
            code: "NOT_FOUND",

            message: "Document not found",
          });
        }

        const deletedDocument = await DocumentModel.deleteOne({
          _id: input.documentId,

          teacherId: input.teacherId,
        });

        const deletedChunks = await ChunkModel.deleteMany({
          documentId: input.documentId,

          teacherId: input.teacherId,
        });

        return {
          success: true,

          deletedDocuments: deletedDocument.deletedCount,

          deletedChunks: deletedChunks.deletedCount,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",

          message: "Failed to delete document",

          cause: error,
        });
      }
    }),

  deleteMultipleDocuments: baseProcedure
    .input(
      z.object({
        ids: z.array(z.string()),

        teacherId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        await connectDB();

        const deletedDocuments = await DocumentModel.deleteMany({
          teacherId: input.teacherId,

          _id: {
            $in: input.ids,
          },
        });

        const deletedChunks = await ChunkModel.deleteMany({
          teacherId: input.teacherId,

          documentId: {
            $in: input.ids,
          },
        });

        return {
          success: true,

          deletedDocuments: deletedDocuments.deletedCount,

          deletedChunks: deletedChunks.deletedCount,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",

          message: "Failed to delete documents",

          cause: error,
        });
      }
    }),
});
