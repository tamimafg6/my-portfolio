/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");
const fs = require("fs");

// Resolve shared folder path - works in both build and runtime contexts
const sharedPath = path.resolve(__dirname, "../shared/next-config-helpers.js");
const localSharedPath = path.resolve(
  __dirname,
  "./shared/next-config-helpers.js"
);
const sharedHelpersPath = fs.existsSync(sharedPath)
  ? sharedPath
  : localSharedPath;

const { createSharedAlias } = require(sharedHelpersPath);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  // Set basePath for Digital Ocean deployment where admin-app is mounted at /admin
  // This ensures all routes and redirects are relative to /admin
  // IMPORTANT: "Preserve Path Prefix" must be ENABLED in Digital Ocean for this to work
  // Use NEXT_PUBLIC_BASE_PATH if explicitly set, otherwise default to empty for dev
  // In production (Digital Ocean), NEXT_PUBLIC_BASE_PATH should be set to "/admin"
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  images: {
    // Disable image optimization since Next.js server inside Docker can't reach localhost:8080
    // The browser can reach it fine, but the server-side optimizer can't
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "backend",
        port: "8080",
        pathname: "/api/files/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/api/files/**",
      },
      // HTTPS patterns for production
      {
        protocol: "https",
        hostname: "backend",
        port: "8080",
        pathname: "/api/files/**",
      },
      {
        protocol: "https",
        hostname: "localhost",
        port: "8080",
        pathname: "/api/files/**",
      },
      {
        protocol: "https",
        hostname: "api.passionjerseys.me",
        pathname: "/api/files/**",
      },
      // Allow any hostname for flexibility (useful for different environments)
      {
        protocol: "http",
        hostname: "**",
        pathname: "/api/files/**",
      },
      {
        protocol: "https",
        hostname: "**",
        pathname: "/api/files/**",
      },
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      ...createSharedAlias(__dirname),
    };
    return config;
  },
};

module.exports = nextConfig;
