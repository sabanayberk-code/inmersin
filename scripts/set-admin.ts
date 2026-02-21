import { db } from "../src/lib/db";
import { users } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function setAdmin() {
    const targetEmail = "sabanayberk@gmail.com";
    console.log(`🔍 Finding user with email: ${targetEmail}...`);

    // Get the user by email
    const user = await db.query.users.findFirst({
        where: eq(users.email, targetEmail)
    });

    if (!user) {
        console.log(`❌ User with email ${targetEmail} not found.`);
        return;
    }

    console.log(`👤 Found user: ${user.name} (${user.email})`);

    await db.update(users)
        .set({ role: 'admin', isApproved: true, emailVerified: true })
        .where(eq(users.id, user.id));

    console.log(`✅ User ${user.email} promoted to ADMIN.`);
}

setAdmin().catch(console.error);
