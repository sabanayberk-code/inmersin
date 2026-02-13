import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();


console.log("DATABASE_URL:", process.env.DATABASE_URL);
console.log("TURSO_AUTH_TOKEN:", process.env.TURSO_AUTH_TOKEN ? "Present" : "Missing");

export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dialect: "turso",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN,
    },
});
