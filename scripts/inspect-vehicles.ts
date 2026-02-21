import { db } from "../src/lib/db";
import { listings } from "../src/db/schema";

async function run() {
    const all = await db.select().from(listings);
    for (const l of all) {
        if (l.type === "vehicle" || JSON.stringify(l.features).includes("Vasıta") || JSON.stringify(l).includes("Vasıta")) {
            console.log(JSON.stringify(l, null, 2));
        }
    }
}

run();
