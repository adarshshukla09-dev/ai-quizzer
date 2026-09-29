import { TRPCError } from "@trpc/server";

export const tryCatch = async <T>(fn: () => Promise<T>): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    // 1. Re-throw native tRPC errors directly so status codes (NOT_FOUND, BAD_REQUEST, etc.) are preserved
    if (error instanceof TRPCError) {
      throw error;
    }

    // 2. Handle invalid Mongoose ObjectId format errors
    if (error instanceof Error && error.name === "CastError") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid ID format provided",
      });
    }

    // 3. Log unknown server errors for debugging
    console.error("SERVER ERROR:", error);

    // 4. Fallback to generic 500 internal server error
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong. Please try again later.",
    });
  }
};
