'use server';

import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, verifyPassword, getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getTranslations } from 'next-intl/server';

const profileSchema = z.object({
    name: z.string().min(2),
    phone: z.string().optional(),
    companyName: z.string().optional(),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6),
});

export async function updateProfile(prevState: any, formData: FormData) {
    const user = await getCurrentUser();
    if (!user) return { error: 'Unauthorized' };
    const t = await getTranslations('Form'); // Assuming generic errors

    const result = profileSchema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
        return { errors: result.error.flatten().fieldErrors };
    }

    const { name, phone, companyName } = result.data;

    await db.update(users)
        .set({ name, phone, companyName })
        .where(eq(users.id, user.id));

    revalidatePath('/[locale]/dashboard/profile');
    return { success: true, message: 'Profile updated successfully' };
}

export async function changePassword(prevState: any, formData: FormData) {
    const user = await getCurrentUser();
    if (!user) return { error: 'Unauthorized' };

    // We need to fetch the password hash again to be sure
    const dbUser = await db.query.users.findFirst({
        where: eq(users.id, user.id)
    });

    if (!dbUser) return { error: 'User not found' };

    const result = passwordSchema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
        return { errors: result.error.flatten().fieldErrors };
    }

    const { currentPassword, newPassword } = result.data;

    const isValid = await verifyPassword(currentPassword, dbUser.passwordHash);
    if (!isValid) {
        return { errors: { currentPassword: ['Invalid current password'] } };
    }

    const newHash = await hashPassword(newPassword);
    await db.update(users)
        .set({ passwordHash: newHash })
        .where(eq(users.id, user.id));

    revalidatePath('/[locale]/dashboard/profile');
    return { success: true, message: 'Password updated successfully' };
}
