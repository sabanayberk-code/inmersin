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
                location: { city: 'İstanbul', district: 'Kadıköy', neighborhood: 'Caddebostan', address: 'Bağdat Caddesi No:1', country: 'TR', lat: 41.0, lng: 29.0 },
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
                title: "Caddebostan'da Lüks 3+1 Daire (v4)",
                description: "Bağdat caddesi üzerinde, ferah ve geniş daire."
            },
            {
                type: 'real_estate' as const,
                price: 45000,
                currency: 'TRY',
                location: { city: 'İstanbul', district: 'Beşiktaş', neighborhood: 'Etiler', address: 'Nispetiye Caddesi', country: 'TR', lat: 41.0, lng: 29.0 },
                features: {
                    category: 'Konut',
                    propertyType: 'Rezidans',
                    listingType: 'Rent',
                    bedrooms: '2+1',
                    bathrooms: 2,
                    area: 110,
                    buildingAge: '0 (Yeni)',
                    floorNumber: 15,
                    heating: 'Merkezi',
                    furnished: true,
                    hasPool: true,
                    inComplex: true
                },
                title: "Etiler'de Mobilyalı Kiralık Rezidans (v4)",
                description: "Full eşyalı, havuzlu sitede lüks daire."
            },
            {
                type: 'real_estate' as const,
                price: 25000000,
                currency: 'TRY',
                location: { city: 'Muğla', district: 'Bodrum', neighborhood: 'Yalıkavak', address: 'Yalıkavak Sahil Yolu', country: 'TR', lat: 37.1, lng: 27.2 },
                features: {
                    category: 'Konut',
                    propertyType: 'Villa',
                    listingType: 'Sale',
                    bedrooms: '5+1',
                    bathrooms: 4,
                    area: 350,
                    buildingAge: '0 (Yeni)',
                    hasPool: true,
                    hasGarden: true,
                    hasGarage: true
                },
                title: "Yalıkavak'ta Deniz Manzaralı Müstakil Villa (v4)",
                description: "Özel havuzlu, geniş bahçeli sıfır villa."
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
                title: "Özlüce'de Satılık Ofis (v4)",
                description: "Prestijli plaza katında satılık ofis."
            },
            {
                type: 'real_estate' as const,
                price: 3000000,
                currency: 'TRY',
                location: { city: 'İzmir', district: 'Urla', neighborhood: 'Kuşçular', address: 'Kuşçular Köy Yolu', country: 'TR', lat: 38.3, lng: 26.7 },
                features: {
                    category: 'Arsa',
                    listingType: 'Sale',
                    bedrooms: '0',
                    bathrooms: 0,
                    area: 500,
                },
                title: "Urla Kuşçular'da İmarlı Arsa (v4)",
                description: "Doğa ile iç içe, %20 imarlı arsa."
            },

            // --- VEHICLES ---
            // 1. Automobile (Sale) - Diesel, Automatic
            {
                type: 'vehicle' as const,
                price: 1200000,
                currency: 'TRY',
                location: { city: 'Ankara', district: 'Çankaya', address: 'Oto Galeri Merkezi', country: 'TR', lat: 39.9, lng: 32.8 },
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
                title: "Sahibinden Temiz BMW 320d (v4)",
                description: "Bakımları tam, kazasız temiz aile aracı."
            },
            // 2. SUV (Sale) - Hybrid, Automatic
            {
                type: 'vehicle' as const,
                price: 2500000,
                currency: 'TRY',
                location: { city: 'İstanbul', district: 'Bakırköy', address: 'Bakırköy Sahil Yolu', country: 'TR', lat: 41.0, lng: 28.8 },
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
                title: "Volvo XC90 Inscription (v4)",
                description: "Full yetkili servis bakımlı, hatasız."
            },
            // 3. Electric (Sale) - Electric, Automatic
            {
                type: 'vehicle' as const,
                price: 1800000,
                currency: 'TRY',
                location: { city: 'İzmir', district: 'Karşıyaka', address: 'Mavişehir Mahallesi', country: 'TR', lat: 38.4, lng: 27.1 },
                features: {
                    category: 'Elektrikli Araçlar',
                    make: 'Tesla',
                    model: 'Model Y',
                    year: 2023,
                    km: 15000,
                    fuel: 'Electric',
                    gear: 'Automatic',
                    caseType: 'SUV',
                    color: 'White',
                    listingType: 'Sale'
                },
                title: "Tesla Model Y Long Range (v4)",
                description: "Hatasız boyasız, tek şarjla 500km."
            },
            // 4. Commercial (Sale) - Diesel, Manual
            {
                type: 'vehicle' as const,
                price: 800000,
                currency: 'TRY',
                location: { city: 'Bursa', district: 'Osmangazi', address: 'Organize Sanayi Bölgesi', country: 'TR', lat: 40.2, lng: 29.0 },
                features: {
                    category: 'Ticari Araçlar',
                    make: 'Ford',
                    model: 'Transit',
                    year: 2020,
                    km: 80000,
                    fuel: 'Diesel',
                    gear: 'Manual',
                    caseType: 'Van',
                    color: 'White',
                    listingType: 'Sale'
                },
                title: "Ford Transit Temiz Ticari (v4)",
                description: "Yük taşımaya uygun, masrafsız."
            },
            // 5. Damaged (Sale ONLY)
            {
                type: 'vehicle' as const,
                price: 500000,
                currency: 'TRY',
                location: { city: 'İstanbul', district: 'Ümraniye', address: 'Ümraniye Sanayi Sitesi', country: 'TR', lat: 41.0, lng: 29.1 },
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
                title: "Çekme Belgeli Hasarlı Passat (v4)",
                description: "Motor çalışır durumda, kaporta hasarlı."
            },
            // 6. Automobile (Rent)
            {
                type: 'vehicle' as const,
                price: 2000,
                currency: 'TRY',
                location: { city: 'Antalya', district: 'Muratpaşa', address: 'Antalya Havalimanı', country: 'TR', lat: 36.9, lng: 30.7 },
                features: {
                    category: 'Otomobil',
                    make: 'Renault',
                    model: 'Clio',
                    year: 2023,
                    km: 5000,
                    fuel: 'Gasoline',
                    gear: 'Automatic',
                    caseType: 'Hatchback',
                    color: 'Red',
                    listingType: 'Rent'
                },
                title: "Günlük Kiralık Clio (v4)",
                description: "Havalimanı teslim, ekonomik kiralık araç."
            },

            // --- PARTS ---
            {
                type: 'part' as const,
                price: 5000,
                currency: 'TRY',
                location: { city: 'İstanbul', district: 'İkitelli', address: 'İkitelli Organize Sanayi', country: 'TR', lat: 41.0, lng: 28.8 },
                features: {
                    category: 'Motor & Motor Parçaları',
                    condition: 'Used',
                    listingType: 'Sale'
                },
                title: "BMW E90 Çıkma Motor Beyni (v4)",
                description: "Sorunsuz çalışır durumda orijinal parça."
            }
        ];


        const results = [];
        const errors = [];

        for (let i = 0; i < dummyData.length; i++) {
            const data = dummyData[i];
            try {
                console.log(`Processing item ${i}: ${data.title} - Address: ${data.location.address}`);
                const rawData = {
                    ...data,
                    agentId: agentId,
                    images: ['https://placehold.co/600x400?text=Listing+Image'],
                    isShowcase: true
                };
                const id = await agent.createListing(rawData as any);
                results.push({ id, title: data.title });
            } catch (itemError: any) {
                console.error(`Failed item ${i} (${data.title}):`, itemError);
                errors.push({
                    index: i,
                    title: data.title,
                    error: itemError.message,
                    zodError: itemError.issues
                });
            }
        }

        return NextResponse.json({ success: true, seeded: results, errors: errors });

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
