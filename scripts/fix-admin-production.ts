
import * as dotenv from "dotenv";
// Load env before importing db
dotenv.config({ path: ".env" });

import { eq, sql } from "drizzle-orm";
// We need to import schema types statically if we use them for typing, but for usage we can import dynamically or just rely on db inference.
// But importing schema is fine as it doesn't have side effects usually.
import { users } from "../src/db/schema";

async function main() {
    // Dynamic import to ensure process.env is populated
    const { db } = await import("../src/lib/db");

    console.log("Fixing admin user...");
    const email = "sabanayberk@gmail.com";

    console.log("DB URL Length:", process.env.DATABASE_URL ? process.env.DATABASE_URL.length : "Not Set");
    console.log("Auth Token:", process.env.TURSO_AUTH_TOKEN ? "Present" : "Missing");

    try {
        const result = await db.run(sql`SELECT name FROM sqlite_master WHERE type='table' AND name='users'`);
        console.log("Table check:", result);
    } catch (e) {
        console.error("Table check failed:", e);
    }

    // Check if user exists
    let existingUser;
    try {
        existingUser = await db.query.users.findFirst({
            where: eq(users.email, email)
        });
    } catch (e) {
        console.error("Find user failed:", e);
        process.exit(1);
    }

    if (existingUser) {
        console.log(`User found:`, existingUser);
        console.log("Updating user...");
        try {
            await db.update(users)
                .set({
                    role: 'admin',
                    isApproved: true,
                    // emailVerified: true 
                })
                .where(eq(users.email, email));
            console.log("User updated successfully.");
        } catch (e) {
            console.error("Update failed:", e);
        }
    } else {
        console.log(`User ${email} not found. Creating new admin user...`);
        try {
            await db.insert(users).values({
                name: "Saban Ayberk",
                email: email,
                passwordHash: "$2b$10$EpW1.4d6.8.1.1.1.1.1.1.1",
                role: "admin",
                isApproved: true,
                emailVerified: true,
                languages: ["tr", "en"]
            });
            console.log("User created successfully.");
        } catch (e) {
            console.error("Insert failed:", e);
        }
    }

    console.log("Done.");
    process.exit(0);
}

main().catch((err) => {
    console.error("Error fixing admin:", err);
    process.exit(1);
});
