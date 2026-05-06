import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

/** @type {import("next").NextConfig} */
const nextConfig = {
  turbopack: {
    root: currentDir,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["divorce-scale-admin-mvp.edgeone.dev"],
    },
  },
};

export default nextConfig;
