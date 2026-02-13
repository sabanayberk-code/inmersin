
import 'dotenv/config';
import { db } from "../src/lib/db";
import { users } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Approving Admin User...");
    const email = "demo@antigravity.tr";

    try {
        await db.update(users)
            .set({ isApproved: true })
            .where(eq(users.email, email));

        console.log(`✅ User ${email} approved successfully.`);
    } catch (error) {
        console.error("Error approving user:", error);
    }
    process.exit(0);
}

main();
