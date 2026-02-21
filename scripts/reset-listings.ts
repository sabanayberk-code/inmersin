import { db } from "../src/lib/db";
import { listings, listingTranslations } from "../src/db/schema";
import { sql } from "drizzle-orm";

async function resetListings() {
    console.log("🗑️ Deleting all listings...");

    // SQLite doesn't support TRUNCATE, so using DELETE
    await db.delete(listingTranslations);
    await db.delete(listings);

    // Reset auto-increment counters
    await db.run(sql`DELETE FROM sqlite_sequence WHERE name = 'listings'`);
    await db.run(sql`DELETE FROM sqlite_sequence WHERE name = 'listing_translations'`);

    console.log("✅ All listings deleted.");

    // Seed dummy data if needed? 
    // The user said "yeni ilanlar ekleyip test edelim", implying we should add some.
    // However, since we need agents to own them, it's better to create them via UI or just let the user create them.
    // But to "test", maybe I should create a few?
    // I need an agent ID. I'll fetch the first user.

    const users = await db.query.users.findMany({ limit: 1 });
    if (users.length === 0) {
        console.log("No users found. Creating listings skipped.");
        return;
    }
    const agentId = users[0].id;

    console.log(`🌱 Seeding test listings for Agent ID: ${agentId}...`);

    const testListings = [
        {
            title: "Test Villa (Draft)",
            type: "real_estate",
            status: "draft",
            price: 5000000,
            features: { type: "Sale", category: "Konut", propertyType: "Villa", bedrooms: "4+1", area: 250 }
        },
        {
            title: "Test Car (Published)",
            type: "vehicle",
            status: "published",
            price: 800000,
            features: { type: "Sale", listingType: "Sale", category: "Otomobil", brand: "BMW", model: "320i", year: 2020, km: 50000, fuel: "Gasoline", gear: "Automatic" }
        },
        {
            title: "Test Part (Draft)",
            type: "part",
            status: "draft",
            price: 1500,
            features: { type: "Sale", listingType: "Sale", category: "Yedek Parça", condition: "New" }
        },
    ];

    for (const item of testListings) {
        const result = await db.insert(listings).values({
            agentId,
            type: item.type as any,
            price: item.price,
            status: item.status as any,
            location: { city: "Istanbul", district: "Kadikoy" },
            features: item.features,
            serialCode: `${item.type === 'real_estate' ? 'E' : item.type === 'vehicle' ? 'V' : 'YP'}-${Math.floor(Math.random() * 10000) + 10000}`,
            createdAt: new Date(),
            updatedAt: new Date()
        }).returning({ id: listings.id });

        await db.insert(listingTranslations).values({
            listingId: result[0].id,
            language: "en",
            title: item.title,
            description: "Test description",
            slug: item.title.toLowerCase().replace(/ /g, "-")
        });

        // Add TR translation too
        await db.insert(listingTranslations).values({
            listingId: result[0].id,
            language: "tr",
            title: item.title,
            description: "Test açıklama",
            slug: item.title.toLowerCase().replace(/ /g, "-")
        });
    }

    console.log("✅ Test listings created.");
}

resetListings().catch(console.error);
