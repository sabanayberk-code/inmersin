
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

import { eq } from "drizzle-orm";
import { users } from "../src/db/schema";

async function main() {
    const { db } = await import("../src/lib/db");

    const email = "sabanayberk@gmail.com";

    console.log(`Verifying email for ${email}...`);

    try {
        await db.update(users)
            .set({
                emailVerified: true
            })
            .where(eq(users.email, email));

        console.log("Email verified successfully.");
    } catch (error) {
        console.error("Failed to verify email:", error);
        process.exit(1);
    }
    process.exit(0);
}

main().catch((err) => {
    console.error("Script error:", err);
    process.exit(1);
});
