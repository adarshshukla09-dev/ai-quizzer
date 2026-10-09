import { relations } from "drizzle-orm";
import {
  pgTable,
  timestamp,
  varchar,
  text,
  uuid,
  boolean,
  real,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const StudentsResponse = pgTable("students", {
  id: uuid("id").primaryKey().defaultRandom(),

  studentId: text("student_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
    }),

  teacherId: text("teacher_id").references(() => user.id, {
    onDelete: "cascade",
  }),

  testId: text("test_id").notNull(),

  testCode: varchar("test_code", {
    length: 255,
  }).notNull(),

  score: real("score").notNull(),

  accuracy: real("accuracy").notNull(),

  timeCompleted: timestamp("time_completed").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const studentsRelations = relations(StudentsResponse, ({ one }) => ({
  student: one(user, {
    fields: [StudentsResponse.studentId],
    references: [user.id],
    relationName: "student",
  }),

  teacher: one(user, {
    fields: [StudentsResponse.teacherId],
    references: [user.id],
    relationName: "teacher",
  }),
}));
