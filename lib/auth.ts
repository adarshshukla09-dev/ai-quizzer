import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "@/db/drizzle";
import * as schema from "@/db/drizzle/schema/auth";

export const auth = betterAuth({
  trustedOrigins: ["http://localhost:3000", "http://192.168.1.43:3000"],

  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },

    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});
