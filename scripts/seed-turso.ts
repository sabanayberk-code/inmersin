import { db } from "../src/lib/db";
import { listings, users } from "../src/db/schema";


async function main() {
    console.log("Seeding database...");

    // Check if users exist, creates an admin if not
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length === 0) {
        console.log("Creating default admin user...");
        await db.insert(users).values({
            name: "Admin User",
            email: "admin@example.com",
            passwordHash: "$2y$10$YourHashedPasswordHere", // Placeholder
            role: "admin",
            emailVerified: true
        });
    }

    console.log("Database seeded successfully!");
}

main().catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
});
