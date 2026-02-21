import { db } from "../src/lib/db";
import { listings } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function inspectFeatures() {
    const all = await db.select().from(listings);
    console.log("Total listings:", all.length);
    for (const l of all) {
        console.log(`ID: ${l.id}, Type: ${l.type}, Status: ${l.status}, Features:`, JSON.stringify(l.features, null, 2));
    }
}

inspectFeatures().catch(console.error);
