import { getCurrentUser } from "@/lib/auth";
import { redirect } from "@/i18n/routing";
import { getListing } from "@/actions/getListing";
import ListingForm from "@/components/ListingForm";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

export default async function EditListingPage({
    params
}: {
    params: Promise<{ locale: string; id: string }>;
}) {
    const { locale, id } = await params;
    const user = await getCurrentUser();

    if (!user) {
        redirect({ href: '/auth/login', locale });
    }

    const listingId = parseInt(id);
    if (isNaN(listingId)) return notFound();

    const listing = await getListing(listingId, locale);

    if (!listing) return notFound();

    // Check ownership (optional but recommended)
    if (!user || (listing.agentId !== user.id && user.role !== 'admin')) {
        // redirect({ href: '/dashboard', locale }); // Or show unauthorized
    }

    const t = await getTranslations('Form');

    return (
        <div className="container mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100">
                {t('edit_title', { id: listing.id })}
            </h1>
            <ListingForm initialData={listing} isEditMode={true} />
        </div>
    );
}
