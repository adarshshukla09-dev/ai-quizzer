import "dotenv/config";
import net from "node:net";

net.setDefaultAutoSelectFamily(false);

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema/index";

const sql = neon(process.env.DB_URL!);

export const db = drizzle(sql, {
  schema,
});
