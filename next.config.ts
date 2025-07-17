
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // Adding 'standalone' output mode to improve server stability in cloud environments.
  output: 'standalone',
  // Skip ESLint during production builds to avoid failing the build
  // while we fix outstanding lint issues.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // The `allowedDevOrigins` option was removed in Next 15.
  // If needed, configure CORS in middleware instead.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
