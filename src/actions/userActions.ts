'use server';

import { db } from "@/lib/db";
import { listings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function deleteListingAction(formData: FormData) {
    const id = formData.get('id');
    if (!id) return;

    await db.delete(listings).where(eq(listings.id, Number(id)));
    revalidatePath('/dashboard');
    revalidatePath('/agents/edit-listing/[id]');
}

export async function republishListingAction(formData: FormData) {
    const id = formData.get('id');
    if (!id) return;

    await db.update(listings)
        .set({ status: 'published', createdAt: new Date() }) // Refresh date
        .where(eq(listings.id, Number(id)));

    revalidatePath('/dashboard');
}
