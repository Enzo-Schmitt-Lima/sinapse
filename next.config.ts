import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // A importação das notas da v1 manda todas as notas numa só action
    // (padrão: 1 MB). Abaixo do teto de 4,5 MB do corpo na Vercel.
    serverActions: { bodySizeLimit: "4mb" },
  },
  images: {
    // Fotos de perfil do login com Google e GitHub.
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
};

export default nextConfig;
