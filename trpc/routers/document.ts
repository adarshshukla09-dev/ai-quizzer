import z from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { TRPCError } from "@trpc/server";
import { connectDB } from "@/db/mongdb/connection";

import { DocumentModel } from "@/db/mongdb/schema/documents.schema";
import { ChunkModel } from "@/db/mongdb/schema/Chunks.schema";

export const documentRouter = createTRPCRouter({
  getDocument: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        await connectDB();

        const document = await DocumentModel.findById(input.id);

        if (!document) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "This document could not be found.",
          });
        }

        return document;
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        if (error instanceof Error && error.name === "CastError") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "The provided document ID format is invalid.",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected database error occurred.",
          cause: error,
        });
      }
    }),
  updateDocument: baseProcedure
    .input(
      z.object({
        _id: z.string(),
        title: z.string(),
        teacherId: z.string(), // temporary adding teacherId replace for the context
      }),
    )
    .mutation(async ({ input }) => {
      try {
        await connectDB();
        const document = await DocumentModel.find({
          _id: input._id,
          teacherId: input.teacherId,
        });
        if (document.length == 0) {
          return "Document not found";
        }
        DocumentModel.updateOne(
          { _id: input._id, teacherId: input.teacherId },
          { $set: { title: input.title } },
        );
      } catch (error) {
        if (error instanceof Error) {
          return error.message;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected database error occurred.",
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
        processing: z
          .object({
            parser: z.enum(["structured", "unstructured"]).optional(),
            parserVersion: z.string().optional(),
            chunkerVersion: z.string().optional(),
            embeddingModel: z.string().optional(),
            embeddingDimension: z.number().optional(),
            errorMsg: z.string().optional(),
          })
          .optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        await connectDB();

        if (!input.teacherId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Teacher ID is missing.",
          });
        }
        const newDocument = await DocumentModel.create({
          teacherId: input.teacherId,
          title: input.title,
          content: input.content,
          pageCount: input.pageCount,
          filetype: input.filetype,
          processing: input.processing,
        });

        return newDocument;
      } catch (error) {
        if (error instanceof TRPCError) throw error.message;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create document.",
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
        if (!input.documentId || !input.teacherId) {
          return TRPCError;
        }
        // add ctx inplace of input.teacherId if you want to get teacherId from session
        const docs = await DocumentModel.find({
          teacherId: input.teacherId,
          _id: input.documentId,
        });
        if (docs.length == 0) {
          return "Document not found for the given teacherId and documentId.";
        }
        const deletedDocument = await DocumentModel.deleteOne({
          teacherId: input.teacherId,
          _id: input.documentId,
        });
        console.log(`Deleted documents count: ${deletedDocument}`);

        const deletedChunk = await ChunkModel.deleteMany({
          documentId: input.documentId,
          teacherId: input.teacherId,
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error.message;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create document.",
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
        // here also you can add ctx.teacherId if you want to get teacherId from session
        if (!input.ids || !input.teacherId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Document IDs or Teacher ID is missing.",
          });
        }

        const documents = await DocumentModel.find({
          teacherId: input.teacherId,
          _id: { $in: input.ids },
        });

        const deletedDocuments = await DocumentModel.deleteMany({
          teacherId: input.teacherId,
          _id: { $in: input.ids },
        });
        console.log(
          `Deleted documents count: ${deletedDocuments.deletedCount}`,
        );

        const deletedChunks = await ChunkModel.deleteMany({
          teacherId: input.teacherId,
          _id: { $in: input.ids },
        });
        console.log(`Deleted chunks count: ${deletedChunks.deletedCount}`);
      } catch (error) {
        if (error instanceof TRPCError) throw error.message;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete documents.",
          cause: error,
        });
      }
    }),
});
