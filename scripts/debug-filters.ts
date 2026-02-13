
import { getListings } from "@/actions/getListings";
import { db } from "@/lib/db";

async function main() {
    console.log("--- STARTING FILTER DEBUG ---");

    // 1. Check raw DB data
    const allListings = await db.query.listings.findMany();
    console.log(`Total Listings in DB: ${allListings.length}`);
    allListings.forEach(l => {
        const feat = l.features as any;
        console.log(`[ID ${l.id}] Type: ${l.type}, Category: '${feat.category}', ListingType: '${feat.listingType || feat.type}'`);
    });

    console.log("\n--- TEST 1: Real Estate (Konut) ---");
    const konutListings = await getListings('tr', { type: 'real_estate', category: 'Konut' });
    console.log(`Filter { type: 'real_estate', category: 'Konut' } returned: ${konutListings.length}`);
    konutListings.forEach(l => {
        console.log(` - ${l.title} (ID: ${l.id})`);
        // We know from getListings return type that 'translations' is not directly on the returned object
        // The returned object matches the UI ListingCard interface.
        // But getListings *fetches* with translations.
        // To debug this, we need to query the DB directly for translations of this ID.
    });

    if (konutListings.length > 0) {
        const sampleId = konutListings[0].id;
        const dbListing = await db.query.listings.findFirst({
            where: (listings, { eq }) => eq(listings.id, sampleId),
            with: { translations: true }
        });
        console.log("DB Translations for ID", sampleId, ":", JSON.stringify(dbListing?.translations, null, 2));
    }

    console.log("\n--- TEST 2: Vehicle (Otomobil) ---");
    const autoListings = await getListings('tr', { type: 'vehicle', category: 'Otomobil' });
    console.log(`Filter { type: 'vehicle', category: 'Otomobil' } returned: ${autoListings.length}`);
    autoListings.forEach(l => console.log(` - ${l.title}`));

    console.log("\n--- TEST 2b: Vehicle (Otomobil) + Sale ---");
    const autoSaleListings = await getListings('tr', { type: 'vehicle', category: 'Otomobil', listingType: 'Sale' });
    console.log(`Filter { type: 'vehicle', category: 'Otomobil', listingType: 'Sale' } returned: ${autoSaleListings.length}`);
    autoSaleListings.forEach(l => console.log(` - ${l.title}`));

    console.log("\n--- TEST 3: Part (No Category) ---");
    const partListings = await getListings('tr', { type: 'part' });
    console.log(`Filter { type: 'part' } returned: ${partListings.length}`);
    partListings.forEach(l => console.log(` - ${l.title}`));

    console.log("--- END DEBUG ---");
}

main().catch(console.error);
