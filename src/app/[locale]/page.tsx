import { getTranslations } from 'next-intl/server';
import { getListings, getListingCounts } from '@/actions/getListings';
import ListingCard from '@/components/ListingCard';
import FilterSidebar from '@/components/FilterSidebar';
import MobileFilterWrapper from '@/components/MobileFilterWrapper';
import SortDropdown from '@/components/SortDropdown';
import ViewToggle from '@/components/ViewToggle';
import ListingTableView from '@/components/ListingTableView';

interface HomePageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HomePage({ params, searchParams }: HomePageProps) {
  const { locale } = await params;
  const sp = await searchParams;

  const filters = {
    city: typeof sp.city === 'string' ? sp.city : undefined,
    minPrice: typeof sp.minPrice === 'string' ? parseInt(sp.minPrice) : undefined,
    maxPrice: typeof sp.maxPrice === 'string' ? parseInt(sp.maxPrice) : undefined,
    currency: typeof sp.currency === 'string' ? sp.currency : undefined,
    bedrooms: typeof sp.bedrooms === 'string' ? [sp.bedrooms] : Array.isArray(sp.bedrooms) ? sp.bedrooms : undefined,
    listingType: typeof sp.listingType === 'string' ? sp.listingType : undefined,
    sort: typeof sp.sort === 'string' ? sp.sort : undefined,
    // Vehicle filters
    minYear: typeof sp.minYear === 'string' ? parseInt(sp.minYear) : undefined,
    maxYear: typeof sp.maxYear === 'string' ? parseInt(sp.maxYear) : undefined,
    minKm: typeof sp.minKm === 'string' ? parseInt(sp.minKm) : undefined,
    maxKm: typeof sp.maxKm === 'string' ? parseInt(sp.maxKm) : undefined,
    // Missing filters added
    type: typeof sp.type === 'string' ? sp.type as any : undefined,
    category: typeof sp.category === 'string' ? sp.category : undefined,
    propertyType: typeof sp.propertyType === 'string' ? sp.propertyType : undefined,
    brand: typeof sp.brand === 'string' ? sp.brand : undefined,
    condition: typeof sp.condition === 'string' ? sp.condition as any : undefined,
  };

  const currentView = typeof sp.view === 'string' ? sp.view : 'grid';

  const t = await getTranslations('HomePage');

  // Fetch Search Results (Main Grid)
  let listings = await getListings(locale, filters);
  const counts = await getListingCounts();

  // const realEstateShowcase = await getListings(locale, { type: 'real_estate', isShowcase: true });
  // const vehicleShowcase = await getListings(locale, { type: 'vehicle', isShowcase: true });

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined);

  // Filter out showcase items from main listings if showcases are visible
  // if (!hasActiveFilters) {
  //   const showcaseIds = new Set([
  //     ...realEstateShowcase.map(i => i.id),
  //     ...vehicleShowcase.map(i => i.id)
  //   ]);
  //   listings = listings.filter(item => !showcaseIds.has(item.id));
  // }

  // Helper to determine result text key
  const getResultTextKey = () => {
    if (listings.length === 0) return 'no_results_found';

    const isSale = filters.listingType === 'Satılık' || filters.listingType === 'Sale';
    const isRent = filters.listingType === 'Kiralık' || filters.listingType === 'Rent';

    if (filters.type === 'vehicle') {
      if (isSale) return 'search_results_vehicle_sale';
      if (isRent) return 'search_results_vehicle_rent';
      return 'search_results_vehicle_default';
    }

    if (filters.type === 'part') {
      return 'search_results_part_default';
    }

    // Default (Real Estate or generic)
    if (isSale) return 'search_results_sale';
    if (isRent) return 'search_results_rent';
    return 'search_results_default';
  };

  return (
    <div className="container mx-auto px-4 py-6 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
        <div className="lg:col-span-2 lg:sticky lg:top-24 lg:h-[calc(100vh-10rem)]">
          <MobileFilterWrapper>
            <FilterSidebar counts={counts} />
          </MobileFilterWrapper>
        </div>



        <div className="lg:col-span-10 space-y-12">


          {/* Main Search Results */}
          <section>
            <div className="flex justify-between items-center mb-4 bg-gray-50 dark:bg-gray-800 p-3 rounded border">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {t(getResultTextKey(), { count: listings.length })}
              </div>
              <div className="flex items-center gap-2">
                <SortDropdown />
                <ViewToggle />
              </div>
            </div>

            {currentView === 'table' ? (
              <ListingTableView listings={listings} locale={locale} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {listings.map((property) => (
                  <ListingCard
                    key={property.id}
                    {...property}
                    serialCode={property.serialCode ?? undefined} // null ise undefined'a çeviriyoruz
                    locale={locale}
                  />
                ))}
              </div>
            )}

            {listings.length === 0 && (
              <div className="text-center py-20 text-gray-500 border rounded-lg bg-gray-50">
                <p>{t('no_results_found')}</p>
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}
