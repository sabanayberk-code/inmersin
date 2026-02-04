import { z } from "zod";

const envSchema = z.object({
  // Relaxed validation for SQLite file path logic if needed, but 'file:...' is a URL protocol?
  // Actually, let's just allow string for simplicity in dev.
  DATABASE_URL: z.string(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});
