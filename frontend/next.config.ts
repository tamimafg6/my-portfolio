import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const API_URL = (process.env.API_URL || "").replace(/\/$/, "");

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  reactStrictMode: true,
  images: {
    domains: ["localhost"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async rewrites() {
    if (!API_URL) return [];
    // /api/* requests without a matching Next.js route go straight to the backend
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [{ source: "/api/:path*", destination: `${API_URL}/:path*` }],
    };
  },
};

export default withNextIntl(nextConfig);
