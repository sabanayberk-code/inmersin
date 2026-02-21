
import { db } from "../src/lib/db";
import { listings } from "../src/db/schema";
import { sql } from "drizzle-orm";
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
        }
    });
}

async function simulateCounts() {
    const all = await db.select({ id: listings.id, type: listings.type, features: listings.features }).from(listings);
    console.log(`Fetched ${all.length} items from DB.`);

    const counts = {
        konut: 0,
        workplace: 0,
        land: 0
    };

    let konutIds: number[] = [];

    all.forEach(item => {
        const feat = item.features as any;
        if (item.type === 'real_estate') {
            const cat = feat.category;

            if (cat === 'Konut' || (!cat && feat.bedrooms)) {
                counts.konut++;
                konutIds.push(item.id);
            } else if (cat === 'İş Yeri') {
                counts.workplace++;
            } else if (cat === 'Arsa') {
                counts.land++;
            } else {
                console.log(`Unknown Category Item ${item.id}: cat='${cat}'`);
            }
        }
    });

    console.log("Counts:", counts);
    console.log("Konut IDs (last 10):", konutIds.slice(-10));
}

simulateCounts().catch(console.error);
