
import { db } from "../src/lib/db";
import { users } from "../src/db/schema";
import { hashPassword } from "../src/lib/auth";
import { eq } from "drizzle-orm";

async function main() {
    const email = "demo@antigravity.tr"; // The user from src/db/seed.ts
    const newPassword = "123456";

    console.log(`Resetting password for ${email}...`);

    try {
        const hash = await hashPassword(newPassword);

        // Update user
        await db.update(users)
            .set({ passwordHash: hash })
            .where(eq(users.email, email));

        console.log("Password reset successfully!");
        console.log(`Email: ${email}`);
        console.log(`Password: ${newPassword}`);

    } catch (error) {
        console.error("Error resetting password:", error);
    }
    process.exit(0);
}

main();
