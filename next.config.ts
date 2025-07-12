
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // Adding 'standalone' output mode to improve server stability in cloud environments.
  output: 'standalone',
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'placehold.co',
          port: '',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'firebasestorage.googleapis.com',
          port: '',
          pathname: '/**',
        },
      ],
    },
  };

export default nextConfig;
