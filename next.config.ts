import type { NextConfig } from "next";
import { assertRequiredEnv } from "./lib/env";

assertRequiredEnv();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cipgacwzhmtxcylqjszp.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Default is 1MB; product/line photo uploads go up to 5MB.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
