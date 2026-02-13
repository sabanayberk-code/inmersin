'use server';

import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createSession, deleteSession, hashPassword, verifyPassword } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { sendEmail } from '@/lib/mail';
import crypto from 'node:crypto';
import { getTranslations } from 'next-intl/server';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
});

const forgotPasswordSchema = z.object({
    email: z.string().email(),
});

const resetPasswordSchema = z.object({
    token: z.string(),
    password: z.string().min(6),
});

export async function login(prevState: any, formData: FormData) {
    const t = await getTranslations('Auth');
    const result = loginSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
        return {
            errors: result.error.flatten().fieldErrors,
        };
    }

    const { email, password } = result.data;

    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (existingUser) {
        const isPasswordValid = await verifyPassword(password, existingUser.passwordHash);

        if (!isPasswordValid) {
            // This condition is handled by the !existingUser || !(await verifyPassword...) check below
            // but keeping it here for clarity if more specific logging was needed.
        }
    }

    if (!existingUser || !(await verifyPassword(password, existingUser.passwordHash))) {
        return {
            errors: {
                email: [t('errorInvalidCredentials')],
            },
        };
    }

    if (!existingUser.isApproved) {
        return {
            errors: {
                email: [t('errorAccountNotApproved')],
            }
        };
    }

    if (!existingUser.emailVerified) {
        return {
            errors: {
                email: [t('errorEmailNotVerified')],
            }
        };
    }

    await createSession(existingUser.id);
    redirect('/tr/agents/new-listing'); // Default redirect, can be dynamic
}

export async function register(prevState: any, formData: FormData) {
    const t = await getTranslations('Auth');
    const result = registerSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
        return {
            errors: result.error.flatten().fieldErrors,
        };
    }

    const { name, email, password } = result.data;

    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (existingUser) {
        return {
            errors: {
                email: [t('errorEmailExists')],
            },
        };
    }

    const passwordHash = await hashPassword(password);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const [newUser] = await db.insert(users).values({
        name,
        email,
        passwordHash,
        role: 'agent', // Default role
        emailVerified: false,
        isApproved: false,
        verificationToken,
    }).returning();

    // ...
    // Send verification email
    const verificationLink = `http://localhost:3000/auth/verify?token=${verificationToken}`;
    await sendEmail(email, 'Verify your account', `Click here to verify your account: ${verificationLink}`);

    return {
        message: t('successRegistration'),
        errors: {}
    };
}

export async function verifyEmail(token: string) {
    const t = await getTranslations('Auth');
    const user = await db.query.users.findFirst({
        where: eq(users.verificationToken, token),
    });

    if (!user) {
        return { error: t('errorInvalidToken') };
    }

    await db.update(users)
        .set({ emailVerified: true, verificationToken: null })
        .where(eq(users.id, user.id));

    return { success: true };
}

export async function forgotPassword(prevState: any, formData: FormData) {
    const t = await getTranslations('Auth');
    const result = forgotPasswordSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
        return { errors: result.error.flatten().fieldErrors };
    }

    const { email } = result.data;
    const user = await db.query.users.findFirst({ where: eq(users.email, email) });

    if (!user) {
        // Return success even if user not found to prevent enumeration
        return { message: t('successResetSent') };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await db.update(users)
        .set({ resetToken, resetTokenExpiresAt })
        .where(eq(users.id, user.id));

    const resetLink = `http://localhost:3000/auth/reset-password?token=${resetToken}`;
    await sendEmail(email, 'Reset your password', `Click here to reset your password: ${resetLink}`);

    return { message: t('successResetSent') };
}

export async function resetPassword(prevState: any, formData: FormData) {
    const t = await getTranslations('Auth');
    const result = resetPasswordSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
        return { errors: result.error.flatten().fieldErrors };
    }

    const { token, password } = result.data;

    const user = await db.query.users.findFirst({
        where: eq(users.resetToken, token),
    });

    if (!user || !user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
        return { errors: { token: [t('errorInvalidExpiredToken')] } };
    }

    const passwordHash = await hashPassword(password);

    await db.update(users)
        .set({ passwordHash, resetToken: null, resetTokenExpiresAt: null })
        .where(eq(users.id, user.id));

    return { success: true };
}

export async function logout() {
    await deleteSession();
    redirect('/');
}

