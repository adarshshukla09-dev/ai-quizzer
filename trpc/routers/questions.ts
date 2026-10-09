import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { baseProcedure, createTRPCRouter } from "../init";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import { connectDB } from "@/db/mongdb/connection";
import Question, { IQuestion } from "@/db/mongdb/schema/questions.schema";
import { Test } from "@/db/mongdb/schema/Test.schema";
import { tryCatch } from "@/lib/utils/trycatch";
import { questionGenerationPrompt } from "@/lib/gemini/prompts";
import { getQueryEmbedding } from "@/lib/utils/embedding";
import {
  selectBestChunks,
  keywordFallbackChunks,
} from "@/lib/utils/chunksSelection";
import {
  rrf,
  searchKeywordChunks,
  searchSimilarChunks,
} from "@/lib/utils/retriver";
import { NextResponse } from "next/server";
const questionGenerationSchema = z.object({
  questions: z.array(
    z.object({
      questionType: z.enum(["MCQ", "MSQ", "TRUE_FALSE", "NAT"]),
      question: z.string().min(1),
      options: z.array(z.string()).default([]),
      correctOptions: z.array(z.string()).default([]),
      answer: z.string().default(""),
      explanation: z.string().min(1, "Explanation is required"),
    }),
  ),
});
export const questionsRouter = createTRPCRouter({
  createQuestion: baseProcedure
    .input(
      z.object({
        testId: z.string(),
        documentIds: z.array(z.string()),
        topic: z.string().min(1),
        teacherId: z.string(),
        msq: z.number().default(0),
        mcq: z.number().default(0),
        nat: z.number().default(0),
        tf: z.number().default(0),
      }),
    )
    .mutation(async ({ input }) => {
      return tryCatch(async () => {
        await connectDB();

        const totalQuestions = input.mcq + input.msq + input.nat + input.tf;

        const searchText = input.topic;
        const embedding = await getQueryEmbedding(searchText);
        // 1. Retrieval
        const denseChunks = await searchSimilarChunks(
          embedding,
          input.teacherId,
          input.documentIds,
        );

        const keywordChunks = await searchKeywordChunks(
          input.topic,
          input.teacherId,
          input.documentIds,
        );

        // 2. Fusion
        const fusedChunks = rrf(denseChunks, keywordChunks);
        const rankedChunks = fusedChunks.map((item) => item.chunk);

        // 3. Selection
        let selectedChunks = selectBestChunks(rankedChunks, {
          totalQuestions,
        });

        // 4. Debug Logging
        console.log({
          denseResults: denseChunks.length,
          keywordResults: keywordChunks.length,
          fusedResults: fusedChunks.length,
          selectedResults: selectedChunks.length,
        });

        // 5. Fallback Strategy
        if (!selectedChunks.length) {
          console.warn(
            "No chunks selected from hybrid search. Executing keyword fallback...",
          );
          selectedChunks = await keywordFallbackChunks(
            input.topic,
            input.teacherId,
            input.documentIds,
            Math.max(3, Math.ceil(totalQuestions * 1.5)),
          );
        }

        if (!selectedChunks || !selectedChunks.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message:
              "No study material found for the specified topic and documents.",
          });
        }

        const context = selectedChunks.map((c: any) => c.content).join("\n\n");

        // 6. Generate questions via Gemini
        const model = new ChatGoogleGenerativeAI({
          model: "gemini-2.5-flash-lite",
          temperature: 0.2,
        });

        // Providing explicit name & description resolves the 'generation_config.response_schema' error
        const structuredModel = model.withStructuredOutput(
          questionGenerationSchema,
          {
            name: "question_generation_response",
          },
        );

        const prompt = questionGenerationPrompt({
          mcq: input.mcq,
          msq: input.msq,
          nat: input.nat,
          trueFalse: input.tf,
          context,
        });

        const parsed = await structuredModel.invoke([new HumanMessage(prompt)]);

        if (!parsed?.questions?.length) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate structured questions from AI model.",
          });
        }

        // 7. Store in MongoDB
        const questionsToInsert = parsed.questions.map((q, index) => ({
          teacherId: input.teacherId,
          documentIds: input.documentIds,
          questionIndex: index,
          questionType: q.questionType,
          question: q.question,
          options: q.options,
          correctOptions: q.correctOptions,
          answer: q.correctOptions?.[0] ?? q.answer,
          explanation: q.explanation,
        }));

        const questions = await Question.insertMany(questionsToInsert);
        const insertedIds = questions.map((q) => q._id);

        await Test.findByIdAndUpdate(input.testId, {
          $set: {
            questionIds: insertedIds,
            status: "COMPLETED",
          },
        });

        return {
          success: true,
          questions: questions.map((q) => q.toObject()),
        };
      });
    }),

  addQuestions: baseProcedure
    .input(
      z.object({
        documentIds: z.array(z.string()),
        teacherId: z.string(),
        questionIndex: z.number(),
        questionType: z.enum(["MCQ", "MSQ", "TRUE_FALSE", "NAT"]),
        question: z.string(),
        options: z.array(z.string()),
        correctOptions: z.array(z.string()),
        explanation: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      return tryCatch(async () => {
        await connectDB();

        const newQuestion = await Question.create({
          documentIds: input.documentIds,
          teacherId: input.teacherId,
          questionIndex: input.questionIndex,
          questionType: input.questionType,
          question: input.question,
          options: input.options,
          correctOptions: input.correctOptions,
          answer: input.correctOptions[0] ?? "",
          explanation: input.explanation,
        });

        return newQuestion.toObject();
      });
    }),

  updateQuestion: baseProcedure
    .input(
      z.object({
        questionId: z.string(),
        teacherId: z.string(),
        question: z.string().min(1),
        options: z.array(z.string()).default([]),
        answer: z.string().default(""),
        correctOptions: z.array(z.string()).default([]),
        explanation: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      return tryCatch(async () => {
        await connectDB();

        const question = await Question.findOne({
          _id: input.questionId,
          teacherId: input.teacherId,
        });

        if (!question) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Question not found",
          });
        }

        question.question = input.question;
        question.options = input.options;
        question.correctOptions = input.correctOptions;

        // Keep answer synchronized with the first correct option.
        question.answer =
          input.correctOptions.length > 0
            ? input.correctOptions[0]
            : input.answer;

        question.explanation = input.explanation;

        await question.save();

        return {
          success: true,
          question: question.toObject(),
        };
      });
    }),

  deleteQuestion: baseProcedure
    .input(
      z.object({
        questionId: z.string(),
        testId: z.string(),
        teacherId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      return tryCatch(async () => {
        await connectDB();

        // Make sure the question belongs to the teacher.
        const question = await Question.findOne({
          _id: input.questionId,
          teacherId: input.teacherId,
        });

        if (!question) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Question not found",
          });
        }

        // Delete the question.
        await Question.findByIdAndDelete(input.questionId);

        // Remove the question ID from the test.
        await Test.findOneAndUpdate(
          {
            _id: input.testId,
            teacherId: input.teacherId,
          },
          {
            $pull: {
              questionIds: input.questionId,
            },
          },
        );

        return {
          success: true,
          message: "Question deleted successfully",
        };
      });
    }),

  getQuestion: baseProcedure
    .input(
      z.object({
        testId: z.string(),
        teacherId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      return tryCatch(async () => {
        await connectDB();

        const test = await Test.findOne({
          _id: input.testId,
          teacherId: input.teacherId,
        });

        if (!test) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Test not found",
          });
        }

        let questions = await Question.find({
          _id: { $in: test.questionIds },
        }).lean();

        if (questions.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No questions found for this test",
          });
        }

        return questions;
      });
    }),
  getQuestionForStudent: baseProcedure
    .input(
      z.object({
        testId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.session?.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in.",
        });
      }

      return tryCatch(async () => {
        await connectDB();

        const test = await Test.findOne({
          _id: input.testId,
        });

        if (!test) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Test not found",
          });
        }

        const rawQuestions = await Question.find({
          _id: { $in: test.questionIds },
        }).lean();

        if (rawQuestions.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No questions found for this test",
          });
        }

        return rawQuestions.map((q) => ({
          _id: q._id,
          questionIndex: q.questionIndex,
          questionType: q.questionType,
          question: q.question,
          options: q.options,
        }));
      });
    }),
});
