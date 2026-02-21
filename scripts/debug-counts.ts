import { db } from "@/lib/db";
import { listings } from "@/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const all = await db.select({ id: listings.id, type: listings.type, features: listings.features, title: listings.serialCode })
        .from(listings)
        .where(eq(listings.status, 'published'));

    console.log("Total published:", all.length);
    for (const l of all) {
        console.log(`\nID: ${l.id}, Code: ${l.title}`);
        console.dir(l.features, { depth: null });
    }
}
main().catch(console.error);
