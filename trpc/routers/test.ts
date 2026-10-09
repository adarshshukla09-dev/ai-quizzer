import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import Question, { IQuestion } from "@/db/mongdb/schema/questions.schema";
import { TRPCError } from "@trpc/server";
import { connectDB } from "@/db/mongdb/connection";
import { tryCatch } from "@/lib/utils/trycatch";
import { NextResponse } from "next/server";
import { Test } from "@/db/mongdb/schema/Test.schema";
import { db } from "@/db/drizzle";
import { and, eq, inArray } from "drizzle-orm";
import { AttemptResponse, StudentsResponse, user } from "@/db/drizzle/schema";
export function generateTestCode(length = 6): string {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }

  return code;
}
export function isAnswerCorrect(
  studentAnswer: unknown,
  question: IQuestion,
): boolean {
  switch (question.questionType) {
    case "MCQ": {
      if (typeof studentAnswer !== "string") {
        return false;
      }

      return (
        studentAnswer.trim().toLowerCase() ===
        question.answer.trim().toLowerCase()
      );
    }

    case "TRUE_FALSE": {
      if (typeof studentAnswer !== "string") {
        return false;
      }

      return (
        studentAnswer.trim().toLowerCase() ===
        question.answer.trim().toLowerCase()
      );
    }

    case "NAT": {
      if (
        typeof studentAnswer !== "string" &&
        typeof studentAnswer !== "number"
      ) {
        return false;
      }

      return String(studentAnswer).trim() === question.answer.trim();
    }

    case "MSQ": {
      if (!Array.isArray(studentAnswer)) {
        return false;
      }

      const student = studentAnswer
        .map(String)
        .map((value) => value.trim())
        .sort();

      const correct = question.correctOptions
        .map(String)
        .map((value) => value.trim())
        .sort();

      if (student.length !== correct.length) {
        return false;
      }

      return student.every((value, index) => value === correct[index]);
    }

    default:
      return false;
  }
}

function serializeAnswer(answer: unknown): string {
  if (Array.isArray(answer)) {
    return JSON.stringify(answer);
  }

  if (answer === null || answer === undefined) {
    return "";
  }

  return String(answer);
}
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

      totalMarks: z.number().min(1),
      duration: z.number().min(1),
    }),
  )
  .mutation(async ({ input }) => {
    return tryCatch(async () => {
      await connectDB();

      const testCode = generateTestCode();

      console.log("Creating Test:", {
        title: input.title,
        testCode,
      });

      const test = await Test.create({
        teacherId: input.teacherId,
        documentIds: input.documentIds,
        title: input.title,
        description: input.description,

        testCode,

        questionIds: [],
        questionCount: input.questionCount,
        totalMarks: input.totalMarks,
        duration: input.duration,

        status: "GENERATING",
      });

      return test.toObject();
    });
  }),

  updateTest: baseProcedure
    .input(
      z.object({
        testId: z.string(),
        teacherId: z.string(),
        title: z.string().optional(),
        duration: z.number().optional(),
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
              duration: input.duration, // Keep the existing duration
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

        return tests.map((t: any) => t.toObject());
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

  submitTest: baseProcedure
    .input(
      z.object({
        testId: z.string(),
        studentId: z.string(),

        answers: z.array(
          z.object({
            questionId: z.string(),
            answer: z.any(),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      return tryCatch(async () => {
        await connectDB();

        const test = await Test.findById(input.testId).lean();

        if (!test) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Test not found",
          });
        }
        if (test.isAvailable === false) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "This test is not available for submission",
          });
        }

        const questionIds = test.questionIds ?? [];

        if (questionIds.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This test has no questions",
          });
        }

        const questions = await Question.find({
          _id: {
            $in: questionIds,
          },
        }).lean();

        // --------------------------------
        // 4. Create question lookup
        // --------------------------------

        const questionMap = new Map(
          questions.map((question) => [question._id.toString(), question]),
        );

        // --------------------------------
        // 5. Validate submitted questions
        // --------------------------------

        for (const submitted of input.answers) {
          if (!questionMap.has(submitted.questionId)) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Question ${submitted.questionId} does not belong to this test`,
            });
          }
        }

        // --------------------------------
        // 6. Evaluate answers
        // --------------------------------

        let correctCount = 0;

        const attemptRecords = [];

        for (const submitted of input.answers) {
          const question = questionMap.get(submitted.questionId);

          if (!question) {
            continue;
          }

          const isCorrect = isAnswerCorrect(submitted.answer, question);

          if (isCorrect) {
            correctCount++;
          }

          const studentAnswer = serializeAnswer(submitted.answer);

          const correctAnswer =
            question.questionType === "MSQ"
              ? JSON.stringify(question.correctOptions)
              : question.answer;

          attemptRecords.push({
            studentId: input.studentId,

            teacherId: question.teacherId,

            testId: input.testId,

            questionId: submitted.questionId,

            studentAnswer,

            correctAnswer,

            isCorrect,
          });
        }

        // --------------------------------
        // 7. Calculate score
        // --------------------------------

        const totalQuestions = questionIds.length;

        const answeredQuestions = input.answers.length;

        const score =
          totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

        const accuracy =
          answeredQuestions > 0 ? (correctCount / answeredQuestions) * 100 : 0;

        // --------------------------------
        // 8. Save individual attempts
        // --------------------------------

        if (attemptRecords.length > 0) {
          await db.insert(AttemptResponse).values(attemptRecords);
        }

        // --------------------------------
        // 9. Save test result
        // --------------------------------

        await db.insert(StudentsResponse).values({
          studentId: input.studentId,

          teacherId: test.teacherId,

          testId: input.testId,

          testCode: test._id.toString(),

          score,

          accuracy,

          timeCompleted: new Date(),
        });

        // --------------------------------
        // 10. Return result
        // --------------------------------

        return {
          success: true,

          totalQuestions,

          answeredQuestions,

          unansweredQuestions: totalQuestions - answeredQuestions,

          correctCount,

          incorrectCount: answeredQuestions - correctCount,

          score,

          accuracy,
        };
      });
    }),
  toggleAvailability: baseProcedure
    .input(
      z.object({
        testId: z.string(),
        isAvailable: z.boolean(),
      }),
    )
    .mutation(async ({ input }) => {
      return tryCatch(async () => {
        await connectDB();

        const test = await Test.findByIdAndUpdate(
          input.testId,
          {
            $set: {
              isAvailable: input.isAvailable,
            },
          },
          {
            new: true,
          },
        ).lean();

        if (!test) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Test not found",
          });
        }

        return {
          success: true,
          isAvailable: test.isAvailable,
        };
      });
    }),

  getResults: baseProcedure
    .input(z.object({ testId: z.string() }))
    .query(async ({ input }) => {
      return tryCatch(async () => {
        const results = await db
          .select({
            // Student information
            studentId: user.id,
            studentName: user.name,
            studentEmail: user.email,
            studentImage: user.image,
            testId: StudentsResponse.testId,
            score: StudentsResponse.score,
            accuracy: StudentsResponse.accuracy,
            timeCompleted: StudentsResponse.timeCompleted,
          })
          .from(StudentsResponse)
          .innerJoin(user, eq(StudentsResponse.studentId, user.id))
          .where(eq(StudentsResponse.testId, input.testId));

        return results;
      });
    }),
});
