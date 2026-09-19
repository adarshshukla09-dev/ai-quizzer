import { initTRPC } from "@trpc/server";
import { cache } from "react";

// Context creation (memoized per-request for App Router)
export const createTRPCContext = cache(async () => {
  return {};
});

const t = initTRPC.create();

export const createTRPCRouter = t.router;
export const baseProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;
