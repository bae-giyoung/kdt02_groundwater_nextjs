import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  /* reactStrictMode: false, */
  /* devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  } */
  async rewrites() {
    return [
      { source: '/java/:path*', destination: 'http://10.125.121.211:8080/:path*' },
      { source: '/ml/:path*', destination: 'http://10.125.121.216:8000/:path*' },
    ]
  }
};

export default nextConfig;
