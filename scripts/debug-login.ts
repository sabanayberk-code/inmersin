
import { db } from "../src/lib/db";
import { users } from "../src/db/schema";
import { verifyPassword } from "../src/lib/auth";
import { eq } from "drizzle-orm";

async function main() {
    const email = "demo@antigravity.tr";
    const passwordToCheck = "123456";

    console.log(`Checking user: ${email}`);

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.email, email)
        });

        if (!user) {
            console.error("❌ User NOT found in database!");
            process.exit(1);
        }

        console.log("✅ User found:");
        console.log(`   ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Hash: ${user.passwordHash}`);

        console.log(`\nVerifying password '${passwordToCheck}'...`);
        const isValid = await verifyPassword(passwordToCheck, user.passwordHash);

        if (isValid) {
            console.log("✅ Password verification PASSED.");
        } else {
            console.error("❌ Password verification FAILED.");
        }

    } catch (error) {
        console.error("Error during debug:", error);
    }
    process.exit(0);
}

main();
