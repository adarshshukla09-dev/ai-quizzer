import z from "zod";
import { baseProcedure, createTRPCRouter } from "../init";

let todos = [
  { id: 1, title: "Learn tRPC", completed: false },
  { id: 2, title: "Learn React", completed: false },
  { id: 3, title: "Learn TypeScript", completed: false },
  { id: 4, title: "Learn Next.js", completed: false },
];

export const todoRouter = createTRPCRouter({
  getTodos: baseProcedure.query(() => {
    return todos;
  }),

  getTodobyId: baseProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => {
      return todos.find((todo) => todo.id === input.id) ?? null;
    }),

  createTodo: baseProcedure
    .input(
      z.object({
        title: z.string(),
        completed: z.boolean(),
      }),
    )
    .mutation(({ input }) => {
      const newTodo = {
        id: todos.length + 1,
        title: input.title,
        completed: input.completed,
      };
      todos.push(newTodo);
      return newTodo;
    }),

  markAsCompleted: baseProcedure // ✅ Fixed typo in procedure name
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => {
      todos = todos.map((t) =>
        t.id === input.id ? { ...t, completed: !t.completed } : t,
      );

      return todos.find((t) => t.id === input.id);
    }),

  deleteTodo: baseProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => {
      todos = todos.filter((t) => t.id !== input.id);
      return { success: true };
    }),
  editTodo: baseProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string(),
        completed: z.boolean(),
      }),
    )
    .mutation(({ input }) => {
      const index = todos.findIndex((t) => t.id === input.id);
      if (index !== -1) {
        todos[index] = {
          ...todos[index],
          title: input.title,
          completed: input.completed,
        };
        return todos[index];
      }
      throw new Error("Todo not found");
    }),
});
