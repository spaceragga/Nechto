import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const apiInternalUrl = (
  process.env.API_INTERNAL_URL ?? 'http://localhost:3001'
).replace(/\/$/, '');

const nextConfig: NextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  transpilePackages: ['@nechto/api-client', '@nechto/api-contract'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiInternalUrl}/:path*`,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

export default withNextIntl(nextConfig);
