import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();


console.log("DATABASE_URL:", process.env.DATABASE_URL || "sqlite.db");

export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dialect: "sqlite",
    dbCredentials: {
        url: process.env.DATABASE_URL || "sqlite.db",
    },
});
