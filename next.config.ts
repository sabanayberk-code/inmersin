import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https' as const,
                hostname: 'placehold.co',
            },
            {
                protocol: 'https' as const,
                hostname: 'example.com',
            },
            {
                protocol: 'https' as const,
                hostname: 'images.unsplash.com',
            }
        ],
        dangerouslyAllowSVG: true,
    },
    async rewrites() {
        return [
            {
                source: '/uploads/:path*',
                destination: '/api/uploads/:path*'
            }
        ];
    },
};

export default withNextIntl(nextConfig);
