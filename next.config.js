/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
  experimental: {
    reactCompiler: true,
    turbo: {
      resolveAlias: {
        canvas: "./empty-module.ts",
        "./src/components/pdf-viewer.js": "./src/components/pdf-viewer.tsx",
      },
    },
  },
};

export default config;
