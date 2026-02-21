import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { env } from "./env";
import * as schema from "../db/schema";

let dbUrl = process.env.DATABASE_URL || "sqlite.db";
if (dbUrl.startsWith("file:")) {
    dbUrl = dbUrl.replace("file:", "");
}
const sqlite = new Database(dbUrl);

export const db = drizzle(sqlite, { schema });
