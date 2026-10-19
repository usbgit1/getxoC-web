import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Las antiguas pestañas General y General2 ahora son la Portada.
  async redirects() {
    return [
      { source: "/general", destination: "/portada", permanent: false },
      { source: "/general2", destination: "/portada", permanent: false },
    ];
  },
};

export default nextConfig;
