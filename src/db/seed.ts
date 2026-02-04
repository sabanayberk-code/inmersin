import { db } from "../lib/db";
import { users } from "./schema";
import { hash } from "crypto"; // Mock hash

async function seed() {
    console.log("Seeding...");

    // Create default agent
    await db.insert(users).values({
        name: "Demo Agent",
        email: "agent@inmersin.com",
        passwordHash: "substitute_with_real_hash",
        role: "agent",
        languages: ["en", "ru"],
        phone: "+1234567890"
    }).onConflictDoNothing();

    console.log("Seeding complete.");
    process.exit(0);
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
