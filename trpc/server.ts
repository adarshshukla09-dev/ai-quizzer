// trpc/server.ts

import { createCallerFactory, createTRPCContext } from "./init";
import { appRouter } from "./routers/_app";

const createCaller = createCallerFactory(appRouter);

export const serverTrpc = createCaller(createTRPCContext);
