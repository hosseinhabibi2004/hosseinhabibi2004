import type { NextConfig } from "next";

// This app runs only on the author's machine (`pnpm dev`, port 3001). It is
// never exported or deployed: it is where content is written, and the public
// site is built from what is written here.
const nextConfig: NextConfig = {
  // next-i18next's server entry imports `next/root-params`, even without a locale segment.
  experimental: { rootParams: true },
  // The dev badge sits over the phone bottom bar's last tab.
  devIndicators: false,
};

export default nextConfig;
