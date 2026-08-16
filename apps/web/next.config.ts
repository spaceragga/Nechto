import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const apiInternalUrl = (
  process.env.API_INTERNAL_URL ?? 'http://localhost:3001'
).replace(/\/$/, '');

const usePolling = process.env.WATCHPACK_POLLING === 'true';

const nextConfig: NextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  transpilePackages: ['@nechto/api-client', '@nechto/api-contract'],
  // Docker Desktop (Windows) bind mounts do not emit inotify events.
  ...(usePolling ? { watchOptions: { pollIntervalMs: 500 } } : {}),
  webpack: (config, { dev }) => {
    if (dev && usePolling) {
      config.watchOptions = {
        poll: 500,
        aggregateTimeout: 200,
      };
    }
    return config;
  },
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
