
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

import { eq } from "drizzle-orm";
import { users } from "../src/db/schema";
import crypto from "node:crypto";

async function hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(16).toString("hex");
        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) reject(err);
            resolve(salt + ":" + derivedKey.toString("hex"));
        });
    });
}

async function main() {
    const { db } = await import("../src/lib/db");

    const email = "sabanayberk@gmail.com";
    const password = "123456"; // Known simple password

    console.log(`Resetting password for ${email} to '${password}'...`);

    try {
        const newHash = await hashPassword(password);

        await db.update(users)
            .set({
                passwordHash: newHash
            })
            .where(eq(users.email, email));

        console.log("Password reset successfully.");
    } catch (error) {
        console.error("Failed to reset password:", error);
        process.exit(1);
    }
    process.exit(0);
}

main().catch((err) => {
    console.error("Script error:", err);
    process.exit(1);
});
