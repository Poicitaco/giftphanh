import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      { source: "/welcome", destination: "/", permanent: true },
      { source: "/add", destination: "/create", permanent: true },
      { source: "/memories", destination: "/admin", permanent: true },
    ];
  },
};

export default nextConfig;
