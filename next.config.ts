import type { NextConfig } from "next";

const strapiUrl = new URL(process.env.STRAPI_URL || "http://localhost:1337");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  images: {
    remotePatterns: [
      // Car photos from the RentCarSoft offer gallery.
      new URL("https://mobicars.rentcarsoft.pl/grafiki/**"),
      // CMS media (Strapi's local upload provider).
      new URL("/uploads/**", strapiUrl),
    ],
    // The optimizer refuses private addresses (SSRF guard). Lifted only when the
    // CMS itself runs on this machine; the pattern above still limits it to its uploads.
    dangerouslyAllowLocalIP: ["localhost", "127.0.0.1", "[::1]"].includes(strapiUrl.hostname),
  },
  experimental: {
    agentUpgrade: "security",
  },
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
