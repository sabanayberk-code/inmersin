import dotenv from "dotenv";
dotenv.config({ path: ".env" });

async function seed() {
    const { db } = await import("../lib/db");
    const { users, listings, listingTranslations, media } = await import("./schema");

    console.log("Seeding...");

    // Create default agent
    await db.insert(users).values({
        name: "Mert Kuruçeşme",
        email: "sabanayberk@gmail.com",
        passwordHash: "demo_hash",
        role: "agent",
        languages: ["tr", "en"],
        phone: "0 (532) 138 19 16"
    }).onConflictDoNothing();

    // We need an agent ID to link properties.
    const agentRecord = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, "sabanayberk@gmail.com")
    });

    if (!agentRecord) throw new Error("Agent not found");
    const agentId = agentRecord.id;

    // Property Data
    const props = [
        {
            price: 2585000,
            currency: "TRY",
            location: {
                city: "Bursa",
                district: "Osmangazi",
                neighborhood: "Başaran Mh.",
                address: "Başaran Mah. 123 Sk."
            },
            features: {
                bedrooms: 2,
                bathrooms: 1,
                area: 75,
                netArea: 70,
                type: "Sale",
                buildingAge: "11-15 arası",
                floorNumber: 1,
                totalFloors: 2,
                heating: "Kombi (Doğalgaz)",
                balcony: true,
                furnished: false,
                usageStatus: "Boş",
                wc: 0
            },
            images: [
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1484154218962-a1c00207099b?q=80&w=2074&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1556912173-3db9963f6bee?q=80&w=2070&auto=format&fit=crop"
            ],
            tr: {
                title: "BAŞARAN MAHALLESI SATILIK 2+1 LUKS DAİRE (SIFIR TADİLATLI)",
                description: "Osmangazi Başaran mahallesinde satılık 2+1, 75m2 brüt, 70m2 net kullanım alanına sahip, doğalgaz kombili, 2 katlı binanın 1. katında yer alan dairemiz satılıktır. Dairemiz sıfır tadilatlı olup masrafsızdır."
            },
            en: {
                title: "2+1 LUXURY APARTMENT FOR SALE IN BAŞARAN NEIGHBORHOOD",
                description: "2+1 apartment for sale in Osmangazi Başaran neighborhood, 75m2 gross, 70m2 net usage area, with natural gas boiler, located on the 1st floor of a 2-storey building. Our apartment is newly renovated and requires no expense."
            }
        },
        {
            price: 12500000,
            currency: "TRY",
            location: {
                city: "Muğla",
                district: "Bodrum",
                neighborhood: "Yalıkavak",
                address: "Yalıkavak Sahil"
            },
            features: {
                bedrooms: 4,
                bathrooms: 3,
                area: 250,
                netArea: 220,
                type: "Sale",
                buildingAge: "0 (Yeni)",
                floorNumber: "Villa",
                totalFloors: 2,
                heating: "Klima",
                balcony: true,
                furnished: true,
                pool: true,
                garden: true,
                garage: true,
                wc: 1
            },
            images: [
                "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop"
            ],
            tr: {
                title: "BODRUM YALIKAVAK'TA ÖZEL HAVUZLU LÜKS VİLLA",
                description: "Bodrum Yalıkavak'ta, denize sıfır, özel havuzlu, geniş bahçeli, 4+1 lüks villa. Beyaz eşyalı ve oturuma hazır."
            },
            en: {
                title: "LUXURY VILLA WITH PRIVATE POOL IN BODRUM YALIKAVAK",
                description: "Luxury 4+1 villa in Bodrum Yalıkavak, seafront, with private pool, large garden. Furnished and ready to move in."
            }
        }
    ];

    for (const p of props) {
        const [insertedProp] = await db.insert(listings).values({
            agentId: agentId,
            price: p.price,
            currency: p.currency,
            location: p.location,
            features: p.features,
            status: 'draft'
        }).returning();

        // Translations
        await db.insert(listingTranslations).values([
            {
                listingId: insertedProp.id,
                language: 'tr',
                title: p.tr.title,
                description: p.tr.description,
                slug: p.tr.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
            },
            {
                listingId: insertedProp.id,
                language: 'en',
                title: p.en.title,
                description: p.en.description,
                slug: p.en.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
            }
        ]);

        // Media
        const mediaValues = p.images.map((url, idx) => ({
            listingId: insertedProp.id,
            url: url,
            type: 'image',
            order: idx
        }));

        await db.insert(media).values(mediaValues);
    }

    console.log("Seeding complete.");
    process.exit(0);
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
