import dotenv from "dotenv"
import { defineConfig } from "drizzle-kit";
dotenv.config({ path: ".env.local" });

export default defineConfig({
  schema: "./db/drizzle/schema/index.ts",
  out: "./db/drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DB_URL!,
  },
});
