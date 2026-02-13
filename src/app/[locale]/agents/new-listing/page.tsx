import { getCurrentUser } from "@/lib/auth";
import { redirect } from "@/i18n/routing";
import NewListingClient from "@/components/NewListingClient";

export default async function NewPropertyPage({
    params
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const user = await getCurrentUser();

    if (!user) {
        redirect({ href: '/auth/login', locale });
    }

    return <NewListingClient />;
}
