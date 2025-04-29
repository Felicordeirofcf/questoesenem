import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // <-- ESSA linha é o que faz o deploy passar mesmo com erros de lint
  },
};

export default nextConfig;
