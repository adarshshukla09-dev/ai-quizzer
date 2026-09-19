import "server-only";

import { createCallerFactory, createTRPCContext } from "./init";
import { appRouter } from "./routers/_app";

const createCaller = createCallerFactory(appRouter);

export const trpcServer = async () => {
  const context = await createTRPCContext();
  return createCaller(context);
};
