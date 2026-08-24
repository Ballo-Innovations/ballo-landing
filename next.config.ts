import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a production build write somewhere other than .next, so it cannot
  // invalidate the chunks a running `next dev` is serving from the same folder
  // (that collision shows up as "Cannot find module './NNN.js'" 500s).
  // Usage: NEXT_DIST_DIR=.next-prod next build && NEXT_DIST_DIR=.next-prod next start
  distDir: process.env.NEXT_DIST_DIR || ".next",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "s3.balloads.com",
      },
      {
        protocol: "https",
        hostname: "assets.balloads.com",
      },
    ],
  },
};

export default nextConfig;
