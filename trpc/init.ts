import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { initTRPC } from "@trpc/server";

export const createTRPCContext = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return {
    session,
  };
};

const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create();

export const createTRPCRouter = t.router;
export const baseProcedure = t.procedure;

export const createCallerFactory = t.createCallerFactory;
