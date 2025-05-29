import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        // Apply CORS headers to all API routes
        source: '/api/:path*', // Adjust the path if your API routes are elsewhere
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            // In production, replace this with the actual origin of your frontend
            value: process.env.NODE_ENV === 'development' ? '*' : '<Your Frontend Origin>',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
