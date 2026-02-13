'use server';

import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

async function checkAdmin() {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        throw new Error('Unauthorized');
    }
}

export async function approveUser(userId: number) {
    await checkAdmin();

    await db.update(users)
        .set({ isApproved: true })
        .where(eq(users.id, userId));

    revalidatePath('/[locale]/admin/users');
}

export async function deleteUser(userId: number) {
    await checkAdmin();

    await db.delete(users)
        .where(eq(users.id, userId));

    revalidatePath('/[locale]/admin/users');
}
