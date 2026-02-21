'use server';

import { db } from '@/lib/db';
import { brandRequests } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

export async function createBrandRequest(name: string, parentCategory: string) {
    try {
        const user = await getCurrentUser();
        const userId = user?.id;

        // Check if a request for this brand and category already exists
        const existing = await db.query.brandRequests.findFirst({
            where: and(
                eq(brandRequests.name, name),
                eq(brandRequests.parentCategory, parentCategory)
            )
        });

        if (existing) {
            return { success: true, message: 'Brand already exists or is pending approval.' };
        }

        await db.insert(brandRequests).values({
            name,
            parentCategory,
            status: 'pending',
            requestedBy: userId
        });

        return { success: true };
    } catch (error) {
        console.error("Error creating brand request:", error);
        return { success: false, error: "Failed to create brand request." };
    }
}

export async function getApprovedBrands(parentCategory: string) {
    try {
        const brands = await db.query.brandRequests.findMany({
            where: and(
                eq(brandRequests.status, 'approved'),
                eq(brandRequests.parentCategory, parentCategory)
            )
        });
        return brands.map((b: { name: string }) => b.name);
    } catch (error) {
        console.error("Error fetching approved brands:", error);
        return [];
    }
}

// ADMIN ONLY ACTIONS

export async function getPendingBrandRequests() {
    try {
        const user = await getCurrentUser();
        if (user?.role !== 'admin') {
            return { success: false, error: 'Unauthorized', data: [] };
        }

        const pending = await db.query.brandRequests.findMany({
            where: eq(brandRequests.status, 'pending'),
            orderBy: (requests, { desc }) => [desc(requests.createdAt)]
        });

        return { success: true, data: pending };
    } catch (error) {
        console.error("Error fetching pending brands:", error);
        return { success: false, error: 'Failed to fetch pending requests', data: [] };
    }
}

export async function updateBrandRequestStatus(id: number, status: 'approved' | 'rejected') {
    try {
        const user = await getCurrentUser();
        if (user?.role !== 'admin') {
            return { success: false, error: 'Unauthorized' };
        }

        await db.update(brandRequests)
            .set({ status })
            .where(eq(brandRequests.id, id));

        return { success: true };
    } catch (error) {
        console.error("Error updating brand request status:", error);
        return { success: false, error: 'Failed to update status' };
    }
}
