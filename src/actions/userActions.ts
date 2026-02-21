'use server';

import { db } from "@/lib/db";
import { listings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";

export async function deleteListingAction(formData: FormData) {
    const user = await getCurrentUser();
    if (!user) return;

    const id = formData.get('id');
    if (!id) return;

    // Check ownership or admin
    const listing = await db.query.listings.findFirst({
        where: eq(listings.id, Number(id)),
    });

    if (!listing) return;

    if (user.role !== 'admin' && listing.agentId !== user.id) {
        // Unauthorized
        return;
    }

    await db.delete(listings).where(eq(listings.id, Number(id)));
    revalidatePath('/dashboard');
    revalidatePath('/agents/edit-listing/[id]');
}

export async function republishListingAction(formData: FormData) {
    // Republishing usually follows same rules as Publish? Or is it just "making active again"?
    // User said: "sadece admin olanlar yayına alabilir". So Republish (from archived) should also be Admin only?
    // Let's assume Republish is also restricted to Admin if it makes it "Published".

    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') return; // Strict Admin check due to "sadece admin yayına alabilir"

    const id = formData.get('id');
    if (!id) return;

    await db.update(listings)
        .set({ status: 'published', createdAt: new Date() }) // Refresh date
        .where(eq(listings.id, Number(id)));

    revalidatePath('/dashboard');
}

export async function publishListingAction(formData: FormData) {
    const user = await getCurrentUser();
    if (!user) return;

    if (user.role !== 'admin') {
        // TODO: Show error feedback? For now, just return.
        return;
    }

    const id = formData.get('id');
    if (!id) return;

    await db.update(listings)
        .set({ status: 'published', createdAt: new Date(), updatedAt: new Date() })
        .where(eq(listings.id, Number(id)));

    revalidatePath('/dashboard');
    revalidatePath('/');
}

export async function unpublishListingAction(formData: FormData) {
    const user = await getCurrentUser();
    if (!user) return;

    const id = formData.get('id');
    if (!id) return;

    const listing = await db.query.listings.findFirst({
        where: eq(listings.id, Number(id)),
    });

    if (!listing) return;

    // Owner OR Admin can unpublish
    if (user.role !== 'admin' && listing.agentId !== user.id) {
        return;
    }

    await db.update(listings)
        .set({ status: 'draft' })
        .where(eq(listings.id, Number(id)));

    revalidatePath('/dashboard');
    revalidatePath('/');
}
