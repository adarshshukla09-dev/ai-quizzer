import { relations } from "drizzle-orm";
import {
  pgTable,
  timestamp,
  varchar,
  text,
  uuid,
  boolean,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
export const AttemptResponse = pgTable("attempts", {
  id: uuid("attempt_id").primaryKey().defaultRandom(),

  studentId: text("student_id").references(() => user.id, {
    onDelete: "cascade",
  }),

  teacherId: text("teacher_id").references(() => user.id, {
    onDelete: "cascade",
  }),

  testId: text("test_id").notNull(),

  questionId: text("question_id").notNull(),

  studentAnswer: text("student_answer").notNull(),

  correctAnswer: text("correct_answer").notNull(),

  isCorrect: boolean("is_correct").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
export const attemptRelations = relations(AttemptResponse, ({ one }) => ({
  student: one(user, {
    fields: [AttemptResponse.studentId],
    references: [user.id],
    relationName: "studentAttempts",
  }),

  teacher: one(user, {
    fields: [AttemptResponse.teacherId],
    references: [user.id],
    relationName: "teacherAttempts",
  }),
}));
