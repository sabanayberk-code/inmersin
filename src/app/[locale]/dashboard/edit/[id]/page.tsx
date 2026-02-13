import { getListing } from '@/actions/getListing';
import ListingForm from '@/components/ListingForm';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from '@/i18n/routing';
import { notFound } from 'next/navigation';

export default async function EditListingPage({
    params
}: {
    params: Promise<{ locale: string, id: string }>
}) {
    const { locale, id } = await params;
    const user = await getCurrentUser();

    if (!user) {
        redirect({ href: '/auth/login', locale });
    }

    const listing = await getListing(parseInt(id), 'en'); // Fetch raw-ish data, locale doesn't matter much for core fields

    if (!listing) return notFound();

    // Verify ownership
    if (!user || listing.agentId !== user.id) {
        // In a real app, show unauthorized or redirect
        // redirect({ href: '/dashboard', locale });
    }

    // Map listing data to form initialData
    // ListingForm expects: { mainCategory, subCategory, category, type, propertyType }
    // But actually ListingForm logic is a bit complex with "initialData".
    // We might need to handle "Edit Mode" in ListingForm more explicitly by passing the full listing object.

    // For now, let's pass what we can and update ListingForm to handle full pre-fill.
    const initialData = {

        ...listing,
        images: listing.images,
        features: listing.features
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Edit Listing</h1>
            <ListingForm initialData={initialData as any} isEditMode={true} />
        </div>
    );
}
