import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pokemontcg.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.ygoprodeck.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cards.scryfall.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.scryfall.io',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;