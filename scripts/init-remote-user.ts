
import 'dotenv/config'; // FORCE LOAD ENV VARS
import { db } from "../src/lib/db";
import { users } from "../src/db/schema";
import { hashPassword } from "../src/lib/auth";
import { eq } from "drizzle-orm";

async function main() {
    console.log("------------------------------------------------");
    console.log("INITIALIZING REMOTE USER");
    console.log("------------------------------------------------");

    // VERIFY DATABASE URL
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl || !dbUrl.startsWith("https://")) {
        console.error("❌ ERROR: DATABASE_URL does not look like a Turso URL!");
        console.error(`Current URL: ${dbUrl}`);
        process.exit(1);
    }
    console.log(`✅ Targeted Database: ${dbUrl}`);

    const email = "demo@antigravity.tr";
    const password = "123456";
    const name = "Mert Kuruçeşme";

    try {
        // 1. Check if user exists
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email)
        });

        const hash = await hashPassword(password);

        if (existingUser) {
            console.log(`User ${email} exists. Updating password...`);
            await db.update(users)
                .set({ passwordHash: hash, name: name, role: 'agent', emailVerified: true })
                .where(eq(users.email, email));
            console.log("✅ User updated.");
        } else {
            console.log(`User ${email} not found. Creating...`);
            await db.insert(users).values({
                name: name,
                email: email,
                passwordHash: hash,
                role: "agent",
                languages: ["tr", "en"],
                phone: "0 (532) 138 19 16",
                emailVerified: true
            });
            console.log("✅ User created.");
        }

    } catch (error) {
        console.error("❌ Error initializing remote user:", error);
    }
    process.exit(0);
}

main();
