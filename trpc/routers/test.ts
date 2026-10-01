import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import Question from "@/db/mongdb/schema/questions.schema";
import Test from "@/db/mongdb/schema/Test.schema";
import { TRPCError } from "@trpc/server";
import { connectDB } from "@/db/mongdb/connection";
import { tryCatch } from "@/lib/utils/trycatch";
import { NextResponse } from "next/server";

export const TestRouter = createTRPCRouter({
  createTest: baseProcedure
    .input(
      z.object({
        teacherId: z.string().min(1, "Teacher ID is required"),
        documentIds: z.array(z.string()).min(1, "Select at least one document"),
        title: z.string().min(1, "Test title is required"),
        description: z.string().optional(),
        questionCount: z.object({
          mcq: z.number().min(0).default(0),
          msq: z.number().min(0).default(0),
          nat: z.number().min(0).default(0),
          trueFalse: z.number().min(0).default(0),
        }),
        totalMarks: z.number().min(1, "Total marks must be greater than 0"),
        duration: z.number().min(1, "Duration must be at least 1 minute"),
      }),
    )
    .mutation(async ({ input }) => {
      return tryCatch(async () => {
        await connectDB();

        console.log(
          "Creating Test with Input:",
          JSON.stringify(input, null, 2),
        );

        // Create the initial Test document in GENERATING state with empty questionIds
        const test = await Test.create({
          teacherId: input.teacherId,
          documentIds: input.documentIds,
          title: input.title,
          description: input.description,

          questionIds: [],
          questionCount: input.questionCount,
          totalMarks: input.totalMarks,
          duration: input.duration,
          status: "GENERATING",
        });

        // Use toObject() so _id is properly formatted for frontend serialization
        return test.toObject();
      });
    }),

  updateTest: baseProcedure
    .input(
      z.object({
        testId: z.string(),
        teacherId: z.string(),
        title: z.string(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      return tryCatch(async () => {
        await connectDB();

        const test = await Test.findOne({
          _id: input.testId,
          teacherId: input.teacherId,
        });

        if (!test) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "This test could not be found.",
          });
        }

        await Test.updateOne(
          { _id: test._id },
          {
            $set: {
              title: input.title,
              description: input.description,
            },
          },
        );

        const updatedTest = await Test.findOne({ _id: test._id });
        return updatedTest ? updatedTest.toObject() : null;
      });
    }),

  DeleteTest: baseProcedure
    .input(
      z.object({
        testId: z.string(),
        teacherId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      return tryCatch(async () => {
        await connectDB();

        const test = await Test.findOne({
          _id: input.testId,
          teacherId: input.teacherId,
        });

        if (!test) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "This test could not be found.",
          });
        }

        await Test.deleteOne({ _id: test._id });
        await Question.deleteMany({
          _id: { $in: test.questionIds },
        });

        return { success: true };
      });
    }),

  getTest: baseProcedure
    .input(
      z.object({
        teacherId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      return tryCatch(async () => {
        await connectDB();

        const tests = await Test.find({
          teacherId: input.teacherId,
        });

        return tests.map((t) => t.toObject());
      });
    }),

  getTestById: baseProcedure
    .input(
      z.object({
        teacherId: z.string(),
        testId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      return tryCatch(async () => {
        await connectDB();

        const tests = await Test.find({
          teacherId: input.teacherId,
          _id: input.testId,
        });

        return NextResponse.json({
          tests: tests.map((t) => t.toObject()),
        });
      });
    }),
});
