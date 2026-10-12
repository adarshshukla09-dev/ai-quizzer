import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { initTRPC, TRPCError } from "@trpc/server";

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
const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource.",
    });
  }

  return next({
    ctx: {
      session: ctx.session,
    },
  });
});
export const createTRPCRouter = t.router;
export const baseProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthenticated);

export const createCallerFactory = t.createCallerFactory;
