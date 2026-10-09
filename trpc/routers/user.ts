import z from "zod";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { baseProcedure, createTRPCRouter } from "../init";
import { db } from "@/db/drizzle";
import { user as userTable } from "@/db/drizzle/schema/auth";
import { encryptApiKey } from "@/lib/encryption";
export const userRouter = createTRPCRouter({
  updateRole: baseProcedure
    .input(
      z.object({
        role: z.enum(["student", "teacher"]),
        geminiApiKey: z.string().trim().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in.",
        });
      }
      if (input.role === "teacher" && !input.geminiApiKey) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Gemini API key is required for teachers.",
        });
      }
      let apiKeyEncrypted: string | null = null;
      if (input.role === "teacher" && input.geminiApiKey) {
        apiKeyEncrypted = encryptApiKey(input.geminiApiKey);
      }
      const updatedUser = await db
        .update(userTable)
        .set({ role: input.role, apiKeyEncrypted })
        .where(eq(userTable.id, ctx.session.user.id))
        .returning({ id: userTable.id, role: userTable.role });
      if (!updatedUser[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });
      }
      return updatedUser[0];
    }),
  getUser: baseProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const result = await db
        .select({
          id: userTable.id,
          role: userTable.role,
          apiKeyEncrypted: userTable.apiKeyEncrypted,
        })
        .from(userTable)
        .where(eq(userTable.id, input.userId))
        .limit(1);
      if (!result[0]) {
        return null;
      }
      return {
        id: result[0].id,
        role: result[0].role,
        hasGeminiApiKey: Boolean(result[0].apiKeyEncrypted),
      };
    }),
});
