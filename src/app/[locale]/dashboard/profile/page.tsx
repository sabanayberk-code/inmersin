
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProfileForm } from "./ProfileForm";
import { ChangePasswordForm } from "./ChangePasswordForm";

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const user = await getCurrentUser();
    if (!user) redirect(`/${locale}/auth/login`);

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">My Profile</h1>

            {/* Profile Info Form */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Personal Information</h2>
                <ProfileForm user={{ name: user.name, email: user.email, phone: user.phone }} />
            </div>

            {/* Change Password Form */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Change Password</h2>
                <ChangePasswordForm />
            </div>
        </div>
    );
}
