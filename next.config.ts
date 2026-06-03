import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["better-sqlite3"],
  allowedDevOrigins: [
    "adev.exit0.link",
    "*.exit0.link",
    "100.100.10.10"
  ]
};

export default nextConfig;
