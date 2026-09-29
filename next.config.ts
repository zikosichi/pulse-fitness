import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  redirects() {
    return [{ source: "/presale/admin", destination: "/admin", permanent: true }];
  },
  headers() {
    // Custom test domains must stay out of search results too.
    return process.env.VERCEL_ENV === "preview"
      ? [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }]
      : [];
  },
  images: {
    // Next 16 only honours qualities named here; anything else silently
    // falls back to 75, which is why these have to be declared.
    qualities: [75, 80, 82, 95],
  },
  turbopack: {
    // There is a stray yarn.lock in the home directory above this project,
    // which makes Turbopack's automatic root detection walk too far up.
    // Pin the root to this folder.
    root: path.resolve(process.cwd()),
  },
};

export default nextConfig;
