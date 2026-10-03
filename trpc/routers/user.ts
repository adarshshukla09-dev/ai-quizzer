import z from "zod";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

import { baseProcedure, createTRPCRouter } from "../init";
import { db } from "@/db/drizzle";
import { user as userTable } from "@/db/drizzle/schema/auth";

export const userRouter = createTRPCRouter({
  updateRole: baseProcedure
    .input(
      z.object({
        role: z.enum(["student", "teacher"]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in.",
        });
      }

      const updatedUser = await db
        .update(userTable)
        .set({
          role: input.role,
        })
        .where(eq(userTable.id, ctx.session.user.id))
        .returning({
          id: userTable.id,
          role: userTable.role,
        });

      if (!updatedUser[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found.",
        });
      }

      return updatedUser[0];
    }),

  getUser: baseProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const result = await db
        .select({
          id: userTable.id,
          role: userTable.role,
        })
        .from(userTable)
        .where(eq(userTable.id, input.userId))
        .limit(1);

      return result[0] ?? null;
    }),
});
