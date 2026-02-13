
import { getListings } from "@/actions/getListings";

async function main() {
    console.log("--- DEBUG CURRENCY MISMATCH ---");

    console.log("Query: { type: 'vehicle', category: 'Otomobil', listingType: 'Sale', currency: 'TRY' }");
    const tryListings = await getListings('tr', {
        type: 'vehicle',
        category: 'Otomobil',
        listingType: 'Sale',
        currency: 'TRY'
    });
    console.log(`Results (TRY): ${tryListings.length}`);

    console.log("\nQuery: { type: 'vehicle', category: 'Otomobil', listingType: 'Sale', currency: 'TL' }");
    const tlListings = await getListings('tr', {
        type: 'vehicle',
        category: 'Otomobil',
        listingType: 'Sale',
        currency: 'TL'
    });
    console.log(`Results (TL): ${tlListings.length}`);
}

main().catch(console.error);
