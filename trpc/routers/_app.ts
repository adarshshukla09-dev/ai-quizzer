import { baseProcedure, createTRPCRouter } from "../init";
import { chunksRouter } from "./chunks";
import { documentRouter } from "./document";
import { questionsRouter } from "./questions";
import { TestRouter } from "./test";
import { userRouter } from "./user";

export const appRouter = createTRPCRouter({
  document: documentRouter,
  chunk: chunksRouter,
  question: questionsRouter,
  test: TestRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
