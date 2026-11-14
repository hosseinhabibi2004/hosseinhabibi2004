import type { NextConfig } from "next";

// The public site is a static export: `next build` writes plain HTML to `out/`,
// which GitHub Pages serves. There is no Next.js server at runtime, so no API
// routes, no proxy/middleware and no server image optimisation.
//
// A project page lives under /<repo>/, so every URL needs that prefix. It comes
// from the environment: empty for a user/custom domain or local development.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  // /en/ -> out/en/index.html, which GitHub Pages serves without rewrites.
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  // next-i18next reads the `[lng]` segment through `next/root-params`, which is
  // still behind a flag on this Next.js version.
  experimental: { rootParams: true, globalNotFound: true },
};

export default nextConfig;
