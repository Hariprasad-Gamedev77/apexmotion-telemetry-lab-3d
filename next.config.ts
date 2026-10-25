import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false, // Disables the Next.js "N" dev badge at the bottom-left
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
