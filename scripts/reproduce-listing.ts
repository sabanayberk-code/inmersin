import 'dotenv/config';
import { ListingAgent } from "../src/agents/ListingAgent";
import { db } from "../src/lib/db";
import { listings } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("---------------------------------------------------------");
    console.log("Starting Reproduction Script (Direct Agent Usage)");

    const agent = new ListingAgent();
    // Mock user ID (ensure this user exists in DB or use 1)
    const agentId = 1;

    // Mock data based on the schema
    const mockData = {
        type: "real_estate",
        agentId: agentId,
        price: 150000,
        currency: "USD",
        location: {
            city: "Istanbul",
            country: "Turkey",
            lat: 41.0082,
            lng: 28.9784
        },
        title: "Test Listing Title Verification 123",
        description: "This is a detailed description for the test listing verification.",
        images: ["/uploads/test-image.webp"],
        isShowcase: true,
        features: {
            bedrooms: "3+1",
            bathrooms: 2,
            wc: 1,
            area: 120,
            netArea: 100,
            buildingAge: "5",
            totalFloors: 10,
            floorNumber: 3,
            heating: "Gas",
            usageStatus: "Empty",
            listingType: "Sale"
        }
    };

    console.log("Submitting mock data via Agent...");
    try {
        const newId = await agent.createListing(mockData as any);
        console.log("Submission Result: ID", newId);

        if (newId) {
            // Verify Database Content
            console.log(`\nVerifying Listing ID: ${newId}`);

            const listing = await db.query.listings.findFirst({
                where: eq(listings.id, newId.id),
                with: {
                    translations: true,
                    media: true
                }
            });

            console.log("Database Record:", JSON.stringify(listing, null, 2));

            if (!listing) {
                console.error("❌ Listing not found in DB!");
            } else {
                if (listing.translations.length === 0) console.error("❌ No translations found (Empty Title/Desc)");
                else console.log("✅ Translations present");

                if (listing.media.length === 0) console.error("❌ No media found");
                else console.log("✅ Media present");
            }
        }
    } catch (e) {
        console.error("❌ Submission failed:", e);
    }
}

main().catch(console.error);
