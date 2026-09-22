import { baseProcedure, createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({});

export type AppRouter = typeof appRouter;
