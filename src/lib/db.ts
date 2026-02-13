import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { env } from "./env";
import * as schema from "../db/schema";

const client = createClient({
    url: process.env.DATABASE_URL || "file:sqlite.db",
    authToken: process.env.TURSO_AUTH_TOKEN, // Optional for local file, required for Turso
});

export const db = drizzle(client, { schema });
