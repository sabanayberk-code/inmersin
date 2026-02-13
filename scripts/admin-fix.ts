import 'dotenv/config';
import { db } from '../src/lib/db';
import { users } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '../src/lib/auth';

async function main() {
    const email = 'sabanayberk@gmail.com';
    const password = 'Deneme14';

    console.log(`Fixing user: ${email}...`);

    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    const passwordHash = await hashPassword(password);

    if (existingUser) {
        console.log('User found. Updating...');
        await db.update(users)
            .set({
                emailVerified: true,
                passwordHash: passwordHash,
                verificationToken: null,
                resetToken: null
            })
            .where(eq(users.email, email));
        console.log('User updated successfully.');
    } else {
        console.log('User not found. Creating...');
        await db.insert(users).values({
            name: 'Saban Ayberk',
            email: email,
            passwordHash: passwordHash,
            role: 'admin', // Giving admin role as it seems to be the owner
            emailVerified: true,
        });
        console.log('User created successfully.');
    }
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
