
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // Adding 'standalone' output mode to improve server stability in cloud environments.
  output: 'standalone',
  experimental: {
    // This is required to allow the IDE's preview panel to work.
    allowedDevOrigins: ["*.cloudworkstations.dev"],
  },
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
