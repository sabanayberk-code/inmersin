import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ListingAgent } from '@/agents/ListingAgent';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const agent = new ListingAgent();

        // Ensure user exists
        let user = await db.query.users.findFirst({
            where: eq(users.email, 'seed@agent.com')
        });

        if (!user) {
            const result = await db.insert(users).values({
                name: 'Seed Agent',
                email: 'seed@agent.com',
                passwordHash: 'dummy',
                role: 'agent'
            }).returning();
            user = result[0];
        }

        const agentId = user.id;

        const dummyData = [
            // --- REAL ESTATE ---
            {
                type: 'real_estate' as const,
                price: 15000000,
                currency: 'TRY',
                location: { city: 'İstanbul', district: 'Kadıköy', neighborhood: 'Caddebostan', address: 'Bağdat Cd.', country: 'TR', lat: 41.0, lng: 29.0 },
                features: {
                    category: 'Konut',
                    propertyType: 'Daire',
                    listingType: 'Sale',
                    bedrooms: '3+1',
                    bathrooms: 2,
                    area: 145,
                    buildingAge: '5-10 arası',
                    floorNumber: 5,
                    heating: 'Kombi (Doğalgaz)',
                    balcony: true
                },
                title: "Caddebostan'da Lüks 3+1 Daire",
                description: "Bağdat caddesi üzerinde, ferah ve geniş daire."
            },
            {
                type: 'real_estate' as const,
                price: 5000000,
                currency: 'TRY',
                location: { city: 'Bursa', district: 'Nilüfer', neighborhood: 'Özlüce', address: 'Ahmet Taner Kışlalı Blv.', country: 'TR', lat: 40.2, lng: 28.9 },
                features: {
                    category: 'İş Yeri',
                    listingType: 'Sale',
                    bedrooms: '1+0',
                    bathrooms: 0,
                    area: 90,
                    buildingAge: '0 (Yeni)',
                    floorNumber: 1
                },
                title: "Özlüce'de Satılık Ofis",
                description: "Prestijli plaza katında satılık ofis."
            },
            {
                type: 'real_estate' as const,
                price: 3000000,
                currency: 'TRY',
                location: { city: 'İzmir', district: 'Urla', neighborhood: 'Kuşçular', address: 'Köy Yolu', country: 'TR', lat: 38.3, lng: 26.7 },
                features: {
                    category: 'Arsa',
                    listingType: 'Sale',
                    bedrooms: '0',
                    bathrooms: 0,
                    area: 500,
                },
                title: "Urla Kuşçular'da İmarlı Arsa",
                description: "Doğa ile iç içe, %20 imarlı arsa."
            },
            // --- VEHICLES ---
            // 1. Automobile (Sale) - Diesel, Automatic
            {
                type: 'vehicle' as const,
                price: 1200000,
                currency: 'TRY',
                location: { city: 'Ankara', district: 'Çankaya', address: 'Galeri', country: 'TR', lat: 39.9, lng: 32.8 },
                features: {
                    category: 'Otomobil',
                    make: 'BMW',
                    model: '320d',
                    year: 2018,
                    km: 120000,
                    fuel: 'Diesel',
                    gear: 'Automatic',
                    caseType: 'Sedan',
                    color: 'White',
                    listingType: 'Sale'
                },
                title: "Sahibinden Temiz BMW 320d",
                description: "Bakımları tam, kazasız temiz aile aracı."
            },
            // 2. SUV (Sale) - Hybrid, Automatic
            {
                type: 'vehicle' as const,
                price: 2500000,
                currency: 'TRY',
                location: { city: 'İstanbul', district: 'Bakırköy', address: 'Sahil', country: 'TR', lat: 41.0, lng: 28.8 },
                features: {
                    category: 'Arazi, SUV & Pickup',
                    make: 'Volvo',
                    model: 'XC90',
                    year: 2021,
                    km: 45000,
                    fuel: 'Hybrid',
                    gear: 'Automatic',
                    caseType: 'SUV',
                    color: 'Black',
                    listingType: 'Sale'
                },
                title: "Volvo XC90 Inscription",
                description: "Full yetkili servis bakımlı, hatasız."
            },
            // 3. Damaged (Sale ONLY)
            {
                type: 'vehicle' as const,
                price: 500000,
                currency: 'TRY',
                location: { city: 'İstanbul', district: 'Ümraniye', address: 'Sanayi', country: 'TR', lat: 41.0, lng: 29.1 },
                features: {
                    category: 'Hasarlı Araçlar',
                    make: 'Volkswagen',
                    model: 'Passat',
                    year: 2019,
                    km: 60000,
                    fuel: 'Diesel',
                    gear: 'Automatic',
                    caseType: 'Sedan',
                    color: 'Gray',
                    listingType: 'Sale' // Must be Sale
                },
                title: "Çekme Belgeli Hasarlı Passat",
                description: "Motor çalışır durumda, kaporta hasarlı."
            }
        ];

        const results = [];
        for (const data of dummyData) {
            const rawData = {
                ...data,
                agentId: agentId,
                images: ['https://placehold.co/600x400?text=Listing+Image'], // Dummy image
                isShowcase: true
            };
            const id = await agent.createListing(rawData as any);
            results.push({ id, title: data.title });
        }

        return NextResponse.json({ success: true, seeded: results });

    } catch (e: any) {
        console.error("SEED API ERROR:", e);
        return NextResponse.json({
            success: false,
            error: e.message,
            stack: e.stack,
            zodError: e.issues
        }, { status: 200 });
    }
}
