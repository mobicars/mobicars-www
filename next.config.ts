import type { NextConfig } from "next";

const strapiUrl = new URL(process.env.STRAPI_URL || "http://localhost:1337");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  images: {
    // AVIF first: the hero photo ~40 → ~25 KB on phones, car and blog images smaller too.
    formats: ["image/avif", "image/webp"],
    // 60 for photos below the first screen (cards, tiles, media-text, blog), 75 elsewhere.
    qualities: [60, 75],
    // File widths matched to the sections' `sizes` (components/sections/image-sizes.ts) on
    // PageSpeed's devices, so each picture has a file a few % above what it shows:
    // phone 412 px at 1.75× (content 92vw → 672, slide 78vw → 576, collage 44vw → 320,
    // thumbnail 96px → 176, full photo → 750) and desktop 1350 px at 1× (4 columns → 304,
    // 3 → 416, half → 608, collage → 528, card banner → 1280, full photo → 1350).
    imageSizes: [32, 48, 64, 96, 128, 176, 192, 256, 304, 320, 384, 416, 528],
    deviceSizes: [576, 608, 640, 672, 750, 828, 1080, 1280, 1350, 1920, 2048, 3840],
    // A year in Vercel's cache and the browser: every address here changes with its
    // file (Strapi and RentCarSoft name each upload anew, imports carry a hash).
    minimumCacheTTL: 31536000,
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
