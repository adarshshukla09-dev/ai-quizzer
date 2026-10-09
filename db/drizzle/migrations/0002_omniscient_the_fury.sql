CREATE TYPE "public"."role" AS ENUM('teacher', 'student');--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DATA TYPE "public"."role" USING "role"::"public"."role";