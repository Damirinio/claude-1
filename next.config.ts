import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Les documents comptables (bilans, liasses...) sont stockés en base ;
      // on autorise des fichiers plus volumineux que la limite par défaut (1 Mo).
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
