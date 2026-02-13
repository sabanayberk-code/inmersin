
import { db } from "../src/lib/db";
import { listings } from "../src/db/schema";


async function main() {
    const all = await db.select().from(listings);
    console.log("Total Listings:", all.length);
    console.log("IDs:", all.map(l => l.id));
    console.log("Types:", all.map(l => l.type));
}

main().catch(console.error);
