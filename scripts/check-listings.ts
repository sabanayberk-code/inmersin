
import { db } from "../src/lib/db";
import { listings } from "../src/db/schema";
import { sql } from "drizzle-orm";
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv'; // If dotenv is installed, but probably not.

// Manual .env parsing if dotenv is missing, or just assume dotenv if available.
// Since it's a dev env, let's try to parse manually to be safe without installing deps.
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

async function checkListings() {
    console.log("DB URL:", process.env.DATABASE_URL);
    const allListings = await db.select().from(listings);
    console.log("Total Listings:", allListings.length);
    console.log("Listings by Type:");
    const byType = allListings.reduce((acc, l) => {
        acc[l.type] = (acc[l.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    console.log(byType);

    console.log("\nListings by Status:");
    const byStatus = allListings.reduce((acc, l) => {
        acc[l.status || 'unknown'] = (acc[l.status || 'unknown'] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    console.log(byStatus);

    console.log("\nDetailed Listings:");
    // allListings.forEach(l => {
    //     console.log(`ID: ${l.id}, Type: ${l.type}, Status: ${l.status}, AgentID: ${l.agentId}`);
    // });
}

checkListings().catch(console.error);
